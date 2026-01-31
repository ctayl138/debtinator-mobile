import { test as base } from '@playwright/test';
import { DebtsPage, PayoffPage, ChartsPage, SettingsPage, TimelinePage } from '../pages';

/**
 * Custom Playwright fixtures for Debtinator E2E tests.
 * Provides page objects pre-initialized for each test.
 */

// Extend the base test with our page objects
export const test = base.extend<{
  debtsPage: DebtsPage;
  payoffPage: PayoffPage;
  chartsPage: ChartsPage;
  settingsPage: SettingsPage;
  timelinePage: TimelinePage;
}>({
  // Debts page fixture
  debtsPage: async ({ page }, use) => {
    const debtsPage = new DebtsPage(page);
    await use(debtsPage);
  },

  // Payoff page fixture
  payoffPage: async ({ page }, use) => {
    const payoffPage = new PayoffPage(page);
    await use(payoffPage);
  },

  // Charts page fixture
  chartsPage: async ({ page }, use) => {
    const chartsPage = new ChartsPage(page);
    await use(chartsPage);
  },

  // Settings page fixture
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  // Timeline page fixture
  timelinePage: async ({ page }, use) => {
    const timelinePage = new TimelinePage(page);
    await use(timelinePage);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
