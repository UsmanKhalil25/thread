import modelsJson from '@/assets/data/models.json';
import { CatalogModelsSchema, type CatalogModel } from '@/types/model-catalog';

export { type DeviceTier, type ModelCategory, type CatalogModel } from '@/types/model-catalog';

export const MODEL_CATALOG: CatalogModel[] = CatalogModelsSchema.parse(modelsJson);

export const MODEL_DEVELOPERS = ['Meta', 'Google', 'Qwen', 'Microsoft', 'Hugging Face'] as const;
export type ModelDeveloper = (typeof MODEL_DEVELOPERS)[number];

const FAMILY_DEVELOPER: Record<string, ModelDeveloper> = {
  llama: 'Meta',
  gemma: 'Google',
  qwen: 'Qwen',
  phi: 'Microsoft',
  smollm: 'Hugging Face',
};

export function modelDeveloper(model: CatalogModel): ModelDeveloper {
  return FAMILY_DEVELOPER[model.family] ?? 'Hugging Face';
}

export function modelDownloadUrl(model: CatalogModel): string {
  return `https://huggingface.co/${model.hfRepo}/resolve/main/${model.filename}`;
}
