import { useSyncExternalStore } from 'react'

import { readStorage, subscribeStorage, writeStorage } from './storage'

export type User = {
  name: string
  email: string
  loginCount: number
  lastLoginAt: string
}

type Session = { user: User; active: boolean }
const sessionKey = 'session'

let storedValue: string | null | undefined
let snapshot: Session | null = null
const listeners = new Set<() => void>()

function parseSession(saved: string | null): Session | null {
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

function readSession(): Session | null {
  const saved = readStorage(sessionKey)
  if (saved !== storedValue) {
    storedValue = saved
    snapshot = parseSession(saved)
  }
  return snapshot
}

function saveSession(session: Session) {
  snapshot = session
  if (!writeStorage(sessionKey, JSON.stringify(session))) {
    listeners.forEach((listener) => listener())
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const unsubscribeStorage = subscribeStorage(sessionKey, listener)
  return () => {
    listeners.delete(listener)
    unsubscribeStorage()
  }
}

export function useSession() {
  return useSyncExternalStore(subscribe, readSession)
}

export function login(name: string, email: string): void {
  const previous = readSession()
  saveSession({
    active: true,
    user: {
      name,
      email,
      loginCount: (previous?.user.loginCount ?? 0) + 1,
      lastLoginAt: new Date().toISOString(),
    },
  })
}

export function updateSessionName(name: string): boolean {
  const session = readSession()
  const trimmedName = name.trim()
  if (!session?.active || !trimmedName) return false
  if (session.user.name === trimmedName) return true

  return writeStorage(sessionKey, JSON.stringify({
    ...session,
    user: { ...session.user, name: trimmedName },
  }))
}

export function logout(): void {
  const session = readSession()
  if (session?.active) saveSession({ ...session, active: false })
}
