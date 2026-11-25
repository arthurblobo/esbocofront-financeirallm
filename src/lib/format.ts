import { i18n, defaultLanguage } from '@/i18n'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(i18n.resolvedLanguage ?? defaultLanguage, {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function formatDate(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? defaultLanguage, options).format(date)
}
