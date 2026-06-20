import { getLessonOutlineHeadings } from './lessonContent';
import type { Lesson } from '../types';

export type SearchResult = {
  lessonId: string;
  lessonTitle: string;
  matchType: 'title' | 'content' | 'heading';
  snippet: string;
  headingId?: string;
};

function snippetAround(text: string, index: number, radius = 60): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
}

export function searchLessons(lessons: Lesson[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const lesson of lessons) {
    const title = lesson.title || '';
    if (title.toLowerCase().includes(q)) {
      results.push({
        lessonId: lesson.id,
        lessonTitle: title,
        matchType: 'title',
        snippet: title,
      });
    }

    for (const heading of getLessonOutlineHeadings(lesson.content)) {
      if (heading.text.toLowerCase().includes(q)) {
        results.push({
          lessonId: lesson.id,
          lessonTitle: title,
          matchType: 'heading',
          snippet: heading.text,
          headingId: heading.id,
        });
      }
    }

    const content = lesson.content || '';
    const idx = content.toLowerCase().indexOf(q);
    if (idx >= 0 && !results.some((r) => r.lessonId === lesson.id && r.matchType === 'content')) {
      results.push({
        lessonId: lesson.id,
        lessonTitle: title,
        matchType: 'content',
        snippet: snippetAround(content, idx),
      });
    }
  }

  return results.slice(0, 40);
}
