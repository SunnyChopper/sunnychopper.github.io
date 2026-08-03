import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import type { BrandProfile } from '@/types/api/personal-branding.dto';
import {
  EXTRACTING_PROFILE_RULE_TOOLTIP,
  isBrandProfileSelectableForPlatformRules,
} from './brand-profile-selectability';

interface ProfileMultiSelectProps {
  profiles: BrandProfile[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function ProfileMultiSelect({
  profiles,
  selectedIds,
  onChange,
  disabled = false,
}: ProfileMultiSelectProps) {
  const toggle = (profile: BrandProfile) => {
    const { id } = profile;
    const isSelected = selectedIds.includes(id);
    if (isSelected) {
      onChange(selectedIds.filter((x) => x !== id));
      return;
    }
    if (!isBrandProfileSelectableForPlatformRules(profile)) {
      return;
    }
    onChange([...selectedIds, id]);
  };

  if (!profiles.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No profiles yet. Create a profile to map this rule.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Select profiles this rule applies to. Leave all unchecked for a universal fallback rule.
      </p>
      <ul className="max-h-40 space-y-2 overflow-y-auto rounded border p-3 dark:border-gray-700">
        {profiles.map((profile) => {
          const isExtracting = profile.status === 'extracting';
          const isSelected = selectedIds.includes(profile.id);
          const rowDisabled = disabled || (isExtracting && !isSelected);

          return (
            <li key={profile.id} className="flex items-center gap-2">
              <FormCheckbox
                id={`profile-${profile.id}`}
                checked={isSelected}
                onChange={() => toggle(profile)}
                disabled={rowDisabled}
                title={isExtracting ? EXTRACTING_PROFILE_RULE_TOOLTIP : undefined}
              />
              <label
                htmlFor={`profile-${profile.id}`}
                className={`text-sm ${
                  rowDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
                title={isExtracting ? EXTRACTING_PROFILE_RULE_TOOLTIP : undefined}
                aria-description={isExtracting ? EXTRACTING_PROFILE_RULE_TOOLTIP : undefined}
              >
                {profile.name}
                {isExtracting && (
                  <span className="ml-2 text-xs text-amber-600">Extraction in progress</span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
