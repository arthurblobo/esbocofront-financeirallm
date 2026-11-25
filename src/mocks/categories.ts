import type { TFunction } from 'i18next'
import type ptBR from '@/i18n/locales/pt-BR.json'

export type CategoryId = string
type DefaultCategoryLabelKey = `categories.${keyof typeof ptBR.categories}`

export type Category = { id: CategoryId; color: string } & (
  | { labelKey: DefaultCategoryLabelKey; name?: string }
  | { labelKey?: never; name: string }
)

export const UNCATEGORIZED_ID = 'uncategorized'

export const defaultCategories: readonly Category[] = [
  { id: 'food', labelKey: 'categories.food', color: '#8b5cf6' },
  { id: 'housing', labelKey: 'categories.housing', color: '#3b82f6' },
  { id: 'transport', labelKey: 'categories.transport', color: '#0d9488' },
  { id: 'health', labelKey: 'categories.health', color: '#e11d48' },
  { id: 'leisure', labelKey: 'categories.leisure', color: '#d57406' },
  { id: 'subscriptions', labelKey: 'categories.subscriptions', color: '#db2777' },
  { id: 'education', labelKey: 'categories.education', color: '#649b0d' },
  { id: UNCATEGORIZED_ID, labelKey: 'categories.uncategorized', color: '#64748b' },
]

export function getCategoryLabel(category: Category, t: TFunction): string {
  if (category.labelKey === undefined) return category.name
  return category.name ?? t(category.labelKey)
}
