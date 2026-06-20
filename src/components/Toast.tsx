import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'error' | 'success' | 'info';

export type ToastMessage = {
  id: number;
  text: string;
  type?: ToastType;
};

type ToastStackProps = {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
};

export function ToastStack({ messages, onDismiss }: ToastStackProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message) => (
        <ToastItem key={message.id} message={message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(message.id), 4500);
    return () => window.clearTimeout(timer);
  }, [message.id, onDismiss]);

  const type = message.type ?? 'info';

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm',
        type === 'error' &&
          'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/90 dark:text-red-200',
        type === 'success' &&
          'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/90 dark:text-green-200',
        type === 'info' &&
          'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
      )}
      role="status"
    >
      <span className="flex-1 leading-snug">{message.text}</span>
      <button
        type="button"
        onClick={() => onDismiss(message.id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
