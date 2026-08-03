/** Display formatting for sleep debt hours (aggregation stays server-side). */

export function formatSleepDebtHours(hours: number): string {
  return hours.toFixed(1);
}

export function sleepDebtStatusLine(loggedDays: number, debtHours: number): string {
  if (loggedDays === 0) {
    return 'Sleep debt · no sleep logged (7d)';
  }
  return `Sleep debt · ${formatSleepDebtHours(debtHours)}h short (7d)`;
}
