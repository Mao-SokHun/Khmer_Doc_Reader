import html2canvas from 'html2canvas';
import type { jsPDF } from 'jspdf';
import {
  buildPdfDocumentHtmlFromPreview,
  computePdfPagination,
  getContinuationPageTopPad,
  PDF_FOOTER_BAND_PX,
  type PdfStyleVars,
} from './pdfExport';
import { computeSmartPageSlices, type PdfPageSlice } from './pdfPageBreaks';
import { sanitizeClonedDocumentForCanvas } from './pdfCanvas';
import type { ExportLang } from './lessonContent';

export type ExportIframeMount = {
  iframe: HTMLIFrameElement;
  doc: Document;
  exportRoot: HTMLElement;
};

/** Clone preview into an isolated iframe with PDF-only CSS (no Tailwind oklch). */
export async function mountExportIframeFromPreview(options: {
  previewRoot: HTMLElement;
  styleVars: PdfStyleVars;
  lessonTitle?: string;
  printWidth: number;
}): Promise<ExportIframeMount> {
  const html = buildPdfDocumentHtmlFromPreview(
    options.previewRoot,
    options.styleVars,
    options.lessonTitle
  );

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${options.printWidth}px`,
    'height:1px',
    'border:0',
    'opacity:0',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not create export iframe');
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise((r) => setTimeout(r, 500));
  if (doc.fonts) {
    await doc.fonts.ready;
  }

  const exportRoot = doc.getElementById('export-wrapper');
  if (!exportRoot) {
    document.body.removeChild(iframe);
    throw new Error('Export content not found in iframe');
  }

  return { iframe, doc, exportRoot };
}

export function unmountExportIframe(iframe: HTMLIFrameElement): void {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

export function measureExportRootPageSlices(
  exportRoot: HTMLElement,
  pdfPageWidth: number,
  pdfPageHeight: number,
  continuationTopPadPx = 0
): PdfPageSlice[] {
  const exportWidthPx = Math.ceil(exportRoot.scrollWidth);
  const totalHeightPx = Math.ceil(exportRoot.scrollHeight);
  const pagination = computePdfPagination({
    pdfPageWidth,
    pdfPageHeight,
    exportWidthPx,
    totalContentHeightPx: totalHeightPx,
  });
  return computeSmartPageSlices(
    exportRoot,
    pagination.contentPageHeightPx,
    totalHeightPx,
    continuationTopPadPx
  );
}

/** @deprecated Use measureExportRootPageSlices on the iframe export root. */
export function measurePreviewPageSlices(
  previewRoot: HTMLElement,
  pdfPageWidth: number,
  pdfPageHeight: number
): PdfPageSlice[] {
  return measureExportRootPageSlices(previewRoot, pdfPageWidth, pdfPageHeight);
}

export type RenderPdfFromPreviewOptions = {
  previewRoot: HTMLElement;
  pdf: jsPDF;
  pageSlices?: PdfPageSlice[];
  lang: ExportLang;
  styleVars: PdfStyleVars;
  lessonTitle?: string;
  printWidth: number;
  startPage: number;
  endPage: number;
  pageSize: string;
  orientation: string;
  scale?: number;
};

/**
 * Export by cloning preview → PDF iframe → html2canvas slices.
 * Preview is the content source; iframe avoids Tailwind oklch blank renders.
 */
export async function renderPdfFromPreview(options: RenderPdfFromPreviewOptions): Promise<void> {
  const mount = await mountExportIframeFromPreview({
    previewRoot: options.previewRoot,
    styleVars: options.styleVars,
    lessonTitle: options.lessonTitle,
    printWidth: options.printWidth,
  });

  try {
    const { doc, exportRoot } = mount;
    const pdfWidth = options.pdf.internal.pageSize.getWidth();
    const pdfHeight = options.pdf.internal.pageSize.getHeight();
    const pageSlices =
      options.pageSlices ??
      measureExportRootPageSlices(
        exportRoot,
        pdfWidth,
        pdfHeight,
        getContinuationPageTopPad(options.styleVars)
      );

    await renderPdfFromExportRoot({
      doc,
      exportRoot,
      pdf: options.pdf,
      pageSlices,
      lang: options.lang,
      styleVars: options.styleVars,
      startPage: options.startPage,
      endPage: options.endPage,
      pageSize: options.pageSize,
      orientation: options.orientation,
      scale: options.scale,
    });
  } finally {
    unmountExportIframe(mount.iframe);
  }
}

export type RenderPdfFromExportRootOptions = {
  doc: Document;
  exportRoot: HTMLElement;
  pdf: jsPDF;
  pageSlices: PdfPageSlice[];
  lang: ExportLang;
  styleVars: PdfStyleVars;
  startPage: number;
  endPage: number;
  pageSize: string;
  orientation: string;
  scale?: number;
};

export async function renderPdfFromExportRoot(
  options: RenderPdfFromExportRootOptions
): Promise<void> {
  const {
    doc,
    exportRoot,
    pdf,
    pageSlices,
    lang,
    styleVars,
    startPage,
    endPage,
    pageSize,
    orientation,
    scale = 2,
  } = options;

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const exportWidthPx = Math.ceil(exportRoot.scrollWidth);
  const footerBandPx = PDF_FOOTER_BAND_PX;
  const footerPad = Math.max(styleVars.marginH, 40);
  const sourceHtml = exportRoot.outerHTML;

  const start = Math.max(1, startPage);
  const end = Math.min(pageSlices.length, endPage);

  for (let i = start - 1; i < end; i++) {
    const { offsetY, sliceHeight: sliceHeightPx, topPadPx = 0 } = pageSlices[i];
    const viewportHeightPx = sliceHeightPx + topPadPx;

    const pageViewport = doc.createElement('div');
    pageViewport.style.width = `${exportWidthPx}px`;
    pageViewport.style.height = `${viewportHeightPx}px`;
    pageViewport.style.overflow = 'hidden';
    pageViewport.style.position = 'relative';
    pageViewport.style.background = '#ffffff';
    pageViewport.style.boxSizing = 'border-box';
    pageViewport.style.display = 'flex';
    pageViewport.style.flexDirection = 'column';

    if (topPadPx > 0) {
      const topSpacer = doc.createElement('div');
      topSpacer.style.width = '100%';
      topSpacer.style.height = `${topPadPx}px`;
      topSpacer.style.flexShrink = '0';
      topSpacer.style.background = '#ffffff';
      pageViewport.appendChild(topSpacer);
    }

    const clipSlot = doc.createElement('div');
    clipSlot.style.width = '100%';
    clipSlot.style.height = `${sliceHeightPx}px`;
    clipSlot.style.overflow = 'hidden';
    clipSlot.style.position = 'relative';
    clipSlot.style.flexShrink = '0';

    const shiftedContent = doc.createElement('div');
    shiftedContent.style.width = `${exportWidthPx}px`;
    shiftedContent.style.transform = `translateY(-${offsetY}px)`;
    shiftedContent.innerHTML = sourceHtml;
    clipSlot.appendChild(shiftedContent);
    pageViewport.appendChild(clipSlot);
    doc.body.appendChild(pageViewport);

    const canvas = await html2canvas(pageViewport, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: exportWidthPx,
      height: viewportHeightPx,
      windowWidth: exportWidthPx,
      windowHeight: viewportHeightPx,
      onclone: (clonedDoc) => {
        sanitizeClonedDocumentForCanvas(clonedDoc);
      },
    });

    doc.body.removeChild(pageViewport);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imageRenderHeight = (canvas.height * pdfWidth) / canvas.width;
    const maxContentHeight = pdfHeight - footerBandPx;

    if (i > start - 1) {
      pdf.addPage(pageSize as any, orientation as any);
    }

    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      pdfWidth,
      Math.min(imageRenderHeight, maxContentHeight),
      undefined,
      'FAST'
    );

    const footerTop = pdfHeight - footerBandPx;
    const footerTextY = footerTop + 34;
    const pageLabel = `${i + 1} / ${pageSlices.length}`;
    const footerBrand = lang === 'kh' ? 'Khmer Lesson Doc' : 'Lesson Document';

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(footerPad, footerTop + 10, pdfWidth - footerPad, footerTop + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(footerBrand, footerPad, footerTextY);
    pdf.text(pageLabel, pdfWidth / 2, footerTextY, { align: 'center' });
    pdf.text(new Date().toLocaleDateString('en-GB'), pdfWidth - footerPad, footerTextY, {
      align: 'right',
    });
  }
}
