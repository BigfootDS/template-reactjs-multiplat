import {
  createDefaultSettings,
  defaultSettingsId,
  normaliseSettings,
  type Settings,
} from './settingsModel'
import type { SettingsRepository } from './settingsRepository'

const databaseName = 'template-settings'
const databaseVersion = 1
const settingsStoreName = 'settings'

function requestToPromise<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'))
    request.onsuccess = () => resolve(request.result)
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    transaction.oncomplete = () => resolve()
  })
}

function openSettingsDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)

    request.onerror = () => reject(request.error ?? new Error('Unable to open the settings database.'))
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(settingsStoreName)) {
        request.result.createObjectStore(settingsStoreName, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
  })
}

async function withSettingsStore<Result>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<Result>,
): Promise<Result> {
  const database = await openSettingsDatabase()
  const transaction = database.transaction(settingsStoreName, mode)

  try {
    const result = await operation(transaction.objectStore(settingsStoreName))
    await transactionDone(transaction)
    return result
  } finally {
    database.close()
  }
}

export const indexedDbSettingsRepository: SettingsRepository = {
  id: 'indexeddb',
  async loadOrCreate(): Promise<Settings> {
    return withSettingsStore('readwrite', async (store) => {
      const stored = await requestToPromise<Settings | undefined>(store.get(defaultSettingsId))

      if (stored) {
        return normaliseSettings(stored)
      }

      const settings = createDefaultSettings()
      await requestToPromise(store.put(settings))
      return settings
    })
  },
  async save(settings: Settings): Promise<Settings> {
    const normalisedSettings = normaliseSettings(settings)

    return withSettingsStore('readwrite', async (store) => {
      await requestToPromise(store.put(normalisedSettings))
      return normalisedSettings
    })
  },
}
