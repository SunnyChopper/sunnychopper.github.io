import { cn } from '@/lib/utils';

export type LinearProgressBarVariant = 'default' | 'warning' | 'danger';

export type LinearProgressBarProps = {
  value: number;
  max?: number;
  variant?: LinearProgressBarVariant;
  className?: string;
  trackClassName?: string;
  label?: string;
  /** When true, bar width updates instantly (reduced-motion path). */
  disableTransition?: boolean;
};

const fillVariantClassName: Record<LinearProgressBarVariant, string> = {
  default: 'bg-blue-600 dark:bg-blue-500',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-red-600 dark:bg-red-500',
};

function clampPct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export default function LinearProgressBar({
  value,
  max = 100,
  variant = 'default',
  className,
  trackClassName,
  label,
  disableTransition = false,
}: LinearProgressBarProps) {
  const pct = clampPct(value, max);
  const ariaValue = Math.round(pct);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      aria-label={label}
      className={cn(
        'h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800',
        trackClassName,
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full',
          !disableTransition && 'transition-all duration-300 ease-out',
          fillVariantClassName[variant]
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
