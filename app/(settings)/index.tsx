import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Caption } from '@/components/ui/typography';
import { useRouter } from 'expo-router';
import { CloudOff, Database, Eye, Gauge, Lock, Sparkles, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Uniwind, useUniwind } from 'uniwind';

function SettingsToggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Switch
      checked={checked}
      onCheckedChange={setChecked}
      className={checked ? 'bg-emerald-400' : undefined}
    />
  );
}

function AppearanceSelect() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const value: Option = hasAdaptiveThemes
    ? { value: 'system', label: 'System default' }
    : { value: theme, label: theme === 'dark' ? 'Dark' : 'Light' };

  function onValueChange(option: Option | undefined) {
    if (option) Uniwind.setTheme(option.value as 'light' | 'dark' | 'system');
  }

  return (
    <View className="h-8 justify-center">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          variant="ghost"
          className="bg-secondary h-8 items-center rounded-md px-2.5 py-0">
          <SelectValue
            placeholder="Theme"
            className="text-muted-foreground font-mono text-xs leading-4"
          />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="system" label="System default" />
          <SelectItem value="light" label="Light" />
          <SelectItem value="dark" label="Dark" />
        </SelectContent>
      </Select>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="bg-background flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
      <View className="gap-6 px-6 py-4">
        <SettingsGroup label="App">
          <SettingsRow
            icon={Database}
            title="Models"
            hint="4 installed · 7.5 GB"
            onPress={() => router.push('/(settings)/models')}
            isFirst
          />
          <SettingsRow icon={Eye} title="Appearance" control={<AppearanceSelect />} />
        </SettingsGroup>

        <SettingsGroup label="Privacy & data">
          <SettingsRow
            icon={Lock}
            title="Encrypt at rest"
            hint="AES-GCM · Secure Enclave"
            control={<SettingsToggle defaultChecked />}
            isFirst
          />
          <SettingsRow
            icon={CloudOff}
            title="Block network access"
            hint="Outbound firewall"
            control={<SettingsToggle defaultChecked />}
          />
          <SettingsRow title="Export chats" hint="JSONL · Markdown · archive" />
          <SettingsRow title="Erase all data" hint="Models, chats, settings" danger />
        </SettingsGroup>

        <SettingsGroup label="Advanced">
          <SettingsRow
            icon={Gauge}
            title="Device performance"
            hint="Benchmark · capability tiers"
            isFirst
          />
          <SettingsRow icon={Zap} title="Inference & power" hint="Threads · NPU · battery" />
          <SettingsRow icon={Sparkles} title="Experimental features" />
        </SettingsGroup>

        <Caption className="text-muted-foreground/50 text-center">
          v0.4.1 · llama.cpp · open source
        </Caption>
      </View>
    </ScrollView>
  );
}
