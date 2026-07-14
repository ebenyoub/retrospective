import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type DrawerSide = 'right' | 'bottom' | 'full';
type DrawerSize = 'sm' | 'md';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  overlayLabel: string;
  children: ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const Drawer = ({
  open,
  onClose,
  labelledBy,
  overlayLabel,
  children,
  side = 'right',
  size = 'md',
}: DrawerProps) => {
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const panel = panelRef.current;
    panel?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === panel)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  const sideClassName: Record<DrawerSide, string> = {
    right: 'right-0 top-0 h-full translate-x-0 border-l',
    bottom: 'inset-x-0 bottom-0 max-h-[70vh] translate-y-0 rounded-t-2xl border-t',
    full: 'inset-0 translate-x-0',
  };
  const sizeClassName: Record<DrawerSize, string> = {
    sm: 'w-[280px]',
    md: 'w-[420px]',
  };

  return (
    <div className="fixed inset-0 z-50" role="presentation" aria-hidden={!open}>
      <button
        type="button"
        aria-label={overlayLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/45"
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          'absolute flex flex-col overflow-hidden border-navy-border bg-navy-mid shadow-2xl transition-transform duration-200 ease-out focus:outline-none',
          sideClassName[side],
          side === 'right' && sizeClassName[size]
        )}
      >
        {children}
      </aside>
    </div>
  );
};

export default Drawer;
