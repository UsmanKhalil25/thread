import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const chatsTable = sqliteTable(
  'chats',
  {
    id: text('id').primaryKey(),
    title: text('title'),
    modelId: text('model_id'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [index('chats_updated_at_id_idx').on(t.updatedAt, t.id)]
);
