import { LESSON_TEMPLATES, type LessonTemplate } from '../lib/templates';
import { X } from 'lucide-react';

type TemplatePickerModalProps = {
  open: boolean;
  onClose: () => void;
  lang: 'kh' | 'en';
  onPick: (template: LessonTemplate) => void;
};

export function TemplatePickerModal({ open, onClose, lang, onPick }: TemplatePickerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {lang === 'kh' ? 'ជ្រើសគំរូឯកសារ' : 'Choose a template'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {lang === 'kh' ? 'របាយការណ៍ · គម្រោង · មេរៀន · ផ្សេងៗ' : 'Report · Project · Lesson · more'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-2 overflow-y-auto px-6 py-4 custom-scrollbar">
          {LESSON_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onPick(template);
                onClose();
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
            >
              <p className="font-semibold text-base text-slate-900 dark:text-slate-100">
                {lang === 'kh' ? template.titleKh : template.titleEn}
              </p>
              {(template.descKh || template.descEn) && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {lang === 'kh' ? template.descKh : template.descEn}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
