import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { Geist_400Regular, useFonts } from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useUniwind } from 'uniwind';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function RootLayout() {
  const { theme } = useUniwind();
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    GeistMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={SCREEN_OPTIONS} />
      <PortalHost />
    </ThemeProvider>
  );
}
