import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Caption } from '@/components/ui/typography';
import { useChat } from '@/features/chat/contexts/chat-context';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
import { useLlamaStatus } from '@/features/inference/use-inference';
import { useModelDownloads } from '@/features/models/hooks/use-downloads';
import { cn } from '@/lib/utils';
import { ArrowUp, Mic, Paperclip, Square } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { LinearTransition } from 'react-native-reanimated';
import {
  Pressable,
  View,
  type TextInputContentSizeChangeEvent,
  type TextInputProps,
} from 'react-native';
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
  const router = useRouter();
  const { selectedModelId, openModelPicker } = useChat();
  const { send, stop, isGenerating } = useChatSession();
  const llamaStatus = useLlamaStatus();
  const downloads = useModelDownloads();
  const [text, setText] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const singleLineHeight = useRef(0);
  const readyModelCount = Object.values(downloads).filter(
    (download) => download.status === 'ready'
  ).length;
  const selectedReady = selectedModelId ? downloads[selectedModelId]?.status === 'ready' : false;
  const canSend =
    text.trim().length > 0 &&
    !isGenerating &&
    selectedReady &&
    llamaStatus.status === 'ready' &&
    !!selectedModelId;

  const guidance = !selectedModelId
    ? readyModelCount > 0
      ? 'Select a model to start'
      : 'Download a model to start'
    : !selectedReady
      ? 'Download this model first'
      : llamaStatus.status === 'loading'
        ? 'Loading model...'
        : llamaStatus.status === 'error'
          ? 'Model failed to load'
          : undefined;

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

  const handleGuidancePress = useCallback(() => {
    if (!selectedModelId && readyModelCount > 0) {
      openModelPicker?.();
      return;
    }

    router.push('/(settings)/models');
  }, [openModelPicker, readyModelCount, router, selectedModelId]);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    const content = text;
    setText('');
    onSend?.();
    void send(content);
  }, [canSend, onSend, send, text]);

  return (
    <View className="px-6 pt-2 pb-2">
      {guidance && (
        <Pressable onPress={handleGuidancePress} className="mb-2 items-center active:opacity-70">
          <Caption>{guidance}</Caption>
        </Pressable>
      )}
      <View
        className={cn(
          'border-border bg-card flex-row gap-2 rounded-2xl border px-3 py-2.5',
          isMultiline ? 'items-end' : 'items-center'
        )}>
        <Input
          variant="ghost"
          placeholder="Ask anything"
          multiline
          value={text}
          editable={!isGenerating}
          onChangeText={setText}
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
            onPress={isGenerating ? stop : handleSend}
            disabled={!isGenerating && !canSend}
            className="bg-foreground h-8 w-8 rounded-xl">
            <Icon as={isGenerating ? Square : ArrowUp} className="text-background" />
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}
