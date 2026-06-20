import { useEffect, useState } from 'react';

function getScrollRoot(container: HTMLElement): HTMLElement | null {
  return (
    (container.closest('main') as HTMLElement | null) ??
    (document.querySelector('main.overflow-y-auto') as HTMLElement | null)
  );
}

export function useScrollSpy(containerRef: React.RefObject<HTMLElement | null>, headingIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || headingIds.length === 0) return;

    const scrollRoot = getScrollRoot(root);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        const first = visible[0]?.target.id;
        if (first) setActiveId(first);
      },
      { root: scrollRoot, rootMargin: '-15% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] }
    );

    headingIds.forEach((id) => {
      const el = root.querySelector(`#${CSS.escape(id)}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [containerRef, headingIds.join('|')]);

  return activeId;
}
