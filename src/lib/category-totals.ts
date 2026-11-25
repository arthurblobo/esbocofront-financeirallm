import type { TFunction } from 'i18next'

import type { DonutSegment } from '@/components/shared/donut-chart'
import { categoryPalette } from './category-palette'
import { getCategoryLabel, UNCATEGORIZED_ID, type Category, type Transaction } from './data'

export function getCategoryTotals(
  transactions: readonly Transaction[], categories: readonly Category[], t: TFunction,
): DonutSegment[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const expenses = new Map<string, DonutSegment>()
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue

    const category = categoryById.get(transaction.categoryId) ?? categoryById.get(UNCATEGORIZED_ID)
    const id = category?.id ?? UNCATEGORIZED_ID
    const previous = expenses.get(id)
    expenses.set(id, {
      id,
      label: category ? getCategoryLabel(category, t) : t('categories.uncategorized'),
      color: category?.color ?? categoryPalette.slate,
      amountInCents: (previous?.amountInCents ?? 0) + transaction.amountInCents,
    })
  }
  return [...expenses.values()].sort((a, b) => b.amountInCents - a.amountInCents)
}
