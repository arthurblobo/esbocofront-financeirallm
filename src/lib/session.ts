import { readStorage, writeStorage } from './storage'

export type User = {
  name: string
  email: string
  loginCount: number
  lastLoginAt: string
}

type Session = { user: User; active: boolean }
const sessionKey = 'session'

export function readSession(): Session | null {
  const saved = readStorage(sessionKey)
  if (!saved) return null

  try {
    const session: Session = JSON.parse(saved)
    if (
      typeof session.active === 'boolean' &&
      typeof session.user.name === 'string' &&
      typeof session.user.email === 'string' &&
      Number.isSafeInteger(session.user.loginCount) && session.user.loginCount > 0 &&
      typeof session.user.lastLoginAt === 'string'
    ) return session
  } catch {
    // An invalid session is treated as signed out.
  }
  return null
}

export function createSession(name: string, email: string, previous: Session | null): Session {
  return {
    active: true,
    user: {
      name,
      email,
      loginCount: (previous?.user.loginCount ?? 0) + 1,
      lastLoginAt: new Date().toISOString(),
    },
  }
}

export function saveSession(session: Session): void {
  writeStorage(sessionKey, JSON.stringify(session))
}
