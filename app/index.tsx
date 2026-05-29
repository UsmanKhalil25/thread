import { hasCompletedOnboarding } from '@/lib/db';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    hasCompletedOnboarding().then((completed) => {
      if (cancelled) return;
      router.replace(completed ? '/(chat)' : '/(onboarding)');
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
