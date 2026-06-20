import {
  getMarkdownTemplate,
  type MarkdownTemplateId,
} from './markdownTemplates';

export type LessonTemplate = {
  id: MarkdownTemplateId;
  titleKh: string;
  titleEn: string;
};

export const LESSON_TEMPLATES: LessonTemplate[] = [
  { id: 'blank', titleKh: 'មេរៀនទទេ', titleEn: 'Blank Lesson' },
  { id: 'sql', titleKh: 'មេរៀន SQL', titleEn: 'SQL Lesson' },
  { id: 'quiz', titleKh: 'មេរៀន + Quiz', titleEn: 'Lesson with Quiz' },
  { id: 'homework', titleKh: 'កិច្ចការផ្ទះ', titleEn: 'Homework' },
];

export function getTemplateContent(template: LessonTemplate, lang: 'kh' | 'en'): string {
  return getMarkdownTemplate(template.id, lang);
}
