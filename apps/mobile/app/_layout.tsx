import '@/global.css';

import { backfillMissingTitles } from '@/db/repositories/chats.repository';
import { markInterruptedOnStartup } from '@/db/repositories/messages.repository';
import { useModelDownloadReconciliation } from '@/features/models/hooks/use-downloads';
import { useSplashScreen } from '@/hooks/use-splash-screen';
import { NAV_THEME, THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'fade',
} as const;

export default function RootLayout() {
  const { theme } = useUniwind();
  const { isReady } = useSplashScreen();
  const activeTheme = theme ?? 'light';
  useModelDownloadReconciliation(!!isReady);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(THEME[activeTheme].background);
  }, [activeTheme]);

  useEffect(() => {
    if (isReady) {
      void markInterruptedOnStartup();
      void backfillMissingTitles();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ThemeProvider value={NAV_THEME[activeTheme]}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <Stack screenOptions={SCREEN_OPTIONS} />
          <PortalHost />
        </KeyboardProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
