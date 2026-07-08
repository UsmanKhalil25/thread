export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'complete' | 'generating' | 'error' | 'interrupted';

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  modelId?: string;
  tokensPerSecond?: number;
  tokenCount?: number;
  createdAt: number;
}
