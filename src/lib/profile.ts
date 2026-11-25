import { useSyncExternalStore } from 'react'

import { isValidPhone, phoneDigits } from './phone'
import { readStorage, subscribeStorage, writeStorage } from './storage'

type Profile = { name: string | null; phone: string; photo: string | null }
const emptyProfile: Profile = { name: null, phone: '', photo: null }
const photoPattern = /^data:image\/(?:webp|png);base64,[a-z0-9+/=]+$/i
const profiles = new Map<string, ReturnType<typeof createProfileStore>>()

function parseProfile(saved: string | null): Profile {
  if (!saved) return emptyProfile

  try {
    const value = JSON.parse(saved)
    return {
      name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : null,
      phone: typeof value.phone === 'string' && isValidPhone(value.phone) ? value.phone : '',
      photo: typeof value.photo === 'string' && photoPattern.test(value.photo) ? value.photo : null,
    }
  } catch {
    return emptyProfile
  }
}

function createProfileStore(key: string) {
  let savedValue: string | null | undefined
  let snapshot = emptyProfile

  function getSnapshot() {
    const saved = readStorage(key)
    if (saved !== savedValue) {
      savedValue = saved
      snapshot = parseProfile(saved)
    }
    return snapshot
  }

  function subscribe(listener: () => void) {
    return subscribeStorage(key, listener)
  }

  function savePhone(value: string) {
    const current = getSnapshot()
    const phone = phoneDigits(value)
    return isValidPhone(phone) && (phone === current.phone || writeStorage(key, JSON.stringify({ ...current, phone })))
  }

  function savePhoto(photo: string | null) {
    const current = getSnapshot()
    return current.photo === photo || writeStorage(key, JSON.stringify({ ...current, photo }))
  }

  function saveName(name: string | null) {
    const current = getSnapshot()
    return current.name === name || writeStorage(key, JSON.stringify({ ...current, name }))
  }

  return { getSnapshot, subscribe, savePhone, savePhoto, saveName }
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

export function getProfileName(email: string): string | null {
  return getProfileStore(email).getSnapshot().name
}

export function saveProfileName(email: string, name: string | null): boolean {
  return getProfileStore(email).saveName(name)
}

export function saveProfilePhone(email: string, phone: string): boolean {
  return getProfileStore(email).savePhone(phone)
}

export function saveProfilePhoto(email: string, photo: string | null): boolean {
  return getProfileStore(email).savePhoto(photo)
}
