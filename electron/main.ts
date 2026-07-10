import { app, BrowserWindow, Menu, session, shell } from 'electron'
import { initialiseIpc } from './ipc'
// Line below is commented out per https://github.com/electron-vite/create-electron-vite/issues/56
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import packageJson from '../package.json'

// Line below is commented out per https://github.com/electron-vite/create-electron-vite/issues/56
// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

const appMetadata = packageJson.bigfootds

let win: BrowserWindow | null

app.setName(appMetadata.applicationName)

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url)
  } catch {
    return undefined
  }
}

function isInternalNavigation(navigationUrl: string): boolean {
  const parsedUrl = parseUrl(navigationUrl)

  if (!parsedUrl) {
    return false
  }

  if (VITE_DEV_SERVER_URL) {
    return parsedUrl.origin === new URL(VITE_DEV_SERVER_URL).origin
  }

  return parsedUrl.protocol === 'file:'
}

function openExternalUrl(url: string): void {
  const parsedUrl = parseUrl(url)

  if (parsedUrl && (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'mailto:')) {
    void shell.openExternal(url)
  }
}

function configureNavigation(currentWindow: BrowserWindow): void {
  currentWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url)
    return { action: 'deny' }
  })

  currentWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!isInternalNavigation(navigationUrl)) {
      event.preventDefault()
      openExternalUrl(navigationUrl)
    }
  })
}

function configureCrossOriginIsolation(): void {
  if (VITE_DEV_SERVER_URL || !appMetadata.electron.crossOriginIsolation) {
    return
  }

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Embedder-Policy': ['require-corp'],
        'Cross-Origin-Opener-Policy': ['same-origin'],
      },
    })
  })
}

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    minHeight: appMetadata.electron.window.minHeight,
    minWidth: appMetadata.electron.window.minWidth,
    title: appMetadata.applicationName,
    height: appMetadata.electron.window.height,
    width: appMetadata.electron.window.width,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  configureNavigation(win)

  if (VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools({ mode: 'detach' })
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  if (appMetadata.electron.hideDefaultMenu) {
    Menu.setApplicationMenu(null)
  }

  configureCrossOriginIsolation()
  initialiseIpc(() => win)
  createWindow()
})
