import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

const toneClasses = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-foreground',
}

type MetricCardProps = {
  title: string
  icon: LucideIcon
  value: string
  valueTone?: keyof typeof toneClasses
  variation?: number | null
  comparisonLabel?: string
  noComparisonLabel?: string
  variationTone?: 'higherIsBetter' | 'lowerIsBetter' | 'neutral'
}

export function MetricCard({
  title, icon: Icon, value, valueTone = 'neutral', variation, comparisonLabel, noComparisonLabel, variationTone = 'higherIsBetter',
}: MetricCardProps) {
  const { t } = useTranslation()
  const effect = variationTone === 'neutral' ? 0 : (variation ?? 0) * (variationTone === 'lowerIsBetter' ? -1 : 1)
  const comparisonTone = effect > 0 ? 'positive' : effect < 0 ? 'negative' : 'neutral'

  return (
    <Card className="min-w-0 space-y-2 px-3 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 text-sm font-medium">{title}</h2>
        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <p className={cn('wrap-anywhere text-lg sm:text-2xl font-semibold tracking-tight tabular-nums', toneClasses[valueTone])}>
        {value}
      </p>
      {variation !== undefined && (
        <p className="text-sm text-muted-foreground">
          {variation === null ? (noComparisonLabel ?? t('home.metrics.noComparison')) : (
            <>
              <span className={cn('font-medium tabular-nums', toneClasses[comparisonTone])}>
                {formatPercent(variation, 'exceptZero')}
              </span>{' '}
              {comparisonLabel ?? t('home.metrics.comparison')}
            </>
          )}
        </p>
      )}
    </Card>
  )
}
