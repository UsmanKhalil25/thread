import { Caption, RowTitle } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { CatalogModel } from '@/types/model-catalog';
import { Pressable, View } from 'react-native';

interface ModelRowProps {
  model: CatalogModel;
  selected?: boolean;
  onPress?: () => void;
}

export function ModelRow({ model, selected, onPress }: ModelRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mx-2 flex-row items-center gap-3 rounded-xl border border-transparent px-3 py-2.5',
        selected && 'border-primary/20 bg-primary/10'
      )}>
      <View className="flex-1 gap-0.5">
        <RowTitle>{model.name}</RowTitle>
        <Caption>{model.sizeLabel}</Caption>
      </View>

      <Caption>{model.ramLabel}</Caption>
    </Pressable>
  );
}
