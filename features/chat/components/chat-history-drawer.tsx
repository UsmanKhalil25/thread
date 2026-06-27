import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ListSpinner } from '@/components/ui/list-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/search-input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Caption, RowTitle } from '@/components/ui/typography';
import { deleteChat, setChatTitle } from '@/db/repositories/chats.repository';
import { useChat } from '@/features/chat/contexts/chat-context';
import { loadMoreChats, refreshChats, useChats } from '@/features/chat/hooks/use-chats';
import type { Chat } from '@/types/entities/chat';
import type { TriggerRef as PopoverTriggerRef } from '@rn-primitives/popover';
import { FlashList } from '@shopify/flash-list';
import { ChevronRight, Pencil, Settings, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChatRowItem = Chat & {
  time: string;
  section: 'Today' | 'Earlier';
  active?: boolean;
};

type ListItem = { type: 'header'; label: string } | { type: 'chat'; chat: ChatRowItem };

interface ChatHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectChat?: (id: string) => void;
  onSettings?: () => void;
}

function SectionHeader({ label }: { label: string }) {
  return <Caption className="px-1.5 pt-3 pb-1 uppercase">{label}</Caption>;
}

function ChatListSkeleton() {
  return (
    <View className="gap-2 pt-3">
      <Skeleton className="bg-sidebar-accent mx-1.5 mb-1 h-3 w-16" />
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={i} className="flex-row items-center justify-between px-3 py-3">
          <Skeleton className={`bg-sidebar-accent ${i % 2 === 0 ? 'h-4 w-36' : 'h-4 w-48'}`} />
          <Skeleton className="bg-sidebar-accent ml-2 h-3 w-12" />
        </View>
      ))}
    </View>
  );
}

function formatTime(updatedAt: number): string {
  const date = new Date(updatedAt);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay)
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getSection(updatedAt: number): 'Today' | 'Earlier' {
  return new Date(updatedAt).toDateString() === new Date().toDateString() ? 'Today' : 'Earlier';
}

function ChatRow({
  chat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: {
  chat: ChatRowItem;
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onRenameChat?: (id: string, title: string) => void | Promise<void>;
}) {
  const title = chat.title ?? 'New chat';
  const actionsTriggerRef = useRef<PopoverTriggerRef>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const trimmedRenameValue = renameValue.trim();
  const canRename = trimmedRenameValue.length > 0 && trimmedRenameValue !== title;

  const handlePress = useCallback(() => onSelectChat?.(chat.id), [chat.id, onSelectChat]);
  const handleLongPress = useCallback(() => actionsTriggerRef.current?.open(), []);
  const handleRenamePress = useCallback(() => {
    setRenameValue(title);
    actionsTriggerRef.current?.close();
    setRenameOpen(true);
  }, [title]);
  const handleDeletePress = useCallback(() => {
    actionsTriggerRef.current?.close();
    setDeleteOpen(true);
  }, []);
  const handleDelete = useCallback(() => onDeleteChat?.(chat.id), [chat.id, onDeleteChat]);
  const handleRename = useCallback(() => {
    if (!canRename) return;
    onRenameChat?.(chat.id, trimmedRenameValue);
    setRenameOpen(false);
  }, [canRename, chat.id, onRenameChat, trimmedRenameValue]);

  return (
    <>
      <Popover>
        <PopoverTrigger ref={actionsTriggerRef} asChild>
          <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            className={`flex-row items-center justify-between rounded-xl border px-3 py-2.5 ${
              chat.active ? 'border-border bg-card' : 'border-transparent'
            }`}>
            {chat.title == null ? (
              <Skeleton className="bg-sidebar-accent w-32 flex-1" />
            ) : (
              <RowTitle
                className={`flex-1 ${chat.active ? 'text-foreground' : 'text-muted-foreground'}`}
                numberOfLines={1}>
                {chat.title}
              </RowTitle>
            )}
            <Caption className="ml-2 shrink-0">{chat.time}</Caption>
          </Pressable>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="center" className="w-44 p-1">
          <Pressable
            onPress={handleRenamePress}
            className="flex-row items-center gap-2 rounded-md px-3 py-2 active:opacity-70">
            <Icon as={Pencil} className="text-muted-foreground size-4" />
            <RowTitle className="text-sm">Rename</RowTitle>
          </Pressable>
          <Pressable
            onPress={handleDeletePress}
            className="flex-row items-center gap-2 rounded-md px-3 py-2 active:opacity-70">
            <Icon as={Trash2} className="text-destructive size-4" />
            <RowTitle className="text-destructive text-sm">Delete</RowTitle>
          </Pressable>
        </PopoverContent>
      </Popover>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes "{title}" and all messages in the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleDelete}>
              <Text>Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename chat</AlertDialogTitle>
            <AlertDialogDescription>Update the title shown in chat history.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={renameValue}
            onChangeText={setRenameValue}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleRename}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleRename} disabled={!canRename}>
              <Text>Save</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ChatHistoryDrawer({
  open,
  onClose,
  onSelectChat,
  onSettings,
}: ChatHistoryDrawerProps) {
  const insets = useSafeAreaInsets();
  const { activeChatId, setActiveChatId } = useChat();
  const { chats, status, loadingMore } = useChats(open);
  const [query, setQuery] = useState('');
  const [listDrawn, setListDrawn] = useState(false);

  useEffect(() => {
    setListDrawn(false);
  }, [open]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) onClose();
    },
    [onClose]
  );

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
      void refreshChats();
    },
    [activeChatId, setActiveChatId]
  );

  const handleRenameChat = useCallback(async (id: string, title: string) => {
    await setChatTitle(id, title);
    void refreshChats();
  }, []);

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
        <ChatRow
          chat={item.chat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      );
    },
    [handleDeleteChat, handleRenameChat, handleSelectChat]
  );

  const getItemType = useCallback((item: ListItem) => item.type, []);
  const keyExtractor = useCallback(
    (item: ListItem) => (item.type === 'header' ? `header-${item.label}` : item.chat.id),
    []
  );
  const initialLoading = open && status !== 'ready' && data.length === 0;
  const maskMount = !listDrawn && data.length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left">
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <SheetTitle className="absolute h-0 w-0 opacity-0">Chat history</SheetTitle>
          <SheetHeader className="flex-row items-center px-2 pb-2">
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={X} className="text-sidebar-foreground size-5" />
            </Button>
          </SheetHeader>

          <SearchInput value={query} onChangeText={setQuery} />

          <View className="flex-1 px-3">
            {initialLoading ? (
              <ChatListSkeleton />
            ) : (
              <>
                <FlashList
                  data={data}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  getItemType={getItemType}
                  showsVerticalScrollIndicator={false}
                  onLoad={() => setListDrawn(true)}
                  onEndReached={loadMoreChats}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={loadingMore ? <ListSpinner /> : null}
                />
                {maskMount ? (
                  <View className="bg-sidebar absolute inset-0">
                    <ChatListSkeleton />
                  </View>
                ) : null}
              </>
            )}
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
        </View>
      </SheetContent>
    </Sheet>
  );
}
