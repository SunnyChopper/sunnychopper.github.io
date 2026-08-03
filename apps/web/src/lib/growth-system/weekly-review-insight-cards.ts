import { ROUTES } from '@/routes';
import type { WeeklyReviewAiAnalysis } from '@/types/growth-system';

export type WeeklyReviewInsightDomainId =
  | 'tasks'
  | 'habits'
  | 'metrics'
  | 'goals-projects'
  | 'logbook';

export interface WeeklyReviewInsightSignalCard {
  id: WeeklyReviewInsightDomainId;
  title: string;
  body: string;
  href: string;
}

export interface WeeklyReviewInsightEmptyDomainLink {
  id: string;
  label: string;
  href: string;
}

export interface WeeklyReviewInsightCardsResult {
  signalCards: WeeklyReviewInsightSignalCard[];
  emptyDomains: WeeklyReviewInsightEmptyDomainLink[];
}

const DOMAIN_ORDER: WeeklyReviewInsightDomainId[] = [
  'tasks',
  'habits',
  'metrics',
  'goals-projects',
  'logbook',
];

const ZERO_SIGNAL_REGEX: RegExp[] = [
  /^you have completed\s+0\s+tasks\.?$/i,
  /^completed\s+0\s+tasks\b/i,
  /^you have\s+0\s+tasks\b/i,
  /^there are no metrics\.?$/i,
  /^no metrics\.?$/i,
  /^no metrics logged\b/i,
  /^your logbook is empty\.?$/i,
  /^no journal entries\b/i,
  /^0 active goals\.?$/i,
  /^there are 0 active goals\.?$/i,
];

function normalizeForCompare(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function splitIntoSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed.split(/\n+/);
  const sentences: string[] = [];

  for (const paragraph of paragraphs) {
    const parts = paragraph
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      sentences.push(...parts);
    }
  }

  return sentences;
}

function dedupeSentences(sentences: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const sentence of sentences) {
    const key = normalizeForCompare(sentence);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(sentence);
  }

  return out;
}

function buildBodyFromParts(parts: string[]): string {
  const sentences = dedupeSentences(parts.flatMap((part) => splitIntoSentences(part ?? '')));
  return sentences.join(' ');
}

function isZeroSignalBody(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return true;

  const normalized = normalizeForCompare(trimmed);
  return ZERO_SIGNAL_REGEX.some((pattern) => pattern.test(normalized));
}

function bodyPartsForDomain(
  domainId: WeeklyReviewInsightDomainId,
  aiAnalysis: WeeklyReviewAiAnalysis
): string[] {
  switch (domainId) {
    case 'tasks':
      return [aiAnalysis.tasksSummary];
    case 'habits':
      return [aiAnalysis.habitsSummary, aiAnalysis.habitsAiMessage];
    case 'metrics':
      return [aiAnalysis.metricsSummary];
    case 'goals-projects':
      return [aiAnalysis.goalsSummary];
    case 'logbook':
      return [aiAnalysis.logbookSummary];
  }
}

function titleForDomain(domainId: WeeklyReviewInsightDomainId): string {
  switch (domainId) {
    case 'tasks':
      return 'Tasks & velocity';
    case 'habits':
      return 'Habits';
    case 'metrics':
      return 'Metrics';
    case 'goals-projects':
      return 'Goals & projects';
    case 'logbook':
      return 'Logbook';
  }
}

function hrefForDomain(domainId: WeeklyReviewInsightDomainId): string {
  switch (domainId) {
    case 'tasks':
      return ROUTES.admin.tasks;
    case 'habits':
      return ROUTES.admin.habits;
    case 'metrics':
      return ROUTES.admin.metrics;
    case 'goals-projects':
      return ROUTES.admin.goals;
    case 'logbook':
      return ROUTES.admin.logbook;
  }
}

function emptyDomainLinksFor(
  domainId: WeeklyReviewInsightDomainId
): WeeklyReviewInsightEmptyDomainLink[] {
  if (domainId === 'goals-projects') {
    return [
      { id: 'goals', label: 'Goals', href: ROUTES.admin.goals },
      { id: 'projects', label: 'Projects', href: ROUTES.admin.projects },
    ];
  }

  const label =
    domainId === 'tasks'
      ? 'Tasks'
      : domainId === 'habits'
        ? 'Habits'
        : domainId === 'metrics'
          ? 'Metrics'
          : 'Logbook';

  return [{ id: domainId, label, href: hrefForDomain(domainId) }];
}

/**
 * Normalize Weekly Review AI insight cards: dedupe sentences, collapse zero-signal domains
 * into emptyDomain links for a single "No signal this week" row.
 */
export function normalizeWeeklyReviewInsightCards(
  aiAnalysis: WeeklyReviewAiAnalysis
): WeeklyReviewInsightCardsResult {
  const signalCards: WeeklyReviewInsightSignalCard[] = [];
  const emptyDomains: WeeklyReviewInsightEmptyDomainLink[] = [];

  for (const domainId of DOMAIN_ORDER) {
    const body = buildBodyFromParts(bodyPartsForDomain(domainId, aiAnalysis));

    if (isZeroSignalBody(body)) {
      emptyDomains.push(...emptyDomainLinksFor(domainId));
      continue;
    }

    signalCards.push({
      id: domainId,
      title: titleForDomain(domainId),
      body,
      href: hrefForDomain(domainId),
    });
  }

  return { signalCards, emptyDomains };
}

export const weeklyReviewNoSignalLabel = 'No signal this week — quiet across modules.';
