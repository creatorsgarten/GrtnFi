import { TransactionTableRow } from '@/db'
import { AccountType } from './AccountType'
import { formatMoney } from '@/utils/formatMoney'

export interface TransactionTable {
  transactions: TransactionTableRow[]
}
export function TransactionTable(props: TransactionTable) {
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
                  <strong>{row.description}</strong>{' '}
                  {row.notes ? (
                    <>
                      <br />
                      <span style={{ whiteSpace: 'pre-line' }}>
                        {row.notes}
                      </span>
                    </>
                  ) : null}
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
