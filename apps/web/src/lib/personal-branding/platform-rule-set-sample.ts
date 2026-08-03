const STORAGE_KEY = 'platform-rule-set-custom-samples';
const MAX_SAMPLE_LENGTH = 5000;

export const PLATFORM_RULE_SET_SAMPLE_TEXT =
  'Our team shipped a small automation last quarter that cut weekly reporting from ' +
  'four hours to forty-five minutes. The win was not the tool itself—it was agreeing ' +
  'on a single source of truth before writing any code. Clear ownership mattered more ' +
  'than perfect architecture.';

export const PLATFORM_RULE_SET_DRAFT_SAMPLE_KEY = '__draft__';

function readStore(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / private mode
  }
}

export function loadCustomSample(ruleKey: string): string | null {
  const stored = readStore()[ruleKey];
  if (typeof stored !== 'string') return null;
  const trimmed = stored.trim();
  return trimmed.length > 0 ? trimmed.slice(0, MAX_SAMPLE_LENGTH) : null;
}

export function saveCustomSample(ruleKey: string, text: string): void {
  const trimmed = text.trim().slice(0, MAX_SAMPLE_LENGTH);
  const store = readStore();
  if (!trimmed || trimmed === PLATFORM_RULE_SET_SAMPLE_TEXT) {
    delete store[ruleKey];
  } else {
    store[ruleKey] = trimmed;
  }
  writeStore(store);
}
