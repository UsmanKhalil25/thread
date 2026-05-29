import type { Persisted } from './persisted';

export type ModelStatus = 'downloading' | 'installed' | 'error';

export interface Model extends Persisted {
  status: ModelStatus;
  progress: number;
  localPath?: string;
  resumeData?: string;
  errorMessage?: string;
  bytesWritten?: number;
  totalBytes?: number;
  speed?: number;
}
