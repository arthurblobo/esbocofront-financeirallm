import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/shared/app-layout'
import { createSession, readSession, saveSession } from '@/lib/session'
import { HomePage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login-page'
import { SettingsPage } from '@/pages/settings-page'
import { TitlePage } from '@/pages/title-page'
import { pages } from '@/routes'

const loginPath = '/login'

export function App() {
  const [session, setSession] = useState(readSession)
  const user = session?.active ? session.user : null

  function onLogin(name: string, email: string) {
    const nextSession = createSession(name, email, session)
    saveSession(nextSession)
    setSession(nextSession)
  }

  function onLogout() {
    if (!session) return

    const nextSession = { ...session, active: false }
    saveSession(nextSession)
    setSession(nextSession)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={loginPath}
          element={user ? <Navigate to={pages.home.to} replace /> : <LoginPage onLogin={onLogin} />}
        />
        <Route element={user ? <AppLayout /> : <Navigate to={loginPath} replace />}>
          <Route path={pages.home.to} element={user && <HomePage user={user} />} />
          <Route path={pages.settings.to} element={<SettingsPage onLogout={onLogout} />} />
          {[pages.import, pages.dashboard].map(({ to, title }) => (
            <Route key={to} path={to} element={<TitlePage title={title} />} />
          ))}
          <Route path="*" element={<Navigate to={pages.home.to} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
