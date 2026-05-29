import { SearchInput } from '@/components/chat/search-input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useDownloads } from '@/contexts/downloads';
import { ANDROID_MODELS, type ModelDefinition } from '@/lib/models';
import type { Model } from '@/types/entities/model';
import { THEME } from '@/lib/theme';
import { Stack } from 'expo-router';
import { ArrowDownToLine, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useUniwind } from 'uniwind';

const FILTERS = ['all', 'compatible', 'chat', 'code', 'small · <2 gb'] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

interface ModelRowProps {
  model: ModelDefinition;
  entry: Model | undefined;
  isLast?: boolean;
  onGet: () => void;
  onCancel: () => void;
}

function ModelRow({ model, entry, isLast, onGet, onCancel }: ModelRowProps) {
  const status = entry?.status ?? null;
  const progress = Math.round(entry?.progress ?? 0);

  return (
    <View className={`gap-2 px-5 py-4 ${!isLast ? 'border-border border-b' : ''}`}>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-foreground text-sm font-medium">{model.name}</Text>
          <Text className="text-muted-foreground font-mono text-xs">
            {model.params} · {model.quant} · {model.sizeLabel}
          </Text>
        </View>

        {status === 'installed' && (
          <Icon as={Check} className="text-green-400" size={15} strokeWidth={2.2} />
        )}
        {status === 'downloading' && (
          <View className="flex-row items-center gap-2">
            <Text className="font-mono text-[11px] text-blue-400">{progress}%</Text>
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
            <Text className="text-muted-foreground font-mono text-[10.5px]">
              {formatBytes(entry.bytesWritten)} / {formatBytes(entry.totalBytes)}
              {entry.speed !== undefined && entry.speed > 0 ? ` · ${formatSpeed(entry.speed)}` : ''}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

export default function ModelsScreen() {
  const { theme } = useUniwind();
  const foregroundColor = THEME[theme ?? 'light'].foreground;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const { state, start, cancel } = useDownloads();

  const filtered = ANDROID_MODELS.filter(
    (m) => query.length === 0 || m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={{ headerTitle: 'Models' }} />

      <SearchInput placeholder="Search models" value={query} onChangeText={setQuery} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14, gap: 14 }}
        className="flex-grow-0">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Button
              key={filter}
              variant="ghost"
              onPress={() => setActiveFilter(filter)}
              className="rounded-none px-0"
              style={{
                paddingBottom: 6,
                borderBottomWidth: 1.5,
                borderBottomColor: isActive ? foregroundColor : 'transparent',
              }}>
              <Text
                className={`font-mono text-[12.5px] ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {filter}
              </Text>
            </Button>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((model, i) => (
          <ModelRow
            key={model.id}
            model={model}
            entry={state[model.id]}
            isLast={i === filtered.length - 1}
            onGet={() => start(model)}
            onCancel={() => cancel(model.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
