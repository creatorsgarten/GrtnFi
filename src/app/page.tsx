import { z } from 'zod'

export default function Home() {
  return (
    <main className="container py-4">
      GrtnFi
      <hr />
      <h1>showdown.space</h1>
      <AccountTable cashOnHandAccounts={['dtinth']} />
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

async function getTransactions() {
  const response = await fetch(
    'https://db.creatorsgarten.org/api/v1/db/data/v1/Creatorsgarten%20Operations/Transactions?limit=1000&shuffle=0&offset=0&nested%5BDebit%5D%5Bfields%5D=Id%2CTitle%2CType&nested%5BCredit%5D%5Bfields%5D=Id%2CTitle%2CType',
    {
      headers: {
        'xc-token': process.env.XC_TOKEN!,
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

interface AccountTable {
  cashOnHandAccounts: string[]
}
async function AccountTable(props: AccountTable) {
  const data = await getTransactions()
  const isCashOnHand = (account: { Title: string }) => {
    return props.cashOnHandAccounts.includes(account.Title)
  }
  const transactions = data.list
    .filter((row) => {
      return isCashOnHand(row.Debit) || isCashOnHand(row.Credit)
    })
    .map((row) => ({
      id: row.Id,
      date: row.Date,
      description: row.Title,
      amount: isCashOnHand(row.Debit) ? row.Amount : -row.Amount,
      account: isCashOnHand(row.Debit) ? row.Credit?.Title : row.Debit.Title,
      event: row.Event?.Title,
    }))

  let balance = 0

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col" className="text-end">
              Out / In
            </th>
            <th scope="col" className="text-end">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => {
            balance += row.amount
            return (
              <tr key={row.id}>
                <td>
                  {row.date}
                  <br />
                  <small className="text-muted">{row.event}</small>
                </td>
                <td>
                  {row.description}
                  <br />
                  <small className="text-muted">
                    {row.amount < 0 ? <>&rarr;</> : <>&larr;</>} {row.account}
                  </small>
                </td>
                <td className="text-end">{formatMoney(row.amount)}</td>
                <td className="text-end">{formatMoney(balance)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(data, null, 2)}
      </pre> */}
    </>
  )
}

function formatMoney(baht: number) {
  return baht.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
}
