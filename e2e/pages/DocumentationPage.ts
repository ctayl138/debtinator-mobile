import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Help & Documentation screen.
 */
export class DocumentationPage extends BasePage {
  readonly documentationScrollView: Locator;
  readonly debtManagementAccordion: Locator;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.documentationScrollView = this.getByTestId('documentation-scroll-view');
    this.debtManagementAccordion = this.getByTestId('accordion-debt-management');
  }

  async goto(): Promise<void> {
    throw new Error('Documentation is accessed via menu > Help & Documentation');
  }

  async waitForReady(): Promise<void> {
    await expect(this.documentationScrollView).toBeVisible({ timeout: 5000 });
    await expect(this.getByText(/comprehensive guide/i)).toBeVisible();
  }

  async assertContentVisible(): Promise<void> {
    await expect(this.documentationScrollView).toBeVisible();
    await expect(this.debtManagementAccordion).toBeVisible();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }
}
