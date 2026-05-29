import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Pressable } from 'react-native';

interface ChatHeaderProps {
  onPress?: () => void;
}

export function ChatHeader({ onPress }: ChatHeaderProps) {
  return (
    <Pressable onPress={onPress}>
      <Badge variant="secondary" size="lg">
        <Text className="font-mono">Llama 3.2</Text>
      </Badge>
    </Pressable>
  );
}
