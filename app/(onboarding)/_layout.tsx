import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { Stack, useSegments } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS: Record<string, number> = {
  index: 1,
  privacy: 2,
  suggestion: 3,
};

const TOTAL = Object.keys(STEPS).length;

export default function OnboardingLayout() {
  const segments = useSegments();
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
    }),
    [headerLeft, headerRight]
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Stack screenOptions={screenOptions} />
    </SafeAreaView>
  );
}
