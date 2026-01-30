/**
 * Charts screen tests with Platform.OS = 'web' to cover web-only branches
 * (orientation early return, useFocusEffect cleanup no-op).
 */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import type { Debt } from '@/types';

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: (obj: Record<string, unknown>) => obj.web ?? obj.default,
  Version: 0,
}));

const mockSetOptions = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useNavigation: () => ({ setOptions: mockSetOptions }),
    useFocusEffect: (cb: () => () => void) => {
      const cleanup = cb();
      React.useEffect(() => () => cleanup?.(), []);
    },
  };
});

const mockLockAsync = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-screen-orientation', () => ({
  lockAsync: (...args: unknown[]) => mockLockAsync(...args),
  OrientationLock: { PORTRAIT_UP: 'portrait', LANDSCAPE_LEFT: 'landscape' },
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
  totalMonths: 12,
  totalInterest: 500,
  totalPayments: 6500,
  steps: [[{ debtName: 'Card', payment: 100, remainingBalance: 0 }]],
};
jest.mock('@/utils/payoffCalculations', () => ({
  calculatePayoffSchedule: () => mockSchedule,
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import ChartsScreen from './charts';

describe('ChartsScreen (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
  });

  afterEach(() => cleanup());

  it('does not call lockAsync when orientation button pressed (Platform.OS web)', () => {
    render(wrap(<ChartsScreen />));
    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = lastCall[0].headerRight;
    const { getByLabelText } = render(wrap(headerRight()));
    fireEvent.press(getByLabelText('Switch to landscape'));
    expect(mockLockAsync).not.toHaveBeenCalled();
  });

  it('cleanup on unmount does not call lockAsync when Platform is web', () => {
    const { unmount } = render(wrap(<ChartsScreen />));
    unmount();
    expect(mockLockAsync).not.toHaveBeenCalled();
  });
});
