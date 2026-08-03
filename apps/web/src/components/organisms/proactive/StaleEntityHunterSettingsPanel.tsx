import { useEffect, useState } from 'react';
import Button from '@/components/atoms/Button';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { FormInput } from '@/components/atoms/FormInput';
import ProactiveSettingsCard from '@/components/molecules/proactive/ProactiveSettingsCard';
import { useProactiveMutations, useProactiveSettings } from '@/hooks/useProactive';
import type { StaleEntityHunterPreferencesConfig } from '@/types/api-contracts';

const DEFAULTS: StaleEntityHunterPreferencesConfig = {
  staleDays: 14,
  maxCandidates: 8,
  includeProjects: true,
  includeGoals: true,
  includeHabits: true,
};

export function StaleEntityHunterSettingsPanel() {
  const { staleEntityHunter } = useProactiveSettings();
  const { setStaleEntityHunterPreferences } = useProactiveMutations();
  const saved = staleEntityHunter.data ?? DEFAULTS;
  const [draft, setDraft] = useState<StaleEntityHunterPreferencesConfig>(saved);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (staleEntityHunter.data) {
      setDraft(staleEntityHunter.data);
    }
  }, [staleEntityHunter.data]);

  const save = async () => {
    setSaveError(null);
    try {
      await setStaleEntityHunterPreferences.mutateAsync(draft);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <ProactiveSettingsCard
      title="Stale Entity Hunter"
      description="Surface quiet projects, goals, and habits as Archive / Kill / Revive decisions."
      actions={
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="rounded-lg"
          disabled={setStaleEntityHunterPreferences.isPending}
          onClick={() => void save()}
        >
          {setStaleEntityHunterPreferences.isPending ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Stale after (days)
        <FormInput
          type="number"
          min={1}
          max={365}
          className="mt-1 w-full max-w-xs"
          value={draft.staleDays}
          onChange={(e) =>
            setDraft((d) => ({ ...d, staleDays: Number(e.target.value) || DEFAULTS.staleDays }))
          }
        />
      </label>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Max candidates per run
        <FormInput
          type="number"
          min={1}
          max={20}
          className="mt-1 w-full max-w-xs"
          value={draft.maxCandidates}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              maxCandidates: Number(e.target.value) || DEFAULTS.maxCandidates,
            }))
          }
        />
      </label>
      <div className="flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300">
        {(
          [
            ['includeProjects', 'Projects'],
            ['includeGoals', 'Goals'],
            ['includeHabits', 'Habits'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-2">
            <FormCheckbox
              checked={draft[key]}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>
      {saveError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {saveError}
        </p>
      ) : null}
    </ProactiveSettingsCard>
  );
}
