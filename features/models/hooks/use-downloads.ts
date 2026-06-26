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
import {
  deleteAsync,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  moveAsync,
  readAsStringAsync,
} from 'expo-file-system/legacy';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

const MAX_CONCURRENT = 1;
const GGUF_MAGIC_BASE64 = 'R0dVRg==';
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
  totalBytes?: number;
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

async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) return;

  try {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } catch {}
}

async function failDownload(model: CatalogModel, downloadedBytes = 0) {
  await deleteAsync(tempPath(model), { idempotent: true }).catch(() => {});
  await markModelDownloadFailed(model.id);
  setDownload(model.id, { status: 'failed', downloadedBytes });
}

async function isValidGgufFile(source: string): Promise<boolean> {
  try {
    const header = await readAsStringAsync(source, {
      encoding: EncodingType.Base64,
      position: 0,
      length: 4,
    });
    return header === GGUF_MAGIC_BASE64;
  } catch {
    return false;
  }
}

async function completeDownload(model: CatalogModel, location: string, bytesDownloaded: number) {
  const source = filePath(location);
  const info = await getInfoAsync(source);
  if (!info.exists || info.size === 0 || (bytesDownloaded > 0 && info.size !== bytesDownloaded)) {
    throw new Error('Downloaded file is missing or incomplete');
  }

  if (!(await isValidGgufFile(source))) {
    throw new Error('Downloaded file is not a valid GGUF model');
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
        totalBytes: task.bytesTotal || undefined,
      });
      void upsertModelDownloadStatus(model.id, 'downloading', lastPersistedBytes, task.id);
    })
    .progress(({ bytesDownloaded, bytesTotal }) => {
      setDownload(model.id, {
        status: 'downloading',
        downloadedBytes: bytesDownloaded,
        totalBytes: bytesTotal || undefined,
      });

      if (bytesDownloaded - lastPersistedBytes >= checkpointBytes) {
        lastPersistedBytes = bytesDownloaded;
        void updateModelDownloadedBytes(model.id, bytesDownloaded);
      }
    })
    .done(({ location, bytesDownloaded }) => {
      void (async () => {
        try {
          await completeDownload(model, location, bytesDownloaded);
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
          const part = await getInfoAsync(tempPath(model));
          if (part.exists && part.size > 0) {
            if (activeDownloads.size < MAX_CONCURRENT) {
              await resumeDownload(model, part.size);
              next[row.modelId] = { status: 'downloading', downloadedBytes: part.size };
            } else {
              store.queue = [...store.queue.filter((id) => id !== row.modelId), row.modelId];
              await upsertModelDownloadStatus(row.modelId, 'queued', part.size);
              next[row.modelId] = { status: 'queued', downloadedBytes: part.size };
            }
          } else {
            await failDownload(model, row.downloadedBytes);
            next[row.modelId] = { status: 'failed', downloadedBytes: row.downloadedBytes };
          }
          continue;
        }
      }

      if (row.status === 'queued') {
        const part = await getInfoAsync(tempPath(model));
        if (part.exists && part.size > 0) {
          store.queue = [...store.queue.filter((id) => id !== row.modelId), row.modelId];
          await upsertModelDownloadStatus(row.modelId, 'queued', part.size);
          next[row.modelId] = { status: 'queued', downloadedBytes: part.size };
        } else {
          await failDownload(model, row.downloadedBytes);
          next[row.modelId] = { status: 'failed', downloadedBytes: row.downloadedBytes };
        }
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
        totalBytes: task.bytesTotal || undefined,
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
  if (model) void runQueuedDownload(model);
}

async function runQueuedDownload(model: CatalogModel) {
  const queuedBytes = store.downloads[model.id]?.downloadedBytes ?? 0;
  const part = queuedBytes > 0 ? await getInfoAsync(tempPath(model)) : null;

  if (part?.exists && part.size > 0) {
    await resumeDownload(model, part.size);
    return;
  }

  await runDownload(model);
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

async function resumeDownload(model: CatalogModel, fromBytes: number) {
  cancelledTaskIds.delete(model.id);
  await ensureNotificationPermission();
  await ensureModelDirectories();

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
  await upsertModelDownloadStatus(model.id, 'downloading', fromBytes, task.id);
  setDownload(model.id, { status: 'downloading', downloadedBytes: fromBytes });
  task.start();
}

export async function startModelDownload(modelId: string): Promise<void> {
  await initializeModelDownloads();

  const model = catalogById.get(modelId);
  const current = store.downloads[modelId];
  if (!model || current?.status === 'queued' || current?.status === 'downloading') return;
  if (current?.status === 'ready') return;

  await ensureNotificationPermission();

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

  // Smoothed download speed (bytes/sec), derived from the running byte count.
  // Sampled once per second so it reads steadily instead of jumping per event.
  const active = download.status === 'downloading';
  const bytesRef = useRef(download.downloadedBytes);
  bytesRef.current = download.downloadedBytes;
  const lastRef = useRef({ bytes: download.downloadedBytes, time: Date.now() });
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (!active) {
      setSpeed(0);
      lastRef.current = { bytes: bytesRef.current, time: Date.now() };
      return;
    }

    lastRef.current = { bytes: bytesRef.current, time: Date.now() };
    const id = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastRef.current.time) / 1000;
      const delta = bytesRef.current - lastRef.current.bytes;
      if (elapsed > 0) {
        const instant = Math.max(delta / elapsed, 0);
        setSpeed((prev) => (prev === 0 ? instant : prev * 0.6 + instant * 0.4));
      }
      lastRef.current = { bytes: bytesRef.current, time: now };
    }, 1000);

    return () => clearInterval(id);
  }, [active]);

  const start = useCallback(() => {
    void startModelDownload(modelId);
  }, [modelId]);

  const cancel = useCallback(() => {
    void cancelModelDownload(modelId);
  }, [modelId]);

  const remove = useCallback(() => {
    void deleteReadyModel(modelId);
  }, [modelId]);

  return useMemo(
    () => ({ ...download, speed, start, cancel, remove }),
    [cancel, download, remove, speed, start]
  );
}
