import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { lightColors, darkColors } from './tokens';

function buildLightTheme(): MD3Theme {
  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: lightColors.primary,
      onPrimary: lightColors.onPrimary,
      primaryContainer: lightColors.primaryContainer,
      onPrimaryContainer: lightColors.onPrimaryContainer,
      secondary: lightColors.secondary,
      onSecondary: lightColors.onSecondary,
      surface: lightColors.surface,
      onSurface: lightColors.onSurface,
      surfaceVariant: lightColors.surfaceVariant,
      onSurfaceVariant: lightColors.onSurfaceVariant,
      outline: lightColors.outline,
      background: lightColors.background,
      onBackground: lightColors.onBackground,
      error: lightColors.error,
      onError: lightColors.onError,
      header: lightColors.header,
      onHeader: lightColors.onHeader,
    } as MD3Theme['colors'] & { header: string; onHeader: string },
  };
}

function buildDarkTheme(): MD3Theme {
  return {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: darkColors.primary,
      onPrimary: darkColors.onPrimary,
      primaryContainer: darkColors.primaryContainer,
      onPrimaryContainer: darkColors.onPrimaryContainer,
      secondary: darkColors.secondary,
      onSecondary: darkColors.onSecondary,
      surface: darkColors.surface,
      onSurface: darkColors.onSurface,
      surfaceVariant: darkColors.surfaceVariant,
      onSurfaceVariant: darkColors.onSurfaceVariant,
      outline: darkColors.outline,
      background: darkColors.background,
      onBackground: darkColors.onBackground,
      error: darkColors.error,
      onError: darkColors.onError,
      header: darkColors.header,
      onHeader: darkColors.onHeader,
    } as MD3Theme['colors'] & { header: string; onHeader: string },
  };
}

export const lightTheme = buildLightTheme();
export const darkTheme = buildDarkTheme();
