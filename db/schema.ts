import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
};

export const preferencesTable = sqliteTable(
  'preferences_table',
  {
    id: text('key').primaryKey(),
    value: text('value').notNull(),
    ...timestamps,
  },
  (t) => [index('preferences_updated_at_idx').on(t.updatedAt)]
);

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
