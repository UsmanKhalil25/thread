import type { Message } from '@/types/entities/message';
import type { RNLlamaOAICompatibleMessage } from 'llama.rn';

const SYSTEM_PROMPT = 'You are a helpful assistant running on-device.';
const RESPONSE_RESERVE_TOKENS = 512;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function truncateToTokens(text: string, tokens: number): string {
  return text.slice(Math.max(0, text.length - tokens * 4));
}

export function buildMessages(history: Message[], nCtx: number): RNLlamaOAICompatibleMessage[] {
  const systemTokens = estimateTokens(SYSTEM_PROMPT);
  const budget = Math.max(nCtx - RESPONSE_RESERVE_TOKENS - systemTokens, 128);
  const kept: RNLlamaOAICompatibleMessage[] = [];
  let used = 0;

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const message = history[i];
    if (!message.content) continue;

    const tokens = estimateTokens(message.content);
    if (used + tokens <= budget) {
      kept.push({ role: message.role, content: message.content });
      used += tokens;
      continue;
    }

    if (kept.length === 0) {
      kept.push({
        role: message.role,
        content: truncateToTokens(message.content, Math.max(budget - used, 64)),
      });
    }
    break;
  }

  return [{ role: 'system', content: SYSTEM_PROMPT }, ...kept.reverse()];
}
