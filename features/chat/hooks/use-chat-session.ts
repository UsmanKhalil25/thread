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
  listMessagesPage,
  updateMessageContent,
} from '@/db/repositories/messages.repository';
import { useChat } from '@/features/chat/contexts/chat-context';
import { refreshChats } from '@/features/chat/hooks/use-chats';
import { generateChatTitle } from '@/features/chat/lib/generate-title';
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
  titlePhase: boolean;
  isLoadingMessages: boolean;
  hasOlder: boolean;
  loadingOlder: boolean;
}

interface ActiveGeneration {
  assistantId: string;
  content: string;
  stopped: boolean;
  frame: number | null;
}

interface PendingTitleTurn {
  assistantId: string;
  fallbackTitle: string;
  stopped: boolean;
}

const EMPTY_SNAPSHOT: ChatSessionSnapshot = {
  chatId: null,
  messages: [],
  isGenerating: false,
  titlePhase: false,
  isLoadingMessages: false,
  hasOlder: false,
  loadingOlder: false,
};
const listeners = new Set<() => void>();

let snapshot = EMPTY_SNAPSHOT;
let loadingChatId: string | null = null;
let activeGeneration: ActiveGeneration | null = null;
let pendingTitleTurn: PendingTitleTurn | null = null;

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
    setSnapshot({
      chatId: null,
      messages: [],
      isGenerating: false,
      titlePhase: false,
      isLoadingMessages: false,
      hasOlder: false,
      loadingOlder: false,
    });
    return;
  }

  setSnapshot({
    chatId,
    messages: [],
    isGenerating: activeGeneration !== null || pendingTitleTurn !== null,
    titlePhase: false,
    isLoadingMessages: true,
    hasOlder: false,
    loadingOlder: false,
  });

  const page = await listMessagesPage(chatId);
  if (loadingChatId !== chatId) return;
  setSnapshot({
    chatId,
    messages: page.items,
    isGenerating:
      activeGeneration !== null ||
      pendingTitleTurn !== null ||
      page.items.some((message) => message.status === 'generating'),
    titlePhase: false,
    isLoadingMessages: false,
    hasOlder: page.hasOlder,
    loadingOlder: false,
  });
}

async function loadOlderMessages() {
  const base = snapshot;
  if (
    !base.hasOlder ||
    base.loadingOlder ||
    !base.chatId ||
    base.messages.length === 0 ||
    base.isLoadingMessages
  ) {
    return;
  }

  const chatId = base.chatId;
  const first = base.messages[0];
  setSnapshot({ loadingOlder: true });

  try {
    const page = await listMessagesPage(chatId, {
      before: { ts: first.createdAt, id: first.id },
    });
    if (loadingChatId !== chatId || snapshot.chatId !== chatId) return;

    const existing = new Set(snapshot.messages.map((message) => message.id));
    const older = page.items.filter((message) => !existing.has(message.id));
    setSnapshot({
      messages: [...older, ...snapshot.messages],
      hasOlder: page.hasOlder,
      loadingOlder: false,
    });
  } catch {
    if (snapshot.chatId === chatId) setSnapshot({ loadingOlder: false });
  }
}

async function interruptActiveGeneration() {
  const generation = activeGeneration;
  if (generation) {
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
    setSnapshot({ isGenerating: false, titlePhase: false });
    return;
  }

  if (!pendingTitleTurn) return;

  pendingTitleTurn.stopped = true;
  await llamaService.stop();
}

async function beginAssistantTurn(params: {
  chatId: string;
  modelId: string;
  history: Message[];
}): Promise<string> {
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
    titlePhase: false,
    isLoadingMessages: false,
  });

  return assistantMessage.id;
}

async function streamAssistant(params: {
  assistantId: string;
  chatId: string;
  modelId: string;
  history: Message[];
  nCtx: number;
}): Promise<void> {
  setSnapshot({ isGenerating: true, titlePhase: false });

  const generation: ActiveGeneration = {
    assistantId: params.assistantId,
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

    await finalizeMessage(params.assistantId, {
      content: finalContent,
      status,
      ...stats,
    });
    await touchChat(params.chatId);
    await setChatModel(params.chatId, params.modelId);
    patchMessage(params.assistantId, {
      content: finalContent,
      status,
      ...stats,
    });
    void refreshChats();
  } catch {
    const status = generation.stopped ? 'interrupted' : 'error';
    await finalizeMessage(params.assistantId, {
      content: generation.content,
      status,
    });
    patchMessage(params.assistantId, { content: generation.content, status });
  } finally {
    if (activeGeneration?.assistantId === params.assistantId) activeGeneration = null;
    setSnapshot({ isGenerating: false, titlePhase: false });
  }
}

export function useChatActions() {
  const { activeChatId, setActiveChatId, selectedModelId } = useChat();
  const llamaStatus = useLlamaStatus();

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (
        !content ||
        activeGeneration !== null ||
        snapshot.isGenerating ||
        snapshot.isLoadingMessages ||
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

      let baseMessages: Message[];
      let hasOlder: boolean;
      if (snapshot.chatId === chat.id) {
        baseMessages = snapshot.messages;
        hasOlder = snapshot.hasOlder;
      } else if (activeChatId) {
        const page = await listMessagesPage(chat.id);
        baseMessages = page.items;
        hasOlder = page.hasOlder;
      } else {
        baseMessages = [];
        hasOlder = false;
      }

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
        titlePhase: false,
        isLoadingMessages: false,
        hasOlder,
        loadingOlder: false,
      });

      if (!activeChatId) void refreshChats();

      const assistantId = await beginAssistantTurn({
        chatId: chat.id,
        modelId: selectedModelId,
        history,
      });

      if (!chat.title) {
        const fallbackTitle = titleFromText(content);
        pendingTitleTurn = {
          assistantId,
          fallbackTitle,
          stopped: false,
        };
        setSnapshot({ titlePhase: true });
        const title = await generateChatTitle(content, fallbackTitle);
        const stopped = pendingTitleTurn?.assistantId === assistantId && pendingTitleTurn.stopped;

        await setChatTitle(chat.id, stopped ? fallbackTitle : title);
        pendingTitleTurn = null;
        setSnapshot({ titlePhase: false });
        void refreshChats();

        if (stopped) {
          await finalizeMessage(assistantId, { content: '', status: 'interrupted' });
          patchMessage(assistantId, { content: '', status: 'interrupted' });
          setSnapshot({ isGenerating: false, titlePhase: false });
          return;
        }
      }

      await streamAssistant({
        assistantId,
        chatId: chat.id,
        modelId: selectedModelId,
        history,
        nCtx: profileForModel(model).n_ctx ?? 2048,
      });
    },
    [activeChatId, llamaStatus.status, selectedModelId, setActiveChatId]
  );

  const editAndRegenerate = useCallback(
    async (messageId: string, nextContent: string) => {
      const content = nextContent.trim();
      const chatId = snapshot.chatId;
      if (
        !content ||
        !chatId ||
        activeGeneration !== null ||
        snapshot.isGenerating ||
        snapshot.isLoadingMessages ||
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
      setSnapshot({ messages: history, isGenerating: true, titlePhase: false });

      const assistantId = await beginAssistantTurn({
        chatId,
        modelId: selectedModelId,
        history,
      });
      await streamAssistant({
        assistantId,
        chatId,
        modelId: selectedModelId,
        history,
        nCtx: profileForModel(model).n_ctx ?? 2048,
      });
    },
    [llamaStatus.status, selectedModelId]
  );

  const regenerate = useCallback(
    async (messageId: string) => {
      const chatId = snapshot.chatId;
      if (
        !chatId ||
        activeGeneration !== null ||
        snapshot.isGenerating ||
        snapshot.isLoadingMessages ||
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
      setSnapshot({ messages: history, isGenerating: true, titlePhase: false });

      const assistantId = await beginAssistantTurn({
        chatId,
        modelId: selectedModelId,
        history,
      });
      await streamAssistant({
        assistantId,
        chatId,
        modelId: selectedModelId,
        history,
        nCtx: profileForModel(model).n_ctx ?? 2048,
      });
    },
    [llamaStatus.status, selectedModelId]
  );

  const stop = useCallback(async () => {
    await interruptActiveGeneration();
  }, []);

  return useMemo(
    () => ({ send, stop, editAndRegenerate, regenerate }),
    [editAndRegenerate, regenerate, send, stop]
  );
}

// Slice subscription: re-renders a consumer only when the boolean flips, not on
// every streamed token. Used by ChatInput so typing/interaction stays smooth.
export function useIsGenerating(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => snapshot.isGenerating,
    () => snapshot.isGenerating
  );
}

export function useIsLoadingMessages(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => snapshot.isLoadingMessages,
    () => snapshot.isLoadingMessages
  );
}

export function useChatSession() {
  const { activeChatId } = useChat();
  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const actions = useChatActions();

  useEffect(() => {
    if (activeChatId === session.chatId) return;
    void loadChatMessages(activeChatId);
  }, [activeChatId, session.chatId]);

  const thinkingLabel = session.titlePhase ? 'Generating title for chat' : 'Thinking';

  return useMemo(
    () => ({ ...session, ...actions, loadOlderMessages, thinkingLabel }),
    [actions, session, thinkingLabel]
  );
}
