import { ChatInput } from '@/components/chat/chat-input';
import { useGreeting } from '@/hooks/use-greeting';
import { Text } from '@/components/ui/text';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';

export default function NewChatScreen() {
  const [greeting, subtitle] = useGreeting();
  return (
    <View className="bg-background flex-1">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={styles.grow}
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center gap-8 px-5">
          <View className="items-center gap-4">
            <View className="items-center gap-1.5">
              <Text className="text-foreground text-4xl font-semibold tracking-tight">
                {greeting}
              </Text>
              <Text className="text-muted-foreground font-mono text-lg">{subtitle}</Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <ChatInput />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
});
