import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ChatHistoryDrawer } from '@/features/chat/components/chat-history-drawer';
import { ChatHeader } from '@/features/chat/components/chat-header';
import { ModelPickerDrawer } from '@/features/chat/components/model-picker-drawer';
import { ChatProvider } from '@/features/chat/contexts/chat-context';
import { useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

export default function ChatLayout() {
  const router = useRouter();
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openModelPicker = useCallback(() => setModelPickerOpen(true), []);
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

  const screenOptions = useMemo(
    () => ({
      headerTitle,
      headerTitleAlign: 'center' as const,
      headerLeft,
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      animation: 'ios_from_right' as const,
    }),
    [colors.background, headerLeft, headerTitle]
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
