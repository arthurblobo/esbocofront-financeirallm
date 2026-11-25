import { ArrowDownLeft, ArrowUpRight, Receipt, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DonutChart } from '@/components/shared/donut-chart'
import { LineChart } from '@/components/shared/line-chart'
import { MetricCard } from '@/components/shared/metric-card'
import { Card } from '@/components/ui/card'
import { dashboardPeriods, getDashboardData, type DashboardPeriod } from '@/lib/dashboard'
import { useCategories, useTransactions } from '@/lib/data'
import { getExpenseSegments } from '@/lib/expense-segments'
import { formatCents, formatDate, formatNumber } from '@/lib/format'
import { getVariation } from '@/lib/month-summary'
import { readStorage, writeStorage } from '@/lib/storage'

const periodKey = 'dashboardPeriod'
const metrics = [
  { field: 'income', icon: ArrowDownLeft },
  { field: 'expenses', icon: ArrowUpRight },
  { field: 'balance', icon: Wallet },
  { field: 'count', icon: Receipt },
] as const

function readPeriod(value: string | null): DashboardPeriod {
  return dashboardPeriods.find((period) => period === value) ?? '6'
}

export function DashboardPage() {
  const { t } = useTranslation()
  const transactions = useTransactions()
  const categories = useCategories()
  const [period, setPeriod] = useState(() => readPeriod(readStorage(periodKey)))
  const { totals, current, previous, months, periodTransactions } = getDashboardData(transactions, period, new Date())
  const segments = getExpenseSegments(periodTransactions, categories, t)
  const balanceTone = totals.balance > 0 ? 'positive' : totals.balance < 0 ? 'negative' : 'neutral'
  const points = months.map(({ key, income, expenses }) => ({
    key,
    label: formatDate(`${key}-01`, { month: 'long', year: 'numeric' }),
    tickLabel: formatDate(`${key}-01`, { month: 'short', year: '2-digit' }),
    values: { income, expenses },
  }))

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('nav.dashboard')}</h1>
      <div className="grid gap-3 min-[440px]:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ field, icon }) => (
          <MetricCard
            key={field}
            title={t(`dashboard.metrics.${field}`)}
            icon={icon}
            value={field === 'count' ? formatNumber(totals[field]) : formatCents(totals[field])}
            valueTone={field === 'expenses' && totals.expenses > 0 ? 'negative' : field === 'balance' ? balanceTone : 'neutral'}
            variation={current && previous ? getVariation(current[field], previous[field], true) : null}
            variationTone={field === 'expenses' ? 'lowerIsBetter' : 'higherIsBetter'}
          />
        ))}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="min-w-0 space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 className="text-base font-semibold">{t('dashboard.trend.title')}</h2>
            <div className="flex min-w-0 items-center gap-2">
              <label className="text-sm font-medium" htmlFor="dashboard-period">{t('dashboard.period.label')}</label>
              <select
                id="dashboard-period"
                className="min-h-11 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                value={period}
                onChange={(event) => {
                  const next = readPeriod(event.currentTarget.value)
                  setPeriod(next)
                  writeStorage(periodKey, next)
                }}
              >
                {dashboardPeriods.map((option) => (
                  <option key={option} value={option}>{t(`dashboard.period.options.${option}`)}</option>
                ))}
              </select>
            </div>
          </div>
          <LineChart
            points={points}
            series={[
              { key: 'income', label: t('home.metrics.income'), color: 'var(--primary)' },
              { key: 'expenses', label: t('home.metrics.expenses'), color: 'var(--negative)', dash: '5 4' },
            ]}
            formatValue={formatCents}
            formatTick={(value) => formatCents(value, 'compact')}
            labels={{
              table: t('dashboard.trend.table'),
              column: t('dashboard.trend.month'),
              missing: t('dashboard.trend.missing'),
              empty: t('dashboard.trend.empty'),
            }}
          />
        </Card>
        <Card className="min-w-0 space-y-4 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold">{t('statement.details.chart')}</h2>
          <DonutChart segments={segments} totalLabel={t('statement.details.total')} emptyLabel={t('statement.details.noExpenses')} />
        </Card>
      </div>
    </div>
  )
}
