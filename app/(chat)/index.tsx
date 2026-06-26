import { ChatInput } from '@/features/chat/components/chat-input';
import { MessageList } from '@/features/chat/components/message-list';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
import { useGreeting } from '@/features/chat/hooks/use-greeting';
import { ScreenTitle, Subtitle } from '@/components/ui/typography';
import { View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewChatScreen() {
  const [greeting, subtitle] = useGreeting();
  const { messages, isGenerating, editAndRegenerate, regenerate, thinkingLabel } = useChatSession();
  const insets = useSafeAreaInsets();
  const hasMessages = messages.length > 0;

  return (
    <View className="bg-background flex-1">
      {hasMessages ? (
        <MessageList
          messages={messages}
          isBusy={isGenerating}
          onEdit={editAndRegenerate}
          onRegenerate={regenerate}
          thinkingLabel={thinkingLabel}
        />
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

      <KeyboardStickyView offset={{ closed: -insets.bottom, opened: 0 }}>
        <ChatInput />
      </KeyboardStickyView>
    </View>
  );
}
