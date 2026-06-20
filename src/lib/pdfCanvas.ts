/** html2canvas cannot parse oklch/lab/lch color functions from Tailwind v4 CSS. */
export function sanitizeClonedDocumentForCanvas(doc: Document): void {
  doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const text = node.textContent || '';
    const href = (node as HTMLLinkElement).href || '';
    if (
      /oklch|oklab|color-mix|@layer|tailwind/i.test(text + href) ||
      node.hasAttribute('data-vite-dev-id')
    ) {
      node.remove();
    }
  });

  doc.querySelectorAll('[style]').forEach((el) => {
    const style = (el as HTMLElement).getAttribute('style') || '';
    if (/oklch|oklab|color-mix/i.test(style)) {
      (el as HTMLElement).removeAttribute('style');
    }
  });
}
