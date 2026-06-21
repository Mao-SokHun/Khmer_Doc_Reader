import { GoogleGenAI } from '@google/genai';

const PLACEHOLDER_KEYS = new Set(['', 'MY_GEMINI_API_KEY', 'your_key', 'your_gemini_api_key']);

/** Strip BOM / whitespace from env keys (common when pasting into Vercel dashboard). */
export function normalizeGeminiApiKey(raw) {
  return String(raw || '')
    .replace(/^\uFEFF/, '')
    .trim();
}

export function getGeminiApiKey() {
  return normalizeGeminiApiKey(process.env.GEMINI_API_KEY);
}

export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return Boolean(key && !PLACEHOLDER_KEYS.has(key));
}

function getClient() {
  if (!isGeminiConfigured()) {
    const error = new Error('GEMINI_NOT_CONFIGURED');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}

function stripFence(text) {
  const trimmed = (text || '').trim();
  const wrapped = trimmed.match(/^```(?:markdown|md|text|html)?\s*\r?\n([\s\S]*?)\r?\n```\s*$/i);
  return wrapped ? wrapped[1].trim() : trimmed;
}

const TRANSLATE_CHUNK_MAX = 3200;
const TRANSLATE_CONCURRENCY = 4;
const TRANSLATE_MODEL = 'gemini-2.5-flash';

function splitByParagraphs(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const parts = text.split(/\n\n+/);
  const out = [];
  let buf = '';
  for (const part of parts) {
    const next = buf ? `${buf}\n\n${part}` : part;
    if (next.length > maxLen && buf.trim()) {
      out.push(buf);
      buf = part;
    } else {
      buf = next;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function splitLongProse(text) {
  if (text.length <= TRANSLATE_CHUNK_MAX) return [text];

  const byHeading = text.split(/(?=^#{1,3}\s)/m);
  if (byHeading.length > 1) {
    const merged = [];
    let buf = '';
    for (const piece of byHeading) {
      const next = buf + piece;
      if (next.length > TRANSLATE_CHUNK_MAX && buf.trim()) {
        merged.push(buf);
        buf = piece;
      } else {
        buf = next;
      }
    }
    if (buf) merged.push(buf);
    return merged.flatMap((chunk) =>
      chunk.length > TRANSLATE_CHUNK_MAX ? splitByParagraphs(chunk, TRANSLATE_CHUNK_MAX) : [chunk]
    );
  }

  return splitByParagraphs(text, TRANSLATE_CHUNK_MAX);
}

/** Split markdown into prose vs fenced code/quiz blocks (code is not sent to AI). */
function splitMarkdownSegments(content) {
  const segments = [];
  const fenceRe = /(```[\s\S]*?```)/g;
  let last = 0;
  let match;

  while ((match = fenceRe.exec(content)) !== null) {
    if (match.index > last) {
      for (const part of splitLongProse(content.slice(last, match.index))) {
        segments.push({ type: 'prose', text: part });
      }
    }
    segments.push({ type: 'code', text: match[1] });
    last = fenceRe.lastIndex;
  }

  if (last < content.length) {
    for (const part of splitLongProse(content.slice(last))) {
      segments.push({ type: 'prose', text: part });
    }
  }

  if (!segments.length && content.trim()) {
    for (const part of splitLongProse(content)) {
      segments.push({ type: 'prose', text: part });
    }
  }

  return segments;
}

async function mapConcurrent(items, limit, fn) {
  if (!items.length) return [];
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function translateProseChunk(ai, text, targetLang) {
  if (!text.trim()) return text;

  const response = await ai.models.generateContent({
    model: TRANSLATE_MODEL,
    contents: `Translate to ${targetLang}. Keep Markdown syntax (# headings, lists, **bold**, links). Output translation only.\n\n${text}`,
    config: {
      systemInstruction:
        'You translate Markdown prose. Preserve structure exactly. Do not add explanations.',
      temperature: 0.1,
    },
  });

  const raw = stripFence(response.text || '');
  if (!raw) throw new Error('AI_EMPTY_RESPONSE');
  return raw;
}

export async function geminiFormatMarkdown(sourceMarkdown, lang = 'kh') {
  const input = (sourceMarkdown || '').trim();
  if (!input) return '';

  const languageHint =
    lang === 'kh'
      ? 'Keep Khmer text in Khmer; do not translate.'
      : 'Keep the original language; do not translate unless mixed.';

  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Clean and professionally format this lesson as Markdown.

Requirements:
- Fix line breaks and spacing
- Use clear heading hierarchy (# ## ###)
- Use markdown lists, **bold**, preserve code in fenced blocks
- ${languageHint}
- Return ONLY formatted Markdown — no explanation

Document:

${input}`,
    config: {
      systemInstruction: 'You format Markdown documents. Output Markdown only.',
      temperature: 0.15,
    },
  });

  const raw = stripFence(response.text || '');
  if (!raw) throw new Error('AI_EMPTY_RESPONSE');
  return raw;
}

export async function geminiTranslateMarkdown(content, targetLang) {
  const input = (content || '').trim();
  if (!input) return '';

  const segments = splitMarkdownSegments(input);
  const ai = getClient();

  const proseJobs = segments
    .map((seg, index) => ({ seg, index }))
    .filter(({ seg }) => seg.type === 'prose' && seg.text.trim());

  if (!proseJobs.length) return input;

  await mapConcurrent(proseJobs, TRANSLATE_CONCURRENCY, async ({ seg, index }) => {
    const translated = await translateProseChunk(ai, seg.text, targetLang);
    segments[index] = { type: 'prose', text: translated };
  });

  return segments.map((seg) => seg.text).join('');
}

export async function geminiGenerateLesson({ topic, lang, level, includeQuiz }) {
  const ai = getClient();
  const language = lang === 'kh' ? 'Khmer' : 'English';
  const quizHint = includeQuiz
    ? 'Include one quiz block at the end as a fenced ```quiz block with JSON: {"question":"...","options":["..."],"answer":0}'
    : 'Do not include a quiz.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a complete lesson document in ${language} about: "${topic}".

Audience level: ${level || 'general students'}.

Structure:
- Title (# heading)
- Introduction
- 3-5 sections with ## headings
- Examples where useful
- Summary / key points
- Use Markdown: lists, **bold**, code fences for code examples
- ${quizHint}

Return ONLY the lesson Markdown.`,
    config: {
      systemInstruction: 'You write clear educational lessons in Markdown.',
      temperature: 0.35,
    },
  });

  const raw = stripFence(response.text || '');
  if (!raw) throw new Error('AI_EMPTY_RESPONSE');
  return raw;
}

export async function geminiGenerateImage(prompt) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: '1:1' } },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data) return part.inlineData.data;
  }
  throw new Error('AI_IMAGE_EMPTY');
}
