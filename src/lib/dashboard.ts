import type { Transaction } from './data'
import { parseLocalDate, toLocalDateKey } from './dates'
import { getVariation } from './month-summary'

export const dashboardPeriods = ['3', '6', '12', 'all'] as const
export type DashboardPeriod = (typeof dashboardPeriods)[number]

type Totals = {
  income: number
  expenses: number
  count: number
}

function includeTransaction(totals: Totals, transaction: Transaction) {
  if (transaction.type === 'income') totals.income += transaction.amountInCents
  else totals.expenses += transaction.amountInCents
  totals.count += 1
}

function withBalance(totals: Totals) {
  return { ...totals, balance: totals.income - totals.expenses }
}

export function getDashboardData(transactions: readonly Transaction[], period: DashboardPeriod, today: Date) {
  const year = today.getFullYear()
  const month = today.getMonth()
  const currentStart = new Date(year, month, 1)
  const monthKey = (offset: number) => toLocalDateKey(new Date(year, month - offset, 1)).slice(0, 7)
  const currentMonth = monthKey(0)
  const size = period === 'all' ? null : Number(period)
  const startMonth = size === null ? null : monthKey(size - 1)
  const previousStart = size === null ? null : monthKey(2 * size - 1)
  const byMonth = new Map<string, Totals>()
  const currentPeriod = { income: 0, expenses: 0, count: 0 }
  const previousPeriod = { income: 0, expenses: 0, count: 0 }
  const periodTransactions: Transaction[] = []
  let firstMonth = currentMonth

  for (const transaction of transactions) {
    const key = transaction.date.slice(0, 7)
    if (key > currentMonth) continue

    const monthly = byMonth.get(key) ?? { income: 0, expenses: 0, count: 0 }
    includeTransaction(monthly, transaction)
    byMonth.set(key, monthly)
    if (key < firstMonth) firstMonth = key
    if (startMonth === null || key >= startMonth) {
      includeTransaction(currentPeriod, transaction)
      periodTransactions.push(transaction)
    } else if (previousStart !== null && key >= previousStart) {
      includeTransaction(previousPeriod, transaction)
    }
  }

  const months = []
  const rangeStart = startMonth !== null && startMonth > firstMonth ? startMonth : firstMonth
  const cursor = parseLocalDate(`${rangeStart}-01`)
  while (cursor <= currentStart) {
    const key = toLocalDateKey(cursor).slice(0, 7)
    const monthly = byMonth.get(key)
    months.push({ key, income: monthly?.income ?? null, expenses: monthly?.expenses ?? null })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const totals = withBalance(currentPeriod)
  const previous = withBalance(previousPeriod)
  const incompleteComparison = size !== null && Array.from({ length: 2 * size }, (_, offset) => monthKey(offset))
    .some((key) => !byMonth.has(key))
  function periodVariation(field: keyof typeof totals) {
    return getVariation(totals[field], previous[field], !incompleteComparison)
  }

  return {
    totals,
    incompleteComparison,
    variations: size === null ? undefined : {
      income: periodVariation('income'),
      expenses: periodVariation('expenses'),
      balance: periodVariation('balance'),
      count: periodVariation('count'),
    },
    months,
    periodTransactions,
  }
}
