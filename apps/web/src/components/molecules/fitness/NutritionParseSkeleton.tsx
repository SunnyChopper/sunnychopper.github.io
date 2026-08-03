import { Skeleton } from '@/components/atoms/Skeleton';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionCompactPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';

export interface NutritionParseSkeletonProps {
  className?: string;
}

/** Geometry-matched pulse placeholder while nutrition parse is pending. */
export function NutritionParseSkeleton({ className }: NutritionParseSkeletonProps) {
  return (
    <div
      className={cn(fitnessSectionClassName, fitnessSectionCompactPaddingClassName, className)}
      aria-busy="true"
      aria-live="polite"
      data-testid="nutrition-parse-skeleton"
    >
      <Skeleton className="h-4 w-40" variant="text" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className="h-7 w-28" variant="rectangular" />
        <Skeleton className="h-7 w-32" variant="rectangular" />
        <Skeleton className="h-7 w-24" variant="rectangular" />
        <Skeleton className="h-7 w-36" variant="rectangular" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" variant="rectangular" />
        <Skeleton className="h-6 w-12 rounded-full" variant="rectangular" />
        <Skeleton className="h-6 w-12 rounded-full" variant="rectangular" />
        <Skeleton className="h-6 w-12 rounded-full" variant="rectangular" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-28" variant="rectangular" />
        <Skeleton className="h-9 w-16" variant="rectangular" />
      </div>
    </div>
  );
}
