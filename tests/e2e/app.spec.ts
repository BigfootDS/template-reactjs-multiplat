import { expect, test } from '@playwright/test'

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
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
})
