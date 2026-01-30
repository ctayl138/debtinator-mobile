import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

let mockMode = 'light';
const mockSetMode = jest.fn();
jest.mock('@/store/useThemeStore', () => ({
  useThemeStore: (selector: (s: { mode: string; setMode: jest.Mock }) => unknown) =>
    selector({ mode: mockMode, setMode: mockSetMode }),
}));

const mockSetOptions = jest.fn();
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: mockSetOptions }),
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import SettingsScreen from './settings';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMode = 'light';
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders Appearance accordion', () => {
    render(wrap(<SettingsScreen />));
    expect(screen.getByText('Appearance')).toBeOnTheScreen();
  });

  it('renders theme options Light, Dark, System', () => {
    render(wrap(<SettingsScreen />));
    expect(screen.getByText('Light')).toBeOnTheScreen();
    expect(screen.getByText('Dark')).toBeOnTheScreen();
    expect(screen.getByText('System (match device)')).toBeOnTheScreen();
  });

  it('calls setOptions on mount (useLayoutEffect)', () => {
    render(wrap(<SettingsScreen />));
    expect(mockSetOptions).toHaveBeenCalled();
  });

  it('calls setMode when Light is pressed', () => {
    mockMode = 'dark';
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Light'));
    expect(mockSetMode).toHaveBeenCalledWith('light');
  });

  it('calls setMode when Dark is pressed', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Dark'));
    expect(mockSetMode).toHaveBeenCalledWith('dark');
  });

  it('calls setMode when System (match device) is pressed', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('System (match device)'));
    expect(mockSetMode).toHaveBeenCalledWith('system');
  });

  it('toggles accordion when Appearance is pressed', () => {
    render(wrap(<SettingsScreen />));
    expect(screen.getByText('Light')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Appearance'));
    fireEvent.press(screen.getByText('Appearance'));
    expect(screen.getByText('Light')).toBeOnTheScreen();
  });
});
