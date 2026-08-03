import {
  costGuardrailsKpiCardClassName,
  costGuardrailsKpiGridClassName,
  costGuardrailsKpiLabelClassName,
  costGuardrailsKpiValueClassName,
} from '@/lib/observability/cost-guardrail-surfaces';
import type { CostGuardrailKpiCounts } from '@/lib/observability/cost-guardrail-helpers';

export type CostGuardrailsKpiStripProps = {
  counts: CostGuardrailKpiCounts;
};

const KPI_ITEMS: Array<{ key: keyof CostGuardrailKpiCounts; label: string }> = [
  { key: 'activeRules', label: 'Active rules' },
  { key: 'exceededRules', label: 'Exceeded' },
  { key: 'approachingRules', label: 'Approaching' },
  { key: 'pausedFeatures', label: 'Paused features' },
];

export default function CostGuardrailsKpiStrip({ counts }: CostGuardrailsKpiStripProps) {
  return (
    <div className={costGuardrailsKpiGridClassName}>
      {KPI_ITEMS.map(({ key, label }) => (
        <div key={key} className={costGuardrailsKpiCardClassName}>
          <p className={costGuardrailsKpiLabelClassName}>{label}</p>
          <p className={costGuardrailsKpiValueClassName}>{counts[key]}</p>
        </div>
      ))}
    </div>
  );
}
