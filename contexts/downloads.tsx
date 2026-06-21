import {
  deletePersistedModel,
  listPersistedModels,
  markModelError,
  markModelInstalled,
  updateModelDownloadProgress,
  upsertDownloadingModel,
} from '@/db/repositories/models.repository';
import { MODEL_CATALOG, modelDownloadUrl, type CatalogModel } from '@/lib/models';
import type { Model } from '@/types/entities/model';
import {
  createDownloadResumable,
  deleteAsync,
  documentDirectory,
  makeDirectoryAsync,
  type DownloadResumable,
} from 'expo-file-system/legacy';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

interface DownloadsContextValue {
  state: Record<string, Model>;
  start: (model: CatalogModel) => void;
  cancel: (modelId: string) => void;
}

const DownloadsContext = createContext<DownloadsContextValue>({
  state: {},
  start: () => {},
  cancel: () => {},
});

const MODELS_DIR = (documentDirectory ?? '') + 'models/';

export function DownloadProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<Record<string, Model>>({});
  const resumables = useRef<Record<string, DownloadResumable>>({});
  const speedTrackers = useRef<Record<string, { bytes: number; time: number }>>({});

  const updateState = useCallback((modelId: string, patch: Partial<Model>) => {
    setState((prev) => ({ ...prev, [modelId]: { ...prev[modelId], ...patch } as Model }));
  }, []);

  const attachResumable = useCallback(
    (modelId: string, resumeDataJson: string) => {
      const saved = JSON.parse(resumeDataJson) as {
        url: string;
        fileUri: string;
        options: object;
        resumeData?: string;
      };
      let lastPersistedPct = -1;

      const resumable = createDownloadResumable(
        saved.url,
        saved.fileUri,
        saved.options,
        async ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite <= 0) return;
          const ratio = totalBytesWritten / totalBytesExpectedToWrite;
          const pct = Math.round(ratio * 100);

          const now = Date.now();
          const tracker = speedTrackers.current[modelId];
          let speed: number | undefined;
          if (tracker && now - tracker.time >= 1000) {
            speed = (totalBytesWritten - tracker.bytes) / ((now - tracker.time) / 1000);
            speedTrackers.current[modelId] = { bytes: totalBytesWritten, time: now };
          } else if (!tracker) {
            speedTrackers.current[modelId] = { bytes: totalBytesWritten, time: now };
          }

          updateState(modelId, {
            progress: pct,
            bytesWritten: totalBytesWritten,
            totalBytes: totalBytesExpectedToWrite,
            ...(speed !== undefined && { speed }),
          });

          if (pct - lastPersistedPct >= 5) {
            lastPersistedPct = pct;
            const savable = resumable.savable();
            await updateModelDownloadProgress(modelId, ratio, JSON.stringify(savable));
          }
        },
        saved.resumeData
      );

      resumables.current[modelId] = resumable;

      resumable
        .downloadAsync()
        .then(async (result) => {
          if (!result) return;
          delete resumables.current[modelId];
          delete speedTrackers.current[modelId];
          updateState(modelId, {
            status: 'installed',
            progress: 100,
            localPath: result.uri,
            speed: undefined,
          });
          await markModelInstalled(modelId, result.uri);
        })
        .catch(async (err) => {
          const msg = err instanceof Error ? err.message : String(err);
          delete resumables.current[modelId];
          delete speedTrackers.current[modelId];
          updateState(modelId, { status: 'error', errorMessage: msg, speed: undefined });
          await markModelError(modelId, msg);
        });
    },
    [updateState]
  );

  useEffect(() => {
    async function init() {
      const models = await listPersistedModels();
      if (models.length === 0) return;

      const initial: Record<string, Model> = {};
      for (const model of models) {
        initial[model.id] = model;
      }
      setState(initial);

      await makeDirectoryAsync(MODELS_DIR, { intermediates: true }).catch(() => {});

      for (const model of models) {
        if (model.status === 'downloading' && model.resumeData) {
          attachResumable(model.id, model.resumeData);
        }
      }
    }
    init();
  }, [attachResumable]);

  const start = useCallback(
    async (model: CatalogModel) => {
      if (resumables.current[model.id]) return;

      await makeDirectoryAsync(MODELS_DIR, { intermediates: true }).catch(() => {});

      const fileUri = MODELS_DIR + model.filename;
      const url = modelDownloadUrl(model);
      const options = {};

      await upsertDownloadingModel(model.id);

      updateState(model.id, {
        id: model.id,
        status: 'downloading',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      attachResumable(model.id, JSON.stringify({ url, fileUri, options }));
    },
    [attachResumable, updateState]
  );

  const cancel = useCallback(async (modelId: string) => {
    const resumable = resumables.current[modelId];
    if (resumable) {
      await resumable.cancelAsync().catch(() => {});
      delete resumables.current[modelId];
    }
    delete speedTrackers.current[modelId];

    setState((prev) => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });

    await deletePersistedModel(modelId);

    const model = MODEL_CATALOG.find((m) => m.id === modelId);
    if (model) {
      await deleteAsync(MODELS_DIR + model.filename, { idempotent: true }).catch(() => {});
    }
  }, []);

  return (
    <DownloadsContext.Provider value={{ state, start, cancel }}>
      {children}
    </DownloadsContext.Provider>
  );
}

export function useDownloads() {
  return useContext(DownloadsContext);
}
