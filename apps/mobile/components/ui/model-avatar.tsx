import { Text } from '@/components/ui/text';
import { View } from 'react-native';

const FAMILY_CONFIG: Record<string, { color: string }> = {
  llama: { color: '#60a5fa' },
  qwen: { color: '#a78bfa' },
  gemma: { color: '#22c55e' },
  phi: { color: '#f97316' },
  smollm: { color: '#f472b6' },
};

interface ModelAvatarProps {
  family: string;
  size?: number;
}

export function ModelAvatar({ family, size = 32 }: ModelAvatarProps) {
  const config = FAMILY_CONFIG[family.toLowerCase()] ?? { color: '#a1a1aa' };

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        backgroundColor: `${config.color}1f`,
        borderWidth: 1,
        borderColor: `${config.color}33`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
      <Text
        style={{
          color: config.color,
          fontSize: size * 0.42,
          fontWeight: '600',
          fontFamily: 'GeistMono_400Regular',
          lineHeight: size * 0.5,
        }}>
        {family.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
