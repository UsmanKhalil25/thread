import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Caption, RowTitle } from '@/components/ui/typography';
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
        className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70">
        {icon ? (
          <View className="bg-secondary h-8 w-8 items-center justify-center rounded-xl">
            <Icon as={icon} className="text-muted-foreground size-4 shrink-0" />
          </View>
        ) : null}
        <View className="flex-1 gap-0.5">
          <RowTitle className={danger ? 'text-destructive' : undefined}>{title}</RowTitle>
          {hint ? <Caption>{hint}</Caption> : null}
        </View>
        {control ??
          (value ? (
            <Caption>{value}</Caption>
          ) : onPress ? (
            <Icon as={ChevronRight} className="text-muted-foreground/50 size-4" />
          ) : null)}
      </Pressable>
    </View>
  );
}
