import {
  getAccountList,
  getAccountTransactions,
  getEventTransactions,
} from '@/db'
import Link from 'next/link'
import { AccountType } from '../AccountType'
import { formatMoney } from '@/utils/formatMoney'

export default async function Dashboard() {
  const accountList = await getAccountList()
  return (
    <div>
      <h1>Accounts</h1>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Account</th>
            <th>Type</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {accountList.list.map((account) => {
            return (
              <tr key={account.id}>
                <td>
                  <Link href={`/dashboard/accounts/${account.id}`}>
                    {account.title}
                  </Link>
                </td>
                <td>
                  <AccountType type={account.type} />
                </td>
                <td
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                  }}
                  className="text-end"
                >
                  {formatMoney(account.balance)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
