import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Archive, Laptop, Lock, MoveRight, Shield } from 'lucide-react-native';
import { View } from 'react-native';

const FEATURES = [
  {
    icon: Laptop,
    title: 'No cloud inference',
    subtitle: 'All tokens generated on this device.',
  },
  {
    icon: Lock,
    title: 'Encrypted at rest',
    subtitle: 'AES-GCM, key in Secure Enclave.',
  },
  {
    icon: Shield,
    title: 'No telemetry by default',
    subtitle: 'Crash reports opt-in, scrubbed.',
  },
  {
    icon: Archive,
    title: 'Export & wipe anytime',
    subtitle: 'JSONL, Markdown or full archive.',
  },
];

function FeatureRow({
  icon,
  title,
  subtitle,
}: {
  icon: typeof Laptop;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-card border-border flex-row items-center gap-3.5 rounded-2xl border p-4">
      <View className="bg-secondary flex h-10 w-10 items-center justify-center rounded-xl">
        <Icon as={icon} className="text-muted-foreground size-5" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-foreground text-sm font-semibold">{title}</Text>
        <Text className="text-muted-foreground font-mono text-xs leading-relaxed">{subtitle}</Text>
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <View className="bg-background flex-1 px-6">
      <View className="flex-1 gap-6 pt-8">
        <View className="gap-2">
          <Text className="text-foreground text-left text-3xl font-bold tracking-tight">
            Your chats never leave the device.
          </Text>
          <Text className="text-muted-foreground font-mono text-base leading-relaxed">
            Models run locally, embeddings stay local, your data is yours.
          </Text>
        </View>

        <View className="gap-3 pt-2">
          {FEATURES.map((feature) => (
            <FeatureRow key={feature.title} {...feature} />
          ))}
        </View>
      </View>

      <View className="gap-4 pt-4 pb-8">
        <Link href="/(onboarding)/suggestion" asChild>
          <Button>
            <Text className="text-primary-foreground text-base font-semibold">I understand</Text>
            <Icon as={MoveRight} className="text-primary-foreground size-5" />
          </Button>
        </Link>
      </View>
    </View>
  );
}
