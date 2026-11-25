import { useSyncExternalStore } from 'react'

import { defaultCategories, UNCATEGORIZED_ID, type Category, type CategoryId } from '@/mocks/categories'
import { createTransactions, type Transaction } from '@/mocks/transactions'
import { categoryColors } from './category-palette'
import { parseLocalDate, toLocalDateKey } from './dates'
import { readStorage, subscribeStorage, writeStorage } from './storage'

export { getCategoryLabel, UNCATEGORIZED_ID } from '@/mocks/categories'
export type { Category, CategoryId } from '@/mocks/categories'
export type { Transaction } from '@/mocks/transactions'

const importDelayMs = 2400

function createStoredData<T>(key: string, fallback: T, parse: (value: unknown) => T) {
  let storedValue: string | null | undefined
  let snapshot = fallback
  const listeners = new Set<() => void>()

  function getSnapshot() {
    const saved = readStorage(key)
    if (saved !== storedValue) {
      storedValue = saved
      try {
        snapshot = saved === null ? fallback : parse(JSON.parse(saved))
      } catch {
        snapshot = fallback
      }
    }
    return snapshot
  }

  function save(value: T) {
    snapshot = value
    if (!writeStorage(key, JSON.stringify(value))) listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    const unsubscribe = subscribeStorage(key, listener)
    return () => {
      listeners.delete(listener)
      unsubscribe()
    }
  }

  return { getSnapshot, save, subscribe }
}

function isCategory(value: unknown): value is Category {
  if (
    !value || typeof value !== 'object' ||
    !('id' in value) || typeof value.id !== 'string' || !value.id ||
    !('color' in value) || typeof value.color !== 'string' || !categoryColors.includes(value.color)
  ) return false

  const name = 'name' in value ? value.name : undefined
  const labelKey = 'labelKey' in value ? value.labelKey : undefined
  if (labelKey === undefined) return typeof name === 'string' && name.trim().length > 0
  return (name === undefined || (typeof name === 'string' && name.trim().length > 0)) &&
    defaultCategories.some((category) => category.labelKey === labelKey)
}

const categories = createStoredData('categories', defaultCategories, (value) =>
  Array.isArray(value) && value.every(isCategory) ? value : defaultCategories,
)
const imported = createStoredData<readonly string[]>('importedMonths', [], (value) =>
  Array.isArray(value) ? value.filter((month): month is string => typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) : [],
)
const assignments = createStoredData<Readonly<Record<string, CategoryId>>>('categoryAssignments', {}, (value) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).filter(([id, category]) => id.startsWith('mock-') && typeof category === 'string'))
    : {},
)

type StatementMonths = {
  firstMonth: string
  currentMonth: string
  previousMonth: string
  available: ReadonlySet<string>
  imported: readonly string[]
  processing: ReadonlySet<string>
}

let dayKey: string | undefined
let mockTransactions: readonly Transaction[] = []
let calendarSnapshot: StatementMonths | undefined
let availableMonths: ReadonlySet<string> = new Set()
let processingMonths: ReadonlySet<string> = new Set()
const processingListeners = new Set<() => void>()

function getCalendar(): StatementMonths {
  const today = new Date()
  const day = toLocalDateKey(today)
  const importedMonths = imported.getSnapshot()
  if (day !== dayKey) {
    dayKey = day
    mockTransactions = createTransactions(today)
    availableMonths = new Set(mockTransactions.map(({ date }) => date.slice(0, 7)))
  }

  if (
    !calendarSnapshot || calendarSnapshot.available !== availableMonths ||
    calendarSnapshot.imported !== importedMonths || calendarSnapshot.processing !== processingMonths
  ) {
    const currentMonth = day.slice(0, 7)
    const firstOfMonth = parseLocalDate(`${currentMonth}-01`)
    firstOfMonth.setMonth(firstOfMonth.getMonth() - 1)
    calendarSnapshot = {
      firstMonth: availableMonths.values().next().value ?? currentMonth,
      currentMonth,
      previousMonth: toLocalDateKey(firstOfMonth).slice(0, 7),
      available: availableMonths,
      imported: importedMonths,
      processing: processingMonths,
    }
  }
  return calendarSnapshot
}

export function getStatementMonthStatus(calendar: StatementMonths, month: string) {
  if (month > calendar.currentMonth) return 'future'
  if (!calendar.available.has(month)) return 'unavailable'
  if (calendar.imported.includes(month) || month < calendar.previousMonth) return 'imported'
  return calendar.processing.has(month) ? 'processing' : 'pending'
}

function subscribeCalendar(listener: () => void) {
  const unsubscribe = imported.subscribe(listener)
  processingListeners.add(listener)
  document.addEventListener('visibilitychange', listener)
  window.addEventListener('focus', listener)
  return () => {
    unsubscribe()
    processingListeners.delete(listener)
    document.removeEventListener('visibilitychange', listener)
    window.removeEventListener('focus', listener)
  }
}

export function useStatementMonths() {
  return useSyncExternalStore(subscribeCalendar, getCalendar)
}

let transactionCalendar: StatementMonths | undefined
let transactionAssignments: Readonly<Record<string, CategoryId>> | undefined
let transactionsSnapshot: readonly Transaction[] = []

function getTransactionsSnapshot() {
  const calendar = getCalendar()
  const categoryAssignments = assignments.getSnapshot()
  if (calendar !== transactionCalendar || categoryAssignments !== transactionAssignments) {
    transactionCalendar = calendar
    transactionAssignments = categoryAssignments
    transactionsSnapshot = mockTransactions
      .filter(({ date }) => getStatementMonthStatus(calendar, date.slice(0, 7)) === 'imported')
      .map((transaction) => {
        const categoryId = categoryAssignments[transaction.id]
        return transaction.type === 'expense' && categoryId ? { ...transaction, categoryId } : transaction
      })
  }
  return transactionsSnapshot
}

function subscribeTransactions(listener: () => void) {
  const unsubscribeCalendar = subscribeCalendar(listener)
  const unsubscribeAssignments = assignments.subscribe(listener)
  return () => {
    unsubscribeCalendar()
    unsubscribeAssignments()
  }
}

export function useTransactions(): readonly Transaction[] {
  return useSyncExternalStore(subscribeTransactions, getTransactionsSnapshot)
}

export function useCategories(): readonly Category[] {
  return useSyncExternalStore(categories.subscribe, categories.getSnapshot)
}

export function startStatementImport(month: string): boolean {
  if (getStatementMonthStatus(getCalendar(), month) !== 'pending') return false

  processingMonths = new Set([...processingMonths, month])
  processingListeners.forEach((listener) => listener())
  window.setTimeout(() => {
    processingMonths = new Set([...processingMonths].filter((value) => value !== month))
    const months = imported.getSnapshot()
    if (!months.includes(month)) imported.save([...months, month])
    else processingListeners.forEach((listener) => listener())
  }, importDelayMs)
  return true
}

export function saveCategory(id: CategoryId | null, name: string | undefined, color: string): CategoryId | null {
  const trimmedName = name?.trim()
  if (trimmedName === '' || !categoryColors.includes(color)) return null

  const current = categories.getSnapshot()
  if (id === null) {
    if (!trimmedName) return null
    const newId = `custom-${crypto.randomUUID()}`
    categories.save([...current, { id: newId, name: trimmedName, color }])
    return newId
  }
  if (!current.some((category) => category.id === id)) return null

  categories.save(current.map((category) => {
    if (category.id !== id) return category
    return trimmedName === undefined ? { ...category, color } : { ...category, name: trimmedName, color }
  }))
  return id
}

export function assignTransactionCategory(transactionId: string, categoryId: CategoryId): boolean {
  const transaction = getTransactionsSnapshot().find(({ id }) => id === transactionId)
  if (transaction?.categoryId !== UNCATEGORIZED_ID ||
      categoryId === UNCATEGORIZED_ID ||
      !categories.getSnapshot().some(({ id }) => id === categoryId)) return false

  assignments.save({ ...assignments.getSnapshot(), [transactionId]: categoryId })
  return true
}
