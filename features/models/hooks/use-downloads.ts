import {
  deleteModelDownload,
  listModelDownloads,
  markModelDownloadFailed,
  markModelDownloadReady,
  updateModelDownloadedBytes,
  upsertModelDownloadStatus,
} from '@/db/repositories/model-downloads.repository';
import { MODEL_CATALOG, modelDownloadUrl, type CatalogModel } from '@/lib/models';
import type { ModelDownloadStatus } from '@/types/entities/model-download';
import {
  completeHandler,
  createDownloadTask,
  directories,
  getExistingDownloadTasks,
  setConfig,
  type DownloadTask,
} from '@kesha-antonov/react-native-background-downloader';
import { deleteAsync, getInfoAsync, makeDirectoryAsync, moveAsync } from 'expo-file-system/legacy';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

const MAX_CONCURRENT = 1;
const IDLE_DOWNLOAD = { status: 'idle' as const, downloadedBytes: 0 };
const catalogById = new Map(MODEL_CATALOG.map((model) => [model.id, model]));

setConfig({
  progressInterval: 1000,
  showNotificationsEnabled: true,
  notificationsGrouping: {
    enabled: true,
    texts: {
      downloadTitle: 'Model download',
      groupTitle: 'Model downloads',
      groupText: '{count} model downloads in progress',
    },
  },
});

export type DownloadStatus = ModelDownloadStatus | 'idle';

export interface DownloadState {
  status: DownloadStatus;
  downloadedBytes: number;
  filePath?: string;
}

const store = {
  downloads: {} as Record<string, DownloadState>,
  queue: [] as string[],
  initialized: false,
  initializing: null as Promise<void> | null,
};

const listeners = new Set<() => void>();
const activeDownloads = new Map<string, DownloadTask>();
const cancelledTaskIds = new Set<string>();

function fileUri(path: string): string {
  const uri = path.startsWith('file://') ? path : `file://${path}`;
  return uri.endsWith('/') ? uri : `${uri}/`;
}

function filePath(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

function documentDirectory(): string {
  return fileUri(directories.documents);
}

function modelsDir(): string {
  return `${documentDirectory()}models/`;
}

function tempDir(): string {
  return `${modelsDir()}tmp/`;
}

function finalPath(model: CatalogModel): string {
  return `${modelsDir()}${model.filename}`;
}

function tempPath(model: CatalogModel): string {
  return `${tempDir()}${model.filename}.part`;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void initializeModelDownloads();
  return () => listeners.delete(listener);
}

function emit() {
  for (const listener of listeners) listener();
}

function setDownload(modelId: string, patch: DownloadState) {
  store.downloads = { ...store.downloads, [modelId]: patch };
  emit();
}

function removeDownload(modelId: string) {
  const next = { ...store.downloads };
  delete next[modelId];
  store.downloads = next;
  emit();
}

function getDownloadsSnapshot() {
  return store.downloads;
}

function getDownloadSnapshot(modelId: string) {
  return store.downloads[modelId] ?? IDLE_DOWNLOAD;
}

async function ensureModelDirectories() {
  await makeDirectoryAsync(modelsDir(), { intermediates: true }).catch(() => {});
  await makeDirectoryAsync(tempDir(), { intermediates: true }).catch(() => {});
}

async function finishBackgroundTask(taskId: string) {
  await Promise.resolve(completeHandler(taskId)).catch(() => {});
}

async function failDownload(model: CatalogModel, downloadedBytes = 0) {
  await deleteAsync(tempPath(model), { idempotent: true }).catch(() => {});
  await markModelDownloadFailed(model.id);
  setDownload(model.id, { status: 'failed', downloadedBytes });
}

async function completeDownload(model: CatalogModel, location: string) {
  const source = filePath(location);
  const info = await getInfoAsync(source);
  if (!info.exists || info.size !== model.sizeBytes) {
    throw new Error('Downloaded file size did not match catalog size');
  }

  await deleteAsync(finalPath(model), { idempotent: true }).catch(() => {});
  await moveAsync({ from: source, to: finalPath(model) });
  await markModelDownloadReady(model.id, finalPath(model), info.size);
  setDownload(model.id, {
    status: 'ready',
    downloadedBytes: info.size,
    filePath: finalPath(model),
  });
}

function attachHandlers(task: DownloadTask, model: CatalogModel) {
  activeDownloads.set(model.id, task);

  let lastPersistedBytes = store.downloads[model.id]?.downloadedBytes ?? task.bytesDownloaded ?? 0;
  const checkpointBytes = Math.max(Math.floor(model.sizeBytes / 20), 1);

  task
    .begin(() => {
      setDownload(model.id, {
        status: 'downloading',
        downloadedBytes: task.bytesDownloaded ?? lastPersistedBytes,
      });
      void upsertModelDownloadStatus(model.id, 'downloading', lastPersistedBytes, task.id);
    })
    .progress(({ bytesDownloaded }) => {
      setDownload(model.id, { status: 'downloading', downloadedBytes: bytesDownloaded });

      if (bytesDownloaded - lastPersistedBytes >= checkpointBytes) {
        lastPersistedBytes = bytesDownloaded;
        void updateModelDownloadedBytes(model.id, bytesDownloaded);
      }
    })
    .done(({ location, bytesDownloaded }) => {
      void (async () => {
        try {
          await completeDownload(model, location);
        } catch {
          await failDownload(model, bytesDownloaded);
        } finally {
          activeDownloads.delete(model.id);
          cancelledTaskIds.delete(model.id);
          await finishBackgroundTask(task.id);
          runNextDownload();
        }
      })();
    })
    .error(() => {
      void (async () => {
        activeDownloads.delete(model.id);

        if (cancelledTaskIds.has(model.id)) {
          await deleteAsync(tempPath(model), { idempotent: true }).catch(() => {});
          await deleteModelDownload(model.id);
          removeDownload(model.id);
        } else {
          await failDownload(model, lastPersistedBytes);
        }

        await finishBackgroundTask(task.id);
        runNextDownload();
      })();
    });
}

async function getLiveDownloadTasks(): Promise<DownloadTask[]> {
  return getExistingDownloadTasks().catch(() => []);
}

async function initializeModelDownloads(): Promise<void> {
  if (store.initialized) return;
  if (store.initializing) return store.initializing;

  store.initializing = (async () => {
    await ensureModelDirectories();

    const liveTasks = await getLiveDownloadTasks();
    const liveTaskIds = new Set<string>();

    for (const task of liveTasks) {
      const model = catalogById.get(task.id);
      if (!model) continue;

      liveTaskIds.add(task.id);
      attachHandlers(task, model);

      if (task.state === 'PAUSED') {
        await task.resume().catch(() => {});
      }
    }

    const rows = await listModelDownloads();
    const next: Record<string, DownloadState> = {};

    for (const row of rows) {
      const model = catalogById.get(row.modelId);

      if (!model) {
        await deleteModelDownload(row.modelId);
        continue;
      }

      if (row.status === 'ready') {
        if (!row.filePath) {
          await deleteModelDownload(row.modelId);
          continue;
        }

        const info = await getInfoAsync(row.filePath);
        if (!info.exists) {
          await deleteModelDownload(row.modelId);
          continue;
        }
      }

      if (row.status === 'downloading') {
        if (!row.taskId || !liveTaskIds.has(row.taskId)) {
          await failDownload(model, row.downloadedBytes);
          next[row.modelId] = { status: 'failed', downloadedBytes: row.downloadedBytes };
          continue;
        }
      }

      if (row.status === 'queued') {
        await failDownload(model, row.downloadedBytes);
        next[row.modelId] = { status: 'failed', downloadedBytes: row.downloadedBytes };
        continue;
      }

      next[row.modelId] = {
        status: row.status,
        downloadedBytes: row.downloadedBytes,
        filePath: row.filePath,
      };
    }

    for (const task of liveTasks) {
      if (next[task.id]) continue;

      const model = catalogById.get(task.id);
      if (!model) continue;

      next[task.id] = {
        status: 'downloading',
        downloadedBytes: task.bytesDownloaded ?? 0,
      };
      await upsertModelDownloadStatus(task.id, 'downloading', task.bytesDownloaded ?? 0, task.id);
    }

    store.downloads = next;
    store.initialized = true;
    store.initializing = null;
    emit();
  })();

  return store.initializing;
}

function runNextDownload() {
  if (activeDownloads.size >= MAX_CONCURRENT) return;

  const modelId = store.queue[0];
  if (!modelId) return;

  store.queue = store.queue.slice(1);
  const model = catalogById.get(modelId);
  if (model) void runDownload(model);
}

async function runDownload(model: CatalogModel) {
  cancelledTaskIds.delete(model.id);
  await ensureModelDirectories();
  await deleteAsync(tempPath(model), { idempotent: true }).catch(() => {});

  const task = createDownloadTask({
    id: model.id,
    url: modelDownloadUrl(model),
    destination: tempPath(model),
    maxRedirects: 10,
    metadata: {
      groupId: 'model-downloads',
      groupName: 'Model downloads',
    },
  });

  attachHandlers(task, model);
  await upsertModelDownloadStatus(model.id, 'downloading', 0, task.id);
  setDownload(model.id, { status: 'downloading', downloadedBytes: 0 });
  task.start();
}

export async function startModelDownload(modelId: string): Promise<void> {
  await initializeModelDownloads();

  const model = catalogById.get(modelId);
  const current = store.downloads[modelId];
  if (!model || current?.status === 'queued' || current?.status === 'downloading') return;
  if (current?.status === 'ready') return;

  if (activeDownloads.size < MAX_CONCURRENT) {
    void runDownload(model);
    return;
  }

  store.queue = [...store.queue.filter((id) => id !== modelId), modelId];
  await upsertModelDownloadStatus(modelId, 'queued', 0);
  setDownload(modelId, { status: 'queued', downloadedBytes: 0 });
}

export async function cancelModelDownload(modelId: string): Promise<void> {
  await initializeModelDownloads();

  const task = activeDownloads.get(modelId);
  const model = catalogById.get(modelId);
  if (task) {
    cancelledTaskIds.add(modelId);
    await task.stop().catch(() => {});
    activeDownloads.delete(modelId);
    if (model) await deleteAsync(tempPath(model), { idempotent: true }).catch(() => {});
    await deleteModelDownload(modelId);
    removeDownload(modelId);
    runNextDownload();
    return;
  }

  store.queue = store.queue.filter((id) => id !== modelId);
  await deleteModelDownload(modelId);
  removeDownload(modelId);
}

export async function deleteReadyModel(modelId: string): Promise<void> {
  await initializeModelDownloads();

  const model = catalogById.get(modelId);
  const current = store.downloads[modelId];
  if (!model || current?.status !== 'ready') return;

  await deleteAsync(current.filePath ?? finalPath(model), { idempotent: true }).catch(() => {});
  await deleteModelDownload(modelId);
  removeDownload(modelId);
}

export function useModelDownloadReconciliation(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    void initializeModelDownloads();
  }, [enabled]);
}

export function useModelDownloads() {
  return useSyncExternalStore(subscribe, getDownloadsSnapshot, getDownloadsSnapshot);
}

export function useDownload(modelId: string) {
  const download = useSyncExternalStore(
    subscribe,
    () => getDownloadSnapshot(modelId),
    () => getDownloadSnapshot(modelId)
  );

  const start = useCallback(() => {
    void startModelDownload(modelId);
  }, [modelId]);

  const cancel = useCallback(() => {
    void cancelModelDownload(modelId);
  }, [modelId]);

  const remove = useCallback(() => {
    void deleteReadyModel(modelId);
  }, [modelId]);

  return useMemo(() => ({ ...download, start, cancel, remove }), [cancel, download, remove, start]);
}
