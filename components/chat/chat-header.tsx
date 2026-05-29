import { useChat } from '@/contexts/chat';
import { ANDROID_MODELS } from '@/lib/models';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Pressable } from 'react-native';

interface ChatHeaderProps {
  onPress?: () => void;
}

export function ChatHeader({ onPress }: ChatHeaderProps) {
  const { selectedModelId } = useChat();
  const model = ANDROID_MODELS.find((m) => m.id === selectedModelId);

  return (
    <Pressable onPress={onPress}>
      <Badge variant="secondary" size="lg">
        <Text className="font-mono">{model?.name ?? 'Select model'}</Text>
      </Badge>
    </Pressable>
  );
}
