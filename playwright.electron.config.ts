import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/electron',
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  reporter: [['list']],
})
