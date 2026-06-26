import modelsJson from '@/assets/data/models.json';
import { CatalogModelsSchema, type CatalogModel, type DeviceTier } from '@/types/model-catalog';

export { type DeviceTier, type ModelCategory, type CatalogModel } from '@/types/model-catalog';

export const MODEL_CATALOG: CatalogModel[] = CatalogModelsSchema.parse(modelsJson);
const TIER_RANK: Record<DeviceTier, number> = { any: 0, '6gb': 1, '8gb': 2 };

export function modelDownloadUrl(model: CatalogModel): string {
  return `https://huggingface.co/${model.hfRepo}/resolve/main/${model.filename}`;
}

export function modelHasCategory(
  model: CatalogModel,
  category: CatalogModel['categories'][number]
) {
  return model.categories.includes(category);
}

function parseParams(params: string): number {
  const value = Number.parseFloat(params);
  return Number.isFinite(value) ? value : 0;
}

export function modelFitsDevice(model: CatalogModel, deviceTier: DeviceTier): boolean {
  return TIER_RANK[model.deviceTier] <= TIER_RANK[deviceTier];
}

export function recommendModel(deviceTier: DeviceTier): CatalogModel {
  const fitting = MODEL_CATALOG.filter((model) => modelFitsDevice(model, deviceTier));
  const pool = fitting.length > 0 ? fitting : MODEL_CATALOG;
  return [...pool].sort(
    (a, b) => parseParams(b.params) - parseParams(a.params) || a.sizeBytes - b.sizeBytes
  )[0];
}
