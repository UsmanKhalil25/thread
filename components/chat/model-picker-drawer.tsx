import { useChat } from '@/contexts/chat';
import { ModelRow } from '@/components/ui/model-row';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ANDROID_MODELS } from '@/lib/models';
import { ChevronRight, Database } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModelPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onBrowseModels?: () => void;
}

export function ModelPickerDrawer({ open, onClose, onBrowseModels }: ModelPickerDrawerProps) {
  const { selectedModelId, setSelectedModelId } = useChat();
  const insets = useSafeAreaInsets();
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) onClose();
    },
    [onClose]
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="border-border rounded-t-3xl">
        <View className="items-center pt-2 pb-0">
          <View className="bg-foreground/20 h-1 w-9 rounded-full" />
        </View>

        <SheetHeader className="py-4">
          <View className="gap-0.5">
            <Text className="text-foreground text-[15px] font-semibold tracking-[-0.01em]">
              Choose a model
            </Text>
            <Text className="text-muted-foreground font-mono text-[11.5px]">
              {ANDROID_MODELS.length} models
            </Text>
          </View>
        </SheetHeader>

        <View className="pb-2">
          {ANDROID_MODELS.map((model) => (
            <ModelRow
              key={model.id}
              model={model}
              selected={selectedModelId === model.id}
              onPress={() => setSelectedModelId(model.id)}
            />
          ))}
        </View>

        <View className="border-border border-t" style={{ paddingBottom: insets.bottom }}>
          <Button variant="ghost" onPress={onBrowseModels}>
            <Icon as={Database} className="text-muted-foreground size-4" />
            <Text className="text-foreground flex-1 text-sm font-medium">Browse more models</Text>
            <Icon as={ChevronRight} className="text-muted-foreground size-4" />
          </Button>
        </View>
      </SheetContent>
    </Sheet>
  );
}
