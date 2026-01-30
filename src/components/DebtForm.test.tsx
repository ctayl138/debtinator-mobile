import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import DebtForm from './DebtForm';
import type { Debt } from '../types';

function wrap(children: React.ReactNode) {
  return (
    <PaperProvider>
      {children}
    </PaperProvider>
  );
}

const validDebtData = {
  name: 'Test Card',
  type: 'credit_card' as const,
  balance: 1000,
  interestRate: 18,
  minimumPayment: 50,
};

describe('DebtForm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  it('renders add form when no debt provided', () => {
    render(
      wrap(
        <DebtForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      )
    );
    expect(screen.getByTestId('debt-form')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText(/Credit Card, Car Loan/)).toBeOnTheScreen();
    expect(screen.getByText('Add Debt')).toBeOnTheScreen();
    expect(screen.getByText('Cancel')).toBeOnTheScreen();
  });

  it('renders edit form when debt provided', () => {
    const debt: Debt = {
      id: '1',
      name: 'My Card',
      type: 'credit_card',
      balance: 500,
      interestRate: 15,
      minimumPayment: 25,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    render(
      wrap(
        <DebtForm
          debt={debt}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      )
    );
    expect(screen.getByDisplayValue('My Card')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('500')).toBeOnTheScreen();
    expect(screen.getByText('Update Debt')).toBeOnTheScreen();
  });

  it('shows Delete Debt button when debt and onDelete provided', () => {
    const debt: Debt = {
      id: '1',
      name: 'Card',
      type: 'credit_card',
      balance: 100,
      interestRate: 10,
      minimumPayment: 10,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const onDelete = jest.fn();
    render(
      wrap(
        <DebtForm
          debt={debt}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          onDelete={onDelete}
        />
      )
    );
    const deleteBtn = screen.getByText('Delete Debt');
    expect(deleteBtn).toBeOnTheScreen();
    fireEvent.press(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not show Delete Debt when no debt', () => {
    render(
      wrap(
        <DebtForm onSubmit={jest.fn()} onCancel={jest.fn()} onDelete={jest.fn()} />
      )
    );
    expect(screen.queryByText('Delete Debt')).not.toBeOnTheScreen();
  });

  it('calls onCancel when Cancel pressed', () => {
    const onCancel = jest.fn();
    render(wrap(<DebtForm onSubmit={jest.fn()} onCancel={onCancel} />));
    fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('submit button is disabled when name empty', () => {
    render(wrap(<DebtForm onSubmit={jest.fn()} onCancel={jest.fn()} />));
    fireEvent.changeText(screen.getByTestId('debt-form-balance'), '1000');
    const inputs = screen.getAllByPlaceholderText('0.00');
    fireEvent.changeText(inputs[0], '18'); // interest
    fireEvent.changeText(inputs[2], '50'); // minimum payment
    expect(screen.getByText('Add Debt')).toBeDisabled();
  });

  it('submit button is disabled when balance is zero or invalid', () => {
    render(wrap(<DebtForm onSubmit={jest.fn()} onCancel={jest.fn()} />));
    fireEvent.changeText(screen.getByTestId('debt-form-name'), 'Card');
    fireEvent.changeText(screen.getByTestId('debt-form-balance'), '0');
    expect(screen.getByText('Add Debt')).toBeDisabled();
  });

  it('calls onSubmit with trimmed data when valid and Add Debt pressed', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm onSubmit={onSubmit} onCancel={jest.fn()} />));
    const nameInput = screen.getByPlaceholderText(/Credit Card, Car Loan/);
    fireEvent.changeText(nameInput, '  Test Card  ');
    fireEvent.changeText(screen.getByTestId('debt-form-balance'), '1000');
    const inputs = screen.getAllByPlaceholderText('0.00');
    fireEvent.changeText(inputs[0], '18'); // interest
    fireEvent.changeText(inputs[2], '50'); // minimum payment
    fireEvent.press(screen.getByText('Add Debt'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Card',
        type: 'other', // default type when adding new debt
        balance: 1000,
        interestRate: 18,
        minimumPayment: 50,
      })
    );
  });

  it('does not call onSubmit when name is empty', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm onSubmit={onSubmit} onCancel={jest.fn()} />));
    fireEvent.changeText(screen.getByTestId('debt-form-balance'), '1000');
    const inputs = screen.getAllByPlaceholderText('0.00');
    fireEvent.changeText(inputs[0], '18');
    fireEvent.changeText(inputs[2], '50');
    fireEvent.press(screen.getByText('Add Debt'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows changing debt type via radio buttons', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm onSubmit={onSubmit} onCancel={jest.fn()} />));
    
    // Fill in valid form data
    fireEvent.changeText(screen.getByTestId('debt-form-name'), 'Test Debt');
    fireEvent.changeText(screen.getByTestId('debt-form-balance'), '1000');
    const inputs = screen.getAllByPlaceholderText('0.00');
    fireEvent.changeText(inputs[0], '18');
    fireEvent.changeText(inputs[2], '50');
    
    // Select credit_card type by pressing the RadioButton.Item (find by accessible name)
    fireEvent.press(screen.getByRole('radio', { name: 'Credit Card' }));
    fireEvent.press(screen.getByText('Add Debt'));
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'credit_card',
      })
    );
  });

  it('allows selecting personal_loan type', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm onSubmit={onSubmit} onCancel={jest.fn()} />));
    
    fireEvent.changeText(screen.getByTestId('debt-form-name'), 'Test Loan');
    fireEvent.changeText(screen.getByTestId('debt-form-balance'), '5000');
    const inputs = screen.getAllByPlaceholderText('0.00');
    fireEvent.changeText(inputs[0], '8');
    fireEvent.changeText(inputs[2], '100');
    
    // Select personal_loan type by pressing the RadioButton.Item (find by accessible name)
    fireEvent.press(screen.getByRole('radio', { name: 'Personal Loan' }));
    fireEvent.press(screen.getByText('Add Debt'));
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'personal_loan',
      })
    );
  });
});
