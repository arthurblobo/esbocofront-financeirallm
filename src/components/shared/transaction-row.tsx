import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { getCategoryLabel, type Category, type Transaction } from '@/lib/data'
import { formatCents, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type TransactionRowProps = {
  transaction: Transaction
  category?: Category
  highlighted?: boolean
  actions?: ReactNode
}

export function TransactionRow({ transaction, category, highlighted, actions }: TransactionRowProps) {
  const { t } = useTranslation()

  return (
    <li
      tabIndex={-1}
      className={cn('space-y-3 rounded-sm py-3 focus-visible:outline-2 focus-visible:outline-ring', highlighted && 'rounded-md border border-primary bg-accent px-3')}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="wrap-break-word text-sm font-medium">{transaction.description}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
            {category && <span>{getCategoryLabel(category, t)}</span>}
            <span>{formatDate(transaction.date)}</span>
          </div>
        </div>
        <p className={cn('text-sm font-medium tabular-nums', transaction.type === 'income' && 'text-positive')}>
          {transaction.type === 'income'
            ? formatCents(transaction.amountInCents, 'always')
            : formatCents(-transaction.amountInCents, 'always')}
        </p>
      </div>
      {actions}
    </li>
  )
}
