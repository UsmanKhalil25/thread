import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { chatsTable } from '@/db/schema/chats';

export const messagesTable = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    chatId: text('chat_id')
      .notNull()
      .references(() => chatsTable.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull().default(''),
    status: text('status', {
      enum: ['complete', 'generating', 'error', 'interrupted'],
    }).notNull(),
    modelId: text('model_id'),
    tokensPerSecond: real('tokens_per_second'),
    tokenCount: integer('token_count'),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('messages_chat_idx').on(t.chatId, t.createdAt)]
);
