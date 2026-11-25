import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-11 max-w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-negative',
        className,
      )}
      {...props}
    />
  )
}
