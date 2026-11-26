import { Info, TriangleAlert } from 'lucide-react'
import { Link, type To } from 'react-router-dom'

import { cn } from '@/lib/utils'

type AlertProps = {
  variant: 'warning' | 'info'
  text: string
  action?: { label: string; to: To }
}

export function Alert({ variant, text, action }: AlertProps) {
  const Icon = variant === 'warning' ? TriangleAlert : Info

  return (
    <div
      data-slot="alert"
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-sm',
        variant === 'warning' ? 'border-warning-foreground/30 bg-warning text-warning-foreground' : 'border-primary/30 bg-accent text-accent-foreground',
      )}
    >
      <div className="flex min-w-0 flex-1 basis-52 items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="wrap-break-word">{text}</p>
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex min-h-9 items-center rounded-sm font-semibold underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
