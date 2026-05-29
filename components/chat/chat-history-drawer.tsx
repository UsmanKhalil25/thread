import { SearchInput } from '@/components/chat/search-input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { FlashList } from '@shopify/flash-list';
import { Database, Plus, Settings, X } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Chat = {
  id: string;
  title: string;
  time: string;
  section: 'Today' | 'Earlier';
  active?: boolean;
};

type ListItem = { type: 'header'; label: string } | { type: 'chat'; chat: Chat };

const CHATS: Chat[] = [
  { id: '1', title: 'Rust async runtime', time: 'Now', section: 'Today', active: true },
  { id: '2', title: 'Refactor auth middleware', time: '2h', section: 'Today' },
  { id: '3', title: 'Plan the week', time: 'Yesterday', section: 'Earlier' },
  { id: '4', title: 'Translate Hokusai essay', time: 'Yesterday', section: 'Earlier' },
  { id: '5', title: 'RAG over journal entries', time: 'Mon', section: 'Earlier' },
  { id: '6', title: 'Dinner ideas with shiso', time: 'Mon', section: 'Earlier' },
  { id: '7', title: 'Notes on Bach partitas', time: 'Sun', section: 'Earlier' },
];

const LIST_DATA: ListItem[] = [
  { type: 'header', label: 'Today' },
  ...CHATS.filter((c) => c.section === 'Today').map((chat) => ({ type: 'chat' as const, chat })),
  { type: 'header', label: 'Earlier' },
  ...CHATS.filter((c) => c.section === 'Earlier').map((chat) => ({ type: 'chat' as const, chat })),
];

const EDGES = ['top', 'bottom'] as const;

interface ChatHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onModels?: () => void;
  onSettings?: () => void;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-muted-foreground px-1.5 pt-3 pb-1 font-mono text-xs font-medium uppercase">
      {label}
    </Text>
  );
}

function ChatRow({ chat, onSelectChat }: { chat: Chat; onSelectChat?: (id: string) => void }) {
  const handlePress = useCallback(() => onSelectChat?.(chat.id), [chat.id, onSelectChat]);
  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center justify-between rounded-lg px-2 py-2.5 ${
        chat.active ? 'bg-card' : ''
      }`}>
      <Text
        className={`flex-1 text-sm ${
          chat.active ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'
        }`}
        numberOfLines={1}>
        {chat.title}
      </Text>
      <Text className="text-muted-foreground ml-2 shrink-0 font-mono text-[10.5px]">
        {chat.time}
      </Text>
    </Pressable>
  );
}

export function ChatHistoryDrawer({
  open,
  onClose,
  onNewChat,
  onSelectChat,
  onModels,
  onSettings,
}: ChatHistoryDrawerProps) {
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) onClose();
    },
    [onClose]
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') return <SectionHeader label={item.label} />;
      return <ChatRow chat={item.chat} onSelectChat={onSelectChat} />;
    },
    [onSelectChat]
  );

  const getItemType = useCallback((item: ListItem) => item.type, []);
  const keyExtractor = useCallback(
    (item: ListItem) => (item.type === 'header' ? `header-${item.label}` : item.chat.id),
    []
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left">
        <SafeAreaView edges={EDGES} style={{ flex: 1 }}>
          <SheetHeader className="flex-row items-center px-2 pb-2">
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={X} className="text-sidebar-foreground size-5" />
            </Button>
            <View className="flex-1" />
            <Pressable
              onPress={onNewChat}
              className="border-border bg-card flex-row items-center gap-1.5 rounded-lg border px-3 py-2 active:opacity-70">
              <Icon as={Plus} className="text-foreground" size={12} />
              <Text className="text-foreground text-[12px] font-medium">New chat</Text>
            </Pressable>
          </SheetHeader>

          <SearchInput />

          <View className="flex-1 px-3">
            <FlashList
              data={LIST_DATA}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              getItemType={getItemType}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <SheetFooter className="pb-4">
            <Button
              variant="ghost"
              onPress={onModels}
              className="flex-row items-center justify-start gap-3">
              <Icon as={Database} className="text-muted-foreground" />
              <Text className="text-foreground text-sm">Models</Text>
            </Button>

            <Button
              variant="ghost"
              onPress={onSettings}
              className="flex-row items-center justify-start gap-3">
              <Icon as={Settings} className="text-muted-foreground" />
              <Text className="text-foreground text-sm">Settings</Text>
            </Button>
          </SheetFooter>
        </SafeAreaView>
      </SheetContent>
    </Sheet>
  );
}
