import { lazy, Suspense } from 'react'
import { Link, NavLink, Outlet, Route, Routes } from 'react-router'
import ElectronTitleBar from './components/ElectronTitleBar'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const DiagnosticsPage = lazy(() => import('./pages/DiagnosticsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const navigationItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/settings', label: 'Settings' },
  { to: '/diagnostics', label: 'Diagnostics' },
  { to: '/about', label: 'About' },
]

function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ElectronTitleBar />
      <header className="app-header">
        <Link className="brand" to="/">BigfootDS Template</Link>
        <nav aria-label="Primary navigation">
          <ul className="navigation-list">
            {navigationItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  className={({ isActive }) => `navigation-link${isActive ? ' navigation-link-active' : ''}`}
                  end={end}
                  to={to}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="page-content" id="main-content" tabIndex={-1}>
        <Suspense fallback={<p className="page-loading">Loading page…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="app-footer">Browser-first React app shell</footer>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />} path="/">
        <Route index element={<HomePage />} />
        <Route element={<SettingsPage />} path="settings" />
        <Route element={<DiagnosticsPage />} path="diagnostics" />
        <Route element={<AboutPage />} path="about" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default App
