import {
  aiFormatMarkdown,
  aiGenerateImage,
  aiGenerateLesson,
  aiTranslateMarkdown,
  isAiConfigured,
} from './aiClient';
import {
  contentToPlainMarkdown,
  formatLessonContent,
  applyIndentToHtmlString,
  markdownToEditorHtml,
  normalizeImportedMarkdown,
} from './lessonContent';

export { isAiConfigured as isGeminiConfigured };

export async function formatLessonMarkdownWithAi(sourceMarkdown: string, lang: 'kh' | 'en'): Promise<string> {
  const input = (sourceMarkdown || '').trim();
  if (!input) return '';
  const configured = await isAiConfigured();
  if (!configured) throw new Error('GEMINI_KEY_MISSING');
  const raw = await aiFormatMarkdown(input, lang);
  return normalizeImportedMarkdown(raw);
}

export async function formatLessonWithAiHtml(
  content: string,
  lang: 'kh' | 'en'
): Promise<{ html: string; usedAi: boolean }> {
  const md = contentToPlainMarkdown(content);
  if (!md) return { html: (content || '').trim(), usedAi: false };

  if (await isAiConfigured()) {
    try {
      const aiMd = await formatLessonMarkdownWithAi(md, lang);
      return { html: applyIndentToHtmlString(markdownToEditorHtml(aiMd)), usedAi: true };
    } catch {
      /* fall through to local formatter */
    }
  }

  return { html: formatLessonContent(content), usedAi: false };
}

export async function translateLessonMarkdown(content: string, targetLang: string): Promise<string> {
  const md = contentToPlainMarkdown(content);
  if (!md) return content;
  const configured = await isAiConfigured();
  if (!configured) throw new Error('GEMINI_KEY_MISSING');
  const raw = await aiTranslateMarkdown(md, targetLang);
  return normalizeImportedMarkdown(raw);
}

export async function generateLessonMarkdown(options: {
  topic: string;
  lang: 'kh' | 'en';
  level?: string;
  includeQuiz?: boolean;
}): Promise<string> {
  const configured = await isAiConfigured();
  if (!configured) throw new Error('GEMINI_KEY_MISSING');
  const raw = await aiGenerateLesson(options);
  return normalizeImportedMarkdown(raw);
}

export async function generateLessonHtml(options: {
  topic: string;
  lang: 'kh' | 'en';
  level?: string;
  includeQuiz?: boolean;
}): Promise<{ title: string; html: string }> {
  const md = await generateLessonMarkdown(options);
  const titleLine = md.match(/^#\s+(.+)$/m);
  const title = titleLine?.[1]?.trim() || options.topic;
  return { title, html: markdownToEditorHtml(md) };
}

export async function generateImageBase64(prompt: string): Promise<string> {
  const configured = await isAiConfigured();
  if (!configured) throw new Error('GEMINI_KEY_MISSING');
  return aiGenerateImage(prompt);
}
