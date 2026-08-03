import type { BrandProfile } from '@/types/api/personal-branding.dto';

/** Platform rule mappings allow draft/active profiles; block in-flight extraction. */
export function isBrandProfileSelectableForPlatformRules(profile: BrandProfile): boolean {
  return profile.status !== 'extracting';
}

export const EXTRACTING_PROFILE_RULE_TOOLTIP =
  'Profile extraction is still running. Select this profile after it completes.';
