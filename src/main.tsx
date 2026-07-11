import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HashRouter } from 'react-router'
import App from './App.tsx'
import './index.css'
import { appMetadata } from './utils/appMetadata.ts'
import { getRouterMode } from './utils/platform.ts'
import { SettingsProvider } from './contexts/SettingsProvider.tsx'
import { LanguageProvider } from './contexts/LanguageProvider.tsx'

const Router = getRouterMode() === 'hash' ? HashRouter : BrowserRouter

document.title = appMetadata.applicationName

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <LanguageProvider>
        <Router>
          <App />
        </Router>
      </LanguageProvider>
    </SettingsProvider>
  </React.StrictMode>,
)
