import { ChatInput } from '@/components/chat/chat-input';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Sparkles } from 'lucide-react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { View } from 'react-native';

export default function NewChatScreen() {
  return (
    <View className="bg-background flex-1">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <View className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
            <Icon as={Sparkles} className="text-primary size-8" />
          </View>

          <View className="items-center gap-2">
            <Text className="text-foreground text-3xl font-bold tracking-tight">
              Good afternoon
            </Text>
            <Text className="text-muted-foreground text-base">How can I help?</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <ChatInput />
      </KeyboardStickyView>
    </View>
  );
}
