import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { Stack, useSegments } from 'expo-router';

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

  return (
    <Stack
      screenOptions={{
        title: '',
        animation: 'none',
        headerLeft: () => <OnboardingProgress.Dots step={step} total={TOTAL} />,
        headerRight: () => <OnboardingProgress.Counter step={step} total={TOTAL} />,
      }}
    />
  );
}
