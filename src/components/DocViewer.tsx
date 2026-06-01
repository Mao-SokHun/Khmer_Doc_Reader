import { useEffect, useMemo, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { CodeBlock } from './CodeBlock';
import { repairContentForRender, shouldRenderAsMarkdown, sanitizeExportDom } from '../lib/lessonContent';

interface DocViewerProps {
  content: string;
  fontSize?: number;
  navigateToText?: string;
  navigateToSeq?: number;
  previewMode?: boolean;
  /** When true (export modal preview), mark root so PDF clones this DOM. */
  exportPreview?: boolean;
}

export function DocViewer({
  content,
  fontSize = 14,
  navigateToText,
  navigateToSeq = 0,
  previewMode = false,
  exportPreview = false,
}: DocViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<number | null>(null);
  // Match user-selected size directly for consistent on-screen/export reading
  const baseSize = Math.max(13, fontSize);
  const h1Size = baseSize * 1.42;
  const h2Size = baseSize * 1.26;
  const h3Size = baseSize * 1.14;
  const cleanTocLabel = (value: string) =>
    value
      .replace(/\[[^\]]*\]\([^)]+\)/g, '$&')
      .replace(/[*_[\]`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const repairedContent = useMemo(() => repairContentForRender(content), [content]);
  const renderAsMarkdown = useMemo(() => shouldRenderAsMarkdown(content), [content]);

  const viewContent = useMemo(() => {
    if (!renderAsMarkdown) return repairedContent;
    const lines = repairedContent.split('\n');
    const out: string[] = [];
    let inToc = false;
    for (const rawLine of lines) {
      const line = rawLine ?? '';
      if (/^##\s*(table of contents|តារាងមាតិកា)\s*$/i.test(line.trim())) {
        inToc = true;
        out.push(line);
        continue;
      }

      if (inToc) {
        const linkItem = line.match(/^\s*-\s*\[(.+?)\]\(#.*\)\s*$/);
        if (linkItem) {
          out.push(`- ${cleanTocLabel(linkItem[1])}`);
          continue;
        }
        const plainItem = line.match(/^\s*-\s+(.+)$/);
        if (plainItem) {
          out.push(`- ${cleanTocLabel(plainItem[1])}`);
          continue;
        }
        if (!line.trim()) {
          out.push(line);
          continue;
        }
        inToc = false;
      }

      out.push(line);
    }
    return out.join('\n');
  }, [repairedContent, renderAsMarkdown]);

  useEffect(() => {
    if (renderAsMarkdown || !rootRef.current) return;
    sanitizeExportDom(rootRef.current);
  }, [renderAsMarkdown, viewContent]);

  const flattenCodeText = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(flattenCodeText).join('');
    if (value && typeof value === 'object' && 'props' in (value as Record<string, unknown>)) {
      const children = (value as { props?: { children?: unknown } }).props?.children;
      return flattenCodeText(children ?? '');
    }
    return '';
  };

  const normalizeForMatch = (value: string) =>
    value
      .toLowerCase()
      .replace(/[*_~`>#|\\/\-[\]()[\]{}:;,.!?'"“”‘’•○▪◆★]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const tokenizeForMatch = (value: string) =>
    normalizeForMatch(value)
      .split(' ')
      .filter((token) => token.length > 0);

  useEffect(() => {
    if (!navigateToText?.trim()) return;
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll('h1, h2, h3, p, li, blockquote, pre, td, th, code')) as HTMLElement[];
    const needle = normalizeForMatch(navigateToText);
    const needleTokens = tokenizeForMatch(navigateToText);
    if (!needle || needleTokens.length === 0) return;
    const minTokenMatches = Math.max(1, Math.ceil(needleTokens.length * 0.6));

    const scored = targets
      .map((el) => {
        const text = normalizeForMatch(el.innerText || el.textContent || '');
        if (!text) return null;
        const textTokens = tokenizeForMatch(text);
        let score = 0;
        if (text.includes(needle)) score += 1000;
        const matchedTokenCount = needleTokens.filter((token) =>
          textTokens.some((candidateToken) => candidateToken.includes(token) || token.includes(candidateToken))
        ).length;
        if (!text.includes(needle) && matchedTokenCount < minTokenMatches) return null;
        score += matchedTokenCount * 20;
        score -= Math.max(0, text.length - needle.length) * 0.02;
        return { el, score, textLength: text.length };
      })
      .filter((entry): entry is { el: HTMLElement; score: number; textLength: number } => !!entry && entry.score > 0)
      .sort((a, b) => (b.score === a.score ? a.textLength - b.textLength : b.score - a.score));

    const match = scored[0]?.el || null;
    if (!match) return;

    match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const oldBg = match.style.backgroundColor;
    match.style.backgroundColor = 'rgba(59, 130, 246, 0.12)';
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = window.setTimeout(() => {
      match.style.backgroundColor = oldBg;
    }, 900);
  }, [navigateToText, navigateToSeq, content]);

  useEffect(() => () => {
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
  }, []);

  return (
    <div className={previewMode ? '' : 'flex justify-center p-3 min-h-screen bg-[#f8fafc]'}>
      <div
        ref={rootRef}
        {...(!previewMode || exportPreview ? { id: 'document-to-export' } : {})}
        className={previewMode
          ? 'w-full bg-white text-slate-900 overflow-hidden'
          : 'w-full max-w-[1180px] bg-white overflow-hidden text-slate-900 rounded-xl border border-slate-200 shadow-sm'}
        style={{ fontSize: `${baseSize}px` }}
      >
        <div className="prose prose-slate max-w-none px-5 py-7 lg:px-8 selection:bg-blue-100">
          {!renderAsMarkdown ? (
            <div dangerouslySetInnerHTML={{ __html: viewContent }} />
          ) : (
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                const isInline = Boolean(inline);
                
                if (!isInline) {
                  const normalizedCode = flattenCodeText(children).replace(/\n$/, '');
                  return (
                    <CodeBlock
                      language={lang}
                      code={normalizedCode}
                    />
                  );
                }
                
                return (
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-semibold text-slate-800" {...props}>
                    {children}
                  </code>
                );
              },
              div: ({ children, ...props }: any) => {
                if (props['data-code-block-wrap']) return <>{children}</>;
                return <div {...props}>{children}</div>;
              },
              h1: ({ children }) => <h1 className="mb-6 font-bold text-slate-950 tracking-tight leading-tight" style={{ fontSize: `${h1Size}px` }}>{children}</h1>,
              h2: ({ children }) => {
                const headingText = String(children ?? '').toLowerCase();
                const isTocHeading =
                  headingText.includes('table of contents') || headingText.includes('តារាងមាតិកា');
                return (
                  <h2
                    className={isTocHeading ? "mt-8 mb-3 font-extrabold text-slate-900 pb-2 border-b border-slate-200 tracking-tight" : "mt-8 mb-4 font-bold text-slate-900 border-none pb-0"}
                    style={{ fontSize: `${h2Size}px` }}
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => (
                <h3
                  className="mt-6 mb-3 font-bold text-slate-800 pl-3 border-l-[3px] border-blue-400"
                  style={{ fontSize: `${h3Size}px` }}
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="mb-3 leading-[1.75] text-slate-700 font-normal" style={{ fontSize: `${baseSize}px` }}>{children}</p>,
              ul: ({ children }) => <ul className="mb-4 list-disc pl-7 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 list-decimal pl-7 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-slate-700 leading-[1.7]" style={{ fontSize: `${baseSize}px` }}>{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-slate-200 bg-slate-50/50 p-6 rounded-r-lg italic text-slate-600 my-8">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-10 border-slate-200" />,
              strong: ({ children }) => <strong className="font-bold text-slate-950">{children}</strong>,
            }}
          >
            {viewContent}
          </Markdown>
          )}
        </div>
      </div>
    </div>
  );
}

