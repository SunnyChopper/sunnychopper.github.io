import type { Area } from '@/types/growth-system';

export const DEFAULT_NOTE_AREA: Area = 'Operations';

export const EMPTY_METADATA_GUIDANCE_TEXT =
  'Add an Area and tags so this note appears in filtered Library views.';

export function shouldShowEmptyMetadataGuidance(area: Area, tags: string[]): boolean {
  return area === DEFAULT_NOTE_AREA && tags.length === 0;
}
