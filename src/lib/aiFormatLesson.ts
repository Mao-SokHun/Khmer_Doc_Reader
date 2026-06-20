import { GoogleGenAI } from '@google/genai';
import {
  contentToPlainMarkdown,
  formatLessonContent,
  markdownToEditorHtml,
  normalizeImportedMarkdown,
} from './lessonContent';

const PLACEHOLDER_KEYS = new Set(['', 'MY_GEMINI_API_KEY', 'your_key', 'your_gemini_api_key']);

export function isGeminiConfigured(): boolean {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(key && !PLACEHOLDER_KEYS.has(key));
}

function stripAiMarkdownFence(text: string): string {
  const trimmed = text.trim();
  const wrapped = trimmed.match(/^```(?:markdown|md|text)?\s*\r?\n([\s\S]*?)\r?\n```\s*$/i);
  if (wrapped) return wrapped[1].trim();
  return trimmed;
}

export async function formatLessonMarkdownWithAi(sourceMarkdown: string, lang: 'kh' | 'en'): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_KEY_MISSING');
  }

  const input = (sourceMarkdown || '').trim();
  if (!input) return '';

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const languageHint =
    lang === 'kh'
      ? 'Keep the document language Khmer where it is already Khmer; do not translate.'
      : 'Keep the original language; do not translate unless the source is mixed.';

  const prompt = `Clean and professionally format this lesson/document as Markdown.

Requirements:
- Fix line breaks and spacing: one blank line between sections, no triple+ empty lines, no broken mid-sentence wraps
- Use clear heading hierarchy (# ## ###) for titles and sections
- Use markdown bullet lists (- item) or numbered lists (1. item) — not raw "*" alone on lines
- Use **bold** for labels/emphasis where appropriate
- Preserve ALL code exactly inside fenced blocks (\`\`\`lang ... \`\`\`)
- Preserve emojis, links, tables, and quiz blocks if present
- ${languageHint}
- Return ONLY the formatted Markdown body — no intro, no explanation, no outer \`\`\`markdown fence

Document to format:

${input}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction:
        'You are an expert technical writer and Markdown formatter. Output clean, publication-ready Markdown only.',
      temperature: 0.15,
    },
  });

  const raw = stripAiMarkdownFence((response.text || '').trim());
  if (!raw) throw new Error('AI_EMPTY_RESPONSE');
  return normalizeImportedMarkdown(raw);
}

/** Format lesson to editor HTML — uses Gemini when API key is configured. */
export async function formatLessonWithAiHtml(content: string, lang: 'kh' | 'en'): Promise<string> {
  const md = contentToPlainMarkdown(content);
  if (!md) return (content || '').trim();

  if (isGeminiConfigured()) {
    const aiMd = await formatLessonMarkdownWithAi(md, lang);
    return markdownToEditorHtml(aiMd);
  }

  return formatLessonContent(content);
}
