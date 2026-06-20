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
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {lang === 'kh' ? 'ជ្រើសគំរូមេរៀន' : 'Choose a template'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-2">
          {LESSON_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onPick(template);
                onClose();
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-950/30"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {lang === 'kh' ? template.titleKh : template.titleEn}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
