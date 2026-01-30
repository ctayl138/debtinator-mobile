import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive E2E tests for Debtinator web app.
 * Tests cover all major user flows: debt management, payoff planning, charts, and settings.
 */

// Helper to wait for app to be ready
async function waitForAppReady(page: Page) {
  await expect(
    page.getByTestId('debts-empty').or(
      page.getByTestId('debts-summary').or(
        page.getByText(/no debts yet|total debt/i)
      )
    ).first()
  ).toBeVisible({ timeout: 15000 });
}

// Helper to add a debt
async function addDebt(
  page: Page,
  debt: { name: string; type?: 'credit_card' | 'personal_loan' | 'other'; balance: string; interestRate: string; minimumPayment: string }
) {
  // Click add button
  const addButton = page.getByTestId('add-debt-fab').or(
    page.getByRole('button', { name: /add debt/i })
  ).first();
  await addButton.click();

  // Wait for form to appear
  await expect(page.getByTestId('debt-form-name')).toBeVisible({ timeout: 5000 });

  // Fill in the form
  const nameInput = page.getByTestId('debt-form-name');
  await nameInput.fill(debt.name);

  // Select debt type if specified (RadioButton.Item renders as role="radio" with aria-label)
  if (debt.type) {
    const typeLabel = debt.type === 'credit_card' ? 'Credit Card' : 
                      debt.type === 'personal_loan' ? 'Personal Loan' : 'Other';
    await page.getByRole('radio', { name: typeLabel }).click();
  }

  // Form has inputs in this order with placeholder "0.00":
  // 0 - Interest Rate (% affix)
  // 1 - Balance ($ affix) - also has testID debt-form-balance
  // 2 - Minimum Payment ($ affix)
  const allInputs = page.getByTestId('debt-form').getByPlaceholder('0.00');
  
  // Fill interest rate (first 0.00 input)
  await allInputs.nth(0).fill(debt.interestRate);
  
  // Fill balance (second 0.00 input, or use testID)
  await allInputs.nth(1).fill(debt.balance);
  
  // Fill minimum payment (third 0.00 input)
  await allInputs.nth(2).fill(debt.minimumPayment);

  // Submit the form
  await page.getByTestId('debt-form-submit').click();

  // Wait for dialog to close
  await expect(page.getByTestId('debt-form-name')).not.toBeVisible({ timeout: 5000 });
}

// Helper to clear all debts (for test isolation)
async function clearAllDebts(page: Page) {
  // Check if there are debts to clear
  const summary = page.getByTestId('debts-summary');
  if (await summary.isVisible({ timeout: 1000 }).catch(() => false)) {
    // There are debts - we need to delete them
    // This is a simplified approach - in real tests you might use localStorage clearing
    // For now, we'll work with existing state
  }
}

test.describe('Debtinator - Debts Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('shows empty state when no debts', async ({ page }) => {
    // Check for empty state or summary (depends on persisted state)
    const hasDebts = await page.getByTestId('debts-summary').isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!hasDebts) {
      await expect(page.getByTestId('debts-empty')).toBeVisible();
      await expect(page.getByText(/no debts yet/i)).toBeVisible();
      await expect(page.getByText(/add your first debt/i)).toBeVisible();
    }
  });

  test('displays both tabs in tab bar', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /debts/i }).first()).toBeVisible();
    await expect(page.getByRole('tab', { name: /payoff/i }).first()).toBeVisible();
  });

  test('opens add debt form when FAB is clicked', async ({ page }) => {
    const addButton = page.getByTestId('add-debt-fab').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Form should appear in dialog
    await expect(page.getByTestId('debt-form-name')).toBeVisible({ timeout: 5000 });
    
    // Check for form elements
    await expect(page.getByText('Debt Type')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Credit Card' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Personal Loan' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Other' })).toBeVisible();
    await expect(page.getByTestId('debt-form-balance')).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('can cancel add debt form', async ({ page }) => {
    // Open form
    const addButton = page.getByTestId('add-debt-fab').first();
    await addButton.click();
    
    await expect(page.getByTestId('debt-form-name')).toBeVisible();
    
    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Form should close
    await expect(page.getByTestId('debt-form-name')).not.toBeVisible({ timeout: 3000 });
  });

  test('can add a new credit card debt', async ({ page }) => {
    await addDebt(page, {
      name: 'Test Credit Card',
      type: 'credit_card',
      balance: '5000',
      interestRate: '18.99',
      minimumPayment: '100',
    });

    // Debt should appear in list
    await expect(page.getByText('Test Credit Card')).toBeVisible({ timeout: 5000 });
    // Use a more specific locator for the balance - scoped to a card
    await expect(page.getByText('$5,000.00').first()).toBeVisible();
    await expect(page.getByText(/18\.99.*APR/i)).toBeVisible();
    
    // Summary should show
    await expect(page.getByTestId('debts-summary')).toBeVisible();
    await expect(page.getByText(/total debt/i).first()).toBeVisible();
  });

  test('can add a personal loan', async ({ page }) => {
    await addDebt(page, {
      name: 'Car Loan',
      type: 'personal_loan',
      balance: '15000',
      interestRate: '6.5',
      minimumPayment: '350',
    });

    await expect(page.getByText('Car Loan')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('$15,000.00').first()).toBeVisible();
  });

  test('groups debts by type with section headers', async ({ page }) => {
    // Add debts of different types
    await addDebt(page, {
      name: 'Visa Card',
      type: 'credit_card',
      balance: '2000',
      interestRate: '19.99',
      minimumPayment: '50',
    });

    await addDebt(page, {
      name: 'Student Loan',
      type: 'personal_loan',
      balance: '10000',
      interestRate: '5.5',
      minimumPayment: '200',
    });

    // Should see section headers
    await expect(page.getByText('Credit Cards')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Personal Loans')).toBeVisible();
  });

  test('shows summary with total debt, count, and avg APR', async ({ page }) => {
    await addDebt(page, {
      name: 'Summary Test Debt',
      balance: '1000',
      interestRate: '12',
      minimumPayment: '25',
    });

    const summary = page.getByTestId('debts-summary');
    await expect(summary).toBeVisible({ timeout: 5000 });
    
    // Check summary elements - use .first() to avoid strict mode violation
    await expect(page.getByText(/total debt/i).first()).toBeVisible();
    await expect(summary.getByText(/debt/i).first()).toBeVisible();
    await expect(page.getByText(/total min payment/i).first()).toBeVisible();
    await expect(page.getByText(/avg apr/i).first()).toBeVisible();
  });

  test('can edit an existing debt', async ({ page }) => {
    // First add a debt
    await addDebt(page, {
      name: 'Editable Debt',
      balance: '500',
      interestRate: '10',
      minimumPayment: '20',
    });

    await expect(page.getByText('Editable Debt')).toBeVisible({ timeout: 5000 });

    // Click on the debt to edit
    await page.getByText('Editable Debt').click();

    // Edit form should show with existing values
    await expect(page.getByText('Edit Debt')).toBeVisible({ timeout: 3000 });
    
    // Check that name input has the existing value using inputValue
    const nameInput = page.getByTestId('debt-form-name');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('Editable Debt');

    // Update the name
    await nameInput.clear();
    await nameInput.fill('Updated Debt Name');

    // Submit update - button text is "Update Debt" when editing
    await page.getByTestId('debt-form-submit').click();

    // Should see updated name
    await expect(page.getByText('Updated Debt Name')).toBeVisible({ timeout: 5000 });
  });

  test('edit form shows delete button', async ({ page }) => {
    await addDebt(page, {
      name: 'Deletable Debt',
      balance: '300',
      interestRate: '8',
      minimumPayment: '15',
    });

    await expect(page.getByText('Deletable Debt')).toBeVisible({ timeout: 5000 });

    // Click to edit
    await page.getByText('Deletable Debt').click();

    // Delete button should be visible
    await expect(page.getByRole('button', { name: /delete debt/i })).toBeVisible({ timeout: 3000 });
  });

  test('can delete debt from edit form', async ({ page }) => {
    await addDebt(page, {
      name: 'To Be Deleted',
      balance: '100',
      interestRate: '5',
      minimumPayment: '10',
    });

    await expect(page.getByText('To Be Deleted')).toBeVisible({ timeout: 5000 });

    // Click to edit
    await page.getByText('To Be Deleted').click();
    await expect(page.getByText('Edit Debt')).toBeVisible({ timeout: 3000 });

    // Click delete
    await page.getByRole('button', { name: /delete debt/i }).click();

    // Debt should be removed
    await expect(page.getByText('To Be Deleted')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Debtinator - Payoff Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('can navigate to Payoff tab', async ({ page }) => {
    const payoffTab = page.getByRole('tab', { name: /payoff/i }).first();
    await payoffTab.click();

    // Should see payoff content
    await expect(
      page.getByTestId('payoff-empty').or(
        page.getByTestId('payoff-method-card').or(
          page.getByText(/payoff method|no debts to plan/i)
        )
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state when no debts', async ({ page }) => {
    // Navigate to payoff
    await page.getByRole('tab', { name: /payoff/i }).first().click();

    // If no debts, should show empty state
    const hasDebts = await page.getByTestId('payoff-method-card').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!hasDebts) {
      await expect(page.getByTestId('payoff-empty')).toBeVisible();
      await expect(page.getByText(/no debts to plan/i)).toBeVisible();
    }
  });

  test('shows payoff method selector when debts exist', async ({ page }) => {
    // Add a debt first
    await addDebt(page, {
      name: 'Payoff Test Debt',
      balance: '1000',
      interestRate: '15',
      minimumPayment: '30',
    });

    // Navigate to payoff
    await page.getByRole('tab', { name: /payoff/i }).first().click();

    // Should see method selector
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Payoff Method')).toBeVisible();
    await expect(page.getByText('Snowball')).toBeVisible();
    await expect(page.getByText('Avalanche')).toBeVisible();
    await expect(page.getByText('Custom')).toBeVisible();
  });

  test('can switch between payoff methods', async ({ page }) => {
    await addDebt(page, {
      name: 'Method Test Debt',
      balance: '2000',
      interestRate: '18',
      minimumPayment: '50',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByText('Payoff Method')).toBeVisible({ timeout: 5000 });

    // Click Avalanche
    await page.getByText('Avalanche').click();
    await expect(page.getByText(/highest interest rates first/i)).toBeVisible();

    // Click Snowball
    await page.getByText('Snowball').click();
    await expect(page.getByText(/smallest balances first/i)).toBeVisible();

    // Click Custom
    await page.getByText('Custom').click();
    await expect(page.getByText(/choose your own/i)).toBeVisible();
  });

  test('shows monthly payment input', async ({ page }) => {
    await addDebt(page, {
      name: 'Payment Input Test',
      balance: '500',
      interestRate: '12',
      minimumPayment: '25',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });

    // Check for Monthly Payment section title (exact match to avoid multiple matches)
    await expect(page.getByText('Monthly Payment', { exact: true })).toBeVisible();
    await expect(page.getByTestId('monthly-payment-input')).toBeVisible();
    await expect(page.getByText(/minimum payments total/i)).toBeVisible();
  });

  test('shows payoff summary when valid payment entered', async ({ page }) => {
    await addDebt(page, {
      name: 'Summary Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });

    // Enter a payment amount
    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('100');

    // Should show summary
    await expect(page.getByText('Payoff Summary')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/time to payoff/i)).toBeVisible();
    await expect(page.getByText(/total interest/i)).toBeVisible();
    await expect(page.getByText(/total payments/i)).toBeVisible();
  });

  test('shows settings cog icon in header', async ({ page }) => {
    await page.getByRole('tab', { name: /payoff/i }).first().click();

    // Settings icon should be visible - use first() since there might be multiple
    await expect(page.getByLabel(/open settings/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to settings', async ({ page }) => {
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    
    const settingsButton = page.getByLabel(/open settings/i).first();
    await expect(settingsButton).toBeVisible({ timeout: 5000 });
    // Use force:true because inner icon element intercepts pointer events
    await settingsButton.click({ force: true });

    // Should be on settings page
    await expect(page.getByText('Appearance')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Debtinator - Charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('chart icon appears when payoff plan is configured', async ({ page }) => {
    // Add debt and configure payoff
    await addDebt(page, {
      name: 'Chart Test Debt',
      balance: '2000',
      interestRate: '15',
      minimumPayment: '50',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });

    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('100');

    // Chart icon should appear
    await expect(page.getByLabel(/open charts/i)).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to charts page', async ({ page }) => {
    await addDebt(page, {
      name: 'Charts Nav Test',
      balance: '1500',
      interestRate: '12',
      minimumPayment: '40',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });
    
    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('80');

    await expect(page.getByLabel(/open charts/i)).toBeVisible({ timeout: 5000 });
    await page.getByLabel(/open charts/i).click({ force: true });

    // Should see chart toggle buttons
    await expect(page.getByText('Principal vs Interest')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Balance Over Time')).toBeVisible();
  });

  test('pie chart is shown by default', async ({ page }) => {
    await addDebt(page, {
      name: 'Pie Chart Test',
      balance: '3000',
      interestRate: '18',
      minimumPayment: '75',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });
    
    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('150');

    await page.getByLabel(/open charts/i).click({ force: true });

    // Pie chart should be visible (default view)
    await expect(page.getByText('Principal vs Interest')).toBeVisible({ timeout: 5000 });
  });

  test('can switch to line chart', async ({ page }) => {
    await addDebt(page, {
      name: 'Line Chart Test',
      balance: '4000',
      interestRate: '16',
      minimumPayment: '100',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });
    
    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('200');

    await page.getByLabel(/open charts/i).click({ force: true });
    await expect(page.getByText('Balance Over Time')).toBeVisible({ timeout: 5000 });

    // Click to switch to line chart
    await page.getByText('Balance Over Time').click();

    // Line chart should now be selected
    await expect(page.getByText('Balance Over Time')).toBeVisible();
  });
});

test.describe('Debtinator - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Navigate to settings
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByLabel(/open settings/i).first()).toBeVisible({ timeout: 5000 });
    // Use force:true because inner icon element intercepts pointer events
    await page.getByLabel(/open settings/i).first().click({ force: true });
    
    // Wait for settings page
    await expect(page.getByText('Appearance')).toBeVisible({ timeout: 5000 });
  });

  test('shows appearance settings', async ({ page }) => {
    await expect(page.getByText('Appearance')).toBeVisible({ timeout: 5000 });
  });

  test('shows theme options in accordion', async ({ page }) => {
    // Appearance accordion should be expanded by default
    await expect(page.getByText('Light')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('System (match device)')).toBeVisible();
  });

  test('can select light theme', async ({ page }) => {
    await expect(page.getByText('Light')).toBeVisible({ timeout: 5000 });
    await page.getByText('Light').click();

    // Check icon appears next to selected option
    // The page should remain functional
    await expect(page.getByText('Appearance')).toBeVisible();
  });

  test('can select dark theme', async ({ page }) => {
    await expect(page.getByText('Dark')).toBeVisible({ timeout: 5000 });
    await page.getByText('Dark').click();

    await expect(page.getByText('Appearance')).toBeVisible();
  });

  test('can select system theme', async ({ page }) => {
    await expect(page.getByText('System (match device)')).toBeVisible({ timeout: 5000 });
    await page.getByText('System (match device)').click();

    await expect(page.getByText('Appearance')).toBeVisible();
  });

  test('can collapse and expand accordion', async ({ page }) => {
    await expect(page.getByText('Light')).toBeVisible({ timeout: 5000 });

    // Click to collapse
    await page.getByText('Appearance').click();

    // Theme options should be hidden
    await expect(page.getByText('Light')).not.toBeVisible({ timeout: 2000 });

    // Click to expand again
    await page.getByText('Appearance').click();

    // Theme options should be visible again
    await expect(page.getByText('Light')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Debtinator - Payoff Timeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('timeline icon appears when payoff configured', async ({ page }) => {
    await addDebt(page, {
      name: 'Timeline Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });
    
    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('60');

    await expect(page.getByLabel(/open payoff timeline/i)).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to timeline page', async ({ page }) => {
    await addDebt(page, {
      name: 'Timeline Nav Test',
      balance: '800',
      interestRate: '8',
      minimumPayment: '25',
    });

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });
    
    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('50');

    await expect(page.getByLabel(/open payoff timeline/i)).toBeVisible({ timeout: 5000 });
    await page.getByLabel(/open payoff timeline/i).click({ force: true });

    // Should see timeline page with content
    await expect(page.getByTestId('payoff-timeline')).toBeVisible({ timeout: 5000 });
    // Should see month headers with format "Month 1 – {Month Name}"
    await expect(page.getByText(/Month 1 –/)).toBeVisible();
  });
});

test.describe('Debtinator - Navigation', () => {
  test('can navigate between tabs', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Start on Debts tab
    await expect(
      page.getByTestId('debts-empty').or(page.getByTestId('debts-summary')).first()
    ).toBeVisible();

    // Go to Payoff
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(
      page.getByTestId('payoff-empty').or(page.getByTestId('payoff-method-card')).first()
    ).toBeVisible({ timeout: 5000 });

    // Go back to Debts
    await page.getByRole('tab', { name: /debts/i }).first().click();
    await expect(
      page.getByTestId('debts-empty').or(page.getByTestId('debts-summary')).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can navigate back from settings', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await page.getByLabel(/open settings/i).first().click({ force: true });

    await expect(page.getByText('Appearance')).toBeVisible({ timeout: 5000 });

    // Go back
    await page.goBack();

    // Should be back on payoff
    await expect(
      page.getByTestId('payoff-empty').or(page.getByTestId('payoff-method-card')).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Debtinator - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('add debt button is disabled with empty name', async ({ page }) => {
    const addButton = page.getByTestId('add-debt-fab').first();
    await addButton.click();

    await expect(page.getByTestId('debt-form-name')).toBeVisible();

    // Fill everything except name
    // Inputs with placeholder 0.00: [0]=interest, [1]=balance, [2]=min payment
    const inputs = page.getByTestId('debt-form').getByPlaceholder('0.00');
    await inputs.nth(0).fill('15');      // interest rate
    await inputs.nth(1).fill('1000');    // balance
    await inputs.nth(2).fill('30');      // min payment

    // Submit button should be disabled (or form won't submit)
    const submitButton = page.getByTestId('debt-form-submit');
    await expect(submitButton).toBeDisabled();
  });

  test('add debt button is disabled with zero balance', async ({ page }) => {
    const addButton = page.getByTestId('add-debt-fab').first();
    await addButton.click();

    await expect(page.getByTestId('debt-form-name')).toBeVisible();

    // Fill with zero balance
    const nameInput = page.getByTestId('debt-form-name');
    await nameInput.fill('Test Debt');

    // Inputs with placeholder 0.00: [0]=interest, [1]=balance, [2]=min payment
    const inputs = page.getByTestId('debt-form').getByPlaceholder('0.00');
    await inputs.nth(0).fill('15');      // interest rate
    await inputs.nth(1).fill('0');       // balance (zero)
    await inputs.nth(2).fill('30');      // min payment

    const submitButton = page.getByTestId('debt-form-submit');
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Debtinator - Data Persistence', () => {
  test('debts persist after page reload', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Add a debt with unique name
    const uniqueName = `Persist Test ${Date.now()}`;
    await addDebt(page, {
      name: uniqueName,
      balance: '999',
      interestRate: '7',
      minimumPayment: '20',
    });

    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 5000 });

    // Reload page
    await page.reload();
    await waitForAppReady(page);

    // Debt should still be there
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 5000 });
  });

  test('payoff settings persist after tab switch', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Add debt
    await addDebt(page, {
      name: 'Persist Settings Test',
      balance: '1500',
      interestRate: '14',
      minimumPayment: '40',
    });

    // Go to payoff and set values
    await page.getByRole('tab', { name: /payoff/i }).first().click();
    await expect(page.getByTestId('payoff-method-card')).toBeVisible({ timeout: 5000 });

    const paymentInput = page.getByTestId('monthly-payment-input');
    await paymentInput.fill('75');

    // Select Avalanche
    await page.getByText('Avalanche').click();

    // Go to debts and back
    await page.getByRole('tab', { name: /debts/i }).first().click();
    await page.getByRole('tab', { name: /payoff/i }).first().click();

    // Values should persist
    await expect(paymentInput).toHaveValue('75');
    await expect(page.getByText(/highest interest rates first/i)).toBeVisible();
  });
});
