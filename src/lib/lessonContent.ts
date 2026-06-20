/** Detect stored lesson body that was saved as HTML from the rich editor. */
import {
  buildEditorCodeBlockHtml,
  detectCodeLanguage,
  extractMarkdownFromMisplacedCodeBlock,
  htmlCodeBlocksToMarkdown,
  looksLikeCodeBlock,
  looksLikeMarkdownDocument,
  wrapAsMarkdownCodeFence,
} from './codeFormat';

export function isHtmlContent(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test((content || '').trim());
}

function htmlBrBlobToMarkdown(html: string): string {
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Lines like "1. User & Account Management" are section titles, not list items. */
function isNumberedSectionHeader(line: string): boolean {
  const m = line.trim().match(/^(\d+)\.\s+(.+)$/);
  if (!m) return false;
  const title = m[2].trim();
  if (!title || title.length > 140) return false;
  if (/^[-*•]\s/.test(title)) return false;
  // Skip lines that read like sentence steps inside a paragraph
  if (/^[a-z]/.test(title) && title.split(/\s+/).length > 12) return false;
  return true;
}

/** Turn dense plain-text feature lists into headings + bullets. */
export function structurePlainLessonText(raw: string): string {
  const lines = (raw || '').split('\n');
  const out: string[] = [];
  let afterSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      afterSection = false;
      continue;
    }

    if (/^#{1,6}\s/.test(trimmed)) {
      out.push(trimmed);
      afterSection = false;
      continue;
    }

    if (isNumberedSectionHeader(trimmed)) {
      const m = trimmed.match(/^(\d+)\.\s+(.+)$/)!;
      out.push(`## ${m[1]}. ${m[2].trim()}`);
      afterSection = true;
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      out.push(trimmed.replace(/^•\s+/, '- ').replace(/^\*\s+/, '- '));
      afterSection = false;
      continue;
    }

    if (/^\d+\)\s+/.test(trimmed)) {
      out.push(trimmed.replace(/^(\d+\))\s+/, '- '));
      continue;
    }

    // Label lines: "Feature:" or "Features:" followed by text
    const labelMatch = trimmed.match(/^([A-Za-z\u1780-\u17FF][\w\s/&-]{0,40}):\s*(.+)$/);
    if (labelMatch && labelMatch[2].length > 3) {
      out.push(`**${labelMatch[1].trim()}:** ${labelMatch[2].trim()}`);
      afterSection = false;
      continue;
    }

    // Lines under a numbered section → bullet points
    if (afterSection && trimmed.length < 220) {
      out.push(`- ${trimmed}`);
      continue;
    }

    afterSection = false;
    out.push(trimmed);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function plainTextNeedsStructure(text: string): boolean {
  const trimmed = (text || '').trim();
  if (!trimmed) return false;
  if (/^\d+\.\s+\S/m.test(trimmed) && isNumberedSectionHeader(trimmed.split('\n').find((l) => l.trim()) || '')) {
    return true;
  }
  const sectionCount = (trimmed.match(/^\d+\.\s+[A-Z\u1780-\u17FF]/gm) || []).length;
  if (sectionCount >= 2) return true;
  if (/^•\s+/m.test(trimmed)) return true;
  // Many short lines without list markers
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const shortLines = lines.filter((l) => l.length > 0 && l.length < 100 && !/^[-*#]/.test(l));
  if (lines.length >= 6 && shortLines.length / lines.length > 0.6 && !/^\s*[-*]\s/m.test(trimmed)) {
    return true;
  }
  return false;
}

/** Clean messy MD/HTML (Google Docs paste, broken imports) into readable Markdown. */
export function normalizeImportedMarkdown(raw: string): string {
  let text = (raw || '').trim();
  if (!text) return '';

  if (isHtmlContent(text) && (text.includes('<br') || text.includes('<span') || text.includes('<div'))) {
    text = htmlBrBlobToMarkdown(text);
  }

  // Un-indent fenced code blocks that were nested under list items
  text = text.replace(/^[ \t]{1,4}(```)/gm, '$1');

  // Fix broken fences like ```sql<br> → newline after language tag
  text = text.replace(/```(\w*)<br\s*\/?>/gi, '```$1\n');
  text = text.replace(/<br\s*\/?>\s*```/gi, '\n```');

  // Normalize list markers and spacing
  text = text.replace(/^\*\s+/gm, '- ');
  text = text.replace(/^\u2022\s+/gm, '- ');
  text = text.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
  text = text.replace(/\n{3,}/g, '\n\n');

  if (plainTextNeedsStructure(text)) {
    text = structurePlainLessonText(text);
  }

  return text.trim();
}

/** True when text still shows raw Markdown markers (##, **, ```, list *). */
export function plainTextHasMarkdownSyntax(text: string): boolean {
  const trimmed = (text || '').trim();
  if (!trimmed) return false;
  return (
    looksLikeMarkdownDocument(trimmed) ||
    /^#{1,6}\s+/m.test(trimmed) ||
    trimmed.includes('```') ||
    /\*\*[^*\n]+\*\*/.test(trimmed) ||
    /^\s*[-*+]\s+\S/m.test(trimmed)
  );
}

/** Extract readable Markdown from stored lesson HTML or Markdown. */
export function contentToPlainMarkdown(content: string): string {
  const raw = extractMarkdownFromMisplacedCodeBlock((content || '').trim());
  if (!raw) return '';
  if (!isHtmlContent(raw)) return normalizeImportedMarkdown(raw);
  return normalizeImportedMarkdown(htmlBrBlobToMarkdown(raw));
}

/** Convert messy Markdown / HTML lesson into structured editor HTML. */
export function formatLessonContent(content: string): string {
  const md = contentToPlainMarkdown(content);
  if (!md) return (content || '').trim();
  return markdownToEditorHtml(md);
}

/** Whether the lesson still needs auto layout. */
export function needsLessonFormatting(content: string): boolean {
  const raw = (content || '').trim();
  if (!raw) return false;

  const plain = isHtmlContent(raw) ? htmlBrBlobToMarkdown(raw) : raw;

  if (plainTextNeedsStructure(plain)) return true;

  if (!isHtmlContent(raw)) {
    return plainTextHasMarkdownSyntax(raw);
  }

  if (/<h[1-6][\s>]/i.test(raw) && /<div[^>]*data-code-block-wrap/i.test(raw)) {
    return false;
  }

  if (/<h[1-6][\s>]/i.test(raw) && !plainTextHasMarkdownSyntax(plain)) {
    return false;
  }

  // Wall-of-text HTML: one block with many line breaks
  if (/<p[^>]*>[\s\S]*<br[\s\S]*<br/i.test(raw)) return true;

  return plainTextHasMarkdownSyntax(plain);
}

function isBrokenMarkdownHtml(html: string): boolean {
  if (!html.includes('<br')) return false;
  return /###|```|^\s*---\s*$/m.test(html) || html.includes('* **');
}

export function repairContentForRender(content: string): string {
  const raw = extractMarkdownFromMisplacedCodeBlock((content || '').trim());
  if (!raw) return '';

  if (isHtmlContent(raw) && (/<pre[\s>]/i.test(raw) || /data-code-block-wrap/i.test(raw))) {
    const converted = htmlCodeBlocksToMarkdown(raw);
    if (looksLikeMarkdownDocument(converted) || converted.includes('```')) {
      return normalizeImportedMarkdown(converted);
    }
    return normalizeImportedMarkdown(converted);
  }

  if (!isHtmlContent(raw)) {
    const md = normalizeImportedMarkdown(raw);
    if (plainTextHasMarkdownSyntax(md)) return md;
    if (looksLikeCodeBlock(md)) {
      return wrapAsMarkdownCodeFence(md, detectCodeLanguage(md));
    }
    return md;
  }

  if (isBrokenMarkdownHtml(raw)) {
    const md = normalizeImportedMarkdown(htmlBrBlobToMarkdown(raw));
    if (md.includes('```') || looksLikeMarkdownDocument(md)) return md;
    if (looksLikeCodeBlock(md)) {
      return wrapAsMarkdownCodeFence(md, detectCodeLanguage(md));
    }
    return md;
  }

  const plain = htmlBrBlobToMarkdown(raw);
  if (plainTextHasMarkdownSyntax(plain)) return normalizeImportedMarkdown(plain);
  if (looksLikeCodeBlock(plain) && !plain.includes('```')) {
    return wrapAsMarkdownCodeFence(plain, detectCodeLanguage(plain));
  }

  return raw;
}

export function shouldRenderAsMarkdown(content: string): boolean {
  const repaired = repairContentForRender(content);
  return !isHtmlContent(repaired);
}

export type LessonOutlineHeading = {
  level: number;
  text: string;
  id: string;
};

export function cleanOutlineHeadingText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Flatten React/markdown heading children to plain text for ID matching. */
export function flattenHeadingText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(flattenHeadingText).join('');
  if (typeof value === 'object' && value !== null && 'props' in value) {
    const children = (value as { props?: { children?: unknown } }).props?.children;
    return flattenHeadingText(children ?? '');
  }
  return '';
}

/** Extract document headings (markdown # or HTML h1–h6) for sidebar outline navigation. */
export function getLessonOutlineHeadings(raw: string, max = 24): LessonOutlineHeading[] {
  const source = repairContentForRender(raw || '');
  const headings: LessonOutlineHeading[] = [];
  let headingIndex = 0;

  const pushHeading = (level: number, text: string) => {
    const cleaned = cleanOutlineHeadingText(text);
    if (!cleaned) return;
    headings.push({
      level,
      text: cleaned,
      id: `doc-heading-${headingIndex++}`,
    });
  };

  let mdHeadingCount = 0;
  let inFence = false;
  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const mdMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (mdMatch) {
      pushHeading(mdMatch[1].length, mdMatch[2]);
      mdHeadingCount += 1;
    }
  }

  if (mdHeadingCount === 0 && isHtmlContent(source)) {
    const htmlHeadingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let htmlMatch: RegExpExecArray | null;
    while ((htmlMatch = htmlHeadingRegex.exec(source)) !== null) {
      pushHeading(Number(htmlMatch[1]), htmlMatch[2]);
    }
  }

  return headings.slice(0, max);
}

const MAIN_SECTION_PATTERN = /^[០-៩0-9]+[\.\。)]\s*/;
const MAIN_SECTION_PATTERN_ASCII = /^\d+[\.\)]\s*/;

/** True when a heading looks like a top-level numbered lesson section (១. … / 1. …). */
export function isMainSectionHeading(heading: Pick<LessonOutlineHeading, 'level' | 'text'>): boolean {
  if (heading.level === 2) return true;
  if (heading.level !== 3) return false;
  const text = cleanOutlineHeadingText(heading.text);
  return MAIN_SECTION_PATTERN.test(text) || MAIN_SECTION_PATTERN_ASCII.test(text);
}

/** Sidebar outline: main sections only (## or numbered ###), not sub-headings like UNION ALL. */
export function getSidebarOutlineHeadings(raw: string, max = 24): LessonOutlineHeading[] {
  const all = getLessonOutlineHeadings(raw, max);
  const main = all.filter(isMainSectionHeading);
  if (main.length >= 2) return main;
  const hasH2 = all.some((h) => h.level === 2);
  if (hasH2) return all.filter((h) => h.level === 2);
  return all.filter((h) => h.level === 3 || h.level === 2);
}

function normalizeHeadingMatch(value: string): string {
  return cleanOutlineHeadingText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Assign stable outline IDs to rendered h1–h6 by matching heading text (not fragile index). */
export function assignHeadingIdsInDom(root: HTMLElement, outlineHeadings: LessonOutlineHeading[]): void {
  const domHeadings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
  const usedIds = new Set<string>();

  const findMatch = (domText: string, preferMainSection: boolean) => {
    const normalizedDom = normalizeHeadingMatch(domText);
    if (!normalizedDom) return undefined;

    const candidates = outlineHeadings.filter((h) => !usedIds.has(h.id));
    const exact = candidates.find((h) => normalizeHeadingMatch(h.text) === normalizedDom);
    if (exact) return exact;

    const partial = candidates
      .filter((h) => {
        const normalizedOutline = normalizeHeadingMatch(h.text);
        return (
          normalizedDom.includes(normalizedOutline) ||
          normalizedOutline.includes(normalizedDom)
        );
      })
      .sort((a, b) => {
        if (preferMainSection) {
          const aMain = isMainSectionHeading(a) ? 1 : 0;
          const bMain = isMainSectionHeading(b) ? 1 : 0;
          if (aMain !== bMain) return bMain - aMain;
        }
        return normalizeHeadingMatch(a.text).length - normalizeHeadingMatch(b.text).length;
      });
    return partial[0];
  };

  for (const el of domHeadings) {
    const matched = findMatch(el.textContent || '', false);
    if (matched) {
      el.id = matched.id;
      usedIds.add(matched.id);
    }
  }

  let seqIdx = 0;
  for (const el of domHeadings) {
    if (el.id) continue;
    while (seqIdx < outlineHeadings.length && usedIds.has(outlineHeadings[seqIdx].id)) {
      seqIdx += 1;
    }
    if (seqIdx >= outlineHeadings.length) break;
    el.id = outlineHeadings[seqIdx].id;
    usedIds.add(outlineHeadings[seqIdx].id);
    seqIdx += 1;
  }
}

export function findDomHeadingForOutlineId(
  root: HTMLElement,
  outlineHeadings: LessonOutlineHeading[],
  headingId: string
): HTMLElement | null {
  const byId = root.querySelector(`#${CSS.escape(headingId)}`) as HTMLElement | null;
  if (byId) return byId;

  const target = outlineHeadings.find((h) => h.id === headingId);
  if (!target) return null;

  const normalizedTarget = normalizeHeadingMatch(target.text);
  const domHeadings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];

  const exact = domHeadings.find((el) => normalizeHeadingMatch(el.textContent || '') === normalizedTarget);
  if (exact) return exact;

  const partial = domHeadings
    .filter((el) => {
      const normalizedDom = normalizeHeadingMatch(el.textContent || '');
      return normalizedDom.includes(normalizedTarget) || normalizedTarget.includes(normalizedDom);
    })
    .sort((a, b) => {
      const aLen = normalizeHeadingMatch(a.textContent || '').length;
      const bLen = normalizeHeadingMatch(b.textContent || '').length;
      return aLen - bLen;
    });

  return partial[0] || null;
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

    // "1. Section Title" as standalone line → heading (not ordered list)
    const numberedSection = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedSection && isNumberedSectionHeader(line)) {
      closeList();
      const text = numberedSection[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      out.push(`<h2>${numberedSection[1]}. ${text}</h2>`);
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
  sanitizeExportDom(root, { keepCodeStyles: false });
  normalizeInlineMath(root);
  cleanExportHeadings(root);

  root.querySelectorAll('[data-export-code-block]').forEach((block) => {
    const lang = block.getAttribute('data-export-code-lang') || 'text';
    const pre = block.querySelector('pre');
    const codeText = (pre?.textContent || '').replace(/^(sql|javascript|typescript|json|html|css|bash)\s*\n/i, '');
    const shell = document.createElement('div');
    shell.setAttribute('data-export-code-block', '');
    shell.setAttribute('data-export-code-lang', lang);
    const header = document.createElement('div');
    header.textContent = lang.toUpperCase();
    const newPre = document.createElement('pre');
    const newCode = document.createElement('code');
    newCode.textContent = codeText;
    newPre.appendChild(newCode);
    shell.appendChild(header);
    shell.appendChild(newPre);
    block.replaceWith(shell);
  });

  root
    .querySelectorAll('button, [role="button"], [aria-label*="Copy"], [aria-label*="Download"]')
    .forEach((el) => el.remove());

  if (lessonTitle) {
    const titleNorm = lessonTitle.replace(/\s+/g, ' ').trim().toLowerCase();
    removeDuplicateTitleHeading(root, titleNorm);
  }
}

/** WYSIWYG export — keep syntax-highlighted code blocks; only strip interactive UI. */
export function prepareExportDomForPdfWysiwyg(root: HTMLElement, lessonTitle?: string) {
  sanitizeExportDom(root, { keepCodeStyles: true });
  normalizeInlineMath(root);
  cleanExportHeadings(root);

  root.querySelectorAll('[data-export-code-block]').forEach((block) => {
    const header = block.querySelector(':scope > div:first-child');
    header?.querySelectorAll('button, [role="button"]').forEach((el) => el.remove());
    header?.querySelectorAll('div').forEach((wrapper) => {
      if (!wrapper.textContent?.trim() && wrapper.querySelector('svg')) {
        wrapper.remove();
      }
    });
  });

  root
    .querySelectorAll('button, [role="button"], [aria-label*="Copy"], [aria-label*="Download"]')
    .forEach((el) => el.remove());

  if (lessonTitle) {
    const titleNorm = lessonTitle.replace(/\s+/g, ' ').trim().toLowerCase();
    removeDuplicateTitleHeading(root, titleNorm);
  }
}
