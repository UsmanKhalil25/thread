import modelsJson from '@/assets/data/models.json';
import { CatalogModelsSchema, type CatalogModel } from '@/types/model-catalog';

export { type DeviceTier, type CatalogModel } from '@/types/model-catalog';

export const MODEL_CATALOG: CatalogModel[] = CatalogModelsSchema.parse(modelsJson);

export function modelDownloadUrl(model: CatalogModel): string {
  return `https://huggingface.co/${model.hfRepo}/resolve/main/${model.filename}`;
}
