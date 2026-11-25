import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppLayout } from '@/components/shared/app-layout'
import { useSession } from '@/lib/session'
import { HomePage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login-page'
import { SettingsPage } from '@/pages/settings-page'
import { TitlePage } from '@/pages/title-page'
import { getLoginDestination, LOGIN_PATH, pages } from '@/routes'

const ImportPage = lazy(() => import('@/pages/import-page').then(({ ImportPage }) => ({ default: ImportPage })))

function AppRoutes() {
  const { t } = useTranslation()
  const session = useSession()
  const { pathname, state } = useLocation()

  return (
    <Routes>
      <Route
        path={LOGIN_PATH}
        element={session?.active ? <Navigate to={getLoginDestination(state)} replace /> : <LoginPage />}
      />
      <Route element={session?.active ? <AppLayout /> : <Navigate to={LOGIN_PATH} state={{ from: pathname }} replace />}>
        <Route path={pages.home.to} element={<HomePage />} />
        <Route path={pages.settings.to} element={<SettingsPage />} />
        <Route path={pages.import.to} element={
          <Suspense fallback={<p role="status">{t('statement.loading')}</p>}>
            <ImportPage />
          </Suspense>
        } />
        <Route path={pages.dashboard.to} element={<TitlePage title={pages.dashboard.title} />} />
        <Route path="*" element={<Navigate to={pages.home.to} replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter useTransitions={false}>
      <AppRoutes />
    </BrowserRouter>
  )
}
