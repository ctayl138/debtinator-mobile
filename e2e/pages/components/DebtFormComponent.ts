import { Page, Locator, expect } from '@playwright/test';

/**
 * Component object for the Debt Form modal.
 * Used for both adding new debts and editing existing ones.
 */
export interface DebtFormData {
  name: string;
  type?: 'credit_card' | 'personal_loan' | 'other';
  balance: string;
  interestRate: string;
  minimumPayment: string;
}

export class DebtFormComponent {
  readonly page: Page;

  // Form locators
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly balanceInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId('debt-form');
    this.nameInput = page.getByTestId('debt-form-name');
    this.balanceInput = page.getByTestId('debt-form-balance');
    this.submitButton = page.getByTestId('debt-form-submit');
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.deleteButton = page.getByRole('button', { name: /delete debt/i });
  }

  /**
   * Get all numeric input fields (interest rate, balance, minimum payment)
   */
  get numericInputs(): Locator {
    return this.form.getByPlaceholder('0.00');
  }

  /**
   * Get a radio button for debt type
   */
  getTypeRadio(type: DebtFormData['type']): Locator {
    const labels: Record<NonNullable<DebtFormData['type']>, string> = {
      credit_card: 'Credit Card',
      personal_loan: 'Personal Loan',
      other: 'Other',
    };
    return this.page.getByRole('radio', { name: labels[type!] });
  }

  /**
   * Wait for the form to be visible
   */
  async waitForOpen(): Promise<void> {
    await expect(this.nameInput).toBeVisible({ timeout: 5000 });
  }

  /**
   * Wait for the form to close
   */
  async waitForClose(): Promise<void> {
    await expect(this.nameInput).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Fill the debt form with provided data
   */
  async fill(data: DebtFormData): Promise<void> {
    // Fill name
    await this.nameInput.fill(data.name);

    // Select debt type if specified
    if (data.type) {
      await this.getTypeRadio(data.type).click();
    }

    // Fill numeric inputs:
    // Order: [0] = interest rate, [1] = balance, [2] = minimum payment
    await this.numericInputs.nth(0).fill(data.interestRate);
    await this.numericInputs.nth(1).fill(data.balance);
    await this.numericInputs.nth(2).fill(data.minimumPayment);
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.waitForClose();
  }

  /**
   * Cancel and close the form
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForClose();
  }

  /**
   * Delete the debt (only available in edit mode)
   */
  async delete(): Promise<void> {
    await this.deleteButton.click();
    await this.waitForClose();
  }

  /**
   * Fill and submit the form in one action
   */
  async fillAndSubmit(data: DebtFormData): Promise<void> {
    await this.fill(data);
    await this.submit();
  }

  /**
   * Check if the form is in edit mode (shows "Edit Debt" title)
   */
  async isEditMode(): Promise<boolean> {
    return this.page.getByText('Edit Debt').isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Assert the form has pre-filled values (for edit mode)
   */
  async assertValues(expected: Partial<DebtFormData>): Promise<void> {
    if (expected.name) {
      await expect(this.nameInput).toHaveValue(expected.name);
    }
  }

  /**
   * Clear the name input
   */
  async clearName(): Promise<void> {
    await this.nameInput.clear();
  }

  /**
   * Assert submit button is disabled
   */
  async assertSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Assert submit button is enabled
   */
  async assertSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Assert delete button is visible
   */
  async assertDeleteVisible(): Promise<void> {
    await expect(this.deleteButton).toBeVisible({ timeout: 3000 });
  }

  /**
   * Assert form elements are visible
   */
  async assertFormElements(): Promise<void> {
    await expect(this.page.getByText('Debt Type')).toBeVisible();
    await expect(this.getTypeRadio('credit_card')).toBeVisible();
    await expect(this.getTypeRadio('personal_loan')).toBeVisible();
    await expect(this.getTypeRadio('other')).toBeVisible();
    await expect(this.balanceInput).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }
}
