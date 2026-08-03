import { contentTextStats } from '@/pages/admin/personal-branding/content-workbench/content-workbench-helpers';
import type {
  BrandPlatform,
  BrandProfileOutputTest,
  ResolvedPlatformPolicy,
} from '@/types/api/personal-branding.dto';
import { defaultPlatformFormat } from '@/lib/personal-branding/platform-format-helpers';
import type { PlatformFormat } from '@/lib/personal-branding/platform-format-helpers';

export const MIN_COMPARE_PLATFORMS = 2;
export const MAX_COMPARE_PLATFORMS = 3;

export const DEFAULT_COMPARE_PLATFORMS: BrandPlatform[] = ['x', 'linkedin', 'instagram'];

export type HookStyle = 'question' | 'imperative' | 'statistic' | 'list_opener' | 'statement';

export const HOOK_STYLE_LABELS: Record<HookStyle, string> = {
  question: 'Question hook',
  imperative: 'Imperative hook',
  statistic: 'Statistic-led hook',
  list_opener: 'List opener',
  statement: 'Statement hook',
};

export interface CompareColumnInput {
  platform: BrandPlatform;
  body: string;
  resolvedPolicy?: ResolvedPlatformPolicy | null;
}

export interface ColumnStructuralInfo {
  platform: BrandPlatform;
  hookStyle: HookStyle;
  hookLabel: string;
  openingExcerpt: string;
  wordCount: number;
  characterCount: number;
  characterLimit: number | null;
  withinCharacterLimit: boolean | null;
  rhetoricalModes: string[];
  rhetoricalDevices: string[];
}

export interface StructuralDiff {
  columns: ColumnStructuralInfo[];
  sharedModes: string[];
  uniqueModes: Partial<Record<BrandPlatform, string[]>>;
  sharedDevices: string[];
  uniqueDevices: Partial<Record<BrandPlatform, string[]>>;
  hookStylesDiffer: boolean;
}

const IMPERATIVE_PATTERN =
  /^(stop|start|build|learn|try|avoid|never|always|use|don't|do|get|make|think|consider|remember|watch|read|listen|share|ask|tell|show|discover|imagine)\b/i;

export function normalizeOutputTestTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, ' ');
}

export function findReusableOutputTest(
  history: BrandProfileOutputTest[],
  params: {
    topic: string;
    platform: BrandPlatform;
    platformFormat?: PlatformFormat;
    profileId: string;
  }
): BrandProfileOutputTest | undefined {
  const normalizedTopic = normalizeOutputTestTopic(params.topic);
  if (!normalizedTopic) return undefined;
  const format = params.platformFormat ?? defaultPlatformFormat(params.platform);

  return history.find(
    (test) =>
      test.profileId === params.profileId &&
      test.platform === params.platform &&
      (test.platformFormat ?? defaultPlatformFormat(test.platform)) === format &&
      normalizeOutputTestTopic(test.topic) === normalizedTopic
  );
}

function firstSentence(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return '';

  if (/^(\d+[.)]\s|[-•*]\s)/.test(trimmed)) {
    const newline = trimmed.indexOf('\n');
    return newline > 0 ? trimmed.slice(0, newline).trim() : trimmed;
  }

  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  if (match?.[1]) return match[1].trim();

  const newline = trimmed.indexOf('\n');
  if (newline > 0) return trimmed.slice(0, newline).trim();

  return trimmed.length > 160 ? `${trimmed.slice(0, 157).trim()}…` : trimmed;
}

export function classifyHookStyle(body: string): HookStyle {
  const opening = firstSentence(body).trim();
  if (!opening) return 'statement';

  if (/^[-•*]\s/.test(opening) || /^\d+[.)]\s/.test(opening)) {
    return 'list_opener';
  }

  if (opening.endsWith('?')) {
    return 'question';
  }

  if (/^(\d+[\d,.%]*|#\d+)\b/.test(opening) || /\b\d+(\.\d+)?%/.test(opening)) {
    return 'statistic';
  }

  if (IMPERATIVE_PATTERN.test(opening)) {
    return 'imperative';
  }

  return 'statement';
}

function modeIds(resolvedPolicy?: ResolvedPlatformPolicy | null): string[] {
  return (resolvedPolicy?.rhetoricalModes ?? []).map((mode) => mode.mode).sort();
}

function deviceIds(resolvedPolicy?: ResolvedPlatformPolicy | null): string[] {
  return [...(resolvedPolicy?.rhetoricalDevices ?? [])].sort();
}

function uniqueToPlatform<T extends string>(items: T[], shared: Set<T>): T[] {
  return items.filter((item) => !shared.has(item));
}

export function buildStructuralDiff(columns: CompareColumnInput[]): StructuralDiff {
  const columnInfos: ColumnStructuralInfo[] = columns.map((column) => {
    const stats = contentTextStats(column.body);
    const characterLimit = column.resolvedPolicy?.characterLimit ?? null;
    const characterCount = column.body.length;
    const hookStyle = classifyHookStyle(column.body);

    return {
      platform: column.platform,
      hookStyle,
      hookLabel: HOOK_STYLE_LABELS[hookStyle],
      openingExcerpt: firstSentence(column.body),
      wordCount: stats.wordCount,
      characterCount,
      characterLimit,
      withinCharacterLimit: characterLimit != null ? characterCount <= characterLimit : null,
      rhetoricalModes: modeIds(column.resolvedPolicy),
      rhetoricalDevices: deviceIds(column.resolvedPolicy),
    };
  });

  const allModeSets = columnInfos.map((column) => new Set(column.rhetoricalModes));
  const sharedModes =
    allModeSets.length === 0
      ? []
      : [...allModeSets[0]].filter((mode) => allModeSets.every((set) => set.has(mode)));

  const sharedModeSet = new Set(sharedModes);
  const uniqueModes: Partial<Record<BrandPlatform, string[]>> = {};
  for (const column of columnInfos) {
    const unique = uniqueToPlatform(column.rhetoricalModes, sharedModeSet);
    if (unique.length > 0) {
      uniqueModes[column.platform] = unique;
    }
  }

  const allDeviceSets = columnInfos.map((column) => new Set(column.rhetoricalDevices));
  const sharedDevices =
    allDeviceSets.length === 0
      ? []
      : [...allDeviceSets[0]].filter((device) => allDeviceSets.every((set) => set.has(device)));

  const sharedDeviceSet = new Set(sharedDevices);
  const uniqueDevices: Partial<Record<BrandPlatform, string[]>> = {};
  for (const column of columnInfos) {
    const unique = uniqueToPlatform(column.rhetoricalDevices, sharedDeviceSet);
    if (unique.length > 0) {
      uniqueDevices[column.platform] = unique;
    }
  }

  const hookStyles = new Set(columnInfos.map((column) => column.hookStyle));

  return {
    columns: columnInfos,
    sharedModes,
    uniqueModes,
    sharedDevices,
    uniqueDevices,
    hookStylesDiffer: hookStyles.size > 1,
  };
}

export function isValidCompareSelection(platforms: BrandPlatform[]): boolean {
  return platforms.length >= MIN_COMPARE_PLATFORMS && platforms.length <= MAX_COMPARE_PLATFORMS;
}

export function toggleComparePlatform(
  selected: BrandPlatform[],
  platform: BrandPlatform
): BrandPlatform[] {
  if (selected.includes(platform)) {
    return selected.filter((value) => value !== platform);
  }
  if (selected.length >= MAX_COMPARE_PLATFORMS) {
    return selected;
  }
  return [...selected, platform];
}
