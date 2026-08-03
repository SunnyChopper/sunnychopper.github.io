import { useEffect, useState } from 'react';

interface ProjectGoalContributionWeightFieldProps {
  value: number;
  onCommit: (weight: number) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
}

export function ProjectGoalContributionWeightField({
  value,
  onCommit,
  disabled = false,
  label = 'Contribution weight',
}: ProjectGoalContributionWeightFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = async () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 1000) {
      setDraft(String(value));
      return;
    }
    if (parsed === value) return;
    setSaving(true);
    try {
      await onCommit(parsed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className="flex flex-col gap-1 text-xs min-w-[7rem]">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <input
        type="number"
        min={0.1}
        max={1000}
        step={0.1}
        value={draft}
        disabled={disabled || saving}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white"
        aria-label={label}
      />
    </label>
  );
}
