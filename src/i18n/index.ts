import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { readStorage, writeStorage } from '@/lib/storage'

import en from './locales/en.json'
import es from './locales/es.json'
import ptBR from './locales/pt-BR.json'

export const defaultLanguage = 'pt-BR'
export const i18n = createInstance()
const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
}

type Language = keyof typeof resources
export const supportedLanguages = Object.keys(resources) as Language[]

export function isLanguage(value: string | null): value is Language {
  return value !== null && Object.hasOwn(resources, value)
}

export function saveLanguage(language: Language): boolean {
  const saved = writeStorage('language', language)
  void i18n.changeLanguage(language)
  return saved
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['pt-BR']
    strictKeyChecks: true
  }
}

function updateDocumentLanguage(language: string) {
  document.documentElement.lang = language
  document.title = i18n.t('app.name')
}

export async function initializeI18n() {
  const savedLanguage = readStorage('language')
  await i18n.use(initReactI18next).init({
    resources,
    lng: isLanguage(savedLanguage) ? savedLanguage : defaultLanguage,
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,
    interpolation: { escapeValue: false },
  })

  updateDocumentLanguage(i18n.resolvedLanguage ?? defaultLanguage)
  i18n.on('languageChanged', updateDocumentLanguage)
}
