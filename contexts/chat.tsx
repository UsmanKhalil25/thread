import { createContext, useContext, useState, type PropsWithChildren } from 'react';

interface ChatContextValue {
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue>({
  selectedModelId: '1',
  setSelectedModelId: () => {},
});

export function ChatProvider({ children }: PropsWithChildren) {
  const [selectedModelId, setSelectedModelId] = useState('1');

  return (
    <ChatContext.Provider value={{ selectedModelId, setSelectedModelId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
