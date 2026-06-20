import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(enabled: boolean, shortcuts: ShortcutMap) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const combo = `${mod ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${key}`;
      const handler = shortcuts[combo] ?? shortcuts[key];
      if (!handler) return;
      e.preventDefault();
      handler();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, shortcuts]);
}
