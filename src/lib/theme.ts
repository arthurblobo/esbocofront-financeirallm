import { useSyncExternalStore } from 'react'
import { readStorage, subscribeStorage, writeStorage } from './storage'

type Theme = 'light' | 'dark'

const storageKey = 'theme'
let currentTheme: Theme = readStorage(storageKey) === 'light' ? 'light' : 'dark'
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getTheme(): Theme {
  return currentTheme
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

function setTheme(theme: Theme) {
  if (theme === currentTheme) return

  currentTheme = theme
  applyTheme(theme)
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  subscribeStorage(storageKey, () => setTheme(readStorage(storageKey) === 'light' ? 'light' : 'dark'))
}

export function saveTheme(theme: Theme): boolean {
  const saved = writeStorage(storageKey, theme)
  if (!saved) setTheme(theme)
  return saved
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme)
}
