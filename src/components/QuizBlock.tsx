import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

type QuizBlockProps = {
  code: string;
  lang?: 'kh' | 'en';
};

type QuizData = {
  question: string;
  options: string[];
  answer: number;
};

function parseQuiz(code: string): QuizData | null {
  try {
    const data = JSON.parse(code.trim()) as QuizData;
    if (!data.question || !Array.isArray(data.options) || typeof data.answer !== 'number') return null;
    return data;
  } catch {
    return null;
  }
}

export function QuizBlock({ code, lang = 'kh' }: QuizBlockProps) {
  const quiz = useMemo(() => parseQuiz(code), [code]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  if (!quiz) {
    return (
      <pre className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        Invalid quiz JSON
      </pre>
    );
  }

  const isCorrect = checked && selected === quiz.answer;

  return (
    <div
      className="my-4 rounded-xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-950/40"
      data-quiz-block
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
        {lang === 'kh' ? 'Quiz' : 'Quiz'}
      </p>
      <p className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option, idx) => {
          const active = selected === idx;
          const showCorrect = checked && idx === quiz.answer;
          const showWrong = checked && active && idx !== quiz.answer;
          return (
            <button
              key={`${option}-${idx}`}
              type="button"
              onClick={() => !checked && setSelected(idx)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                active ? 'border-blue-400 bg-white dark:bg-slate-900' : 'border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/50',
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/30',
                showWrong && 'border-red-400 bg-red-50 dark:bg-red-950/30'
              )}
            >
              <span>{option}</span>
              {showCorrect ? <Check size={16} className="text-green-600" /> : null}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button
          type="button"
          disabled={selected === null}
          onClick={() => setChecked(true)}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {lang === 'kh' ? 'ពិនិត្យចម្លើយ' : 'Check answer'}
        </button>
      ) : (
        <p className={cn('mt-4 text-sm font-semibold', isCorrect ? 'text-green-600' : 'text-red-600')}>
          {isCorrect
            ? lang === 'kh'
              ? '✅ ត្រឹមត្រូវ!'
              : '✅ Correct!'
            : lang === 'kh'
              ? '❌ មិនត្រឹមត្រូវ — សាកម្តងទៀត'
              : '❌ Incorrect — try again'}
        </p>
      )}
    </div>
  );
}
