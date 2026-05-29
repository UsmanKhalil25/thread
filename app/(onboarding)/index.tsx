import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Shield, WifiOff, Zap } from 'lucide-react-native';
import { View } from 'react-native';

function FeatureCard({ icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <View className="border-border bg-muted flex-1 items-center justify-center gap-2 rounded-xl border py-4">
      <Icon as={icon} className="size-5" />
      <Text className="text-xs" style={{ fontFamily: 'GeistMono_400Regular' }}>
        {label}
      </Text>
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <View className="bg-background flex-1 px-6">
      <View className="flex-1 justify-center gap-10">
        <View className="gap-3">
          <Text className="text-foreground text-left text-4xl font-extrabold tracking-tight">
            Run open models{'\n'}on this device.
          </Text>
          <Text className="text-muted-foreground font-mono text-base leading-relaxed">
            A local-first AI workspace for chat, research and code — with nothing leaving your
            phone.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <FeatureCard icon={Shield} label="Private" />
          <FeatureCard icon={WifiOff} label="Offline" />
          <FeatureCard icon={Zap} label="Fast" />
        </View>
      </View>

      <View className="gap-2">
        <OnboardingButton href="/(onboarding)/privacy" label="Get started" />
        <Text className="text-muted-foreground text-center text-sm">
          Already have data?{' '}
          <Link href="/(onboarding)/privacy" className="text-primary underline">
            Restore from export
          </Link>
        </Text>
      </View>
    </View>
  );
}
