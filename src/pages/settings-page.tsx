import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ProfileSettings } from '@/components/shared/profile-settings'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { defaultLanguage, isLanguage, saveLanguage, supportedLanguages } from '@/i18n'
import { logout, useSession } from '@/lib/session'
import { saveTheme, useTheme } from '@/lib/theme'
import { LOGIN_PATH } from '@/routes'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const session = useSession()
  const theme = useTheme()
  const [preferenceErrors, setPreferenceErrors] = useState({ language: false, theme: false })

  function signOut() {
    flushSync(() => {
      logout()
      void navigate(LOGIN_PATH, { replace: true, state: { focusAfterAuth: true } })
    })
  }

  if (!session?.active) return null

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('nav.settings')}</h1>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ProfileSettings key={session.user.email} user={session.user} />
        <div className="space-y-4">
          <Card className="space-y-4 p-4 sm:p-6">
            <h2 className="text-lg font-semibold">{t('settings.preferences.title')}</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" htmlFor="settings-language">{t('settings.preferences.language')}</label>
              <Select
                id="settings-language"
                className="w-full"
                value={i18n.resolvedLanguage ?? defaultLanguage}
                aria-describedby={preferenceErrors.language ? 'settings-language-error' : undefined}
                onChange={(event) => {
                  const language = event.currentTarget.value
                  if (isLanguage(language)) {
                    const saved = saveLanguage(language)
                    setPreferenceErrors((previous) => ({ ...previous, language: !saved }))
                  }
                }}
              >
                {supportedLanguages.map((language) => <option key={language} value={language}>{t(`settings.languages.${language}`)}</option>)}
              </Select>
              {preferenceErrors.language && <p id="settings-language-error" role="alert" className="text-sm text-negative">{t('settings.errors.storage')}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" htmlFor="settings-theme">{t('settings.preferences.theme')}</label>
              <Select
                id="settings-theme"
                className="w-full"
                value={theme}
                aria-describedby={preferenceErrors.theme ? 'settings-theme-error' : undefined}
                onChange={(event) => {
                  const nextTheme = event.currentTarget.value
                  if (nextTheme === 'light' || nextTheme === 'dark') {
                    const saved = saveTheme(nextTheme)
                    setPreferenceErrors((previous) => ({ ...previous, theme: !saved }))
                  }
                }}
              >
                <option value="dark">{t('settings.themes.dark')}</option>
                <option value="light">{t('settings.themes.light')}</option>
              </Select>
              {preferenceErrors.theme && <p id="settings-theme-error" role="alert" className="text-sm text-negative">{t('settings.errors.storage')}</p>}
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <Button aria-label={t('login.logout')} onClick={signOut}>{t('login.logout')}</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
