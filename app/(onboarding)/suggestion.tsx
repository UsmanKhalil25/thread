import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import { View } from 'react-native';

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
      className={'items-center justify-center rounded-lg ' + (isSm ? 'h-8 w-8' : 'h-10 w-10')}
      style={{ backgroundColor: color }}>
      <Text className={'font-semibold text-white ' + (isSm ? 'text-xs' : 'text-sm')}>
        {initial}
      </Text>
    </View>
  );
}

function SpeedBadge({ speed }: { speed: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-md bg-[#064e3b] px-2 py-1">
      <Text className="text-xs font-medium text-[#34d399]">{speed} t/s</Text>
    </View>
  );
}

export default function SuggestionScreen() {
  return (
    <View className="bg-background flex-1 px-6">
      <View className="flex-1 gap-6 pt-6">
        <View className="gap-1">
          <Text className="text-foreground text-left text-2xl font-bold tracking-tight">
            Recommended for your device
          </Text>
          <Text className="text-muted-foreground font-mono text-sm leading-relaxed">
            Balanced quality vs. speed for the iPhone 16 Pro.
          </Text>
        </View>

        <View className="bg-card border-border relative gap-4 rounded-2xl border p-4">
          <View className="flex-row items-center gap-3">
            <ModelAvatar initial={RECOMMENDED.initial} color={RECOMMENDED.avatarColor} />
            <View className="flex-1 gap-0.5 pr-16">
              <Text className="text-foreground text-sm font-semibold">{RECOMMENDED.name}</Text>
              <Text className="text-muted-foreground text-xs">{RECOMMENDED.meta}</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Speed
              </Text>
              <View className="flex-row items-baseline gap-0.5">
                <Text className="text-foreground text-lg font-bold">{RECOMMENDED.speed}</Text>
                <Text className="text-muted-foreground text-xs">t/s</Text>
              </View>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                RAM
              </Text>
              <View className="flex-row items-baseline gap-0.5">
                <Text className="text-foreground text-lg font-bold">{RECOMMENDED.ram}</Text>
                <Text className="text-muted-foreground text-xs">GB</Text>
              </View>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Quality
              </Text>
              <View className="flex-row items-baseline gap-0.5">
                <Text className="text-foreground text-lg font-bold">{RECOMMENDED.quality}</Text>
                <Text className="text-muted-foreground text-xs">MMLU</Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2">
            {RECOMMENDED.tags.map((tag) => (
              <View key={tag} className="bg-secondary rounded-md px-2.5 py-1">
                <Text className="text-secondary-foreground text-xs">{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Alternatives */}
        <View className="gap-3">
          <Text className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Alternatives
          </Text>
          {ALTERNATIVES.map((alt) => (
            <View
              key={alt.name}
              className="bg-card border-border flex-row items-center gap-3 rounded-xl border p-3">
              <ModelAvatar initial={alt.initial} color={alt.avatarColor} size="sm" />
              <View className="flex-1 gap-0.5">
                <Text className="text-foreground text-sm font-medium">{alt.name}</Text>
                <Text className="text-muted-foreground text-xs">{alt.meta}</Text>
              </View>
              <SpeedBadge speed={alt.speed} />
            </View>
          ))}
        </View>
      </View>

      <View className="gap-4 pt-4 pb-8">
        <Link href="/(chat)" asChild>
          <Button>
            <Text className="text-primary-foreground text-base font-semibold">
              Download • 2.1 GB
            </Text>
            <Icon as={MoveRight} className="text-primary-foreground size-5" />
          </Button>
        </Link>
      </View>
    </View>
  );
}
