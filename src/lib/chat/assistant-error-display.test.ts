import { describe, expect, it } from 'vitest';
import { shouldShowAssistantErrorDetails } from './assistant-error-display';

describe('shouldShowAssistantErrorDetails', () => {
  it('returns false for empty/undefined', () => {
    expect(shouldShowAssistantErrorDetails(undefined)).toBe(false);
    expect(shouldShowAssistantErrorDetails('')).toBe(false);
  });

  it('returns false for generic backend message', () => {
    expect(shouldShowAssistantErrorDetails('Failed to generate response')).toBe(false);
    expect(shouldShowAssistantErrorDetails('  failed to generate response  ')).toBe(false);
  });

  it('returns true for other messages', () => {
    expect(shouldShowAssistantErrorDetails('Rate limit exceeded')).toBe(true);
  });
});
