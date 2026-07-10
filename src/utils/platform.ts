import { Capacitor } from '@capacitor/core'

export type AppPlatform = 'browser' | 'capacitor' | 'electron'
export type RouterMode = 'browser' | 'hash'

export interface PlatformCapabilities {
  isBrowser: boolean
  isCapacitor: boolean
  isElectron: boolean
}

export function getPlatformCapabilities(): PlatformCapabilities {
  const hasBrowserRuntime = typeof window !== 'undefined'
  const isElectron = hasBrowserRuntime && window.electronApi !== undefined
  const isCapacitor = hasBrowserRuntime && Capacitor.isNativePlatform()

  return {
    isBrowser: hasBrowserRuntime && !isCapacitor && !isElectron,
    isCapacitor,
    isElectron,
  }
}

export function getAppPlatform(): AppPlatform {
  const { isCapacitor, isElectron } = getPlatformCapabilities()

  if (isElectron) {
    return 'electron'
  }

  return isCapacitor ? 'capacitor' : 'browser'
}

export function getRouterMode(): RouterMode {
  return getAppPlatform() === 'electron' ? 'hash' : 'browser'
}
