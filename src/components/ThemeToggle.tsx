import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme, type ThemeMode } from '../lib/theme';

type ThemeToggleProps = {
  lightLabel: string;
  darkLabel: string;
};

export function ThemeToggle({ lightLabel, darkLabel }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options: Array<{ mode: ThemeMode; icon: typeof Sun; label: string }> = [
    { mode: 'light', icon: Sun, label: lightLabel },
    { mode: 'dark', icon: Moon, label: darkLabel },
  ];

  return (
    <div
      className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800"
      role="group"
      aria-label={lightLabel}
    >
      {options.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => setTheme(mode)}
          title={label}
          aria-pressed={theme === mode}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md transition-all',
            theme === mode
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
