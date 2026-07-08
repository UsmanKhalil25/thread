import { getChat, setChatModel } from '@/db/repositories/chats.repository';
import { getReadyModelPath } from '@/db/repositories/model-downloads.repository';
import { interruptGeneration } from '@/features/chat/hooks/use-chat-session';
import { refreshChats } from '@/features/chat/hooks/use-chats';
import { llamaService } from '@/features/inference/llama-service';
import { MODEL_CATALOG } from '@/lib/models';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

interface ChatContextValue {
  selectedModelId: string | null;
  setSelectedModelId: (id: string | null) => void;
  selectModel: (id: string) => void;
  retryLoad: () => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  openModelPicker?: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  selectedModelId: null,
  setSelectedModelId: () => {},
  selectModel: () => {},
  retryLoad: () => {},
  activeChatId: null,
  setActiveChatId: () => {},
});

interface ChatProviderProps extends PropsWithChildren {
  openModelPicker?: () => void;
}

export function ChatProvider({ children, openModelPicker }: ChatProviderProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loadNonce, setLoadNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!activeChatId) return;

    void (async () => {
      const chat = await getChat(activeChatId);
      if (cancelled || !chat?.modelId) return;
      setSelectedModelId(chat.modelId);
    })();

    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  const selectModel = useCallback(
    (modelId: string) => {
      setSelectedModelId(modelId);
      if (activeChatId) {
        void setChatModel(activeChatId, modelId);
        void refreshChats();
      }
    },
    [activeChatId]
  );

  const retryLoad = useCallback(() => setLoadNonce((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    if (!selectedModelId) {
      void (async () => {
        await interruptGeneration();
        if (!cancelled) await llamaService.release();
      })();

      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      const model = MODEL_CATALOG.find((item) => item.id === selectedModelId);
      const path = await getReadyModelPath(selectedModelId);
      if (cancelled) return;

      if (!model || !path) {
        await interruptGeneration();
        if (cancelled) return;
        await llamaService.release();
        return;
      }

      await interruptGeneration();
      if (cancelled) return;
      await llamaService.load(model, path).catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [loadNonce, selectedModelId]);

  return (
    <ChatContext.Provider
      value={{
        selectedModelId,
        setSelectedModelId,
        selectModel,
        retryLoad,
        activeChatId,
        setActiveChatId,
        openModelPicker,
      }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
