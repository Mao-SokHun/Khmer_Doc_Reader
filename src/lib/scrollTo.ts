/** Scroll an element into view inside the app main pane (not the window). */
export function scrollElementIntoMainView(
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; block?: 'start' | 'center' | 'end' }
): void {
  const behavior = options?.behavior ?? 'smooth';
  const block = options?.block ?? 'center';
  const main =
    (element.closest('main') as HTMLElement | null) ??
    (document.querySelector('main.overflow-y-auto') as HTMLElement | null);

  if (!main) {
    element.scrollIntoView({ behavior, block });
    return;
  }

  const mainRect = main.getBoundingClientRect();
  const elRect = element.getBoundingClientRect();
  const elTopInMain = elRect.top - mainRect.top + main.scrollTop;

  let nextTop = elTopInMain;
  if (block === 'center') {
    nextTop = elTopInMain - main.clientHeight / 2 + elRect.height / 2;
  } else if (block === 'end') {
    nextTop = elTopInMain - main.clientHeight + elRect.height + 24;
  } else {
    nextTop = elTopInMain - 24;
  }

  main.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}

export function highlightElement(element: HTMLElement, durationMs = 900): () => void {
  const oldBg = element.style.backgroundColor;
  const oldTransition = element.style.transition;
  element.style.transition = 'background-color 0.2s ease';
  element.style.backgroundColor = 'rgba(59, 130, 246, 0.14)';

  const timer = window.setTimeout(() => {
    element.style.backgroundColor = oldBg;
    element.style.transition = oldTransition;
  }, durationMs);

  return () => window.clearTimeout(timer);
}
