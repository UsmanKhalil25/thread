import { ChatInput } from '@/components/chat/chat-input';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { BookOpen, ChevronRight, Code, MessageSquare, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type { LucideIcon } from 'lucide-react-native';

const SUGGESTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: Code, label: 'Refactor this function' },
  { icon: Sparkles, label: 'Summarize a long document' },
  { icon: MessageSquare, label: 'Plan my week' },
  { icon: BookOpen, label: 'Translate a paragraph' },
];

function SuggestionRow({
  icon,
  label,
  isFirst,
}: {
  icon: LucideIcon;
  label: string;
  isFirst?: boolean;
}) {
  return (
    <View>
      {!isFirst && <Separator />}
      <Pressable className="flex-row items-center gap-3 px-1 py-3.5 active:opacity-70">
        <Icon as={icon} className="text-muted-foreground" size={14} />
        <Text className="text-muted-foreground flex-1 text-sm tracking-[-0.005em]">{label}</Text>
        <Icon as={ChevronRight} className="text-muted-foreground/50" size={13} />
      </Pressable>
    </View>
  );
}

export default function NewChatScreen() {
  return (
    <View className="bg-background flex-1">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={styles.grow}
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center gap-8 px-5">
          <View className="items-center gap-4">
            <View className="bg-card border-border h-12 w-12 items-center justify-center rounded-xl border">
              <Icon as={Sparkles} className="text-blue-400" size={20} />
            </View>
            <View className="items-center gap-1.5">
              <Text className="text-foreground text-[24px] font-semibold tracking-[-0.025em]">
                Good afternoon, Sam.
              </Text>
              <Text className="text-muted-foreground text-[13.5px]">How can I help?</Text>
            </View>
          </View>

          <View>
            {SUGGESTIONS.map((s, i) => (
              <SuggestionRow key={s.label} icon={s.icon} label={s.label} isFirst={i === 0} />
            ))}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <ChatInput hint="running on this device" />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
});
