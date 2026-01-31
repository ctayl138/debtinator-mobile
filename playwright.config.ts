import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the web build of Debtinator.
 * Uses Page Object Model architecture with tests organized by feature.
 *
 * Structure:
 * - e2e/pages/      - Page Object classes
 * - e2e/fixtures/   - Custom test fixtures and test data
 * - e2e/tests/      - Test files organized by feature
 *
 * @see https://playwright.dev/docs/test-configuration
 * @see https://playwright.dev/docs/pom - Page Object Model
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx expo start --web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  timeout: 30_000,
  expect: { timeout: 10_000 },
});
