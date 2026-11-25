import { useSyncExternalStore } from 'react'

import { phoneDigits } from './phone'
import { readStorage, subscribeStorage, writeStorage } from './storage'

type Profile = { phone: string; photo: string | null }
const emptyProfile: Profile = { phone: '', photo: null }
const photoPattern = /^data:image\/(?:webp|png);base64,[a-z0-9+/=]+$/i
const profiles = new Map<string, ReturnType<typeof createProfileStore>>()

function parseProfile(saved: string | null): Profile {
  if (!saved) return emptyProfile

  try {
    const value = JSON.parse(saved)
    return {
      phone: typeof value.phone === 'string' && /^(?:\d{10,11})?$/.test(value.phone) ? value.phone : '',
      photo: typeof value.photo === 'string' && photoPattern.test(value.photo) ? value.photo : null,
    }
  } catch {
    return emptyProfile
  }
}

function createProfileStore(key: string) {
  let savedValue: string | null | undefined
  let snapshot = emptyProfile
  const listeners = new Set<() => void>()

  function getSnapshot() {
    const saved = readStorage(key)
    if (saved !== savedValue) {
      savedValue = saved
      snapshot = parseProfile(saved)
    }
    return snapshot
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    const unsubscribe = subscribeStorage(key, listener)
    return () => {
      listeners.delete(listener)
      unsubscribe()
    }
  }

  function savePhone(value: string) {
    const current = getSnapshot()
    const phone = phoneDigits(value)
    return phone === current.phone || writeStorage(key, JSON.stringify({ ...current, phone }))
  }

  function savePhoto(photo: string | null) {
    const current = getSnapshot()
    if (current.photo === photo) return true
    if (writeStorage(key, JSON.stringify({ ...current, photo }))) return true

    snapshot = { ...current, photo: null }
    listeners.forEach((listener) => listener())
    return false
  }

  return { getSnapshot, subscribe, savePhone, savePhoto }
}

function getProfileStore(email: string) {
  const key = `profile:${email.trim().toLowerCase()}`
  const existing = profiles.get(key)
  if (existing) return existing

  const store = createProfileStore(key)
  profiles.set(key, store)
  return store
}

const readEmptyProfile = () => emptyProfile
const subscribeEmptyProfile = () => () => {}

export function useProfile(email?: string): Profile {
  const store = email ? getProfileStore(email) : undefined
  return useSyncExternalStore(store?.subscribe ?? subscribeEmptyProfile, store?.getSnapshot ?? readEmptyProfile)
}

export function saveProfilePhone(email: string, phone: string): boolean {
  return getProfileStore(email).savePhone(phone)
}

export function saveProfilePhoto(email: string, photo: string | null): boolean {
  return getProfileStore(email).savePhoto(photo)
}
