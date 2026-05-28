import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import {
  Database,
  Eye,
  Hash,
  Lock,
  CloudOff,
  Trash,
  Gauge,
  Zap,
  Sparkles,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

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

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="bg-background flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="gap-6 px-5 py-4">
        <View className="gap-1">
          <Text className="text-foreground text-[26px] font-semibold tracking-[-0.025em]">
            Settings
          </Text>
        </View>

        {/* Profile card */}
        <View className="bg-card border-border rounded-2xl border p-3.5">
          <View className="flex-row items-center gap-3">
            <View className="bg-muted h-10 w-10 items-center justify-center rounded-xl">
              <Text className="text-foreground font-mono text-sm font-semibold">SK</Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-foreground text-[13.5px] font-medium tracking-[-0.005em]">
                Sam Kepler
              </Text>
              <Text className="text-muted-foreground font-mono text-[11px]">
                local · no account needed
              </Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1">
              <Icon as={Lock} className="text-green-500" size={10} />
              <Text className="font-mono text-[11px] font-medium text-green-500">private</Text>
            </View>
          </View>

          <Separator className="my-3" />

          <View className="flex-row items-baseline gap-1">
            <Text className="text-foreground font-mono text-[18px] font-semibold tracking-[-0.02em]">
              7.5
            </Text>
            <Text className="text-muted-foreground font-mono text-[11px]">GB · 4 models</Text>
            <View className="flex-1" />
            <Text className="text-muted-foreground text-[11px]">56.4 GB free</Text>
          </View>
          <View className="bg-muted mt-2 h-1 overflow-hidden rounded-full">
            <View className="h-full w-[12%] rounded-full bg-blue-400" />
          </View>
        </View>

        {/* App */}
        <SettingsGroup label="App">
          <SettingsRow
            icon={Database}
            title="Models"
            hint="4 installed · 7.5 GB"
            onPress={() => router.push('/(settings)/models')}
            isFirst
          />
          <SettingsRow icon={Eye} title="Appearance" value="Dark" />
          <SettingsRow icon={Hash} title="Text size" value="Medium" />
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
