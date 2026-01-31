import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createPressedStyle } from '@/utils/styles';

interface HeaderMenuButtonProps {
  color: string;
  style?: { padding?: number; marginRight?: number };
}

/**
 * Hamburger menu button for the header. Opens a menu with Settings and Help.
 */
export default function HeaderMenuButton({ color, style }: HeaderMenuButtonProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const goTo = (path: string) => {
    closeMenu();
    router.push(path);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Pressable
          onPress={openMenu}
          style={createPressedStyle(style ?? { padding: 8, marginRight: 8 })}
          accessibilityLabel="Open menu"
          accessibilityHint="Opens menu with Settings and Help"
        >
          <MaterialCommunityIcons name="menu" size={24} color={color} />
        </Pressable>
      }
      anchorPosition="bottom"
    >
      <Menu.Item
        onPress={() => goTo('/settings')}
        title="Settings"
        leadingIcon="cog-outline"
        testID="menu-item-settings"
      />
      <Menu.Item
        onPress={() => goTo('/documentation')}
        title="Help & Documentation"
        leadingIcon="book-open-outline"
        testID="menu-item-help"
      />
    </Menu>
  );
}
