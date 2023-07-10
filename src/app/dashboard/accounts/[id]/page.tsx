import { AccountType } from '@/app/AccountType'
import { TransactionTable } from '@/app/TransactionTable'
import { getAccountList, getAccountTransactions } from '@/db'
import { DashboaardBreadcrumb } from '@/app/dashboard/DashboaardBreadcrumb'

export default async function AccountPage({
  params,
}: {
  params: { id: string }
}) {
  const accounts = await getAccountList()
  const account = accounts.list.find((x) => x.id === +params.id)
  const transactions = await getAccountTransactions([+params.id!])
  return (
    <>
      <DashboaardBreadcrumb pageTitle={'Account ID: ' + params.id} />
      <h1>
        {account?.title}{' '}
        {!!account?.type && <AccountType type={account.type} />}
      </h1>
      <TransactionTable transactions={transactions} />
    </>
  )
}
