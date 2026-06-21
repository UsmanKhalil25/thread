import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { SearchInput } from '@/components/ui/search-input';
import { Caption, RowTitle } from '@/components/ui/typography';
import { useDownloads } from '@/contexts/downloads';
import { ANDROID_MODELS, type ModelDefinition } from '@/lib/models';
import type { Model } from '@/types/entities/model';
import { Stack } from 'expo-router';
import { ArrowDownToLine, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['all', 'compatible', 'code', 'small · <2 gb'] as const;
type ModelFilter = (typeof FILTERS)[number];
const SMALL_MODEL_BYTES = 2 * 1024 * 1024 * 1024;
const COMPATIBLE_TIERS = new Set(['any', '6gb']);

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

interface DownloadableModelRowProps {
  model: ModelDefinition;
  entry: Model | undefined;
  isLast?: boolean;
  onGet: () => void;
  onCancel: () => void;
}

function DownloadableModelRow({
  model,
  entry,
  isLast,
  onGet,
  onCancel,
}: DownloadableModelRowProps) {
  const status = entry?.status ?? null;
  const progress = Math.round(entry?.progress ?? 0);

  return (
    <View className={`gap-2 px-4 py-4 ${!isLast ? 'border-border border-b' : ''}`}>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-0.5">
          <RowTitle>{model.name}</RowTitle>
          <Caption>
            {model.params} · {model.quant} · {model.sizeLabel}
          </Caption>
        </View>

        {status === 'installed' && (
          <Icon as={Check} className="text-green-400" size={15} strokeWidth={2.2} />
        )}
        {status === 'downloading' && (
          <View className="flex-row items-center gap-2">
            <Caption className="text-blue-400">{progress}%</Caption>
            <Button variant="ghost" size="icon" onPress={onCancel} className="size-8">
              <Icon as={X} className="text-muted-foreground size-3.5" />
            </Button>
          </View>
        )}
        {status === 'error' && (
          <Button variant="ghost" size="icon" onPress={onGet} className="size-8">
            <Icon as={ArrowDownToLine} className="text-destructive size-4" />
          </Button>
        )}
        {status === null && (
          <Button variant="ghost" size="icon" onPress={onGet} className="size-8">
            <Icon as={ArrowDownToLine} className="text-muted-foreground size-4" />
          </Button>
        )}
      </View>

      {status === 'downloading' && (
        <>
          <Progress value={progress} className="bg-border h-0.5" indicatorClassName="bg-blue-400" />
          {entry?.bytesWritten !== undefined && entry?.totalBytes !== undefined && (
            <Caption>
              {formatBytes(entry.bytesWritten)} / {formatBytes(entry.totalBytes)}
              {entry.speed !== undefined && entry.speed > 0 ? ` · ${formatSpeed(entry.speed)}` : ''}
            </Caption>
          )}
        </>
      )}
    </View>
  );
}

export default function ModelsScreen() {
  const [activeFilter, setActiveFilter] = useState<ModelFilter>('all');
  const [query, setQuery] = useState('');
  const { state, start, cancel } = useDownloads();
  const insets = useSafeAreaInsets();

  const filtered = ANDROID_MODELS.filter((model) => {
    const matchesQuery =
      query.length === 0 ||
      model.name.toLowerCase().includes(query.toLowerCase()) ||
      model.family.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'compatible') return COMPATIBLE_TIERS.has(model.deviceTier);
    if (activeFilter === 'small · <2 gb') return model.sizeBytes < SMALL_MODEL_BYTES;
    if (activeFilter === 'code') return ['qwen', 'phi'].includes(model.family);
    return true;
  });

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={{ headerTitle: 'Models' }} />

      <SearchInput placeholder="Search models" value={query} onChangeText={setQuery} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 14, gap: 8 }}
        className="flex-grow-0">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Button
              key={filter}
              variant="ghost"
              onPress={() => setActiveFilter(filter)}
              className={`h-8 rounded-md px-2.5 ${isActive ? 'bg-secondary' : ''}`}>
              <Caption className={isActive ? 'text-secondary-foreground' : undefined}>
                {filter}
              </Caption>
            </Button>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View className="border-border bg-card mx-6 overflow-hidden rounded-2xl border">
          {filtered.map((model, i) => (
            <DownloadableModelRow
              key={model.id}
              model={model}
              entry={state[model.id]}
              isLast={i === filtered.length - 1}
              onGet={() => start(model)}
              onCancel={() => cancel(model.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
