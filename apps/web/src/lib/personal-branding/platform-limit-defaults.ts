import type {
  BrandPlatform,
  PlatformLimitDefault,
  PlatformRuleCatalog,
} from '@/types/api/personal-branding.dto';

export function getPlatformLimitDefault(
  platform: BrandPlatform,
  catalog: PlatformRuleCatalog | undefined
): PlatformLimitDefault | null {
  if (!catalog?.limitDefaults) {
    return null;
  }
  return catalog.limitDefaults[platform] ?? null;
}

export function formatLimitFieldsFromDefault(defaults: PlatformLimitDefault): {
  characterLimit: string;
  readTimeLimitMinutes: string;
} {
  return {
    characterLimit: String(defaults.characterLimit),
    readTimeLimitMinutes: String(defaults.readTimeLimitMinutes),
  };
}

function parseLimitField(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function limitsMatchDefault(
  characterLimit: string,
  readTimeLimitMinutes: string,
  defaults: PlatformLimitDefault
): boolean {
  return (
    parseLimitField(characterLimit) === defaults.characterLimit &&
    parseLimitField(readTimeLimitMinutes) === defaults.readTimeLimitMinutes
  );
}

function limitsAreBlank(characterLimit: string, readTimeLimitMinutes: string): boolean {
  return !characterLimit.trim() && !readTimeLimitMinutes.trim();
}

export function shouldReplaceLimitsWithPlatformDefaults({
  previousPlatform,
  nextPlatform,
  characterLimit,
  readTimeLimitMinutes,
  catalog,
}: {
  previousPlatform: BrandPlatform;
  nextPlatform: BrandPlatform;
  characterLimit: string;
  readTimeLimitMinutes: string;
  catalog: PlatformRuleCatalog | undefined;
}): boolean {
  if (previousPlatform === nextPlatform) {
    return false;
  }

  const previousDefaults = getPlatformLimitDefault(previousPlatform, catalog);
  if (!previousDefaults) {
    return limitsAreBlank(characterLimit, readTimeLimitMinutes);
  }

  return (
    limitsAreBlank(characterLimit, readTimeLimitMinutes) ||
    limitsMatchDefault(characterLimit, readTimeLimitMinutes, previousDefaults)
  );
}
