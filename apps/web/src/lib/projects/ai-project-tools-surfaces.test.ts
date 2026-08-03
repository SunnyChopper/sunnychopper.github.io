import { describe, expect, it } from 'vitest';
import {
  aiProjectToolPillBaseClassName,
  aiProjectToolPillClassName,
  aiProjectToolPillIdleClassName,
  aiProjectToolPillSelectedClassName,
  aiProjectToolTabId,
} from '@/lib/projects/ai-project-tools-surfaces';

describe('ai-project-tools-surfaces', () => {
  it('uses shared border chrome on selected and idle pills', () => {
    expect(aiProjectToolPillBaseClassName).toContain('border');
    expect(aiProjectToolPillSelectedClassName).toContain('border-');
    expect(aiProjectToolPillIdleClassName).toContain('border-');
  });

  it('builds pill class names from selection state', () => {
    const selected = aiProjectToolPillClassName(true);
    const idle = aiProjectToolPillClassName(false);

    expect(selected).toContain(aiProjectToolPillBaseClassName);
    expect(idle).toContain(aiProjectToolPillBaseClassName);
    expect(selected).toContain('bg-amber-100');
    expect(idle).toContain('bg-gray-50');
  });

  it('builds stable tab ids per mode', () => {
    expect(aiProjectToolTabId('health')).toBe('ai-project-tool-tab-health');
    expect(aiProjectToolTabId('generate')).toBe('ai-project-tool-tab-generate');
    expect(aiProjectToolTabId('risks')).toBe('ai-project-tool-tab-risks');
  });
});
