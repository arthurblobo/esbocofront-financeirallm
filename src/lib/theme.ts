import { useSyncExternalStore } from 'react'
import { readStorage, writeStorage } from './storage'

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

export function saveTheme(theme: Theme): boolean {
  const changed = currentTheme !== theme
  currentTheme = theme
  applyTheme(theme)
  const saved = writeStorage(storageKey, theme)
  if (changed) listeners.forEach((listener) => listener())
  return saved
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme)
}
