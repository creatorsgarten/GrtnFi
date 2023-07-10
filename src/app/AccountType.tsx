export interface AccountType {
  type: string
}
export function AccountType(props: AccountType) {
  const colors =
    {
      Sponsor: 'bg-success-subtle text-success-emphasis',
      Expense: 'bg-danger-subtle text-danger-emphasis',
      Income: 'bg-info-subtle text-info-emphasis',
      Receivables: 'bg-warning-subtle text-warning-emphasis',
      Payables: 'bg-warning-subtle text-warning-emphasis',
    }[props.type] ?? 'text-bg-secondary'
  return <span className={'badge ' + colors}>{props.type}</span>
}
