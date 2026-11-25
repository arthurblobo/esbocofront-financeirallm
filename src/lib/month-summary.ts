import type { Transaction } from './data'
import { parseLocalDate } from './dates'

function getMonthTotals(transactions: readonly Transaction[], start: Date, end: Date) {
  let income = 0
  let expenses = 0
  let hasData = false
  const expenseTransactions: Transaction[] = []

  for (const transaction of transactions) {
    const date = parseLocalDate(transaction.date)
    if (date < start || date >= end) continue

    hasData = true
    if (transaction.type === 'income') {
      income += transaction.amountInCents
    } else {
      expenses += transaction.amountInCents
      expenseTransactions.push(transaction)
    }
  }

  return { income, expenses, balance: income - expenses, hasData, expenseTransactions }
}

export function getVariation(current: number, previous: number, previousHasData: boolean) {
  return previousHasData && previous !== 0 ? (current - previous) / Math.abs(previous) : null
}

export function getMonthSummary(transactions: readonly Transaction[], today: Date) {
  const year = today.getFullYear()
  const month = today.getMonth()
  const previousStart = new Date(year, month - 1, 1)
  const currentStart = new Date(year, month, 1)
  const nextStart = new Date(year, month + 1, 1)
  const current = getMonthTotals(transactions, currentStart, nextStart)
  const previous = getMonthTotals(transactions, previousStart, currentStart)

  return {
    currentStart,
    previousStart,
    current,
    previous,
    topExpenses: current.expenseTransactions
      .sort((a, b) => b.amountInCents - a.amountInCents)
      .slice(0, 5),
  }
}
