import { createContext } from 'react'
import type { LocalisationLanguage } from '../utils/localisation/i18nDataPrep'

export interface LanguageContextValue {
  activeLanguage: string
  availableLanguages: readonly LocalisationLanguage[]
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)
