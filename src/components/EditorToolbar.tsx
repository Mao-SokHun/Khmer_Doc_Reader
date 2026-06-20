import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToolbarDropdownItem =
  | { type: 'divider' }
  | { type: 'header'; label: string }
  | {
      label: string;
      onClick: () => void;
      active?: boolean;
      keepOpen?: boolean;
      icon?: LucideIcon;
      iconOnly?: boolean;
      style?: React.CSSProperties;
    };

type ToolbarButtonProps = {
  icon?: LucideIcon;
  title?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
  buttonRef?: React.Ref<HTMLButtonElement>;
};

export function ToolbarButton({
  icon: Icon,
  title,
  onClick,
  active,
  className,
  children,
  buttonRef,
}: ToolbarButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={cn(
        'editor-toolbar-btn flex h-6 min-w-[24px] cursor-pointer items-center justify-center rounded p-1 text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700',
        active && 'editor-toolbar-btn-active bg-blue-100/80 text-blue-700 dark:bg-blue-900/45 dark:text-blue-300',
        className
      )}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function ToolbarDivider() {
  return <div className="editor-toolbar-divider mx-0.5 h-3 w-px self-center bg-slate-200 dark:bg-slate-600" />;
}

type ToolbarDropdownProps = {
  label: string;
  items: ToolbarDropdownItem[];
  id: string;
  type?: 'text' | 'font' | 'styles' | 'size' | 'zoom' | 'list';
  triggerIcon?: LucideIcon;
  activeDropdown: string | null;
  setActiveDropdown: React.Dispatch<React.SetStateAction<string | null>>;
  localize: (label: string) => string;
};

export function ToolbarDropdown({
  label,
  items,
  id,
  type = 'text',
  triggerIcon: TriggerIcon,
  activeDropdown,
  setActiveDropdown,
  localize,
}: ToolbarDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const isOpen = activeDropdown === id;

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const menuWidth = type === 'font' ? 260 : type === 'styles' ? 240 : type === 'size' ? 76 : 188;
      const viewportPadding = 8;
      const nextLeft = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - menuWidth - viewportPadding
      );
      setMenuPos({
        top: rect.bottom + 4,
        left: nextLeft,
        width: menuWidth,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, type]);

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setActiveDropdown(isOpen ? null : id)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'editor-toolbar-trigger flex h-6 cursor-pointer items-center gap-0.5 rounded px-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-700',
          isOpen && 'editor-toolbar-trigger-open bg-blue-100/80 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
          type === 'font'
            ? 'min-w-[58px]'
            : type === 'styles'
              ? 'min-w-[86px]'
              : type === 'zoom'
                ? 'min-w-[52px]'
                : type === 'size'
                  ? 'min-w-[42px]'
                  : type === 'list'
                    ? 'min-w-[30px]'
                    : 'min-w-[52px]'
        )}
      >
        {TriggerIcon ? (
          <TriggerIcon size={14} />
        ) : (
          <span
            className={cn(
              'truncate',
              type === 'font' ? 'max-w-[38px]' : type === 'styles' ? 'max-w-[68px]' : 'max-w-[34px]'
            )}
          >
            {label}
          </span>
        )}
        <ChevronDown size={12} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-editor-portal="dropdown"
              style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
              className="editor-dropdown fixed z-[260] max-h-[70vh] overflow-hidden overflow-y-auto rounded-lg border border-slate-300 bg-[#f8f9fa] py-1 shadow-xl dark:border-slate-600 dark:bg-slate-800"
            >
              {items.map((item, index) => {
                if ('type' in item && item.type === 'divider') {
                  return (
                    <div
                      key={`${id}-divider-${index}`}
                      className="editor-dropdown-divider my-1 border-t border-slate-300/80 dark:border-slate-600"
                    />
                  );
                }
                if ('type' in item && item.type === 'header') {
                  return (
                    <div
                      key={`${id}-header-${item.label}-${index}`}
                      className="editor-dropdown-header px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      {localize(item.label)}
                    </div>
                  );
                }
                return (
                  <button
                    type="button"
                    key={`${id}-item-${item.label}-${index}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      item.onClick();
                      if (!item.keepOpen) setActiveDropdown(null);
                    }}
                    className={cn(
                      'editor-dropdown-item flex w-full items-center justify-between px-4 py-1.5 text-left text-sm transition-colors hover:bg-slate-200/70 dark:hover:bg-slate-700',
                      item.active
                        ? 'editor-dropdown-item-active bg-slate-200/90 font-semibold text-slate-800 dark:bg-slate-700/90 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-200'
                    )}
                    style={item.style}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon ? <item.icon size={14} /> : null}
                      {!item.iconOnly && <span>{localize(item.label)}</span>}
                    </div>
                    {item.active && <Check size={14} className="text-slate-700 dark:text-slate-200" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
