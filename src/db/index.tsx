import { createCache } from 'async-cache-dedupe'
import { GristDocAPI } from 'grist-api'

const docUrl = process.env.GRIST_DOC_URL!
const grist = new GristDocAPI(docUrl)

const cache = createCache({ ttl: 5 }).define(
  'fetchGristTable',
  async (tableName: string) => {
    return grist.fetchTable(tableName)
  },
)

interface Account {
  id: number
  title: string
  type: string
  notes: string
  balance: number
}
export async function getAccountList() {
  const accounts = (await cache.fetchGristTable('Accounts')) as {
    id: number
    Notes: string
    Balance: number
    Title: string
    Type: string
  }[]
  return {
    list: accounts
      .map((account): Account => {
        return {
          id: account.id,
          title: account.Title,
          type: account.Type,
          notes: account.Notes,
          balance: account.Balance,
        }
      })
      .sort((a, b) => {
        return a.type.localeCompare(b.type) || a.title.localeCompare(b.title)
      }),
  }
}

interface Event {
  id: number
  slug: string
  transactionCount: number
}
export async function getEventList() {
  const rows = (await cache.fetchGristTable('Events')) as {
    id: number
    Slug: string
    TransactionCount: number
  }[]
  return {
    list: rows
      .map((row): Event => {
        return {
          id: row.id,
          slug: row.Slug,
          transactionCount: row.TransactionCount,
        }
      })
      .sort((a, b) => {
        return a.slug.localeCompare(b.slug)
      }),
  }
}

export async function getRawTransactions() {
  const [accountList, eventList, rows] = await Promise.all([
    getAccountList(),
    getEventList(),
    cache.fetchGristTable('Transactions') as Promise<
      {
        id: number
        Amount: number
        Credit: number
        Date: number
        Debit: number
        Event: number
        Notes: string
        PrivateNotes: string
        Title: string
      }[]
    >,
  ])
  const accountMap = new Map(
    accountList.list.map((account) => [account.id, account]),
  )
  const eventMap = new Map(eventList.list.map((event) => [event.id, event]))
  const list = rows
    .map((row): RawTransactionRow => {
      return {
        Id: row.id,
        Title: row.Title,
        CreatedAt: '',
        UpdatedAt: '',
        Amount: row.Amount,
        Date: new Date(row.Date * 1000).toISOString().split('T')[0],
        Notes: row.Notes || null,
        Event: eventMap.get(row.Event) || null,
        Debit: accountMap.get(row.Debit)!,
        Credit: accountMap.get(row.Credit)!,
      }
    })
    .sort((a, b) => {
      return a.Date.localeCompare(b.Date) || a.Title.localeCompare(b.Title)
    })
  return { list }
}
type RawTransactionRow = {
  Id: number
  Title: string
  CreatedAt: string
  UpdatedAt: string
  Amount: number
  Date: string
  Notes: string | null
  Event: Event | null
  Debit: Account
  Credit: Account
}

export async function getAccountTransactions(hostAccounts: number[]) {
  const data = await getRawTransactions()
  const isHostAccount = (account: { id: number }) => {
    return hostAccounts.includes(account.id)
  }
  return toTable(
    data.list.filter((row) => {
      return isHostAccount(row.Debit) || isHostAccount(row.Credit)
    }),
    { mode: 'account' },
  )
}

export async function getEventTransactions(slug: string) {
  const data = await getRawTransactions()
  return toTable(
    data.list.filter((row) => {
      return row.Event?.slug === slug
    }),
    { mode: 'event' },
  )
}

function toTable(
  list: RawTransactionRow[],
  options: {
    mode: 'event' | 'account'
  },
): TransactionTableRow[] {
  const isCashOnHand = (account: Account) => {
    return account.type === 'Cash on Hand'
  }
  const isReceivable = (account: Account) => {
    return account.type === 'Receivables'
  }
  let balance = 0
  return list.map((row) => {
    const amount = isCashOnHand(row.Debit)
      ? row.Amount
      : isCashOnHand(row.Credit)
      ? -row.Amount
      : 0
    const received = isCashOnHand(row.Debit)
    const receiving = isReceivable(row.Debit)
    const { account, accountType } = (() => {
      const use = (a: Account) => {
        return {
          account: a.title,
          accountType: a.type,
        }
      }
      if (received || receiving) {
        return use(row.Credit)
      } else {
        return use(row.Debit)
      }
    })()
    const selfCrediting = row.Credit === row.Debit
    return {
      id: row.Id,
      date: row.Date,
      notes: row.Notes,
      description: row.Title,
      amount: amount,
      balance: (balance +=
        selfCrediting && options.mode === 'account' ? 0 : amount),
      selfCrediting,
      event: row.Event?.slug,
      account,
      accountType,
    }
  })
}
export interface TransactionTableRow {
  id: number
  date: string
  notes?: string | null
  description: string
  amount: number
  balance: number
  account: string
  accountType: string
  event?: string | null
  selfCrediting: boolean
}
