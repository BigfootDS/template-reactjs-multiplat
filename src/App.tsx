import { lazy, Suspense } from 'react'
import { Link, NavLink, Outlet, Route, Routes } from 'react-router'
import { useTranslation } from 'react-i18next'
import ElectronTitleBar from './components/ElectronTitleBar'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const DiagnosticsPage = lazy(() => import('./pages/DiagnosticsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CreditsPage = lazy(() => import('./pages/CreditsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function AppLayout() {
  const { t } = useTranslation()
  const navigationItems = [
    { to: '/', label: t('navigation_home'), end: true },
    { to: '/settings', label: t('navigation_settings') },
    { to: '/diagnostics', label: t('navigation_diagnostics') },
    { to: '/about', label: t('navigation_about') },
    { to: '/credits', label: t('navigation_credits') },
  ]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('app_skip_to_content')}</a>
      <ElectronTitleBar />
      <header className="app-header">
        <Link className="brand" to="/">BigfootDS Template</Link>
        <nav aria-label={t('navigation_label')}>
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
        <Suspense fallback={<p className="page-loading">{t('app_loading')}</p>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="app-footer">{t('app_footer')}</footer>
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
        <Route element={<CreditsPage />} path="credits" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default App
