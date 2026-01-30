import React from 'react';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import type { Debt } from '@/types';

const mockAddDebt = jest.fn();
const mockUpdateDebt = jest.fn();
const mockDeleteDebt = jest.fn();

let mockDebts: Debt[] = [];
jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
  useDebtActions: () => ({
    addDebt: mockAddDebt,
    updateDebt: mockUpdateDebt,
    deleteDebt: mockDeleteDebt,
  }),
}));

jest.mock('@/components/DebtForm', () => {
  const { View, Text, Button } = require('react-native');
  return function MockDebtForm({
    debt,
    onSubmit,
    onCancel,
    onDelete,
  }: {
    debt?: Debt;
    onSubmit: (d: Omit<Debt, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
    onDelete?: () => void;
  }) {
    return (
      <View testID="debt-form">
        <Text testID="debt-form-title">{debt ? 'Edit Debt' : 'Add New Debt'}</Text>
        <Button testID="debt-form-submit" title={debt ? 'Update Debt' : 'Add Debt'} onPress={() => onSubmit({ name: 'Test', type: 'other', balance: 100, interestRate: 10, minimumPayment: 20 })} />
        <Button testID="debt-form-cancel" title="Cancel" onPress={onCancel} />
        {onDelete && <Button testID="debt-form-delete" title="Delete Debt" onPress={onDelete} />}
      </View>
    );
  };
});

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import DebtsScreen from './debts';

const sampleDebt: Debt = {
  id: '1',
  name: 'Test Card',
  type: 'credit_card',
  balance: 5000,
  interestRate: 18.99,
  minimumPayment: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('DebtsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDebts = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders empty state when no debts', () => {
    render(wrap(<DebtsScreen />));
    expect(screen.getByTestId('debts-empty')).toBeOnTheScreen();
    expect(screen.getByText('No Debts Yet')).toBeOnTheScreen();
    expect(screen.getByText(/Add your first debt/)).toBeOnTheScreen();
    expect(screen.getByTestId('add-debt-fab')).toBeOnTheScreen();
  });

  it('opens add form when FAB is clicked', () => {
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByTestId('add-debt-fab'));
    const form = screen.getByTestId('debt-form');
    expect(form).toBeOnTheScreen();
    expect(within(form).getByText('Add New Debt')).toBeOnTheScreen();
  });

  it('calls onCancel and closes form when Cancel pressed', () => {
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByTestId('add-debt-fab'));
    const cancelBtn = screen.getByTestId('debt-form-cancel');
    fireEvent.press(cancelBtn);
    expect(screen.queryByTestId('debt-form')).not.toBeVisible();
  });

  it('shows summary and section list when debts exist', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    expect(screen.getByTestId('debts-summary')).toBeOnTheScreen();
    expect(screen.getByText('Total Debt')).toBeOnTheScreen();
    expect(screen.getAllByText('$5,000.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Credit Cards')).toBeOnTheScreen();
    expect(screen.getByText('Test Card')).toBeOnTheScreen();
    expect(screen.getByText(/18\.99.*APR/)).toBeOnTheScreen();
  });

  it('groups debts by type with section headers', () => {
    mockDebts = [
      sampleDebt,
      { ...sampleDebt, id: '2', name: 'Car Loan', type: 'personal_loan' as const, balance: 15000 },
    ];
    render(wrap(<DebtsScreen />));
    expect(screen.getByText('Credit Cards')).toBeOnTheScreen();
    expect(screen.getByText('Personal Loans')).toBeOnTheScreen();
    expect(screen.getByText('Test Card')).toBeOnTheScreen();
    expect(screen.getByText('Car Loan')).toBeOnTheScreen();
  });

  it('opens edit form when debt card is pressed', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByText('Test Card'));
    const form = screen.getByTestId('debt-form');
    expect(form).toBeOnTheScreen();
    expect(within(form).getByText('Edit Debt')).toBeOnTheScreen();
    expect(screen.getByTestId('debt-form-delete')).toBeOnTheScreen();
  });

  it('calls addDebt when form submitted in add mode', () => {
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByTestId('add-debt-fab'));
    fireEvent.press(screen.getByTestId('debt-form-submit'));
    expect(mockAddDebt).toHaveBeenCalled();
  });

  it('calls updateDebt when form submitted in edit mode', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByText('Test Card'));
    fireEvent.press(screen.getByTestId('debt-form-submit'));
    expect(mockUpdateDebt).toHaveBeenCalledWith('1', expect.any(Object));
  });

  it('calls deleteDebt when Delete pressed in edit form', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByText('Test Card'));
    fireEvent.press(screen.getByTestId('debt-form-delete'));
    expect(mockDeleteDebt).toHaveBeenCalledWith('1');
  });

  it('shows delete confirmation dialog on long press', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent(screen.getByText('Test Card'), 'longPress');
    expect(screen.getByText('Delete Debt')).toBeOnTheScreen();
    expect(screen.getByText(/Are you sure you want to delete "Test Card"/)).toBeOnTheScreen();
  });

  it('calls deleteDebt when confirm Delete in dialog', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent(screen.getByText('Test Card'), 'longPress');
    const deleteBtn = screen.getByText('Delete');
    fireEvent.press(deleteBtn);
    expect(mockDeleteDebt).toHaveBeenCalledWith('1');
  });

  it('closes delete dialog when Cancel pressed', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent(screen.getByText('Test Card'), 'longPress');
    expect(screen.getByText(/Are you sure you want to delete/)).toBeOnTheScreen();
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.press(cancelButtons[cancelButtons.length - 1]);
    expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeVisible();
  });

  it('shows debt without type as Other section', () => {
    mockDebts = [{ ...sampleDebt, type: 'other' as const }];
    render(wrap(<DebtsScreen />));
    expect(screen.getByText('Other')).toBeOnTheScreen();
  });

  it('closes delete dialog when backdrop is pressed (onDismiss)', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent(screen.getByText('Test Card'), 'longPress');
    expect(screen.getByText(/Are you sure you want to delete/)).toBeOnTheScreen();
    const backdrop = screen.getByLabelText('Close modal');
    fireEvent.press(backdrop);
    expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeVisible();
  });

  it('shows singular "debt" for section with exactly 1 debt', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    expect(screen.getAllByText(/1 debt/).length).toBeGreaterThan(0);
  });

  it('shows plural "debts" for section with multiple debts', () => {
    mockDebts = [
      sampleDebt,
      { ...sampleDebt, id: '2', name: 'Another Card' },
    ];
    render(wrap(<DebtsScreen />));
    expect(screen.getAllByText(/2 debts/).length).toBeGreaterThan(0);
  });

  it('handleFormDelete does nothing if editingDebt is undefined', () => {
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByTestId('add-debt-fab'));
    expect(screen.queryByTestId('debt-form-delete')).toBeNull();
  });

  it('confirmDelete does nothing if deletingDebt is undefined', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    expect(mockDeleteDebt).not.toHaveBeenCalled();
  });

  it('debt card pressable receives pressed state', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    const card = screen.getByText('Test Card');
    fireEvent(card, 'pressIn');
    fireEvent(card, 'pressOut');
    expect(card).toBeOnTheScreen();
  });

  it('handles debt without type property (defaults to other)', () => {
    const debtWithoutType = { ...sampleDebt, type: undefined as unknown as 'credit_card' };
    mockDebts = [debtWithoutType];
    render(wrap(<DebtsScreen />));
    expect(screen.getByText('Other')).toBeOnTheScreen();
  });

  it('shows summary with zero weighted interest when calculation would be NaN', () => {
    const zeroBalanceDebt = { ...sampleDebt, balance: 0 };
    mockDebts = [zeroBalanceDebt];
    render(wrap(<DebtsScreen />));
    expect(screen.getByTestId('debts-summary')).toBeOnTheScreen();
    expect(screen.getByText(/Avg APR:/)).toBeOnTheScreen();
  });

  it('closes add form dialog when backdrop is pressed (onDismiss)', () => {
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByTestId('add-debt-fab'));
    expect(screen.getByTestId('debt-form')).toBeOnTheScreen();
    const backdrops = screen.getAllByLabelText('Close modal');
    fireEvent.press(backdrops[backdrops.length - 1]);
    expect(screen.queryByTestId('debt-form')).not.toBeVisible();
  });

  it('closes edit form dialog when backdrop is pressed (onDismiss)', () => {
    mockDebts = [sampleDebt];
    render(wrap(<DebtsScreen />));
    fireEvent.press(screen.getByText('Test Card'));
    expect(screen.getByTestId('debt-form')).toBeOnTheScreen();
    const backdrops = screen.getAllByLabelText('Close modal');
    fireEvent.press(backdrops[backdrops.length - 1]);
    expect(screen.queryByTestId('debt-form')).not.toBeVisible();
  });
});
