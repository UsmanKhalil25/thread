import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView edges={SAFE_AREA_EDGES} style={S.flex}>
      <Stack screenOptions={screenOptions} />
    </SafeAreaView>
  );
}

const SAFE_AREA_EDGES = ['bottom'] as const;

const S = StyleSheet.create({ flex: { flex: 1 } });
