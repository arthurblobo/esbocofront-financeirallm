import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/shared/app-layout'
import { TitlePage } from '@/pages/title-page'
import { pages } from '@/routes'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {Object.values(pages).map(({ to, title }) => (
            <Route key={to} path={to} element={<TitlePage title={title} />} />
          ))}
          <Route path="*" element={<Navigate to={pages.home.to} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
