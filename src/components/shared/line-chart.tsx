import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
  labels: { table: string; column: string; missing: string; empty: string }
}

export function LineChart<Key extends string>({ points, series, formatValue, formatTick, labels }: LineChartProps<Key>) {
  const hasValues = points.some(({ values }) => series.some(({ key }) => values[key] !== null))
  const axisTick = { fill: 'var(--muted-foreground)', fontSize: 11 }

  return (
    <div className="space-y-4">
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
          <div className="h-64 min-w-0 sm:h-80" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={points} accessibilityLayer={false} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="tickLabel" tick={axisTick} tickLine={false} axisLine={false} minTickGap={14} interval="preserveStartEnd" padding={{ left: 10, right: 14 }} />
                <YAxis width={70} tickCount={5} tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatTick} />
                <Tooltip
                  cursor={{ stroke: 'var(--input)', strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--input)', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'var(--popover-foreground)' }}
                  formatter={(value) => typeof value === 'number' ? formatValue(value) : value}
                />
                {series.map(({ key, label, color, dash }) => (
                  <Line
                    key={key}
                    name={label}
                    dataKey={(point: Point<Key>) => point.values[key]}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={dash}
                    dot={{ r: 3, fill: color, stroke: 'var(--card)', strokeWidth: 1 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      )}
      <details className="border-t border-border pt-3 text-sm">
        <summary className="w-fit cursor-pointer rounded-sm py-1 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring">
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
