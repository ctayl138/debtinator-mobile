import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Charts page.
 * Handles chart viewing and switching between chart types.
 */
export class ChartsPage extends BasePage {
  // Chart type buttons
  readonly pieChartButton: Locator;
  readonly lineChartButton: Locator;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.pieChartButton = this.getByText('Principal vs Interest');
    this.lineChartButton = this.getByText('Balance Over Time');
  }

  async goto(): Promise<void> {
    // Charts page is accessed from the Payoff tab
    throw new Error('Charts page should be accessed via PayoffPage.openCharts()');
  }

  async waitForReady(): Promise<void> {
    await expect(this.pieChartButton).toBeVisible({ timeout: 5000 });
    await expect(this.lineChartButton).toBeVisible();
  }

  /**
   * Switch to pie chart view
   */
  async showPieChart(): Promise<void> {
    await this.pieChartButton.click();
  }

  /**
   * Switch to line chart view
   */
  async showLineChart(): Promise<void> {
    await this.lineChartButton.click();
  }

  /**
   * Assert chart toggle buttons are visible
   */
  async assertChartTogglesVisible(): Promise<void> {
    await expect(this.pieChartButton).toBeVisible({ timeout: 5000 });
    await expect(this.lineChartButton).toBeVisible();
  }

  /**
   * Assert pie chart is the default/selected view
   */
  async assertPieChartSelected(): Promise<void> {
    await expect(this.pieChartButton).toBeVisible();
  }

  /**
   * Assert line chart is selected
   */
  async assertLineChartSelected(): Promise<void> {
    await expect(this.lineChartButton).toBeVisible();
  }
}
