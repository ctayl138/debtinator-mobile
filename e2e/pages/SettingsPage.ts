import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Settings page.
 * Handles theme selection and other settings.
 */
export class SettingsPage extends BasePage {
  // Settings sections
  readonly appearanceHeader: Locator;
  readonly lightThemeOption: Locator;
  readonly darkThemeOption: Locator;
  readonly systemThemeOption: Locator;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.appearanceHeader = this.getByText('Appearance');
    this.lightThemeOption = this.getByText('Light');
    this.darkThemeOption = this.getByText('Dark');
    this.systemThemeOption = this.getByText('System (match device)');
  }

  async goto(): Promise<void> {
    // Settings page is accessed via header button
    throw new Error('Settings page should be accessed via PayoffPage.openSettings()');
  }

  async waitForReady(): Promise<void> {
    await expect(this.appearanceHeader).toBeVisible({ timeout: 5000 });
  }

  /**
   * Select light theme
   */
  async selectLightTheme(): Promise<void> {
    await this.lightThemeOption.click();
  }

  /**
   * Select dark theme
   */
  async selectDarkTheme(): Promise<void> {
    await this.darkThemeOption.click();
  }

  /**
   * Select system theme
   */
  async selectSystemTheme(): Promise<void> {
    await this.systemThemeOption.click();
  }

  /**
   * Toggle the appearance accordion
   */
  async toggleAppearanceAccordion(): Promise<void> {
    await this.appearanceHeader.click();
  }

  /**
   * Assert appearance settings are visible
   */
  async assertAppearanceVisible(): Promise<void> {
    await expect(this.appearanceHeader).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert theme options are visible
   */
  async assertThemeOptionsVisible(): Promise<void> {
    await expect(this.lightThemeOption).toBeVisible({ timeout: 5000 });
    await expect(this.darkThemeOption).toBeVisible();
    await expect(this.systemThemeOption).toBeVisible();
  }

  /**
   * Assert theme options are hidden
   */
  async assertThemeOptionsHidden(): Promise<void> {
    await expect(this.lightThemeOption).not.toBeVisible({ timeout: 2000 });
  }

  /**
   * Expand Income accordion and set monthly income
   */
  async expandIncome(): Promise<void> {
    await this.getByRole('button', { name: 'Income' }).click();
    await expect(this.getByTestId('income-input')).toBeVisible({ timeout: 3000 });
  }

  /**
   * Set monthly income value
   */
  async setMonthlyIncome(amount: string): Promise<void> {
    await this.getByTestId('income-input').fill(amount);
    await this.getByTestId('income-input').blur();
  }

  /**
   * Expand Export Data accordion
   */
  async expandExportData(): Promise<void> {
    await this.getByText('Export Data').click();
    await expect(this.getByTestId('export-excel-button')).toBeVisible({ timeout: 3000 });
  }

  /**
   * Trigger Excel export (on web this triggers download)
   */
  async triggerExport(): Promise<void> {
    await this.getByTestId('export-excel-button').click();
  }

  /**
   * Expand Help accordion and navigate to Features Guide
   */
  async expandHelpAndOpenFeaturesGuide(): Promise<void> {
    await this.getByText('Help').click();
    await this.getByTestId('help-documentation-link').click();
  }

  /**
   * Assert Help accordion with Features Guide is visible
   */
  async assertHelpSectionVisible(): Promise<void> {
    await this.getByText('Help').click();
    await expect(this.getByText('Features Guide')).toBeVisible({ timeout: 3000 });
  }
}
