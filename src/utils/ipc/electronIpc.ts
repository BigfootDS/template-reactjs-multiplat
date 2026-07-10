import type { ElectronBridge } from '../../shared/ipc'

function getElectronBridge(): ElectronBridge | undefined {
  return window.electronApi
}

export const electronWindowControls = {
  isAvailable: () => getElectronBridge() !== undefined,
  async close(): Promise<void> {
    await getElectronBridge()?.window.close()
  },
  async getFullscreen(): Promise<boolean> {
    return (await getElectronBridge()?.window.getFullscreen()) ?? false
  },
  async minimise(): Promise<void> {
    await getElectronBridge()?.window.minimise()
  },
  async restart(): Promise<void> {
    await getElectronBridge()?.window.restart()
  },
  async setFullscreen(enabled: boolean): Promise<boolean> {
    return (await getElectronBridge()?.window.setFullscreen(enabled)) ?? false
  },
  async toggleMaximise(): Promise<boolean> {
    return (await getElectronBridge()?.window.toggleMaximise()) ?? false
  },
}
