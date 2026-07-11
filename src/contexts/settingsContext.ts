import { createContext } from 'react'
import type { Settings, SettingsChange } from '../utils/settings/settingsModel'
import type { SettingsPersistenceAdapterId } from '../utils/settings/settingsPersistenceEnvironment'

export interface SettingsContextValue {
  adapterId?: SettingsPersistenceAdapterId
  error?: string
  isLoading: boolean
  settings?: Settings
  update: (change: SettingsChange) => Promise<Settings>
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)
