import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

type TagsInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export function TagsInput({ tags, onChange, placeholder }: TagsInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,/g, '');
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        >
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="opacity-70 hover:opacity-100">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none dark:text-slate-100"
      />
    </div>
  );
}
