import {
  mergeSettings,
  type Settings,
  type SettingsChange,
} from './settingsModel'
import {
  getSettingsPersistenceEnvironment,
  type SettingsPersistenceAdapterId,
} from './settingsPersistenceEnvironment'
import type { SettingsRepository } from './settingsRepository'

let repositoryPromise: Promise<SettingsRepository> | undefined
let settingsLoadPromise: Promise<Settings> | undefined

async function createSettingsRepository(): Promise<SettingsRepository> {
  const environment = getSettingsPersistenceEnvironment()

  if (environment.preferredAdapterId === 'sqlocal') {
    return (await import('./sqlocalSettingsRepository')).sqlocalSettingsRepository
  }

  if (environment.preferredAdapterId === 'indexeddb') {
    return (await import('./indexedDbSettingsRepository')).indexedDbSettingsRepository
  }

  throw new Error('This runtime does not provide a durable settings backend.')
}

async function getSettingsRepository(): Promise<SettingsRepository> {
  repositoryPromise ??= createSettingsRepository()
  return repositoryPromise
}

async function getIndexedDbFallback(error: unknown): Promise<SettingsRepository> {
  const environment = getSettingsPersistenceEnvironment()

  if (environment.preferredAdapterId !== 'sqlocal' || !environment.hasIndexedDb) {
    throw error
  }

  repositoryPromise = import('./indexedDbSettingsRepository')
    .then(({ indexedDbSettingsRepository }) => indexedDbSettingsRepository)

  return repositoryPromise
}

/**
 * Loads the singleton settings entity from the selected storage backend.
 *
 * A SQLocal initialisation failure falls back to IndexedDB when it exists. This
 * protects a normal browser from losing preferences to SQLocal's memory-only
 * fallback when OPFS fails unexpectedly after capability detection.
 */
export function loadSettings(): Promise<Settings> {
  settingsLoadPromise ??= (async () => {
    const repository = await getSettingsRepository()

    try {
      return await repository.loadOrCreate()
    } catch (error) {
      return (await getIndexedDbFallback(error)).loadOrCreate()
    }
  })().catch((error: unknown) => {
    settingsLoadPromise = undefined
    throw error
  })

  return settingsLoadPromise
}

export async function updateSettings(settings: Settings, change: SettingsChange): Promise<Settings> {
  const repository = await getSettingsRepository()
  const nextSettings = mergeSettings(settings, change)

  try {
    const savedSettings = await repository.save(nextSettings)
    settingsLoadPromise = Promise.resolve(savedSettings)
    return savedSettings
  } catch (error) {
    const savedSettings = await (await getIndexedDbFallback(error)).save(nextSettings)
    settingsLoadPromise = Promise.resolve(savedSettings)
    return savedSettings
  }
}

export async function getActiveSettingsPersistenceAdapterId(): Promise<SettingsPersistenceAdapterId> {
  return (await getSettingsRepository()).id
}
