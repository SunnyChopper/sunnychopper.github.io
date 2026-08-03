import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';

export interface ScaleSelectorProps {
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
  /** Accessible name for the scale slider */
  'aria-label': string;
  className?: string;
  disabled?: boolean;
  /** Optional callback for haptic or other selection feedback (invoked on every commit). */
  onSelectFeedback?: (value: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snapFromClientX(clientX: number, rect: DOMRect, min: number, max: number): number {
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
  return Math.round(ratio * (max - min) + min);
}

function positionPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Continuous track + discrete snap thumb for subjective 1–N ratings
 * (sleep quality, energy, soreness, stress).
 */
export function ScaleSelector({
  min,
  max,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
  disabled = false,
  onSelectFeedback,
}: ScaleSelectorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [previewValue, setPreviewValue] = useState<number | null>(null);

  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const displayValue = previewValue ?? value ?? min;
  const hasCommittedValue = value != null;
  const thumbPercent = positionPercent(displayValue, min, max);
  const showFloatingLabel = isHovered || isFocused || isDragging;

  const commitValue = useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max);
      onChange(clamped);
      onSelectFeedback?.(clamped);
    },
    [min, max, onChange, onSelectFeedback]
  );

  const updateFromPointer = useCallback(
    (clientX: number, commit: boolean) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      const snapped = snapFromClientX(clientX, rect, min, max);
      setPreviewValue(snapped);
      if (commit) {
        commitValue(snapped);
      }
    },
    [min, max, commitValue]
  );

  const handleTrackPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    updateFromPointer(e.clientX, true);
  };

  const handleTrackPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !isDragging) return;
    updateFromPointer(e.clientX, true);
  };

  const handleTrackPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setPreviewValue(null);
    if (typeof e.currentTarget.releasePointerCapture === 'function') {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const current = value ?? min;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        commitValue(current + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        commitValue(current - 1);
        break;
      case 'Home':
        e.preventDefault();
        commitValue(min);
        break;
      case 'End':
        e.preventDefault();
        commitValue(max);
        break;
    }
  };

  return (
    <div
      className={cn('relative w-full py-3', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isDragging) setPreviewValue(null);
      }}
    >
      {showFloatingLabel ? (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2"
          style={{ left: `${thumbPercent}%` }}
          aria-hidden
        >
          <span
            className={cn(
              'inline-flex min-w-[1.75rem] items-center justify-center rounded-md px-1.5 py-0.5',
              'text-xs font-semibold tabular-nums shadow-sm',
              hasCommittedValue
                ? 'bg-primary text-white'
                : 'border border-gray-300 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            {displayValue}
          </span>
        </div>
      ) : null}

      <div
        ref={trackRef}
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value ?? min}
        aria-valuetext={hasCommittedValue ? String(value) : 'unset'}
        tabIndex={disabled ? -1 : 0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setPreviewValue(null);
        }}
        onKeyDown={handleKeyDown}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        onPointerCancel={handleTrackPointerUp}
        className={cn(
          'relative flex min-h-11 cursor-pointer touch-none select-none items-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
          'rounded-md',
          disabled && 'pointer-events-none cursor-not-allowed opacity-50'
        )}
      >
        <div className="relative h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          {options.map((n) => (
            <span
              key={n}
              className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-gray-300 dark:bg-gray-600"
              style={{ left: `${positionPercent(n, min, max)}%` }}
              aria-hidden
            />
          ))}

          <div
            className={cn(
              'absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
              'transition-[transform,background-color,box-shadow,border-color] duration-150',
              hasCommittedValue
                ? 'scale-110 border-primary bg-primary shadow-md'
                : 'scale-100 border-gray-400 bg-gray-300 dark:border-gray-500 dark:bg-gray-600',
              isDragging && 'scale-125'
            )}
            style={{ left: `${thumbPercent}%` }}
            data-testid="scale-selector-thumb"
          />
        </div>
      </div>
    </div>
  );
}
