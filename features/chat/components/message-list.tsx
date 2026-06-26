import { ListSpinner } from '@/components/ui/list-spinner';
import { MessageBubble } from '@/features/chat/components/message-bubble';
import type { Message } from '@/types/entities/message';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';

interface MessageListProps {
  messages: Message[];
  onEdit?: (id: string, content: string) => void | Promise<void>;
  onRegenerate?: (id: string) => void | Promise<void>;
  isBusy?: boolean;
  thinkingLabel?: string;
  onLoadOlder?: () => void;
  loadingOlder?: boolean;
}

export function MessageList({
  messages,
  onEdit,
  onRegenerate,
  isBusy,
  thinkingLabel,
  onLoadOlder,
  loadingOlder,
}: MessageListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        onEdit={onEdit}
        onRegenerate={onRegenerate}
        isBusy={isBusy}
        thinkingLabel={thinkingLabel}
      />
    ),
    [isBusy, onEdit, onRegenerate, thinkingLabel]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const extraData = useMemo(() => ({ isBusy, thinkingLabel }), [isBusy, thinkingLabel]);

  return (
    <FlashList
      data={messages}
      extraData={extraData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      onStartReached={onLoadOlder}
      onStartReachedThreshold={0.5}
      ListHeaderComponent={loadingOlder ? <ListSpinner /> : null}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
    />
  );
}
