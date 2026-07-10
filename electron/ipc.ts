import { app, BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { IpcChannel } from '../src/shared/ipc'

type GetWindow = () => BrowserWindow | null

function getWindowOrThrow(event: IpcMainInvokeEvent, getWindow: GetWindow): BrowserWindow {
  const currentWindow = getWindow()

  if (!currentWindow || currentWindow.isDestroyed()) {
    throw new Error('No active application window is available.')
  }

  if (event.sender.id !== currentWindow.webContents.id) {
    throw new Error('The IPC sender does not match the application window.')
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
  ipcMain.handle(IpcChannel.WindowMinimise, (event) => {
    getWindowOrThrow(event, getWindow).minimize()
  })

  ipcMain.handle(IpcChannel.WindowToggleMaximise, (event) => {
    const currentWindow = getWindowOrThrow(event, getWindow)

    if (currentWindow.isMaximized()) {
      currentWindow.unmaximize()
    } else {
      currentWindow.maximize()
    }

    return currentWindow.isMaximized()
  })

  ipcMain.handle(IpcChannel.WindowClose, (event) => {
    getWindowOrThrow(event, getWindow).close()
  })

  ipcMain.handle(IpcChannel.WindowRestart, (event) => {
    getWindowOrThrow(event, getWindow)
    app.relaunch()
    app.quit()
  })

  ipcMain.handle(IpcChannel.WindowGetFullscreen, (event) => {
    return getWindowOrThrow(event, getWindow).isFullScreen()
  })

  ipcMain.handle(IpcChannel.WindowSetFullscreen, (event, enabled: unknown) => {
    const currentWindow = getWindowOrThrow(event, getWindow)
    currentWindow.setFullScreen(requireBoolean(enabled))
    return currentWindow.isFullScreen()
  })
}
