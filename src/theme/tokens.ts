/**
 * Design tokens for Debtinator.
 * Use these for spacing, radius, and to build light/dark color themes.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

/** Light theme: calm, colorful, easy on the eyes (soft blue + warm neutrals) */
export const lightColors = {
  primary: '#4E7BA5',
  onPrimary: '#ffffff',
  primaryContainer: '#D6E8F5',
  onPrimaryContainer: '#1A3A52',
  secondary: '#6B8F71',
  onSecondary: '#ffffff',
  surface: '#FAFAF9',
  onSurface: '#2D2D2A',
  surfaceVariant: '#EBE9E6',
  onSurfaceVariant: '#5C5A57',
  outline: '#8A8682',
  background: '#F5F3F0',
  onBackground: '#2D2D2A',
  error: '#B85450',
  onError: '#ffffff',
  card: '#FFFFFF',
  cardBorder: '#E5E3E0',
  header: '#E2E8ED',
  onHeader: '#1A3A52',
} as const;

/** Dark theme color tokens */
export const darkColors = {
  primary: '#d0bcff',
  onPrimary: '#381e72',
  primaryContainer: '#4f378b',
  onPrimaryContainer: '#eaddfb',
  secondary: '#ccc2dc',
  onSecondary: '#332d41',
  surface: '#1c1b1f',
  onSurface: '#e6e1e5',
  surfaceVariant: '#49454f',
  onSurfaceVariant: '#cac4d0',
  outline: '#938f99',
  background: '#1c1b1f',
  onBackground: '#e6e1e5',
  error: '#f2b8b5',
  onError: '#601410',
  card: '#2b2930',
  cardBorder: '#49454f',
  header: '#252330',
  onHeader: '#e6e1e5',
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';
