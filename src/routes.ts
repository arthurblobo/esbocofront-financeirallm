import { LayoutDashboard, House, Settings, Upload } from 'lucide-react'

export const pages = {
  home: { to: '/', title: 'nav.home', icon: House },
  import: { to: '/importar-extrato', title: 'nav.import', icon: Upload },
  dashboard: { to: '/dashboard', title: 'nav.dashboard', icon: LayoutDashboard },
  settings: { to: '/configuracoes', title: 'nav.settings', icon: Settings },
} as const

export type PageTitle = (typeof pages)[keyof typeof pages]['title']
