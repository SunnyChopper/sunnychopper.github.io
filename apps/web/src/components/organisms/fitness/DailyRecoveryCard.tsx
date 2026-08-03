import { DailyRecoveryCheckIn } from '@/components/organisms/fitness/DailyRecoveryCheckIn';

/** Legacy section wrapper — prefer Capacity Hub + DailyRecoveryDialog on Overview. */
export function DailyRecoveryCard() {
  return <DailyRecoveryCheckIn />;
}
