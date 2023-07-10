import { TransactionTable } from './TransactionTable'
import { getAccountTransactions, getEventTransactions } from '@/db'

export default async function Home() {
  return (
    <>
      <h1>showdown.space</h1>
      <AccountTable hostAccounts={[13]} />
      <br />
      <br />
      <h1>sht7</h1>
      <EventTable eventSlug="sht7" />
    </>
  )
}

interface AccountTable {
  hostAccounts: number[]
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
