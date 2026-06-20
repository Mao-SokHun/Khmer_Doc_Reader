/** Detect and format pasted / plain-text code for editor + viewer. */

const CODE_LINE =
  /^\s*(const|let|var|function|async|await|import|export|return|if|else|for|while|try|catch|throw|class|interface|type|enum|switch|case|default|new|delete|typeof|void|public|private|protected|static|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE|ALTER|DROP|WITH|UNION|JOIN|VALUES|INTO|SET|BEGIN|COMMIT|ROLLBACK|USE|GO|DECLARE|module|require|exports|package|def|elif|except|finally|lambda|yield|raise|pass|print|using|namespace|struct|fn|impl|trait|pub|use)\b/i;

const EDITOR_CODE_WRAP_STYLE =
  'margin:12px 0;border-radius:14px;border:1px solid #d5dbe5;overflow:hidden;background:#e9edf3;';
const EDITOR_CODE_LABEL_STYLE =
  'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #d5dbe5;background:#e9edf3;color:#374151;font-family:"Inter",sans-serif;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;';
const EDITOR_CODE_PRE_STYLE =
  'margin:0;padding:14px 16px;border:0;border-radius:0;background:#dfe5ee;color:#1e293b;font-family:"JetBrains Mono","Fira Code",Consolas,"Courier New",monospace;font-size:14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;';
const EDITOR_CODE_CODE_STYLE =
  'font-family:inherit;font-size:inherit;color:inherit;background:transparent;white-space:inherit;';

export const CODE_LANGUAGE_LABELS: Record<string, string> = {
  sql: 'SQL',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  bash: 'Bash',
  shell: 'Shell',
  python: 'Python',
  java: 'Java',
  text: 'Code',
};

export function escapeHtmlForCode(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export function detectCodeLanguage(text: string): string {
  const sample = text.trim().slice(0, 4000);
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER|DROP|MERGE|TRUNCATE)\b/im.test(sample)) return 'sql';
  if (/^\s*<!DOCTYPE|^\s*<html[\s>]/i.test(sample)) return 'html';
  if (/^\s*[\[{]/.test(sample) && /["'][\w-]+["']\s*:/.test(sample)) return 'json';
  if (/\b(import|export)\s+[\s\S]*?\sfrom\s+['"]/.test(sample)) return 'typescript';
  if (/\b(interface|type)\s+\w+/.test(sample)) return 'typescript';
  if (/:\s*(string|number|boolean|void|any)\b/.test(sample)) return 'typescript';
  if (/^\s*#/m.test(sample) && /\b(npm|yarn|pnpm|git|echo|cd|curl|docker)\b/.test(sample)) return 'bash';
  if (/^\s*(def|class|import|from|elif|except)\b/m.test(sample)) return 'python';
  if (/^\s*(public|private|protected|class|void|int|String)\b/m.test(sample)) return 'java';
  if (/\b(async\s+function|const\s+\w+\s*=\s*async|=>|require\(|module\.exports|exports\.)/.test(sample)) {
    return 'javascript';
  }
  if (/^\s*(function|const|let|var|return|try|catch)\b/m.test(sample)) return 'javascript';
  return 'javascript';
}

export function looksLikeMarkdownDocument(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const hasHeading = /^#{1,6}\s+\S/m.test(trimmed);
  const hasFence = /^```\s*\w*\s*$/m.test(trimmed);
  const hasHr = /^---\s*$/m.test(trimmed);
  const hasBlockquote = /^>\s+\S/m.test(trimmed);
  const hasBoldInline = /\*\*[^*\n]+\*\*/.test(trimmed);
  const hasList = /^\s*[-*+]\s+\S/m.test(trimmed) || /^\s*\d+\.\s+\S/m.test(trimmed);

  if (hasFence && (hasHeading || hasBoldInline || hasList)) return true;
  if (hasHeading && (hasBoldInline || hasList || hasHr || hasBlockquote)) return true;
  if (hasHeading && trimmed.split('\n').filter((l) => /^#{1,6}\s+/.test(l)).length >= 2) return true;
  return false;
}

export function looksLikeCodeBlock(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 10) return false;
  if (trimmed.startsWith('```')) return false;
  if (looksLikeMarkdownDocument(trimmed)) return false;

  const lines = trimmed.split(/\r?\n/);
  if (lines.length === 1) {
    return (
      /[{}();=]/.test(trimmed) &&
      /\b(const|let|var|function|return|SELECT|import|class|async|await|try|catch)\b/i.test(trimmed)
    );
  }

  let codeLines = 0;
  let nonEmpty = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    nonEmpty += 1;
    if (/^#{1,6}\s/.test(line.trim())) continue;
    if (CODE_LINE.test(line)) codeLines += 1;
    else if (/^\s{2,}\S/.test(line) && /[{}();=<>]/.test(line)) codeLines += 1;
    else if (/^\s*[{}[\]();,]|^\s*\/\/|^\s*\/\*|^\s*\*|^\s*#!/.test(line)) codeLines += 1;
  }

  if (nonEmpty < 2) return false;
  return codeLines >= Math.max(2, Math.ceil(nonEmpty * 0.4));
}

export function languageLabel(lang: string): string {
  return CODE_LANGUAGE_LABELS[lang.toLowerCase()] || lang.toUpperCase() || 'Code';
}

export function buildEditorCodeBlockHtml(code: string, language = 'javascript'): string {
  const lang = language.toLowerCase();
  const escaped = escapeHtmlForCode(code.replace(/\r\n/g, '\n'));
  const label = languageLabel(lang);
  return (
    `<div data-code-block-wrap="true" data-code-language="${lang}" style="${EDITOR_CODE_WRAP_STYLE}">` +
    `<div contenteditable="false" style="${EDITOR_CODE_LABEL_STYLE}">${label}</div>` +
    `<pre data-code-block="true" style="${EDITOR_CODE_PRE_STYLE}"><code style="${EDITOR_CODE_CODE_STYLE}">${escaped}</code></pre>` +
    `</div>`
  );
}

export function wrapAsMarkdownCodeFence(code: string, language?: string): string {
  const lang = language || detectCodeLanguage(code);
  const body = code.replace(/\r\n/g, '\n').trim();
  return `\`\`\`${lang}\n${body}\n\`\`\``;
}

/** Convert editor HTML code blocks and plain pre tags to markdown fences. */
export function htmlCodeBlocksToMarkdown(html: string): string {
  let result = html;

  result = result.replace(
    /<div[^>]*data-code-block-wrap="true"[^>]*data-code-language="([^"]*)"[^>]*>[\s\S]*?<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>[\s\S]*?<\/div>/gi,
    (_match, lang, code) => {
      const decoded = decodeHtmlEntities(String(code).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
      return `\n\`\`\`${lang || detectCodeLanguage(decoded)}\n${decoded.trim()}\n\`\`\`\n`;
    }
  );

  result = result.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_match, code) => {
    const decoded = decodeHtmlEntities(String(code).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
    return `\n\`\`\`${detectCodeLanguage(decoded)}\n${decoded.trim()}\n\`\`\`\n`;
  });

  return result.trim();
}

export function hasCodeBlockMarkup(content: string): boolean {
  return /```[\s\S]*?```/.test(content) || /data-code-block-wrap/i.test(content) || /<pre[\s>]/i.test(content);
}

/** Recover markdown wrongly saved inside a single editor code block. */
export function extractMarkdownFromMisplacedCodeBlock(content: string): string {
  const raw = (content || '').trim();
  if (!raw) return raw;

  if (!/<[^>]+>/.test(raw)) {
    return looksLikeMarkdownDocument(raw) ? raw : content;
  }

  const wrapRegex =
    /<div[^>]*data-code-block-wrap="true"[^>]*>[\s\S]*?<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>[\s\S]*?<\/div>/gi;
  const wraps = [...raw.matchAll(wrapRegex)];
  if (wraps.length !== 1) return content;

  const before = raw.slice(0, wraps[0].index ?? 0).replace(/<[^>]+>/g, '').trim();
  const after = raw.slice((wraps[0].index ?? 0) + wraps[0][0].length).replace(/<[^>]+>/g, '').trim();
  if (before || after) return content;

  const inner = decodeHtmlEntities(
    String(wraps[0][1]).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  ).trim();

  if (looksLikeMarkdownDocument(inner) || /^```\s*\w*\s*$/m.test(inner)) {
    return inner;
  }

  return content;
}
