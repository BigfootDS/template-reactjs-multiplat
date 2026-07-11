import type { ColumnType } from 'kysely'
import type {
  AudioSettings,
  DiagnosticsSettings,
  DisplaySettings,
  LanguageSettings,
} from './settingsModel'

export interface SettingsTable {
  audio: ColumnType<AudioSettings, string, string>
  createdAt: string
  diagnostics: ColumnType<DiagnosticsSettings, string, string>
  display: ColumnType<DisplaySettings, string, string>
  id: string
  language: ColumnType<LanguageSettings, string, string>
  updatedAt: string
  version: number
}

export interface SettingsDatabase {
  settings: SettingsTable
}
