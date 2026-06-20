import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getLessonOutlineHeadings, repairContentForRender } from '../lib/lessonContent';
import { cn } from '../lib/utils';

type PresentationModeProps = {
  content: string;
  title: string;
  lang: 'kh' | 'en';
  onClose: () => void;
};

function splitContentByHeadings(content: string): Array<{ heading: string; body: string }> {
  const headings = getLessonOutlineHeadings(content);
  if (headings.length === 0) {
    return [{ heading: '', body: content }];
  }

  const slides: Array<{ heading: string; body: string }> = [];
  let remaining = content;

  for (const h of headings) {
    const mdPattern = new RegExp(`^#{1,6}\\s+\\*{0,2}${escapeRegex(h.text.replace(/\*\*/g, ''))}`, 'm');
    const idx = remaining.search(mdPattern);
    if (idx < 0) continue;
    const before = remaining.slice(0, idx).trim();
    if (before && slides.length === 0) {
      slides.push({ heading: '', body: before });
    }
    remaining = remaining.slice(idx);
    const nextHeading = remaining.indexOf('\n#', 1);
    const chunk = nextHeading >= 0 ? remaining.slice(0, nextHeading) : remaining;
    const body = chunk.replace(/^#{1,6}\s+.+\n?/, '').trim();
    slides.push({ heading: h.text, body });
    remaining = nextHeading >= 0 ? remaining.slice(nextHeading + 1) : '';
  }

  return slides.length > 0 ? slides : [{ heading: '', body: content }];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function PresentationMode({ content, title, lang, onClose }: PresentationModeProps) {
  const slides = useMemo(() => splitContentByHeadings(repairContentForRender(content)), [content]);
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, slides.length]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            {lang === 'kh' ? 'របៀបបង្រៀន' : 'Presentation'}
          </p>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-800">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
        {slide?.heading ? (
          <h3 className="mb-8 max-w-4xl text-3xl font-bold leading-tight text-blue-200">{slide.heading}</h3>
        ) : null}
        <div className="max-w-4xl whitespace-pre-wrap text-left text-lg leading-relaxed text-slate-200">
          {slide?.body || content}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={cn('inline-flex items-center gap-2 rounded-lg px-4 py-2', index === 0 ? 'opacity-40' : 'hover:bg-slate-800')}
        >
          <ChevronLeft size={18} />
          {lang === 'kh' ? 'មុន' : 'Prev'}
        </button>
        <span className="text-sm text-slate-400">
          {index + 1} / {slides.length}
        </span>
        <button
          type="button"
          disabled={index >= slides.length - 1}
          onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2',
            index >= slides.length - 1 ? 'opacity-40' : 'hover:bg-slate-800'
          )}
        >
          {lang === 'kh' ? 'បន្ទាប់' : 'Next'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function PresentationModePlaceholder() {
  return null;
}
