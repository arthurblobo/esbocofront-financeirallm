import { Menu, Moon, Sun, Wallet, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { saveTheme, useTheme } from '@/lib/theme'
import { pages } from '@/routes'

function Navigation({ onNavigate }: { onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('nav.label')} className="flex flex-1 flex-col gap-1 p-3">
      {Object.values(pages).map(({ to, title, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground last:mt-auto"
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
  const isDark = useTheme() === 'dark'
  const location = useLocation()
  const { pathname } = location
  const navigationType = useNavigationType()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const main = useRef<HTMLElement>(null)
  const focusMainAfterNavigation = useRef(false)

  useLayoutEffect(() => {
    if (navigationType !== 'POP' && location.state?.focusAfterAuth) main.current?.focus()
  }, [location, navigationType])

  useLayoutEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useLayoutEffect(() => {
    if (!menuOpen && focusMainAfterNavigation.current) {
      focusMainAfterNavigation.current = false
      main.current?.focus()
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    function onEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return

      setMenuOpen(false)
      menuButton.current?.focus()
    }

    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  function onMobileNavigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    focusMainAfterNavigation.current = true
    setMenuOpen(false)
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
              ref={menuButton}
              size="icon"
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
              size="icon"
              className="ml-auto"
              aria-label={t(isDark ? 'theme.light' : 'theme.dark')}
              onClick={() => saveTheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
          </div>

          <div id="mobile-navigation" hidden={!menuOpen} className="md:hidden">
            {menuOpen && <Navigation onNavigate={onMobileNavigate} />}
          </div>
        </header>
        <main
          ref={main}
          tabIndex={-1}
          className="mx-auto max-w-7xl px-4 py-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6 md:py-8"
        >
          <Outlet />
        </main>
      </div>
    </>
  )
}
