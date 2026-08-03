import { motion, useReducedMotion } from 'framer-motion';

const SLATE = { r: 0x64, g: 0x74, b: 0x8b };
const TEAL = { r: 0x2d, g: 0xd4, b: 0xbf };

const SIZE_CONFIG = {
  compact: {
    dimension: 28,
    strokeWidth: 2,
    scoreClassName: 'font-mono text-[10px] font-semibold text-gray-700 dark:text-gray-200',
  },
  hero: {
    dimension: 88,
    strokeWidth: 6,
    scoreClassName: 'font-mono text-2xl font-bold text-gray-900 dark:text-white',
  },
} as const;

function scoreToStrokeColor(score: number): string {
  const t = Math.min(Math.max(score / 100, 0), 1);
  const r = Math.round(SLATE.r + (TEAL.r - SLATE.r) * t);
  const g = Math.round(SLATE.g + (TEAL.g - SLATE.g) * t);
  const b = Math.round(SLATE.b + (TEAL.b - SLATE.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export type RecoveryScoreRingSize = keyof typeof SIZE_CONFIG;

type RecoveryScoreRingProps = {
  score: number;
  size?: RecoveryScoreRingSize;
};

export function RecoveryScoreRing({ score, size = 'compact' }: RecoveryScoreRingProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { dimension, strokeWidth, scoreClassName } = SIZE_CONFIG[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const normalized = Math.min(Math.max(score, 0), 100);
  const displayScore = Math.round(normalized);
  const offset = circumference - (normalized / 100) * circumference;
  const strokeColor = scoreToStrokeColor(normalized);

  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 };

  const enterExitTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.2 };

  return (
    <motion.div
      role="img"
      aria-label={`Recovery score ${displayScore}`}
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={enterExitTransition}
    >
      <svg width={dimension} height={dimension} className="-rotate-90 transform" aria-hidden>
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset, stroke: strokeColor }}
          transition={springTransition}
        />
      </svg>
      <span className={scoreClassName}>{displayScore}</span>
    </motion.div>
  );
}
