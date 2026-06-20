import { prepareExportDomForPdfWysiwyg, type ExportLang } from './lessonContent';

/** Shared document font — matches PDF export preview. */
export const KHMER_DOCUMENT_FONT_STACK =
  '"Kantumruy Pro", "Inter", "Noto Sans Khmer", system-ui, sans-serif';

/** Reserved footer band on each PDF page (px in jsPDF page coordinates). */
export const PDF_FOOTER_BAND_PX = 52;

export type PdfStyleVars = {
  basePdfSize: number;
  h1PdfSize: number;
  h2PdfSize: number;
  h3PdfSize: number;
  printWidth: number;
  marginTop: number;
  marginH: number;
  marginBottom: number;
};

export type PdfPagination = {
  exportWidthPx: number;
  fullPageHeightPx: number;
  footerBandContentPx: number;
  contentPageHeightPx: number;
  footerBandPx: number;
  totalPages: number;
};

export function buildPdfStyleVars(fontSize: number, printWidth: number, margins: number): PdfStyleVars {
  const baseMargin = Math.max(margins, 28);
  const basePdfSize = Math.max(8, fontSize);
  return {
    basePdfSize,
    h1PdfSize: basePdfSize * 1.45,
    h2PdfSize: basePdfSize * 1.22,
    h3PdfSize: basePdfSize * 1.1,
    printWidth,
    marginTop: baseMargin + 12,
    marginH: baseMargin + 10,
    marginBottom: baseMargin + 12,
  };
}

/** Top inset on page 2+ — matches `#export-wrapper` padding-top on page 1. */
export function getContinuationPageTopPad(v: PdfStyleVars): number {
  return v.marginTop;
}

/** Map document height to page slices with a reserved footer band on every page. */
export function computePdfPagination(options: {
  pdfPageWidth: number;
  pdfPageHeight: number;
  exportWidthPx: number;
  totalContentHeightPx: number;
  footerBandPx?: number;
}): PdfPagination {
  const footerBandPx = options.footerBandPx ?? PDF_FOOTER_BAND_PX;
  const fullPageHeightPx = Math.max(
    1,
    Math.floor((options.pdfPageHeight * options.exportWidthPx) / options.pdfPageWidth)
  );
  const footerBandContentPx = Math.max(
    1,
    Math.floor((footerBandPx * options.exportWidthPx) / options.pdfPageWidth)
  );
  const contentPageHeightPx = Math.max(1, fullPageHeightPx - footerBandContentPx);
  const totalPages = Math.max(
    1,
    Math.ceil(options.totalContentHeightPx / contentPageHeightPx)
  );

  return {
    exportWidthPx: options.exportWidthPx,
    fullPageHeightPx,
    footerBandContentPx,
    contentPageHeightPx,
    footerBandPx,
    totalPages,
  };
}

/** PDF header/footer only — lesson body uses the same CSS as the on-screen preview. */
export function buildPdfShellStyles(v: PdfStyleVars): string {
  const { basePdfSize, h1PdfSize, printWidth, marginTop, marginH, marginBottom } = v;
  return `
    @page { size: A4; margin: 20mm 15mm; }
    @media print {
      html, body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; letter-spacing: 0.01px; }
    #export-wrapper {
      width: ${printWidth}px;
      margin: 0 auto;
      padding: ${marginTop}px ${marginH}px ${marginBottom}px;
      background: #ffffff;
      font-family: ${KHMER_DOCUMENT_FONT_STACK};
    }
    .pdf-doc-header {
      margin-bottom: ${Math.max(22, Math.round(basePdfSize * 1.6))}px;
      padding-bottom: ${Math.max(14, Math.round(basePdfSize * 0.85))}px;
      border-bottom: 2px solid #e2e8f0;
    }
    .pdf-doc-kicker {
      display: inline-block;
      background-color: #ebf8ff;
      color: #2b6cb0;
      font-size: ${Math.max(8.5, basePdfSize * 0.8)}px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pdf-doc-title {
      margin: 0 0 8px;
      font-size: ${h1PdfSize}px;
      font-weight: 700;
      line-height: 1.3;
      color: #1a365d;
    }
    .pdf-doc-subtitle {
      margin: 0;
      font-size: ${Math.max(9, basePdfSize * 0.86)}px;
      color: #718096;
    }
    #content { width: 100%; }
    #content .prose { max-width: none; }
  `;
}

/** Lesson body rules for stable PDF layout (tables, code, math, lists). */
export function buildPdfContentStyles(v: PdfStyleVars): string {
  const { basePdfSize, h1PdfSize, h2PdfSize, h3PdfSize } = v;
  const bodySize = Math.max(10, basePdfSize);
  return `
    #content, #content #document-to-export {
      width: 100%;
      font-family: ${KHMER_DOCUMENT_FONT_STACK};
    }
    #export-wrapper button { display: none !important; }
    #content .prose {
      max-width: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    #content p, #content li {
      font-size: ${bodySize}px;
      line-height: 1.72;
      color: #1e293b;
      text-align: start;
    }
    #content p { margin: 0.55em 0 0.85em; }
    #content li {
      break-inside: avoid;
      page-break-inside: avoid;
      display: list-item;
      margin: 0.25em 0 0.5em;
      padding-left: 0.25em;
    }
    #content .prose ol,
    #content ol {
      list-style-type: decimal;
      list-style-position: outside;
      margin: 0.65em 0 1em;
      padding-left: 1.75rem;
    }
    #content .prose ul,
    #content ul {
      list-style-type: disc;
      list-style-position: outside;
      margin: 0.65em 0 1em;
      padding-left: 1.75rem;
    }
    #content .prose li::marker,
    #content li::marker {
      font-weight: 600;
      font-size: inherit;
    }
    #content h1 {
      font-size: ${h1PdfSize}px;
      font-weight: 700;
      line-height: 1.3;
      margin: 1.15em 0 0.55em;
      break-after: avoid;
      page-break-after: avoid;
      color: #0f172a;
    }
    #content h2 {
      font-size: ${h2PdfSize}px;
      font-weight: 700;
      line-height: 1.35;
      margin: 1.25em 0 0.5em;
      break-after: avoid;
      page-break-after: avoid;
      color: #0f172a;
    }
    #content h3 {
      font-size: ${h3PdfSize}px;
      font-weight: 700;
      line-height: 1.4;
      margin: 1.5em 0 0.75em;
      padding-left: 12px;
      border-left: 3px solid #60a5fa;
      break-after: avoid;
      page-break-after: avoid;
      color: #1e293b;
    }
    #content img, #content video {
      display: block;
      max-width: 100%;
      height: auto;
    }
    #content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: ${Math.max(10, basePdfSize * 0.88)}px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    #content th, #content td {
      border: 1px solid #475569;
      padding: 8px 10px;
      vertical-align: top;
      text-align: start;
    }
    #content th { background: #f1f5f9; font-weight: 700; }
    #content blockquote {
      margin: 1em 0;
      padding: 10px 14px;
      border-left: 4px solid #94a3b8;
      background: #f8fafc;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    #content [data-export-code-block],
    #content pre {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    #content [data-export-code-block] > div:first-child button {
      display: none !important;
    }
    #content .katex-display {
      margin: 1em 0;
      overflow-x: auto;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    #content hr {
      margin: 1.5em 0;
      border: 0;
      border-top: 1px solid #cbd5e1;
    }
    #content strong { font-weight: 700; color: #0f172a; }
    #content a { color: #1d4ed8; text-decoration: none; word-break: break-all; }
    #content code:not(pre code) {
      background: #f1f5f9;
      padding: 0.12em 0.35em;
      border-radius: 4px;
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 0.88em;
      color: #0f172a;
    }
    [data-export-code-block], .pdf-export-code-block, .pdf-code-block {
      margin: 1em 0 1.2em;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    [data-export-code-block] > div:first-child,
    [data-export-code-block] .pdf-export-code-header,
    .pdf-code-lang {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-family: Inter, system-ui, sans-serif;
    }
    [data-export-code-block] > div:first-child span,
    .pdf-code-lang {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #334155;
    }
    [data-export-code-block] > pre,
    [data-export-code-block] pre,
    .pdf-code-block pre {
      margin: 0;
      padding: 1rem 1.25rem 1.1rem;
      background: #f1f5f9;
      border: 0;
      border-radius: 0;
      font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
      font-size: 14px;
      line-height: 1.65;
      white-space: pre-wrap !important;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
      color: #1e293b;
    }
    [data-export-code-block] pre code,
    .pdf-code-block pre code {
      display: block;
      padding: 0;
      margin: 0;
      background: transparent;
      font-size: inherit;
      font-family: inherit;
      white-space: pre-wrap !important;
    }
    [data-export-code-block] pre code span[style] {
      background: transparent;
    }
  `;
}

/** Font + reset styles only — no Tailwind (html2canvas breaks on oklch). */
export function buildPdfFontStyles(scope = 'body'): string {
  return `
    ${scope}, ${scope} #content, ${scope} #content #document-to-export {
      font-family: ${KHMER_DOCUMENT_FONT_STACK};
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
  `;
}

export function buildExportWrapperInlineStyle(v: PdfStyleVars): string {
  return `width:${v.printWidth}px;margin:0 auto;padding:${v.marginTop}px ${v.marginH}px ${v.marginBottom}px;background:#ffffff;box-sizing:border-box;`;
}

export type PdfHeaderMeta = {
  docKicker: string;
  pdfHeadingTitle: string;
  docSubtitle: string;
  docDateLabel: string;
  docTypeLabel: string;
  docTypeValue: string;
  formattedDate: string;
};

export function escapePdfHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPdfHeaderMeta(lang: ExportLang, title: string): PdfHeaderMeta {
  return {
    docKicker: lang === 'kh' ? 'ឯកសារមេរៀន' : 'Lesson Document',
    pdfHeadingTitle: escapePdfHtmlText(title || ''),
    docSubtitle: lang === 'kh' ? 'ឯកសារសិក្សា · យោគលម្អិត' : 'Study reference · Lesson notes',
    docDateLabel: lang === 'kh' ? 'កាលបរិច្ឆេទ' : 'Date',
    docTypeLabel: lang === 'kh' ? 'ប្រភេទ' : 'Type',
    docTypeValue: lang === 'kh' ? 'ឯកសារសិក្សា' : 'Study document',
    formattedDate: new Date().toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

/** Copy active app stylesheets so PDF iframe matches preview typography and code blocks. */
export function collectAppStylesheets(): string {
  // Intentionally empty — Tailwind v4 injects oklch colors that break html2canvas.
  return '';
}

export function getPreviewExportElement(container: HTMLElement | null): HTMLElement | null {
  if (!container) return null;
  if (container.id === 'export-wrapper') return container;
  return (
    (container.querySelector('#export-wrapper') as HTMLElement | null) ??
    (container.querySelector('#document-to-export') as HTMLElement | null)
  );
}

/**
 * Build export HTML by cloning the live preview DOM (what you see before export).
 */
export function buildPdfDocumentHtmlFromPreview(
  previewExportWrapper: HTMLElement,
  styleVars: PdfStyleVars,
  lessonTitle?: string
): string {
  const cloneHost = document.createElement('div');
  cloneHost.innerHTML = previewExportWrapper.innerHTML;
  const contentRoot =
    (cloneHost.querySelector('#content') as HTMLElement | null) ?? cloneHost;
  prepareExportDomForPdfWysiwyg(contentRoot, lessonTitle);

  const shellStyles = buildPdfShellStyles(styleVars);
  const contentStyles = buildPdfContentStyles(styleVars);
  const fontStyles = buildPdfFontStyles();
  const wrapperStyle = buildExportWrapperInlineStyle(styleVars);

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
  <style>${fontStyles}${shellStyles}${contentStyles}</style>
</head>
<body>
  <div id="export-wrapper" style="${wrapperStyle}">
    ${cloneHost.innerHTML}
  </div>
</body>
</html>`;
}

/** Wait until preview DocViewer has rendered for export. */
export async function waitForPreviewExportReady(
  container: HTMLElement | null,
  timeoutMs = 4000
): Promise<HTMLElement> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = getPreviewExportElement(container);
    if (
      el?.querySelector('.pdf-doc-header') &&
      el.querySelector('#content .prose, #content [data-export-code-block], #content h1, #content h2, #content p, #content li')
    ) {
      if (document.fonts) await document.fonts.ready;
      return el;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  throw new Error('Preview is not ready. Open export preview and try again.');
}

export async function buildLessonPdfDocumentHtml(options: {
  previewContainer: HTMLElement | null;
  lang: ExportLang;
  lessonTitle: string;
  styleVars: PdfStyleVars;
}): Promise<string> {
  const previewEl = await waitForPreviewExportReady(options.previewContainer);
  return buildPdfDocumentHtmlFromPreview(
    previewEl,
    options.styleVars,
    options.lessonTitle
  );
}
