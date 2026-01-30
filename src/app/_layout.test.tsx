import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/ThemeProvider', () => {
  const { View, Text } = require('react-native');
  return function MockThemeProvider({ children }: { children: React.ReactNode }) {
    return <View testID="theme-provider"><Text testID="theme-provider-child">{children}</Text></View>;
  };
});

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const MockStackScreen = () => null;
  const MockStack = function MockStack({ children }: { children: React.ReactNode }) {
    return <View testID="stack">{children}</View>;
  };
  return { Stack: Object.assign(MockStack, { Screen: MockStackScreen }) };
});

import RootLayout from './_layout';

describe('RootLayout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders ThemeProvider wrapping Stack', () => {
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('theme-provider')).toBeOnTheScreen();
    expect(getByTestId('stack')).toBeOnTheScreen();
  });

  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
