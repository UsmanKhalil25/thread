import { db } from '@/db/client';
import { Geist_400Regular, useFonts } from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import migrations from '@/drizzle/migrations';

export function useSplashScreen() {
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    GeistMono_400Regular,
  });
  const { success: migrationsRan, error: migrationError } = useMigrations(db, migrations);

  const fontsDone = fontsLoaded || fontError;
  const migrationsDone = migrationsRan || migrationError;
  const isReady = fontsDone && migrationsDone;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return { isReady };
}
