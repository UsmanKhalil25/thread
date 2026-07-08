import { MODEL_CATALOG } from '@/lib/models';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/features/chat/contexts/chat-context';
import { useIsGenerating } from '@/features/chat/hooks/use-chat-session';
import { Pressable } from 'react-native';

interface ChatHeaderProps {
  onPress?: () => void;
}

export function ChatHeader({ onPress }: ChatHeaderProps) {
  const { selectedModelId } = useChat();
  const isGenerating = useIsGenerating();
  const model = MODEL_CATALOG.find((m) => m.id === selectedModelId);

  return (
    <Pressable
      onPress={onPress}
      disabled={isGenerating}
      className={isGenerating ? 'opacity-50' : undefined}>
      <Badge variant="secondary" size="lg">
        <Text className="font-mono">{model?.name ?? 'Select model'}</Text>
      </Badge>
    </Pressable>
  );
}
