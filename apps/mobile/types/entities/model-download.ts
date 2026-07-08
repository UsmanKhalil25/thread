export type ModelDownloadStatus = 'queued' | 'downloading' | 'ready' | 'failed';

export interface ModelDownload {
  id: string;
  modelId: string;
  status: ModelDownloadStatus;
  filePath?: string;
  downloadedBytes: number;
  taskId?: string;
}
