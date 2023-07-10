import { getAccountList, getEventList } from '@/db'
import Link from 'next/link'
import { AccountType } from '../AccountType'
import { formatMoney } from '@/utils/formatMoney'

export default async function Dashboard() {
  const accountList = await getAccountList()
  const eventList = await getEventList()
  return (
    <div>
      <h1>Events</h1>
      <ul className="nav nav-pills">
        {eventList.list.map((event) => {
          return (
            <li key={event.id} className="nav-item">
              <Link
                href={`/dashboard/events/${event.slug}`}
                className="nav-link"
              >
                {event.slug}{' '}
                <span className="badge bg-secondary rounded-pill">
                  {event.transactionCount}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <br />
      <br />

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
