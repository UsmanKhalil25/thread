import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { ModelDefinition } from '@/types/models';
import { Pressable, View } from 'react-native';

interface ModelRowProps {
  model: ModelDefinition;
  selected?: boolean;
  onPress?: () => void;
}

export function ModelRow({ model, selected, onPress }: ModelRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mx-2 flex-row items-center gap-3 rounded-xl px-3 py-2.5',
        selected && 'bg-primary/10 border-primary/20 border'
      )}>
      <View className="flex-1 gap-0.5">
        <Text className="text-foreground text-sm font-medium">{model.name}</Text>
        <Text className="text-muted-foreground font-mono text-xs">{model.sizeLabel}</Text>
      </View>

      <Text className="text-muted-foreground font-mono text-xs">{model.ramLabel}</Text>
    </Pressable>
  );
}
