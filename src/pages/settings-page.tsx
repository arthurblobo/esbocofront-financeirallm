import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { logout, useSession } from '@/lib/session'
import { LOGIN_PATH } from '@/routes'

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useSession()

  function signOut() {
    flushSync(() => {
      logout()
      void navigate(LOGIN_PATH, { replace: true, state: { focusAfterAuth: true } })
    })
  }

  return (
    <Card className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('nav.settings')}</h1>
      {session?.active && <Button aria-label={t('login.logout')} onClick={signOut}>{t('login.logout')}</Button>}
    </Card>
  )
}
