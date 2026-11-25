import type { TFunction } from 'i18next'
import type ptBR from '@/i18n/locales/pt-BR.json'
import { categoryPalette } from '@/lib/category-palette'

export type CategoryId = string
type DefaultCategoryLabelKey = `categories.${keyof typeof ptBR.categories}`

export type Category = { id: CategoryId; color: string } & (
  | { labelKey: DefaultCategoryLabelKey; name?: string }
  | { labelKey?: never; name: string }
)

export const UNCATEGORIZED_ID = 'uncategorized'

export const defaultCategories: readonly Category[] = [
  { id: 'food', labelKey: 'categories.food', color: categoryPalette.violet },
  { id: 'housing', labelKey: 'categories.housing', color: categoryPalette.blue },
  { id: 'transport', labelKey: 'categories.transport', color: categoryPalette.teal },
  { id: 'health', labelKey: 'categories.health', color: categoryPalette.rose },
  { id: 'leisure', labelKey: 'categories.leisure', color: categoryPalette.amber },
  { id: 'subscriptions', labelKey: 'categories.subscriptions', color: categoryPalette.pink },
  { id: 'education', labelKey: 'categories.education', color: categoryPalette.olive },
  { id: UNCATEGORIZED_ID, labelKey: 'categories.uncategorized', color: categoryPalette.slate },
]

export function getCategoryLabel(category: Category, t: TFunction): string {
  if (category.labelKey === undefined) return category.name
  return category.name ?? t(category.labelKey)
}
