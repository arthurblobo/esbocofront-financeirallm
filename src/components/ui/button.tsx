import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5',
  {
    variants: {
      variant: {
        outline: 'border border-border bg-card text-foreground hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
)

export function Button({
  className,
  variant,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: 'outline' | 'ghost' }) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />
}
