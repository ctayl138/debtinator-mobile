import { test, expect } from '../fixtures';

/**
 * E2E tests for Payoff Timeline feature.
 * Tests cover: timeline navigation, month display.
 */
test.describe('Payoff Timeline', () => {
  test.beforeEach(async ({ debtsPage, payoffPage, page }) => {
    // Set up a debt and configure payoff to enable timeline
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Timeline Test Debt',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('60');
  });

  test('timeline icon appears when payoff configured', async ({ payoffPage }) => {
    await payoffPage.assertTimelineButtonVisible();
  });

  test('can navigate to timeline page', async ({ payoffPage, timelinePage }) => {
    await payoffPage.openTimeline();
    await timelinePage.waitForReady();
    await timelinePage.assertTimelineVisible();
  });

  test('shows month headers with correct format', async ({ payoffPage, timelinePage }) => {
    await payoffPage.openTimeline();
    await timelinePage.waitForReady();
    await timelinePage.assertMonthHeaderVisible(1);
  });
});
