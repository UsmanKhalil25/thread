import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Caption, RowTitle, SectionTitle, Subtitle } from '@/components/ui/typography';
import { markOnboardingComplete } from '@/db/repositories/preferences.repository';
import { startModelDownload } from '@/features/models/hooks/use-downloads';
import { useDeviceCapability } from '@/features/models/hooks/use-device-capability';
import { MODEL_CATALOG, modelFitsDevice, recommendModel, type CatalogModel } from '@/lib/models';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

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

function ModelFacts({ model }: { model: CatalogModel }) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1 gap-1">
        <Caption>Params</Caption>
        <RowTitle>{model.params}</RowTitle>
      </View>
      <View className="flex-1 gap-1">
        <Caption>Size</Caption>
        <RowTitle>{model.sizeLabel}</RowTitle>
      </View>
      <View className="flex-1 gap-1">
        <Caption>RAM</Caption>
        <RowTitle>{model.ramLabel}</RowTitle>
      </View>
    </View>
  );
}

export default function SuggestionScreen() {
  const router = useRouter();
  const { tier, modelName } = useDeviceCapability();
  const recommended = recommendModel(tier);
  const alternatives = MODEL_CATALOG.filter(
    (model) => model.id !== recommended.id && modelFitsDevice(model, tier)
  ).slice(0, 3);
  const deviceLabel = modelName ?? 'your device';

  async function routeToModels() {
    router.replace('/(chat)');
    router.push('/(settings)/models');
  }

  async function handleDownload() {
    await markOnboardingComplete();
    void startModelDownload(recommended.id);
    await routeToModels();
  }

  async function handleChooseAnother() {
    await markOnboardingComplete();
    await routeToModels();
  }

  async function handleSkip() {
    await markOnboardingComplete();
    router.replace('/(chat)');
  }

  return (
    <View className="bg-background flex-1 px-6">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }}>
        <View className="gap-6">
          <View className="gap-1">
            <SectionTitle>Recommended for your device</SectionTitle>
            <Subtitle>Best fit from the local model catalog for {deviceLabel}.</Subtitle>
          </View>

          <View className="bg-card border-border gap-4 rounded-2xl border p-4">
            <View className="flex-row items-center gap-3">
              <ModelAvatar initial={recommended.initial} color={recommended.tint} />
              <View className="flex-1 gap-0.5">
                <RowTitle>{recommended.name}</RowTitle>
                <Caption className="leading-relaxed">
                  {recommended.quant} · {recommended.description}
                </Caption>
              </View>
            </View>

            <ModelFacts model={recommended} />
          </View>

          {alternatives.length > 0 ? (
            <View className="gap-3">
              <Caption>Also fits your device</Caption>
              {alternatives.map((model) => (
                <View
                  key={model.id}
                  className="bg-card border-border flex-row items-center gap-3 rounded-xl border p-3">
                  <ModelAvatar initial={model.initial} color={model.tint} size="sm" />
                  <View className="flex-1 gap-0.5">
                    <RowTitle>{model.name}</RowTitle>
                    <Caption className="leading-relaxed">
                      {model.params} · {model.quant} · {model.sizeLabel}
                    </Caption>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="gap-2 pb-4">
        <Button onPress={handleDownload}>
          <Text className="text-primary-foreground text-base font-semibold">
            Download · {recommended.sizeLabel}
          </Text>
          <Icon as={MoveRight} className="text-primary-foreground size-5" />
        </Button>
        <Button variant="secondary" onPress={handleChooseAnother}>
          <Text>Choose another</Text>
        </Button>
        <Button variant="ghost" onPress={handleSkip}>
          <Text>Skip for now</Text>
        </Button>
      </View>
    </View>
  );
}
