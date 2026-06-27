import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SettingsGroup } from '@/features/settings/components/settings-group';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { Text } from '@/components/ui/text';
import { deleteAllChats } from '@/db/repositories/chats.repository';
import { refreshChats } from '@/features/chat/hooks/use-chats';
import { deleteAllModelDownloads } from '@/features/models/hooks/use-downloads';
import { llamaService } from '@/features/inference/llama-service';
import { MODEL_CATALOG } from '@/lib/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Caption } from '@/components/ui/typography';
import { useRouter } from 'expo-router';
import { Database, Eye, MessageSquareX } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Uniwind, useUniwind } from 'uniwind';

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
  const [removeChatsOpen, setRemoveChatsOpen] = useState(false);
  const [removeModelsOpen, setRemoveModelsOpen] = useState(false);

  async function handleRemoveChats() {
    await deleteAllChats();
    void refreshChats();
    setRemoveChatsOpen(false);
    router.replace('/(chat)');
  }

  async function handleRemoveModels() {
    await llamaService.release();
    await deleteAllModelDownloads();
    setRemoveModelsOpen(false);
  }

  return (
    <>
      <ScrollView
        className="bg-background flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View className="gap-6 px-6 py-4">
          <SettingsGroup label="App">
            <SettingsRow
              icon={Database}
              title="Models"
              hint={`${MODEL_CATALOG.length} models available`}
              onPress={() => router.push('/(settings)/models')}
              isFirst
            />
            <SettingsRow icon={Eye} title="Appearance" control={<AppearanceSelect />} />
          </SettingsGroup>

          <SettingsGroup label="Data">
            <SettingsRow
              icon={MessageSquareX}
              title="Remove chats and messages"
              hint="Delete conversation history"
              danger
              isFirst
              onPress={() => setRemoveChatsOpen(true)}
            />
            <SettingsRow
              icon={Database}
              title="Remove all models"
              hint="Delete downloaded model files"
              danger
              onPress={() => setRemoveModelsOpen(true)}
            />
          </SettingsGroup>

          <Caption className="text-muted-foreground/50 text-center">
            v0.4.1 · llama.cpp · open source
          </Caption>
        </View>
      </ScrollView>

      <AlertDialog open={removeChatsOpen} onOpenChange={setRemoveChatsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove chats and messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes all conversation history from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleRemoveChats}>
              <Text>Remove</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeModelsOpen} onOpenChange={setRemoveModelsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove all models?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes all downloaded model files from this device. You can download them again
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleRemoveModels}>
              <Text>Remove</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
