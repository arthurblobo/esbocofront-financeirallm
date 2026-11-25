import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { getCategoryLabel, useCategories, useTransactions } from '@/lib/data'
import { formatCents, formatDate, formatPercent } from '@/lib/format'
import { getGreeting } from '@/lib/greeting'
import { getMonthSummary, getVariation } from '@/lib/month-summary'
import type { User } from '@/lib/session'

const metrics = [
  { field: 'income', icon: ArrowDownLeft },
  { field: 'expenses', icon: ArrowUpRight },
  { field: 'balance', icon: Wallet },
] as const

function amountColor(amount: number) {
  if (amount > 0) return 'text-positive'
  if (amount < 0) return 'text-negative'
  return 'text-foreground'
}

export function HomePage({ user }: { user: User }) {
  const { t } = useTranslation()
  const transactions = useTransactions()
  const categories = useCategories()
  const [greeting, setGreeting] = useState<ReturnType<typeof getGreeting> | null>(null)

  useEffect(() => {
    setGreeting(getGreeting(user))
  }, [user])

  const { current, previous, currentStart, previousStart, topExpenses } = getMonthSummary(transactions, new Date())
  const expenseVariation = getVariation(current.expenses, previous.expenses, previous.hasData)
  const previousMonth = formatDate(previousStart, { month: 'long' })
  const summary = expenseVariation === null
    ? null
    : t(expenseVariation === 0 ? 'home.summary.equal' : expenseVariation > 0 ? 'home.summary.more' : 'home.summary.less', {
        month: previousMonth,
        percent: formatPercent(Math.abs(expenseVariation)),
      })

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting ? t(greeting, { name: user.name }) : t('nav.home')}
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {formatDate(currentStart, { month: 'long', year: 'numeric' })}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ field, icon: Icon }) => {
          const balance = field === 'balance'
          const variation = getVariation(current[field], previous[field], previous.hasData)
          return (
            <Card key={field} className="space-y-2 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="min-w-0 text-sm font-medium">{t(`home.metrics.${field}`)}</h2>
                <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <p className={`wrap-break-word text-2xl font-semibold tracking-tight tabular-nums ${balance ? amountColor(current.balance) : ''}`}>
                {formatCents(current[field])}
              </p>
              {variation !== null && (
                <p className="text-sm text-muted-foreground">
                  <span className={`font-medium tabular-nums ${amountColor(variation)}`}>
                    {formatPercent(variation, 'exceptZero')}
                  </span>{' '}
                  {t('home.metrics.comparison')}
                </p>
              )}
            </Card>
          )
        })}
      </div>

      {summary && <p className="text-sm text-muted-foreground">{summary}</p>}

      <Card className="px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold">{t('home.topExpenses.title')}</h2>
        {topExpenses.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('home.topExpenses.empty')}</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {topExpenses.map((transaction) => {
              const category = categories.find(({ id }) => id === transaction.categoryId)
              return (
                <li key={transaction.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0">
                    <p className="wrap-break-word text-sm font-medium">{transaction.description}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                      {category && <span>{getCategoryLabel(category, t)}</span>}
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium tabular-nums">{formatCents(transaction.amountInCents)}</p>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
