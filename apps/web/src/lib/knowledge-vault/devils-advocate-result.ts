export type DevilsAdvocateSectionKey =
  | 'fallacies'
  | 'contradictions'
  | 'unsupported_claims'
  | 'missing_evidence'
  | 'counter_arguments';

export type DevilsAdvocatePayload = Record<DevilsAdvocateSectionKey, string[]>;

export type DevilsAdvocateSeverity = 'critical' | 'warning' | 'info';

export type DevilsAdvocateIconKey = 'alert-circle' | 'alert-triangle' | 'info';

export type DevilsAdvocateSectionConfig = {
  key: DevilsAdvocateSectionKey;
  label: string;
  severity: DevilsAdvocateSeverity;
  icon: DevilsAdvocateIconKey;
};

export const DEVILS_ADVOCATE_SECTION_KEYS: DevilsAdvocateSectionKey[] = [
  'fallacies',
  'contradictions',
  'unsupported_claims',
  'missing_evidence',
  'counter_arguments',
];

export const DEVILS_ADVOCATE_SECTIONS: DevilsAdvocateSectionConfig[] = [
  {
    key: 'fallacies',
    label: 'Fallacies',
    severity: 'critical',
    icon: 'alert-circle',
  },
  {
    key: 'contradictions',
    label: 'Contradictions',
    severity: 'critical',
    icon: 'alert-circle',
  },
  {
    key: 'unsupported_claims',
    label: 'Unsupported claims',
    severity: 'warning',
    icon: 'alert-triangle',
  },
  {
    key: 'missing_evidence',
    label: 'Missing evidence',
    severity: 'warning',
    icon: 'alert-triangle',
  },
  {
    key: 'counter_arguments',
    label: 'Counter-arguments',
    severity: 'info',
    icon: 'info',
  },
];

export type DevilsAdvocateSectionView = DevilsAdvocateSectionConfig & {
  items: string[];
};

const EMPTY_PAYLOAD: DevilsAdvocatePayload = {
  fallacies: [],
  contradictions: [],
  unsupported_claims: [],
  missing_evidence: [],
  counter_arguments: [],
};

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function normalizeDevilsAdvocatePayload(raw: unknown): DevilsAdvocatePayload {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_PAYLOAD };
  }

  const obj = raw as Record<string, unknown>;
  return {
    fallacies: normalizeStringList(obj.fallacies),
    contradictions: normalizeStringList(obj.contradictions),
    unsupported_claims: normalizeStringList(obj.unsupported_claims),
    missing_evidence: normalizeStringList(obj.missing_evidence),
    counter_arguments: normalizeStringList(obj.counter_arguments),
  };
}

export function getDevilsAdvocateNonEmptySections(
  payload: DevilsAdvocatePayload
): DevilsAdvocateSectionView[] {
  return DEVILS_ADVOCATE_SECTIONS.map((config) => ({
    ...config,
    items: payload[config.key],
  })).filter((section) => section.items.length > 0);
}

export function formatCritiqueBullet(text: string): { lead?: string; body: string } {
  const trimmed = text.trim();
  const colonIdx = trimmed.indexOf(': ');

  if (colonIdx > 0) {
    return {
      lead: trimmed.slice(0, colonIdx + 1),
      body: trimmed.slice(colonIdx + 2),
    };
  }

  return { body: trimmed };
}

export function formatSectionItemCount(count: number): string {
  return count === 1 ? '1 item' : `${count} items`;
}
