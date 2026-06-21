import { useEffect, useState } from 'react';
import {
  getTemplateContent,
  LESSON_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_PICKER_CATEGORY_ORDER,
  type LessonTemplate,
  type TemplatePickPayload,
} from '../lib/templates';
import { CODE_SUBCATEGORIES, type CodeSubcategory } from '../lib/codeLessonTemplates';
import {
  ArrowLeft,
  BookOpen,
  Box,
  Braces,
  ChevronDown,
  ChevronRight,
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
  onPick: (payload: TemplatePickPayload) => void;
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
  const [step, setStep] = useState<'pick' | 'customize'>('pick');
  const [selected, setSelected] = useState<LessonTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [expandedSubs, setExpandedSubs] = useState<Record<CodeSubcategory, boolean>>({
    language: false,
    framework: false,
    library: false,
  });

  const isKh = lang === 'kh';

  useEffect(() => {
    if (open) {
      setStep('pick');
      setSelected(null);
      setCustomTitle('');
      setCustomContent('');
      setCodeExpanded(false);
      setExpandedSubs({ language: false, framework: false, library: false });
    }
  }, [open]);

  if (!open) return null;

  const categoryMap = new Map(TEMPLATE_CATEGORIES.map((c) => [c.id, c]));
  const grouped = TEMPLATE_PICKER_CATEGORY_ORDER.map((id) => {
    const category = categoryMap.get(id);
    if (!category) return null;
    return {
      ...category,
      templates: LESSON_TEMPLATES.filter((t) => t.category === category.id),
    };
  }).filter((group): group is NonNullable<typeof group> => !!group && group.templates.length > 0);

  const codeGroup = grouped.find((g) => g.id === 'code');
  const codeCount = codeGroup?.templates.length ?? 0;

  const openCustomize = (template: LessonTemplate) => {
    setSelected(template);
    setCustomTitle(isKh ? template.titleKh : template.titleEn);
    setCustomContent(getTemplateContent(template, lang));
    setStep('customize');
  };

  const handleCreate = () => {
    if (!selected) return;
    const fallbackTitle = isKh ? selected.titleKh : selected.titleEn;
    onPick({
      template: selected,
      title: customTitle.trim() || fallbackTitle,
      content: customContent,
    });
    onClose();
  };

  const toggleSub = (id: CodeSubcategory) => {
    setExpandedSubs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTemplateCard = (template: LessonTemplate) => {
    const Icon = TEMPLATE_ICONS[template.id] ?? FileText;
    const featured = template.id === 'code-doc';

    return (
      <button
        key={template.id}
        type="button"
        onClick={() => openCustomize(template)}
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
              <p className="mt-1 pl-3 text-sm leading-snug text-slate-600 dark:text-slate-400">
                {isKh ? template.descKh : template.descEn}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderCodeSection = () => {
    if (!codeGroup) return null;

    return (
      <section key="code">
        <button
          type="button"
          onClick={() => setCodeExpanded((v) => !v)}
          className="mb-3 flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-700"
        >
          {codeExpanded ? (
            <ChevronDown size={16} className="shrink-0 text-blue-500" />
          ) : (
            <ChevronRight size={16} className="shrink-0 text-blue-500" />
          )}
          <Braces size={16} className="shrink-0 text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {isKh ? codeGroup.labelKh : codeGroup.labelEn}
          </span>
          <span className="ml-auto rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {codeCount}
          </span>
        </button>

        {codeExpanded ? (
          <div className="space-y-4 pl-1">
            {CODE_SUBCATEGORIES.map((sub) => {
              const items = codeGroup.templates.filter((t) => {
                if (sub.id === 'language') {
                  return (
                    t.codeSubcategory === 'language' || t.id === 'code-doc' || t.id === 'sql'
                  );
                }
                return t.codeSubcategory === sub.id;
              });

              if (!items.length) return null;

              const SubIcon = SUBCATEGORY_ICONS[sub.id];
              const subOpen = expandedSubs[sub.id];

              return (
                <div key={sub.id}>
                  <button
                    type="button"
                    onClick={() => toggleSub(sub.id)}
                    className="mb-2 flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    {subOpen ? (
                      <ChevronDown size={14} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400" />
                    )}
                    <SubIcon size={14} className="text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {isKh ? sub.labelKh : sub.labelEn}
                    </span>
                    <span className="text-xs text-slate-400">({items.length})</span>
                  </button>
                  {subOpen ? (
                    <div className="grid gap-3 sm:grid-cols-2">{items.map(renderTemplateCard)}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="pl-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {isKh
              ? 'ចុចដើម្បីបើក — ភាសា · Framework · Library'
              : 'Click to expand — Languages · Frameworks · Libraries'}
          </p>
        )}
      </section>
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
                {step === 'customize'
                  ? isKh
                    ? 'កែសម្រួលគំរូ'
                    : 'Customize template'
                  : isKh
                    ? 'ជ្រើសគំរូឯកសារ'
                    : 'Choose a template'}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {step === 'customize'
                  ? isKh
                    ? 'ផ្លាស់ប្តូរឈ្មោះ និងខ្លឹមសារមុនបង្កើត — កែបន្ថែមក្នុង editor បានដែរ'
                    : 'Edit title and content before creating — you can keep editing in the editor'
                  : isKh
                    ? 'ឯកសារ · មេរៀន · ទូទៅ — ជ្រើសគំរូ រួចកែបានតាមបំណង'
                    : 'Documents · Lessons · General — pick a template, then customize'}
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

        {step === 'pick' ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="space-y-7">
              {grouped
                .filter((group) => group.id !== 'code')
                .map((group) => (
                  <section key={group.id}>
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {isKh ? group.labelKh : group.labelEn}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.templates.map(renderTemplateCard)}
                    </div>
                  </section>
                ))}
              {renderCodeSection()}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden px-6 py-5">
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="mb-4 inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft size={16} />
              {isKh ? 'ត្រឡប់ជ្រើសគំរូ' : 'Back to templates'}
            </button>

            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isKh ? 'ឈ្មោះមេរៀន' : 'Lesson title'}
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-500/0 transition-shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />

            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isKh ? 'ខ្លឹមសារគំរូ (Markdown)' : 'Template content (Markdown)'}
            </label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              spellCheck={false}
              className="min-h-[min(40vh,320px)] flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-800 outline-none ring-blue-500/0 transition-shadow focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>
        )}

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          {step === 'customize' ? (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep('pick')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {isKh ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                {isKh ? 'បង្កើតមេរៀន' : 'Create lesson'}
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              {isKh
                ? 'ជ្រើសគំរូ → កែសម្រួល → រក្សាទុក'
                : 'Pick template → Customize → Save'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
