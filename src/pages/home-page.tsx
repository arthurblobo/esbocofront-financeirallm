import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert } from '@/components/shared/alert'
import { MetricCard } from '@/components/shared/metric-card'
import { TransactionRow } from '@/components/shared/transaction-row'
import { Card } from '@/components/ui/card'
import { getStatementMonthStatus, useCategories, useStatementMonths, useTransactions } from '@/lib/data'
import { parseLocalDate } from '@/lib/dates'
import { formatCents, formatDate, formatPercent } from '@/lib/format'
import { getGreeting } from '@/lib/greeting'
import { getMonthSummary, getVariation } from '@/lib/month-summary'
import { useSession } from '@/lib/session'
import { getImportMonthLink } from '@/routes'

const metrics = [
  { field: 'income', icon: ArrowDownLeft },
  { field: 'expenses', icon: ArrowUpRight },
  { field: 'balance', icon: Wallet },
] as const

const monthFormat = { month: 'long', year: 'numeric' } as const

export function HomePage() {
  const { t } = useTranslation()
  const user = useSession()?.user
  const transactions = useTransactions()
  const calendar = useStatementMonths()
  const categories = useCategories()
  const [greeting, setGreeting] = useState<ReturnType<typeof getGreeting> | null>(null)

  useLayoutEffect(() => {
    if (user) setGreeting(getGreeting(user))
  }, [user])

  const currentImported = getStatementMonthStatus(calendar, calendar.currentMonth) === 'imported'
  const previousImported = getStatementMonthStatus(calendar, calendar.previousMonth) === 'imported'
  const summaryMonth = [...calendar.available].reverse().find((month) => getStatementMonthStatus(calendar, month) === 'imported')
  const referenceMonth = summaryMonth ?? calendar.currentMonth
  const { current, previous, previousStart, topExpenses } = getMonthSummary(transactions, parseLocalDate(`${referenceMonth}-01`))
  const expenseVariation = getVariation(current.expenses, previous.expenses, previous.hasData)
  const comparisonMonth = formatDate(previousStart, { month: 'long' })
  const summary = expenseVariation === null
    ? t('home.summary.noComparison', { month: comparisonMonth })
    : t(expenseVariation === 0 ? 'home.summary.equal' : expenseVariation > 0 ? 'home.summary.more' : 'home.summary.less', {
        month: comparisonMonth,
        percent: formatPercent(Math.abs(expenseVariation)),
      })
  const balanceTone = current.balance > 0 ? 'positive' : current.balance < 0 ? 'negative' : 'neutral'
  const currentMonth = formatDate(`${calendar.currentMonth}-01`, monthFormat)
  const previousMonth = formatDate(`${calendar.previousMonth}-01`, monthFormat)

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting && user ? t(greeting, { name: user.name }) : t('nav.home')}
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {formatDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>

      {!summaryMonth && (
        <Card className="space-y-2 px-4 py-5 sm:px-5">
          <h2 className="text-base font-semibold">{t('home.pending.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('home.pending.description')}</p>
        </Card>
      )}
      {!currentImported && (
        <Alert
          variant="warning"
          text={t('home.importCurrent', { month: currentMonth })}
          action={{ label: t('statement.importMonth', { month: currentMonth }), to: getImportMonthLink(calendar.currentMonth) }}
        />
      )}
      {!previousImported && (
        <Alert
          variant="warning"
          text={t('home.summary.previousPending', { month: previousMonth })}
          action={{ label: t('statement.importMonth', { month: previousMonth }), to: getImportMonthLink(calendar.previousMonth) }}
        />
      )}

      {summaryMonth && (
        <section className="space-y-4" aria-labelledby={!currentImported ? "home-summary-title" : undefined}>
          {!currentImported && (
            <h2 id="home-summary-title" className="text-lg font-semibold">
              {t('home.summary.title', { month: formatDate(`${summaryMonth}-01`, monthFormat) })}
            </h2>
          )}
          <div className="grid gap-3 lg:grid-cols-3">
            {metrics.map(({ field, icon }) => (
              <MetricCard
                key={field}
                title={t(`home.metrics.${field}`)}
                icon={icon}
                value={formatCents(current[field])}
                valueTone={field === 'balance' ? balanceTone : 'neutral'}
                variation={getVariation(current[field], previous[field], previous.hasData)}
                variationTone={field === 'expenses' ? 'lowerIsBetter' : 'higherIsBetter'}
              />
            ))}
          </div>

          {(!currentImported || previousImported) && <p className="text-sm text-muted-foreground">{summary}</p>}

          <Card className="px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold">{t('home.topExpenses.title')}</h2>
            {topExpenses.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t('home.topExpenses.empty')}</p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {topExpenses.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    category={categories.find(({ id }) => id === transaction.categoryId)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </section>
      )}
    </div>
  )
}
