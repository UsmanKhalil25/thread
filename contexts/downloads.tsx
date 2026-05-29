import { db } from '@/db/client';
import { modelsTable } from '@/db/schema';
import { ANDROID_MODELS, modelDownloadUrl, type ModelDefinition } from '@/lib/models';
import type { Model } from '@/types/entities/model';
import { eq } from 'drizzle-orm';
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
  start: (model: ModelDefinition) => void;
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
  // Tracks last {bytes, time} per model for speed calculation
  const speedTrackers = useRef<Record<string, { bytes: number; time: number }>>({});

  useEffect(() => {
    async function init() {
      const rows = await db.select().from(modelsTable);
      if (rows.length === 0) return;

      const initial: Record<string, Model> = {};
      for (const row of rows) {
        initial[row.id] = {
          id: row.id,
          status: row.status,
          progress: (row.progress ?? 0) * 100,
          localPath: row.localPath ?? undefined,
          errorMessage: row.errorMessage ?? undefined,
          createdAt: row.createdAt ?? new Date(),
          updatedAt: row.updatedAt ?? new Date(),
        };
      }
      setState(initial);

      await makeDirectoryAsync(MODELS_DIR, { intermediates: true }).catch(() => {});

      for (const row of rows) {
        if (row.status === 'downloading' && row.resumeData) {
          attachResumable(row.id, row.resumeData);
        }
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateState = useCallback((modelId: string, patch: Partial<Model>) => {
    setState((prev) => ({ ...prev, [modelId]: { ...prev[modelId], ...patch } as Model }));
  }, []);

  function attachResumable(modelId: string, resumeDataJson: string) {
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

        // Speed calculation — update tracker every second
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
          await db
            .update(modelsTable)
            .set({ progress: ratio, resumeData: JSON.stringify(savable) })
            .where(eq(modelsTable.id, modelId));
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
        await db
          .update(modelsTable)
          .set({ status: 'installed', progress: 1, localPath: result.uri, resumeData: null })
          .where(eq(modelsTable.id, modelId));
      })
      .catch(async (err) => {
        const msg = err instanceof Error ? err.message : String(err);
        delete resumables.current[modelId];
        delete speedTrackers.current[modelId];
        updateState(modelId, { status: 'error', errorMessage: msg, speed: undefined });
        await db
          .update(modelsTable)
          .set({ status: 'error', errorMessage: msg })
          .where(eq(modelsTable.id, modelId));
      });
  }

  const start = useCallback(
    async (model: ModelDefinition) => {
      if (resumables.current[model.id]) return;

      await makeDirectoryAsync(MODELS_DIR, { intermediates: true }).catch(() => {});

      const fileUri = MODELS_DIR + model.filename;
      const url = modelDownloadUrl(model);
      const options = {};

      await db
        .insert(modelsTable)
        .values({ id: model.id, status: 'downloading', progress: 0 })
        .onConflictDoUpdate({
          target: modelsTable.id,
          set: { status: 'downloading', progress: 0, resumeData: null, errorMessage: null },
        });

      updateState(model.id, {
        id: model.id,
        status: 'downloading',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      attachResumable(model.id, JSON.stringify({ url, fileUri, options }));
    },
    [updateState]
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

    await db.delete(modelsTable).where(eq(modelsTable.id, modelId));

    // Delete partial file using known path derived from model filename
    const model = ANDROID_MODELS.find((m) => m.id === modelId);
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
