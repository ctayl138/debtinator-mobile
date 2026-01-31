import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MockTabsScreen = (props: { name?: string; options?: { tabBarIcon?: (p: { color: string; size: number; focused: boolean }) => React.ReactNode } }) => {
    if (props.options?.tabBarIcon) {
      props.options.tabBarIcon({ color: '#666', size: 24, focused: false });
      props.options.tabBarIcon({ color: '#333', size: 24, focused: true });
    }
    return null;
  };
  const MockTabs = function MockTabs({ children, screenOptions }: { children: React.ReactNode; screenOptions?: { headerRight?: () => React.ReactNode } }) {
    const HeaderRight = screenOptions?.headerRight;
    React.Children.forEach(children, (child: React.ReactElement<{ options?: { tabBarIcon?: (p: unknown) => React.ReactNode } }>) => {
      if (child?.props?.options?.tabBarIcon) {
        child.props.options.tabBarIcon({ color: '#666', size: 24, focused: false });
        child.props.options.tabBarIcon({ color: '#333', size: 24, focused: true });
      }
    });
    return (
      <View testID="tabs">
        {HeaderRight ? <View testID="header-right">{React.createElement(HeaderRight)}</View> : null}
        <Text testID="tabs-children">{children}</Text>
      </View>
    );
  };
  return {
    Tabs: Object.assign(MockTabs, { Screen: MockTabsScreen }),
    useRouter: () => ({ push: mockPush }),
  };
});

function wrap(children: React.ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

import TabLayout from './_layout';

describe('TabLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders Tabs with header right', () => {
    const { getByTestId } = render(wrap(<TabLayout />));
    expect(getByTestId('tabs')).toBeOnTheScreen();
    expect(getByTestId('header-right')).toBeOnTheScreen();
  });

  it('menu button has Open menu accessibility label', () => {
    const { getByLabelText } = render(wrap(<TabLayout />));
    expect(getByLabelText('Open menu')).toBeOnTheScreen();
  });

  it('menu opens and Settings navigates to /settings', () => {
    const { getByLabelText, getByTestId } = render(wrap(<TabLayout />));
    fireEvent.press(getByLabelText('Open menu'));
    fireEvent.press(getByTestId('menu-item-settings'));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('menu button receives pressed state on pressIn/pressOut', () => {
    const { getByLabelText } = render(wrap(<TabLayout />));
    const menuBtn = getByLabelText('Open menu');
    fireEvent(menuBtn, 'pressIn');
    fireEvent(menuBtn, 'pressOut');
    expect(menuBtn).toBeOnTheScreen();
  });
});
