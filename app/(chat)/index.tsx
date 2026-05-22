import { ChatInput } from '@/components/chat/chat-input';
import { SuggestionRow } from '@/components/chat/suggestion-row';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CalendarDays, Code, FileText, Languages, Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

const SUGGESTIONS = [
  { icon: Code, label: 'Refactor this function' },
  { icon: FileText, label: 'Summarize a long document' },
  { icon: CalendarDays, label: 'Plan my week' },
  { icon: Languages, label: 'Translate a paragraph' },
];

export default function NewChatScreen() {
  return (
    <View className="bg-background flex-1">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <View className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
          <Icon as={Sparkles} className="text-primary size-8" />
        </View>

        <View className="items-center gap-2">
          <Text className="text-foreground text-3xl font-bold tracking-tight">Good afternoon</Text>
          <Text className="text-muted-foreground text-base">How can I help?</Text>
        </View>
      </View>

      <View className="gap-3 px-6 pb-4">
        {SUGGESTIONS.map((s) => (
          <SuggestionRow key={s.label} icon={s.icon} label={s.label} />
        ))}
      </View>

      <ChatInput />
    </View>
  );
}
