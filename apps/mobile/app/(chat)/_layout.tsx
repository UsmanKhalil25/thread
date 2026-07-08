import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ChatHistoryDrawer } from '@/features/chat/components/chat-history-drawer';
import { ChatHeader } from '@/features/chat/components/chat-header';
import { ModelPickerDrawer } from '@/features/chat/components/model-picker-drawer';
import { ChatProvider, useChat } from '@/features/chat/contexts/chat-context';
import { useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { Menu, Plus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Keyboard, View } from 'react-native';

function NewChatButton({ onPress }: { onPress?: () => void }) {
  const { setActiveChatId } = useChat();

  const handlePress = useCallback(() => {
    setActiveChatId(null);
    onPress?.();
  }, [onPress, setActiveChatId]);

  return (
    <Button variant="ghost" size="icon" onPress={handlePress}>
      <Icon as={Plus} className="text-foreground size-6" />
    </Button>
  );
}

export default function ChatLayout() {
  const router = useRouter();
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    Keyboard.dismiss();
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openModelPicker = useCallback(() => {
    Keyboard.dismiss();
    setModelPickerOpen(true);
  }, []);
  const closeModelPicker = useCallback(() => setModelPickerOpen(false), []);

  const navigateToSettings = useCallback(() => {
    setDrawerOpen(false);
    router.push('/(settings)');
  }, [router]);

  const navigateToModels = useCallback(() => {
    setModelPickerOpen(false);
    router.push('/(settings)/models');
  }, [router]);

  const headerTitle = useCallback(
    () => <ChatHeader onPress={openModelPicker} />,
    [openModelPicker]
  );

  const headerLeft = useCallback(
    () => (
      <Button variant="ghost" size="icon" onPress={openDrawer}>
        <Icon as={Menu} className="text-foreground size-6" />
      </Button>
    ),
    [openDrawer]
  );

  const headerRight = useCallback(() => <NewChatButton onPress={closeDrawer} />, [closeDrawer]);

  const screenOptions = useMemo(
    () => ({
      headerTitle,
      headerTitleAlign: 'center' as const,
      headerLeft,
      headerRight,
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      animation: 'ios_from_right' as const,
    }),
    [colors.background, headerLeft, headerRight, headerTitle]
  );

  return (
    <ChatProvider openModelPicker={openModelPicker}>
      <View className="flex-1">
        <Stack screenOptions={screenOptions} />
        <ChatHistoryDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          onSettings={navigateToSettings}
        />
        <ModelPickerDrawer
          open={modelPickerOpen}
          onClose={closeModelPicker}
          onBrowseModels={navigateToModels}
        />
      </View>
    </ChatProvider>
  );
}
