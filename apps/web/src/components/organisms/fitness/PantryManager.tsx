import { useMemo, useRef, useState } from 'react';
import { EmptyState } from '@/components/molecules/EmptyState';
import { FormInput } from '@/components/atoms/FormInput';
import {
  useCreatePantryItemMutation,
  useDeletePantryItemMutation,
  useFitnessMealPlansList,
  useFitnessPantryList,
} from '@/hooks/useFitness';
import { pushToastNotification } from '@/hooks/use-toast';
import {
  COMMON_PANTRY_STAPLES,
  dedupePantryNames,
  extractIngredientNamesFromMealPlan,
  pickNewestMealPlan,
} from '@/lib/fitness/pantry-staples';
import { focusFirstIncompleteControl } from '@/lib/forms/focusFirstIncompleteControl';
import { cn } from '@/lib/utils';

interface PantryManagerProps {
  className?: string;
}

const STAPLE_CHIP_CLASS =
  'rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30';

export function PantryManager({ className }: PantryManagerProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useFitnessPantryList(1, 100);
  const { data: plansData } = useFitnessMealPlansList(1, 20);
  const createMut = useCreatePantryItemMutation();
  const deleteMut = useDeletePantryItemMutation();

  const items = data?.success ? (data.data?.data ?? []) : [];
  const existingNames = useMemo(() => items.map((item) => item.name), [items]);

  const savedPlans = plansData?.success ? (plansData.data?.data ?? []) : [];
  const newestPlan = useMemo(() => pickNewestMealPlan(savedPlans), [savedPlans]);
  const importNames = useMemo(
    () => (newestPlan ? extractIngredientNamesFromMealPlan(newestPlan) : []),
    [newestPlan]
  );
  const showImportChip = importNames.length > 0;

  const isBusy = createMut.isPending || isSeeding;

  const seedPantryNames = async (names: string[]) => {
    const toAdd = dedupePantryNames(names, existingNames);
    if (toAdd.length === 0) return;

    setIsSeeding(true);
    try {
      await Promise.all(
        toAdd.map((ingredientName) => createMut.mutateAsync({ name: ingredientName }))
      );
    } catch {
      pushToastNotification({
        type: 'error',
        title: 'Could not add ingredients',
        message: 'Some pantry items may not have been saved. Try again.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const qty = quantity.trim() ? Number(quantity) : undefined;
    await createMut.mutateAsync({
      name: trimmed,
      quantity: qty !== undefined && !Number.isNaN(qty) ? qty : undefined,
      unit: unit.trim() || undefined,
    });
    setName('');
    setQuantity('');
    setUnit('');
    focusFirstIncompleteControl([
      {
        id: 'pantry-name',
        isComplete: () => false,
        focus: () => nameInputRef.current?.focus(),
      },
    ]);
  };

  const handleAddCommonStaples = () => void seedPantryNames([...COMMON_PANTRY_STAPLES]);

  const handleImportFromLastPlan = () => void seedPantryNames(importNames);

  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pantry</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ingredients you have at home. Used by the meal planner to suggest meals.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FormInput
          ref={nameInputRef}
          id="pantry-ingredient-name"
          className="min-w-[140px] flex-1"
          placeholder="Ingredient name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleAdd();
          }}
        />
        <FormInput
          type="number"
          className="w-20"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <FormInput
          className="w-24"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={isBusy || !name.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {createMut.isPending && !isSeeding ? 'Adding…' : 'Add'}
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading pantry…</p>}
      {!isLoading && items.length === 0 && (
        <div className="space-y-4">
          <EmptyState
            scene="pantryEmpty"
            title="Your pantry is empty"
            description="Add a few staples so the meal planner can suggest meals from what you have at home."
            actionLabel={isSeeding ? 'Adding staples…' : 'Add common staples'}
            onAction={handleAddCommonStaples}
            actionDisabled={isBusy}
            density="compact"
          />
          <div
            role="group"
            aria-label="Quick-add pantry ingredients"
            className="flex flex-wrap justify-center gap-2"
          >
            {COMMON_PANTRY_STAPLES.map((staple) => (
              <button
                key={staple}
                type="button"
                className={STAPLE_CHIP_CLASS}
                disabled={isBusy}
                onClick={() => void seedPantryNames([staple])}
              >
                {staple}
              </button>
            ))}
            {showImportChip && (
              <button
                type="button"
                className={cn(
                  STAPLE_CHIP_CLASS,
                  'border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/30'
                )}
                disabled={isBusy}
                onClick={handleImportFromLastPlan}
              >
                Import from last plan
              </button>
            )}
          </div>
        </div>
      )}
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-900/40"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {item.name}
              {item.quantity != null && (
                <span className="ml-1 font-normal text-gray-500">
                  ({item.quantity}
                  {item.unit ? ` ${item.unit}` : ''})
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => deleteMut.mutate(item.id)}
              disabled={deleteMut.isPending}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
