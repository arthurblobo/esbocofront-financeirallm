import { readStorage, writeStorage } from './storage'

type Theme = 'light' | 'dark'
const storageKey = 'financeiro-familiar:theme'

export function getTheme(): Theme {
  return readStorage(storageKey) === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

export function saveTheme(theme: Theme): void {
  applyTheme(theme)
  writeStorage(storageKey, theme)
}
