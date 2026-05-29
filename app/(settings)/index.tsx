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
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Database, Eye, Lock, CloudOff, Gauge, Zap, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
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
  const { theme } = useUniwind();
  const value: Option = { value: theme ?? 'light', label: theme === 'dark' ? 'Dark' : 'Light' };

  function onValueChange(option: Option | undefined) {
    if (option) Uniwind.setTheme(option.value as 'light' | 'dark');
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger variant="ghost">
        <SelectValue
          placeholder="Theme"
          className="text-muted-foreground font-mono text-[12.5px]"
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light" label="Light" />
        <SelectItem value="dark" label="Dark" />
      </SelectContent>
    </Select>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="bg-background flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="gap-6 px-5 py-4">
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

        {/* Privacy & data */}
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

        {/* Advanced */}
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

        {/* Footer */}
        <Text className="text-muted-foreground/50 text-center font-mono text-[10.5px]">
          v0.4.1 · llama.cpp · open source
        </Text>
      </View>
    </ScrollView>
  );
}
