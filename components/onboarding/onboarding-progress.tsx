import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/contexts/onboarding';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

function Dot({ state }: { state: 'done' | 'active' | 'upcoming' }) {
  if (state === 'active') {
    return <View className="bg-foreground h-2 w-6 rounded-full" />;
  }
  return (
    <View
      className={cn(
        'h-2 w-2 rounded-full',
        state === 'done' ? 'bg-foreground' : 'bg-muted-foreground/30'
      )}
    />
  );
}

function Dots() {
  const { step, total } = useOnboarding();
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} state={i < step - 1 ? 'done' : i === step - 1 ? 'active' : 'upcoming'} />
      ))}
    </View>
  );
}

function Counter() {
  const { step, total } = useOnboarding();
  return (
    <Text className="text-muted-foreground font-mono text-xs">
      {step} / {total}
    </Text>
  );
}

export function OnboardingProgress() {
  return (
    <View className="bg-background flex-row items-center justify-between px-4 py-3">
      <Dots />
      <Counter />
    </View>
  );
}
