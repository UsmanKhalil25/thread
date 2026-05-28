import { ChatHistoryDrawer } from '@/components/chat/chat-history-drawer';
import { ChatHeader } from '@/components/chat/chat-header';
import { ModelPickerDrawer } from '@/components/chat/model-picker-drawer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { Menu, Plus } from 'lucide-react-native';
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

  const headerRight = useCallback(
    () => (
      <Button variant="ghost" size="icon" onPress={openModelPicker}>
        <Icon as={Plus} className="text-foreground size-6" />
      </Button>
    ),
    [openModelPicker]
  );

  const screenOptions = useMemo(
    () => ({
      headerTitle,
      headerTitleAlign: 'center' as const,
      headerLeft,
      headerRight,
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
    }),
    [colors.background, headerLeft, headerRight, headerTitle]
  );

  return (
    <SafeAreaView edges={BOTTOM_EDGE} style={S.flex}>
      <Stack screenOptions={screenOptions} />
      <ChatHistoryDrawer open={drawerOpen} onClose={closeDrawer} onSettings={navigateToSettings} />
      <ModelPickerDrawer open={modelPickerOpen} onClose={closeModelPicker} />
    </SafeAreaView>
  );
}

const BOTTOM_EDGE = ['bottom'] as const;

const S = StyleSheet.create({ flex: { flex: 1 } });
