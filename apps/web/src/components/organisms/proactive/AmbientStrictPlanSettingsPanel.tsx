import { useEffect, useState } from 'react';
import Button from '@/components/atoms/Button';
import ProactiveSettingsCard from '@/components/molecules/proactive/ProactiveSettingsCard';
import { useProactiveMutations, useProactiveSettings } from '@/hooks/useProactive';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { AmbientStrictPlanConfig, PauseHours } from '@/types/api-contracts';

const DEFAULTS: AmbientStrictPlanConfig = {
  active: false,
  strictPlanRequestedDate: null,
  pausedUntil: null,
  pausePresets: [1, 4, 'restOfDay'],
};

function formatPauseLabel(hours: PauseHours): string {
  if (hours === 'restOfDay') return 'Rest of day';
  return `${hours}h`;
}

function formatStatus(data: AmbientStrictPlanConfig): string {
  if (data.active) return 'On for today';
  if (data.pausedUntil) {
    const until = new Date(data.pausedUntil);
    if (!Number.isNaN(until.getTime()) && until > new Date()) {
      return `Paused until ${until.toLocaleString()}`;
    }
  }
  if (data.strictPlanRequestedDate) return 'Off (cleared or expired)';
  return 'Off';
}

export function AmbientStrictPlanSettingsPanel() {
  const qc = useQueryClient();
  const { ambientStrictPlan } = useProactiveSettings();
  const { clearAmbientStrictPlan, pauseAmbientStrictPlan } = useProactiveMutations();
  const saved = ambientStrictPlan.data ?? DEFAULTS;
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get('section');
    if (section === 'strictPlan') {
      document.getElementById('strictPlan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const invalidateAmbient = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.chatbot.ambient('dashboard') });
    void qc.invalidateQueries({ queryKey: queryKeys.chatbot.ambient('growthTasks') });
  };

  const turnOff = async () => {
    setActionError(null);
    try {
      await clearAmbientStrictPlan.mutateAsync();
      invalidateAmbient();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to turn off strict plan');
    }
  };

  const pause = async (pauseHours: PauseHours) => {
    setActionError(null);
    try {
      await pauseAmbientStrictPlan.mutateAsync({ pauseHours });
      invalidateAmbient();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to pause strict plan');
    }
  };

  const busy = clearAmbientStrictPlan.isPending || pauseAmbientStrictPlan.isPending;

  return (
    <div id="strictPlan" className="scroll-mt-24">
      <ProactiveSettingsCard
        title="Strict plan mode"
        description="When you tap Strict plan on a task whisper, the assistant focuses on cutting scope. Turn off or pause reminders here."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg"
            disabled={busy || !saved.active}
            onClick={() => void turnOff()}
          >
            {clearAmbientStrictPlan.isPending ? 'Turning off…' : 'Turn off'}
          </Button>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Status: <span className="font-semibold">{formatStatus(saved)}</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {saved.pausePresets.map((preset) => (
            <button
              key={String(preset)}
              type="button"
              disabled={busy || !saved.active}
              onClick={() => void pause(preset)}
              className={cn(
                'min-h-[32px] rounded-md border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold',
                'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                'disabled:opacity-50 disabled:cursor-not-allowed transition'
              )}
            >
              Pause {formatPauseLabel(preset)}
            </button>
          ))}
        </div>
        {actionError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {actionError}
          </p>
        ) : null}
      </ProactiveSettingsCard>
    </div>
  );
}
