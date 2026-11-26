import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { getStatementMonthStatus } from '@/lib/data'
import { useDismissibleTooltip } from '@/lib/use-dismissible-tooltip'
import { cn } from '@/lib/utils'

const monthStyles = {
  imported: 'border-positive/40',
  pending: 'border-warning-foreground/45 bg-warning text-warning-foreground',
  processing: 'border-primary/50 bg-accent text-accent-foreground',
  unavailable: 'border-border border-dashed bg-muted text-muted-foreground',
  future: 'border-border bg-muted text-muted-foreground',
} as const

type StatementMonthProps = {
  label: string
  status: ReturnType<typeof getStatementMonthStatus>
  active: boolean
  onSelect: () => void
}

export function StatementMonth({ label, status, active, onSelect }: StatementMonthProps) {
  const { t } = useTranslation()
  const tooltipId = useId()
  const disabled = status === 'unavailable' || status === 'future'
  const shownStatus = status === 'unavailable' ? 'noData' : status
  const tooltip = useDismissibleTooltip(disabled)

  return (
    <li
      className="relative min-w-0"
      {...tooltip.hoverProps}
    >
      <button
        type="button"
        aria-disabled={disabled || undefined}
        aria-pressed={active}
        aria-describedby={disabled ? tooltipId : undefined}
        className={cn(
          'flex min-h-18 w-full flex-col items-start justify-center gap-1 rounded-md border border-input px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          monthStyles[status],
          !disabled && 'hover:border-primary',
          active && 'ring-2 ring-primary',
        )}
        {...tooltip.focusProps}
        onClick={(event) => {
          if (disabled) event.currentTarget.focus()
          else onSelect()
        }}
      >
        <span className="wrap-break-word font-semibold capitalize">{label}</span>
        <span className={cn('wrap-break-word text-xs', status === 'imported' && 'text-positive')}>
          {t(`statement.status.${shownStatus}`)}
        </span>
      </button>
      {disabled && (
        <div hidden={!tooltip.visible} className="absolute inset-x-0 top-full z-10 pt-1">
          <span id={tooltipId} role="tooltip" className="block rounded-md border border-input bg-popover px-2 py-1.5 text-xs text-popover-foreground">
            {t(status === 'future' ? 'statement.months.future' : 'statement.months.noData')}
          </span>
        </div>
      )}
    </li>
  )
}
