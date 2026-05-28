import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface SettingsRowProps {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  value?: string;
  control?: React.ReactNode;
  danger?: boolean;
  isFirst?: boolean;
  onPress?: () => void;
}

export function SettingsRow({
  icon,
  title,
  hint,
  value,
  control,
  danger,
  isFirst,
  onPress,
}: SettingsRowProps) {
  return (
    <View>
      {!isFirst && <Separator />}
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 px-1 py-3.5 active:opacity-70">
        {icon ? <Icon as={icon} className="text-muted-foreground shrink-0" size={14} /> : null}
        <View className="flex-1 gap-0.5">
          <Text
            className={`text-sm font-normal tracking-[-0.005em] ${danger ? 'text-destructive' : 'text-foreground'}`}>
            {title}
          </Text>
          {hint ? (
            <Text className="text-muted-foreground font-mono text-[11.5px]">{hint}</Text>
          ) : null}
        </View>
        {control ??
          (value ? (
            <Text className="text-muted-foreground font-mono text-[12.5px]">{value}</Text>
          ) : (
            <Icon as={ChevronRight} className="text-muted-foreground/50" size={13} />
          ))}
      </Pressable>
    </View>
  );
}
