import { z } from 'zod';

export const DeviceTierSchema = z.enum(['any', '6gb', '8gb']);

export const ModelDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  initial: z.string().length(1),
  tint: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  params: z.string(),
  quant: z.string(),
  sizeBytes: z.number().positive(),
  sizeLabel: z.string(),
  ramLabel: z.string(),
  deviceTier: DeviceTierSchema,
  hfRepo: z.string(),
  filename: z.string().endsWith('.gguf'),
  family: z.string(),
  description: z.string(),
});

export const AndroidModelsSchema = z.array(ModelDefinitionSchema);

export type DeviceTier = z.infer<typeof DeviceTierSchema>;
export type ModelDefinition = z.infer<typeof ModelDefinitionSchema>;
