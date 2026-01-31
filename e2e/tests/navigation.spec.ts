import { test, expect } from '../fixtures';

/**
 * E2E tests for Navigation between app sections.
 * Tests cover: tab navigation, back navigation.
 */
test.describe('Navigation', () => {
  test('can navigate between tabs', async ({ debtsPage, payoffPage, page }) => {
    await debtsPage.goto();

    // Start on Debts tab
    await expect(
      debtsPage.emptyState.or(debtsPage.summary).first()
    ).toBeVisible();

    // Go to Payoff
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible();

    // Go back to Debts
    await payoffPage.navigateToTab(/debts/i);
    await debtsPage.waitForReady();
    await expect(
      debtsPage.emptyState.or(debtsPage.summary).first()
    ).toBeVisible();
  });

  test('can navigate back from settings', async ({
    debtsPage,
    payoffPage,
    settingsPage,
    page,
  }) => {
    await debtsPage.goto();
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();

    await payoffPage.openSettings();
    await settingsPage.waitForReady();
    await settingsPage.assertAppearanceVisible();

    // Go back
    await settingsPage.goBack();

    // Should be back on payoff
    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can navigate back from charts', async ({
    debtsPage,
    payoffPage,
    chartsPage,
    page,
  }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Nav Chart Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('100');

    await payoffPage.openCharts();
    await chartsPage.waitForReady();

    // Go back
    await chartsPage.goBack();

    // Should be back on payoff
    await payoffPage.waitForReady();
  });

  test('can navigate to Help & Documentation from menu', async ({
    debtsPage,
    payoffPage,
    documentationPage,
    page,
  }) => {
    await debtsPage.goto();
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();

    await payoffPage.openHelp();
    await documentationPage.waitForReady();
    await documentationPage.assertContentVisible();
  });

  test('can navigate back from documentation', async ({
    debtsPage,
    payoffPage,
    documentationPage,
    page,
  }) => {
    await debtsPage.goto();
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.openHelp();
    await documentationPage.waitForReady();

    await documentationPage.goBack();

    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can navigate back from timeline', async ({
    debtsPage,
    payoffPage,
    timelinePage,
    page,
  }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Timeline Nav Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('60');
    await payoffPage.openTimeline();
    await timelinePage.waitForReady();

    await timelinePage.goBack();

    await payoffPage.waitForReady();
  });
});
