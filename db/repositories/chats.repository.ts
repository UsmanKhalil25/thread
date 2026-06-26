import { db } from '@/db/client';
import { chatsTable, messagesTable } from '@/db/schema';
import type { Chat } from '@/types/entities/chat';
import { desc, eq } from 'drizzle-orm';

type ChatRow = typeof chatsTable.$inferSelect;

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toChat(row: ChatRow): Chat {
  return {
    id: row.id,
    title: row.title ?? undefined,
    modelId: row.modelId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createChat(): Promise<Chat> {
  const now = Date.now();
  const chat = { id: createId(), title: null, modelId: null, createdAt: now, updatedAt: now };
  await db.insert(chatsTable).values(chat);
  return toChat(chat);
}

export async function listChats(): Promise<Chat[]> {
  const rows = await db.select().from(chatsTable).orderBy(desc(chatsTable.updatedAt));
  return rows.map(toChat);
}

export async function getChat(id: string): Promise<Chat | null> {
  const rows = await db.select().from(chatsTable).where(eq(chatsTable.id, id)).limit(1);
  return rows[0] ? toChat(rows[0]) : null;
}

export async function deleteChat(id: string): Promise<void> {
  await db.delete(messagesTable).where(eq(messagesTable.chatId, id));
  await db.delete(chatsTable).where(eq(chatsTable.id, id));
}

export async function touchChat(id: string): Promise<void> {
  await db.update(chatsTable).set({ updatedAt: Date.now() }).where(eq(chatsTable.id, id));
}

export async function setChatTitle(id: string, title: string): Promise<void> {
  await db.update(chatsTable).set({ title, updatedAt: Date.now() }).where(eq(chatsTable.id, id));
}

export async function setChatModel(id: string, modelId: string): Promise<void> {
  await db.update(chatsTable).set({ modelId, updatedAt: Date.now() }).where(eq(chatsTable.id, id));
}
