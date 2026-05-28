import { ChatHistoryDrawer } from '@/components/chat/chat-history-drawer';
import { ChatHeader } from '@/components/chat/chat-header';
import { ModelPickerDrawer } from '@/components/chat/model-picker-drawer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stack } from 'expo-router';
import { Menu, Plus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const headerTitle = useCallback(() => <ChatHeader />, []);

  const headerLeft = useCallback(
    () => (
      <Button variant="ghost" size="icon" onPress={() => setDrawerOpen(true)}>
        <Icon as={Menu} className="text-foreground size-6" />
      </Button>
    ),
    []
  );

  const headerRight = useCallback(
    () => (
      <Button variant="ghost" size="icon" onPress={() => setModelPickerOpen(true)}>
        <Icon as={Plus} className="text-foreground size-6" />
      </Button>
    ),
    []
  );

  const screenOptions = useMemo(
    () => ({
      headerTitle,
      headerTitleAlign: 'center' as const,
      headerLeft,
      headerRight,
    }),
    [headerLeft, headerRight, headerTitle]
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Stack screenOptions={screenOptions} />
      <ChatHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ModelPickerDrawer open={modelPickerOpen} onClose={() => setModelPickerOpen(false)} />
    </SafeAreaView>
  );
}
