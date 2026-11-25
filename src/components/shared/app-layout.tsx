import { Menu, Moon, Sun, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { getTheme, saveTheme } from '@/lib/theme'
import { pages } from '@/routes'

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('nav.label')} className="flex flex-1 flex-col gap-1 p-3">
      {Object.values(pages).map(({ to, title, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground last:mt-auto"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {t(title)}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Wallet aria-hidden="true" className="size-5" />
      </span>
      {t('app.name')}
    </div>
  )
}

export function AppLayout() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState(getTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const isDark = theme === 'dark'

  function toggleTheme() {
    const nextTheme = isDark ? 'light' : 'dark'
    saveTheme(nextTheme)
    setTheme(nextTheme)
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col overflow-y-auto border-r border-border bg-card md:flex">
        <div className="flex min-h-16 items-center border-b border-border px-5">
          <Brand />
        </div>
        <Navigation />
      </aside>

      <div className="min-h-dvh md:pl-60">
        <header className="border-b border-border bg-card">
          <div className="flex min-h-16 items-center gap-2 px-4 sm:px-6">
            <Button
              variant="ghost"
              className="md:hidden"
              aria-label={t(menuOpen ? 'nav.close' : 'nav.open')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
            <div className="md:hidden">
              <Brand />
            </div>
            <Button
              className="ml-auto"
              aria-label={t(isDark ? 'theme.light' : 'theme.dark')}
              onClick={toggleTheme}
            >
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
          </div>

          <div id="mobile-navigation" hidden={!menuOpen} className="md:hidden">
            {menuOpen && <Navigation onNavigate={() => setMenuOpen(false)} />}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </>
  )
}
