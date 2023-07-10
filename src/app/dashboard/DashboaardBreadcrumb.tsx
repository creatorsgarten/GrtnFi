import Link from 'next/link'

export interface DashboaardBreadcrumb {
  pageTitle: string
}
export function DashboaardBreadcrumb(props: DashboaardBreadcrumb) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {props.pageTitle}
        </li>
      </ol>
    </nav>
  )
}
