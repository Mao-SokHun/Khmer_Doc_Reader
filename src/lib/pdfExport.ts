import { prepareExportDomForPdf, type ExportLang } from './lessonContent';

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

export function buildPdfStyleVars(fontSize: number, printWidth: number, margins: number): PdfStyleVars {
  const marginH = Math.max(margins, 16) + 6;
  const basePdfSize = Math.max(8, fontSize);
  return {
    basePdfSize,
    h1PdfSize: basePdfSize * 1.45,
    h2PdfSize: basePdfSize * 1.22,
    h3PdfSize: basePdfSize * 1.1,
    printWidth,
    marginTop: margins + 4,
    marginH,
    marginBottom: margins + 28,
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
  return Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');
}

export function getPreviewExportElement(container: HTMLElement | null): HTMLElement | null {
  if (!container) return null;
  return container.querySelector('#document-to-export') as HTMLElement | null;
}

/**
 * Build export HTML by cloning the live preview DOM (what you see before export).
 */
export function buildPdfDocumentHtmlFromPreview(
  previewDocumentEl: HTMLElement,
  header: PdfHeaderMeta,
  styleVars: PdfStyleVars,
  lessonTitle?: string
): string {
  const cloneHost = document.createElement('div');
  cloneHost.innerHTML = previewDocumentEl.innerHTML;
  prepareExportDomForPdf(cloneHost, lessonTitle);

  const shellStyles = buildPdfShellStyles(styleVars);
  const appStyles = collectAppStylesheets();

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
  ${appStyles}
  <style>${shellStyles}</style>
</head>
<body>
  <div id="export-wrapper">
    <header class="pdf-doc-header">
      <span class="pdf-doc-kicker">${header.docKicker}</span>
      <h1 class="pdf-doc-title">${header.pdfHeadingTitle}</h1>
      <p class="pdf-doc-subtitle">${header.docDateLabel}: ${header.formattedDate} &nbsp;|&nbsp; ${header.docTypeLabel}: ${header.docTypeValue}</p>
    </header>
    <div id="content" class="w-full bg-white text-slate-900" style="font-size:${styleVars.basePdfSize}px">
      <div class="prose prose-slate max-w-none px-5 py-7 lg:px-8">
        ${cloneHost.innerHTML}
      </div>
    </div>
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
    if (el?.querySelector('.prose, [data-export-code-block], h1, h2, h3, p, li')) {
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
  const header = buildPdfHeaderMeta(options.lang, options.lessonTitle);
  return buildPdfDocumentHtmlFromPreview(
    previewEl,
    header,
    options.styleVars,
    options.lessonTitle
  );
}
