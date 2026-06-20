import { getLessonOutlineHeadings } from './lessonContent';

/** Build markdown table-of-contents from document headings. */
export function buildTableOfContentsMarkdown(content: string, lang: 'kh' | 'en' = 'kh'): string {
  const headings = getLessonOutlineHeadings(content);
  if (headings.length === 0) return '';

  const title = lang === 'kh' ? '## តារាងមាតិកា' : '## Table of Contents';
  const lines = headings.map((h) => `- ${h.text}`);
  return `${title}\n\n${lines.join('\n')}\n\n---\n\n`;
}

/** Insert TOC after first heading or at top if none. */
export function insertTableOfContents(content: string, lang: 'kh' | 'en' = 'kh'): string {
  const toc = buildTableOfContentsMarkdown(content, lang);
  if (!toc) return content;
  if (/##\s*(table of contents|តារាងមាតិកា)/i.test(content)) return content;
  return `${toc}${content}`;
}
