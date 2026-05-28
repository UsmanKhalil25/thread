import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface SettingsGroupProps {
  label: string;
  children: React.ReactNode;
}

export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <View className="gap-0">
      <Text className="text-muted-foreground px-1 pb-2 font-mono text-[11px] font-medium tracking-widest uppercase">
        {label}
      </Text>
      <View>{children}</View>
    </View>
  );
}
