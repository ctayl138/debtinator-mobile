import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Payoff Timeline page.
 * Handles viewing the month-by-month payment breakdown.
 */
export class TimelinePage extends BasePage {
  // Page elements
  readonly timelineContainer: Locator;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.timelineContainer = this.getByTestId('payoff-timeline');
  }

  async goto(): Promise<void> {
    // Timeline page is accessed from the Payoff tab
    throw new Error('Timeline page should be accessed via PayoffPage.openTimeline()');
  }

  async waitForReady(): Promise<void> {
    await expect(this.timelineContainer).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert the timeline is visible
   */
  async assertTimelineVisible(): Promise<void> {
    await expect(this.timelineContainer).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert month header is visible
   */
  async assertMonthHeaderVisible(monthNumber: number): Promise<void> {
    const monthRegex = new RegExp(`Month ${monthNumber} –`);
    await expect(this.getByText(monthRegex)).toBeVisible();
  }
}
