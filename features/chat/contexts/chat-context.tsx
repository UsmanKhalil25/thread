import { createContext, useContext, useState, type PropsWithChildren } from 'react';

interface ChatContextValue {
  selectedModelId: string | null;
  setSelectedModelId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextValue>({
  selectedModelId: null,
  setSelectedModelId: () => {},
});

export function ChatProvider({ children }: PropsWithChildren) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ selectedModelId, setSelectedModelId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
