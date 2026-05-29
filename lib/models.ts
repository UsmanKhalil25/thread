import modelsJson from '@/assets/data/models.json';
import { AndroidModelsSchema, type ModelDefinition } from '@/types/models';

export { type DeviceTier, type ModelDefinition } from '@/types/models';

export const ANDROID_MODELS: ModelDefinition[] = AndroidModelsSchema.parse(modelsJson);

export function modelDownloadUrl(model: ModelDefinition): string {
  return `https://huggingface.co/${model.hfRepo}/resolve/main/${model.filename}`;
}
