import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsLayout() {
  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={S.flex}>
      <Stack screenOptions={SCREEN_OPTIONS} />
    </SafeAreaView>
  );
}

const SAFE_AREA_EDGES = ['top', 'bottom'] as const;

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right' as const,
};

const S = StyleSheet.create({ flex: { flex: 1 } });
