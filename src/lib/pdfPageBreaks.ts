/** Elements that should not be cut by manual page slices (html2canvas ignores CSS break-inside). */
export const PDF_BREAK_AVOID_SELECTOR =
  '[data-export-code-block], [data-code-block-wrap], .pdf-export-code-block, .pdf-code-block, pre, table, blockquote, .katex-display, img, h1, h2, h3, #content li';

export type PdfPageSlice = {
  offsetY: number;
  sliceHeight: number;
  /** White space at top of PDF page (page 2+), matching first-page margin. */
  topPadPx: number;
};

const MIN_SLICE_PX = 56;

export function getBoundsRelativeToRoot(
  root: HTMLElement,
  el: Element
): { top: number; bottom: number; height: number } {
  const rootRect = root.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - rootRect.top,
    bottom: rect.bottom - rootRect.top,
    height: rect.height,
  };
}

/** Keep only outermost break-avoid nodes (skip nested pre inside code blocks, etc.). */
export function getTopLevelBreakAvoidElements(root: HTMLElement): HTMLElement[] {
  const all = Array.from(root.querySelectorAll(PDF_BREAK_AVOID_SELECTOR)) as HTMLElement[];
  return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
}

function getCodePreElement(el: HTMLElement): HTMLElement | null {
  const tag = el.tagName.toLowerCase();
  if (tag === 'pre') return el;
  const pre = el.querySelector('pre');
  return pre instanceof HTMLElement ? pre : null;
}

/** Snap page break to the last full line of a pre/code block above sliceEnd. */
function snapSliceEndToPreLineBoundary(
  root: HTMLElement,
  pre: HTMLElement,
  sliceEnd: number,
  offsetY: number
): number | null {
  const rootTop = root.getBoundingClientRect().top;
  const rects = Array.from(pre.getClientRects());
  if (!rects.length) return null;

  let best: number | null = null;
  for (const rect of rects) {
    const bottom = rect.bottom - rootTop;
    if (bottom <= sliceEnd - 2 && bottom > offsetY + MIN_SLICE_PX) {
      best = bottom;
    }
  }
  return best;
}

/**
 * Build page slices that snap breaks before undivided blocks (code, tables, headings…).
 * Fixed-height slicing alone cuts through blocks because html2canvas ignores CSS page-break rules.
 */
export function computeSmartPageSlices(
  root: HTMLElement,
  maxSliceHeight: number,
  totalHeight: number,
  continuationTopPadPx = 0
): PdfPageSlice[] {
  if (totalHeight <= 0) {
    return [{ offsetY: 0, sliceHeight: 1, topPadPx: 0 }];
  }

  const pageContentHeight = Math.max(1, Math.floor(maxSliceHeight));
  const continuationPad = Math.max(0, Math.floor(continuationTopPadPx));
  const avoidElements = getTopLevelBreakAvoidElements(root);
  const slices: PdfPageSlice[] = [];
  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < totalHeight - 0.5) {
    const topPadPx = pageIndex === 0 ? 0 : continuationPad;
    const maxSlice = Math.max(1, pageContentHeight - topPadPx);
    let sliceEnd = Math.min(offsetY + maxSlice, totalHeight);

    if (sliceEnd < totalHeight - 0.5) {
      let breakBefore = sliceEnd;

      for (const el of avoidElements) {
        const { top, bottom, height } = getBoundsRelativeToRoot(root, el);
        if (height <= 0) continue;

        const crossesBreak = top < sliceEnd - 1 && bottom > sliceEnd + 1;
        if (!crossesBreak) continue;

        const pre = getCodePreElement(el);

        // Whole block fits on one page — start it on the next page instead of cutting
        if (height <= maxSlice + 1 && top > offsetY + 1) {
          breakBefore = Math.min(breakBefore, top);
          continue;
        }

        // Tall code block — break on full lines, never mid-line
        if (pre) {
          const snapped = snapSliceEndToPreLineBoundary(root, pre, sliceEnd, offsetY);
          if (snapped != null) {
            breakBefore = Math.min(breakBefore, snapped);
            continue;
          }
          if (top > offsetY + 1) {
            breakBefore = Math.min(breakBefore, top);
          }
          continue;
        }

        if (top > offsetY + 1) {
          breakBefore = Math.min(breakBefore, top);
        }
      }

      sliceEnd = Math.max(offsetY + 1, Math.min(breakBefore, totalHeight));

      if (sliceEnd <= offsetY + 1) {
        sliceEnd = Math.min(offsetY + maxSlice, totalHeight);
      }
    }

    const sliceHeight = Math.max(1, Math.ceil(sliceEnd - offsetY));
    slices.push({ offsetY, sliceHeight, topPadPx });
    offsetY += sliceHeight;
    pageIndex += 1;
  }

  return slices;
}
