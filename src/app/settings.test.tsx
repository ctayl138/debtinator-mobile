import React from 'react';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

let mockMode = 'light';
const mockSetMode = jest.fn();
jest.mock('@/store/useThemeStore', () => ({
  useThemeStore: (selector: (s: { mode: string; setMode: jest.Mock }) => unknown) =>
    selector({ mode: mockMode, setMode: mockSetMode }),
}));

let mockMonthlyIncome = 0;
const mockSetMonthlyIncome = jest.fn();
jest.mock('@/store/useIncomeStore', () => ({
  useIncomeStore: (selector: (s: { monthlyIncome: number; setMonthlyIncome: jest.Mock }) => unknown) =>
    selector({ monthlyIncome: mockMonthlyIncome, setMonthlyIncome: mockSetMonthlyIncome }),
}));

let mockDebts: { id: string; name: string; type: string; balance: number; interestRate: number; minimumPayment: number; createdAt: string }[] = [];
jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: 'snowball',
    monthlyPayment: '200',
  }),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/cache/',
  EncodingType: { Base64: 'base64' },
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

let mockPlatformOS: 'ios' | 'android' | 'web' = 'ios';
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  get OS() {
    return mockPlatformOS;
  },
  select: jest.fn((obj: Record<string, unknown>) => obj[mockPlatformOS] ?? obj.default),
}));

const mockSetOptions = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: mockSetOptions }),
  useRouter: () => ({ push: mockPush }),
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import SettingsScreen from './settings';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMode = 'light';
    mockPlatformOS = 'ios';
    mockPush.mockClear();
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

  it('renders Help accordion', () => {
    render(wrap(<SettingsScreen />));
    expect(screen.getByText('Help')).toBeOnTheScreen();
  });

  it('renders Features Guide link when Help is expanded', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Help'));
    expect(screen.getByText('Features Guide')).toBeOnTheScreen();
    expect(screen.getByText('Learn how to use all app features')).toBeOnTheScreen();
  });

  it('navigates to documentation when Features Guide is pressed', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Help'));
    fireEvent.press(screen.getByText('Features Guide'));
    expect(mockPush).toHaveBeenCalledWith('/documentation');
  });

  it('has testID on help documentation link', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Help'));
    expect(screen.getByTestId('help-documentation-link')).toBeOnTheScreen();
  });

  it('renders Income accordion', () => {
    render(wrap(<SettingsScreen />));
    expect(screen.getByText('Income')).toBeOnTheScreen();
  });

  it('renders income input when Income accordion is expanded', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Income'));
    expect(screen.getByTestId('income-input')).toBeOnTheScreen();
  });

  it('calls setMonthlyIncome when income input loses focus with valid value', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Income'));
    const input = screen.getByTestId('income-input');
    fireEvent.changeText(input, '5000');
    fireEvent(input, 'blur');
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(5000);
  });

  it('syncs income input from store when monthlyIncome > 0', () => {
    mockMonthlyIncome = 5000;
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Income'));
    const input = screen.getByTestId('income-input');
    expect(input.props.value).toBe('5000');
  });

  it('clears income and sets 0 when blur with invalid value', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Income'));
    const input = screen.getByTestId('income-input');
    fireEvent.changeText(input, 'abc');
    fireEvent(input, 'blur');
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(0);
    expect(screen.getByTestId('income-input').props.value).toBe('');
  });

  it('clears income and sets 0 when blur with negative value', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Income'));
    const input = screen.getByTestId('income-input');
    fireEvent.changeText(input, '-100');
    fireEvent(input, 'blur');
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(0);
  });

  it('clears income input when blur with zero', () => {
    mockMonthlyIncome = 5000;
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Income'));
    const input = screen.getByTestId('income-input');
    fireEvent.changeText(input, '0');
    fireEvent(input, 'blur');
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(0);
  });

  it('renders Export Data accordion', () => {
    render(wrap(<SettingsScreen />));
    expect(screen.getByText('Export Data')).toBeOnTheScreen();
  });

  it('renders Export to Excel when Export Data accordion is expanded', () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Export Data'));
    expect(screen.getByText('Export to Excel')).toBeOnTheScreen();
    expect(screen.getByTestId('export-excel-button')).toBeOnTheScreen();
  });

  it('triggers export when Export to Excel is pressed (native)', async () => {
    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Export Data'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('export-excel-button'));
      await Promise.resolve();
    });
    const FileSystem = require('expo-file-system');
    await waitFor(() => {
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });
  });

  it('shows Alert when Sharing is not available', async () => {
    const Sharing = require('expo-sharing');
    Sharing.isAvailableAsync.mockResolvedValue(false);
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation();

    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Export Data'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('export-excel-button'));
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Export Complete',
        expect.stringContaining('Use a file manager')
      );
    });

    alertSpy.mockRestore();
    Sharing.isAvailableAsync.mockResolvedValue(true);
  });

  it('shows Alert when export fails', async () => {
    const FileSystem = require('expo-file-system');
    FileSystem.writeAsStringAsync.mockRejectedValueOnce(new Error('Export failed'));
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation();

    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Export Data'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('export-excel-button'));
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Export Failed', 'Export failed');
    });

    alertSpy.mockRestore();
  });

  it('shows generic message when export throws non-Error', async () => {
    const FileSystem = require('expo-file-system');
    FileSystem.writeAsStringAsync.mockRejectedValueOnce('string error');
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation();

    render(wrap(<SettingsScreen />));
    fireEvent.press(screen.getByText('Export Data'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('export-excel-button'));
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Export Failed', 'Could not export data');
    });

    alertSpy.mockRestore();
  });
});
