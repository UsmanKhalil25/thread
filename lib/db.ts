import { db } from '@/db/client';
import { PREFERENCE_IDS } from '@/db/keys';
import { preferencesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const row = await db.query.preferencesTable.findFirst({
      where: eq(preferencesTable.id, PREFERENCE_IDS.ONBOARDING_COMPLETE),
    });
    return row?.value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await db
    .insert(preferencesTable)
    .values({ id: PREFERENCE_IDS.ONBOARDING_COMPLETE, value: 'true' })
    .onConflictDoUpdate({ target: preferencesTable.id, set: { value: 'true' } });
}
