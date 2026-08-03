import { useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import Button from '@/components/atoms/Button';
import {
  useCreateSessionMutation,
  useFitnessSessions,
  useFitnessTemplates,
  useScheduledWorkoutDays,
} from '@/hooks/useFitness';
import { localCalendarDate } from '@/lib/date/local-calendar';
import { fitnessCapacityZoneClassName } from '@/lib/fitness/fitness-surfaces';
import { resolveTodaysStartTemplate } from '@/lib/fitness/todays-scheduled-template';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';

export function TodayWorkoutCapacityRow() {
  const today = localCalendarDate();
  const navigate = useNavigate();
  const { data: scheduleRes, isLoading: scheduleLoading } = useScheduledWorkoutDays(today, today);
  const { data: tplRes } = useFitnessTemplates(1, 50);
  const { data: sessRes } = useFitnessSessions({
    page: 1,
    pageSize: 20,
    startDate: today,
    endDate: today,
  });
  const createSession = useCreateSessionMutation();

  const templates = tplRes?.success ? (tplRes.data?.data ?? []) : [];
  const sessions = sessRes?.success ? (sessRes.data?.data ?? []) : [];
  const todaysScheduledDay =
    scheduleRes?.success && scheduleRes.data?.days?.length
      ? (scheduleRes.data.days.find((d) => d.date === today) ?? scheduleRes.data.days[0])
      : undefined;

  const scheduledStart = useMemo(
    () => resolveTodaysStartTemplate(todaysScheduledDay, templates),
    [todaysScheduledDay, templates]
  );

  const activeSession = sessions.find((s) => s.sessionDate === today && s.status !== 'completed');

  const startScheduledTemplate = async () => {
    if (!scheduledStart) return;
    const res = await createSession.mutateAsync({
      templateId: scheduledStart.templateId,
      sessionDate: today,
    });
    if (res.success) {
      navigate(ROUTES.admin.healthFitnessWorkouts);
    }
  };

  let statusLine: string;
  let action: ReactNode = null;

  if (scheduleLoading) {
    statusLine = "Loading today's plan…";
  } else if (activeSession) {
    statusLine = 'Session in progress';
    action = (
      <Link
        to={ROUTES.admin.healthFitnessWorkouts}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Continue workout
      </Link>
    );
  } else if (scheduledStart) {
    statusLine = scheduledStart.templateName;
    action = (
      <Button
        type="button"
        size="sm"
        disabled={createSession.isPending}
        onClick={() => void startScheduledTemplate()}
      >
        Start {scheduledStart.templateName}
      </Button>
    );
  } else if (todaysScheduledDay?.dayType === 'rest' || todaysScheduledDay?.dayType === 'day_off') {
    statusLine = 'Rest day';
  } else {
    statusLine = 'No schedule set';
    action = (
      <Link
        to={ROUTES.admin.healthFitnessWorkouts}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Set schedule
      </Link>
    );
  }

  return (
    <section
      className={cn(fitnessCapacityZoneClassName, 'flex items-center justify-between gap-4')}
      aria-label="Today's training"
      data-testid="capacity-workout-row"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Dumbbell className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Training
          </p>
          <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
            {statusLine}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
