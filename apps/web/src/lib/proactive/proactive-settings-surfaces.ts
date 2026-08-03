import { cardSurfaceClassName } from '@/components/atoms/Card';
import { cn } from '@/lib/utils';

/** Shared settings card shell for Proactive → Settings tab. */
export const proactiveSettingsCardClassName = cn(cardSurfaceClassName, 'p-4 md:p-5');

export const proactiveSettingsTitleClassName =
  'text-sm font-semibold text-gray-900 dark:text-white mb-1';

export const proactiveSettingsBenefitClassName =
  'text-xs text-gray-600 dark:text-gray-400 mb-3 max-w-2xl';

export const proactiveSettingsBodyClassName = 'space-y-3 max-w-2xl';

export const proactiveSettingsActionsClassName = 'mt-4 flex flex-wrap gap-2 items-center';

/** Rose tint + border when strict coach (or similar) is actively enabled. */
export const proactiveSettingsDangerCardClassName = cn(
  proactiveSettingsCardClassName,
  'border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20'
);

/** Read-only reference list — muted fill, not an editable form. */
export const proactiveSettingsReferenceCardClassName = cn(
  proactiveSettingsCardClassName,
  'bg-gray-50/80 dark:bg-gray-950/30'
);

export const proactiveSettingsReferenceListClassName =
  'text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside';

export const proactiveSettingsReferenceLabelClassName =
  'font-medium text-gray-800 dark:text-gray-200';

export type ProactiveSettingsTone = 'default' | 'danger' | 'reference';

export function proactiveSettingsCardClassForTone(tone: ProactiveSettingsTone): string {
  switch (tone) {
    case 'danger':
      return proactiveSettingsDangerCardClassName;
    case 'reference':
      return proactiveSettingsReferenceCardClassName;
    default:
      return proactiveSettingsCardClassName;
  }
}
