import { Button } from '@/components/ui/button';
import { ChatHeader } from '@/components/chat/chat-header';
import { Icon } from '@/components/ui/icon';
import { Stack } from 'expo-router';
import { Menu, Plus } from 'lucide-react-native';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: () => <ChatHeader />,
        headerTitleAlign: 'center',
        headerLeft: () => (
          <Button variant="ghost" size="icon">
            <Icon as={Menu} className="text-foreground size-6" />
          </Button>
        ),
        headerRight: () => (
          <Button variant="ghost" size="icon">
            <Icon as={Plus} className="text-foreground size-6" />
          </Button>
        ),
      }}
    />
  );
}
