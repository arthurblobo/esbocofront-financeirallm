import { Pie, PieChart, ResponsiveContainer } from 'recharts'

import { formatCents, formatPercent } from '@/lib/format'

export type DonutSegment = {
  id: string
  label: string
  amountInCents: number
  color: string
}

type DonutChartProps = {
  segments: readonly DonutSegment[]
  totalLabel: string
  emptyLabel: string
}

export function DonutChart({ segments, totalLabel, emptyLabel }: DonutChartProps) {
  const data = segments.map((segment) => ({ ...segment, fill: segment.color }))
  const total = data.reduce((sum, segment) => sum + segment.amountInCents, 0)

  if (!total) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>

  return (
    <div className="@container">
      <div className="grid items-center gap-4 @xl:grid-cols-[minmax(14rem,1fr)_minmax(0,1fr)]">
        <figure className="relative mx-auto w-full max-w-64">
          <div className="aspect-square w-full" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer={false}>
                <Pie
                  data={data}
                  dataKey="amountInCents"
                  nameKey="label"
                  innerRadius="75%"
                  outerRadius="98%"
                  stroke="var(--card)"
                  strokeWidth={2}
                  isAnimationActive={false}
                  rootTabIndex={-1}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-sm text-muted-foreground">{totalLabel}</span>
            <strong className="text-xl tabular-nums">{formatCents(total)}</strong>
          </figcaption>
        </figure>
        <ul className="min-w-0 divide-y divide-border">
          {data.map(({ id, label, color, amountInCents }) => (
            <li key={id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 wrap-break-word">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="min-w-0">{label}</span>
              </span>
              <span className="flex flex-wrap items-baseline justify-end gap-x-2 text-right tabular-nums @xl:block">
                {formatCents(amountInCents)}
                <span className="block text-xs text-muted-foreground">{formatPercent(amountInCents / total)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
