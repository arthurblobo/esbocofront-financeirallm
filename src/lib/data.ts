import { useSyncExternalStore } from 'react'

import { defaultCategories, type Category } from '@/mocks/categories'
import { createTransactions, type Transaction } from '@/mocks/transactions'
import { toLocalDateKey } from './dates'
import { readStorage, subscribeStorage } from './storage'

export { getCategoryLabel, UNCATEGORIZED_ID } from '@/mocks/categories'
export type { Category, CategoryId } from '@/mocks/categories'
export type { Transaction } from '@/mocks/transactions'

const categoriesKey = 'categories'
let transactionsDay: string | undefined
let transactionsSnapshot: readonly Transaction[] = []
let categoriesValue: string | null = null
let categoriesSnapshot = defaultCategories

function isCategory(value: unknown): value is Category {
  if (
    !value || typeof value !== 'object' ||
    !('id' in value) || typeof value.id !== 'string' || !value.id ||
    !('color' in value) || typeof value.color !== 'string' || !value.color
  ) {
    return false
  }

  const name = 'name' in value ? value.name : undefined
  const labelKey = 'labelKey' in value ? value.labelKey : undefined
  if (labelKey === undefined) return typeof name === 'string' && name.trim().length > 0
  return (name === undefined || (typeof name === 'string' && name.trim().length > 0)) &&
    defaultCategories.some((category) => category.labelKey === labelKey)
}

function readCategories(value: string | null): readonly Category[] {
  if (value === null) return defaultCategories

  try {
    const parsed: unknown = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every(isCategory)) return parsed
  } catch {
    // Malformed saved data falls back to the defaults.
  }

  return defaultCategories
}

function getCategoriesSnapshot() {
  const value = readStorage(categoriesKey)
  if (value !== categoriesValue) {
    categoriesValue = value
    categoriesSnapshot = readCategories(value)
  }
  return categoriesSnapshot
}

function subscribeCategories(listener: () => void) {
  return subscribeStorage(categoriesKey, listener)
}

function getTransactionsSnapshot() {
  const today = new Date()
  const day = toLocalDateKey(today)

  if (day !== transactionsDay) {
    transactionsDay = day
    transactionsSnapshot = createTransactions(today)
  }

  return transactionsSnapshot
}

function subscribeTransactions(listener: () => void) {
  document.addEventListener('visibilitychange', listener)
  window.addEventListener('focus', listener)
  return () => {
    document.removeEventListener('visibilitychange', listener)
    window.removeEventListener('focus', listener)
  }
}

export function useTransactions(): readonly Transaction[] {
  return useSyncExternalStore(subscribeTransactions, getTransactionsSnapshot)
}

export function useCategories(): readonly Category[] {
  return useSyncExternalStore(subscribeCategories, getCategoriesSnapshot)
}
