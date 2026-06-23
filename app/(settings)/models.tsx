import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Caption } from '@/components/ui/typography';
import { DownloadableModel } from '@/features/models/components/downloadable-model';
import { MODEL_CATALOG } from '@/lib/models';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['all', 'compatible', 'code', 'small · <2 gb'] as const;
type ModelFilter = (typeof FILTERS)[number];
const SMALL_MODEL_BYTES = 2 * 1024 * 1024 * 1024;
const COMPATIBLE_TIERS = new Set(['any', '6gb']);

export default function ModelsScreen() {
  const [activeFilter, setActiveFilter] = useState<ModelFilter>('all');
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filtered = MODEL_CATALOG.filter((model) => {
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
            <DownloadableModel key={model.id} model={model} isLast={i === filtered.length - 1} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
