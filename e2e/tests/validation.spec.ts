import { test, expect } from '../fixtures';

/**
 * E2E tests for Form Validation.
 * Tests cover: required fields, validation rules.
 */
test.describe('Form Validation', () => {
  test.beforeEach(async ({ debtsPage }) => {
    await debtsPage.goto();
  });

  test('add debt button is disabled with empty name', async ({ debtsPage }) => {
    await debtsPage.openAddForm();

    // Fill everything except name
    const numericInputs = debtsPage.debtForm.numericInputs;
    await numericInputs.nth(0).fill('15'); // interest rate
    await numericInputs.nth(1).fill('1000'); // balance
    await numericInputs.nth(2).fill('30'); // min payment

    await debtsPage.debtForm.assertSubmitDisabled();
  });

  test('add debt button is disabled with zero balance', async ({ debtsPage }) => {
    await debtsPage.openAddForm();

    // Fill with zero balance
    await debtsPage.debtForm.nameInput.fill('Test Debt');

    const numericInputs = debtsPage.debtForm.numericInputs;
    await numericInputs.nth(0).fill('15'); // interest rate
    await numericInputs.nth(1).fill('0'); // balance (zero)
    await numericInputs.nth(2).fill('30'); // min payment

    await debtsPage.debtForm.assertSubmitDisabled();
  });

  test('add debt button is enabled with valid data', async ({ debtsPage }) => {
    await debtsPage.openAddForm();

    await debtsPage.debtForm.nameInput.fill('Valid Test Debt');

    const numericInputs = debtsPage.debtForm.numericInputs;
    await numericInputs.nth(0).fill('15'); // interest rate
    await numericInputs.nth(1).fill('1000'); // balance
    await numericInputs.nth(2).fill('30'); // min payment

    await debtsPage.debtForm.assertSubmitEnabled();
  });
});
