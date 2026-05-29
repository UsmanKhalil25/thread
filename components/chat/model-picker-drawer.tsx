import { ModelRow } from '@/components/ui/model-row';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { db } from '@/db/client';
import { modelsTable } from '@/db/schema';
import { useChat } from '@/contexts/chat';
import { useDownloads } from '@/contexts/downloads';
import { ANDROID_MODELS, type ModelDefinition } from '@/lib/models';
import { eq } from 'drizzle-orm';
import { ChevronRight, Database } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModelPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onBrowseModels?: () => void;
}

export function ModelPickerDrawer({ open, onClose, onBrowseModels }: ModelPickerDrawerProps) {
  const { selectedModelId, setSelectedModelId } = useChat();
  const { state: downloadState } = useDownloads();
  const insets = useSafeAreaInsets();
  const [installedModels, setInstalledModels] = useState<ModelDefinition[]>([]);

  useEffect(() => {
    db.select({ id: modelsTable.id })
      .from(modelsTable)
      .where(eq(modelsTable.status, 'installed'))
      .then((rows) => {
        const ids = new Set(rows.map((r) => r.id));
        setInstalledModels(ANDROID_MODELS.filter((m) => ids.has(m.id)));
      });
  }, [downloadState]);

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
              {installedModels.length} {installedModels.length === 1 ? 'model' : 'models'}
            </Text>
          </View>
        </SheetHeader>

        {installedModels.length > 0 ? (
          <View className="pb-2">
            {installedModels.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                selected={selectedModelId === model.id}
                onPress={() => setSelectedModelId(model.id)}
              />
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-3 px-6 py-8">
            <View className="bg-muted h-12 w-12 items-center justify-center rounded-xl">
              <Icon as={Database} className="text-muted-foreground size-6" />
            </View>
            <Text className="text-foreground text-[15px] font-semibold tracking-[-0.01em]">
              No models installed
            </Text>
            <Text className="text-muted-foreground text-center text-sm">
              Download a model to start chatting locally.
            </Text>
          </View>
        )}

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
