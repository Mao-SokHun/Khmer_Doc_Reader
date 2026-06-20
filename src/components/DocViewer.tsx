import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { CodeBlock } from './CodeBlock';
import { QuizBlock } from './QuizBlock';
import { repairContentForRender, shouldRenderAsMarkdown, sanitizeExportDom, getLessonOutlineHeadings, getSidebarOutlineHeadings, assignHeadingIdsInDom, findDomHeadingForOutlineId, flattenHeadingText } from '../lib/lessonContent';
import { KHMER_DOCUMENT_FONT_STACK } from '../lib/pdfExport';
import { highlightElement, scrollElementIntoMainView } from '../lib/scrollTo';
import { useScrollSpy } from '../hooks/useScrollSpy';

interface DocViewerProps {
  content: string;
  fontSize?: number;
  navigateToText?: string;
  navigateToHeadingId?: string;
  navigateToSeq?: number;
  previewMode?: boolean;
  /** When true (export modal preview), mark root so PDF clones this DOM. */
  exportPreview?: boolean;
  readOnly?: boolean;
  onActiveHeadingChange?: (headingId: string | null) => void;
}

export function DocViewer({
  content,
  fontSize = 14,
  navigateToText,
  navigateToHeadingId,
  navigateToSeq = 0,
  previewMode = false,
  exportPreview = false,
  readOnly = false,
  onActiveHeadingChange,
}: DocViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const proseRef = useRef<HTMLDivElement>(null);
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
  const outlineHeadings = useMemo(() => getLessonOutlineHeadings(content), [content]);
  const sidebarOutline = useMemo(() => getSidebarOutlineHeadings(content), [content]);

  const activeHeadingId = useScrollSpy(rootRef, exportPreview ? [] : sidebarOutline.map((h) => h.id));

  useEffect(() => {
    if (exportPreview || previewMode) return;
    onActiveHeadingChange?.(activeHeadingId);
  }, [activeHeadingId, exportPreview, previewMode, onActiveHeadingChange]);

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

  useLayoutEffect(() => {
    if (exportPreview || previewMode) return;
    const assignRoot = proseRef.current ?? rootRef.current;
    if (!assignRoot) return;
    if (!renderAsMarkdown) {
      sanitizeExportDom(assignRoot);
    }
    assignHeadingIdsInDom(assignRoot, outlineHeadings);
  }, [renderAsMarkdown, viewContent, outlineHeadings, exportPreview, previewMode]);

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
    if (previewMode || exportPreview) return;
    if (!navigateToHeadingId && !navigateToText?.trim()) return;

    const root = proseRef.current ?? rootRef.current;
    if (!root) return;

    let highlightCleanup: (() => void) | null = null;

    const runNavigation = () => {
      assignHeadingIdsInDom(root, outlineHeadings);

      let match: HTMLElement | null = null;

      if (navigateToHeadingId) {
        match = findDomHeadingForOutlineId(root, outlineHeadings, navigateToHeadingId);
      }

      if (!match && navigateToText?.trim()) {
        const needle = normalizeForMatch(navigateToText);
        const needleTokens = tokenizeForMatch(navigateToText);
        if (needle && needleTokens.length > 0) {
          const minTokenMatches = Math.max(1, Math.ceil(needleTokens.length * 0.6));
          const targets = Array.from(root.querySelectorAll('h1, h2, h3')) as HTMLElement[];
          const scored = targets
            .map((el) => {
              const text = normalizeForMatch(el.innerText || el.textContent || '');
              if (!text) return null;
              const textTokens = tokenizeForMatch(text);
              let score = 0;
              const tag = el.tagName.toLowerCase();
              if (tag === 'h1') score += 500;
              else if (tag === 'h2') score += 400;
              else if (tag === 'h3') score += 300;
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
          match = scored[0]?.el || null;
        }
      }

      if (!match) return false;

      scrollElementIntoMainView(match, { behavior: 'smooth', block: 'start' });
      highlightCleanup?.();
      highlightCleanup = highlightElement(match);
      return true;
    };

    if (runNavigation()) {
      return () => highlightCleanup?.();
    }

    const retry1 = window.setTimeout(runNavigation, 50);
    const retry2 = window.setTimeout(runNavigation, 150);
    const retry3 = window.setTimeout(runNavigation, 400);
    return () => {
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
      window.clearTimeout(retry3);
      highlightCleanup?.();
    };
  }, [navigateToText, navigateToHeadingId, navigateToSeq, content, previewMode, exportPreview, outlineHeadings]);

  useEffect(() => () => {
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
  }, []);

  return (
    <div className={previewMode ? '' : 'flex justify-center p-3 min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors'} lang="km">
      <div
        ref={rootRef}
        {...(!previewMode || exportPreview ? { id: 'document-to-export' } : {})}
        className={previewMode
          ? 'khmer-doc-font w-full overflow-hidden bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100'
          : 'khmer-doc-font w-full max-w-[1180px] bg-white dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors'}
        style={{ fontSize: `${baseSize}px`, fontFamily: KHMER_DOCUMENT_FONT_STACK }}
      >
        <div
          ref={proseRef}
          className={
            exportPreview
              ? 'max-w-none'
              : 'prose prose-slate dark:prose-invert max-w-none px-5 py-7 lg:px-8 selection:bg-blue-100 dark:selection:bg-blue-900/40'
          }
        >
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
                  if (lang === 'quiz') {
                    return <QuizBlock code={normalizedCode} lang="kh" />;
                  }
                  return (
                    <CodeBlock
                      language={lang}
                      code={normalizedCode}
                      exportPreview={exportPreview}
                    />
                  );
                }
                
                return exportPreview ? (
                  <code {...props}>{children}</code>
                ) : (
                  <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200" {...props}>
                    {children}
                  </code>
                );
              },
              div: ({ children, ...props }: any) => {
                if (props['data-code-block-wrap']) return <>{children}</>;
                return <div {...props}>{children}</div>;
              },
              h1: ({ children }) => exportPreview ? (
                <h1>{children}</h1>
              ) : (
                <h1 className="mb-6 font-bold text-slate-950 dark:text-slate-50 tracking-tight leading-tight scroll-mt-24" style={{ fontSize: `${h1Size}px` }}>{children}</h1>
              ),
              h2: ({ children }) => {
                const headingText = flattenHeadingText(children).toLowerCase();
                const isTocHeading =
                  headingText.includes('table of contents') || headingText.includes('តារាងមាតិកា');
                if (exportPreview) return <h2>{children}</h2>;
                return (
                  <h2
                    className={isTocHeading ? "mt-8 mb-3 font-extrabold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700 tracking-tight scroll-mt-24" : "mt-8 mb-4 font-bold text-slate-900 dark:text-slate-100 border-none pb-0 scroll-mt-24"}
                    style={{ fontSize: `${h2Size}px` }}
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => exportPreview ? (
                <h3>{children}</h3>
              ) : (
                <h3
                  className="mt-6 mb-3 font-bold text-slate-800 dark:text-slate-200 pl-3 border-l-[3px] border-blue-400 scroll-mt-24"
                  style={{ fontSize: `${h3Size}px` }}
                >
                  {children}
                </h3>
              ),
              h4: ({ children }) => exportPreview ? (
                <h4>{children}</h4>
              ) : (
                <h4 className="mt-5 mb-2 font-bold text-slate-800 dark:text-slate-200 scroll-mt-24">{children}</h4>
              ),
              h5: ({ children }) => exportPreview ? (
                <h5>{children}</h5>
              ) : (
                <h5 className="mt-4 mb-2 font-semibold text-slate-800 dark:text-slate-200 scroll-mt-24">{children}</h5>
              ),
              h6: ({ children }) => exportPreview ? (
                <h6>{children}</h6>
              ) : (
                <h6 className="mt-3 mb-2 font-semibold text-slate-700 dark:text-slate-300 scroll-mt-24">{children}</h6>
              ),
              p: ({ children }) => exportPreview ? (
                <p>{children}</p>
              ) : (
                <p className="mb-3 leading-[1.75] text-slate-700 dark:text-slate-300 font-normal" style={{ fontSize: `${baseSize}px` }}>{children}</p>
              ),
              ul: ({ children }) => exportPreview ? (
                <ul>{children}</ul>
              ) : (
                <ul className="mb-4 list-disc pl-7 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => exportPreview ? (
                <ol>{children}</ol>
              ) : (
                <ol className="mb-4 list-decimal pl-7 space-y-1">{children}</ol>
              ),
              li: ({ children }) => exportPreview ? (
                <li>{children}</li>
              ) : (
                <li className="text-slate-700 dark:text-slate-300 leading-[1.7]" style={{ fontSize: `${baseSize}px` }}>{children}</li>
              ),
              blockquote: ({ children }) => exportPreview ? (
                <blockquote>{children}</blockquote>
              ) : (
                <blockquote className="border-l-4 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-r-lg italic text-slate-600 dark:text-slate-300 my-8">
                  {children}
                </blockquote>
              ),
              hr: () => exportPreview ? <hr /> : <hr className="my-10 border-slate-200 dark:border-slate-700" />,
              strong: ({ children }) => exportPreview ? (
                <strong>{children}</strong>
              ) : (
                <strong className="font-bold text-slate-950 dark:text-slate-50">{children}</strong>
              ),
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

