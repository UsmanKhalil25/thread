import { ModelAvatar } from '@/components/ui/model-avatar';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Check, ChevronRight, Database, WifiOff } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MODELS = [
  {
    id: '1',
    initial: 'L',
    name: 'Llama 3.2 · 3B',
    meta: 'Q4 · 2.1 GB · 34 t/s',
    tint: '#60a5fa',
  },
  {
    id: '2',
    initial: 'Q',
    name: 'Qwen 2.5 · 1.5B',
    meta: 'Q5 · 1.4 GB · 52 t/s',
    tint: '#a78bfa',
  },
  {
    id: '3',
    initial: 'G',
    name: 'Gemma 2 · 2B',
    meta: 'Q5 · 1.7 GB · 41 t/s',
    tint: '#34d399',
  },
  {
    id: '4',
    initial: 'P',
    name: 'Phi-3.5 · mini',
    meta: 'Q4 · 2.3 GB · 38 t/s',
    tint: '#f472b6',
  },
];

interface ModelPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onBrowseModels?: () => void;
}

export function ModelPickerDrawer({ open, onClose, onBrowseModels }: ModelPickerDrawerProps) {
  const [selectedId, setSelectedId] = useState('1');
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) onClose();
    },
    [onClose]
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-[18px]">
        <View className="items-center pt-2 pb-0">
          <View className="bg-foreground/20 h-1 w-9 rounded-full" />
        </View>

        <SafeAreaView edges={['bottom']}>
          <SheetHeader className="py-4">
            <View className="gap-0.5">
              <Text className="text-foreground text-[15px] font-semibold tracking-[-0.01em]">
                Choose a model
              </Text>
              <Text className="text-muted-foreground font-mono text-[11.5px]">
                4 installed · runs locally
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1">
              <Icon as={WifiOff} className="text-green-500" size={10} />
              <Text className="font-mono text-[11px] font-medium text-green-500">offline</Text>
            </View>
          </SheetHeader>

          <View className="pb-2">
            {MODELS.map((model) => {
              const isActive = selectedId === model.id;
              return (
                <Pressable
                  key={model.id}
                  onPress={() => setSelectedId(model.id)}
                  className={`mx-2 flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${
                    isActive ? 'bg-muted border-border border' : ''
                  }`}>
                  <ModelAvatar letter={model.initial} tint={model.tint} size={32} />

                  <View className="flex-1 gap-0.5">
                    <Text className="text-foreground text-[13.5px] font-medium tracking-[-0.005em]">
                      {model.name}
                    </Text>
                    <Text className="text-muted-foreground font-mono text-[11px]">
                      {model.meta}
                    </Text>
                  </View>

                  {isActive && (
                    <Icon as={Check} className="text-green-500" size={15} strokeWidth={2.2} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="border-border border-t">
            <Pressable
              onPress={onBrowseModels}
              className="flex-row items-center gap-3 px-4 py-4 active:opacity-70">
              <Icon as={Database} className="text-muted-foreground" size={14} />
              <Text className="text-foreground flex-1 text-[13px] font-medium">
                Browse 156 more models
              </Text>
              <Icon as={ChevronRight} className="text-muted-foreground/50" size={13} />
            </Pressable>
          </View>
        </SafeAreaView>
      </SheetContent>
    </Sheet>
  );
}
