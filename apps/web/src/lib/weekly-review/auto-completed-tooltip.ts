export const AUTO_COMPLETED_TOOLTIP =
  'Review was finalized by the scheduled job; numbers are a frozen snapshot.';

export function autoCompletedTooltipWithPoints(ritualPointsAwarded?: number | null): string {
  if (ritualPointsAwarded && ritualPointsAwarded > 0) {
    return `${AUTO_COMPLETED_TOOLTIP} · +${ritualPointsAwarded} pts`;
  }

  return AUTO_COMPLETED_TOOLTIP;
}
