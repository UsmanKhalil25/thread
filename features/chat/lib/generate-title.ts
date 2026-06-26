import { llamaService } from '@/features/inference/llama-service';

const SYSTEM =
  'Generate a short, specific title for this chat from the user message. Reply with ONLY the title: 3-6 words, no quotes, no trailing punctuation. Preserve code names, acronyms, and product names. Prefer the main task or topic. Avoid generic titles like Help Request, New Chat, or General Question.';

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
