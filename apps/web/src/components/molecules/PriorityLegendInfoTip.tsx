import InfoTip from '@/components/atoms/InfoTip';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { PRIORITIES, PRIORITY_INTENT_LABELS } from '@/constants/growth-system';

export default function PriorityLegendInfoTip() {
  return (
    <InfoTip label="What P1–P4 mean">
      <ul className="space-y-1.5">
        {PRIORITIES.map((priority) => (
          <li key={priority} className="flex items-center gap-2">
            <PriorityIndicator priority={priority} size="sm" variant="badge" />
            <span>
              {priority} — {PRIORITY_INTENT_LABELS[priority]}
            </span>
          </li>
        ))}
      </ul>
    </InfoTip>
  );
}
