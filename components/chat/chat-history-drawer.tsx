import { SearchInput } from '@/components/chat/search-input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet';
import { Caption, RowTitle } from '@/components/ui/typography';
import { FlashList } from '@shopify/flash-list';
import { ChevronRight, Plus, Settings, X } from 'lucide-react-native';
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
  return <Caption className="px-1.5 pt-3 pb-1 uppercase">{label}</Caption>;
}

function ChatRow({ chat, onSelectChat }: { chat: Chat; onSelectChat?: (id: string) => void }) {
  const handlePress = useCallback(() => onSelectChat?.(chat.id), [chat.id, onSelectChat]);
  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center justify-between rounded-xl border px-3 py-2.5 ${
        chat.active ? 'border-border bg-card' : 'border-transparent'
      }`}>
      <RowTitle
        className={`flex-1 ${chat.active ? 'text-foreground' : 'text-muted-foreground'}`}
        numberOfLines={1}>
        {chat.title}
      </RowTitle>
      <Caption className="ml-2 shrink-0">{chat.time}</Caption>
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
              <RowTitle className="text-xs">New chat</RowTitle>
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
            <Pressable
              onPress={onSettings}
              className="flex-row items-center gap-3 py-2 active:opacity-70">
              <Icon as={Settings} className="text-muted-foreground size-5" />
              <RowTitle className="flex-1">Settings</RowTitle>
              <Icon as={ChevronRight} className="text-muted-foreground size-4" />
            </Pressable>

            <View className="flex-row items-center gap-1.5 pt-1">
              <Caption>on-device · private · offline</Caption>
            </View>
          </SheetFooter>
        </SafeAreaView>
      </SheetContent>
    </Sheet>
  );
}
