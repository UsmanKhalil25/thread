import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function FinishScreen() {
  return (
    <View className="bg-background flex-1 items-center justify-center gap-6 p-8">
      <Text variant="h1">This is Screen 3</Text>
      <Text className="text-muted-foreground text-center">Finish screen placeholder</Text>
      <Link href="/" className="text-primary underline">
        Get started →
      </Link>
    </View>
  );
}
