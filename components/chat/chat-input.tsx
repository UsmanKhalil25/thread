import { Icon } from '@/components/ui/icon';
import { ArrowUp, Mic, Paperclip } from 'lucide-react-native';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

interface ChatInputProps extends TextInputProps {
  onSend?: () => void;
  onAttach?: () => void;
  onMic?: () => void;
}

export function ChatInput({ onSend, onAttach, onMic, ...props }: ChatInputProps) {
  return (
    <View className="p-2">
      <View className="border-border bg-card flex-row items-center gap-3 rounded-3xl border px-4 py-3">
        <TextInput
          className="text-foreground flex-1 text-base"
          placeholder="Ask anything"
          placeholderTextColor="#71717a"
          multiline
          {...props}
        />
        <Pressable onPress={onAttach} hitSlop={8}>
          <Icon as={Paperclip} className="text-muted-foreground size-5" />
        </Pressable>
        <Pressable onPress={onMic} hitSlop={8}>
          <Icon as={Mic} className="text-muted-foreground size-5" />
        </Pressable>
        <Pressable
          onPress={onSend}
          className="bg-foreground h-9 w-9 items-center justify-center rounded-full active:opacity-80">
          <Icon as={ArrowUp} className="text-background size-5" />
        </Pressable>
      </View>
    </View>
  );
}
