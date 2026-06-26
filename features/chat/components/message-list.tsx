import { MessageBubble } from '@/features/chat/components/message-bubble';
import type { Message } from '@/types/entities/message';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';

interface MessageListProps {
  messages: Message[];
  onEdit?: (id: string, content: string) => void | Promise<void>;
  onRegenerate?: (id: string) => void | Promise<void>;
  isBusy?: boolean;
}

export function MessageList({ messages, onEdit, onRegenerate, isBusy }: MessageListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} onEdit={onEdit} onRegenerate={onRegenerate} isBusy={isBusy} />
    ),
    [isBusy, onEdit, onRegenerate]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <FlashList
      data={messages}
      extraData={isBusy}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
