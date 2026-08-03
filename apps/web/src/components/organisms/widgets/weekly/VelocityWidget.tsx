import type { WeeklyReviewCurrentDashboard } from '@/types/growth-system';
import type { VelocityWidgetConfig, WeeklyDashboardWidget } from '@/types/weekly-dashboard';
import { HabitVelocityInsightCallout } from '@/components/molecules/HabitVelocityInsightCallout';
import { VelocityChart } from '@/components/molecules/VelocityChart';

interface VelocityWidgetProps {
  widget: WeeklyDashboardWidget;
  data: WeeklyReviewCurrentDashboard;
}

export function VelocityWidget({ widget, data }: VelocityWidgetProps) {
  const cfg = widget.config as VelocityWidgetConfig;
  const rollingWindow = cfg.rollingWindow ?? 4;

  return (
    <div>
      <VelocityChart
        weeks={data.velocityData}
        currentWeekStart={data.weekStart}
        rollingAverages={data.rollingAverageStoryPoints}
        rollingWindow={rollingWindow}
      />
      {(data.statsPartial.projectsCompleted ?? 0) > 0 ||
      (data.statsPartial.projectCompletionPoints ?? 0) > 0 ? (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {data.statsPartial.projectsCompleted ?? 0} project
          {(data.statsPartial.projectsCompleted ?? 0) === 1 ? '' : 's'} completed
          {(data.statsPartial.projectCompletionPoints ?? 0) > 0
            ? ` · +${data.statsPartial.projectCompletionPoints} wallet bonus`
            : ''}
        </p>
      ) : null}
      <HabitVelocityInsightCallout correlations={data.habitVelocityCorrelations} />
    </div>
  );
}
