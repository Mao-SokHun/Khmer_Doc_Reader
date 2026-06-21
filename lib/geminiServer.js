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
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Translate this document to ${targetLang}. Preserve Markdown structure, code blocks, links, and quiz JSON blocks exactly.

Document:

${content}`,
    config: { temperature: 0.2 },
  });
  const raw = stripFence(response.text || '');
  if (!raw) throw new Error('AI_EMPTY_RESPONSE');
  return raw;
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
