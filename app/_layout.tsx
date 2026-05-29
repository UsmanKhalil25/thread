import '@/global.css';

import { useSplashScreen } from '@/hooks/use-splash-screen';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function RootLayout() {
  const { theme } = useUniwind();
  const { isReady } = useSplashScreen();

  if (!isReady) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={SCREEN_OPTIONS} />
          <PortalHost />
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
