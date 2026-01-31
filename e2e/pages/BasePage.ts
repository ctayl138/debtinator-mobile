import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page class providing common functionality for all page objects.
 * Implements the Page Object Model pattern.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page's default URL
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the page to be ready for interaction
   */
  abstract waitForReady(): Promise<void>;

  /**
   * Get a locator by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get a locator by role
   */
  getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get a locator by text
   */
  getByText(
    text: string | RegExp,
    options?: { exact?: boolean }
  ): Locator {
    return this.page.getByText(text, options);
  }

  /**
   * Get a locator by label
   */
  getByLabel(text: string | RegExp): Locator {
    return this.page.getByLabel(text);
  }

  /**
   * Wait for an element to be visible
   */
  async waitForVisible(locator: Locator, timeout = 5000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Wait for an element to be hidden
   */
  async waitForHidden(locator: Locator, timeout = 5000): Promise<void> {
    await expect(locator).not.toBeVisible({ timeout });
  }

  /**
   * Check if an element is visible (non-throwing)
   */
  async isVisible(locator: Locator, timeout = 1000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  /**
   * Navigate to a tab by name
   */
  async navigateToTab(tabName: string | RegExp): Promise<void> {
    const tab = this.getByRole('tab', { name: tabName }).first();
    await tab.click();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }
}
