import { DocViewer } from './DocViewer';
import {
  buildPdfContentStyles,
  buildPdfFontStyles,
  buildPdfHeaderMeta,
  buildPdfShellStyles,
  type PdfStyleVars,
} from '../lib/pdfExport';
import type { ExportLang } from '../lib/lessonContent';

type PdfExportPreviewProps = {
  content: string;
  fontSize: number;
  lang: ExportLang;
  lessonTitle: string;
  styleVars: PdfStyleVars;
  /** Y-offsets where PDF pages break — shown as guides in preview (export uses the same slices). */
  pageBreakOffsets?: number[];
  /** Top padding on continuation pages (page 2+), shown in preview guides. */
  continuationTopPad?: number;
};

/** Live preview — `#export-wrapper` is captured directly for WYSIWYG PDF export. */
export function PdfExportPreview({
  content,
  fontSize,
  lang,
  lessonTitle,
  styleVars,
  pageBreakOffsets = [],
  continuationTopPad = 0,
}: PdfExportPreviewProps) {
  const header = buildPdfHeaderMeta(lang, lessonTitle);
  const { printWidth, marginTop, marginH, marginBottom, basePdfSize } = styleVars;

  return (
    <>
      <style>{`${buildPdfFontStyles('#export-wrapper')}${buildPdfShellStyles(styleVars)}${buildPdfContentStyles(styleVars)}`}</style>
      <div className="relative mx-auto" style={{ width: `${printWidth}px`, maxWidth: '100%' }}>
        {pageBreakOffsets.map((offsetY, index) => (
          <div
            key={`${offsetY}-${index}`}
            className="pdf-page-break-guide pointer-events-none absolute left-0 right-0 z-10"
            style={{ top: offsetY }}
            aria-hidden
          >
            <div className="border-t border-slate-200" />
            {continuationTopPad > 0 ? (
              <div
                className="bg-white"
                style={{ height: `${continuationTopPad}px` }}
              />
            ) : null}
            <div className="flex justify-center py-1">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'kh' ? `ទំព័រ ${index + 2}` : `Page ${index + 2}`}
              </span>
            </div>
          </div>
        ))}
        <div
          id="export-wrapper"
          className="bg-white box-border"
          style={{
            width: `${printWidth}px`,
            maxWidth: '100%',
            padding: `${marginTop}px ${marginH}px ${marginBottom}px`,
          }}
        >
          <header className="pdf-doc-header">
          <span className="pdf-doc-kicker">{header.docKicker}</span>
          <h1 className="pdf-doc-title">{lessonTitle || (lang === 'kh' ? 'មេរៀន' : 'Lesson')}</h1>
          <p className="pdf-doc-subtitle">
            {header.docDateLabel}: {header.formattedDate}
            {' \u00a0|\u00a0 '}
            {header.docTypeLabel}: {header.docTypeValue}
          </p>
        </header>
        <div id="content" className="khmer-doc-font w-full bg-white text-slate-900" style={{ fontSize: `${basePdfSize}px` }}>
          <DocViewer content={content} fontSize={fontSize} previewMode exportPreview />
        </div>
        </div>
      </div>
    </>
  );
}
