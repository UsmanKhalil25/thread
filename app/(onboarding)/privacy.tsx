import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function PrivacyScreen() {
  return (
    <View className="bg-background flex-1 items-center justify-center gap-6 p-8">
      <Text variant="h1">This is Screen 2</Text>
      <Text className="text-muted-foreground text-center">Privacy screen placeholder</Text>
      <Link href="/(onboarding)/finish" className="text-primary underline">
        Next →
      </Link>
    </View>
  );
}
