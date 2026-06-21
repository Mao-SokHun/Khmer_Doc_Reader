import {
  getMarkdownTemplate,
  type MarkdownTemplateId,
} from './markdownTemplates';
import {
  CODE_TEMPLATE_DEFS,
  type CodeSubcategory,
} from './codeLessonTemplates';

export type TemplateCategory = 'code' | 'document' | 'lesson' | 'general';

export type LessonTemplate = {
  id: MarkdownTemplateId;
  category: TemplateCategory;
  codeSubcategory?: CodeSubcategory;
  titleKh: string;
  titleEn: string;
  descKh?: string;
  descEn?: string;
};

export const TEMPLATE_CATEGORIES: Array<{
  id: TemplateCategory;
  labelKh: string;
  labelEn: string;
}> = [
  { id: 'document', labelKh: 'ឯកសារ', labelEn: 'Documents' },
  { id: 'lesson', labelKh: 'មេរៀន', labelEn: 'Lessons' },
  { id: 'general', labelKh: 'ទូទៅ', labelEn: 'General' },
  { id: 'code', labelKh: 'កូដ & Programming', labelEn: 'Code & Programming' },
];

/** Category order in the template picker (programming last). */
export const TEMPLATE_PICKER_CATEGORY_ORDER: TemplateCategory[] = [
  'document',
  'lesson',
  'general',
  'code',
];

export type TemplatePickPayload = {
  template: LessonTemplate;
  title: string;
  content: string;
};

const STATIC_TEMPLATES: LessonTemplate[] = [
  {
    id: 'code-doc',
    category: 'code',
    titleKh: 'ឯកសារកូដ',
    titleEn: 'Code Document',
    descKh: 'Paste / សរសេរ code — JS, Python, SQL, HTML',
    descEn: 'Paste or write code — JS, Python, SQL, HTML',
  },
  {
    id: 'sql',
    category: 'code',
    titleKh: 'មេរៀន SQL',
    titleEn: 'SQL Lesson',
    descKh: 'Query, UNION, EXCEPT, Functions',
    descEn: 'SQL queries & operators',
  },
  {
    id: 'resume',
    category: 'document',
    titleKh: 'របាយការណ៍ជីវភាព',
    titleEn: 'Resume / CV',
    descKh: 'បទពិសោធន៍ ការអប់រំ ជំនាញ',
    descEn: 'CV with experience & skills',
  },
  {
    id: 'report',
    category: 'document',
    titleKh: 'របាយការណ៍',
    titleEn: 'Report',
    descKh: 'របាយការណ៍ការងារ ឬលទ្ធផល',
    descEn: 'Work or progress report',
  },
  {
    id: 'project',
    category: 'document',
    titleKh: 'គម្រោង',
    titleEn: 'Project',
    descKh: 'ផែនការ តួនាទី ហានិភ័យ',
    descEn: 'Project plan with timeline & roles',
  },
  {
    id: 'meeting',
    category: 'document',
    titleKh: 'កំណត់ត្រាប្រជុំ',
    titleEn: 'Meeting Notes',
    descKh: 'របៀបវារៈ និងកិច្ចការ',
    descEn: 'Agenda, notes, action items',
  },
  {
    id: 'lesson-plan',
    category: 'lesson',
    titleKh: 'សន្លឹកមេរៀន',
    titleEn: 'Lesson Plan',
    descKh: 'គោលបំណង សកម្មភាព វាយតម្លៃ',
    descEn: 'Objectives, activities, assessment',
  },
  {
    id: 'quiz',
    category: 'lesson',
    titleKh: 'មេរៀន + សំណួរក្រេប',
    titleEn: 'Lesson with Quiz',
    descKh: 'មេរៀនជាមួយសំណួរក្រេប',
    descEn: 'Lesson content with quiz blocks',
  },
  {
    id: 'homework',
    category: 'lesson',
    titleKh: 'កិច្ចការផ្ទះ',
    titleEn: 'Homework',
    descKh: 'កិច្ចការផ្ទះសិស្ស',
    descEn: 'Homework assignment sheet',
  },
  {
    id: 'blank',
    category: 'general',
    titleKh: 'ឯកសារទទេ',
    titleEn: 'Blank Document',
    descKh: 'ចាប់ផ្ដើមពីទទេ',
    descEn: 'Start from scratch',
  },
];

const CODE_TEMPLATES: LessonTemplate[] = CODE_TEMPLATE_DEFS.map((def) => ({
  id: def.id,
  category: 'code' as const,
  codeSubcategory: def.subcategory,
  titleKh: def.titleKh,
  titleEn: def.titleEn,
  descKh: def.descKh,
  descEn: def.descEn,
}));

export const LESSON_TEMPLATES: LessonTemplate[] = [
  ...STATIC_TEMPLATES.filter((t) => t.category === 'code'),
  ...CODE_TEMPLATES,
  ...STATIC_TEMPLATES.filter((t) => t.category !== 'code'),
];

export function getTemplateContent(template: LessonTemplate, lang: 'kh' | 'en'): string {
  return getMarkdownTemplate(template.id, lang);
}
