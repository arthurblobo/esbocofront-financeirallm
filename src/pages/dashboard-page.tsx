import { ArrowDownLeft, ArrowUpRight, Receipt, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { DonutChart } from '@/components/shared/donut-chart'
import { LineChart } from '@/components/shared/line-chart'
import { MetricCard } from '@/components/shared/metric-card'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { dashboardPeriods, getDashboardData, type DashboardPeriod } from '@/lib/dashboard'
import { useCategories, useTransactions } from '@/lib/data'
import { getCategoryTotals } from '@/lib/category-totals'
import { formatCents, formatDate, formatNumber } from '@/lib/format'
import { readStorage, writeStorage } from '@/lib/storage'
import { pages } from '@/routes'

const periodKey = 'dashboardPeriod'
const metrics = [
  { field: 'income', icon: ArrowDownLeft, variationTone: 'higherIsBetter' },
  { field: 'expenses', icon: ArrowUpRight, variationTone: 'lowerIsBetter' },
  { field: 'balance', icon: Wallet, variationTone: 'higherIsBetter' },
  { field: 'count', icon: Receipt, variationTone: 'neutral' },
] as const

function readPeriod(value: string | null): DashboardPeriod {
  return dashboardPeriods.find((period) => period === value) ?? '6'
}

export function DashboardPage() {
  const { t } = useTranslation()
  const transactions = useTransactions()
  const categories = useCategories()
  const [period, setPeriod] = useState(() => readPeriod(readStorage(periodKey)))
  const { totals, variations, months, periodTransactions } = getDashboardData(transactions, period, new Date())
  const segments = getCategoryTotals(periodTransactions, categories, t)
  const balanceTone = totals.balance > 0 ? 'positive' : totals.balance < 0 ? 'negative' : 'neutral'
  const points = months.map(({ key, income, expenses }) => ({
    key,
    label: formatDate(`${key}-01`, { month: 'long', year: 'numeric' }),
    tickLabel: formatDate(`${key}-01`, { month: 'short', year: 'numeric' }),
    values: { income, expenses },
  }))
  const periodRange = t('dashboard.period.range', { start: points[0].tickLabel, end: points[points.length - 1].tickLabel })
  const missingMonths = months.filter(({ income, expenses }) => income === null && expenses === null).length

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('nav.dashboard')}</h1>
      <div className="grid gap-3 min-[440px]:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ field, icon, variationTone }) => (
          <MetricCard
            key={field}
            title={t(`dashboard.metrics.${field}`)}
            icon={icon}
            value={field === 'count' ? formatNumber(totals[field]) : formatCents(totals[field])}
            valueTone={field === 'balance' ? balanceTone : 'neutral'}
            variation={variations[field]}
            variationTone={variationTone}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="flex min-w-0 flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="text-base font-semibold">{t('dashboard.trend.title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{periodRange}</p>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <label className="text-sm font-medium" htmlFor="dashboard-period">{t('dashboard.period.label')}</label>
              <Select
                id="dashboard-period"
                className="min-w-0"
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
              </Select>
            </div>
          </div>
          <LineChart
            points={points}
            series={[
              { key: 'income', label: t('home.metrics.income'), color: 'var(--primary)' },
              { key: 'expenses', label: t('home.metrics.expenses'), color: 'var(--negative)', dash: '5 4' },
            ]}
            formatValue={formatCents}
            formatTick={(value) => formatCents(value, 'auto', 'compact')}
            note={missingMonths > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('dashboard.trend.missingCount', { count: missingMonths })}{' '}
                <Link to={pages.import.to} className="rounded-sm font-medium text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ring">
                  {t('nav.import')}
                </Link>
              </p>
            )}
            labels={{
              table: t('dashboard.trend.table'),
              column: t('dashboard.trend.month'),
              missing: t('dashboard.trend.missing'),
              empty: t('dashboard.trend.empty'),
            }}
          />
        </Card>
        <Card className="min-w-0 space-y-4 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-semibold">{t('statement.details.chart')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{periodRange}</p>
          </div>
          <DonutChart segments={segments} totalLabel={t('statement.details.total')} emptyLabel={t('statement.details.noExpenses')} />
        </Card>
      </div>
    </div>
  )
}
