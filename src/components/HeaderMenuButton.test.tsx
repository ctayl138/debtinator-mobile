import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import HeaderMenuButton from './HeaderMenuButton';

describe('HeaderMenuButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders menu button with Open menu label', () => {
    const { getByLabelText } = render(wrap(<HeaderMenuButton color="#000" />));
    expect(getByLabelText('Open menu')).toBeOnTheScreen();
  });

  it('opens menu and Settings navigates to /settings', () => {
    const { getByLabelText, getByTestId } = render(wrap(<HeaderMenuButton color="#000" />));
    fireEvent.press(getByLabelText('Open menu'));
    fireEvent.press(getByTestId('menu-item-settings'));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('opens menu and Help navigates to /documentation', () => {
    const { getByLabelText, getByTestId } = render(wrap(<HeaderMenuButton color="#000" />));
    fireEvent.press(getByLabelText('Open menu'));
    fireEvent.press(getByTestId('menu-item-help'));
    expect(mockPush).toHaveBeenCalledWith('/documentation');
  });
});
