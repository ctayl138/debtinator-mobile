import { test, expect } from '../fixtures';

/**
 * E2E tests for Settings feature.
 * Tests cover: theme selection, accordion behavior.
 */
test.describe('Settings', () => {
  test.beforeEach(async ({ debtsPage, payoffPage, settingsPage, page }) => {
    // Navigate to settings via payoff tab
    await debtsPage.goto();
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.openSettings();
    await settingsPage.waitForReady();
  });

  test('shows appearance settings', async ({ settingsPage }) => {
    await settingsPage.assertAppearanceVisible();
  });

  test('shows theme options in accordion', async ({ settingsPage }) => {
    await settingsPage.assertThemeOptionsVisible();
  });

  test('can select light theme', async ({ settingsPage }) => {
    await settingsPage.selectLightTheme();
    await settingsPage.assertAppearanceVisible();
  });

  test('can select dark theme', async ({ settingsPage }) => {
    await settingsPage.selectDarkTheme();
    await settingsPage.assertAppearanceVisible();
  });

  test('can select system theme', async ({ settingsPage }) => {
    await settingsPage.selectSystemTheme();
    await settingsPage.assertAppearanceVisible();
  });

  test('can collapse and expand accordion', async ({ settingsPage }) => {
    // Theme options should be visible initially
    await settingsPage.assertThemeOptionsVisible();

    // Collapse
    await settingsPage.toggleAppearanceAccordion();
    await settingsPage.assertThemeOptionsHidden();

    // Expand
    await settingsPage.toggleAppearanceAccordion();
    await settingsPage.assertThemeOptionsVisible();
  });
});
