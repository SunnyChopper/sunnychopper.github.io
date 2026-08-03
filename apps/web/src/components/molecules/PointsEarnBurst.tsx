import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const SCALE_DURATION = 0.32;
const PARTICLE_DURATION = 0.45;

type PointsEarnBurstProps = {
  /** Changes on each earn to replay the burst. */
  pulseKey: number | string;
  /** Points delta shown as +N on the particle. */
  delta: number;
  children: ReactNode;
  className?: string;
};

export function PointsEarnBurst({ pulseKey, delta, children, className }: PointsEarnBurstProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  if (shouldReduceMotion || delta <= 0) {
    return <span className={className}>{children}</span>;
  }

  const scaleTransition = {
    duration: SCALE_DURATION,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  const particleTransition = {
    duration: PARTICLE_DURATION,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  return (
    <span className={`relative inline-flex items-center ${className ?? ''}`}>
      <motion.span
        key={`scale-${pulseKey}`}
        className="inline-flex"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={scaleTransition}
      >
        {children}
      </motion.span>
      <motion.span
        key={`particle-${pulseKey}`}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [-2, -16] }}
        transition={particleTransition}
      >
        +{delta}
      </motion.span>
    </span>
  );
}
