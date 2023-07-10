import { getSession } from '../api/auth/[...nextauth]/route'
import { isUserAllowed } from './allowedUsers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (isUserAllowed(session)) {
    return <>No access.</>
  }
  return <>{children}</>
}
