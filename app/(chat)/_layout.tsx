import { ChatHistoryDrawer } from '@/components/chat/chat-history-drawer';
import { ChatHeader } from '@/components/chat/chat-header';
import { ModelPickerDrawer } from '@/components/chat/model-picker-drawer';
import { ChatProvider } from '@/contexts/chat';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    }),
    [colors.background, headerLeft, headerTitle]
  );

  return (
    <ChatProvider>
      <SafeAreaView edges={EDGES} style={S.flex}>
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
      </SafeAreaView>
    </ChatProvider>
  );
}

const EDGES = ['bottom'] as const;

const S = StyleSheet.create({ flex: { flex: 1 } });
