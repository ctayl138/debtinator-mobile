import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Payoff tab.
 * Handles payoff method selection, monthly payment input, and summary viewing.
 */
export class PayoffPage extends BasePage {
  // Page elements
  readonly emptyState: Locator;
  readonly methodCard: Locator;
  readonly monthlyPaymentInput: Locator;
  readonly settingsButton: Locator;
  readonly chartsButton: Locator;
  readonly timelineButton: Locator;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.emptyState = this.getByTestId('payoff-empty');
    this.methodCard = this.getByTestId('payoff-method-card');
    this.monthlyPaymentInput = this.getByTestId('monthly-payment-input');
    this.settingsButton = this.getByLabel(/open settings/i).first();
    this.chartsButton = this.getByLabel(/open charts/i);
    this.timelineButton = this.getByLabel(/open payoff timeline/i);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.navigateToTab(/payoff/i);
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(
      this.emptyState
        .or(this.methodCard)
        .or(this.getByText(/payoff method|no debts to plan/i))
        .first()
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if the payoff tab has debts configured
   */
  async hasDebts(): Promise<boolean> {
    return this.isVisible(this.methodCard, 2000);
  }

  /**
   * Select a payoff method
   */
  async selectMethod(method: 'snowball' | 'avalanche' | 'custom'): Promise<void> {
    const methodText = method.charAt(0).toUpperCase() + method.slice(1);
    await this.getByText(methodText).click();
  }

  /**
   * Enter monthly payment amount
   */
  async setMonthlyPayment(amount: string): Promise<void> {
    await this.monthlyPaymentInput.fill(amount);
  }

  /**
   * Navigate to settings
   */
  async openSettings(): Promise<void> {
    await expect(this.settingsButton).toBeVisible({ timeout: 5000 });
    // Use force:true because inner icon element intercepts pointer events
    await this.settingsButton.click({ force: true });
  }

  /**
   * Navigate to charts
   */
  async openCharts(): Promise<void> {
    await expect(this.chartsButton).toBeVisible({ timeout: 5000 });
    await this.chartsButton.click({ force: true });
  }

  /**
   * Navigate to payoff timeline
   */
  async openTimeline(): Promise<void> {
    await expect(this.timelineButton).toBeVisible({ timeout: 5000 });
    await this.timelineButton.click({ force: true });
  }

  /**
   * Assert empty state is shown
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.getByText(/no debts to plan/i)).toBeVisible();
  }

  /**
   * Assert method selector is visible with all options
   */
  async assertMethodSelectorVisible(): Promise<void> {
    await expect(this.methodCard).toBeVisible({ timeout: 5000 });
    await expect(this.getByText('Payoff Method')).toBeVisible();
    await expect(this.getByText('Snowball')).toBeVisible();
    await expect(this.getByText('Avalanche')).toBeVisible();
    await expect(this.getByText('Custom')).toBeVisible();
  }

  /**
   * Assert method description is visible
   */
  async assertMethodDescription(method: 'snowball' | 'avalanche' | 'custom'): Promise<void> {
    const descriptions: Record<string, RegExp> = {
      snowball: /smallest balances first/i,
      avalanche: /highest interest rates first/i,
      custom: /choose your own/i,
    };
    await expect(this.getByText(descriptions[method])).toBeVisible();
  }

  /**
   * Assert monthly payment section is visible
   */
  async assertMonthlyPaymentSectionVisible(): Promise<void> {
    await expect(this.getByText('Monthly Payment', { exact: true })).toBeVisible();
    await expect(this.monthlyPaymentInput).toBeVisible();
    await expect(this.getByText(/minimum payments total/i)).toBeVisible();
  }

  /**
   * Assert payoff summary is visible
   */
  async assertSummaryVisible(): Promise<void> {
    await expect(this.getByText('Payoff Summary')).toBeVisible({ timeout: 5000 });
    await expect(this.getByText(/time to payoff/i)).toBeVisible();
    await expect(this.getByText(/total interest/i)).toBeVisible();
    await expect(this.getByText(/total payments/i)).toBeVisible();
  }

  /**
   * Assert settings button is visible
   */
  async assertSettingsButtonVisible(): Promise<void> {
    await expect(this.settingsButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert charts button is visible
   */
  async assertChartsButtonVisible(): Promise<void> {
    await expect(this.chartsButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert timeline button is visible
   */
  async assertTimelineButtonVisible(): Promise<void> {
    await expect(this.timelineButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert monthly payment input has expected value
   */
  async assertMonthlyPaymentValue(value: string): Promise<void> {
    await expect(this.monthlyPaymentInput).toHaveValue(value);
  }
}
