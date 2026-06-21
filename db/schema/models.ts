import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './timestamps';

export const modelsTable = sqliteTable(
  'models',
  {
    id: text('id').primaryKey(),
    status: text('status', { enum: ['downloading', 'installed', 'error'] }).notNull(),
    progress: real('progress').default(0),
    localPath: text('local_path'),
    resumeData: text('resume_data'),
    errorMessage: text('error_message'),
    ...timestamps,
  },
  (t) => [index('models_status_idx').on(t.status), index('models_updated_at_idx').on(t.updatedAt)]
);
