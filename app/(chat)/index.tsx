import { ChatInput } from '@/features/chat/components/chat-input';
import { useGreeting } from '@/features/chat/hooks/use-greeting';
import { ScreenTitle, Subtitle } from '@/components/ui/typography';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewChatScreen() {
  const [greeting, subtitle] = useGreeting();
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background flex-1">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={styles.grow}
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center gap-8 px-6">
          <View className="items-center gap-4">
            <View className="items-center gap-2">
              <ScreenTitle className="text-center">{greeting}</ScreenTitle>
              <Subtitle className="text-center">{subtitle}</Subtitle>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: -insets.bottom, opened: 0 }}>
        <ChatInput />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
});
