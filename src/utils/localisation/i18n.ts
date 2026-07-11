import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  defaultLanguage,
  isAvailableLanguage,
  loadTranslationContent,
  resources,
} from './i18nDataPrep'

void i18next.use(initReactI18next).init({
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
  lng: defaultLanguage,
  resources,
})

export async function ensureLanguageResource(language: string): Promise<string> {
  const languageToLoad = isAvailableLanguage(language) ? language : defaultLanguage

  if (!i18next.hasResourceBundle(languageToLoad, 'translation')) {
    const translations = await loadTranslationContent(languageToLoad)
    i18next.addResourceBundle(languageToLoad, 'translation', translations, true, true)
  }

  return languageToLoad
}

export async function changeLanguage(language: string): Promise<string> {
  const loadedLanguage = await ensureLanguageResource(language)
  await i18next.changeLanguage(loadedLanguage)
  return loadedLanguage
}

export default i18next
