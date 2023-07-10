import { z } from 'zod'

export default function Home() {
  return (
    <main className="container py-4">
      GrtnFi
      <hr />
      <h1>showdown.space</h1>
      <AccountTable hostAccounts={['dtinth']} />
      <h1>sht7</h1>
      <EventTable eventSlug="sht7" />
    </main>
  )
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

async function getTransactions() {
  const response = await fetch(
    'https://db.creatorsgarten.org/api/v1/db/data/v1/Creatorsgarten%20Operations/Transactions?limit=1000&shuffle=0&offset=0&nested%5BDebit%5D%5Bfields%5D=Id%2CTitle%2CType&nested%5BCredit%5D%5Bfields%5D=Id%2CTitle%2CType',
    {
      headers: {
        'xc-token': process.env.XC_TOKEN!,
      },
      next: {
        revalidate: 60,
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

async function getAccountTransactions(hostAccounts: string[]) {
  const data = await getTransactions()
  const isHostAccount = (account: { Title: string }) => {
    return hostAccounts.includes(account.Title)
  }
  return toTable(
    data.list.filter((row) => {
      return isHostAccount(row.Debit) || isHostAccount(row.Credit)
    }),
  )
}
async function getEventTransactions(slug: string) {
  const data = await getTransactions()
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
interface TransactionTableRow {
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

interface AccountTable {
  hostAccounts: string[]
}
async function AccountTable(props: AccountTable) {
  const transactions = await getAccountTransactions(props.hostAccounts)
  return <TransactionTable transactions={transactions} />
}

interface EventTable {
  eventSlug: string
}
async function EventTable(props: EventTable) {
  const transactions = await getEventTransactions(props.eventSlug)
  return <TransactionTable transactions={transactions} />
}

interface TransactionTable {
  transactions: TransactionTableRow[]
}
function TransactionTable(props: TransactionTable) {
  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col" className="text-end">
              Amount
            </th>
            <th scope="col" className="text-end">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {props.transactions.map((row) => {
            return (
              <tr key={row.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {row.date}
                  {!!row.event && (
                    <>
                      <br />
                      <small className="text-muted">
                        <EventLink eventId={row.event} />
                      </small>
                    </>
                  )}
                </td>
                <td>
                  <strong>{row.description}</strong> {row.notes}
                  <br />
                  <small className="text-muted">
                    {row.amount < 0 ? <>&rarr;</> : <>&larr;</>} {row.account}{' '}
                    <AccountType type={row.accountType} />
                  </small>
                </td>
                <td
                  className={
                    'text-end ' +
                    (row.amount < 0 ? 'text-danger' : 'text-success')
                  }
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatMoney(row.amount)}
                </td>
                <td
                  className="text-end"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatMoney(row.balance)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

interface AccountType {
  type: string
}
function AccountType(props: AccountType) {
  const colors =
    {
      Sponsor: 'bg-success-subtle text-success-emphasis',
      Expense: 'bg-danger-subtle text-danger-emphasis',
      Income: 'bg-info-subtle text-info-emphasis',
    }[props.type] ?? 'text-bg-secondary'
  return <span className={'badge ' + colors}>{props.type}</span>
}

interface EventLink {
  eventId: string
}
function EventLink(props: EventLink) {
  return (
    <a
      className="text-muted text-decoration-none"
      href={`https://grtn.org/e/${props.eventId}`}
    >
      {props.eventId}
    </a>
  )
}

function formatMoney(baht: number) {
  let suffix = ''
  let prefix = ''
  let text = baht.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
  })
  text = text
    .replace(/\.\d+/, (match) => {
      suffix = match
      return ''
    })
    .replace(/^-?฿/, (match) => {
      prefix = match
      return ''
    })
  return (
    <>
      {prefix}
      {text}
      <small>{suffix}</small>
    </>
  )
}
