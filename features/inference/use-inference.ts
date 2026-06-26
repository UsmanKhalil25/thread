import { llamaService, type CompletionParams } from '@/features/inference/llama-service';
import { useMemo, useSyncExternalStore } from 'react';

export function useLlamaStatus() {
  return useSyncExternalStore(
    llamaService.subscribe,
    llamaService.getStatus,
    llamaService.getStatus
  );
}

export function useInference() {
  const status = useLlamaStatus();

  return useMemo(
    () => ({
      ...status,
      generate: llamaService.generate.bind(llamaService) as (
        params: CompletionParams,
        onToken: (token: string) => void
      ) => Promise<string>,
      stop: llamaService.stop.bind(llamaService),
      release: llamaService.release.bind(llamaService),
    }),
    [status]
  );
}

export type { CompletionParams };
