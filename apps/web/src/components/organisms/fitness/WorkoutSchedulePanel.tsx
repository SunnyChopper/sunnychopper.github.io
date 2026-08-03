import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { CalendarDays, AlertTriangle, GripVertical } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { FormInput, formFieldClassName } from '@/components/atoms/FormInput';
import {
  useWorkoutSchedule,
  useScheduledWorkoutDays,
  usePendingWorkoutSkips,
  useUpsertWorkoutScheduleMutation,
  usePatchScheduledWorkoutDayMutation,
  useSubmitWorkoutSkipReasonMutation,
  useFitnessTemplates,
  WEEKDAY_LABELS,
  cycleScheduleRole,
  BEGINNER_SCHEDULE_ROLES,
  rolesFromWeekdayEntries,
  weekdayEntriesFromRoles,
  swapScheduleRoles,
} from '@/hooks/useFitness';
import {
  SCHEDULE_ROLE_LABELS,
  formatScheduleStatusLabel,
  resolveDayCellStatus,
  type ScheduleRole,
} from '@/lib/fitness/workout-schedule-roles';
import { localCalendarDate, addCalendarDays } from '@/lib/date/local-calendar';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionPaddingClassName,
  fitnessCalloutClassName,
} from '@/lib/fitness/fitness-surfaces';
import type { ScheduleDayType, ScheduledWorkoutDay, WorkoutTemplate } from '@/types/fitness';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';

const selectClassName = cn(formFieldClassName, 'block w-full min-w-0');
const SAVE_NOTICE = 'Schedule saved · skip accountability armed';
const SAVE_NOTICE_MS = 5000;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    skip_pending: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
    skip_penalized: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    skip_excused: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    excused_off: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    rest: 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
  };
  return map[status] ?? map.scheduled;
}

export default function WorkoutSchedulePanel() {
  const today = localCalendarDate();
  const weekStart = addCalendarDays(today, -((new Date(`${today}T12:00:00`).getDay() + 6) % 7));
  const weekEnd = addCalendarDays(weekStart, 6);

  const { data: scheduleRes, isLoading: scheduleLoad } = useWorkoutSchedule();
  const { data: daysRes } = useScheduledWorkoutDays(weekStart, weekEnd);
  const { data: skipsRes } = usePendingWorkoutSkips();
  const { data: tplRes } = useFitnessTemplates(1, 50);

  const schedule = scheduleRes?.success ? scheduleRes.data : null;
  const templates: WorkoutTemplate[] = tplRes?.success ? (tplRes.data?.data ?? []) : [];
  const weekDays: ScheduledWorkoutDay[] = daysRes?.success ? (daysRes.data?.days ?? []) : [];
  const pendingSkips: ScheduledWorkoutDay[] = skipsRes?.success ? (skipsRes.data?.days ?? []) : [];

  const upsertSchedule = useUpsertWorkoutScheduleMutation();
  const patchDay = usePatchScheduledWorkoutDayMutation();
  const submitSkip = useSubmitWorkoutSkipReasonMutation();

  const [rolesDraft, setRolesDraft] = useState<ScheduleRole[] | null>(null);
  const [templateOverrides, setTemplateOverrides] = useState<
    Partial<Record<number, string | null>>
  >({});
  const [penaltyMin, setPenaltyMin] = useState(25);
  const [penaltyMax, setPenaltyMax] = useState(100);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [overrideType, setOverrideType] = useState<ScheduleDayType>('day_off');
  const [overrideReason, setOverrideReason] = useState('');
  const [skipDate, setSkipDate] = useState<string | null>(null);
  const [skipReasonText, setSkipReasonText] = useState('');
  const [lastVerdict, setLastVerdict] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [dragSourceWeekday, setDragSourceWeekday] = useState<number | null>(null);
  const [dragOverWeekday, setDragOverWeekday] = useState<number | null>(null);
  const saveNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!schedule) return;
    setPenaltyMin(schedule.penaltyMin);
    setPenaltyMax(schedule.penaltyMax);
  }, [schedule?.penaltyMin, schedule?.penaltyMax, schedule]);

  useEffect(() => {
    return () => {
      if (saveNoticeTimerRef.current) clearTimeout(saveNoticeTimerRef.current);
    };
  }, []);

  const clearSaveNotice = () => {
    if (saveNoticeTimerRef.current) {
      clearTimeout(saveNoticeTimerRef.current);
      saveNoticeTimerRef.current = null;
    }
    setSaveNotice(null);
  };

  const showSaveNotice = () => {
    clearSaveNotice();
    setSaveNotice(SAVE_NOTICE);
    saveNoticeTimerRef.current = setTimeout(() => {
      setSaveNotice(null);
      saveNoticeTimerRef.current = null;
    }, SAVE_NOTICE_MS);
  };

  const markBaselineEdited = () => {
    clearSaveNotice();
  };

  const effectiveRoles = useMemo((): ScheduleRole[] => {
    if (rolesDraft) return rolesDraft;
    if (schedule?.weekdays?.length) {
      return rolesFromWeekdayEntries(schedule.weekdays, templates);
    }
    return [...BEGINNER_SCHEDULE_ROLES];
  }, [rolesDraft, schedule, templates]);

  const effectiveBaseline = useMemo(
    () => weekdayEntriesFromRoles(effectiveRoles, templates, templateOverrides),
    [effectiveRoles, templates, templateOverrides]
  );

  const tplById = useMemo(() => {
    const m = new Map<string, WorkoutTemplate>();
    templates.forEach((t) => m.set(t.id, t));
    return m;
  }, [templates]);

  const statusByWeekday = useMemo(() => {
    const map = new Map<number, string>();
    weekDays.forEach((d) => {
      map.set(weekdayFromDate(d.date), d.status);
    });
    return map;
  }, [weekDays]);

  const saveBaseline = async () => {
    await upsertSchedule.mutateAsync({
      weekdays: effectiveBaseline,
      penaltyMin,
      penaltyMax,
      isActive: true,
    });
    setRolesDraft(null);
    setTemplateOverrides({});
    showSaveNotice();
  };

  const cycleWeekdayRole = (weekday: number) => {
    markBaselineEdited();
    const roles = [...effectiveRoles];
    roles[weekday] = cycleScheduleRole(roles[weekday]);
    setRolesDraft(roles);
    setTemplateOverrides((prev) => {
      const next = { ...prev };
      delete next[weekday];
      return next;
    });
  };

  const setWeekdayTemplate = (weekday: number, templateId: string | null) => {
    markBaselineEdited();
    setTemplateOverrides((prev) => ({ ...prev, [weekday]: templateId }));
  };

  const handleDragStart = (weekday: number) => {
    setDragSourceWeekday(weekday);
  };

  const handleDragOver = (event: DragEvent, weekday: number) => {
    event.preventDefault();
    setDragOverWeekday(weekday);
  };

  const handleDrop = (weekday: number) => {
    if (dragSourceWeekday === null || dragSourceWeekday === weekday) {
      setDragSourceWeekday(null);
      setDragOverWeekday(null);
      return;
    }
    markBaselineEdited();
    setRolesDraft(swapScheduleRoles(effectiveRoles, dragSourceWeekday, weekday));
    setTemplateOverrides((prev) => {
      const next = { ...prev };
      const fromOverride = next[dragSourceWeekday];
      const toOverride = next[weekday];
      if (fromOverride !== undefined) next[weekday] = fromOverride;
      else delete next[weekday];
      if (toOverride !== undefined) next[dragSourceWeekday] = toOverride;
      else delete next[dragSourceWeekday];
      return next;
    });
    setDragSourceWeekday(null);
    setDragOverWeekday(null);
  };

  const handleDragEnd = () => {
    setDragSourceWeekday(null);
    setDragOverWeekday(null);
  };

  const applyDateOverride = async () => {
    if (!selectedDate) return;
    await patchDay.mutateAsync({
      date: selectedDate,
      body: {
        dayType: overrideType,
        plannedReason: overrideType === 'day_off' ? overrideReason || undefined : undefined,
        templateId:
          overrideType === 'workout'
            ? (effectiveBaseline.find((e) => e.weekday === weekdayFromDate(selectedDate))
                ?.templateId ?? undefined)
            : undefined,
      },
    });
    setSelectedDate(null);
    setOverrideReason('');
  };

  const submitSkipReason = async () => {
    if (!skipDate || !skipReasonText.trim()) return;
    const res = await submitSkip.mutateAsync({ date: skipDate, reason: skipReasonText.trim() });
    if (res.success && res.data) {
      setLastVerdict(
        `${res.data.verdict}: ${res.data.rationale} (${res.data.pointsDeducted} pts deducted)`
      );
    }
    setSkipDate(null);
    setSkipReasonText('');
  };

  if (scheduleLoad) {
    return <p className="text-sm text-gray-500">Loading workout schedule…</p>;
  }

  return (
    <section className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName, 'space-y-6')}>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Workout schedule & accountability
        </h2>
      </div>

      {pendingSkips.length > 0 ? (
        <div className={fitnessCalloutClassName}>
          <div className="mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Pending skips ({pendingSkips.length})</span>
          </div>
          <ul className="space-y-1 text-sm">
            {pendingSkips.map((d) => (
              <li key={d.date} className="flex flex-wrap items-center gap-2">
                <span>{d.date}</span>
                {d.reasonDueBy ? (
                  <span className="text-xs text-amber-800 dark:text-amber-300">
                    due by {new Date(d.reasonDueBy).toLocaleString()}
                  </span>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSkipDate(d.date)}
                >
                  Explain skip
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {skipDate ? (
        <fieldset className="space-y-2">
          <p className="text-sm font-medium">Skip reason for {skipDate}</p>
          <Textarea
            className={cn(formFieldClassName, 'min-h-[80px] w-full')}
            value={skipReasonText}
            onChange={(e) => setSkipReasonText(e.target.value)}
            placeholder="Why did you miss this workout?"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={submitSkipReason}
              disabled={submitSkip.isPending || !skipReasonText.trim()}
            >
              Submit for AI review
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSkipDate(null)}>
              Cancel
            </Button>
          </div>
          {lastVerdict ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">{lastVerdict}</p>
          ) : null}
        </fieldset>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Weekly pattern (baseline)
        </h3>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Click to cycle · drag to swap days
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {WEEKDAY_LABELS.map((label, weekday) => {
            const entry = effectiveBaseline[weekday];
            const role = effectiveRoles[weekday];
            const roleLabel = SCHEDULE_ROLE_LABELS[role];
            const isDragging = dragSourceWeekday === weekday;
            const isDragOver = dragOverWeekday === weekday && dragSourceWeekday !== weekday;
            const cellStatus = resolveDayCellStatus({
              scheduleExists: Boolean(schedule),
              weekDayStatus: statusByWeekday.get(weekday),
              role,
            });

            return (
              <div
                key={label}
                draggable
                onDragStart={() => handleDragStart(weekday)}
                onDragOver={(event) => handleDragOver(event, weekday)}
                onDragLeave={() => setDragOverWeekday(null)}
                onDrop={() => handleDrop(weekday)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group cursor-grab rounded border border-gray-100 p-2 transition-shadow active:cursor-grabbing dark:border-gray-700',
                  isDragging && 'opacity-60',
                  isDragOver && 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <GripVertical
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-gray-400 transition-opacity dark:text-gray-500',
                      isDragging
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {label}
                  </span>
                  {cellStatus ? (
                    <span
                      className={cn(
                        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight',
                        statusBadge(cellStatus)
                      )}
                    >
                      {formatScheduleStatusLabel(cellStatus)}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => cycleWeekdayRole(weekday)}
                  className={cn(
                    'mt-1.5 w-full rounded-md px-1 py-0.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100'
                  )}
                  aria-label={`${label}: ${roleLabel}. Click to cycle role.`}
                >
                  {roleLabel}
                </button>
                {role !== 'rest' ? (
                  <Select
                    className={cn(selectClassName, 'mt-1 text-xs text-gray-600 dark:text-gray-400')}
                    value={entry.templateId ?? ''}
                    onChange={(e) => {
                      setWeekdayTemplate(weekday, e.target.value || null);
                    }}
                  >
                    <option value="">No template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Penalty min
            <FormInput
              type="number"
              className="mt-1 w-24"
              value={penaltyMin}
              onChange={(e) => {
                markBaselineEdited();
                setPenaltyMin(Number(e.target.value));
              }}
            />
          </label>
          <label className="text-sm">
            Penalty max
            <FormInput
              type="number"
              className="mt-1 w-24"
              value={penaltyMax}
              onChange={(e) => {
                markBaselineEdited();
                setPenaltyMax(Number(e.target.value));
              }}
            />
          </label>
          <Button
            type="button"
            size="sm"
            onClick={saveBaseline}
            disabled={upsertSchedule.isPending}
          >
            {schedule ? 'Update schedule' : 'Create schedule'}
          </Button>
        </div>
        {saveNotice ? (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400" role="status">
            {saveNotice}
          </p>
        ) : null}
      </div>

      {schedule ? (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            This week ({weekStart} – {weekEnd})
          </h3>
          <ul className="space-y-1">
            {weekDays.map((d) => (
              <li
                key={d.date}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-100 px-2 py-1.5 text-sm dark:border-gray-700"
              >
                <span>
                  {d.date}{' '}
                  <span className="text-gray-500">
                    ({d.dayType}
                    {d.templateId && tplById.get(d.templateId)
                      ? ` · ${tplById.get(d.templateId)!.name}`
                      : ''}
                    )
                  </span>
                </span>
                <span
                  className={cn('rounded px-2 py-0.5 text-xs font-medium', statusBadge(d.status))}
                >
                  {formatScheduleStatusLabel(d.status)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedDate(d.date);
                    setOverrideType('day_off');
                  }}
                >
                  Take day off
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Save a weekly pattern to enable schedule tracking and skip accountability.
        </p>
      )}

      {selectedDate ? (
        <fieldset className="space-y-2">
          <p className="text-sm font-medium">Override {selectedDate}</p>
          <Select
            className={selectClassName}
            value={overrideType}
            onChange={(e) => setOverrideType(e.target.value as ScheduleDayType)}
          >
            <option value="day_off">Day off (excused)</option>
            <option value="rest">Rest</option>
            <option value="workout">Workout</option>
          </Select>
          {overrideType === 'day_off' ? (
            <FormInput
              placeholder="Reason (trip, illness, …)"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
            />
          ) : null}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={applyDateOverride}
              disabled={patchDay.isPending}
            >
              Save override
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedDate(null)}>
              Cancel
            </Button>
          </div>
        </fieldset>
      ) : null}
    </section>
  );
}

function weekdayFromDate(isoDate: string): number {
  const d = new Date(`${isoDate}T12:00:00`);
  return (d.getDay() + 6) % 7;
}
