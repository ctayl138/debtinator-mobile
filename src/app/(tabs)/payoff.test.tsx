import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import type { Debt } from '@/types';

const mockPush = jest.fn();
let capturedSetOptions: { headerRight?: () => React.ReactNode } = {};
jest.mock('expo-router', () => ({
  useNavigation: () => ({
    setOptions: (opts: { headerRight?: () => React.ReactNode }) => {
      capturedSetOptions = opts;
    },
  }),
  useRouter: () => ({ push: mockPush }),
}));

let mockDebts: Debt[] = [];
let mockMethod = 'snowball';
let mockMonthlyPayment = '';
const mockSetMethod = jest.fn();
const mockSetMonthlyPayment = jest.fn();

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: mockMethod,
    monthlyPayment: mockMonthlyPayment,
    setMethod: mockSetMethod,
    setMonthlyPayment: mockSetMonthlyPayment,
  }),
}));

let mockMonthlyIncome = 0;
jest.mock('@/store/useIncomeStore', () => ({
  useIncomeStore: (selector: (s: { monthlyIncome: number }) => unknown) =>
    selector({ monthlyIncome: mockMonthlyIncome }),
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import PayoffScreen from './payoff';

describe('PayoffScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDebts = [];
    mockMethod = 'snowball';
    mockMonthlyPayment = '';
    mockMonthlyIncome = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders empty state when no debts', () => {
    render(wrap(<PayoffScreen />));
    expect(screen.getByTestId('payoff-empty')).toBeOnTheScreen();
    expect(screen.getByText('No Debts to Plan')).toBeOnTheScreen();
    expect(screen.getByText(/Add some debts first/)).toBeOnTheScreen();
  });

  it('renders method card and payment input when debts exist', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    expect(screen.getByTestId('payoff-method-card')).toBeOnTheScreen();
    expect(screen.getByText('Payoff Method')).toBeOnTheScreen();
    expect(screen.getByText('Snowball')).toBeOnTheScreen();
    expect(screen.getByText('Avalanche')).toBeOnTheScreen();
    expect(screen.getByText('Custom')).toBeOnTheScreen();
    expect(screen.getByText('Monthly Payment')).toBeOnTheScreen();
    expect(screen.getByTestId('monthly-payment-input')).toBeOnTheScreen();
  });

  it('calls setMethod when Avalanche is selected', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    fireEvent.press(screen.getByText('Avalanche'));
    expect(mockSetMethod).toHaveBeenCalledWith('avalanche');
  });

  it('calls setMethod when Custom is selected', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    fireEvent.press(screen.getByText('Custom'));
    expect(mockSetMethod).toHaveBeenCalledWith('custom');
  });

  it('shows payoff summary when payment >= minimums', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 10, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    render(wrap(<PayoffScreen />));
    expect(screen.getByText('Payoff Summary')).toBeOnTheScreen();
    expect(screen.getByText(/Time to Payoff/)).toBeOnTheScreen();
    expect(screen.getByText(/Total Interest/)).toBeOnTheScreen();
    expect(screen.getByText(/Total Payments/)).toBeOnTheScreen();
  });

  it('shows minimum payments total hint', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    expect(screen.getByText(/Minimum payments total/)).toBeOnTheScreen();
    expect(screen.getByText(/\$50\.00/)).toBeOnTheScreen();
  });

  it('shows snowball description when Snowball selected', () => {
    mockMethod = 'snowball';
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    expect(screen.getByText(/smallest balances first/)).toBeOnTheScreen();
  });

  it('shows avalanche description when Avalanche selected', () => {
    mockMethod = 'avalanche';
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    expect(screen.getByText(/highest interest rates first/)).toBeOnTheScreen();
  });

  it('shows custom description when Custom selected', () => {
    mockMethod = 'custom';
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    expect(screen.getByText(/Choose your own/)).toBeOnTheScreen();
  });

  it('payment input triggers setMonthlyPayment', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    render(wrap(<PayoffScreen />));
    const input = screen.getByTestId('monthly-payment-input');
    fireEvent.changeText(input, '200');
    expect(mockSetMonthlyPayment).toHaveBeenCalledWith('200');
  });

  it('header timeline and charts buttons call router.push when schedule exists', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    render(wrap(<PayoffScreen />));
    expect(capturedSetOptions.headerRight).toBeDefined();
    const HeaderRight = capturedSetOptions.headerRight!;
    const { getByLabelText, getByTestId } = render(wrap(HeaderRight()));
    fireEvent.press(getByLabelText('Open payoff timeline'));
    expect(mockPush).toHaveBeenCalledWith('/payoff-timeline');
    mockPush.mockClear();
    fireEvent.press(getByLabelText('Open charts'));
    expect(mockPush).toHaveBeenCalledWith('/charts');
    mockPush.mockClear();
    fireEvent.press(getByLabelText('Open menu'));
    fireEvent.press(getByTestId('menu-item-settings'));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('header right Pressables receive pressed state on pressIn', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    render(wrap(<PayoffScreen />));
    const HeaderRight = capturedSetOptions.headerRight!;
    const { getByLabelText } = render(wrap(HeaderRight()));
    const timelineBtn = getByLabelText('Open payoff timeline');
    fireEvent(timelineBtn, 'pressIn');
    fireEvent(timelineBtn, 'pressOut');
    const chartsBtn = getByLabelText('Open charts');
    fireEvent(chartsBtn, 'pressIn');
    fireEvent(chartsBtn, 'pressOut');
    const menuBtn = getByLabelText('Open menu');
    fireEvent(menuBtn, 'pressIn');
    fireEvent(menuBtn, 'pressOut');
    expect(timelineBtn).toBeOnTheScreen();
  });

  it('header right does not show timeline/charts buttons when schedule is null', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 100, createdAt: '' }];
    mockMonthlyPayment = '50';
    render(wrap(<PayoffScreen />));
    const HeaderRight = capturedSetOptions.headerRight!;
    const { queryByLabelText, getByLabelText } = render(wrap(HeaderRight()));
    expect(queryByLabelText('Open payoff timeline')).toBeNull();
    expect(queryByLabelText('Open charts')).toBeNull();
    expect(getByLabelText('Open menu')).toBeOnTheScreen();
  });

  it('shows income insights card when monthly income is set', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    mockMonthlyIncome = 5000;
    render(wrap(<PayoffScreen />));
    expect(screen.getByTestId('income-insights-card')).toBeOnTheScreen();
    expect(screen.getByText('Income Insights')).toBeOnTheScreen();
    expect(screen.getByText(/0\.6% of income/)).toBeOnTheScreen();
  });

  it('shows hint to add income in Settings when income is not set', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyIncome = 0;
    render(wrap(<PayoffScreen />));
    expect(screen.getByText(/Add your income in Settings/)).toBeOnTheScreen();
  });

  it('header menu button receives pressed state when schedule is null', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 100, createdAt: '' }];
    mockMonthlyPayment = '50';
    render(wrap(<PayoffScreen />));
    const HeaderRight = capturedSetOptions.headerRight!;
    const { getByLabelText } = render(wrap(HeaderRight()));
    const menuBtn = getByLabelText('Open menu');
    fireEvent(menuBtn, 'pressIn');
    fireEvent(menuBtn, 'pressOut');
    expect(menuBtn).toBeOnTheScreen();
  });
});
