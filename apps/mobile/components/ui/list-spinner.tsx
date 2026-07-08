import { THEME } from '@/lib/theme';
import { ActivityIndicator, View } from 'react-native';
import { useUniwind } from 'uniwind';

export function ListSpinner() {
  const { theme } = useUniwind();

  return (
    <View className="items-center justify-center py-4">
      <ActivityIndicator color={THEME[theme ?? 'light'].mutedForeground} />
    </View>
  );
}
