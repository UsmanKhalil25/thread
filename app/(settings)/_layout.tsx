import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useMemo } from 'react';

export const unstable_settings = { initialRouteName: 'index' };

export default function SettingsLayout() {
  const { colors } = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerTitleAlign: 'center' as const,

      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
    }),
    [colors.background]
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerTitle: 'Settings' }} />
      <Stack.Screen name="models" options={{ headerTitle: 'Models' }} />
    </Stack>
  );
}
