import { LayoutDashboard, House, Settings, Upload } from 'lucide-react'

export const LOGIN_PATH = '/login'

export const pages = {
  home: { to: '/', title: 'nav.home', icon: House },
  import: { to: '/importar-extrato', title: 'nav.import', icon: Upload },
  dashboard: { to: '/dashboard', title: 'nav.dashboard', icon: LayoutDashboard },
  settings: { to: '/configuracoes', title: 'nav.settings', icon: Settings },
} as const

export function getImportMonthLink(month: string) {
  return { pathname: pages.import.to, search: new URLSearchParams({ month }).toString() }
}

export function getLoginDestination(state: unknown): string {
  const from = state && typeof state === 'object' && 'from' in state ? state.from : null
  return Object.values(pages).find(({ to }) => to === from)?.to ?? pages.home.to
}
