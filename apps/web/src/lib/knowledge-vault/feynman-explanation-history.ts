const DEFAULT_CHIP_MAX_LEN = 44;
const MAX_HISTORY = 3;

/** Prepend trimmed text, dedupe prior entry, cap at three newest-first. */
export function pushExplanationHistory(prev: string[], text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return prev;
  const without = prev.filter((entry) => entry !== trimmed);
  return [trimmed, ...without].slice(0, MAX_HISTORY);
}

/** Compact chip label with ellipsis when over maxLen. */
export function truncateExplanationChipLabel(text: string, maxLen = DEFAULT_CHIP_MAX_LEN): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
}
