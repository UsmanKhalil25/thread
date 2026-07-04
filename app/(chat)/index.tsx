import { Skeleton } from '@/components/ui/skeleton';
import { ScreenTitle, Subtitle } from '@/components/ui/typography';
import { ChatInput } from '@/features/chat/components/chat-input';
import { MessageList } from '@/features/chat/components/message-list';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
import { useGreeting } from '@/features/chat/hooks/use-greeting';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MessageListSkeleton() {
  return (
    <View className="flex-1 gap-5 px-4 pt-5">
      <View className="items-end gap-2">
        <Skeleton className="h-11 w-[72%] rounded-2xl" />
        <Skeleton className="h-3 w-20" />
      </View>
      <View className="gap-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[78%]" />
        <Skeleton className="h-4 w-[84%]" />
        <Skeleton className="h-3 w-24" />
      </View>
      <View className="items-end gap-2">
        <Skeleton className="h-16 w-[82%] rounded-2xl" />
        <Skeleton className="h-3 w-16" />
      </View>
      <View className="gap-2">
        <Skeleton className="h-4 w-[86%]" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[66%]" />
      </View>
    </View>
  );
}

export default function NewChatScreen() {
  const [greeting, subtitle] = useGreeting();
  const {
    messages,
    isGenerating,
    isLoadingMessages,
    loadingOlder,
    loadOlderMessages,
    editAndRegenerate,
    regenerate,
    thinkingLabel,
  } = useChatSession();
  const insets = useSafeAreaInsets();
  const hasMessages = messages.length > 0;

  // Keep the skeleton up until the list has actually rendered its first items,
  // so the heavy initial markdown render happens behind the shimmer instead of a
  // blank/black gap.
  const [listReady, setListReady] = useState(false);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoadingMessages) setListReady(false);
  }, [isLoadingMessages]);

  const handleListReady = useCallback(() => {
    if (readyTimer.current) clearTimeout(readyTimer.current);
    setListReady(true);
  }, []);

  // Safety net: never leave the skeleton stuck if onLoad doesn't fire.
  useEffect(() => {
    if (isLoadingMessages || !hasMessages || listReady) return;
    readyTimer.current = setTimeout(() => setListReady(true), 1500);
    return () => {
      if (readyTimer.current) clearTimeout(readyTimer.current);
    };
  }, [isLoadingMessages, hasMessages, listReady]);

  return (
    <View className="bg-background flex-1">
      {isLoadingMessages ? (
        <MessageListSkeleton />
      ) : hasMessages ? (
        <View className="flex-1">
          <MessageList
            messages={messages}
            isBusy={isGenerating}
            onEdit={editAndRegenerate}
            onRegenerate={regenerate}
            thinkingLabel={thinkingLabel}
            onLoadOlder={loadOlderMessages}
            loadingOlder={loadingOlder}
            onReady={handleListReady}
          />
          {!listReady ? (
            <View className="bg-background absolute inset-0">
              <MessageListSkeleton />
            </View>
          ) : null}
        </View>
      ) : (
        <View className="flex-1 justify-center gap-8 px-6">
          <View className="items-center gap-4">
            <View className="items-center gap-2">
              <ScreenTitle className="text-center">{greeting}</ScreenTitle>
              <Subtitle className="text-center">{subtitle}</Subtitle>
            </View>
          </View>
        </View>
      )}

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <ChatInput />
      </KeyboardStickyView>
    </View>
  );
}
