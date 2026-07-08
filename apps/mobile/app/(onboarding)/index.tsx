import { OnboardingButton } from '@/features/onboarding/components/onboarding-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Subtitle, Title } from '@/components/ui/typography';
import { Shield, WifiOff, Zap } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

function FeatureCard({ icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <View className="border-border bg-muted flex-1 items-center justify-center gap-2 rounded-xl border py-4">
      <Icon as={icon} className="size-5" />
      <Text className="font-mono text-xs">{label}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <View className="bg-background flex-1 px-6">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="gap-10">
          <View className="gap-3">
            <Title>Run open models{'\n'}on this device.</Title>
            <Subtitle>
              A local-first AI workspace for chat, research and code — with nothing leaving your
              phone.
            </Subtitle>
          </View>

          <View className="flex-row gap-3">
            <FeatureCard icon={Shield} label="Private" />
            <FeatureCard icon={WifiOff} label="Offline" />
            <FeatureCard icon={Zap} label="Fast" />
          </View>
        </View>
      </ScrollView>

      <View className="gap-2">
        <OnboardingButton href="/(onboarding)/privacy" label="Get started" />
      </View>
    </View>
  );
}
