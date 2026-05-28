import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface ModelAvatarProps {
  letter: string;
  tint: string;
  size?: number;
}

export function ModelAvatar({ letter, tint, size = 32 }: ModelAvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        backgroundColor: `${tint}1f`,
        borderWidth: 1,
        borderColor: `${tint}33`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
      <Text
        style={{
          color: tint,
          fontSize: size * 0.42,
          fontWeight: '600',
          fontFamily: 'GeistMono_400Regular',
          lineHeight: size * 0.5,
        }}>
        {letter}
      </Text>
    </View>
  );
}
