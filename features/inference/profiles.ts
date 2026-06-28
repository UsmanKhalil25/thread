import type { CatalogModel } from '@/lib/models';
import type { ContextParams } from 'llama.rn';

export type RuntimeProfile = Pick<
  ContextParams,
  | 'n_ctx'
  | 'n_threads'
  | 'n_batch'
  | 'n_ubatch'
  | 'n_gpu_layers'
  | 'flash_attn_type'
  | 'cache_type_k'
  | 'cache_type_v'
  | 'use_mmap'
  | 'use_mlock'
>;

function paramsToB(params: string): number {
  const value = Number.parseFloat(params);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

export function profileForModel(model: CatalogModel): RuntimeProfile {
  const b = paramsToB(model.params);
  const base = {
    n_threads: 4,
    n_batch: 512,
    n_ubatch: 512,
    n_gpu_layers: 99,
    flash_attn_type: 'on',
    use_mmap: true,
    use_mlock: false,
  } as const;

  if (b <= 1.3) {
    return {
      ...base,
      n_ctx: 4096,
      cache_type_k: 'q8_0',
      cache_type_v: 'q8_0',
    };
  }

  if (b <= 2.2) {
    return { ...base, n_ctx: 2048, cache_type_k: 'q8_0', cache_type_v: 'q8_0' };
  }

  return { ...base, n_ctx: 2048, cache_type_k: 'q4_0', cache_type_v: 'q4_0' };
}

export function degradedProfileForModel(model: CatalogModel): RuntimeProfile {
  const profile = profileForModel(model);
  return {
    ...profile,
    n_gpu_layers: 0,
    n_batch: 256,
    n_ubatch: 128,
    n_ctx: Math.max(Math.floor((profile.n_ctx ?? 2048) / 2), 1024),
    cache_type_k: 'q4_0',
    cache_type_v: 'q4_0',
  };
}
