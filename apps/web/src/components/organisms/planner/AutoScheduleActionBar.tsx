import { Loader2 } from 'lucide-react';

import Button from '@/components/atoms/Button';

export interface AutoScheduleActionBarProps {
  onAutoSchedule: () => void;
  isBusy: boolean;
}

export function AutoScheduleActionBar({ onAutoSchedule, isBusy }: AutoScheduleActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        disabled={isBusy}
        aria-busy={isBusy}
        onClick={() => onAutoSchedule()}
      >
        {isBusy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Drafting…
          </>
        ) : (
          'Auto-schedule'
        )}
      </Button>
    </div>
  );
}
