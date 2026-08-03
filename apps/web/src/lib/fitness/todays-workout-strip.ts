import type { ScheduledWorkoutDay, WorkoutSession, WorkoutTemplate } from '@/types/fitness';
import { resolveTodaysStartTemplate } from '@/lib/fitness/todays-scheduled-template';

export type TodaysStripMode =
  | 'loading'
  | 'rest'
  | 'ready'
  | 'completed'
  | 'in_progress'
  | 'workout_unresolved'
  | 'no_schedule';

export type TodaysStripState =
  | { mode: 'loading' }
  | { mode: 'rest'; label: string }
  | { mode: 'ready'; templateId: string; templateName: string }
  | { mode: 'completed'; templateName?: string }
  | { mode: 'in_progress'; sessionId: string; templateName?: string }
  | { mode: 'workout_unresolved' }
  | { mode: 'no_schedule' };

export interface ResolveTodaysStripStateInput {
  day: ScheduledWorkoutDay | null | undefined;
  templates: WorkoutTemplate[];
  todaysSessions: WorkoutSession[];
  isLoading?: boolean;
}

function isRestDay(day: ScheduledWorkoutDay): boolean {
  if (day.dayType === 'rest' || day.dayType === 'day_off') return true;
  return day.status === 'rest' || day.status === 'excused_off';
}

function restLabel(day: ScheduledWorkoutDay): string {
  if (day.dayType === 'day_off' || day.status === 'excused_off') return 'Day off';
  return 'Rest day';
}

function templateNameForSession(
  session: WorkoutSession,
  templates: WorkoutTemplate[]
): string | undefined {
  if (!session.templateId) return undefined;
  return templates.find((t) => t.id === session.templateId)?.name;
}

export function resolveTodaysStripState({
  day,
  templates,
  todaysSessions,
  isLoading = false,
}: ResolveTodaysStripStateInput): TodaysStripState {
  if (isLoading) return { mode: 'loading' };

  const completedSession = todaysSessions.find((s) => s.status === 'completed');
  if (day?.status === 'completed' || completedSession) {
    const templateName =
      (completedSession ? templateNameForSession(completedSession, templates) : undefined) ??
      (day?.templateId ? templates.find((t) => t.id === day.templateId)?.name : undefined);
    return { mode: 'completed', templateName };
  }

  if (day && isRestDay(day)) {
    return { mode: 'rest', label: restLabel(day) };
  }

  const inProgressSession = todaysSessions.find((s) => s.status === 'in_progress');
  if (inProgressSession) {
    return {
      mode: 'in_progress',
      sessionId: inProgressSession.id,
      templateName: templateNameForSession(inProgressSession, templates),
    };
  }

  const scheduledStart = resolveTodaysStartTemplate(day, templates);
  if (scheduledStart) {
    return {
      mode: 'ready',
      templateId: scheduledStart.templateId,
      templateName: scheduledStart.templateName,
    };
  }

  if (day?.dayType === 'workout') {
    return { mode: 'workout_unresolved' };
  }

  if (!day) {
    return { mode: 'no_schedule' };
  }

  return { mode: 'no_schedule' };
}
