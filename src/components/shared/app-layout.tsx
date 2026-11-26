import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, Wallet, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom'

import { ProfileAvatar } from '@/components/shared/profile-avatar'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/lib/profile'
import { useSession } from '@/lib/session'
import { readStorage, writeStorage } from '@/lib/storage'
import { saveTheme, useTheme } from '@/lib/theme'
import { useDismissibleTooltip } from '@/lib/use-dismissible-tooltip'
import { cn } from '@/lib/utils'
import { pages } from '@/routes'

type NavigationProps = {
  compact?: boolean
  id?: string
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void
}

const sidebarKey = 'sidebarCollapsed'

function NavigationItem({
  page, compact, onNavigate,
}: { page: (typeof pages)[keyof typeof pages]; compact: boolean; onNavigate?: NavigationProps['onNavigate'] }) {
  const { t } = useTranslation()
  const { to, title, icon: Icon } = page
  const tooltip = useDismissibleTooltip(compact)

  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      aria-label={t(title)}
      className={cn(
        'relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground last:mt-auto',
        compact && 'justify-center px-0',
      )}
      {...(compact ? { ...tooltip.hoverProps, ...tooltip.focusProps } : {})}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {compact ? (
        <span aria-hidden="true" hidden={!tooltip.visible} className="absolute left-full z-10 pl-2">
          <span className="block whitespace-nowrap rounded-md border border-input bg-popover px-2 py-1.5 text-xs text-popover-foreground">
            {t(title)}
          </span>
        </span>
      ) : <span className="truncate">{t(title)}</span>}
    </NavLink>
  )
}

function Navigation({ compact = false, id, onNavigate }: NavigationProps) {
  const { t } = useTranslation()

  return (
    <nav id={id} aria-label={t('nav.label')} className="flex flex-1 flex-col gap-1 p-3">
      {Object.values(pages).map((page) => (
        <NavigationItem key={page.to} page={page} compact={compact} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Wallet aria-hidden="true" className="size-5" />
      </span>
      <span className={compact ? 'sr-only' : undefined}>{t('app.name')}</span>
    </div>
  )
}

export function AppLayout() {
  const { t } = useTranslation()
  const isDark = useTheme() === 'dark'
  const user = useSession()?.user
  const { photo } = useProfile(user?.email)
  const location = useLocation()
  const { pathname } = location
  const navigationType = useNavigationType()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readStorage(sidebarKey) === 'true')
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
    <div data-sidebar={sidebarCollapsed ? 'compact' : 'full'} className="app-shell">
      <aside className="desktop-sidebar fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-border bg-card md:flex">
        <div className={cn('flex min-h-16 items-center gap-2 border-b border-border px-3', sidebarCollapsed ? 'flex-col justify-center py-3' : 'justify-between')}>
          <Brand compact={sidebarCollapsed} />
          <Button
            size="icon"
            variant="ghost"
            aria-label={t(sidebarCollapsed ? 'nav.expandSidebar' : 'nav.collapseSidebar')}
            aria-expanded={!sidebarCollapsed}
            aria-controls="desktop-navigation"
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed)
              writeStorage(sidebarKey, String(!sidebarCollapsed))
            }}
          >
            {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </Button>
        </div>
        <Navigation id="desktop-navigation" compact={sidebarCollapsed} />
      </aside>

      <div className="app-body min-h-dvh md:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-30 border-b border-border bg-card">
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
              <span className="relative grid size-5 place-items-center" aria-hidden="true">
                <Sun className="theme-icon theme-icon-sun absolute" />
                <Moon className="theme-icon theme-icon-moon absolute" />
              </span>
            </Button>
            {user && <ProfileAvatar name={user.name} photo={photo} className="text-sm" />}
          </div>

          <div id="mobile-navigation" hidden={!menuOpen} className="max-h-[calc(100dvh-4rem)] overflow-y-auto md:hidden">
            {menuOpen && <Navigation onNavigate={onMobileNavigate} />}
          </div>
        </header>
        <main
          ref={main}
          tabIndex={-1}
          className="mx-auto max-w-7xl px-4 py-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6 md:py-8"
        >
          <div key={pathname} data-page-content>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
