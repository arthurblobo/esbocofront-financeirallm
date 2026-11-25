import { useSyncExternalStore } from 'react'

import { getProfileName, saveProfileName } from './profile'
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

function publishSessionInMemory(session: Session) {
  snapshot = session
  listeners.forEach((listener) => listener())
}

function saveSession(session: Session): boolean {
  snapshot = session
  if (writeStorage(sessionKey, JSON.stringify(session))) return true

  publishSessionInMemory(session)
  return false
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
      name: getProfileName(email) ?? name,
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
  const email = session.user.email
  const previousName = getProfileName(email)
  if (session.user.name === trimmedName && previousName === trimmedName) return true

  const next = { ...session, user: { ...session.user, name: trimmedName } }
  if (!saveProfileName(email, trimmedName)) {
    publishSessionInMemory(next)
    return false
  }
  if (saveSession(next)) return true

  // A failed session write must not silently make the edit permanent through the profile.
  saveProfileName(email, previousName)
  return false
}

export function logout(): void {
  const session = readSession()
  if (session?.active) saveSession({ ...session, active: false })
}
