import { ListSpinner } from '@/components/ui/list-spinner';
import { MessageBubble } from '@/features/chat/components/message-bubble';
import { THEME } from '@/lib/theme';
import type { Message } from '@/types/entities/message';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { useCallback } from 'react';
import { useUniwind } from 'uniwind';

interface MessageListProps {
  messages: Message[];
  onEdit?: (id: string, content: string) => void | Promise<void>;
  onRegenerate?: (id: string) => void | Promise<void>;
  isBusy?: boolean;
  thinkingLabel?: string;
  onLoadOlder?: () => void;
  loadingOlder?: boolean;
  onReady?: () => void;
}

export function MessageList({
  messages,
  onEdit,
  onRegenerate,
  isBusy,
  thinkingLabel,
  onLoadOlder,
  loadingOlder,
  onReady,
}: MessageListProps) {
  const { theme } = useUniwind();
  const scheme = theme ?? 'light';

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Message>) => (
      <MessageBubble
        message={item}
        onEdit={onEdit}
        onRegenerate={onRegenerate}
        isBusy={isBusy}
        thinkingLabel={item.status === 'generating' ? thinkingLabel : undefined}
      />
    ),
    [isBusy, onEdit, onRegenerate, thinkingLabel]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <LegendList
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={120}
      drawDistance={500}
      initialScrollAtEnd
      maintainVisibleContentPosition
      alignItemsAtEnd
      maintainScrollAtEnd
      onLoad={onReady}
      style={{ flex: 1, backgroundColor: THEME[scheme].background }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      onStartReached={onLoadOlder}
      onStartReachedThreshold={0.5}
      ListHeaderComponent={loadingOlder ? <ListSpinner /> : null}
    />
  );
}
