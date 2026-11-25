import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function SettingsPage({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation()

  return (
    <Card className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('nav.settings')}</h1>
      <Button aria-label={t('login.logout')} onClick={onLogout}>{t('login.logout')}</Button>
    </Card>
  )
}
