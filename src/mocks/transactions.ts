import type { CategoryId } from './categories'

type TransactionKind =
  | { type: 'income'; categoryId: null }
  | { type: 'expense'; categoryId: CategoryId }

type Transaction = TransactionKind & {
  id: string
  date: string
  amountInCents: number
}

type MonthlyEntry = TransactionKind & {
  day: number
  baseInCents: number
  variationInCents: number
}

const monthlyEntries: MonthlyEntry[] = [
  { day: 1, type: 'income', categoryId: null, baseInCents: 650000, variationInCents: 2500 },
  { day: 2, type: 'expense', categoryId: 'housing', baseInCents: 190000, variationInCents: 1000 },
  { day: 4, type: 'expense', categoryId: 'food', baseInCents: 37000, variationInCents: 2090 },
  { day: 5, type: 'expense', categoryId: 'transport', baseInCents: 22000, variationInCents: 1730 },
  { day: 7, type: 'expense', categoryId: 'health', baseInCents: 18000, variationInCents: 1310 },
  { day: 8, type: 'expense', categoryId: 'subscriptions', baseInCents: 8990, variationInCents: 0 },
  { day: 9, type: 'expense', categoryId: 'education', baseInCents: 42000, variationInCents: 0 },
  { day: 11, type: 'expense', categoryId: 'leisure', baseInCents: 15000, variationInCents: 1870 },
]
const unidentified: MonthlyEntry = {
  day: 13,
  type: 'expense',
  categoryId: 'uncategorized',
  baseInCents: 7490,
  variationInCents: 420,
}

export const transactions: Transaction[] = Array.from({ length: 18 }, (_, month) => {
  const entries = month % 3 === 0 ? [...monthlyEntries, unidentified] : monthlyEntries

  return entries.map(({ day, baseInCents, variationInCents, ...kind }, index) => ({
    ...kind,
    id: `mock-${month + 1}-${index + 1}`,
    date: new Date(Date.UTC(2025, 5 + month, day)).toISOString().slice(0, 10),
    amountInCents: baseInCents + ((month * 7 + index) % 11) * variationInCents,
  }))
}).flat()
