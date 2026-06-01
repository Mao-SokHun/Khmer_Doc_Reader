/** Detect stored lesson body that was saved as HTML from the rich editor. */
export function isHtmlContent(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test((content || '').trim());
}

function htmlBrBlobToMarkdown(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isBrokenMarkdownHtml(html: string): boolean {
  if (!html.includes('<br')) return false;
  return /###|```|^\s*---\s*$/m.test(html) || html.includes('* **');
}

export function repairContentForRender(content: string): string {
  const raw = (content || '').trim();
  if (!raw) return '';
  if (!isHtmlContent(raw)) return raw;
  if (isBrokenMarkdownHtml(raw)) return htmlBrBlobToMarkdown(raw);
  return raw;
}

export function shouldRenderAsMarkdown(content: string): boolean {
  const repaired = repairContentForRender(content);
  return !isHtmlContent(repaired);
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function markdownToEditorHtml(value: string): string {
  const lines = (value || '').split('\n');
  const out: string[] = [];
  let inFence = false;
  let fenceLang = 'text';
  let fenceLines: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      out.push(listType === 'ul' ? '</ul>' : '</ol>');
      listType = null;
    }
  };

  const flushFence = () => {
    if (!inFence) return;
    const code = escapeHtml(fenceLines.join('\n'));
    const lang = fenceLang || 'text';
    out.push(
      `<div data-code-block-wrap="true" data-code-language="${lang}">` +
        `<div contenteditable="false">${lang.toUpperCase()}</div>` +
        `<pre data-code-block="true"><code>${code}</code></pre>` +
        `</div>`
    );
    inFence = false;
    fenceLines = [];
    fenceLang = 'text';
  };

  for (const line of lines) {
    const fenceOpen = line.match(/^```(\w+)?\s*$/);
    if (fenceOpen) {
      closeList();
      if (inFence) flushFence();
      else {
        inFence = true;
        fenceLang = (fenceOpen[1] || 'text').toLowerCase();
        fenceLines = [];
      }
      continue;
    }
    if (inFence) {
      fenceLines.push(line);
      continue;
    }

    if (/^---\s*$/.test(line.trim())) {
      closeList();
      out.push('<hr>');
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const text = heading[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      out.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.+)$/);
    if (ul) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul>');
        listType = 'ul';
      }
      const text = ul[1].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      out.push(`<li>${text}</li>`);
      continue;
    }

    const ol = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ol) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol>');
        listType = 'ol';
      }
      const text = ol[1].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      out.push(`<li>${text}</li>`);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    closeList();
    const text = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out.push(`<p>${text}</p>`);
  }

  closeList();
  flushFence();
  return out.join('\n');
}

export function sanitizeExportDom(root: HTMLElement, options?: { keepCodeStyles?: boolean }): void {
  root.querySelectorAll('pre, code').forEach((el) => {
    if (el.innerHTML.includes('<br')) {
      el.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    }
  });

  root.querySelectorAll('[data-export-code-block]').forEach((block) => {
    let lang = (block.getAttribute('data-export-code-lang') || '').toLowerCase();
    const pre = block.querySelector('pre');
    const codeText = pre?.textContent || '';
    if (pre) {
      const cleaned = codeText.replace(/^(sql|javascript|typescript|json|html|css|bash)\s*\n/i, '');
      if (cleaned !== codeText && pre.firstChild) {
        pre.textContent = cleaned;
      }
    }
    if (!lang || lang === 'text') {
      if (/^\s*(select|insert|update|delete|with)\b/i.test(codeText)) lang = 'sql';
      else if (/^\s*[\[{]/.test(codeText)) lang = 'json';
      else if (/^\s*<!doctype|^\s*<html/i.test(codeText)) lang = 'html';
      else if (/^\s*(function|const|let|var|import)\b/.test(codeText)) lang = 'javascript';
    }
    block.setAttribute('data-export-code-lang', lang || 'text');
  });

  if (!options?.keepCodeStyles) {
    root.querySelectorAll('[data-export-code-block] [style]').forEach((el) => {
      (el as HTMLElement).removeAttribute('style');
    });
  }

  root.querySelectorAll('[data-code-block-wrap]').forEach((wrap) => {
    const lang = wrap.getAttribute('data-code-language') || 'text';
    const pre = wrap.querySelector('pre');
    if (!pre) return;
    const shell = document.createElement('div');
    shell.setAttribute('data-export-code-block', '');
    shell.setAttribute('data-export-code-lang', lang);
    const preClone = pre.cloneNode(true) as HTMLPreElement;
    if (preClone.innerHTML.includes('<br')) {
      preClone.innerHTML = preClone.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    }
    shell.appendChild(preClone);
    wrap.replaceWith(shell);
  });
}

export type ExportLang = 'kh' | 'en';

export function normalizeInlineMath(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current.parentElement?.closest('.katex')) continue;
    textNodes.push(current as Text);
  }

  const apply = (value: string) =>
    value
      .replace(/\$\\rightarrow\$/g, '→')
      .replace(/\$\\leftarrow\$/g, '←')
      .replace(/\$\\times\$/g, '×')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\times/g, '×')
      .replace(/\s{2,}/g, ' ');

  for (const node of textNodes) {
    const next = apply(node.textContent || '');
    if (next !== node.textContent) node.textContent = next;
  }
}

function cleanExportHeadings(root: HTMLElement) {
  root.querySelectorAll('h1, h2, h3').forEach((heading) => {
    const el = heading as HTMLElement;
    const text = (el.textContent || '').trim();
    const cleaned = text.replace(/^\*\*+|\*\*+$/g, '').trim();
    if (cleaned && cleaned !== text) el.textContent = cleaned;
  });
}

function removeDuplicateTitleHeading(root: HTMLElement, titleNorm: string) {
  if (!titleNorm) return;
  const firstH1 = root.querySelector('h1');
  const firstH1Text = firstH1?.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
  if (firstH1 && firstH1Text === titleNorm) firstH1.remove();
}

/** Light cleanup on a clone of the on-screen preview before PDF render. */
export function prepareExportDomForPdf(root: HTMLElement, lessonTitle?: string) {
  sanitizeExportDom(root, { keepCodeStyles: true });
  normalizeInlineMath(root);
  cleanExportHeadings(root);

  root
    .querySelectorAll('button, [role="button"], [aria-label*="Copy"], [aria-label*="Download"]')
    .forEach((el) => el.remove());

  root.querySelectorAll('[data-export-code-block] > div:first-child').forEach((el) => {
    if (el.querySelector('button')) el.remove();
  });

  if (lessonTitle) {
    const titleNorm = lessonTitle.replace(/\s+/g, ' ').trim().toLowerCase();
    removeDuplicateTitleHeading(root, titleNorm);
  }
}
