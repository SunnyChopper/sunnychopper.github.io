import { Coffee } from 'lucide-react';
import { PageContainer } from '@/components/templates/PageContainer';
import { FitnessModulePageHeader } from '@/components/molecules/fitness/FitnessModulePageHeader';
import { MealPlanner } from '@/components/organisms/fitness/MealPlanner';
import { NutritionQuickAdd } from '@/components/organisms/fitness/NutritionQuickAdd';
import { NutritionRecentMealsSection } from '@/components/organisms/fitness/NutritionRecentMealsSection';
import { PantryManager } from '@/components/organisms/fitness/PantryManager';
import { useFitnessNutritionList } from '@/hooks/useFitness';
import { localCalendarDate, addCalendarDays } from '@/lib/date/local-calendar';

export default function HealthFitnessNutritionPage() {
  const end = localCalendarDate();
  const start = addCalendarDays(end, -14);
  const { data, isLoading } = useFitnessNutritionList({
    startDate: start,
    endDate: end,
    pageSize: 30,
  });

  const rows = data?.success ? (data.data?.data ?? []) : [];

  return (
    <PageContainer className="space-y-8">
      <FitnessModulePageHeader
        icon={Coffee}
        title="Nutrition"
        purpose="Log meals, manage your pantry, and plan from ingredients at home."
        accent="emerald"
      />

      <PantryManager />

      <MealPlanner recentEntries={rows} />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Quick add</h2>
        <NutritionQuickAdd />
      </section>

      <NutritionRecentMealsSection entries={rows} isLoading={isLoading} />
    </PageContainer>
  );
}
