/** Resolve API base URL: same-origin on Vercel/production, localhost only in dev. */
export function getApiBaseUrl(): string {
  const fromEnv = (import.meta as { env?: { VITE_API_BASE_URL?: string; PROD?: boolean } }).env
    ?.VITE_API_BASE_URL;
  if (fromEnv != null && fromEnv.trim() !== '') {
    return fromEnv.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }

  return '';
}

export function formatApiError(raw: string, lang: 'kh' | 'en'): string {
  const text = raw.trim();
  if (/NOT_FOUND|404|page could not be found/i.test(text)) {
    return lang === 'kh'
      ? 'មិនអាចភ្ជាប់ API បានទេ។ សូម refresh ទំព័រឡើងវិញ។'
      : 'API not reachable. Please refresh the page.';
  }
  if (text.length > 160) return text.slice(0, 160) + '…';
  return text;
}

async function sleep(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  attempts = 3
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(input, init);
      if (response.status === 404 || response.status === 502 || response.status === 503 || response.status === 504) {
        if (i < attempts - 1) {
          await sleep(800 * (i + 1));
          continue;
        }
      }
      return response;
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) await sleep(800 * (i + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
