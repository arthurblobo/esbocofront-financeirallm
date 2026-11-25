import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { getStatementMonthStatus } from '@/lib/data'
import { cn } from '@/lib/utils'

type StatementMonthProps = {
  label: string
  status: ReturnType<typeof getStatementMonthStatus>
  active: boolean
  onSelect: () => void
}

export function StatementMonth({ label, status, active, onSelect }: StatementMonthProps) {
  const { t } = useTranslation()
  const tooltipId = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const disabled = status === 'unavailable' || status === 'future'
  const shownStatus = status === 'future' ? 'unavailable' : status
  const tooltipVisible = disabled && (hovered || focused) && !dismissed

  useEffect(() => {
    if (!tooltipVisible) return

    function dismiss(event: KeyboardEvent) {
      if (event.key === 'Escape') setDismissed(true)
    }

    document.addEventListener('keydown', dismiss)
    return () => document.removeEventListener('keydown', dismiss)
  }, [tooltipVisible])

  return (
    <li
      className="relative min-w-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        if (!focused) setDismissed(false)
      }}
    >
      <button
        type="button"
        aria-disabled={disabled || undefined}
        aria-pressed={active}
        aria-describedby={disabled ? tooltipId : undefined}
        className={cn(
          'flex min-h-18 w-full flex-col items-start justify-center gap-1 rounded-md border border-input px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          disabled ? 'cursor-not-allowed text-muted-foreground' : 'hover:bg-muted',
          active && 'border-primary bg-accent text-accent-foreground',
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          if (!hovered) setDismissed(false)
        }}
        onClick={(event) => {
          if (disabled) event.currentTarget.focus()
          else onSelect()
        }}
      >
        <span className="wrap-break-word font-semibold capitalize">{label}</span>
        <span className={cn('wrap-break-word text-xs', active ? 'text-accent-foreground' : status === 'imported' ? 'text-positive' : 'text-muted-foreground')}>
          {t(`statement.status.${shownStatus}`)}
        </span>
      </button>
      {disabled && (
        <div hidden={!tooltipVisible} className="absolute inset-x-0 top-full z-10 pt-1">
          <span id={tooltipId} role="tooltip" className="block rounded-md border border-input bg-popover px-2 py-1.5 text-xs text-popover-foreground">
            {t(status === 'future' ? 'statement.months.future' : 'statement.months.unavailable')}
          </span>
        </div>
      )}
    </li>
  )
}
