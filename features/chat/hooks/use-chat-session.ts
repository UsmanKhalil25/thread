import {
  createChat,
  getChat,
  setChatModel,
  setChatTitle,
  touchChat,
} from '@/db/repositories/chats.repository';
import {
  deleteMessages,
  finalizeMessage,
  insertMessage,
  listMessages,
  updateMessageContent,
} from '@/db/repositories/messages.repository';
import { useChat } from '@/features/chat/contexts/chat-context';
import { buildMessages } from '@/features/chat/lib/build-prompt';
import { llamaService } from '@/features/inference/llama-service';
import { profileForModel } from '@/features/inference/profiles';
import { useLlamaStatus } from '@/features/inference/use-inference';
import { MODEL_CATALOG } from '@/lib/models';
import type { Message } from '@/types/entities/message';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

interface ChatSessionSnapshot {
  chatId: string | null;
  messages: Message[];
  isGenerating: boolean;
}

interface ActiveGeneration {
  assistantId: string;
  content: string;
  stopped: boolean;
  frame: number | null;
}

const EMPTY_SNAPSHOT: ChatSessionSnapshot = { chatId: null, messages: [], isGenerating: false };
const listeners = new Set<() => void>();

let snapshot = EMPTY_SNAPSHOT;
let loadingChatId: string | null = null;
let activeGeneration: ActiveGeneration | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function setSnapshot(patch: Partial<ChatSessionSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function patchMessage(messageId: string, patch: Partial<Message>) {
  setSnapshot({
    messages: snapshot.messages.map((message) =>
      message.id === messageId ? { ...message, ...patch } : message
    ),
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ChatSessionSnapshot {
  return snapshot;
}

function titleFromText(text: string): string {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (normalized.length <= 40) return normalized;
  return `${normalized.slice(0, 40).trim()}...`;
}

async function loadChatMessages(chatId: string | null) {
  loadingChatId = chatId;

  if (!chatId) {
    setSnapshot({ chatId: null, messages: [], isGenerating: false });
    return;
  }

  const messages = await listMessages(chatId);
  if (loadingChatId !== chatId) return;
  setSnapshot({
    chatId,
    messages,
    isGenerating:
      activeGeneration !== null || messages.some((message) => message.status === 'generating'),
  });
}

async function interruptActiveGeneration() {
  const generation = activeGeneration;
  if (!generation) return;

  generation.stopped = true;
  if (generation.frame !== null) {
    cancelAnimationFrame(generation.frame);
    generation.frame = null;
  }

  await llamaService.stop();
  await finalizeMessage(generation.assistantId, {
    content: generation.content,
    status: 'interrupted',
  });
  patchMessage(generation.assistantId, {
    content: generation.content,
    status: 'interrupted',
  });
  activeGeneration = null;
  setSnapshot({ isGenerating: false });
}

async function runAssistantTurn(params: {
  chatId: string;
  modelId: string;
  history: Message[];
  nCtx: number;
}): Promise<void> {
  const assistantMessage = await insertMessage({
    chatId: params.chatId,
    role: 'assistant',
    status: 'generating',
    modelId: params.modelId,
    createdAt: Date.now(),
  });
  setSnapshot({
    chatId: params.chatId,
    messages: [...params.history, assistantMessage],
    isGenerating: true,
  });

  const generation: ActiveGeneration = {
    assistantId: assistantMessage.id,
    content: '',
    stopped: false,
    frame: null,
  };
  activeGeneration = generation;

  const flush = () => {
    generation.frame = null;
    patchMessage(generation.assistantId, { content: generation.content });
  };

  try {
    const result = await llamaService.complete(
      {
        messages: buildMessages(params.history, params.nCtx),
        n_predict: 512,
      },
      (token) => {
        generation.content += token;
        if (generation.frame === null) generation.frame = requestAnimationFrame(flush);
      }
    );

    if (generation.frame !== null) {
      cancelAnimationFrame(generation.frame);
      generation.frame = null;
    }

    const status = generation.stopped ? 'interrupted' : 'complete';
    const finalContent = result.text || generation.content;
    const stats = generation.stopped
      ? { tokensPerSecond: undefined, tokenCount: undefined }
      : {
          tokensPerSecond: result.timings.predicted_per_second,
          tokenCount: result.tokens_predicted,
        };

    await finalizeMessage(assistantMessage.id, {
      content: finalContent,
      status,
      ...stats,
    });
    await touchChat(params.chatId);
    await setChatModel(params.chatId, params.modelId);
    patchMessage(assistantMessage.id, {
      content: finalContent,
      status,
      ...stats,
    });
  } catch {
    const status = generation.stopped ? 'interrupted' : 'error';
    await finalizeMessage(assistantMessage.id, {
      content: generation.content,
      status,
    });
    patchMessage(assistantMessage.id, { content: generation.content, status });
  } finally {
    if (activeGeneration?.assistantId === assistantMessage.id) activeGeneration = null;
    setSnapshot({ isGenerating: false });
  }
}

export function useChatSession() {
  const { activeChatId, setActiveChatId, selectedModelId } = useChat();
  const llamaStatus = useLlamaStatus();
  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void loadChatMessages(activeChatId);
  }, [activeChatId]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (
        !content ||
        activeGeneration !== null ||
        session.isGenerating ||
        llamaStatus.status !== 'ready' ||
        !selectedModelId
      ) {
        return;
      }

      const model = MODEL_CATALOG.find((item) => item.id === selectedModelId);
      if (!model) return;

      const chat = activeChatId ? await getChat(activeChatId) : await createChat();
      if (!chat) return;

      if (!activeChatId) setActiveChatId(chat.id);

      const baseMessages =
        snapshot.chatId === chat.id
          ? snapshot.messages
          : activeChatId
            ? await listMessages(chat.id)
            : [];

      const now = Date.now();
      const userMessage = await insertMessage({
        chatId: chat.id,
        role: 'user',
        content,
        status: 'complete',
        modelId: selectedModelId,
        createdAt: now,
      });

      const history = [...baseMessages, userMessage];
      setSnapshot({
        chatId: chat.id,
        messages: history,
        isGenerating: true,
      });
      await runAssistantTurn({
        chatId: chat.id,
        modelId: selectedModelId,
        history,
        nCtx: profileForModel(model).n_ctx ?? 2048,
      });
      if (!chat.title) await setChatTitle(chat.id, titleFromText(content));
    },
    [activeChatId, llamaStatus.status, selectedModelId, session.isGenerating, setActiveChatId]
  );

  const editAndRegenerate = useCallback(
    async (messageId: string, nextContent: string) => {
      const content = nextContent.trim();
      const chatId = snapshot.chatId;
      if (
        !content ||
        !chatId ||
        activeGeneration !== null ||
        session.isGenerating ||
        llamaStatus.status !== 'ready' ||
        !selectedModelId
      ) {
        return;
      }

      const idx = snapshot.messages.findIndex((message) => message.id === messageId);
      if (idx < 0 || snapshot.messages[idx].role !== 'user') return;

      const model = MODEL_CATALOG.find((item) => item.id === selectedModelId);
      if (!model) return;

      const edited: Message = { ...snapshot.messages[idx], content };
      const removed = snapshot.messages.slice(idx + 1);
      const history = [...snapshot.messages.slice(0, idx), edited];

      await updateMessageContent(messageId, content);
      await deleteMessages(removed.map((message) => message.id));
      setSnapshot({ messages: history, isGenerating: true });

      await runAssistantTurn({
        chatId,
        modelId: selectedModelId,
        history,
        nCtx: profileForModel(model).n_ctx ?? 2048,
      });
    },
    [llamaStatus.status, selectedModelId, session.isGenerating]
  );

  const regenerate = useCallback(
    async (messageId: string) => {
      const chatId = snapshot.chatId;
      if (
        !chatId ||
        activeGeneration !== null ||
        session.isGenerating ||
        llamaStatus.status !== 'ready' ||
        !selectedModelId
      ) {
        return;
      }

      const idx = snapshot.messages.findIndex((message) => message.id === messageId);
      if (idx < 0 || snapshot.messages[idx].role !== 'assistant') return;

      const history = snapshot.messages.slice(0, idx);
      if (history.length === 0) return;

      const model = MODEL_CATALOG.find((item) => item.id === selectedModelId);
      if (!model) return;

      const removed = snapshot.messages.slice(idx);
      await deleteMessages(removed.map((message) => message.id));
      setSnapshot({ messages: history, isGenerating: true });

      await runAssistantTurn({
        chatId,
        modelId: selectedModelId,
        history,
        nCtx: profileForModel(model).n_ctx ?? 2048,
      });
    },
    [llamaStatus.status, selectedModelId, session.isGenerating]
  );

  const stop = useCallback(async () => {
    await interruptActiveGeneration();
  }, []);

  return useMemo(
    () => ({ ...session, send, stop, editAndRegenerate, regenerate }),
    [editAndRegenerate, regenerate, send, session, stop]
  );
}
