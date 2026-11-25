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
  const currentMonth = toLocalDateKey(currentStart).slice(0, 7)
  const fixedMonths = period === 'all' ? null : Number(period)
  const start = fixedMonths === null ? null : new Date(year, month - fixedMonths + 1, 1)
  const startMonth = start === null ? null : toLocalDateKey(start).slice(0, 7)
  const byMonth = new Map<string, Totals>()
  const totals = { income: 0, expenses: 0, count: 0 }
  const periodTransactions: Transaction[] = []
  let firstMonth = currentMonth

  for (const transaction of transactions) {
    const key = transaction.date.slice(0, 7)
    if (key > currentMonth) continue

    const monthly = byMonth.get(key) ?? { income: 0, expenses: 0, count: 0 }
    includeTransaction(monthly, transaction)
    byMonth.set(key, monthly)
    includeTransaction(totals, transaction)
    if (key < firstMonth) firstMonth = key
    if (startMonth === null || key >= startMonth) periodTransactions.push(transaction)
  }

  const months = []
  const rangeStart = startMonth !== null && startMonth > firstMonth ? startMonth : firstMonth
  const cursor = parseLocalDate(`${rangeStart}-01`)
  while (cursor <= currentStart) {
    const key = toLocalDateKey(cursor).slice(0, 7)
    const monthly = byMonth.get(key)
    months.push({
      key,
      income: monthly?.income ?? null,
      expenses: monthly?.expenses ?? null,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const historicalTotals = withBalance(totals)
  const currentMonthTotals = byMonth.get(currentMonth)
  const current = currentMonthTotals && withBalance(currentMonthTotals)
  function accumulatedVariation(field: keyof typeof historicalTotals) {
    if (!current || firstMonth === currentMonth) return null

    const total = historicalTotals[field]
    return getVariation(total, total - current[field], true)
  }

  return {
    totals: historicalTotals,
    variations: {
      income: accumulatedVariation('income'),
      expenses: accumulatedVariation('expenses'),
      balance: accumulatedVariation('balance'),
      count: accumulatedVariation('count'),
    },
    months,
    periodTransactions,
  }
}
