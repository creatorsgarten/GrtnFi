import { getSession } from '../api/auth/[...nextauth]/route'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.userId !== '644c35a6802c02345887f156') {
    return <>No access.</>
  }
  return <>{children}</>
}
