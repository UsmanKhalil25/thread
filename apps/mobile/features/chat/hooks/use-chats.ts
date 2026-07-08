import { listChatsPage } from '@/db/repositories/chats.repository';
import type { Chat } from '@/types/entities/chat';
import { useEffect, useSyncExternalStore } from 'react';

type ChatsStatus = 'idle' | 'loading' | 'ready';

interface ChatsSnapshot {
  chats: Chat[];
  status: ChatsStatus;
  hasMore: boolean;
  loadingMore: boolean;
}

const CHATS_PAGE = 40;
let snapshot: ChatsSnapshot = { chats: [], status: 'idle', hasMore: false, loadingMore: false };
let stale = false;
let activeConsumers = 0;
let loadVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setSnapshot(patch: Partial<ChatsSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function getSnapshot(): ChatsSnapshot {
  return snapshot;
}

function compareChats(a: Chat, b: Chat): number {
  return b.updatedAt - a.updatedAt || (a.id < b.id ? 1 : -1);
}

async function loadChats(): Promise<void> {
  const version = ++loadVersion;
  stale = false;
  setSnapshot({ status: 'loading', loadingMore: false });
  const page = await listChatsPage({ limit: CHATS_PAGE });
  if (version !== loadVersion) return;
  setSnapshot({ chats: page.items, status: 'ready', hasMore: page.hasMore, loadingMore: false });
}

export async function refreshChats(): Promise<void> {
  if (activeConsumers === 0) {
    stale = true;
    return;
  }

  const version = ++loadVersion;
  stale = false;
  const page = await listChatsPage({ limit: CHATS_PAGE });
  if (version !== loadVersion) return;

  const previous = snapshot;
  const byId = new Map<string, Chat>();
  for (const chat of previous.chats) byId.set(chat.id, chat);
  for (const chat of page.items) byId.set(chat.id, chat);
  const chats = [...byId.values()].sort(compareChats);
  const hadDeeper = previous.chats.length > page.items.length;
  setSnapshot({
    chats,
    status: 'ready',
    hasMore: hadDeeper ? previous.hasMore : page.hasMore,
    loadingMore: false,
  });
}

export async function loadMoreChats(): Promise<void> {
  const base = snapshot;
  if (!base.hasMore || base.loadingMore || base.chats.length === 0) return;

  const last = base.chats[base.chats.length - 1];
  const version = ++loadVersion;
  setSnapshot({ loadingMore: true });
  const page = await listChatsPage({
    limit: CHATS_PAGE,
    cursor: { ts: last.updatedAt, id: last.id },
  });
  if (version !== loadVersion) return;

  const existing = new Set(base.chats.map((chat) => chat.id));
  const next = page.items.filter((chat) => !existing.has(chat.id));
  setSnapshot({
    chats: [...base.chats, ...next],
    status: 'ready',
    hasMore: page.hasMore,
    loadingMore: false,
  });
}

export function useChats(enabled = true): ChatsSnapshot {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot,
    getSnapshot
  );

  useEffect(() => {
    if (!enabled) return;

    activeConsumers += 1;
    if (snapshot.status === 'idle' || stale) void loadChats();

    return () => {
      activeConsumers = Math.max(0, activeConsumers - 1);
    };
  }, [enabled, snapshot.status]);

  return snapshot;
}
