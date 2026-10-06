import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  outputDir: './test-results-pages',
  testDir: './tests',
  testMatch: '**/pages.spec.ts',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174/RoomLab/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'pages-desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'pages-mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'node scripts/preview-pages.mjs',
    url: 'http://127.0.0.1:4174/RoomLab/',
    reuseExistingServer: !process.env.CI,
  },
})
