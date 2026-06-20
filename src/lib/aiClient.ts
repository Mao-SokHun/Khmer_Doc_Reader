import { getApiBaseUrl, fetchWithRetry } from './apiBaseUrl';

async function aiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetchWithRetry(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `AI request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

let geminiStatusCache: boolean | null = null;

export async function isAiConfigured(): Promise<boolean> {
  if (geminiStatusCache !== null) return geminiStatusCache;
  try {
    const response = await fetchWithRetry(`${getApiBaseUrl()}/api/ai/status`);
    if (!response.ok) return false;
    const data = (await response.json()) as { configured?: boolean };
    geminiStatusCache = Boolean(data.configured);
    return geminiStatusCache;
  } catch {
    return false;
  }
}

export function clearAiStatusCache() {
  geminiStatusCache = null;
}

export async function aiFormatMarkdown(content: string, lang: 'kh' | 'en') {
  const { markdown } = await aiPost<{ markdown: string }>('/api/ai/format', { content, lang });
  return markdown;
}

export async function aiTranslateMarkdown(content: string, targetLang: string) {
  const { markdown } = await aiPost<{ markdown: string }>('/api/ai/translate', { content, targetLang });
  return markdown;
}

export async function aiGenerateLesson(options: {
  topic: string;
  lang: 'kh' | 'en';
  level?: string;
  includeQuiz?: boolean;
}) {
  const { markdown } = await aiPost<{ markdown: string }>('/api/ai/generate-lesson', options);
  return markdown;
}

export async function aiGenerateImage(prompt: string) {
  const { imageBase64 } = await aiPost<{ imageBase64: string }>('/api/ai/generate-image', { prompt });
  return imageBase64;
}
