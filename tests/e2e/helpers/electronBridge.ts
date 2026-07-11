import type { Page } from '@playwright/test'

/**
 * Exposes the renderer's narrow Electron window bridge before the app loads.
 *
 * The mock records the last requested operation on the document element so a
 * browser test can assert renderer behaviour without loading Electron itself.
 */
export async function mockElectronBridge(page: Page): Promise<void> {
  await page.addInitScript(() => {
    let isFullscreen = false
    let isMaximised = false

    function recordWindowControl(control: string): void {
      document.documentElement.dataset.lastWindowControl = control
    }

    Object.defineProperty(window, 'electronApi', {
      configurable: true,
      value: {
        window: {
          close: async () => {
            recordWindowControl('close')
          },
          getFullscreen: async () => isFullscreen,
          minimise: async () => {
            recordWindowControl('minimise')
          },
          restart: async () => {
            recordWindowControl('restart')
          },
          setFullscreen: async (enabled: boolean) => {
            isFullscreen = enabled
            recordWindowControl(enabled ? 'enter-fullscreen' : 'exit-fullscreen')
            return isFullscreen
          },
          toggleMaximise: async () => {
            isMaximised = !isMaximised
            recordWindowControl(isMaximised ? 'maximise' : 'restore')
            return isMaximised
          },
        },
      },
    })
  })
}
