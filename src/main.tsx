import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'
import { initializeI18n } from './i18n'
import { applyTheme, getTheme } from './lib/theme'
import './index.css'

applyTheme(getTheme())
await initializeI18n()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
