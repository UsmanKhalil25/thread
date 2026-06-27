import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useChat } from '@/features/chat/contexts/chat-context';
import {
  useChatActions,
  useIsGenerating,
  useIsLoadingMessages,
} from '@/features/chat/hooks/use-chat-session';
import { useSpeechToText } from '@/features/chat/hooks/use-speech-to-text';
import { useLlamaStatus } from '@/features/inference/use-inference';
import { useModelDownloads } from '@/features/models/hooks/use-downloads';
import { cn } from '@/lib/utils';
import { ArrowUp, Mic, Square, TriangleAlert, X } from 'lucide-react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { View, type TextInputContentSizeChangeEvent, type TextInputProps } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';

interface ChatInputProps extends TextInputProps {
  onSend?: () => void;
  onMic?: () => void;
}

export function ChatInput({ onSend, onMic, onContentSizeChange, ...props }: ChatInputProps) {
  const { selectedModelId, retryLoad } = useChat();
  const { send, stop: stopGeneration } = useChatActions();
  const isGenerating = useIsGenerating();
  const isLoadingMessages = useIsLoadingMessages();
  const llamaStatus = useLlamaStatus();
  const downloads = useModelDownloads();
  const {
    clear: clearSpeech,
    error: speechError,
    isListening: isSpeechListening,
    stop: stopSpeech,
    toggle: toggleSpeech,
    transcript: speechTranscript,
  } = useSpeechToText();
  const [text, setText] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const singleLineHeight = useRef(0);
  const speechBaseText = useRef('');
  const speechSessionActive = useRef(false);
  const trimmedText = text.trim();
  const selectedReady = selectedModelId ? downloads[selectedModelId]?.status === 'ready' : false;
  const canSend =
    trimmedText.length > 0 &&
    !isGenerating &&
    !isLoadingMessages &&
    selectedReady &&
    llamaStatus.status === 'ready' &&
    !!selectedModelId;

  const isModelLoading =
    !!selectedModelId && (llamaStatus.status === 'loading' || llamaStatus.status === 'unloading');
  const placeholder = !selectedModelId
    ? 'Select a model to start'
    : isModelLoading
      ? 'Loading model...'
      : isSpeechListening
        ? 'Listening...'
        : 'Ask anything';
  const showModelError = !!selectedModelId && llamaStatus.status === 'error';

  useEffect(() => {
    if (!speechSessionActive.current) return;

    const transcript = speechTranscript.trim();
    if (!transcript) return;

    const base = speechBaseText.current.trimEnd();
    setText(base ? `${base} ${transcript}` : transcript);
  }, [speechTranscript]);

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

  const handleSend = useCallback(() => {
    if (!canSend) return;
    speechSessionActive.current = false;
    if (isSpeechListening) stopSpeech();
    setText('');
    clearSpeech();
    onSend?.();
    void send(trimmedText);
  }, [canSend, clearSpeech, isSpeechListening, onSend, send, stopSpeech, trimmedText]);

  const handleMic = useCallback(() => {
    onMic?.();
    if (!isSpeechListening) {
      speechBaseText.current = text;
      speechSessionActive.current = true;
    }
    void toggleSpeech();
  }, [isSpeechListening, onMic, text, toggleSpeech]);

  return (
    <View className="px-6 pt-2 pb-2">
      {showModelError ? (
        <Alert variant="destructive" icon={TriangleAlert} className="mb-2">
          <AlertTitle>Model failed to load</AlertTitle>
          <AlertDescription>
            {llamaStatus.error ?? 'Select another model or try again.'}
          </AlertDescription>
          <Button variant="outline" size="sm" className="mt-2 ml-6 self-start" onPress={retryLoad}>
            <Text>Try again</Text>
          </Button>
        </Alert>
      ) : null}
      <View
        className={cn(
          'border-border bg-card gap-2 rounded-2xl border px-3 py-2.5',
          isSpeechListening && 'border-destructive/50'
        )}>
        {isSpeechListening || speechError ? (
          <View className="bg-secondary flex-row items-center gap-2 rounded-xl px-3 py-2">
            <View
              className={cn('h-2 w-2 rounded-full', speechError ? 'bg-destructive' : 'bg-red-500')}
            />
            <Text className="text-muted-foreground flex-1 font-mono text-xs">
              {speechError ?? 'Listening for speech...'}
            </Text>
            {speechError ? (
              <Button
                variant="ghost"
                size="icon"
                onPress={clearSpeech}
                className="size-6 rounded-lg">
                <Icon as={X} className="text-muted-foreground size-3.5" />
              </Button>
            ) : null}
          </View>
        ) : null}
        <View className={cn('flex-row gap-2', isMultiline ? 'items-end' : 'items-center')}>
          <Input
            variant="ghost"
            placeholder={placeholder}
            multiline
            value={text}
            editable={!isGenerating && !isLoadingMessages && !isSpeechListening}
            onChangeText={setText}
            className="max-h-[120px]"
            onContentSizeChange={handleContentSizeChange}
            {...props}
          />
          <Animated.View layout={LinearTransition.duration(150)} className="flex-row gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onPress={handleMic}
              disabled={isGenerating || isLoadingMessages}
              className={cn('h-8 w-8 rounded-xl', isSpeechListening && 'bg-destructive/10')}>
              <Icon
                as={isSpeechListening ? Square : Mic}
                className={isSpeechListening ? 'text-destructive' : 'text-muted-foreground'}
              />
            </Button>
            <Button
              variant="default"
              size="icon"
              onPress={isGenerating ? stopGeneration : handleSend}
              disabled={!isGenerating && !canSend}
              className="bg-foreground h-8 w-8 rounded-xl">
              <Icon as={isGenerating ? Square : ArrowUp} className="text-background" />
            </Button>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
