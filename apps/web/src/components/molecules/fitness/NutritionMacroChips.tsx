import { cn } from '@/lib/utils';

export interface NutritionMacroChipsProps {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  className?: string;
}

const CHIP_CLASS =
  'rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-mono text-gray-700 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-200';

/** Read-only macro summary chips for nutrition preview surfaces. */
export function NutritionMacroChips({
  calories,
  proteinGrams,
  carbGrams,
  fatGrams,
  fiberGrams,
  className,
}: NutritionMacroChipsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} data-testid="nutrition-macro-chips">
      <span className={CHIP_CLASS}>{calories} kcal</span>
      <span className={CHIP_CLASS}>P {proteinGrams}g</span>
      <span className={CHIP_CLASS}>C {carbGrams}g</span>
      <span className={CHIP_CLASS}>F {fatGrams}g</span>
      {fiberGrams != null && fiberGrams > 0 ? (
        <span className={CHIP_CLASS}>Fiber {fiberGrams}g</span>
      ) : null}
    </div>
  );
}
