import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MetricCard } from '@/components/shared/metric-card'
import { TransactionRow } from '@/components/shared/transaction-row'
import { Card } from '@/components/ui/card'
import { getStatementMonthStatus, useCategories, useStatementMonths, useTransactions } from '@/lib/data'
import { formatCents, formatDate, formatPercent } from '@/lib/format'
import { getGreeting } from '@/lib/greeting'
import { getMonthSummary, getVariation } from '@/lib/month-summary'
import { useSession } from '@/lib/session'
import { pages } from '@/routes'

const metrics = [
  { field: 'income', icon: ArrowDownLeft },
  { field: 'expenses', icon: ArrowUpRight },
  { field: 'balance', icon: Wallet },
] as const

export function HomePage() {
  const { t } = useTranslation()
  const session = useSession()
  const user = session?.user
  const transactions = useTransactions()
  const calendar = useStatementMonths()
  const waitingForStatement = getStatementMonthStatus(calendar, calendar.currentMonth) !== 'imported'
  const categories = useCategories()
  const [greeting, setGreeting] = useState<ReturnType<typeof getGreeting> | null>(null)

  useLayoutEffect(() => {
    if (user) setGreeting(getGreeting(user))
  }, [user])

  const { current, previous, currentStart, previousStart, topExpenses } = getMonthSummary(transactions, new Date())
  const expenseVariation = getVariation(current.expenses, previous.expenses, previous.hasData)
  const previousMonth = formatDate(previousStart, { month: 'long' })
  const previousImported = getStatementMonthStatus(calendar, calendar.previousMonth) === 'imported'
  const summary = !previousImported
    ? t('home.summary.previousPending', { month: previousMonth })
    : expenseVariation === null
    ? t('home.summary.noComparison', { month: previousMonth })
    : t(expenseVariation === 0 ? 'home.summary.equal' : expenseVariation > 0 ? 'home.summary.more' : 'home.summary.less', {
        month: previousMonth,
        percent: formatPercent(Math.abs(expenseVariation)),
      })
  const balanceTone = current.balance > 0 ? 'positive' : current.balance < 0 ? 'negative' : 'neutral'

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting && user ? t(greeting, { name: user.name }) : t('nav.home')}
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {formatDate(currentStart, { month: 'long', year: 'numeric' })}
        </p>
      </header>

      {waitingForStatement ? (
        <Card className="space-y-3 px-4 py-5 sm:px-5">
          <h2 className="text-base font-semibold">{t('home.pending.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('home.pending.description')}</p>
          <Link className="inline-flex min-h-11 items-center rounded-md border border-input px-4 text-sm font-medium text-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" to={pages.import.to}>
            {t('nav.import')}
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
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

          <p className="text-sm text-muted-foreground">{summary}</p>

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
        </>
      )}
    </div>
  )
}
