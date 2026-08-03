import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Dumbbell } from 'lucide-react';
import { PageContainer } from '@/components/templates/PageContainer';
import { FitnessModulePageHeader } from '@/components/molecules/fitness/FitnessModulePageHeader';
import Button from '@/components/atoms/Button';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { FormInput, formFieldClassName } from '@/components/atoms/FormInput';
import Combobox from '@/components/molecules/Combobox';
import MultiCombobox from '@/components/molecules/MultiCombobox';
import {
  useFitnessExercises,
  useFitnessTemplates,
  useFitnessSessions,
  useFitnessSessionSets,
  useOverloadSuggestion,
  useTemplateOverloadHints,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useAddSetMutation,
  useUpdateSetMutation,
  useCreateExerciseMutation,
  useCreateTemplateMutation,
  useScheduledWorkoutDays,
} from '@/hooks/useFitness';
import { localCalendarDate, addCalendarDays } from '@/lib/date/local-calendar';
import { findExerciseByNameInsensitive } from '@/lib/fitness/exercise-utils';
import {
  pushRecentExerciseId,
  readRecentExerciseIds,
  RECENT_CHIP_DISPLAY,
} from '@/lib/fitness/recent-exercises';
import { resolveTodaysStartTemplate } from '@/lib/fitness/todays-scheduled-template';
import { resolveTodaysStripState } from '@/lib/fitness/todays-workout-strip';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionPaddingClassName,
  fitnessSuccessCalloutClassName,
  fitnessInteractiveRowClassName,
} from '@/lib/fitness/fitness-surfaces';
import { TemplateExercisePreviewList } from '@/components/molecules/fitness/TemplateExercisePreviewList';
import { TodaysWorkoutStrip } from '@/components/molecules/fitness/TodaysWorkoutStrip';
import { SessionStartOverloadHints } from '@/components/molecules/fitness/SessionStartOverloadHints';
import WorkoutSchedulePanel from '@/components/organisms/fitness/WorkoutSchedulePanel';
import type { FitnessExercise, WorkoutSession, WorkoutSet, WorkoutTemplate } from '@/types/fitness';
import { Select } from '@/components/atoms/Select';

const selectClassName = cn(formFieldClassName, 'block w-full min-w-0');

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      <span className="mb-1.5 block">{children}</span>
      {hint ? <span className="mb-1.5 block text-xs font-normal text-gray-500">{hint}</span> : null}
    </label>
  );
}

export default function HealthFitnessWorkoutsPage() {
  const today = localCalendarDate();
  const start = addCalendarDays(today, -30);

  const { data: exRes, isLoading: exLoad } = useFitnessExercises(1, 100);
  const { data: tplRes, isLoading: tplLoad } = useFitnessTemplates(1, 50);
  const { data: sessRes, isLoading: sessLoad } = useFitnessSessions({
    page: 1,
    pageSize: 50,
    startDate: start,
    endDate: today,
  });
  const { data: todayScheduleRes, isLoading: todayScheduleLoad } = useScheduledWorkoutDays(
    today,
    today
  );

  const exercises = exRes?.success ? (exRes.data?.data ?? []) : [];
  const templates = tplRes?.success ? (tplRes.data?.data ?? []) : [];
  const sessions = sessRes?.success ? (sessRes.data?.data ?? []) : [];
  const todaysScheduledDay =
    todayScheduleRes?.success && todayScheduleRes.data?.days?.length
      ? (todayScheduleRes.data.days.find((d) => d.date === today) ?? todayScheduleRes.data.days[0])
      : undefined;

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        a.sessionDate < b.sessionDate ? 1 : a.sessionDate > b.sessionDate ? -1 : 0
      ),
    [sessions]
  );

  const todaysSessions = useMemo(
    () => sortedSessions.filter((s) => s.sessionDate === today),
    [sortedSessions, today]
  );

  const stripState = useMemo(
    () =>
      resolveTodaysStripState({
        day: todaysScheduledDay,
        templates,
        todaysSessions,
        isLoading: todayScheduleLoad || sessLoad,
      }),
    [todaysScheduledDay, templates, todaysSessions, todayScheduleLoad, sessLoad]
  );

  const sessionSectionRef = useRef<HTMLElement>(null);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const activeSession =
    selectedSessionId != null
      ? (sortedSessions.find((s) => s.id === selectedSessionId) ?? null)
      : (sortedSessions.find((s) => s.sessionDate === today) ?? sortedSessions[0] ?? null);

  const sessionId = selectedSessionId ?? activeSession?.id ?? null;

  const { data: setsRes } = useFitnessSessionSets(sessionId);
  const sets = setsRes?.success ? (setsRes.data?.data ?? []) : [];

  const createSession = useCreateSessionMutation();
  const updateSession = useUpdateSessionMutation();
  const addSet = useAddSetMutation(sessionId);
  const updateSet = useUpdateSetMutation(sessionId);
  const createExercise = useCreateExerciseMutation();
  const createTemplate = useCreateTemplateMutation();

  const [newExName, setNewExName] = useState('');
  const [recentExerciseIds, setRecentExerciseIds] = useState<string[]>(() =>
    readRecentExerciseIds()
  );
  const [tplName, setTplName] = useState('');
  const [tplExerciseIds, setTplExerciseIds] = useState<string[]>([]);
  const [startTemplateId, setStartTemplateId] = useState<string>('');
  const [templateSelectDirty, setTemplateSelectDirty] = useState(false);

  const scheduledStart = useMemo(
    () => resolveTodaysStartTemplate(todaysScheduledDay, templates),
    [todaysScheduledDay, templates]
  );

  useEffect(() => {
    if (templateSelectDirty || !scheduledStart) return;
    setStartTemplateId(scheduledStart.templateId);
  }, [scheduledStart, templateSelectDirty]);

  const [addExerciseId, setAddExerciseId] = useState<string>('');
  const { data: overloadRes } = useOverloadSuggestion(addExerciseId || null);
  const overload = overloadRes?.success ? overloadRes.data : null;

  const exById = useMemo(() => {
    const m = new Map<string, FitnessExercise>();
    exercises.forEach((e) => m.set(e.id, e));
    return m;
  }, [exercises]);

  const exerciseNameOptions = useMemo(() => exercises.map((e) => e.name), [exercises]);

  const exerciseLabelLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    exercises.forEach((e) => {
      lookup[e.id] = e.name;
    });
    return lookup;
  }, [exercises]);

  const matchingExercise = useMemo(
    () => findExerciseByNameInsensitive(exercises, newExName),
    [exercises, newExName]
  );

  const recentExerciseChips = useMemo(
    () =>
      recentExerciseIds
        .slice(0, RECENT_CHIP_DISPLAY)
        .map((id) => exById.get(id))
        .filter((e): e is FitnessExercise => e != null),
    [recentExerciseIds, exById]
  );

  const rememberRecentExercise = useCallback((id: string) => {
    setRecentExerciseIds(pushRecentExerciseId(id));
  }, []);

  useEffect(() => {
    if (readRecentExerciseIds().length > 0) return;

    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const s of sets) {
      if (!seen.has(s.exerciseId)) {
        seen.add(s.exerciseId);
        ordered.push(s.exerciseId);
      }
    }
    if (ordered.length === 0) return;

    for (let i = ordered.length - 1; i >= 0; i--) {
      pushRecentExerciseId(ordered[i]!);
    }
    setRecentExerciseIds(readRecentExerciseIds());
  }, [sets]);

  const handleTplExerciseIdsChange = useCallback(
    (next: string[]) => {
      const added = next.filter((id) => !tplExerciseIds.includes(id));
      for (const id of added) {
        rememberRecentExercise(id);
      }
      setTplExerciseIds(next);
    },
    [tplExerciseIds, rememberRecentExercise]
  );

  const handleAddExercise = async () => {
    const name = newExName.trim();
    if (!name || matchingExercise) return;

    const res = await createExercise.mutateAsync({ name });
    if (res.success && res.data?.id) {
      rememberRecentExercise(res.data.id);
    }
    setNewExName('');
  };

  const setsByExercise = useMemo(() => {
    const m = new Map<string, WorkoutSet[]>();
    sets.forEach((s) => {
      const arr = m.get(s.exerciseId) ?? [];
      arr.push(s);
      m.set(s.exerciseId, arr);
    });
    m.forEach((arr, k) => {
      arr.sort((a, b) => a.setIndex - b.setIndex);
      m.set(k, arr);
    });
    return m;
  }, [sets]);

  const currentSession = sortedSessions.find((s) => s.id === sessionId);
  const sessionTpl: WorkoutTemplate | undefined = templates.find(
    (t) => t.id === currentSession?.templateId
  );
  const templateOverloadTemplateId =
    sessionTpl && sessionTpl.exerciseIds.length > 0 ? sessionTpl.id : null;
  const { data: templateOverloadRes } = useTemplateOverloadHints(templateOverloadTemplateId);
  const templateOverloadSuggestions = templateOverloadRes?.success
    ? (templateOverloadRes.data?.suggestions ?? [])
    : [];

  const startFromTemplate = async (templateId?: string) => {
    const res = await createSession.mutateAsync({
      templateId: templateId ?? (startTemplateId || undefined),
      sessionDate: today,
    });
    if (res.success && res.data) {
      setSelectedSessionId(res.data.id);
    }
  };

  const handleStripStart = async (templateId: string) => {
    await startFromTemplate(templateId);
  };

  const handleContinueSession = useCallback((id: string) => {
    setSelectedSessionId(id);
    sessionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const nextSetIndexFor = (exerciseId: string) => {
    const cur = setsByExercise.get(exerciseId) ?? [];
    if (cur.length === 0) return 0;
    return Math.max(...cur.map((s) => s.setIndex)) + 1;
  };

  const submitSet = async () => {
    if (!sessionId || !addExerciseId) return;
    const ex = exById.get(addExerciseId);
    const targetReps = ex?.defaultRepRangeMax ?? 8;
    const weight = overload?.nextSuggestedWeight ?? 0;
    await addSet.mutateAsync({
      exerciseId: addExerciseId,
      setIndex: nextSetIndexFor(addExerciseId),
      targetReps,
      weight,
      completedReps: targetReps,
      isSuccessful: true,
      setType: 'working',
    });
    rememberRecentExercise(addExerciseId);
  };

  return (
    <PageContainer className="space-y-8">
      <FitnessModulePageHeader
        icon={Dumbbell}
        title="Workouts"
        purpose="Today's plan first — start a session, then tune schedule and library below."
        accent="violet"
      />

      <TodaysWorkoutStrip
        state={stripState}
        today={today}
        isStarting={createSession.isPending}
        onStart={handleStripStart}
        onContinueSession={handleContinueSession}
      />

      <WorkoutSchedulePanel />

      <section className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName)}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Library</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add exercises and build templates before you start a session.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <FieldLabel>New exercise</FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Combobox
                className="w-full flex-1"
                value={newExName}
                onChange={setNewExName}
                options={exerciseNameOptions}
                placeholder="Search or create…"
                isLoading={exLoad}
                allowCreate
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!newExName.trim() || !!matchingExercise || createExercise.isPending}
                onClick={handleAddExercise}
              >
                Add exercise
              </Button>
            </div>
            {matchingExercise ? (
              <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
                Already in library
              </p>
            ) : null}
            {recentExerciseChips.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recentExerciseChips.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setNewExName(ex.name)}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <FieldLabel htmlFor="template-name" hint="Search and add exercises in order.">
              New template
            </FieldLabel>
            <FormInput
              id="template-name"
              className="w-full"
              placeholder="Push day A"
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
            />
            {exLoad ? (
              <p className="text-xs text-gray-500">Loading exercises…</p>
            ) : exercises.length === 0 ? (
              <p className="text-xs text-gray-500">Add an exercise first.</p>
            ) : (
              <MultiCombobox
                value={tplExerciseIds}
                onChange={handleTplExerciseIdsChange}
                options={exercises.map((e) => ({ value: e.id, label: e.name }))}
                labelLookup={exerciseLabelLookup}
                placeholder="Search and add exercises…"
                isLoading={exLoad}
                hideSelectedPills
              />
            )}
            <TemplateExercisePreviewList
              exerciseIds={tplExerciseIds}
              nameById={exerciseLabelLookup}
              onChange={setTplExerciseIds}
            />
            <Button
              type="button"
              size="sm"
              disabled={!tplName.trim() || tplExerciseIds.length === 0 || createTemplate.isPending}
              onClick={async () => {
                await createTemplate.mutateAsync({
                  name: tplName.trim(),
                  exerciseIds: tplExerciseIds,
                });
                setTplName('');
                setTplExerciseIds([]);
              }}
            >
              Save template
            </Button>
          </div>
        </div>
        {(exLoad || tplLoad) && <p className="mt-3 text-xs text-gray-400">Loading library…</p>}
      </section>

      <section
        ref={sessionSectionRef}
        className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName)}
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Session</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Start new session</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Optionally pick a template, then create today&apos;s session ({today}).
            </p>
            <FieldLabel htmlFor="start-template">Template (optional)</FieldLabel>
            <Select
              id="start-template"
              className={selectClassName}
              value={startTemplateId}
              onChange={(e) => {
                setTemplateSelectDirty(true);
                setStartTemplateId(e.target.value);
              }}
            >
              <option value="">— none —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              size="sm"
              disabled={createSession.isPending}
              onClick={() => startFromTemplate()}
            >
              New session ({today})
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Active session</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Switch between recent sessions or mark the current one complete.
            </p>
            <FieldLabel htmlFor="active-session">Session</FieldLabel>
            <Select
              id="active-session"
              className={selectClassName}
              value={sessionId ?? ''}
              onChange={(e) => setSelectedSessionId(e.target.value || null)}
            >
              <option value="">— select —</option>
              {sortedSessions.map((s: WorkoutSession) => (
                <option key={s.id} value={s.id}>
                  {s.sessionDate} · {s.status}
                  {s.templateId ? ` · tpl` : ''}
                </option>
              ))}
            </Select>
            {sessionId && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={updateSession.isPending}
                onClick={() =>
                  updateSession.mutate({ id: sessionId, body: { status: 'completed' } })
                }
              >
                Mark completed
              </Button>
            )}
          </div>
        </div>
        {sessionTpl && sessionId && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Template order:{' '}
            {sessionTpl.exerciseIds.map((id) => exById.get(id)?.name ?? id).join(' → ')}
          </p>
        )}
      </section>

      {sessionId && sessionTpl && templateOverloadSuggestions.length > 0 && (
        <SessionStartOverloadHints
          suggestions={templateOverloadSuggestions}
          nameById={exerciseLabelLookup}
          selectedExerciseId={addExerciseId}
          onSelectExercise={setAddExerciseId}
        />
      )}

      {sessionId && (
        <section className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName)}>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Log sets</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose an exercise, review the overload hint, then add a working set.
          </p>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-end">
              <div>
                <FieldLabel htmlFor="log-exercise">Exercise</FieldLabel>
                <Select
                  id="log-exercise"
                  className={selectClassName}
                  value={addExerciseId}
                  onChange={(e) => setAddExerciseId(e.target.value)}
                >
                  <option value="">— choose —</option>
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </div>

              {overload && addExerciseId && (
                <div className={fitnessSuccessCalloutClassName} role="status">
                  <p className="font-medium">Overload suggestion</p>
                  {overload.lastSuccessfulWeight != null && (
                    <p className="mt-1">
                      Last success:{' '}
                      <strong>
                        {overload.lastSuccessfulWeight}
                        {overload.lastSuccessfulCompletedReps != null
                          ? ` × ${overload.lastSuccessfulCompletedReps}`
                          : ''}{' '}
                        {overload.unit}
                      </strong>
                    </p>
                  )}
                  <p className="mt-1">
                    Suggested weight: <strong>{overload.nextSuggestedWeight}</strong>{' '}
                    {overload.unit}
                  </p>
                  <p>
                    Target reps: {overload.nextSuggestedTargetRepsMin}–
                    {overload.nextSuggestedTargetRepsMax}
                  </p>
                  <p className="mt-2 text-xs text-emerald-800/90 dark:text-emerald-200/80">
                    {overload.recommendationReason}
                  </p>
                </div>
              )}

              <Button
                type="button"
                size="sm"
                variant="success"
                className="w-full sm:w-auto"
                onClick={submitSet}
                disabled={!addExerciseId || addSet.isPending}
              >
                Add working set
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {sessLoad && <p className="text-sm text-gray-500">Loading…</p>}
            {Array.from(setsByExercise.entries()).map(([exId, row]) => (
              <div key={exId}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {exById.get(exId)?.name ?? exId}
                </h3>
                <ul className="mt-2 space-y-2">
                  {row.map((st) => (
                    <SetRow
                      key={st.id}
                      s={st}
                      onPatch={(patch) => updateSet.mutate({ setId: st.id, body: patch })}
                      disabled={updateSet.isPending}
                    />
                  ))}
                </ul>
              </div>
            ))}
            {sets.length === 0 && !sessLoad && (
              <p className="text-sm text-gray-500">No sets yet for this session.</p>
            )}
          </div>
        </section>
      )}

      {!sessionId && !sessLoad && sortedSessions.length === 0 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Create a session to start logging sets.
        </p>
      )}
    </PageContainer>
  );
}

function SetRow({
  s,
  onPatch,
  disabled,
}: {
  s: WorkoutSet;
  onPatch: (p: {
    completedReps?: number;
    weight?: number;
    rpe?: number;
    isSuccessful?: boolean;
  }) => void;
  disabled?: boolean;
}) {
  const [reps, setReps] = useState(String(s.completedReps ?? ''));
  const [weight, setWeight] = useState(String(s.weight));
  const [rpe, setRpe] = useState(s.rpe != null ? String(s.rpe) : '');
  const [ok, setOk] = useState(s.isSuccessful);

  return (
    <li
      className={cn(
        fitnessInteractiveRowClassName,
        'grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-3 py-2 text-xs sm:gap-4 sm:py-3'
      )}
    >
      <span className="whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
        Set {s.setIndex + 1}
      </span>
      <label className="flex min-w-0 flex-col gap-1 text-gray-600 dark:text-gray-400">
        <span>Reps</span>
        <FormInput
          className="w-full min-w-0 py-1.5"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={() =>
            onPatch({
              completedReps: reps === '' ? undefined : Number(reps),
            })
          }
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-gray-600 dark:text-gray-400">
        <span>Weight</span>
        <FormInput
          className="w-full min-w-0 py-1.5"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={() => onPatch({ weight: Number(weight) })}
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-gray-600 dark:text-gray-400">
        <span>RPE</span>
        <FormInput
          className="w-full min-w-0 py-1.5"
          inputMode="decimal"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          onBlur={() => onPatch({ rpe: rpe === '' ? undefined : Number(rpe) })}
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
        <FormCheckbox
          checked={ok}
          disabled={disabled}
          onChange={(e) => {
            setOk(e.target.checked);
            onPatch({ isSuccessful: e.target.checked });
          }}
        />
        <span className="font-medium">OK</span>
      </label>
    </li>
  );
}
