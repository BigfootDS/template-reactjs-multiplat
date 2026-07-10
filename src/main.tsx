import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HashRouter } from 'react-router'
import App from './App.tsx'
import './index.css'
import { getRouterMode } from './utils/platform.ts'

const Router = getRouterMode() === 'hash' ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
