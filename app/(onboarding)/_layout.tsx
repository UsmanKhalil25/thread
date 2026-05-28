import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { useTheme } from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS: Record<string, number> = {
  index: 1,
  privacy: 2,
  suggestion: 3,
};

const TOTAL = Object.keys(STEPS).length;

export default function OnboardingLayout() {
  const segments = useSegments();
  const { colors } = useTheme();
  const currentSegment = segments[segments.length - 1] ?? 'index';
  const step = STEPS[currentSegment] ?? 1;

  const headerLeft = useCallback(
    () => <OnboardingProgress.Dots step={step} total={TOTAL} />,
    [step]
  );

  const headerRight = useCallback(
    () => <OnboardingProgress.Counter step={step} total={TOTAL} />,
    [step]
  );

  const screenOptions = useMemo(
    () => ({
      title: '',
      animation: 'none' as const,
      headerLeft,
      headerRight,
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
    }),
    [colors.background, headerLeft, headerRight]
  );

  return (
    <SafeAreaView edges={BOTTOM_EDGE} style={S.flex}>
      <Stack screenOptions={screenOptions} />
    </SafeAreaView>
  );
}

const BOTTOM_EDGE = ['bottom'] as const;

const S = StyleSheet.create({ flex: { flex: 1 } });
