import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  fitnessModuleHeaderAccentClassName,
  fitnessModulePageHeaderPurposeClassName,
  fitnessModulePageHeaderShellClassName,
  fitnessModulePageHeaderTitleClassName,
  type FitnessModuleHeaderAccent,
} from '@/lib/fitness/fitness-surfaces';
import { assertFitnessModulePurpose } from '@/lib/fitness/fitness-module-page-header';
import { cn } from '@/lib/utils';

export interface FitnessModulePageHeaderProps {
  icon: LucideIcon;
  title: string;
  purpose: string;
  accent?: FitnessModuleHeaderAccent;
  actions?: ReactNode;
  className?: string;
}

export function FitnessModulePageHeader({
  icon: Icon,
  title,
  purpose,
  accent = 'blue',
  actions,
  className,
}: FitnessModulePageHeaderProps) {
  if (import.meta.env.DEV) {
    assertFitnessModulePurpose(purpose);
  }

  return (
    <div className={cn(fitnessModulePageHeaderShellClassName, className)}>
      <div className="min-w-0 flex-1">
        <h1 className={fitnessModulePageHeaderTitleClassName}>
          <Icon
            className={cn(
              'h-6 w-6 md:h-8 md:w-8 shrink-0',
              fitnessModuleHeaderAccentClassName[accent]
            )}
            aria-hidden
          />
          <span>{title}</span>
        </h1>
        <p className={fitnessModulePageHeaderPurposeClassName}>{purpose}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
