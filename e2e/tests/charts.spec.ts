import { test, expect } from '../fixtures';

/**
 * E2E tests for Data Visualization (Charts) feature.
 * Tests cover: chart navigation, pie chart, line chart switching.
 */
test.describe('Charts', () => {
  test.beforeEach(async ({ debtsPage, payoffPage, page }) => {
    // Set up a debt and configure payoff to enable charts
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Charts Test Debt',
      balance: '2000',
      interestRate: '15',
      minimumPayment: '50',
    });
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('100');
  });

  test('chart icon appears when payoff plan is configured', async ({ payoffPage }) => {
    await payoffPage.assertChartsButtonVisible();
  });

  test('can navigate to charts page', async ({ payoffPage, chartsPage }) => {
    await payoffPage.openCharts();
    await chartsPage.waitForReady();
    await chartsPage.assertChartTogglesVisible();
  });

  test('pie chart is shown by default', async ({ payoffPage, chartsPage }) => {
    await payoffPage.openCharts();
    await chartsPage.waitForReady();
    await chartsPage.assertPieChartSelected();
  });

  test('can switch to line chart', async ({ payoffPage, chartsPage }) => {
    await payoffPage.openCharts();
    await chartsPage.waitForReady();

    await chartsPage.showLineChart();
    await chartsPage.assertLineChartSelected();
  });

  test('can switch back to pie chart', async ({ payoffPage, chartsPage }) => {
    await payoffPage.openCharts();
    await chartsPage.waitForReady();

    await chartsPage.showLineChart();
    await chartsPage.showPieChart();
    await chartsPage.assertPieChartSelected();
  });
});
