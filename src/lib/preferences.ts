const FONT_SIZE_KEY = 'khmer-lesson-doc-font-size';

export function loadFontSize(defaultSize = 14): number {
  const raw = localStorage.getItem(FONT_SIZE_KEY);
  const n = raw ? Number(raw) : defaultSize;
  return Number.isFinite(n) ? Math.max(10, Math.min(24, n)) : defaultSize;
}

export function saveFontSize(size: number): void {
  localStorage.setItem(FONT_SIZE_KEY, String(size));
}
