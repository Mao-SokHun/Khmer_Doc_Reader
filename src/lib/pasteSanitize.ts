/** Normalize clipboard HTML / plain text before inserting into the editor. */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const LAYOUT_STYLE_KEYS = new Set([
  'column-count',
  'columns',
  'column-width',
  'column-gap',
  'display',
  'flex',
  'flex-direction',
  'flex-wrap',
  'grid',
  'grid-template-columns',
  'float',
  'position',
  'width',
  'max-width',
  'min-width',
  'table-layout',
  'white-space',
  'vertical-align',
]);

function stripLayoutStyles(el: HTMLElement) {
  const raw = el.getAttribute('style');
  if (!raw) return;

  const kept = raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.split(':')[0]?.trim().toLowerCase();
      return key && !LAYOUT_STYLE_KEYS.has(key);
    });

  if (kept.length) el.setAttribute('style', kept.join('; '));
  else el.removeAttribute('style');
}

function maxTableColumns(table: HTMLTableElement): number {
  let maxCols = 0;
  table.querySelectorAll('tr').forEach((row) => {
    maxCols = Math.max(maxCols, row.querySelectorAll('td, th').length);
  });
  return maxCols;
}

function tableRowsToPlain(table: HTMLTableElement): string {
  const lines: string[] = [];
  table.querySelectorAll('tr').forEach((row) => {
    const cells = [...row.querySelectorAll('td, th')]
      .map((cell) => cell.textContent?.replace(/\s+/g, ' ').trim() || '')
      .filter(Boolean);
    if (cells.length) lines.push(cells.join(' '));
  });
  return lines.join('\n');
}

function flattenWideTables(root: HTMLElement) {
  root.querySelectorAll('table').forEach((table) => {
    const cols = maxTableColumns(table);
    if (cols <= 2) return;

    const plain = tableRowsToPlain(table);
    const replacement = document.createElement('div');
    replacement.innerHTML = plainTextToEditorHtml(plain);
    table.replaceWith(...Array.from(replacement.childNodes));
  });
}

/** Turn plain clipboard text into safe editor paragraphs. */
export function plainTextToEditorHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.trim()) return '<p><br></p>';

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph);
      const withBreaks = escaped.replace(/\n/g, '<br>');
      return `<p>${withBreaks || '<br>'}</p>`;
    })
    .join('');
}

/** Detect HTML that tends to render as broken multi-column strips in contentEditable. */
export function shouldPasteAsPlainText(html: string, plainText: string): boolean {
  if (!html.trim()) return true;

  const lower = html.toLowerCase();
  if (
    lower.includes('column-count') ||
    lower.includes('mso-') ||
    /display\s*:\s*(flex|inline-flex|grid)/.test(lower)
  ) {
    return true;
  }

  if (/<table[\s>]/i.test(html)) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    for (const table of tmp.querySelectorAll('table')) {
      if (maxTableColumns(table) > 2) return true;
    }
  }

  const spanCount = (html.match(/<span\b/gi) || []).length;
  if (spanCount > 40 && plainText.length < 8000) return true;

  return false;
}

/** Strip layout-heavy markup while keeping basic inline formatting. */
export function sanitizePastedHtml(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = html;

  root.querySelectorAll('script, style, meta, link, head, title').forEach((node) => node.remove());

  root.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    stripLayoutStyles(node);
    node.removeAttribute('width');
    node.removeAttribute('height');
    node.removeAttribute('valign');
    node.removeAttribute('align');
    if (node.getAttribute('contenteditable') === 'false') {
      node.removeAttribute('contenteditable');
    }
  });

  flattenWideTables(root);

  root.querySelectorAll('div, span').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.closest('[data-code-block-wrap]')) return;
    if (node.childElementCount === 0 && !node.textContent?.trim()) {
      node.remove();
    }
  });

  const htmlOut = root.innerHTML.trim();
  if (!htmlOut) return '<p><br></p>';

  if (!/<(?:p|h[1-6]|ul|ol|li|blockquote|pre|div|table)\b/i.test(htmlOut)) {
    const plain = root.textContent?.replace(/\r\n/g, '\n') || '';
    return plainTextToEditorHtml(plain);
  }

  return htmlOut;
}
