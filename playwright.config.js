import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3210/tests/fixtures/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
  webServer: {
    // The repo root is served so fixtures can load dist/ and Alpine from node_modules.
    // Port 3211 is the same content on a second origin, which the cross-origin tests need.
    command: 'pnpm run build && pnpm run test:serve',
    url: 'http://localhost:3210/tests/fixtures/index.html',
    reuseExistingServer: !process.env.CI,
  },
})
