import { DashboaardBreadcrumb } from '@/app/dashboard/DashboaardBreadcrumb'
import { getRawTransactions } from '@/db'

export default async function EventPage({
  params,
}: {
  params: { slug: string }
}) {
  const transactions = await getRawTransactions()
  return (
    <>
      <DashboaardBreadcrumb pageTitle={'Raw transactions'} />
      <h1>Raw transactions</h1>
      <ol>
        {transactions.list.map((transaction) => {
          return (
            <li key={transaction.Id}>{JSON.stringify(transaction, null, 2)}</li>
          )
        })}
      </ol>
    </>
  )
}
