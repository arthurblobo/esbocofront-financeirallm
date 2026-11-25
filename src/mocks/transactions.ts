import { toLocalDateKey } from '@/lib/dates'
import { UNCATEGORIZED_ID, type CategoryId } from './categories'

type TransactionKind =
  | { type: 'income'; categoryId: null }
  | { type: 'expense'; categoryId: CategoryId }

type Entry = TransactionKind & {
  description: string
  amountInCents: number
}

export type Transaction = Entry & { id: string; date: string }

type MonthlyEntry = Entry & { day: number }

const expenseProfiles = [
  { categoryId: 'food', descriptions: ['Supermercado BH', 'Padaria Central', 'Hortifruti'], baseCents: 16500 },
  { categoryId: 'housing', descriptions: ['Condomínio', 'Energia elétrica', 'Conta de água'], baseCents: 12500 },
  { categoryId: 'transport', descriptions: ['Uber', 'Posto Avenida', 'Recarga de transporte'], baseCents: 7900 },
  { categoryId: 'health', descriptions: ['Farmácia Popular', 'Consulta médica', 'Laboratório'], baseCents: 8900 },
  { categoryId: 'leisure', descriptions: ['Cinema', 'Livraria', 'Restaurante'], baseCents: 6100 },
  { categoryId: 'subscriptions', descriptions: ['Netflix', 'Spotify', 'Google One'], baseCents: 2500 },
  { categoryId: 'education', descriptions: ['Curso de inglês', 'Material escolar', 'Curso online'], baseCents: 11200 },
]

function generateMonth(monthStart: Date): Transaction[] {
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()
  const monthKey = toLocalDateKey(monthStart).slice(0, 7)
  const monthNumber = year * 12 + month
  const entries: MonthlyEntry[] = [
    { day: 1, type: 'income', categoryId: null, description: 'Salário', amountInCents: 630000 + (monthNumber % 9) * 6500 },
    { day: 1, type: 'expense', categoryId: UNCATEGORIZED_ID, description: `PIX ${48213 + monthNumber % 500}`, amountInCents: 3200 + (monthNumber % 11) * 460 },
    { day: 5, type: 'expense', categoryId: 'housing', description: 'Aluguel', amountInCents: 175000 },
  ]

  if (monthNumber % 3 === 0) {
    entries.push({ day: 17, type: 'income', categoryId: null, description: 'Freelance', amountInCents: 42000 + (monthNumber % 7) * 13000 })
  }
  if (monthNumber % 4 === 1) {
    entries.push({ day: 12, type: 'income', categoryId: null, description: 'Reembolso', amountInCents: 17000 + (monthNumber % 7) * 2400 })
  }
  if (month === 11) {
    entries.push({ day: 19, type: 'income', categoryId: null, description: '13º salário', amountInCents: 310000 })
  }
  if (month === 0) {
    entries.push({ day: 20, type: 'expense', categoryId: 'housing', description: 'Reforma residencial', amountInCents: 690000 })
  }

  expenseProfiles.forEach(({ categoryId, descriptions, baseCents }, profileIndex) => {
    const seed = monthNumber * (profileIndex + 3) + profileIndex * 7
    const countSeed = monthNumber + Math.floor(monthNumber / 12) + profileIndex * 3
    const count = categoryId === 'housing' ? 1 + countSeed % 4 : 2 + countSeed % 5

    for (let index = 0; index < count; index += 1) {
      entries.push({
        type: 'expense',
        categoryId,
        day: 2 + (seed + index * 7) % 27,
        description: descriptions[index % descriptions.length],
        amountInCents: Math.round(baseCents * (65 + (seed + index * 29) % 100) / 100),
      })
    }
  })

  return entries.sort((a, b) => a.day - b.day).map(({ day, ...entry }, index) => ({
    ...entry,
    id: `mock-${monthKey}-${String(index + 1).padStart(2, '0')}`,
    date: toLocalDateKey(new Date(year, month, day)),
  }))
}

export function createTransactions(today = new Date()): Transaction[] {
  const todayKey = toLocalDateKey(today)
  return Array.from({ length: 18 }, (_, index) =>
    generateMonth(new Date(today.getFullYear(), today.getMonth() - 17 + index, 1)),
  ).flat().filter(({ date }) => date <= todayKey)
}
