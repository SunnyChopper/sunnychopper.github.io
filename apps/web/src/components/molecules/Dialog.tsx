import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import OverlayPortal from '@/components/molecules/OverlayPortal';
import { overlayLayerClassNames, type OverlayLayer } from '@/lib/overlay-layer';
import { cn } from '@/lib/utils';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DIALOG_MOTION_MS = 0.18;

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: DialogSize;
  /** When true, Tab cycles within the dialog and focus restores to the opener on close. */
  trapFocus?: boolean;
  /** Renders below the title row, stays visible while body scrolls (sticky within dialog). */
  stickySubheader?: ReactNode;
  /** Pinned below scroll body; never covers form fields. */
  footer?: ReactNode;
  /** Overlay z-index tier. `nested` sits above Note AI panel inside Edit Note. */
  layer?: OverlayLayer;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] mx-auto',
};

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  trapFocus = false,
  stickySubheader,
  footer,
  layer = 'default',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const layerClasses = overlayLayerClassNames(layer);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !trapFocus) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
  }, [isOpen, trapFocus]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (layer === 'nested') {
          e.stopImmediatePropagation();
        }
        onClose();
        return;
      }

      if (!trapFocus || e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const useCapture = layer === 'nested';
    document.addEventListener('keydown', handleKeyDown, useCapture);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, useCapture);

      if (trapFocus && previousFocusRef.current?.focus) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen, onClose, trapFocus, layer]);

  const panelMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DIALOG_MOTION_MS, ease: 'easeOut' as const },
      }
    : {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: DIALOG_MOTION_MS, ease: 'easeOut' as const },
      };

  const backdropMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DIALOG_MOTION_MS, ease: 'easeOut' as const },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DIALOG_MOTION_MS, ease: 'easeOut' as const },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <OverlayPortal>
          <motion.div
            {...backdropMotion}
            onClick={onClose}
            className={cn('fixed inset-0 bg-black/50', layerClasses.backdrop)}
          />
          <div
            className={cn(
              'fixed inset-0 flex items-center justify-center p-4 pointer-events-none overflow-y-auto',
              layerClasses.surface
            )}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'dialog-title' : undefined}
              {...panelMotion}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full min-w-0 pointer-events-auto relative my-4 flex flex-col',
                sizeClasses[size],
                size === 'full' && 'h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]',
                size === 'xl' && 'md:max-w-4xl max-h-[calc(100vh-4rem)]',
                size !== 'full' && size !== 'xl' && 'max-h-[calc(100vh-4rem)]',
                className
              )}
            >
              <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label="Close dialog"
                >
                  <X size={24} />
                </button>

                {title && (
                  <h3
                    id="dialog-title"
                    className="text-2xl font-bold pr-8 text-gray-900 dark:text-white"
                  >
                    {title}
                  </h3>
                )}
              </div>

              {stickySubheader ? <div className="flex-shrink-0">{stickySubheader}</div> : null}

              <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-4 text-gray-700 dark:text-gray-300">
                {children}
              </div>

              {footer ? (
                <div
                  data-testid="dialog-footer"
                  className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] bg-gray-50/90 backdrop-blur-sm dark:bg-gray-800/90"
                >
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </div>
        </OverlayPortal>
      )}
    </AnimatePresence>
  );
}
