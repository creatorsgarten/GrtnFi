import 'bootstrap/dist/css/bootstrap.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { getSession } from './api/auth/[...nextauth]/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GrtnFi',
  description: 'Creatorsgarten’s balance tracking system',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en" data-bs-theme="light">
      <body className={inter.className}>
        <header className="container pt-4 pb-3">
          <div className="d-flex align-items-center">
            <strong className="flex-none">GrtnFi</strong>
            <span className="ms-auto">
              {session?.userId ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn btn-sm btn-secondary me-1"
                  >
                    Dashboard
                  </Link>
                  <a
                    href="/api/auth/signout"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Sign out [{session.username}]
                  </a>
                </>
              ) : (
                <a
                  href="/api/auth/signin"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Sign in
                </a>
              )}
            </span>
          </div>
          <hr />
        </header>
        <main className="container pb-4">{children}</main>
      </body>
    </html>
  )
}
