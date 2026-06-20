import { useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../i18n';

type GenerateLessonModalProps = {
  lang: Language;
  folderId: string;
  open: boolean;
  onClose: () => void;
  onGenerated: (title: string, contentHtml: string) => void;
  generate: (opts: {
    topic: string;
    lang: Language;
    level: string;
    includeQuiz: boolean;
  }) => Promise<{ title: string; contentHtml: string }>;
};

export function GenerateLessonModal({
  lang,
  open,
  onClose,
  onGenerated,
  generate,
}: GenerateLessonModalProps) {
  const t = translations[lang];
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(lang === 'kh' ? 'សិស្សទូទៅ' : 'General students');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await generate({ topic: topic.trim(), lang, level, includeQuiz });
      onGenerated(result.title, result.contentHtml);
      setTopic('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <Sparkles size={18} className="text-amber-500" />
            {t.generateLessonTitle}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-slate-700 dark:text-slate-300">{t.generateLessonTopic}</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.generateLessonTopicPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-slate-700 dark:text-slate-300">{t.generateLessonLevel}</span>
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input type="checkbox" checked={includeQuiz} onChange={(e) => setIncludeQuiz(e.target.checked)} />
            {t.generateLessonIncludeQuiz}
          </label>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={busy || !topic.trim()}
            onClick={() => void handleGenerate()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {t.generate}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
