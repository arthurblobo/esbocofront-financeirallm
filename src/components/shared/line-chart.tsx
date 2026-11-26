import type { ReactNode } from 'react'
import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useReducedMotion } from '@/lib/motion'

type Point<Key extends string> = {
  key: string
  label: string
  tickLabel: string
  values: Readonly<Record<Key, number | null>>
}

type Series<Key extends string> = { key: Key; label: string; color: string; dash?: string }

type LineChartProps<Key extends string> = {
  points: readonly Point<Key>[]
  series: readonly Series<Key>[]
  formatValue: (value: number) => string
  formatTick: (value: number) => string
  note?: ReactNode
  labels: { table: string; column: string; missing: string; empty: string }
}

function ChartTooltip<Key extends string>({
  point, series, formatValue, missing,
}: {
  point: Point<Key>
  series: readonly Series<Key>[]
  formatValue: (value: number) => string
  missing: string
}) {
  return (
    <div className="space-y-1 rounded-lg border border-input bg-popover px-3 py-2 text-xs text-popover-foreground">
      <p className="font-semibold">{point.label}</p>
      {series.every(({ key }) => point.values[key] === null) ? (
        <p>{missing}</p>
      ) : (
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1">
          {series.map(({ key, label }) => {
            const value = point.values[key]
            return (
              <div key={key} className="contents">
                <dt>{label}</dt>
                <dd className="text-right tabular-nums">{value === null ? missing : formatValue(value)}</dd>
              </div>
            )
          })}
        </dl>
      )}
    </div>
  )
}

export function LineChart<Key extends string>({ points, series, formatValue, formatTick, labels, note }: LineChartProps<Key>) {
  const reducedMotion = useReducedMotion()
  const pointByKey = new Map(points.map((point) => [point.key, point]))
  const hasValues = points.some(({ values }) => series.some(({ key }) => values[key] !== null))
  const axisTick = { fill: 'var(--muted-foreground)', fontSize: 11 }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {hasValues ? (
        <>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {series.map(({ key, label, color, dash }) => (
              <li key={key} className="flex items-center gap-2">
                <svg aria-hidden="true" className="h-2 w-5" viewBox="0 0 20 8">
                  <line x1="0" x2="20" y1="4" y2="4" stroke={color} strokeWidth={2} strokeDasharray={dash} />
                </svg>
                {label}
              </li>
            ))}
          </ul>
          <div className="relative min-h-64 min-w-0 flex-1 sm:min-h-80" aria-hidden="true">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={points} accessibilityLayer={false} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="key"
                    tickFormatter={(key: string) => pointByKey.get(key)?.tickLabel ?? ''}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={14}
                    interval="equidistantPreserveStart"
                    padding={{ left: 12, right: 24 }}
                  />
                  <YAxis width={70} tickCount={5} tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatTick} />
                  <Tooltip
                    cursor={{ stroke: 'var(--input)', strokeDasharray: '4 4' }}
                    filterNull={false}
                    content={({ active, label }) => {
                      const point = typeof label === 'string' ? pointByKey.get(label) : undefined
                      return active && point
                        ? <ChartTooltip point={point} series={series} formatValue={formatValue} missing={labels.missing} />
                        : null
                    }}
                  />
                  {series.map(({ key, label, color, dash }) => (
                    <Line
                      key={key}
                      name={label}
                      dataKey={(point: Point<Key>) => point.values[key]}
                      stroke={color}
                      strokeWidth={2}
                      strokeDasharray={dash}
                      dot={{ r: 3, fill: color, stroke: 'var(--card)', strokeWidth: 1, strokeDasharray: 'none' }}
                      activeDot={{ strokeDasharray: 'none' }}
                      connectNulls={false}
                      isAnimationActive={!reducedMotion} animationDuration={450}
                    />
                  ))}
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      )}
      {note}
      <details className="border-t border-border pt-3 text-sm">
        <summary className="w-fit rounded-sm py-1 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring">
          {labels.table}
        </summary>
        <table className="mt-2 w-full border-collapse text-left text-xs sm:text-sm">
          <caption className="sr-only">{labels.table}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 pr-2">{labels.column}</th>
              {series.map(({ key, label }) => <th key={key} scope="col" className="py-2 pl-2 text-right">{label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {points.map(({ key, label, values }) => (
              <tr key={key}>
                <th scope="row" className="py-2 pr-2 font-medium">{label}</th>
                {series.every(({ key: field }) => values[field] === null) ? (
                  <td colSpan={series.length} className="py-2 pl-2 text-right text-muted-foreground">{labels.missing}</td>
                ) : series.map(({ key: field }) => {
                  const value = values[field]
                  return <td key={field} className="py-2 pl-2 text-right tabular-nums">{value === null ? labels.missing : formatValue(value)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
