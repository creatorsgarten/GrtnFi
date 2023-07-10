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
      <TransactionTable transactions={transactions} />
    </>
  )
}
