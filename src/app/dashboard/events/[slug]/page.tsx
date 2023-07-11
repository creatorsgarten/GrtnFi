import { TransactionTable } from '@/app/TransactionTable'
import { getEventTransactions } from '@/db'
import { DashboaardBreadcrumb } from '@/app/dashboard/DashboaardBreadcrumb'

export default async function EventPage({
  params,
}: {
  params: { slug: string }
}) {
  const transactions = await getEventTransactions(params.slug)
  return (
    <>
      <DashboaardBreadcrumb pageTitle={'Event: ' + params.slug} />
      <h1>{params.slug}</h1>

      <h2 className="mt-5">Transactions</h2>
      <TransactionTable transactions={transactions} />
    </>
  )
}
