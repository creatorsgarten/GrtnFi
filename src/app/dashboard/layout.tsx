import { getSession } from '../api/auth/[...nextauth]/route'

const allowedUsers = ['betich', 'chayapatr', 'dtinth', 'rayriffy']

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || !allowedUsers.includes(session.username || '')) {
    return <>No access.</>
  }
  return <>{children}</>
}
