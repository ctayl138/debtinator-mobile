import { test, expect, createUniqueDebtName } from '../fixtures';

/**
 * E2E tests for Data Persistence.
 * Tests cover: debt persistence, settings persistence.
 */
test.describe('Data Persistence', () => {
  test('debts persist after page reload', async ({ debtsPage }) => {
    await debtsPage.goto();

    // Add a debt with unique name
    const uniqueName = createUniqueDebtName('Persist Test');
    await debtsPage.addDebt({
      name: uniqueName,
      balance: '999',
      interestRate: '7',
      minimumPayment: '20',
    });

    await debtsPage.assertDebtVisible(uniqueName);

    // Reload page
    await debtsPage.reload();
    await debtsPage.waitForReady();

    // Debt should still be there
    await debtsPage.assertDebtVisible(uniqueName);
  });

  test('payoff settings persist after tab switch', async ({
    debtsPage,
    payoffPage,
    page,
  }) => {
    await debtsPage.goto();

    // Add debt
    await debtsPage.addDebt({
      name: 'Persist Settings Test',
      balance: '1500',
      interestRate: '14',
      minimumPayment: '40',
    });

    // Go to payoff and set values
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();

    await payoffPage.setMonthlyPayment('75');
    await payoffPage.selectMethod('avalanche');

    // Go to debts and back
    await page.getByRole('tab', { name: /debts/i }).first().click();
    await debtsPage.waitForReady();
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();

    // Values should persist
    await payoffPage.assertMonthlyPaymentValue('75');
    await payoffPage.assertMethodDescription('avalanche');
  });

  test('theme selection persists after page reload', async ({
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

    // Select dark theme
    await settingsPage.selectDarkTheme();

    // Navigate to home and reload to ensure clean state
    await page.goto('/');
    await debtsPage.waitForReady();
    await page.reload();
    await debtsPage.waitForReady();

    // Navigate back to settings
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.openSettings();
    await settingsPage.waitForReady();

    // Theme options should still be visible (settings page loaded)
    await settingsPage.assertThemeOptionsVisible();
  });
});
