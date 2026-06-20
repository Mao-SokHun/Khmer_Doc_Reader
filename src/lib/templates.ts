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
  { id: 'resume', titleKh: 'របាយការណ៍ជីវភាព', titleEn: 'Resume / CV', descKh: 'បទពិសោធន៍ ការអប់រំ ជំនាញ', descEn: 'CV with experience & skills' },
  { id: 'report', titleKh: 'របាយការណ៍', titleEn: 'Report', descKh: 'របាយការណ៍ការងារ ឬលទ្ធផល', descEn: 'Work or progress report' },
  { id: 'project', titleKh: 'គម្រោង', titleEn: 'Project', descKh: 'ផែនការ តួនាទី ហានិភ័យ', descEn: 'Project plan with timeline & roles' },
  { id: 'lesson-plan', titleKh: 'សឥ្ធាកម្មមេរៀន', titleEn: 'Lesson Plan', descKh: 'គោលបំណង សកម្មភាព វាយតម្លៃ', descEn: 'Objectives, activities, assessment' },
  { id: 'sql', titleKh: 'មេរៀនភាសា SQL', titleEn: 'SQL Lesson', descKh: 'សំណួរ SQL និងប្រតិបត្តិការ', descEn: 'SQL queries & operators' },
  { id: 'quiz', titleKh: 'មេរៀន + សំណួរក្រេប', titleEn: 'Lesson with Quiz', descKh: 'មេរៀនជាមួយសំណួរក្រេប', descEn: 'Lesson content with quiz blocks' },
  { id: 'homework', titleKh: 'កិច្ចការផ្ទះ', titleEn: 'Homework', descKh: 'កិច្ចការផ្ទះសិស្ស', descEn: 'Homework assignment sheet' },
  { id: 'meeting', titleKh: 'កំណត់ត្រាប្រជុំ', titleEn: 'Meeting Notes', descKh: 'របៀបវារៈ និងកិច្ចការ', descEn: 'Agenda, notes, action items' },
];

export function getTemplateContent(template: LessonTemplate, lang: 'kh' | 'en'): string {
  return getMarkdownTemplate(template.id, lang);
}
