import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SearchInput } from '@/components/ui/search-input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Caption, RowTitle } from '@/components/ui/typography';
import { deleteChat, listChats } from '@/db/repositories/chats.repository';
import { useChat } from '@/features/chat/contexts/chat-context';
import type { Chat } from '@/types/entities/chat';
import { FlashList } from '@shopify/flash-list';
import { ChevronRight, Plus, Settings, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChatRowItem = Chat & {
  time: string;
  section: 'Today' | 'Earlier';
  active?: boolean;
};

type ListItem = { type: 'header'; label: string } | { type: 'chat'; chat: ChatRowItem };

const EDGES = ['top', 'bottom'] as const;

interface ChatHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onSettings?: () => void;
}

function SectionHeader({ label }: { label: string }) {
  return <Caption className="px-1.5 pt-3 pb-1 uppercase">{label}</Caption>;
}

function formatTime(updatedAt: number): string {
  const date = new Date(updatedAt);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return 'Today';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getSection(updatedAt: number): 'Today' | 'Earlier' {
  return new Date(updatedAt).toDateString() === new Date().toDateString() ? 'Today' : 'Earlier';
}

function ChatRow({
  chat,
  onSelectChat,
  onDeleteChat,
}: {
  chat: ChatRowItem;
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
}) {
  const handlePress = useCallback(() => onSelectChat?.(chat.id), [chat.id, onSelectChat]);
  const handleLongPress = useCallback(() => onDeleteChat?.(chat.id), [chat.id, onDeleteChat]);
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={`flex-row items-center justify-between rounded-xl border px-3 py-2.5 ${
        chat.active ? 'border-border bg-card' : 'border-transparent'
      }`}>
      <RowTitle
        className={`flex-1 ${chat.active ? 'text-foreground' : 'text-muted-foreground'}`}
        numberOfLines={1}>
        {chat.title ?? 'New chat'}
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
  onSettings,
}: ChatHistoryDrawerProps) {
  const { activeChatId, setActiveChatId } = useChat();
  const [chats, setChats] = useState<Chat[]>([]);
  const [query, setQuery] = useState('');

  const reloadChats = useCallback(async () => {
    setChats(await listChats());
  }, []);

  useEffect(() => {
    if (open) void reloadChats();
  }, [open, reloadChats]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) onClose();
    },
    [onClose]
  );

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    onNewChat?.();
    onClose();
  }, [onClose, onNewChat, setActiveChatId]);

  const handleSelectChat = useCallback(
    (id: string) => {
      setActiveChatId(id);
      onSelectChat?.(id);
      onClose();
    },
    [onClose, onSelectChat, setActiveChatId]
  );

  const handleDeleteChat = useCallback(
    async (id: string) => {
      await deleteChat(id);
      if (activeChatId === id) setActiveChatId(null);
      await reloadChats();
    },
    [activeChatId, reloadChats, setActiveChatId]
  );

  const data = useMemo<ListItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = chats
      .filter((chat) => (chat.title ?? 'New chat').toLowerCase().includes(normalizedQuery))
      .map((chat) => ({
        ...chat,
        time: formatTime(chat.updatedAt),
        section: getSection(chat.updatedAt),
        active: chat.id === activeChatId,
      }));

    const today = rows.filter((chat) => chat.section === 'Today');
    const earlier = rows.filter((chat) => chat.section === 'Earlier');
    return [
      ...(today.length
        ? [
            { type: 'header' as const, label: 'Today' },
            ...today.map((chat) => ({ type: 'chat' as const, chat })),
          ]
        : []),
      ...(earlier.length
        ? [
            { type: 'header' as const, label: 'Earlier' },
            ...earlier.map((chat) => ({ type: 'chat' as const, chat })),
          ]
        : []),
    ];
  }, [activeChatId, chats, query]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') return <SectionHeader label={item.label} />;
      return (
        <ChatRow chat={item.chat} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} />
      );
    },
    [handleDeleteChat, handleSelectChat]
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
          <SheetTitle className="absolute h-0 w-0 opacity-0">Chat history</SheetTitle>
          <SheetHeader className="flex-row items-center px-2 pb-2">
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={X} className="text-sidebar-foreground size-5" />
            </Button>
            <View className="flex-1" />
            <Pressable
              onPress={handleNewChat}
              className="border-border bg-card flex-row items-center gap-1.5 rounded-lg border px-3 py-2 active:opacity-70">
              <Icon as={Plus} className="text-foreground" size={12} />
              <RowTitle className="text-xs">New chat</RowTitle>
            </Pressable>
          </SheetHeader>

          <SearchInput value={query} onChangeText={setQuery} />

          <View className="flex-1 px-3">
            <FlashList
              data={data}
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
          </SheetFooter>
        </SafeAreaView>
      </SheetContent>
    </Sheet>
  );
}
