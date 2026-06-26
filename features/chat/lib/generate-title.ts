import { llamaService } from '@/features/inference/llama-service';

const SYSTEM =
  'You generate a concise chat title. Reply with ONLY a 3-6 word title in Title Case, no quotes and no trailing punctuation.';

function cleanTitle(raw: string): string {
  return raw
    .split('\n')[0]
    .replace(/^["'`*\s]+|["'`*.\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 48)
    .trim();
}

export async function generateChatTitle(userText: string, fallback: string): Promise<string> {
  try {
    const result = await llamaService.complete(
      {
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userText.slice(0, 500) },
        ],
        n_predict: 16,
        temperature: 0.3,
      },
      () => {}
    );

    return cleanTitle(result.text) || fallback;
  } catch {
    return fallback;
  }
}
