import { db } from '@/db/client';
import { modelsTable } from '@/db/schema';
import type { Model } from '@/types/entities/model';
import { eq } from 'drizzle-orm';

type ModelRow = typeof modelsTable.$inferSelect;

function toModel(row: ModelRow): Model {
  return {
    id: row.id,
    status: row.status,
    progress: (row.progress ?? 0) * 100,
    localPath: row.localPath ?? undefined,
    resumeData: row.resumeData ?? undefined,
    errorMessage: row.errorMessage ?? undefined,
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
  };
}

export async function listPersistedModels(): Promise<Model[]> {
  const rows = await db.select().from(modelsTable);
  return rows.map(toModel);
}

export async function listInstalledModelIds(): Promise<string[]> {
  const rows = await db
    .select({ id: modelsTable.id })
    .from(modelsTable)
    .where(eq(modelsTable.status, 'installed'));

  return rows.map((row) => row.id);
}

export async function updateModelDownloadProgress(
  id: string,
  progress: number,
  resumeData: string
): Promise<void> {
  await db.update(modelsTable).set({ progress, resumeData }).where(eq(modelsTable.id, id));
}

export async function markModelInstalled(id: string, localPath: string): Promise<void> {
  await db
    .update(modelsTable)
    .set({ status: 'installed', progress: 1, localPath, resumeData: null })
    .where(eq(modelsTable.id, id));
}

export async function markModelError(id: string, errorMessage: string): Promise<void> {
  await db.update(modelsTable).set({ status: 'error', errorMessage }).where(eq(modelsTable.id, id));
}

export async function upsertDownloadingModel(id: string): Promise<void> {
  await db
    .insert(modelsTable)
    .values({ id, status: 'downloading', progress: 0 })
    .onConflictDoUpdate({
      target: modelsTable.id,
      set: { status: 'downloading', progress: 0, resumeData: null, errorMessage: null },
    });
}

export async function deletePersistedModel(id: string): Promise<void> {
  await db.delete(modelsTable).where(eq(modelsTable.id, id));
}
