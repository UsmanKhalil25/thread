import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './timestamps';

export const preferencesTable = sqliteTable(
  'preferences_table',
  {
    id: text('key').primaryKey(),
    value: text('value').notNull(),
    ...timestamps,
  },
  (t) => [index('preferences_updated_at_idx').on(t.updatedAt)]
);
