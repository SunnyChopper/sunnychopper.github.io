import { type FocusEvent, type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getRecoveryEmptyFormHeightTransition,
  getRecoveryEmptyFormPanelMotion,
} from '@/lib/fitness/recovery-empty-form-motion';

export interface RecoveryEmptyFormShellProps {
  panelKey: 'empty' | 'form';
  shouldReduceMotion: boolean;
  children: ReactNode;
  onFormPanelAnimationComplete?: () => void;
  onFormPanelFocusOut?: (event: FocusEvent<HTMLDivElement>) => void;
  formPanelRef?: React.Ref<HTMLDivElement>;
  formPanelBlurCapture?: (event: FocusEvent<HTMLDivElement>) => void;
}

/**
 * Cross-fades recovery empty state and form panels with eased height so the card
 * does not jump when switching between them.
 */
export function RecoveryEmptyFormShell({
  panelKey,
  shouldReduceMotion,
  children,
  onFormPanelAnimationComplete,
  onFormPanelFocusOut,
  formPanelRef,
  formPanelBlurCapture,
}: RecoveryEmptyFormShellProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);
  const panelMotion = getRecoveryEmptyFormPanelMotion(shouldReduceMotion);
  const heightTransition = getRecoveryEmptyFormHeightTransition(shouldReduceMotion);

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
  }, [panelKey]);

  return (
    <motion.div
      className="relative mt-4 overflow-hidden"
      initial={false}
      animate={{
        height: shouldReduceMotion ? 'auto' : (measuredHeight ?? 'auto'),
      }}
      transition={heightTransition}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={panelKey}
          ref={measureRef}
          className="w-full"
          initial={panelMotion.initial}
          animate={panelMotion.animate}
          exit={panelMotion.exit}
          transition={panelMotion.transition}
          onAnimationComplete={() => {
            if (panelKey === 'form') onFormPanelAnimationComplete?.();
          }}
        >
          {panelKey === 'form' ? (
            <div
              ref={formPanelRef}
              onBlur={onFormPanelFocusOut}
              onBlurCapture={formPanelBlurCapture}
              className="space-y-4"
            >
              {children}
            </div>
          ) : (
            children
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
