import { describe, expect, it } from 'vitest';
import { isDestructiveAssistantTool, MODE_OPTIONS } from './assistant-tool-approval-ui';

describe('assistant-tool-approval-ui', () => {
  it('orders mode options as a safety-first risk ladder', () => {
    expect(MODE_OPTIONS.map((o) => o.value)).toEqual(['allWrites', 'dangerousOnly', 'none']);
    expect(MODE_OPTIONS.map((o) => o.riskLabel)).toEqual([
      'Highest safety',
      'Balanced',
      'Lowest friction',
    ]);
  });

  it('detects destructive delete_* tools', () => {
    expect(isDestructiveAssistantTool('delete_goal')).toBe(true);
    expect(isDestructiveAssistantTool('delete_task')).toBe(true);
    expect(isDestructiveAssistantTool('create_goal')).toBe(false);
    expect(isDestructiveAssistantTool('update_habit')).toBe(false);
  });
});
