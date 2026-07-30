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
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
    },
  ],
  webServer: {
    // The repo root is served so fixtures can load dist/ and Alpine from node_modules.
    // Port 3211 is the same content on a second origin, which the cross-origin tests need.
    // The build lives in the test script instead, because reuseExistingServer skips this
    // command outright when something is already listening and the suite runs against dist/.
    command: 'pnpm run test:serve',
    url: 'http://localhost:3210/tests/fixtures/index.html',
    reuseExistingServer: !process.env.CI,
  },
})
