import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { OnboardingProvider } from '@/contexts/onboarding';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'fade',
} as const;

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <SafeAreaView edges={EDGES} style={S.flex}>
        <OnboardingProgress />
        <Stack screenOptions={SCREEN_OPTIONS} />
      </SafeAreaView>
    </OnboardingProvider>
  );
}

const EDGES = ['top', 'bottom'] as const;
const S = StyleSheet.create({ flex: { flex: 1 } });
