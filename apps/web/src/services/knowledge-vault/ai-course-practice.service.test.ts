import { describe, expect, it } from 'vitest';
import { formatPracticeGenerationError } from '@/services/knowledge-vault/ai-course-practice.service';

describe('formatPracticeGenerationError', () => {
  it('formats pydantic details into a readable multi-line message', () => {
    const message = formatPracticeGenerationError(
      {
        code: 'VALIDATION_ERROR',
        message: 'Data validation failed',
        details: [
          {
            type: 'missing',
            loc: ['title'],
            msg: 'Field required',
          },
          {
            type: 'string_type',
            loc: ['questions', 0, 'questionText'],
            msg: 'Input should be a valid string',
          },
        ],
      },
      'AI generation failed'
    );

    expect(message).toContain('Data validation failed');
    expect(message).toContain('title');
    expect(message).toContain('Field required');
    expect(message).toContain('questions');
  });

  it('replaces bare generic validation message with actionable fallback', () => {
    const message = formatPracticeGenerationError(
      {
        code: 'VALIDATION_ERROR',
        message: 'Data validation failed',
      },
      'AI generation failed'
    );

    expect(message).not.toBe('Data validation failed');
    expect(message).toContain('Retry with stricter prompt');
    expect(message).toContain('schema');
  });
});
