export enum IpcChannel {
  WindowClose = 'window:close',
  WindowGetFullscreen = 'window:get-fullscreen',
  WindowMinimise = 'window:minimise',
  WindowRestart = 'window:restart',
  WindowSetFullscreen = 'window:set-fullscreen',
  WindowToggleMaximise = 'window:toggle-maximise',
}

export interface ElectronWindowBridge {
  close: () => Promise<void>
  getFullscreen: () => Promise<boolean>
  minimise: () => Promise<void>
  restart: () => Promise<void>
  setFullscreen: (enabled: boolean) => Promise<boolean>
  toggleMaximise: () => Promise<boolean>
}

export interface ElectronBridge {
  window: ElectronWindowBridge
}
