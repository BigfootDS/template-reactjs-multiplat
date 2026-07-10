import { expect, test } from '@playwright/test'
import { mockElectronBridge } from './helpers/electronBridge'

test('renders the routed app shell and primary navigation', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('BigfootDS ReactJS Multiplatform Template')
  await expect(page.getByRole('heading', { name: 'Start with a real app shell' })).toBeVisible()

  const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
  await navigation.getByRole('link', { name: 'Settings' }).click()

  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
})

test('renders every browser route and the not-found page', async ({ page }) => {
  const routes = [
    { path: '/', heading: 'Start with a real app shell' },
    { path: '/settings', heading: 'Settings' },
    { path: '/diagnostics', heading: 'Diagnostics' },
    { path: '/about', heading: 'About this template' },
    { path: '/missing-route', heading: 'Page not found' },
  ]

  for (const { path, heading } of routes) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }

  await page.goto('/diagnostics')
  await expect(page.getByText('BigfootDS ReactJS Multiplatform Template', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Runtime capabilities' })).toBeVisible()

  for (const capability of [
    'IndexedDB',
    'Origin Private File System (OPFS)',
    'Web Workers',
    'Cross-origin isolation',
    'Electron bridge',
    'Capacitor native bridge',
  ]) {
    await expect(page.getByText(capability, { exact: true })).toBeVisible()
  }

  await expect(page.getByText(
    'No Electron preload bridge is present. Desktop window controls use browser-safe fallbacks.',
    { exact: true },
  )).toBeVisible()
  await expect(page.getByText(
    'Capacitor does not report a native platform. Do not call native plugins from this runtime.',
    { exact: true },
  )).toBeVisible()
})

test('uses hash routes when the Electron preload bridge is available', async ({ page }) => {
  await mockElectronBridge(page)

  await page.goto('/#/about')

  await expect(page.getByRole('heading', { name: 'About this template' })).toBeVisible()

  const titleBar = page.getByRole('toolbar', { name: 'Window controls' })
  const minimiseButton = titleBar.getByRole('button', { name: 'Minimise window' })
  const maximiseButton = titleBar.getByRole('button', { name: 'Maximise window' })
  const fullscreenButton = titleBar.getByRole('button', { name: 'Enter full screen' })
  const closeButton = titleBar.getByRole('button', { name: 'Close window' })

  await expect(titleBar).toBeVisible()
  await expect(titleBar).toHaveAccessibleName('Window controls')
  await expect(minimiseButton).toHaveAccessibleName('Minimise window')
  await expect(maximiseButton).toHaveAccessibleName('Maximise window')
  await expect(fullscreenButton).toHaveAccessibleName('Enter full screen')
  await expect(closeButton).toHaveAccessibleName('Close window')

  await page.setViewportSize({ width: 900, height: 640 })
  await expect(closeButton).toBeVisible()
  const closeButtonBounds = await closeButton.boundingBox()
  expect(closeButtonBounds).not.toBeNull()
  expect((closeButtonBounds?.x ?? 0) + (closeButtonBounds?.width ?? 0)).toBeLessThanOrEqual(900)

  await minimiseButton.focus()
  await expect(minimiseButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-last-window-control', 'minimise')

  await maximiseButton.click()
  await expect(page.locator('html')).toHaveAttribute('data-last-window-control', 'maximise')
  await expect(titleBar.getByRole('button', { name: 'Restore window' })).toHaveAttribute('aria-pressed', 'true')

  await fullscreenButton.focus()
  await expect(fullscreenButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-last-window-control', 'enter-fullscreen')
  await expect(titleBar.getByRole('button', { name: 'Exit full screen' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'Diagnostics' })
    .click()

  await expect(page).toHaveURL(/#\/diagnostics$/)
  await expect(page.getByRole('heading', { name: 'Diagnostics', exact: true })).toBeVisible()
  const electronBridgeDiagnostic = page.getByText('Electron bridge', { exact: true }).locator('..')
  await expect(electronBridgeDiagnostic).toContainText('Available')
  await closeButton.click()
  await expect(page.locator('html')).toHaveAttribute('data-last-window-control', 'close')
})
