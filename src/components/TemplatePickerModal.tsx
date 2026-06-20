import {
  LESSON_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type LessonTemplate,
} from '../lib/templates';
import { CODE_SUBCATEGORIES, type CodeSubcategory } from '../lib/codeLessonTemplates';
import {
  BookOpen,
  Box,
  Braces,
  ClipboardList,
  Code2,
  Coffee,
  Database,
  FileCode2,
  FileText,
  FolderKanban,
  GitBranch,
  Globe,
  GraduationCap,
  HelpCircle,
  Layers,
  Package,
  Server,
  Sparkles,
  Terminal,
  User,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type TemplatePickerModalProps = {
  open: boolean;
  onClose: () => void;
  lang: 'kh' | 'en';
  onPick: (template: LessonTemplate) => void;
};

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  'code-doc': Code2,
  sql: Database,
  javascript: FileCode2,
  typescript: FileCode2,
  python: FileCode2,
  java: Coffee,
  csharp: FileCode2,
  cpp: FileCode2,
  go: FileCode2,
  rust: FileCode2,
  php: FileCode2,
  ruby: FileCode2,
  swift: FileCode2,
  kotlin: FileCode2,
  'html-css': Globe,
  bash: Terminal,
  react: Layers,
  vue: Layers,
  angular: Layers,
  nextjs: Layers,
  nodejs: Server,
  django: Server,
  flask: Server,
  spring: Server,
  laravel: Server,
  dotnet: Server,
  mongodb: Database,
  docker: Box,
  git: GitBranch,
  blank: FileText,
  resume: User,
  report: ClipboardList,
  project: FolderKanban,
  'lesson-plan': GraduationCap,
  quiz: HelpCircle,
  homework: BookOpen,
  meeting: Users,
};

const SUBCATEGORY_ICONS: Record<CodeSubcategory, LucideIcon> = {
  language: FileCode2,
  framework: Workflow,
  library: Package,
};

export function TemplatePickerModal({ open, onClose, lang, onPick }: TemplatePickerModalProps) {
  if (!open) return null;

  const isKh = lang === 'kh';

  const grouped = TEMPLATE_CATEGORIES.map((category) => ({
    ...category,
    templates: LESSON_TEMPLATES.filter((t) => t.category === category.id),
  })).filter((group) => group.templates.length > 0);

  const renderTemplateCard = (template: LessonTemplate) => {
    const Icon = TEMPLATE_ICONS[template.id] ?? FileText;
    const featured = template.id === 'code-doc';

    return (
      <button
        key={template.id}
        type="button"
        onClick={() => {
          onPick(template);
          onClose();
        }}
        className={
          featured
            ? 'group rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-50 to-slate-50 p-4 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-blue-600/60 dark:from-blue-950/30 dark:to-slate-900 dark:hover:border-blue-500'
            : 'group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition-all hover:border-blue-300 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-700 dark:hover:bg-slate-800'
        }
      >
        <div className="flex items-start gap-3">
          <div
            className={
              featured
                ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-blue-400 dark:ring-slate-600'
            }
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isKh ? template.titleKh : template.titleEn}
              </p>
              {featured ? (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {isKh ? 'Paste code' : 'Paste code'}
                </span>
              ) : null}
            </div>
            {(template.descKh || template.descEn) && (
              <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-400">
                {isKh ? template.descKh : template.descEn}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(90vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/60 px-6 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <Sparkles size={14} />
                {isKh ? 'គំរូរួចរាល់' : 'Ready-made templates'}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isKh ? 'ជ្រើសគំរូឯកសារ' : 'Choose a template'}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {isKh
                  ? 'ភាសា · Framework · Library — ទម្រង់ដូច SQL lesson (sections + code blocks)'
                  : 'Languages · Frameworks · Libraries — same layout as SQL lesson'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          <div className="space-y-7">
            {grouped.map((group) => (
              <section key={group.id}>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {group.id === 'code' ? <Braces size={16} className="text-blue-500" /> : null}
                  {isKh ? group.labelKh : group.labelEn}
                </h4>

                {group.id === 'code' ? (
                  <div className="space-y-5">
                    {CODE_SUBCATEGORIES.map((sub) => {
                      const items = group.templates.filter((t) => {
                        if (sub.id === 'language') {
                          return (
                            t.codeSubcategory === 'language' ||
                            t.id === 'code-doc' ||
                            t.id === 'sql'
                          );
                        }
                        return t.codeSubcategory === sub.id;
                      });

                      if (!items.length) return null;

                      const SubIcon = SUBCATEGORY_ICONS[sub.id];
                      return (
                        <div key={sub.id}>
                          <h5 className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <SubIcon size={14} className="text-blue-400" />
                            {isKh ? sub.labelKh : sub.labelEn}
                          </h5>
                          <div className="grid gap-3 sm:grid-cols-2">{items.map(renderTemplateCard)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.templates.map(renderTemplateCard)}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {isKh
              ? 'ជ្រើសគំរូ → កែសម្រួល → Paste code → រក្សាទុក'
              : 'Pick template → Edit → Paste code → Save'}
          </p>
        </div>
      </div>
    </div>
  );
}
