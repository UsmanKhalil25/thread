import { ModelRow } from '@/components/ui/model-row';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Caption, RowTitle } from '@/components/ui/typography';
import { Icon } from '@/components/ui/icon';
import { db } from '@/db/client';
import { modelsTable } from '@/db/schema';
import { useChat } from '@/contexts/chat';
import { useDownloads } from '@/contexts/downloads';
import { ANDROID_MODELS, type ModelDefinition } from '@/lib/models';
import { eq } from 'drizzle-orm';
import { ChevronRight, Database } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
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
  const { height } = useWindowDimensions();
  const [installedModels, setInstalledModels] = useState<ModelDefinition[]>([]);
  const sheetMaxHeight = Math.round(height * 0.82);
  const listMaxHeight = Math.round(height * 0.46);

  useEffect(() => {
    let cancelled = false;

    db.select({ id: modelsTable.id })
      .from(modelsTable)
      .where(eq(modelsTable.status, 'installed'))
      .then((rows) => {
        if (cancelled) return;

        const ids = new Set(rows.map((r) => r.id));
        setInstalledModels(ANDROID_MODELS.filter((m) => ids.has(m.id)));
      })
      .catch(() => {
        if (!cancelled) setInstalledModels([]);
      });

    return () => {
      cancelled = true;
    };
  }, [downloadState]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) onClose();
    },
    [onClose]
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <View style={{ maxHeight: sheetMaxHeight }}>
          <SheetTitle className="absolute h-0 w-0 opacity-0">Choose a model</SheetTitle>
          <View className="items-center pt-2 pb-0">
            <View className="bg-foreground/20 h-1 w-9 rounded-full" />
          </View>

          <SheetHeader className="px-5 py-4">
            <View className="gap-0.5">
              <RowTitle>Choose a model</RowTitle>
              <Caption>
                {installedModels.length} {installedModels.length === 1 ? 'model' : 'models'}
              </Caption>
            </View>
          </SheetHeader>

          {installedModels.length > 0 ? (
            <ScrollView
              style={{ maxHeight: listMaxHeight }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}>
              {installedModels.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  selected={selectedModelId === model.id}
                  onPress={() => setSelectedModelId(model.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="items-center justify-center gap-3 px-5 py-8">
              <View className="bg-muted h-12 w-12 items-center justify-center rounded-xl">
                <Icon as={Database} className="text-muted-foreground size-6" />
              </View>
              <RowTitle>No models installed</RowTitle>
              <Caption className="text-center leading-relaxed">
                Download a model to start chatting locally.
              </Caption>
            </View>
          )}

          <View className="border-sidebar-border border-t" style={{ paddingBottom: insets.bottom }}>
            <Button variant="ghost" onPress={onBrowseModels}>
              <Icon as={Database} className="text-muted-foreground size-4" />
              <RowTitle className="flex-1">Browse more models</RowTitle>
              <Icon as={ChevronRight} className="text-muted-foreground size-4" />
            </Button>
          </View>
        </View>
      </SheetContent>
    </Sheet>
  );
}
