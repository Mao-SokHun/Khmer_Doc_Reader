import {
  getMarkdownTemplate,
  type MarkdownTemplateId,
} from './markdownTemplates';

export type LessonTemplate = {
  id: MarkdownTemplateId;
  titleKh: string;
  titleEn: string;
  descKh?: string;
  descEn?: string;
};

export const LESSON_TEMPLATES: LessonTemplate[] = [
  { id: 'blank', titleKh: 'ឯកសារទទេ', titleEn: 'Blank Document', descKh: 'ចាប់ផ្ដើមពីទទេ', descEn: 'Start from scratch' },
  { id: 'resume', titleKh: 'Resume / CV', titleEn: 'Resume / CV', descKh: 'របាយការណ៍ជីវភាព បទពិសោធន៍ ជំនាញ', descEn: 'CV with experience & skills' },
  { id: 'report', titleKh: 'របាយការណ៍', titleEn: 'Report', descKh: 'របាយការណ៍ការងារ ឬលទ្ធផល', descEn: 'Work or progress report' },
  { id: 'project', titleKh: 'គម្រោង', titleEn: 'Project', descKh: 'គម្រោង timeline តួនាទី ហានិភ័យ', descEn: 'Project plan with timeline & roles' },
  { id: 'lesson-plan', titleKh: 'សឥ្ធាកម្មមេរៀន', titleEn: 'Lesson Plan', descKh: 'គោលបំណង សកម្មភាព វាយតម្លៃ', descEn: 'Objectives, activities, assessment' },
  { id: 'sql', titleKh: 'មេរៀន SQL', titleEn: 'SQL Lesson', descKh: 'Query, UNION, EXCEPT...', descEn: 'SQL queries & operators' },
  { id: 'quiz', titleKh: 'មេរៀន + Quiz', titleEn: 'Lesson with Quiz', descKh: 'មេរៀន + សំណួរ quiz', descEn: 'Lesson content with quiz blocks' },
  { id: 'homework', titleKh: 'កិច្ចការផ្ទះ', titleEn: 'Homework', descKh: 'កិច្ចការផ្ទះ + SQL practice', descEn: 'Homework assignment sheet' },
  { id: 'meeting', titleKh: 'កំណត់ត្រាប្រជុំ', titleEn: 'Meeting Notes', descKh: 'របៀបវារៈ action items', descEn: 'Agenda, notes, action items' },
];

export function getTemplateContent(template: LessonTemplate, lang: 'kh' | 'en'): string {
  return getMarkdownTemplate(template.id, lang);
}
