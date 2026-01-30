import React from 'react';
import { render, screen } from '@testing-library/react-native';

const mockRedirect = jest.fn();
jest.mock('expo-router', () => ({
  Redirect: function MockRedirect({ href }: { href: string }) {
    const { Text } = require('react-native');
    mockRedirect(href);
    return <Text testID="redirect">Redirect to {href}</Text>;
  },
}));

import TabIndex from './index';

describe('TabIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders Redirect with href to debts tab', () => {
    render(<TabIndex />);
    expect(mockRedirect).toHaveBeenCalledWith('/(tabs)/debts');
    expect(screen.getByTestId('redirect')).toBeOnTheScreen();
    expect(screen.getByText(/Redirect to/)).toBeOnTheScreen();
  });
});
