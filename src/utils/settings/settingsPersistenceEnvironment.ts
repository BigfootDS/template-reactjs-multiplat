import { getPlatformCapabilities } from '../platform'

export type SettingsPersistenceAdapterId = 'indexeddb' | 'sqlocal' | 'unavailable'

export interface SettingsPersistenceEnvironment {
  hasIndexedDb: boolean
  hasOpfs: boolean
  hasWorker: boolean
  isCapacitor: boolean
  isCrossOriginIsolated: boolean
  preferredAdapterId: SettingsPersistenceAdapterId
}

export function selectSettingsPersistenceAdapter(
  environment: Omit<SettingsPersistenceEnvironment, 'preferredAdapterId'>,
): SettingsPersistenceAdapterId {
  if (environment.isCapacitor && environment.hasIndexedDb) {
    return 'indexeddb'
  }

  if (environment.isCrossOriginIsolated && environment.hasOpfs && environment.hasWorker) {
    return 'sqlocal'
  }

  return environment.hasIndexedDb ? 'indexeddb' : 'unavailable'
}

/**
 * Detects the browser features needed by each settings backend without opening
 * either store. Capacitor receives IndexedDB first because its WebView may not
 * provide the isolated OPFS environment that SQLocal requires.
 */
export function getSettingsPersistenceEnvironment(): SettingsPersistenceEnvironment {
  const { isCapacitor } = getPlatformCapabilities()
  const environment = {
    hasIndexedDb: typeof indexedDB !== 'undefined',
    hasOpfs: typeof navigator !== 'undefined'
      && typeof navigator.storage?.getDirectory === 'function',
    hasWorker: typeof Worker !== 'undefined',
    isCapacitor,
    isCrossOriginIsolated: globalThis.crossOriginIsolated === true,
  }

  return {
    ...environment,
    preferredAdapterId: selectSettingsPersistenceAdapter(environment),
  }
}
