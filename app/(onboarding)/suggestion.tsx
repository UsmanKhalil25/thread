import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Caption, RowTitle, SectionTitle, Subtitle } from '@/components/ui/typography';
import { markOnboardingComplete } from '@/lib/db';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

const RECOMMENDED = {
  initial: 'L',
  name: 'Llama 3.2 - 3B Instruct',
  meta: 'Q4_K_M • 2.1 GB • 128k ctx',
  speed: '34',
  ram: '2.6',
  quality: '84',
  tags: ['chat', 'code', 'summarize', 'open • meta'],
  avatarColor: '#3b82f6',
};

const ALTERNATIVES = [
  {
    initial: 'Q',
    name: 'Qwen 2.5 - 1.5B',
    meta: 'Q4, 0.9 GB',
    speed: '52',
    avatarColor: '#8b5cf6',
  },
  {
    initial: 'P',
    name: 'Phi-3.5 - mini',
    meta: 'Q4, 2.3 GB',
    speed: '38',
    avatarColor: '#f97316',
  },
  {
    initial: 'G',
    name: 'Gemma 2 - 2B',
    meta: 'Q5, 1.7 GB',
    speed: '41',
    avatarColor: '#22c55e',
  },
];

function ModelAvatar({
  initial,
  color,
  size = 'md',
}: {
  initial: string;
  color: string;
  size?: 'sm' | 'md';
}) {
  const isSm = size === 'sm';
  return (
    <View
      className={cn('items-center justify-center rounded-lg', isSm ? 'h-8 w-8' : 'h-10 w-10')}
      style={{ backgroundColor: color }}>
      {isSm ? (
        <Caption className="text-white">{initial}</Caption>
      ) : (
        <RowTitle className="text-white">{initial}</RowTitle>
      )}
    </View>
  );
}

function SpeedBadge({ speed }: { speed: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
      <Caption className="text-emerald-500">{speed} t/s</Caption>
    </View>
  );
}

export default function SuggestionScreen() {
  const router = useRouter();

  async function handleDownload() {
    await markOnboardingComplete();
    router.replace('/(chat)');
  }

  return (
    <View className="bg-background flex-1 px-6">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 32 }}>
        <View className="gap-6">
          <View className="gap-1">
            <SectionTitle>Recommended for your device</SectionTitle>
            <Subtitle>Balanced quality vs. speed for the iPhone 16 Pro.</Subtitle>
          </View>

          <View className="bg-card border-border relative gap-4 rounded-2xl border p-4">
            <View className="flex-row items-center gap-3">
              <ModelAvatar initial={RECOMMENDED.initial} color={RECOMMENDED.avatarColor} />
              <View className="flex-1 gap-0.5 pr-16">
                <RowTitle>{RECOMMENDED.name}</RowTitle>
                <Caption className="leading-relaxed">{RECOMMENDED.meta}</Caption>
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Caption>Speed</Caption>
                <View className="flex-row items-baseline gap-0.5">
                  <RowTitle>{RECOMMENDED.speed}</RowTitle>
                  <Caption>t/s</Caption>
                </View>
              </View>
              <View className="flex-1 gap-1">
                <Caption>RAM</Caption>
                <View className="flex-row items-baseline gap-0.5">
                  <RowTitle>{RECOMMENDED.ram}</RowTitle>
                  <Caption>GB</Caption>
                </View>
              </View>
              <View className="flex-1 gap-1">
                <Caption>Quality</Caption>
                <View className="flex-row items-baseline gap-0.5">
                  <RowTitle>{RECOMMENDED.quality}</RowTitle>
                  <Caption>MMLU</Caption>
                </View>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {RECOMMENDED.tags.map((tag) => (
                <View key={tag} className="bg-secondary rounded-md px-2.5 py-1">
                  <Caption className="text-secondary-foreground">{tag}</Caption>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Caption>Alternatives</Caption>
            {ALTERNATIVES.map((alt) => (
              <View
                key={alt.name}
                className="bg-card border-border flex-row items-center gap-3 rounded-xl border p-3">
                <ModelAvatar initial={alt.initial} color={alt.avatarColor} size="sm" />
                <View className="flex-1 gap-0.5">
                  <RowTitle>{alt.name}</RowTitle>
                  <Caption className="leading-relaxed">{alt.meta}</Caption>
                </View>
                <SpeedBadge speed={alt.speed} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Button onPress={handleDownload}>
        <Text className="text-primary-foreground text-base font-semibold">Download • 2.1 GB</Text>
        <Icon as={MoveRight} className="text-primary-foreground size-5" />
      </Button>
    </View>
  );
}
