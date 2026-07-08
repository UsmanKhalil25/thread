import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react-native';
import { View, type TextInputProps } from 'react-native';

interface SearchInputProps extends TextInputProps {
  onSearch?: (text: string) => void;
}

export function SearchInput({ onSearch, ...props }: SearchInputProps) {
  return (
    <View className="border-border m-3 flex-row items-center gap-1 rounded-lg border px-3">
      <Icon as={Search} className="text-muted-foreground size-4" />
      <Input variant="ghost" placeholder="Search" {...props} />
    </View>
  );
}
