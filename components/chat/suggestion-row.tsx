import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

interface SuggestionRowProps {
  icon: typeof ChevronRight;
  label: string;
  onPress?: () => void;
}

export function SuggestionRow({ icon, label, onPress }: SuggestionRowProps) {
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      className="bg-card border-border w-full justify-start rounded-xl border">
      <Icon as={icon} className="text-muted-foreground size-5" />
      <Text className="text-foreground text-sm font-medium">{label}</Text>
      <View className="flex-1" />
      <Icon as={ChevronRight} className="text-muted-foreground size-4" />
    </Button>
  );
}
