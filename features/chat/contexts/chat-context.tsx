import { getReadyModelPath } from '@/db/repositories/model-downloads.repository';
import { llamaService } from '@/features/inference/llama-service';
import { MODEL_CATALOG } from '@/lib/models';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

interface ChatContextValue {
  selectedModelId: string | null;
  setSelectedModelId: (id: string | null) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  openModelPicker?: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  selectedModelId: null,
  setSelectedModelId: () => {},
  activeChatId: null,
  setActiveChatId: () => {},
});

interface ChatProviderProps extends PropsWithChildren {
  openModelPicker?: () => void;
}

export function ChatProvider({ children, openModelPicker }: ChatProviderProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!selectedModelId) {
      void llamaService.release();
      return;
    }

    void (async () => {
      const model = MODEL_CATALOG.find((item) => item.id === selectedModelId);
      const path = await getReadyModelPath(selectedModelId);
      if (cancelled) return;

      if (!model || !path) {
        await llamaService.release();
        return;
      }

      await llamaService.load(model, path).catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedModelId]);

  return (
    <ChatContext.Provider
      value={{
        selectedModelId,
        setSelectedModelId,
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
