import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

export const unstable_settings = { initialRouteName: 'index' };

export default function SettingsLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  const headerLeft = useCallback(
    () => (
      <Button variant="ghost" size="icon" onPress={router.back}>
        <Icon as={ChevronLeft} className="text-foreground size-6" />
      </Button>
    ),
    [router]
  );

  const screenOptions = useMemo(
    () => ({
      headerTitle: 'Settings',
      headerTitleAlign: 'center' as const,
      headerLeft,

      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      animation: 'ios_from_right' as const,
    }),
    [colors.background, headerLeft]
  );

  return (
    <View className="flex-1">
      <Stack screenOptions={screenOptions} />
    </View>
  );
}
