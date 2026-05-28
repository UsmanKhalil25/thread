import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Check, ChevronRight, Database, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MODELS = [
  {
    id: '1',
    initial: 'L',
    name: 'Llama 3.2 · 3B',
    meta: 'Q4 · 2.1 GB · 34 t/s',
    avatarColor: '#3b82f6',
  },
  {
    id: '2',
    initial: 'Q',
    name: 'Qwen 2.5 · 1.5B',
    meta: 'Q5 · 1.4 GB · 52 t/s',
    avatarColor: '#8b5cf6',
  },
  {
    id: '3',
    initial: 'G',
    name: 'Gemma 2 · 2B',
    meta: 'Q5 · 1.7 GB · 41 t/s',
    avatarColor: '#22c55e',
  },
  {
    id: '4',
    initial: 'P',
    name: 'Phi-3.5 · mini',
    meta: 'Q4 · 2.3 GB · 38 t/s',
    avatarColor: '#ec4899',
  },
];

interface ModelPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onBrowseModels?: () => void;
}

export function ModelPickerDrawer({ open, onClose, onBrowseModels }: ModelPickerDrawerProps) {
  const [selectedId, setSelectedId] = useState('1');

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom">
        <View className="items-center pt-2 pb-0">
          <View className="bg-foreground/20 h-1 w-9 rounded-full" />
        </View>

        <SafeAreaView edges={['bottom']}>
          <SheetHeader className="py-4">
            <View className="gap-0.5">
              <Text className="text-foreground text-xl font-bold">Choose a model</Text>
              <Text className="text-muted-foreground text-sm">4 installed · runs locally</Text>
            </View>

            <View className="flex-row items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5">
              <Icon as={WifiOff} className="size-3.5 text-green-500" />
              <Text className="text-xs font-medium text-green-500">offline</Text>
            </View>
          </SheetHeader>

          <View className="pb-2">
            {MODELS.map((model) => (
              <Pressable
                key={model.id}
                onPress={() => setSelectedId(model.id)}
                className={cn(
                  'mx-3 flex-row items-center gap-3 px-3 py-3',
                  selectedId === model.id && 'bg-muted rounded-2xl'
                )}>
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: model.avatarColor }}>
                  <Text className="text-sm font-semibold text-white">{model.initial}</Text>
                </View>

                <View className="flex-1 gap-0.5">
                  <Text className="text-sidebar-foreground text-sm font-semibold">
                    {model.name}
                  </Text>
                  <Text className="text-muted-foreground text-xs">{model.meta}</Text>
                </View>

                {selectedId === model.id && <Icon as={Check} className="size-5 text-green-500" />}
              </Pressable>
            ))}
          </View>

          <View className="border-sidebar-border border-t">
            <Pressable onPress={onBrowseModels} className="flex-row items-center gap-3 px-4 py-4">
              <Icon as={Database} className="text-muted-foreground size-5" />
              <Text className="text-sidebar-foreground flex-1 text-sm font-medium">
                Browse 156 more models
              </Text>
              <Icon as={ChevronRight} className="text-muted-foreground size-4" />
            </Pressable>
          </View>
        </SafeAreaView>
      </SheetContent>
    </Sheet>
  );
}
