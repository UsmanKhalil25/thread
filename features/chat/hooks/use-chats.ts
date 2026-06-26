import { listChats } from '@/db/repositories/chats.repository';
import type { Chat } from '@/types/entities/chat';
import { useEffect, useSyncExternalStore } from 'react';

let chats: Chat[] = [];
const listeners = new Set<() => void>();

export async function refreshChats(): Promise<void> {
  chats = await listChats();
  for (const listener of listeners) listener();
}

export function useChats(): Chat[] {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => chats
  );

  useEffect(() => {
    void refreshChats();
  }, []);

  return snapshot;
}
