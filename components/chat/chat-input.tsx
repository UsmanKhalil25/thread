import { THEME } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ArrowUp, Mic, Paperclip } from 'lucide-react-native';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useUniwind } from 'uniwind';

interface ChatInputProps extends TextInputProps {
  onSend?: () => void;
  onAttach?: () => void;
  onMic?: () => void;
  hint?: string;
}

export function ChatInput({ onSend, onAttach, onMic, hint, ...props }: ChatInputProps) {
  const { theme } = useUniwind();
  const placeholderColor = THEME[theme ?? 'light'].mutedForeground;

  return (
    <View className="px-3 pt-2 pb-3.5">
      <View className="border-border bg-card flex-row items-end gap-2 rounded-3xl border px-3 py-2.5">
        <TextInput
          className="text-foreground flex-1 pb-0.5 text-[14.5px] leading-[1.5]"
          placeholder="Ask anything"
          placeholderTextColor={placeholderColor}
          multiline
          {...props}
        />
        <Pressable onPress={onAttach} hitSlop={8} className="pb-0.5">
          <Icon as={Paperclip} className="text-muted-foreground" size={17} />
        </Pressable>
        <Pressable onPress={onMic} hitSlop={8} className="pb-0.5">
          <Icon as={Mic} className="text-muted-foreground" size={17} />
        </Pressable>
        <Pressable
          onPress={onSend}
          className="bg-foreground h-8 w-8 items-center justify-center rounded-xl active:opacity-80">
          <Icon as={ArrowUp} className="text-background" size={15} strokeWidth={2.2} />
        </Pressable>
      </View>
      {hint ? (
        <Text className="text-muted-foreground/50 mt-2 text-center font-mono text-[10.5px]">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
