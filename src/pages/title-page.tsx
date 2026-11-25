import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import type { PageTitle } from '@/routes'

export function TitlePage({ title }: { title: PageTitle }) {
  const { t } = useTranslation()

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t(title)}</h1>
    </Card>
  )
}
