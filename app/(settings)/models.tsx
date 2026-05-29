import { ModelAvatar } from '@/components/ui/model-avatar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useUniwind } from 'uniwind';

const FILTERS = ['all', 'compatible', 'chat', 'code', 'small · <2 gb'] as const;

type ModelStatus = 'installed' | 'downloading' | null;

interface Model {
  id: string;
  name: string;
  params: string;
  quant: string;
  size: string;
  ramGb: string;
  speed: string;
  compat: number;
  family: string;
  status: ModelStatus;
  progress?: number;
  picked?: boolean;
}

const MODELS: Model[] = [
  {
    id: '1',
    name: 'Llama 3.2 · 3B Instruct',
    params: '3.2 B',
    quant: 'Q4_K_M',
    size: '2.1 GB',
    ramGb: '2.6',
    speed: '34',
    compat: 92,
    family: 'llama',
    status: 'installed',
    picked: true,
  },
  {
    id: '2',
    name: 'Qwen 2.5 · Coder 1.5B',
    params: '1.5 B',
    quant: 'Q5_K_M',
    size: '1.4 GB',
    ramGb: '1.9',
    speed: '48',
    compat: 95,
    family: 'qwen',
    status: null,
  },
  {
    id: '3',
    name: 'Mistral 7B · v0.3',
    params: '7.2 B',
    quant: 'Q4_0',
    size: '4.1 GB',
    ramGb: '5.2',
    speed: '14',
    compat: 62,
    family: 'mistral',
    status: 'downloading',
    progress: 42,
  },
  {
    id: '4',
    name: 'Phi-3.5 · mini',
    params: '3.8 B',
    quant: 'Q4_K_M',
    size: '2.3 GB',
    ramGb: '2.7',
    speed: '38',
    compat: 88,
    family: 'phi',
    status: null,
  },
  {
    id: '5',
    name: 'Gemma 2 · 2B',
    params: '2.6 B',
    quant: 'Q5_K_M',
    size: '1.7 GB',
    ramGb: '2.1',
    speed: '41',
    compat: 90,
    family: 'gemma',
    status: 'installed',
  },
];

function ModelRow({ model, isLast }: { model: Model; isLast?: boolean }) {
  return (
    <View className={`flex-col gap-2 px-5 py-4 ${!isLast ? 'border-border border-b' : ''}`}>
      {/* Top row */}
      <View className="flex-row items-center gap-3">
        <ModelAvatar family={model.family} size={30} />
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-foreground text-[14px] font-medium tracking-[-0.005em]">
              {model.name}
            </Text>
            {model.picked && (
              <Text className="font-mono text-[10px] font-medium text-blue-400">· picked</Text>
            )}
          </View>
          <Text className="text-muted-foreground font-mono text-[11.5px]">
            {model.params} · {model.quant} · {model.size}
          </Text>
        </View>
        {model.status === 'installed' && (
          <Icon as={Check} className="text-green-400" size={15} strokeWidth={2.2} />
        )}
        {model.status === 'downloading' && (
          <Text className="font-mono text-[11px] text-blue-400">{model.progress}%</Text>
        )}
        {model.status === null && (
          <Text className="text-foreground text-[12.5px] font-medium">Get</Text>
        )}
      </View>

      {/* Stats row */}
      <View className="flex-row gap-4" style={{ paddingLeft: 42 }}>
        <Text className="font-mono text-[11px]">
          <Text className="font-mono text-[11px] text-green-400">{model.speed}</Text>
          <Text className="text-muted-foreground font-mono text-[11px]"> t/s</Text>
        </Text>
        <Text className="font-mono text-[11px]">
          <Text className="text-muted-foreground/80 font-mono text-[11px]">{model.ramGb}</Text>
          <Text className="text-muted-foreground font-mono text-[11px]"> gb ram</Text>
        </Text>
        <Text className="font-mono text-[11px]">
          <Text className="text-muted-foreground/80 font-mono text-[11px]">{model.compat}</Text>
          <Text className="text-muted-foreground font-mono text-[11px]"> compat</Text>
        </Text>
      </View>

      {/* Progress bar for downloading */}
      {model.status === 'downloading' && model.progress !== undefined && (
        <View className="bg-border h-0.5 overflow-hidden rounded-full" style={{ marginLeft: 42 }}>
          <View
            className="h-full rounded-full bg-blue-400"
            style={{ width: `${model.progress}%` }}
          />
        </View>
      )}
    </View>
  );
}

export default function ModelsScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const placeholderColor = THEME[theme ?? 'light'].mutedForeground;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const foregroundColor = THEME[theme ?? 'light'].foreground;

  return (
    <View className="bg-background flex-1">
      {/* Header */}
      <View className="flex-row items-center gap-1 px-3 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70">
          <Icon as={ChevronLeft} className="text-foreground" size={18} />
        </Pressable>
        <Text
          className="text-foreground flex-1 text-center text-[14px] font-semibold tracking-[-0.01em]"
          style={{ marginRight: 32 }}>
          Models
        </Text>
      </View>

      {/* Search */}
      <View className="border-border bg-card mx-4 mb-2 h-10 flex-row items-center gap-2 rounded-xl border px-3">
        <Icon as={Search} className="text-muted-foreground" size={14} />
        <TextInput
          placeholder="Search models"
          placeholderTextColor={placeholderColor}
          className="text-foreground flex-1 text-[13px]"
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14, gap: 14 }}
        className="flex-grow-0">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                paddingBottom: 6,
                borderBottomWidth: 1.5,
                borderBottomColor: isActive ? foregroundColor : 'transparent',
              }}>
              <Text
                className={`font-mono text-[12.5px] ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Model list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {MODELS.map((model, i) => (
          <ModelRow key={model.id} model={model} isLast={i === MODELS.length - 1} />
        ))}
      </ScrollView>
    </View>
  );
}
