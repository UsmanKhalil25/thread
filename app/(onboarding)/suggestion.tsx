import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SectionTitle, Subtitle } from '@/components/ui/typography';
import { markOnboardingComplete } from '@/db/repositories/preferences.repository';
import { useRouter } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import { View } from 'react-native';

export default function SuggestionScreen() {
  const router = useRouter();

  async function handleBrowseModels() {
    await markOnboardingComplete();
    router.replace('/(chat)');
    router.push('/(settings)/models');
  }

  async function handleSkip() {
    await markOnboardingComplete();
    router.replace('/(chat)');
  }

  return (
    <View className="bg-background flex-1 justify-center px-6">
      <View className="gap-2">
        <SectionTitle>Download a model</SectionTitle>
        <Subtitle>
          Thread runs AI models directly on your device. Download one to start chatting — or skip
          and grab one later from settings.
        </Subtitle>
      </View>

      <View className="mt-8 gap-2">
        <Button onPress={handleBrowseModels}>
          <Text className="text-primary-foreground text-base font-semibold">Browse models</Text>
          <Icon as={MoveRight} className="text-primary-foreground size-5" />
        </Button>
        <Button variant="ghost" onPress={handleSkip}>
          <Text>Skip for now</Text>
        </Button>
      </View>
    </View>
  );
}
