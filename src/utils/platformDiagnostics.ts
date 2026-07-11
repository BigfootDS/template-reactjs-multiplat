import { getPlatformCapabilities } from './platform'
import { getSettingsPersistenceEnvironment } from './settings/settingsPersistenceEnvironment'

export type CapabilityStatus = 'available' | 'unavailable'

export interface CapabilityDiagnostic {
  detail: string
  name: string
  status: CapabilityStatus
}

/**
 * Lists the runtime features that affect storage and platform integrations.
 *
 * The checks intentionally do not open a database, request storage, or initialise a
 * native plugin, so diagnostics remain safe in browser, Electron, and Capacitor builds.
 */
export function getPlatformCapabilityDiagnostics(): CapabilityDiagnostic[] {
  const { isCapacitor, isElectron } = getPlatformCapabilities()
  const settingsPersistence = getSettingsPersistenceEnvironment()
  const hasIndexedDb = typeof indexedDB !== 'undefined'
  const hasOpfs = typeof navigator !== 'undefined'
    && typeof navigator.storage?.getDirectory === 'function'
  const hasWorkers = typeof Worker !== 'undefined'
  const isCrossOriginIsolated = globalThis.crossOriginIsolated === true

  return [
    {
      name: 'IndexedDB',
      status: hasIndexedDb ? 'available' : 'unavailable',
      detail: hasIndexedDb
        ? 'Browser-backed structured storage is available. Initialise it through a persistence adapter.'
        : 'This runtime blocks IndexedDB. Keep persistence in memory or provide a platform-specific adapter.',
    },
    {
      name: 'Origin Private File System (OPFS)',
      status: hasOpfs ? 'available' : 'unavailable',
      detail: hasOpfs
        ? 'OPFS is available for larger local files after the target platform has been tested.'
        : 'navigator.storage.getDirectory() is unavailable. Use IndexedDB or add a platform storage adapter.',
    },
    {
      name: 'Web Workers',
      status: hasWorkers ? 'available' : 'unavailable',
      detail: hasWorkers
        ? 'Background worker APIs are available for storage or processing work.'
        : 'Worker is unavailable. Keep work on the main thread or provide a compatible adapter.',
    },
    {
      name: 'Cross-origin isolation',
      status: isCrossOriginIsolated ? 'available' : 'unavailable',
      detail: isCrossOriginIsolated
        ? 'Cross-origin isolation is active. APIs that require SharedArrayBuffer can be evaluated.'
        : 'Cross-origin isolation is off. Keep SharedArrayBuffer-backed paths disabled until compatible COOP and COEP policies are configured.',
    },
    {
      name: 'Electron bridge',
      status: isElectron ? 'available' : 'unavailable',
      detail: isElectron
        ? 'The narrow preload bridge is present. Desktop actions can use the typed IPC wrapper.'
        : 'No Electron preload bridge is present. Desktop window controls use browser-safe fallbacks.',
    },
    {
      name: 'Capacitor native bridge',
      status: isCapacitor ? 'available' : 'unavailable',
      detail: isCapacitor
        ? 'Capacitor reports a native platform. Keep native plugin calls behind a capability adapter.'
        : 'Capacitor does not report a native platform. Do not call native plugins from this runtime.',
    },
    {
      name: 'Settings persistence backend',
      status: settingsPersistence.preferredAdapterId === 'unavailable' ? 'unavailable' : 'available',
      detail: settingsPersistence.preferredAdapterId === 'sqlocal'
        ? 'SQLocal with Kysely is selected because this runtime provides cross-origin isolation, OPFS, and workers.'
        : settingsPersistence.preferredAdapterId === 'indexeddb'
          ? 'IndexedDB is selected as the durable browser-safe backend for this runtime.'
          : 'No durable settings backend is available. Enable IndexedDB or provide a platform storage adapter.',
    },
  ]
}
