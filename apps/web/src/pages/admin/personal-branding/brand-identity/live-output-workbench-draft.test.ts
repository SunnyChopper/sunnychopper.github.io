import { describe, expect, it } from 'vitest';
import {
  buildLiveOutputWorkbenchDraftInput,
  buildLiveOutputWorkbenchTags,
  FORMAT_TAG_PREFIX,
  LIVE_OUTPUT_TEST_TAG,
  MAX_CONTENT_NODE_TAGS,
  MAX_TAG_LENGTH,
  RULE_ID_TAG_PREFIX,
  TOPIC_TAG_PREFIX,
} from './live-output-workbench-draft';
import type { BrandProfileOutputTest } from '@/types/api/personal-branding.dto';

const outputTest: BrandProfileOutputTest = {
  id: 'test-1',
  profileId: 'profile-1',
  topic: 'Building reliable agents',
  contentType: 'DEEP_DIVE_BLOG',
  platform: 'linkedin',
  title: 'Preview title',
  body: 'Draft body',
  cached: false,
  userId: 'u1',
  createdAt: '2026-07-14T12:00:00Z',
};

describe('buildLiveOutputWorkbenchTags', () => {
  it('includes provenance, topic, rule names, and rule ids', () => {
    expect(
      buildLiveOutputWorkbenchTags('Building reliable agents', ['LinkedIn voice'], ['rule-1'])
    ).toEqual([
      LIVE_OUTPUT_TEST_TAG,
      `${TOPIC_TAG_PREFIX}Building reliable agents`,
      'LinkedIn voice',
      `${RULE_ID_TAG_PREFIX}rule-1`,
    ]);
  });

  it('dedupes tags and skips empty values', () => {
    expect(
      buildLiveOutputWorkbenchTags('  ', ['LinkedIn voice', 'LinkedIn voice'], ['', 'rule-1'])
    ).toEqual([LIVE_OUTPUT_TEST_TAG, 'LinkedIn voice', `${RULE_ID_TAG_PREFIX}rule-1`]);
  });

  it('truncates long topic tags', () => {
    const longTopic = 'x'.repeat(MAX_TAG_LENGTH + 50);
    const tags = buildLiveOutputWorkbenchTags(longTopic, [], []);
    expect(tags[1]).toHaveLength(MAX_TAG_LENGTH);
    expect(tags[1]?.startsWith(TOPIC_TAG_PREFIX)).toBe(true);
  });

  it('caps tag count at MAX_CONTENT_NODE_TAGS', () => {
    const ruleNames = Array.from({ length: 40 }, (_, index) => `Rule ${index}`);
    const ruleIds = Array.from({ length: 40 }, (_, index) => `id-${index}`);
    const tags = buildLiveOutputWorkbenchTags('Topic', ruleNames, ruleIds);
    expect(tags).toHaveLength(MAX_CONTENT_NODE_TAGS);
    expect(tags[0]).toBe(LIVE_OUTPUT_TEST_TAG);
  });
});

describe('buildLiveOutputWorkbenchDraftInput', () => {
  it('maps output test and policy metadata to create payload', () => {
    expect(
      buildLiveOutputWorkbenchDraftInput({
        outputTest,
        pillars: ['Clarity'],
        appliedRuleNames: ['LinkedIn voice'],
        appliedRuleIds: ['rule-1'],
      })
    ).toEqual({
      title: 'Preview title',
      body: 'Draft body',
      status: 'DRAFT',
      sourceType: 'ON_DEMAND_AI',
      sourceRefId: 'test-1',
      contentType: 'DEEP_DIVE_BLOG',
      platform: 'linkedin',
      pillars: ['Clarity'],
      tags: [
        LIVE_OUTPUT_TEST_TAG,
        `${TOPIC_TAG_PREFIX}Building reliable agents`,
        `${FORMAT_TAG_PREFIX}single_post`,
        'LinkedIn voice',
        `${RULE_ID_TAG_PREFIX}rule-1`,
      ],
    });
  });
});
