import { db } from '@/db/client';
import { modelDownloadsTable } from '@/db/schema';
import type { ModelDownload, ModelDownloadStatus } from '@/types/entities/model-download';
import { and, eq } from 'drizzle-orm';

type ModelDownloadRow = typeof modelDownloadsTable.$inferSelect;

function toModelDownload(row: ModelDownloadRow): ModelDownload {
  return {
    id: row.id,
    modelId: row.modelId,
    status: row.status,
    filePath: row.filePath ?? undefined,
    downloadedBytes: row.downloadedBytes,
    taskId: row.taskId ?? undefined,
  };
}

export async function listModelDownloads(): Promise<ModelDownload[]> {
  const rows = await db.select().from(modelDownloadsTable);
  return rows.map(toModelDownload);
}

export async function listReadyModelIds(): Promise<string[]> {
  const rows = await db
    .select({ modelId: modelDownloadsTable.modelId })
    .from(modelDownloadsTable)
    .where(eq(modelDownloadsTable.status, 'ready'));

  return rows.map((row) => row.modelId);
}

export async function getReadyModelPath(modelId: string): Promise<string | null> {
  const rows = await db
    .select({ filePath: modelDownloadsTable.filePath })
    .from(modelDownloadsTable)
    .where(and(eq(modelDownloadsTable.modelId, modelId), eq(modelDownloadsTable.status, 'ready')))
    .limit(1);

  return rows[0]?.filePath ?? null;
}

export async function upsertModelDownloadStatus(
  modelId: string,
  status: ModelDownloadStatus,
  downloadedBytes = 0,
  taskId?: string
): Promise<void> {
  await db
    .insert(modelDownloadsTable)
    .values({ id: modelId, modelId, status, downloadedBytes, filePath: null, taskId })
    .onConflictDoUpdate({
      target: modelDownloadsTable.modelId,
      set: { status, downloadedBytes, filePath: null, taskId },
    });
}

export async function updateModelDownloadedBytes(
  modelId: string,
  downloadedBytes: number
): Promise<void> {
  await db
    .update(modelDownloadsTable)
    .set({ downloadedBytes })
    .where(eq(modelDownloadsTable.modelId, modelId));
}

export async function markModelDownloadReady(
  modelId: string,
  filePath: string,
  downloadedBytes: number
): Promise<void> {
  await db
    .update(modelDownloadsTable)
    .set({ status: 'ready', filePath, downloadedBytes, taskId: null })
    .where(eq(modelDownloadsTable.modelId, modelId));
}

export async function markModelDownloadFailed(modelId: string): Promise<void> {
  await db
    .update(modelDownloadsTable)
    .set({ status: 'failed', filePath: null, taskId: null })
    .where(eq(modelDownloadsTable.modelId, modelId));
}

export async function deleteModelDownload(modelId: string): Promise<void> {
  await db.delete(modelDownloadsTable).where(eq(modelDownloadsTable.modelId, modelId));
}
