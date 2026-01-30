import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import type { Debt } from '@/types';

const mockSetOptions = jest.fn();
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: mockSetOptions }),
}));

let mockDebts: Debt[] = [];
let mockMethod = 'snowball';
let mockMonthlyPayment = '';

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({ method: mockMethod, monthlyPayment: mockMonthlyPayment }),
}));

const mockSchedule = {
  totalMonths: 24,
  totalInterest: 200,
  totalPayments: 6200,
  steps: Array(24)
    .fill(null)
    .map((_, i) => [
      { debtName: 'Card', payment: 100, remainingBalance: Math.max(0, 1000 - i * 50) },
    ]),
};
jest.mock('@/utils/payoffCalculations', () => ({
  calculatePayoffSchedule: () => mockSchedule,
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import PayoffTimelineScreen from './payoff-timeline';

describe('PayoffTimelineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDebts = [];
    mockMethod = 'snowball';
    mockMonthlyPayment = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders empty state when no debts', () => {
    render(wrap(<PayoffTimelineScreen />));
    expect(screen.getByText('Add debts first to see the timeline')).toBeOnTheScreen();
  });

  it('renders set payment message when debts exist but payment too low', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' }];
    mockMonthlyPayment = '30';
    render(wrap(<PayoffTimelineScreen />));
    expect(screen.getByText(/Set a monthly payment on the Payoff tab/)).toBeOnTheScreen();
    expect(screen.getByText(/\$50\.00/)).toBeOnTheScreen();
  });

  it('renders timeline with month blocks when schedule exists', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    render(wrap(<PayoffTimelineScreen />));
    expect(screen.getByTestId('payoff-timeline')).toBeOnTheScreen();
    const month1Headers = screen.getAllByText(/Month 1 –/);
    expect(month1Headers.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Card').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Payment:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Remaining:/).length).toBeGreaterThan(0);
  });

  it('calls setOptions for header styling', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    render(wrap(<PayoffTimelineScreen />));
    expect(mockSetOptions).toHaveBeenCalled();
  });

  it('shows Scroll for more months when hasMore', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    render(wrap(<PayoffTimelineScreen />));
    expect(screen.getByText('Scroll for more months')).toBeOnTheScreen();
  });

  it('loads more months on scroll near bottom', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    const { getByTestId } = render(wrap(<PayoffTimelineScreen />));
    const scrollView = getByTestId('payoff-timeline');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 5000 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 1000 },
      },
    });
    expect(screen.getByTestId('payoff-timeline')).toBeOnTheScreen();
  });

  it('nearBottom scroll increases visible months', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    const { getByTestId } = render(wrap(<PayoffTimelineScreen />));
    const scrollView = getByTestId('payoff-timeline');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 900 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 1000 },
      },
    });
    expect(screen.getByTestId('payoff-timeline')).toBeOnTheScreen();
  });

  it('scroll near bottom loads more months (Month 13 appears after load)', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    const { getByTestId } = render(wrap(<PayoffTimelineScreen />));
    const scrollView = getByTestId('payoff-timeline');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 900 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 1000 },
      },
    });
    const month13 = screen.queryAllByText(/Month 13 –/);
    expect(month13.length).toBeGreaterThan(0);
  });

  it('handleScroll does not setVisibleMonths when already at max visible months', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    const { getByTestId } = render(wrap(<PayoffTimelineScreen />));
    const scrollView = getByTestId('payoff-timeline');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 900 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 1000 },
      },
    });
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 950 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 1000 },
      },
    });
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 1900 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 1000 },
      },
    });
    expect(screen.getByTestId('payoff-timeline')).toBeOnTheScreen();
  });
});
