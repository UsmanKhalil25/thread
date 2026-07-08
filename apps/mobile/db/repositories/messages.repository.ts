import { db } from '@/db/client';
import type { Cursor } from '@/db/repositories/pagination';
import { messagesTable } from '@/db/schema';
import type { Message, MessageRole, MessageStatus } from '@/types/entities/message';
import { and, asc, desc, eq, inArray, lt, or } from 'drizzle-orm';

type MessageRow = typeof messagesTable.$inferSelect;
const MESSAGES_PAGE = 30;

interface InsertMessageParams {
  id?: string;
  chatId: string;
  role: MessageRole;
  content?: string;
  status: MessageStatus;
  modelId?: string | null;
  createdAt?: number;
}

interface FinalizeMessageParams {
  content: string;
  status: MessageStatus;
  tokensPerSecond?: number;
  tokenCount?: number;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    chatId: row.chatId,
    role: row.role,
    content: row.content,
    status: row.status,
    modelId: row.modelId ?? undefined,
    tokensPerSecond: row.tokensPerSecond ?? undefined,
    tokenCount: row.tokenCount ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function listMessages(chatId: string): Promise<Message[]> {
  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId))
    .orderBy(asc(messagesTable.createdAt), asc(messagesTable.id));
  return rows.map(toMessage);
}

export async function listMessagesPage(
  chatId: string,
  opts?: { limit?: number; before?: Cursor | null }
): Promise<{ items: Message[]; hasOlder: boolean }> {
  const limit = opts?.limit ?? MESSAGES_PAGE;
  const before = opts?.before ?? null;
  const where = before
    ? and(
        eq(messagesTable.chatId, chatId),
        or(
          lt(messagesTable.createdAt, before.ts),
          and(eq(messagesTable.createdAt, before.ts), lt(messagesTable.id, before.id))
        )
      )
    : eq(messagesTable.chatId, chatId);

  const rows = await db
    .select()
    .from(messagesTable)
    .where(where)
    .orderBy(desc(messagesTable.createdAt), desc(messagesTable.id))
    .limit(limit + 1);

  return { items: rows.slice(0, limit).map(toMessage).reverse(), hasOlder: rows.length > limit };
}

export async function insertMessage(params: InsertMessageParams): Promise<Message> {
  const row = {
    id: params.id ?? createId(),
    chatId: params.chatId,
    role: params.role,
    content: params.content ?? '',
    status: params.status,
    modelId: params.modelId ?? null,
    tokensPerSecond: null,
    tokenCount: null,
    createdAt: params.createdAt ?? Date.now(),
  };

  await db.insert(messagesTable).values(row);
  return toMessage(row);
}

export async function finalizeMessage(id: string, params: FinalizeMessageParams): Promise<void> {
  await db
    .update(messagesTable)
    .set({
      content: params.content,
      status: params.status,
      tokensPerSecond: params.tokensPerSecond ?? null,
      tokenCount: params.tokenCount ?? null,
    })
    .where(eq(messagesTable.id, id));
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<void> {
  await db.update(messagesTable).set({ status }).where(eq(messagesTable.id, id));
}

export async function updateMessageContent(id: string, content: string): Promise<void> {
  await db.update(messagesTable).set({ content }).where(eq(messagesTable.id, id));
}

export async function deleteMessages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(messagesTable).where(inArray(messagesTable.id, ids));
}

export async function markInterruptedOnStartup(): Promise<void> {
  await db
    .update(messagesTable)
    .set({ status: 'interrupted' })
    .where(and(eq(messagesTable.role, 'assistant'), eq(messagesTable.status, 'generating')));
}
