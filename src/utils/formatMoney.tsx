export function formatMoney(baht: number) {
  let suffix = ''
  let prefix = ''
  let text = baht.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
  })
  text = text
    .replace(/\.\d+/, (match) => {
      suffix = match
      return ''
    })
    .replace(/^-?฿/, (match) => {
      prefix = match
      return ''
    })
  return (
    <>
      {prefix}
      {text}
      <small>{suffix}</small>
    </>
  )
}
