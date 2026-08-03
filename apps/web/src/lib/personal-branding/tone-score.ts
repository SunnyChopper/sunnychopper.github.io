export function formatToneScorePercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

export function humanizeToneMetricKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return key;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
