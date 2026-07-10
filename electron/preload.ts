import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel, type ElectronBridge } from '../src/shared/ipc'

const electronBridge: ElectronBridge = {
  window: {
    async close() {
      await ipcRenderer.invoke(IpcChannel.WindowClose)
    },
    async getFullscreen() {
      return Boolean(await ipcRenderer.invoke(IpcChannel.WindowGetFullscreen))
    },
    async minimise() {
      await ipcRenderer.invoke(IpcChannel.WindowMinimise)
    },
    async restart() {
      await ipcRenderer.invoke(IpcChannel.WindowRestart)
    },
    async setFullscreen(enabled) {
      return Boolean(await ipcRenderer.invoke(IpcChannel.WindowSetFullscreen, enabled))
    },
    async toggleMaximise() {
      return Boolean(await ipcRenderer.invoke(IpcChannel.WindowToggleMaximise))
    },
  },
}

contextBridge.exposeInMainWorld('electronApi', electronBridge)
