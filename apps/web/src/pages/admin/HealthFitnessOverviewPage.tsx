import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { PageContainer } from '@/components/templates/PageContainer';
import { FitnessModulePageHeader } from '@/components/molecules/fitness/FitnessModulePageHeader';
import { TodayNutritionSummary } from '@/components/molecules/fitness/TodayNutritionSummary';
import { TodayWorkoutCapacityRow } from '@/components/molecules/fitness/TodayWorkoutCapacityRow';
import { AmbientPresenceStrip } from '@/components/organisms/assistant/AmbientPresenceStrip';
import { CapacityRecoveryHero } from '@/components/organisms/fitness/CapacityRecoveryHero';
import { DailyRecoveryDialog } from '@/components/organisms/fitness/DailyRecoveryDialog';

export default function HealthFitnessOverviewPage() {
  const [quickRecoveryOpen, setQuickRecoveryOpen] = useState(false);

  return (
    <PageContainer className="space-y-4">
      <FitnessModulePageHeader
        icon={LayoutGrid}
        title="Overview"
        purpose="Today's recovery, training plan, and fuel at a glance."
        accent="blue"
      />

      <div className="space-y-4" data-testid="capacity-hub">
        <CapacityRecoveryHero />
        <TodayWorkoutCapacityRow />
        <TodayNutritionSummary />
        <AmbientPresenceStrip surface="health" onQuickRecovery={() => setQuickRecoveryOpen(true)} />
      </div>

      <DailyRecoveryDialog
        isOpen={quickRecoveryOpen}
        onClose={() => setQuickRecoveryOpen(false)}
        quickMode
      />
    </PageContainer>
  );
}
