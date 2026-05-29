import { db } from '@/db/client';
import { PREFERENCE_KEYS } from '@/db/keys';
import { preferencesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const row = await db.query.preferencesTable.findFirst({
      where: eq(preferencesTable.key, PREFERENCE_KEYS.ONBOARDING_COMPLETE),
    });
    return row?.value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await db
    .insert(preferencesTable)
    .values({ key: PREFERENCE_KEYS.ONBOARDING_COMPLETE, value: 'true' })
    .onConflictDoUpdate({ target: preferencesTable.key, set: { value: 'true' } });
}
