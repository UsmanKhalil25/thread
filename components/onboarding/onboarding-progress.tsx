import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

interface ProgressProps {
  step: number;
  total: number;
}

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

function Dots({ step, total }: ProgressProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} state={i < step - 1 ? 'done' : i === step - 1 ? 'active' : 'upcoming'} />
      ))}
    </View>
  );
}

function Counter({ step, total }: ProgressProps) {
  return (
    <Text className="text-muted-foreground font-mono text-xs">
      {step} / {total}
    </Text>
  );
}

export const OnboardingProgress = { Dots, Counter };
