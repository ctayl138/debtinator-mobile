import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

const mockSetOptions = jest.fn();
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: mockSetOptions }),
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import DocumentationScreen from './documentation';

describe('DocumentationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the main title', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText('Features Guide')).toBeOnTheScreen();
  });

  it('renders the subtitle', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText('Comprehensive guide to all features in Debtinator.')).toBeOnTheScreen();
  });

  it('renders all accordion sections', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText('Debt Management')).toBeOnTheScreen();
    expect(screen.getByText('Payoff Planning')).toBeOnTheScreen();
    expect(screen.getByText('Data Visualization')).toBeOnTheScreen();
    expect(screen.getByText('Settings & Customization')).toBeOnTheScreen();
    expect(screen.getByText('Tips & Best Practices')).toBeOnTheScreen();
    expect(screen.getByText('Accessibility')).toBeOnTheScreen();
  });

  it('calls setOptions on mount (useLayoutEffect)', () => {
    render(wrap(<DocumentationScreen />));
    expect(mockSetOptions).toHaveBeenCalled();
  });

  it('expands Debt Management by default and shows content', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText('The Debts screen is your central hub for tracking all outstanding debts.')).toBeOnTheScreen();
  });

  it('switches to Payoff Planning when pressed', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Payoff Planning'));
    expect(screen.getByText('Create a strategic plan to become debt-free.')).toBeOnTheScreen();
  });

  it('switches to Data Visualization when pressed', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Data Visualization'));
    expect(screen.getByText('From the Payoff tab (when you have a valid plan):')).toBeOnTheScreen();
  });

  it('switches to Settings & Customization when pressed', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Settings & Customization'));
    expect(screen.getByText('Tap the gear icon in the header from any screen.')).toBeOnTheScreen();
  });

  it('switches to Tips & Best Practices when pressed', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Tips & Best Practices'));
    expect(screen.getByText('Add all your debts - Include everything for accurate planning')).toBeOnTheScreen();
  });

  it('switches to Accessibility when pressed', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Accessibility'));
    expect(screen.getByText('When running Debtinator in a web browser:')).toBeOnTheScreen();
  });

  it('collapses accordion when pressing the same section again', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText('The Debts screen is your central hub for tracking all outstanding debts.')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Debt Management'));
    fireEvent.press(screen.getByText('Debt Management'));
    expect(screen.getByText('The Debts screen is your central hub for tracking all outstanding debts.')).toBeOnTheScreen();
  });

  it('renders Debt Management content sections', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText('Adding a New Debt')).toBeOnTheScreen();
    expect(screen.getByText('Debt Types')).toBeOnTheScreen();
    expect(screen.getByText('Viewing Debt Summary')).toBeOnTheScreen();
    expect(screen.getByText('Editing a Debt')).toBeOnTheScreen();
    expect(screen.getByText('Deleting a Debt')).toBeOnTheScreen();
  });

  it('renders Payoff Planning content sections', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Payoff Planning'));
    expect(screen.getByText('Snowball Method')).toBeOnTheScreen();
    expect(screen.getByText('Avalanche Method')).toBeOnTheScreen();
    expect(screen.getByText('Setting Up Your Payoff Plan')).toBeOnTheScreen();
    expect(screen.getByText('Reading the Payoff Summary')).toBeOnTheScreen();
    expect(screen.getByText('Example Scenario')).toBeOnTheScreen();
  });

  it('renders Data Visualization content sections', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Data Visualization'));
    expect(screen.getByText('Accessing Charts')).toBeOnTheScreen();
    expect(screen.getByText('Principal vs. Interest Pie Chart')).toBeOnTheScreen();
    expect(screen.getByText('Balance Over Time Line Chart')).toBeOnTheScreen();
    expect(screen.getByText('Screen Orientation')).toBeOnTheScreen();
    expect(screen.getByText('Payoff Timeline')).toBeOnTheScreen();
  });

  it('renders Settings content sections', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Settings & Customization'));
    expect(screen.getByText('Accessing Settings')).toBeOnTheScreen();
    expect(screen.getByText('Theme Mode')).toBeOnTheScreen();
    expect(screen.getByText('Data Persistence')).toBeOnTheScreen();
  });

  it('renders Tips content sections', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Tips & Best Practices'));
    expect(screen.getByText('Getting Started')).toBeOnTheScreen();
    expect(screen.getByText('Maximizing Your Payoff')).toBeOnTheScreen();
    expect(screen.getByText('Choosing Your Method')).toBeOnTheScreen();
  });

  it('renders Accessibility content sections', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Accessibility'));
    expect(screen.getByText('Keyboard Shortcuts (Web)')).toBeOnTheScreen();
    expect(screen.getByText('Accessibility Features')).toBeOnTheScreen();
  });

  it('renders warning message in Debt Management section', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByText(/Deletion is permanent and cannot be undone/)).toBeOnTheScreen();
  });

  it('renders note message in Data Visualization section', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Data Visualization'));
    expect(screen.getByText(/Orientation control is not available on web/)).toBeOnTheScreen();
  });

  it('renders note message in Settings section', () => {
    render(wrap(<DocumentationScreen />));
    fireEvent.press(screen.getByText('Settings & Customization'));
    expect(screen.getByText(/Data is stored only on your device/)).toBeOnTheScreen();
  });

  it('has testID on scroll view', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByTestId('documentation-scroll-view')).toBeOnTheScreen();
  });

  it('has testIDs on accordion sections', () => {
    render(wrap(<DocumentationScreen />));
    expect(screen.getByTestId('accordion-debt-management')).toBeOnTheScreen();
    expect(screen.getByTestId('accordion-payoff-planning')).toBeOnTheScreen();
    expect(screen.getByTestId('accordion-data-visualization')).toBeOnTheScreen();
    expect(screen.getByTestId('accordion-settings')).toBeOnTheScreen();
    expect(screen.getByTestId('accordion-tips')).toBeOnTheScreen();
    expect(screen.getByTestId('accordion-accessibility')).toBeOnTheScreen();
  });
});
