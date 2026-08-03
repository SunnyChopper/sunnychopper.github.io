import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getLibraryFilterHeightTransition,
  getLibraryFilterPanelMotion,
} from '@/lib/knowledge-vault/library-filter-motion';

export interface LibraryFilterGridShellProps {
  filterKey: string;
  shouldReduceMotion: boolean;
  children: ReactNode;
}

/**
 * Cross-fades Library grid content when the type filter tab changes and eases
 * container height so the layout does not jump.
 */
export function LibraryFilterGridShell({
  filterKey,
  shouldReduceMotion,
  children,
}: LibraryFilterGridShellProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);
  const panelMotion = getLibraryFilterPanelMotion(shouldReduceMotion);
  const heightTransition = getLibraryFilterHeightTransition(shouldReduceMotion);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const updateHeight = () => {
      setMeasuredHeight(el.offsetHeight);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [filterKey]);

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={false}
      animate={{
        height: shouldReduceMotion ? 'auto' : (measuredHeight ?? 'auto'),
      }}
      transition={heightTransition}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={filterKey}
          ref={measureRef}
          className="w-full"
          initial={panelMotion.initial}
          animate={panelMotion.animate}
          exit={panelMotion.exit}
          transition={panelMotion.transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
