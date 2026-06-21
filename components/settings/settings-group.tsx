import { Caption } from '@/components/ui/typography';
import { View } from 'react-native';

interface SettingsGroupProps {
  label: string;
  children: React.ReactNode;
}

export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <View className="gap-2">
      <Caption className="px-1 uppercase">{label}</Caption>
      <View className="bg-card border-border overflow-hidden rounded-2xl border">{children}</View>
    </View>
  );
}
