import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchLessons, type SearchResult } from '../lib/search';
import type { Lesson } from '../types';
import { cn } from '../lib/utils';

type GlobalSearchModalProps = {
  open: boolean;
  onClose: () => void;
  lessons: Lesson[];
  lang: 'kh' | 'en';
  onSelect: (result: SearchResult) => void;
};

export function GlobalSearchModal({ open, onClose, lessons, lang, onSelect }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchLessons(lessons, query);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center bg-slate-900/50 p-4 pt-[12vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'kh' ? 'ស្វែងរកមេរៀន, heading, អត្ថបទ...' : 'Search lessons, headings, content...'}
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-100"
          />
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
          {query.trim() && results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              {lang === 'kh' ? 'រកមិនឃើញ' : 'No results'}
            </p>
          ) : null}
          {results.map((result, idx) => (
            <button
              key={`${result.lessonId}-${result.matchType}-${idx}`}
              type="button"
              onClick={() => {
                onSelect(result);
                onClose();
              }}
              className="block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.lessonTitle}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', result.matchType === 'heading' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')}>
                  {result.matchType}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">{result.snippet}</p>
            </button>
          ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800">
          {lang === 'kh' ? 'Ctrl+K ដើម្បីបើកស្វែងរក' : 'Ctrl+K to open search'}
        </div>
      </div>
    </div>
  );
}
