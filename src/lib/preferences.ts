const FONT_SIZE_KEY = 'khmer-lesson-doc-font-size';
const DEFAULT_FONT_SIZE = 19;

export function loadFontSize(defaultSize = DEFAULT_FONT_SIZE): number {
  const raw = localStorage.getItem(FONT_SIZE_KEY);
  const n = raw ? Number(raw) : defaultSize;
  if (!Number.isFinite(n)) return defaultSize;
  // Bump older saved sizes that were too small for comfortable Khmer reading
  if (n <= 17) return DEFAULT_FONT_SIZE;
  return Math.max(14, Math.min(32, n));
}

export function saveFontSize(size: number): void {
  localStorage.setItem(FONT_SIZE_KEY, String(size));
}
