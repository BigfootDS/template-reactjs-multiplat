import { expect, test } from '@playwright/test'

test('loads the production app with the real preload and window IPC', async ({ playwright }, testInfo) => {
  const environment = { ...process.env }
  delete environment.ELECTRON_RUN_AS_NODE
  delete environment.VITE_DEV_SERVER_URL

  const app = await playwright._electron.launch({
    args: ['.', `--user-data-dir=${testInfo.outputPath('user-data')}`],
    env: environment,
  })

  try {
    const page = await app.firstWindow()
    await expect(page).toHaveURL(/^file:\/\//)
    await expect(page.getByRole('heading', { name: 'Start with a real app shell' })).toBeVisible()
    await expect(page.getByRole('toolbar', { name: 'Window controls' })).toBeVisible()

    const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
    await navigation.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/#\/settings$/)
    await expect(page.getByText('Loading saved preferences…')).toBeHidden()
    await page.getByLabel('Colour theme').selectOption('dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: 'Maximise window' }).click()
    await expect(page.getByRole('button', { name: 'Restore window' })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => app.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows()[0].isMaximized()
    })).toBe(true)

    await navigation.getByRole('link', { name: 'Credits' }).click()
    await expect(page).toHaveURL(/#\/credits$/)
    await expect(page.getByRole('heading', { name: 'Dependency licences' })).toBeVisible()
  } finally {
    await app.close()
  }
})
