import { i18n, defaultLanguage } from '@/i18n'
import { parseLocalDate } from './dates'

export function formatCents(amountInCents: number): string {
  return new Intl.NumberFormat(i18n.resolvedLanguage ?? defaultLanguage, {
    style: 'currency',
    currency: 'BRL',
    currencyDisplay: 'narrowSymbol',
    useGrouping: 'always',
  }).format(amountInCents / 100)
}

export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? defaultLanguage, options)
    .format(typeof date === 'string' ? parseLocalDate(date) : date)
}
