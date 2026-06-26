import { Text } from '@/components/ui/text';
import { Caption } from '@/components/ui/typography';
import { MessageActions } from '@/features/chat/components/message-actions';
import { MessageEditor } from '@/features/chat/components/message-editor';
import { MarkdownMessage } from '@/features/chat/components/markdown-message';
import { ThinkingIndicator } from '@/features/chat/components/thinking-indicator';
import type { Message } from '@/types/entities/message';
import { useState } from 'react';
import { View } from 'react-native';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (id: string, content: string) => void | Promise<void>;
  onRegenerate?: (id: string) => void | Promise<void>;
  isBusy?: boolean;
}

export function MessageBubble({ message, onEdit, onRegenerate, isBusy }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isThinking = message.status === 'generating' && !message.content;
  const showStats =
    message.role === 'assistant' &&
    message.status === 'complete' &&
    typeof message.tokensPerSecond === 'number';
  const [isEditing, setIsEditing] = useState(false);

  if (isUser) {
    if (isEditing) {
      return (
        <View className="w-full px-4 py-2">
          <MessageEditor
            initialValue={message.content}
            onSave={(value) => {
              void onEdit?.(message.id, value);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </View>
      );
    }

    return (
      <View className="items-end gap-1 px-4 py-2">
        <View className="bg-primary max-w-[86%] rounded-2xl px-4 py-3">
          <Text className="text-primary-foreground text-sm leading-relaxed">{message.content}</Text>
        </View>
        <MessageActions
          content={message.content}
          align="end"
          onEdit={() => setIsEditing(true)}
          disabled={isBusy}
        />
      </View>
    );
  }

  return (
    <View className="w-full gap-1 px-4 py-2">
      {isThinking ? (
        <ThinkingIndicator />
      ) : (
        <MarkdownMessage content={message.content} isStreaming={message.status === 'generating'} />
      )}

      {showStats && <Caption>{message.tokensPerSecond?.toFixed(1)} tok/s</Caption>}
      {message.status === 'interrupted' && <Caption>Interrupted</Caption>}
      {message.status === 'error' && <Caption className="text-destructive">Error</Caption>}
      {message.status === 'complete' ? (
        <MessageActions
          content={message.content}
          align="start"
          onRegenerate={() => void onRegenerate?.(message.id)}
          disabled={isBusy}
        />
      ) : null}
    </View>
  );
}
