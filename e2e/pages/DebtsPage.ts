import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { DebtFormComponent, DebtFormData } from './components/DebtFormComponent';

/**
 * Page Object for the Debts tab.
 * Handles debt list viewing, adding, editing, and deleting debts.
 */
export class DebtsPage extends BasePage {
  // Page elements
  readonly emptyState: Locator;
  readonly summary: Locator;
  readonly addButton: Locator;
  readonly debtForm: DebtFormComponent;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.emptyState = this.getByTestId('debts-empty');
    this.summary = this.getByTestId('debts-summary');
    this.addButton = this.getByTestId('add-debt-fab').first();
    this.debtForm = new DebtFormComponent(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(
      this.emptyState
        .or(this.summary)
        .or(this.getByText(/no debts yet|total debt/i))
        .first()
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Check if debts exist
   */
  async hasDebts(): Promise<boolean> {
    return this.isVisible(this.summary, 1000);
  }

  /**
   * Open the add debt form
   */
  async openAddForm(): Promise<void> {
    await this.addButton.click();
    await this.debtForm.waitForOpen();
  }

  /**
   * Add a new debt
   */
  async addDebt(data: DebtFormData): Promise<void> {
    await this.openAddForm();
    await this.debtForm.fillAndSubmit(data);
  }

  /**
   * Click on a debt by name to open edit form
   */
  async openDebtForEdit(debtName: string): Promise<void> {
    await this.getByText(debtName).click();
    await expect(this.page.getByText('Edit Debt')).toBeVisible({ timeout: 3000 });
  }

  /**
   * Edit an existing debt
   */
  async editDebt(debtName: string, newData: Partial<DebtFormData>): Promise<void> {
    await this.openDebtForEdit(debtName);
    
    if (newData.name) {
      await this.debtForm.clearName();
      await this.debtForm.nameInput.fill(newData.name);
    }
    
    await this.debtForm.submit();
  }

  /**
   * Delete a debt by name
   */
  async deleteDebt(debtName: string): Promise<void> {
    await this.openDebtForEdit(debtName);
    await this.debtForm.delete();
  }

  /**
   * Assert a debt is visible in the list
   */
  async assertDebtVisible(debtName: string): Promise<void> {
    await expect(this.getByText(debtName)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert a debt is not visible in the list
   */
  async assertDebtNotVisible(debtName: string): Promise<void> {
    await expect(this.getByText(debtName)).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert empty state is shown
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.getByText(/no debts yet/i)).toBeVisible();
    await expect(this.getByText(/add your first debt/i)).toBeVisible();
  }

  /**
   * Assert summary section is visible with expected elements
   */
  async assertSummaryVisible(): Promise<void> {
    await expect(this.summary).toBeVisible({ timeout: 5000 });
    await expect(this.getByText(/total debt/i).first()).toBeVisible();
    await expect(this.getByText(/total min payment/i).first()).toBeVisible();
    await expect(this.getByText(/avg apr/i).first()).toBeVisible();
  }

  /**
   * Assert debt balance is displayed
   */
  async assertDebtBalance(balance: string): Promise<void> {
    await expect(this.getByText(balance).first()).toBeVisible();
  }

  /**
   * Assert debt APR is displayed
   */
  async assertDebtAPR(apr: string): Promise<void> {
    const aprRegex = new RegExp(`${apr}.*APR`, 'i');
    await expect(this.getByText(aprRegex)).toBeVisible();
  }

  /**
   * Assert section headers are visible
   */
  async assertSectionHeaders(headers: string[]): Promise<void> {
    for (const header of headers) {
      await expect(this.getByText(header)).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Assert both tabs are visible
   */
  async assertTabsVisible(): Promise<void> {
    await expect(this.getByRole('tab', { name: /debts/i }).first()).toBeVisible();
    await expect(this.getByRole('tab', { name: /payoff/i }).first()).toBeVisible();
  }
}
