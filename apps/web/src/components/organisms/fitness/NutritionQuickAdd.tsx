import { useEffect, useRef, useState } from 'react';
import type { MealType, NutritionParseAiData, ParsedNutritionResult } from '@/types/fitness';
import { useCreateNutritionMutation, useParseNutritionMutation } from '@/hooks/useFitness';
import { FormInput } from '@/components/atoms/FormInput';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField } from '@/components/molecules/FormField';
import { NutritionParsePreviewCard } from '@/components/molecules/fitness/NutritionParsePreviewCard';
import { NutritionParseSkeleton } from '@/components/molecules/fitness/NutritionParseSkeleton';
import { focusFirstIncompleteControl } from '@/lib/forms/focusFirstIncompleteControl';
import { cn } from '@/lib/utils';

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

type PanelMode = 'preview' | 'edit' | null;

function defaultParsed(): ParsedNutritionResult {
  return {
    foodItems: [],
    foodNameSummary: '',
    calories: 0,
    proteinGrams: 0,
    carbGrams: 0,
    fatGrams: 0,
    fiberGrams: 0,
    assumptions: [],
    confidence: 0,
    needsUserConfirmation: true,
  };
}

interface NutritionQuickAddProps {
  /** Optional deep-link metadata for future Household Meal Planner mounts. */
  plannerQueryExample?: string;
  className?: string;
}

export function NutritionQuickAdd({ plannerQueryExample, className }: NutritionQuickAddProps) {
  const [text, setText] = useState('');
  const [mealType, setMealType] = useState<MealType>('other');
  const [preview, setPreview] = useState<ParsedNutritionResult | null>(null);
  const [aiEnvelope, setAiEnvelope] = useState<NutritionParseAiData | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [lastParsedText, setLastParsedText] = useState('');
  const [manualMode, setManualMode] = useState(false);

  const sourceTextRef = useRef<HTMLTextAreaElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const parseMut = useParseNutritionMutation();
  const saveMut = useCreateNutritionMutation();

  const effective = preview ?? defaultParsed();
  const showEditPanel = panelMode === 'edit';
  const showPreviewPanel = panelMode === 'preview' && preview != null;

  const focusNutritionFields = () => {
    if (showEditPanel) {
      focusFirstIncompleteControl([
        {
          id: 'foodNameSummary',
          isComplete: () => effective.foodNameSummary.trim() !== '',
          focus: () => labelInputRef.current?.focus(),
        },
      ]);
      return;
    }

    focusFirstIncompleteControl([
      {
        id: 'sourceText',
        isComplete: () => text.trim() !== '',
        focus: () => sourceTextRef.current?.focus(),
      },
    ]);
  };

  useEffect(() => {
    focusNutritionFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + panel mode only
  }, []);

  useEffect(() => {
    if (!showEditPanel) return;
    focusNutritionFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- edit panel open
  }, [showEditPanel]);

  const clearPreviewState = () => {
    setPreview(null);
    setAiEnvelope(null);
    setPanelMode(null);
    setLastParsedText('');
    setManualMode(false);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (preview && value.trim() !== lastParsedText) {
      clearPreviewState();
    }
  };

  const handleParse = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const res = await parseMut.mutateAsync({ text: trimmed, useCache: true });
    if (res.success && res.data) {
      setAiEnvelope(res.data);
      setPreview(res.data.result);
      setLastParsedText(trimmed);
      setManualMode(false);
      setPanelMode('preview');
    }
  };

  const handleSave = async () => {
    const loggedAt = new Date().toISOString();
    const body = {
      loggedAt,
      mealType,
      foodName: effective.foodNameSummary || undefined,
      sourceText: text.trim() || undefined,
      calories: effective.calories,
      proteinGrams: effective.proteinGrams,
      carbGrams: effective.carbGrams,
      fatGrams: effective.fatGrams,
      fiberGrams: effective.fiberGrams || undefined,
      confidence: aiEnvelope?.confidence ?? effective.confidence,
      parseProvider: aiEnvelope?.provider ?? undefined,
      parseModel: aiEnvelope?.model || undefined,
    };
    const res = await saveMut.mutateAsync(body);
    if (res.success) {
      setText('');
      clearPreviewState();
      focusFirstIncompleteControl([
        {
          id: 'sourceText',
          isComplete: () => false,
          focus: () => sourceTextRef.current?.focus(),
        },
      ]);
    }
  };

  const updateField = <K extends keyof ParsedNutritionResult>(
    key: K,
    value: ParsedNutritionResult[K]
  ) => {
    setPreview((prev) => ({
      ...(prev ?? defaultParsed()),
      [key]: value,
    }));
  };

  const handleManualEntry = () => {
    setManualMode(true);
    setPreview((p) => p ?? defaultParsed());
    setPanelMode('edit');
  };

  const handleDismiss = () => {
    clearPreviewState();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {plannerQueryExample && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Planner deep-link contract (future): open nutrition with query{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{plannerQueryExample}</code>{' '}
          to pre-fill{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">sourceMealPlanId</code>,{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">sourceMealSlotId</code>,{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">sourceRecipeId</code>.
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <FormField label="Meal" htmlFor="nutrition-meal-type" className="min-w-[140px]">
          <Select
            id="nutrition-meal-type"
            className="w-full"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
          >
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>
        <button
          type="button"
          onClick={handleManualEntry}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Manual entry
        </button>
      </div>

      <FormField label="What did you eat?" htmlFor="nutrition-source-text">
        <Textarea
          ref={sourceTextRef}
          id="nutrition-source-text"
          className="min-h-[100px] w-full"
          placeholder="e.g. 8 oz chicken breast, rice, broccoli, olive oil"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </FormField>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleParse}
          disabled={parseMut.isPending || !text.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {parseMut.isPending ? 'Parsing…' : 'Parse with AI'}
        </button>
      </div>

      {parseMut.isError && (
        <p className="text-sm text-red-600">Could not parse. Try manual entry.</p>
      )}

      {parseMut.isPending && <NutritionParseSkeleton />}

      {showPreviewPanel && preview && (
        <NutritionParsePreviewCard
          result={preview}
          aiEnvelope={aiEnvelope}
          isLogging={saveMut.isPending}
          onConfirm={handleSave}
          onEdit={() => setPanelMode('edit')}
          onDismiss={handleDismiss}
        />
      )}

      {showEditPanel && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {manualMode && !aiEnvelope ? 'Manual macros' : 'Edit entry'}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Label" htmlFor="nutrition-food-label" required>
              <FormInput
                ref={labelInputRef}
                id="nutrition-food-label"
                className="w-full"
                value={effective.foodNameSummary}
                onChange={(e) => updateField('foodNameSummary', e.target.value)}
              />
            </FormField>
            <FormField label="Calories" htmlFor="nutrition-calories">
              <FormInput
                id="nutrition-calories"
                type="number"
                className="w-full"
                value={effective.calories}
                onChange={(e) => updateField('calories', Number(e.target.value))}
              />
            </FormField>
            <FormField label="Protein (g)" htmlFor="nutrition-protein">
              <FormInput
                id="nutrition-protein"
                type="number"
                className="w-full"
                value={effective.proteinGrams}
                onChange={(e) => updateField('proteinGrams', Number(e.target.value))}
              />
            </FormField>
            <FormField label="Carbs (g)" htmlFor="nutrition-carbs">
              <FormInput
                id="nutrition-carbs"
                type="number"
                className="w-full"
                value={effective.carbGrams}
                onChange={(e) => updateField('carbGrams', Number(e.target.value))}
              />
            </FormField>
            <FormField label="Fat (g)" htmlFor="nutrition-fat">
              <FormInput
                id="nutrition-fat"
                type="number"
                className="w-full"
                value={effective.fatGrams}
                onChange={(e) => updateField('fatGrams', Number(e.target.value))}
              />
            </FormField>
            <FormField label="Fiber (g)" htmlFor="nutrition-fiber">
              <FormInput
                id="nutrition-fiber"
                type="number"
                className="w-full"
                value={effective.fiberGrams}
                onChange={(e) => updateField('fiberGrams', Number(e.target.value))}
              />
            </FormField>
          </div>

          {effective.assumptions.length > 0 && (
            <ul className="mt-3 list-inside list-disc text-xs text-gray-600 dark:text-gray-400">
              {effective.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}

          {aiEnvelope && (
            <p className="mt-2 text-xs text-gray-500">
              Model confidence {Math.round((aiEnvelope.confidence ?? 0) * 100)}%
              {aiEnvelope.cached ? ' · cached' : ''}
              {effective.needsUserConfirmation ? ' · confirm macros if unsure' : ''}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMut.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saveMut.isPending ? 'Logging…' : 'Confirm & log'}
            </button>
            {aiEnvelope && preview ? (
              <button
                type="button"
                onClick={() => setPanelMode('preview')}
                disabled={saveMut.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
              >
                Back to preview
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDismiss}
              disabled={saveMut.isPending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
