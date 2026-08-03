import { useEffect, useMemo, useState } from 'react';
import { Link2 } from 'lucide-react';
import type { Metric } from '@/types/growth-system';
import type { RecoveryLinkableField } from '@/types/fitness';
import { EntityLinkChip } from '@/components/atoms/EntityLinkChip';
import Combobox from '@/components/molecules/Combobox';
import { cn } from '@/lib/utils';

type Props = {
  field: RecoveryLinkableField;
  linkedMetricId: string | undefined;
  metrics: Metric[];
  onLink: (metricId: string) => Promise<void>;
  onUnlink: () => Promise<void>;
  disabled?: boolean;
};

export function RecoveryMetricLinkControl({
  field,
  linkedMetricId,
  metrics,
  onLink,
  onUnlink,
  disabled,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const linkedMetric = linkedMetricId ? metrics.find((m) => m.id === linkedMetricId) : undefined;

  const comboboxOptions = useMemo(
    () =>
      metrics.map((m) => ({
        value: m.id,
        label: `${m.name}${m.unit ? ` (${m.unit})` : ''}`,
      })),
    [metrics]
  );

  useEffect(() => {
    if (linkedMetricId) {
      setPickerOpen(false);
      setSearchQuery('');
    }
  }, [linkedMetricId]);

  const handleUnlink = async () => {
    setBusy(true);
    try {
      await onUnlink();
    } finally {
      setBusy(false);
    }
  };

  const handleComboboxChange = async (next: string) => {
    setSearchQuery(next);
    const match = metrics.find((m) => m.id === next);
    if (!match) return;
    setBusy(true);
    try {
      await onLink(match.id);
      setPickerOpen(false);
      setSearchQuery('');
    } finally {
      setBusy(false);
    }
  };

  if (linkedMetricId) {
    return (
      <EntityLinkChip
        id={linkedMetricId}
        type="metric"
        size="sm"
        label={linkedMetric?.name ?? linkedMetricId}
        onRemove={disabled || busy ? undefined : () => void handleUnlink()}
        removeAriaLabel={`Unlink metric from ${field}`}
        className="shrink-0"
      />
    );
  }

  if (pickerOpen) {
    return (
      <div className="min-w-[12rem] max-w-xs flex-1">
        <Combobox
          value={searchQuery}
          onChange={(next) => void handleComboboxChange(next)}
          options={comboboxOptions}
          disabled={disabled || busy}
          placeholder="Search metrics…"
          className="text-xs"
        />
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => {
            setPickerOpen(false);
            setSearchQuery('');
          }}
          className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => setPickerOpen(true)}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 text-xs text-gray-500 hover:text-gray-700',
        'disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200'
      )}
    >
      <Link2 className="h-3 w-3" aria-hidden />
      Link metric
    </button>
  );
}
