import { z } from 'zod'

export async function getAccountList() {
  const response = await fetch(
    `https://db.creatorsgarten.org/api/v1/db/data/v1/Creatorsgarten%20Operations/Accounts?${new URLSearchParams(
      {
        limit: '1000',
        shuffle: '0',
        offset: '0',
      },
    )}`,
    {
      headers: {
        'xc-token': process.env.XC_TOKEN!,
      },
      next: {
        revalidate: 10,
        tags: ['accounts'],
      },
    },
  )
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const data = await response.json()
  const parsed = RawAccountListData.parse(data)
  const list = parsed.list
    .map((item): AccountItem => {
      const row = RawAccountRow.parse(item)
      return {
        id: row.Id,
        title: row.Title,
        type: row.Type,
        notes: row.Notes,
        balance: row.Balance,
      }
    })
    .sort((a, b) => {
      return a.type.localeCompare(b.type) || a.title.localeCompare(b.title)
    })
  return { list }
}
const RawAccountListData = z.object({
  list: z.array(z.unknown()),
})
const RawAccountRow = z.object({
  Id: z.number(),
  Title: z.string(),
  Type: z.string(),
  Notes: z.string().nullish(),
  Balance: z.number(),
})
interface AccountItem {
  id: number
  title: string
  type: string
  notes?: string | null
  balance: number
}

async function getRawTransactions() {
  const response = await fetch(
    `https://db.creatorsgarten.org/api/v1/db/data/v1/Creatorsgarten%20Operations/Transactions?${new URLSearchParams(
      {
        limit: '1000',
        shuffle: '0',
        offset: '0',
        'nested[Debit][fields]': 'Id,Title,Type',
        'nested[Credit][fields]': 'Id,Title,Type',
      },
    )}`,
    {
      headers: {
        'xc-token': process.env.XC_TOKEN!,
      },
      next: {
        revalidate: 10,
        tags: ['transactions'],
      },
    },
  )
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const data = await response.json()
  const { list } = RawTransactionData.parse(data)
  const parsed = list.map((row) => {
    return RawTransactionRow.parse(row)
  })
  return { list: parsed }
}
const RawTransactionData = z.object({
  list: z.array(z.unknown()),
})
const RawTransactionRow = z.object({
  Id: z.number(),
  Title: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  Amount: z.number(),
  Date: z.string(),
  Notes: z.string().nullish(),
  Event: z
    .object({
      Id: z.number(),
      Title: z.string(),
    })
    .nullish(),
  Debit: z.object({
    Id: z.number(),
    Title: z.string(),
    Type: z.string(),
  }),
  Credit: z.object({
    Id: z.number(),
    Title: z.string(),
    Type: z.string(),
  }),
})
type RawTransactionRow = z.infer<typeof RawTransactionRow>

export async function getAccountTransactions(hostAccounts: number[]) {
  const data = await getRawTransactions()
  const isHostAccount = (account: { Id: number }) => {
    return hostAccounts.includes(account.Id)
  }
  return toTable(
    data.list.filter((row) => {
      return isHostAccount(row.Debit) || isHostAccount(row.Credit)
    }),
  )
}

export async function getEventTransactions(slug: string) {
  const data = await getRawTransactions()
  return toTable(
    data.list.filter((row) => {
      return row.Event?.Title === slug
    }),
  )
}

function toTable(list: RawTransactionRow[]): TransactionTableRow[] {
  const isCashOnHand = (account: { Type: string }) => {
    return account.Type === 'Cash on Hand'
  }
  const isReceivable = (account: { Type: string }) => {
    return account.Type === 'Receivables'
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
      const use = (a: { Title: string; Type: string }) => {
        return {
          account: a.Title,
          accountType: a.Type,
        }
      }
      if (received || receiving) {
        return use(row.Credit)
      } else {
        return use(row.Debit)
      }
    })()
    return {
      id: row.Id,
      date: row.Date,
      notes: row.Notes,
      description: row.Title,
      amount: amount,
      balance: (balance += amount),
      event: row.Event?.Title,
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
}
