import fallbackTranslations from './generated/en.json'
import manifest from './generated/manifest.json'

export type TranslationContent = Record<string, string>

export interface LocalisationLanguageInfo {
  direction: 'ltr' | 'rtl'
  file: string
  name: string
}

export interface LocalisationLanguage extends LocalisationLanguageInfo {
  code: string
}

interface LocalisationManifest {
  languages: Record<string, LocalisationLanguageInfo>
  source: string
}

const localisationManifest = manifest as LocalisationManifest
const translationLoaders = import.meta.glob<TranslationContent>(
  ['./generated/*.json', '!./generated/manifest.json', '!./generated/en.json'],
  { import: 'default' },
)

export const defaultLanguage = 'en'
export const availableLanguages = localisationManifest.languages
export const resources: Record<string, { translation: TranslationContent }> = {
  [defaultLanguage]: {
    translation: fallbackTranslations as TranslationContent,
  },
}

export function getAvailableLanguages(): LocalisationLanguage[] {
  return Object.entries(availableLanguages)
    .map(([code, language]) => ({ code, ...language }))
    .sort(({ code: leftCode }, { code: rightCode }) => leftCode.localeCompare(rightCode))
}

export function getLanguageInfo(language: string): LocalisationLanguageInfo {
  const languageInfo = availableLanguages[language] ?? availableLanguages[defaultLanguage]

  if (!languageInfo) {
    throw new Error(`The localisation manifest must include the fallback language "${defaultLanguage}".`)
  }

  return languageInfo
}

export function isAvailableLanguage(language: string): boolean {
  return Object.prototype.hasOwnProperty.call(availableLanguages, language)
}

export async function loadTranslationContent(language: string): Promise<TranslationContent> {
  if (language === defaultLanguage) {
    return fallbackTranslations as TranslationContent
  }

  if (!isAvailableLanguage(language)) {
    throw new Error(`Unsupported language requested: ${language}`)
  }

  const languageFilePath = `./generated/${availableLanguages[language].file}`
  const loadTranslations = translationLoaders[languageFilePath]

  if (!loadTranslations) {
    throw new Error(`No generated translation file found for ${language}.`)
  }

  return loadTranslations()
}
