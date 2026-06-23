import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const modelDownloadsTable = sqliteTable(
  'model_downloads',
  {
    id: text('id').primaryKey(),
    modelId: text('model_id').notNull(),
    status: text('status', { enum: ['queued', 'downloading', 'ready', 'failed'] }).notNull(),
    filePath: text('file_path'),
    downloadedBytes: integer('downloaded_bytes').notNull().default(0),
    taskId: text('task_id'),
  },
  (t) => [
    uniqueIndex('model_downloads_model_id_idx').on(t.modelId),
    index('model_downloads_status_idx').on(t.status),
  ]
);
