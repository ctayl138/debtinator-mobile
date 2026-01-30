import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../store/useThemeStore';
import { lightTheme, darkTheme } from '../theme/themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const systemDark = useColorScheme() === 'dark';
  const isDark = mode === 'system' ? systemDark : mode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </PaperProvider>
  );
}
