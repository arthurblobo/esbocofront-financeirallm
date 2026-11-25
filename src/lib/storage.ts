const STORAGE_PREFIX = 'financeiro:'
const storageChanges = new EventTarget()

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  const prefixedKey = STORAGE_PREFIX + key
  try {
    window.localStorage.setItem(prefixedKey, value)
  } catch {
    // The app still works when persistence is unavailable.
    return
  }
  storageChanges.dispatchEvent(new Event(prefixedKey))
}

export function subscribeStorage(key: string, listener: () => void): () => void {
  const prefixedKey = STORAGE_PREFIX + key
  function onStorage(event: StorageEvent) {
    if (event.key === prefixedKey || event.key === null) listener()
  }

  storageChanges.addEventListener(prefixedKey, listener)
  window.addEventListener('storage', onStorage)

  return () => {
    storageChanges.removeEventListener(prefixedKey, listener)
    window.removeEventListener('storage', onStorage)
  }
}
