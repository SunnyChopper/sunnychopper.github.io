import type {
  BrandProfileOutputTest,
  CreateContentNodeInput,
} from '@/types/api/personal-branding.dto';
import { defaultPlatformFormat } from '@/lib/personal-branding/platform-format-helpers';

export const LIVE_OUTPUT_TEST_TAG = 'live-output-test';
export const TOPIC_TAG_PREFIX = 'topic:';
export const RULE_ID_TAG_PREFIX = 'rule:';
export const FORMAT_TAG_PREFIX = 'format:';

/** Backend allows up to 30 tags per content node. */
export const MAX_CONTENT_NODE_TAGS = 30;

/** Keep individual tags within a safe length for Dynamo/API storage. */
export const MAX_TAG_LENGTH = 200;

export interface LiveOutputWorkbenchDraftInput {
  outputTest: BrandProfileOutputTest;
  pillars: string[];
  appliedRuleNames: string[];
  appliedRuleIds: string[];
}

function normalizeTag(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > MAX_TAG_LENGTH ? trimmed.slice(0, MAX_TAG_LENGTH) : trimmed;
}

function topicTag(topic: string): string | null {
  const normalized = normalizeTag(topic);
  if (!normalized) return null;
  const prefixed = `${TOPIC_TAG_PREFIX}${normalized}`;
  return prefixed.length > MAX_TAG_LENGTH ? prefixed.slice(0, MAX_TAG_LENGTH) : prefixed;
}

function ruleIdTag(ruleId: string): string | null {
  const normalized = normalizeTag(ruleId);
  if (!normalized) return null;
  return `${RULE_ID_TAG_PREFIX}${normalized}`;
}

/**
 * Build tags that preserve Live Output Test provenance: topic and applied platform rules.
 * Rule names and ids are deduped; list is capped at MAX_CONTENT_NODE_TAGS.
 */
export function buildLiveOutputWorkbenchTags(
  topic: string,
  appliedRuleNames: string[],
  appliedRuleIds: string[],
  platformFormat?: string | null
): string[] {
  const tags: string[] = [LIVE_OUTPUT_TEST_TAG];
  const seen = new Set<string>(tags);

  const push = (tag: string | null) => {
    if (!tag || seen.has(tag) || tags.length >= MAX_CONTENT_NODE_TAGS) return;
    seen.add(tag);
    tags.push(tag);
  };

  push(topicTag(topic));

  if (platformFormat) {
    push(`${FORMAT_TAG_PREFIX}${platformFormat}`);
  }

  for (const name of appliedRuleNames) {
    push(normalizeTag(name));
  }

  for (const ruleId of appliedRuleIds) {
    push(ruleIdTag(ruleId));
  }

  return tags;
}

export function buildLiveOutputWorkbenchDraftInput({
  outputTest,
  pillars,
  appliedRuleNames,
  appliedRuleIds,
}: LiveOutputWorkbenchDraftInput): CreateContentNodeInput {
  return {
    title: outputTest.title,
    body: outputTest.body,
    status: 'DRAFT',
    sourceType: 'ON_DEMAND_AI',
    sourceRefId: outputTest.id,
    contentType: outputTest.contentType,
    platform: outputTest.platform,
    pillars,
    tags: buildLiveOutputWorkbenchTags(
      outputTest.topic,
      appliedRuleNames,
      appliedRuleIds,
      outputTest.platformFormat ?? defaultPlatformFormat(outputTest.platform)
    ),
  };
}
