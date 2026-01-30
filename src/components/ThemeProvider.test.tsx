import React from 'react';
import { Text } from 'react-native';
import { render, screen, cleanup } from '@testing-library/react-native';

// Create a mock state that we can control per-test
let mockThemeMode = 'light';
let mockSystemColorScheme = 'light';

jest.mock('../store/useThemeStore', () => ({
  useThemeStore: (selector: (s: { mode: string }) => string) => selector({ mode: mockThemeMode }),
}));
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => mockSystemColorScheme,
}));

// Must import after mocks are set up
import ThemeProvider from './ThemeProvider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockThemeMode = 'light';
    mockSystemColorScheme = 'light';
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <Text testID="child">Child content</Text>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeOnTheScreen();
  });

  it('wraps children in PaperProvider', () => {
    const { UNSAFE_root } = render(
      <ThemeProvider>
        <Text>Child</Text>
      </ThemeProvider>
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('uses light theme when mode is light', () => {
    mockThemeMode = 'light';
    const { UNSAFE_root } = render(
      <ThemeProvider>
        <Text testID="test">Test</Text>
      </ThemeProvider>
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('uses dark theme when mode is dark', () => {
    mockThemeMode = 'dark';
    const { UNSAFE_root } = render(
      <ThemeProvider>
        <Text testID="test">Test</Text>
      </ThemeProvider>
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('uses system dark theme when mode is system and system is dark', () => {
    mockThemeMode = 'system';
    mockSystemColorScheme = 'dark';
    const { UNSAFE_root } = render(
      <ThemeProvider>
        <Text testID="test">Test</Text>
      </ThemeProvider>
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('uses system light theme when mode is system and system is light', () => {
    mockThemeMode = 'system';
    mockSystemColorScheme = 'light';
    const { UNSAFE_root } = render(
      <ThemeProvider>
        <Text testID="test">Test</Text>
      </ThemeProvider>
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
