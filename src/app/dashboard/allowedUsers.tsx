import { Session } from 'next-auth'

export const allowedUsers = ['betich', 'chayapatr', 'dtinth', 'rayriffy']

export function isUserAllowed(session: Session | null) {
  return !session || !allowedUsers.includes(session.username || '')
}
