import type { Settings } from './settingsModel'
import type { SettingsPersistenceAdapterId } from './settingsPersistenceEnvironment'

export interface SettingsRepository {
  readonly id: SettingsPersistenceAdapterId
  loadOrCreate(): Promise<Settings>
  save(settings: Settings): Promise<Settings>
}
