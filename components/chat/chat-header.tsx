import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import { View } from 'react-native';

export function ChatHeader() {
  return (
    <View className="bg-muted flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
      <View className="size-2 rounded-full bg-green-500" />
      <Text className="text-foreground text-sm font-medium">Llama 3.2 · 3B</Text>
      <Icon as={ChevronDown} className="text-muted-foreground size-4" />
    </View>
  );
}
