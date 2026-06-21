import '@/global.css';

import { DownloadProvider } from '@/contexts/downloads';
import { useSplashScreen } from '@/hooks/use-splash-screen';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const SCREEN_OPTIONS = {
  headerShown: false,
} as const;

export default function RootLayout() {
  const { theme } = useUniwind();
  const { isReady } = useSplashScreen();

  if (!isReady) return null;

  const activeTheme = theme ?? 'light';

  return (
    <ThemeProvider value={NAV_THEME[activeTheme]}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <DownloadProvider>
            <Stack screenOptions={SCREEN_OPTIONS} />
            <PortalHost />
          </DownloadProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
