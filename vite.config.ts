import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'
import sqlocal from 'sqlocal/vite'

const crossOriginIsolationHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const publicEnvironment = loadEnv(mode, process.cwd(), 'VITE_')
  const appMetadata = {
    applicationName: packageJson.bigfootds.applicationName,
    platformName: packageJson.bigfootds.platformName,
    platformType: packageJson.bigfootds.platformType,
    productName: packageJson.bigfootds.productName,
    productVersion: packageJson.version,
    version: packageJson.version,
  }

  return {
    define: {
      __APP_METADATA__: JSON.stringify(appMetadata),
      'process.env': JSON.stringify({ ...publicEnvironment, ...appMetadata }),
    },
    preview: {
      headers: crossOriginIsolationHeaders,
    },
    server: {
      headers: crossOriginIsolationHeaders,
    },
    plugins: [
      react(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`.
          entry: 'electron/main.ts',
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: process.env.NODE_ENV === 'test'
          // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
          ? undefined
          : {},
      }),
      sqlocal(),
    ],
  }
})
