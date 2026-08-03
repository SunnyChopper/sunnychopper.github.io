import type { ScheduledWorkoutDay, WorkoutTemplate } from '@/types/fitness';

export interface TodaysStartTemplate {
  templateId: string;
  templateName: string;
}

export function resolveTodaysStartTemplate(
  day: ScheduledWorkoutDay | null | undefined,
  templates: WorkoutTemplate[]
): TodaysStartTemplate | null {
  if (!day || day.dayType !== 'workout') return null;

  const templateId = day.templateId?.trim();
  if (!templateId) return null;

  const template = templates.find((t) => t.id === templateId);
  if (!template) return null;

  return { templateId: template.id, templateName: template.name };
}
