import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowUp, Mic, Paperclip } from 'lucide-react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { View, type TextInputContentSizeChangeEvent, type TextInputProps } from 'react-native';
import { useState, useCallback, useRef } from 'react';

interface ChatInputProps extends TextInputProps {
  onSend?: () => void;
  onAttach?: () => void;
  onMic?: () => void;
}

export function ChatInput({
  onSend,
  onAttach,
  onMic,
  onContentSizeChange,
  ...props
}: ChatInputProps) {
  const [isMultiline, setIsMultiline] = useState(false);
  const singleLineHeight = useRef(0);

  const handleContentSizeChange = useCallback(
    (e: TextInputContentSizeChangeEvent) => {
      const h = e.nativeEvent.contentSize.height;
      if (singleLineHeight.current === 0) {
        singleLineHeight.current = h;
      }
      const multiline = h > singleLineHeight.current + 4;
      if (multiline !== isMultiline) {
        setIsMultiline(multiline);
      }
      onContentSizeChange?.(e);
    },
    [isMultiline, onContentSizeChange]
  );

  return (
    <View className="px-6 pt-2 pb-2">
      <View
        className={cn(
          'border-border bg-card flex-row gap-2 rounded-2xl border px-3 py-2.5',
          isMultiline ? 'items-end' : 'items-center'
        )}>
        <Input
          variant="ghost"
          placeholder="Ask anything"
          multiline
          className="max-h-[120px]"
          onContentSizeChange={handleContentSizeChange}
          {...props}
        />
        <Animated.View layout={LinearTransition.duration(150)} className="flex-row gap-1.5">
          <Button variant="ghost" size="icon" onPress={onAttach} className="h-8 w-8 rounded-xl">
            <Icon as={Paperclip} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onPress={onMic} className="h-8 w-8 rounded-xl">
            <Icon as={Mic} className="text-muted-foreground" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onPress={onSend}
            className="bg-foreground h-8 w-8 rounded-xl">
            <Icon as={ArrowUp} className="text-background" />
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}
