import { Button } from '@/components/ui/button';
import { ChatHeader } from '@/components/chat/chat-header';
import { Icon } from '@/components/ui/icon';
import { Stack } from 'expo-router';
import { Menu, Plus } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatLayout() {
  const headerTitle = useCallback(() => <ChatHeader />, []);

  const headerLeft = useCallback(
    () => (
      <Button variant="ghost" size="icon">
        <Icon as={Menu} className="text-foreground size-6" />
      </Button>
    ),
    []
  );

  const headerRight = useCallback(
    () => (
      <Button variant="ghost" size="icon">
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
    </SafeAreaView>
  );
}
