import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { LanguageContext, type LanguageContextValue } from './languageContext'
import { useSettings } from '../hooks/useSettings'
import { changeLanguage } from '../utils/localisation/i18n'
import {
  defaultLanguage,
  getAvailableLanguages,
  getLanguageInfo,
} from '../utils/localisation/i18nDataPrep'

const availableLanguages = getAvailableLanguages()

function applyDocumentLanguage(language: string): void {
  const languageInfo = getLanguageInfo(language)
  document.documentElement.dir = languageInfo.direction
  document.documentElement.lang = language
}

/**
 * Synchronises the persisted settings language with i18next and the document.
 * English is bundled eagerly; later languages are loaded from generated files
 * only when a project adds them to the localisation master.
 */
export function LanguageProvider({ children }: PropsWithChildren) {
  const { settings } = useSettings()
  const [activeLanguage, setActiveLanguage] = useState(defaultLanguage)
  const requestedLanguage = settings?.language.code ?? defaultLanguage

  useEffect(() => {
    let isCurrent = true

    void changeLanguage(requestedLanguage).then((language) => {
      if (isCurrent) {
        applyDocumentLanguage(language)
        setActiveLanguage(language)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [requestedLanguage])

  const value = useMemo<LanguageContextValue>(() => ({
    activeLanguage,
    availableLanguages,
  }), [activeLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
