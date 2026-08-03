import type { ProgressRingColor } from '@/components/atoms/ProgressRing';

/** Clarity score 0–1 from POST /knowledge/ai/feynman/respond */
export function toClarityPercent(clarityScore: number | null | undefined): number | null {
  if (typeof clarityScore !== 'number' || Number.isNaN(clarityScore)) {
    return null;
  }
  return Math.min(100, Math.max(0, Math.round(clarityScore * 100)));
}

/** Ring color bands: red &lt;50%, amber 50–80%, green &gt;80%. */
export function clarityRingColor(percent: number | null): ProgressRingColor {
  if (percent == null) {
    return 'muted';
  }
  if (percent < 50) {
    return 'red';
  }
  if (percent > 80) {
    return 'green';
  }
  return 'amber';
}
