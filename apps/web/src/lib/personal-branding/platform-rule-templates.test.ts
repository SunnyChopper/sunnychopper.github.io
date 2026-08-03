import { describe, expect, it } from 'vitest';
import {
  getPlatformRuleTemplate,
  PLATFORM_RULE_TEMPLATES,
  type PlatformRuleTemplateId,
} from './platform-rule-templates';
import type {
  BrandPlatform,
  RhetoricalDeviceId,
  RhetoricalModeId,
} from '@/types/api/personal-branding.dto';

const VALID_PLATFORMS: BrandPlatform[] = [
  'linkedin',
  'x',
  'medium',
  'youtube',
  'instagram',
  'newsletter',
];

const VALID_MODES: RhetoricalModeId[] = [
  'narrative',
  'descriptive',
  'expository',
  'argumentative',
  'persuasive',
  'instructional',
];

const VALID_DEVICES: RhetoricalDeviceId[] = [
  'metaphor',
  'simile',
  'analogy',
  'anecdote',
  'rhetoricalQuestion',
  'anaphora',
  'antithesis',
  'parallelism',
  'ruleOfThree',
  'hyperbole',
];

describe('platform-rule-templates', () => {
  it('defines five curated templates with unique ids', () => {
    expect(PLATFORM_RULE_TEMPLATES).toHaveLength(5);
    const ids = PLATFORM_RULE_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(5);
  });

  it.each(PLATFORM_RULE_TEMPLATES.map((template) => [template.id, template] as const))(
    '%s has valid platform, requirements, and rhetorical selections',
    (_id, template) => {
      expect(VALID_PLATFORMS).toContain(template.platform);
      expect(template.requirements.trim().length).toBeGreaterThan(0);
      expect(template.name.trim().length).toBeGreaterThan(0);
      expect(template.label.trim().length).toBeGreaterThan(0);
      expect(template.description.trim().length).toBeGreaterThan(0);

      const modeIds = template.rhetoricalModes.map((entry) => entry.mode);
      expect(new Set(modeIds).size).toBe(modeIds.length);
      for (const entry of template.rhetoricalModes) {
        expect(VALID_MODES).toContain(entry.mode);
      }

      expect(new Set(template.rhetoricalDevices).size).toBe(template.rhetoricalDevices.length);
      for (const device of template.rhetoricalDevices) {
        expect(VALID_DEVICES).toContain(device);
      }
    }
  );

  it('resolves templates by id', () => {
    const template = getPlatformRuleTemplate('x-thread-educational');
    expect(template.platform).toBe('x');
    expect(template.rhetoricalModes).toEqual(
      expect.arrayContaining([
        { mode: 'instructional', strength: 'strong' },
        { mode: 'expository', strength: 'moderate' },
      ])
    );
  });

  it('throws for unknown template ids', () => {
    expect(() => getPlatformRuleTemplate('missing' as PlatformRuleTemplateId)).toThrow(
      /unknown platform rule template/i
    );
  });
});
