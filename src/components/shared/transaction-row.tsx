import { useTranslation } from 'react-i18next'

import { getCategoryLabel, type Category, type Transaction } from '@/lib/data'
import { formatCents, formatDate } from '@/lib/format'

export function TransactionRow({ transaction, category }: { transaction: Transaction; category?: Category }) {
  const { t } = useTranslation()

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
      <div className="min-w-0">
        <p className="wrap-break-word text-sm font-medium">{transaction.description}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
          {category && <span>{getCategoryLabel(category, t)}</span>}
          <span>{formatDate(transaction.date)}</span>
        </div>
      </div>
      <p className="text-sm font-medium tabular-nums">{formatCents(transaction.amountInCents)}</p>
    </li>
  )
}
