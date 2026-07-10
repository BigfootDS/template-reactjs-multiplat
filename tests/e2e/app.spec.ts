import { expect, test } from '@playwright/test'

test('renders the starter app and handles its counter interaction', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Vite + React + TS')
  await expect(page.getByRole('heading', { name: 'Vite + React' })).toBeVisible()

  const counterButton = page.getByRole('button', { name: /count is/ })
  await counterButton.click()

  await expect(counterButton).toHaveText('count is 1')
})
