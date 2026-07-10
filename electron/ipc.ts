import { app, BrowserWindow, ipcMain } from 'electron'
import { IpcChannel } from '../src/shared/ipc'

type GetWindow = () => BrowserWindow | null

function getWindowOrThrow(getWindow: GetWindow): BrowserWindow {
  const currentWindow = getWindow()

  if (!currentWindow || currentWindow.isDestroyed()) {
    throw new Error('No active application window is available.')
  }

  return currentWindow
}

function requireBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new TypeError('Fullscreen state must be a boolean.')
  }

  return value
}

export function initialiseIpc(getWindow: GetWindow): void {
  ipcMain.handle(IpcChannel.WindowMinimise, () => {
    getWindowOrThrow(getWindow).minimize()
  })

  ipcMain.handle(IpcChannel.WindowToggleMaximise, () => {
    const currentWindow = getWindowOrThrow(getWindow)

    if (currentWindow.isMaximized()) {
      currentWindow.unmaximize()
    } else {
      currentWindow.maximize()
    }

    return currentWindow.isMaximized()
  })

  ipcMain.handle(IpcChannel.WindowClose, () => {
    getWindowOrThrow(getWindow).close()
  })

  ipcMain.handle(IpcChannel.WindowRestart, () => {
    app.relaunch()
    app.quit()
  })

  ipcMain.handle(IpcChannel.WindowGetFullscreen, () => {
    return getWindowOrThrow(getWindow).isFullScreen()
  })

  ipcMain.handle(IpcChannel.WindowSetFullscreen, (_event, enabled: unknown) => {
    const currentWindow = getWindowOrThrow(getWindow)
    currentWindow.setFullScreen(requireBoolean(enabled))
    return currentWindow.isFullScreen()
  })
}
