/** Shared surface tokens for Observability Cost guardrails UI. */

import {
  obsKpiLabelClassName,
  obsPageSectionTitleClassName,
  obsPanelClassName,
  obsSectionDescriptionClassName,
} from '@/lib/observability/observability-surfaces';

export const costGuardrailsSectionClassName = 'space-y-6';

export const costGuardrailsKpiGridClassName = 'grid grid-cols-2 gap-3 sm:grid-cols-4';

export const costGuardrailsKpiCardClassName = `${obsPanelClassName} p-4`;

export const costGuardrailsKpiLabelClassName = obsKpiLabelClassName;

export const costGuardrailsKpiValueClassName =
  'mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white';

export const costGuardrailsRuleListClassName = 'space-y-4';

export const costGuardrailsFeatureListClassName =
  'divide-y divide-gray-200/80 dark:divide-gray-700/70';

export const costGuardrailsFeatureRowClassName =
  'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0';

export const costGuardrailsSectionTitleClassName = obsPageSectionTitleClassName;

export const costGuardrailsSectionDescriptionClassName = obsSectionDescriptionClassName;

export const costGuardrailsSubsectionTitleClassName =
  'text-sm font-semibold text-gray-900 dark:text-white';

export const costGuardrailsLoadingPanelClassName = `${obsPanelClassName} p-8`;
