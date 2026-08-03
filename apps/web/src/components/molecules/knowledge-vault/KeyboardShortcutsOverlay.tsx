import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import OverlayPortal from '@/components/molecules/OverlayPortal';
import type { KeyboardShortcutSection } from '@/lib/knowledge-vault/keyboard-shortcuts';
import { overlayLayerClassNames, type OverlayLayer } from '@/lib/overlay-layer';
import { cn } from '@/lib/utils';

const PANEL_MOTION_MS = 0.15;

export interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  sections: KeyboardShortcutSection[];
  layer?: OverlayLayer;
}

function ShortcutKeyChip({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
      {label}
    </kbd>
  );
}

export default function KeyboardShortcutsOverlay({
  isOpen,
  onClose,
  sections,
  layer = 'default',
}: KeyboardShortcutsOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const layerClasses = overlayLayerClassNames(layer);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const panelMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: PANEL_MOTION_MS, ease: 'easeOut' as const },
      }
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { duration: PANEL_MOTION_MS, ease: 'easeOut' as const },
      };

  const backdropMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: PANEL_MOTION_MS, ease: 'easeOut' as const },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: PANEL_MOTION_MS, ease: 'easeOut' as const },
      };

  return (
    <AnimatePresence>
      {isOpen ? (
        <OverlayPortal>
          <motion.div
            {...backdropMotion}
            aria-hidden="true"
            className={cn('fixed inset-0 bg-black/40', layerClasses.backdrop)}
            data-testid="keyboard-shortcuts-backdrop"
            onClick={onClose}
          />
          <div
            className={cn(
              'pointer-events-none fixed inset-0 flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4',
              layerClasses.surface
            )}
          >
            <motion.div
              {...panelMotion}
              aria-labelledby="keyboard-shortcuts-title"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
              role="dialog"
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h2
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                  id="keyboard-shortcuts-title"
                >
                  Keyboard shortcuts
                </h2>
                <button
                  aria-label="Close keyboard shortcuts"
                  className="rounded p-1 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={onClose}
                  type="button"
                >
                  <X aria-hidden="true" size={20} />
                </button>
              </div>

              <div className="max-h-[min(70vh,28rem)] space-y-4 overflow-y-auto px-4 py-3">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.rows.map((row) => (
                        <li
                          className="flex items-start justify-between gap-3 text-sm"
                          key={`${section.title}-${row.description}`}
                        >
                          <span className="text-gray-600 dark:text-gray-300">
                            {row.description}
                          </span>
                          <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                            {row.keys.map((keyLabel, index) => (
                              <span
                                className="flex items-center gap-1"
                                key={`${row.description}-${keyLabel}`}
                              >
                                {index > 0 ? (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    /
                                  </span>
                                ) : null}
                                <ShortcutKeyChip label={keyLabel} />
                              </span>
                            ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </motion.div>
          </div>
        </OverlayPortal>
      ) : null}
    </AnimatePresence>
  );
}
