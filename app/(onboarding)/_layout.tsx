import { Stack } from 'expo-router';

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
};

export default function OnboardingLayout() {
  return <Stack screenOptions={SCREEN_OPTIONS} />;
}
