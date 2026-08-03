import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NOTE_AREA,
  EMPTY_METADATA_GUIDANCE_TEXT,
  shouldShowEmptyMetadataGuidance,
} from '@/lib/knowledge-vault/note-empty-metadata-guidance';

describe('note-empty-metadata-guidance', () => {
  it('shows guidance when area is default and tags are empty', () => {
    expect(shouldShowEmptyMetadataGuidance(DEFAULT_NOTE_AREA, [])).toBe(true);
  });

  it('hides guidance when area is not default', () => {
    expect(shouldShowEmptyMetadataGuidance('Health', [])).toBe(false);
  });

  it('hides guidance when tags are present', () => {
    expect(shouldShowEmptyMetadataGuidance(DEFAULT_NOTE_AREA, ['ops'])).toBe(false);
  });

  it('exports exact guidance copy', () => {
    expect(EMPTY_METADATA_GUIDANCE_TEXT).toBe(
      'Add an Area and tags so this note appears in filtered Library views.'
    );
  });
});
