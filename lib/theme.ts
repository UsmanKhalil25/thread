import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#f4f4f5',
    cardForeground: '#09090b',
    popover: '#ffffff',
    popoverForeground: '#09090b',
    primary: '#18181b',
    primaryForeground: '#fafafa',
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    accent: '#e4e4e7',
    accentForeground: '#18181b',
    destructive: '#f87171',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#a1a1aa',
  },
  dark: {
    // Design system zinc palette
    background: '#09090b', // zinc-950
    foreground: '#fafafa', // zinc-50
    card: '#111113', // zinc-925
    cardForeground: '#fafafa',
    popover: '#111113',
    popoverForeground: '#fafafa',
    primary: '#fafafa',
    primaryForeground: '#09090b',
    secondary: '#1a1a1d', // zinc-900
    secondaryForeground: '#fafafa',
    muted: '#1a1a1d',
    mutedForeground: '#71717a', // zinc-500
    accent: '#1f1f23', // zinc-850
    accentForeground: '#fafafa',
    destructive: '#f87171', // red-400
    border: '#1f1f23', // zinc-850
    input: '#2a2a2f',
    ring: 'rgba(255,255,255,0.06)',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
