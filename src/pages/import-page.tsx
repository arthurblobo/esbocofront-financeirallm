import { LoaderCircle } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { CategoryManager } from '@/components/shared/category-manager'
import { DonutChart } from '@/components/shared/donut-chart'
import { StatementUpload } from '@/components/shared/statement-upload'
import { TransactionRow } from '@/components/shared/transaction-row'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  assignTransactionCategory, getCategoryLabel, getStatementMonthStatus, startStatementImport,
  UNCATEGORIZED_ID, useCategories, useStatementMonths, useTransactions, type Category, type Transaction,
} from '@/lib/data'
import { toLocalDateKey } from '@/lib/dates'
import { getExpenseSegments } from '@/lib/expense-segments'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const selectClass = 'min-h-11 max-w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring'

function CategoryAssignment({ transaction, categories }: { transaction: Transaction; categories: readonly Category[] }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState('')
  const id = `assignment-${transaction.id}`

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const row = event.currentTarget.closest('li')
    if (assignTransactionCategory(transaction.id, selected)) row?.focus()
  }

  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={submit}>
      <div className="min-w-0 space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium">{t('statement.assignment.label')}</label>
        <select id={id} className={selectClass} value={selected} onChange={(event) => setSelected(event.currentTarget.value)}>
          <option value="">{t('statement.assignment.choose')}</option>
          {categories.filter((category) => category.id !== UNCATEGORIZED_ID).map((category) => (
            <option key={category.id} value={category.id}>{getCategoryLabel(category, t)}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={!selected} aria-label={t('statement.assignment.apply')}>{t('statement.assignment.apply')}</Button>
    </form>
  )
}

export function ImportPage() {
  const { t } = useTranslation()
  const calendar = useStatementMonths()
  const transactions = useTransactions()
  const categories = useCategories()
  const [requestedMonth, setRequestedMonth] = useState(calendar.currentMonth)
  const [announcement, setAnnouncement] = useState('')
  const startedUploads = useRef(new Set<string>())
  const detailsHeading = useRef<HTMLHeadingElement>(null)
  const chartHeading = useRef<HTMLHeadingElement>(null)
  const selectedMonth = calendar.available.has(requestedMonth) ? requestedMonth : calendar.currentMonth
  const selectedYear = Number(selectedMonth.slice(0, 4))
  const currentYear = Number(calendar.currentMonth.slice(0, 4))
  const firstYear = Number(calendar.firstMonth.slice(0, 4))
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, index) => currentYear - index)
  const selectedStatus = getStatementMonthStatus(calendar, selectedMonth)
  const monthLabel = formatDate(`${selectedMonth}-01`, { month: 'long', year: 'numeric' })
  const monthTransactions = transactions.filter(({ date }) => date.startsWith(selectedMonth))
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const segments = getExpenseSegments(monthTransactions, categories, t)

  useLayoutEffect(() => {
    const completed = [...startedUploads.current].filter((month) => getStatementMonthStatus(calendar, month) === 'imported')
    if (!completed.length) return

    completed.forEach((month) => startedUploads.current.delete(month))
    setAnnouncement(completed.map((month) => t('statement.upload.complete', {
      month: formatDate(`${month}-01`, { month: 'long', year: 'numeric' }),
    })).join(' '))
    if (completed.includes(selectedMonth)) chartHeading.current?.focus()
  }, [calendar, selectedMonth, t])

  function selectYear(year: number) {
    setRequestedMonth(year === currentYear ? calendar.currentMonth : toLocalDateKey(new Date(year, 11, 1)).slice(0, 7))
  }

  function upload() {
    if (!startStatementImport(selectedMonth)) return

    startedUploads.current.add(selectedMonth)
    setAnnouncement(t('statement.upload.processing'))
    detailsHeading.current?.focus()
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('nav.import')}</h1>

      <Card className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t('statement.months.title')}</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" htmlFor="statement-year">{t('statement.months.year')}</label>
            <select id="statement-year" className={selectClass} value={selectedYear} onChange={(event) => selectYear(Number(event.currentTarget.value))}>
              {years.map((year) => <option key={year} value={year}>{formatDate(new Date(year, 0, 1), { year: 'numeric' })}</option>)}
            </select>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => {
            const date = new Date(selectedYear, index, 1)
            const month = toLocalDateKey(date).slice(0, 7)
            const label = formatDate(date, { month: 'long' })
            const status = getStatementMonthStatus(calendar, month)
            const disabled = status === 'unavailable' || status === 'future'
            const tooltipId = `statement-tooltip-${month}`
            const shownStatus = status === 'future' ? 'unavailable' : status
            const active = month === selectedMonth
            return (
              <li key={month} className="group relative min-w-0">
                <button
                  type="button"
                  aria-disabled={disabled || undefined}
                  aria-pressed={active}
                  aria-describedby={disabled ? tooltipId : undefined}
                  className={cn(
                    'flex min-h-18 w-full flex-col items-start justify-center gap-1 rounded-md border border-input px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    disabled ? 'cursor-not-allowed text-muted-foreground' : 'hover:bg-muted',
                    active && 'border-primary bg-accent text-accent-foreground',
                  )}
                  onClick={() => { if (!disabled) setRequestedMonth(month) }}
                >
                  <span className="wrap-break-word font-semibold capitalize">{label}</span>
                  <span className={cn('wrap-break-word text-xs', status === 'imported' ? 'text-positive' : 'text-muted-foreground')}>
                    {t(`statement.status.${shownStatus}`)}
                  </span>
                </button>
                {disabled && (
                  <span
                    id={tooltipId}
                    role="tooltip"
                    className="pointer-events-none absolute inset-x-0 top-full z-10 mt-1 rounded-md border border-input bg-popover px-2 py-1.5 text-xs text-popover-foreground opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                  >
                    {t(status === 'future' ? 'statement.months.future' : 'statement.months.unavailable')}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <CategoryManager />

      <p role="status" className="sr-only">{announcement}</p>
      <section aria-labelledby="statement-details-title" className="space-y-4">
        <h2 id="statement-details-title" ref={detailsHeading} tabIndex={-1} className="rounded-sm text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {t('statement.details.title', { month: monthLabel })}
        </h2>
        {selectedStatus === 'pending' && <StatementUpload key={selectedMonth} onAccept={upload} />}
        {selectedStatus === 'processing' && (
          <Card className="flex items-center gap-3 px-4 py-6 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-5 shrink-0 text-primary motion-safe:animate-spin" />
            {t('statement.upload.processing')}
          </Card>
        )}
        {selectedStatus === 'imported' && (
          <>
            <Card className="space-y-4 px-4 py-4 sm:px-5">
              <h3 ref={chartHeading} tabIndex={-1} className="rounded-sm text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {t('statement.details.chart')}
              </h3>
              <DonutChart segments={segments} totalLabel={t('statement.details.total')} emptyLabel={t('statement.details.noExpenses')} />
            </Card>
            <Card className="space-y-3 px-4 py-4 sm:px-5">
              <h3 className="text-base font-semibold">{t('statement.details.transactions')}</h3>
              <ul className="space-y-2">
                {monthTransactions.map((transaction) => {
                  const unidentified = transaction.categoryId === UNCATEGORIZED_ID
                  return (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      category={transaction.categoryId === null ? undefined : categoryById.get(transaction.categoryId)}
                      highlighted={unidentified}
                      actions={unidentified ? <CategoryAssignment transaction={transaction} categories={categories} /> : undefined}
                    />
                  )
                })}
              </ul>
            </Card>
          </>
        )}
      </section>
    </div>
  )
}
