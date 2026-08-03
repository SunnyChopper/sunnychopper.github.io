import type {
  ScheduleDayType,
  WorkoutScheduleWeekdayEntry,
  WorkoutTemplate,
} from '@/types/fitness';

export type ScheduleRole = 'push' | 'pull' | 'legs' | 'rest';

export const BEGINNER_SCHEDULE_ROLES = [
  'push',
  'pull',
  'legs',
  'rest',
  'push',
  'pull',
  'rest',
] as const satisfies readonly ScheduleRole[];

export const SCHEDULE_ROLE_CYCLE: ScheduleRole[] = ['push', 'pull', 'legs', 'rest'];

export const SCHEDULE_ROLE_LABELS: Record<ScheduleRole, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  rest: 'Rest',
};

export function roleToDayType(role: ScheduleRole): ScheduleDayType {
  return role === 'rest' ? 'rest' : 'workout';
}

export function cycleScheduleRole(role: ScheduleRole): ScheduleRole {
  const idx = SCHEDULE_ROLE_CYCLE.indexOf(role);
  return SCHEDULE_ROLE_CYCLE[(idx + 1) % SCHEDULE_ROLE_CYCLE.length];
}

export function defaultWeekdayEntries(): WorkoutScheduleWeekdayEntry[] {
  return BEGINNER_SCHEDULE_ROLES.map((role, weekday) => ({
    weekday,
    dayType: roleToDayType(role),
    templateId: null,
  }));
}

function templateHaystack(template: WorkoutTemplate): string {
  return `${template.name ?? ''} ${template.split ?? ''}`.toLowerCase();
}

export function matchTemplateForRole(
  role: ScheduleRole,
  templates: WorkoutTemplate[]
): string | null {
  if (role === 'rest') return null;
  const needle = role === 'legs' ? 'leg' : role;
  const match = templates.find((t) => templateHaystack(t).includes(needle));
  return match?.id ?? null;
}

export function inferRoleFromEntry(
  entry: WorkoutScheduleWeekdayEntry,
  templates: WorkoutTemplate[]
): ScheduleRole {
  if (entry.dayType === 'rest' || entry.dayType === 'day_off') {
    return 'rest';
  }

  if (entry.templateId) {
    const tpl = templates.find((t) => t.id === entry.templateId);
    if (tpl) {
      const haystack = templateHaystack(tpl);
      if (haystack.includes('push')) return 'push';
      if (haystack.includes('pull')) return 'pull';
      if (haystack.includes('leg')) return 'legs';
    }
  }

  return 'push';
}

export function entryFromRole(
  role: ScheduleRole,
  weekday: number,
  templates: WorkoutTemplate[],
  options?: { templateId?: string | null }
): WorkoutScheduleWeekdayEntry {
  if (role === 'rest') {
    return { weekday, dayType: 'rest', templateId: null };
  }

  const templateId =
    options?.templateId !== undefined ? options.templateId : matchTemplateForRole(role, templates);

  return { weekday, dayType: 'workout', templateId };
}

export function swapWeekdayEntries(
  entries: WorkoutScheduleWeekdayEntry[],
  fromWeekday: number,
  toWeekday: number
): WorkoutScheduleWeekdayEntry[] {
  const copy = entries.map((e) => ({ ...e }));
  const fromIdx = copy.findIndex((e) => e.weekday === fromWeekday);
  const toIdx = copy.findIndex((e) => e.weekday === toWeekday);
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return copy;

  const fromEntry = copy[fromIdx];
  const toEntry = copy[toIdx];
  copy[fromIdx] = { ...toEntry, weekday: fromWeekday };
  copy[toIdx] = { ...fromEntry, weekday: toWeekday };
  return copy;
}

export function rolesFromWeekdayEntries(
  entries: WorkoutScheduleWeekdayEntry[],
  templates: WorkoutTemplate[]
): ScheduleRole[] {
  return entries.map((entry) => inferRoleFromEntry(entry, templates));
}

export function weekdayEntriesFromRoles(
  roles: readonly ScheduleRole[],
  templates: WorkoutTemplate[],
  templateOverrides: Partial<Record<number, string | null>> = {}
): WorkoutScheduleWeekdayEntry[] {
  return roles.map((role, weekday) => {
    const override = Object.prototype.hasOwnProperty.call(templateOverrides, weekday)
      ? (templateOverrides[weekday] ?? null)
      : undefined;
    return entryFromRole(role, weekday, templates, { templateId: override });
  });
}

export function swapScheduleRoles(
  roles: ScheduleRole[],
  fromWeekday: number,
  toWeekday: number
): ScheduleRole[] {
  const copy = [...roles];
  const tmp = copy[fromWeekday];
  copy[fromWeekday] = copy[toWeekday];
  copy[toWeekday] = tmp;
  return copy;
}

export function formatScheduleStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

/** Status pill on baseline day cells when a schedule exists; null when no schedule. */
export function resolveDayCellStatus(options: {
  scheduleExists: boolean;
  weekDayStatus?: string | null;
  role: ScheduleRole;
}): string | null {
  if (!options.scheduleExists) return null;
  if (options.weekDayStatus) return options.weekDayStatus;
  return options.role === 'rest' ? 'rest' : 'scheduled';
}
