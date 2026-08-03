import { Columns2 } from 'lucide-react';
import { selectableChipClassName } from '@/pages/admin/personal-branding/personal-branding-ui';
import { cn } from '@/lib/utils';
import {
  DEFAULT_COMPARE_PLATFORMS,
  isValidCompareSelection,
  MAX_COMPARE_PLATFORMS,
  MIN_COMPARE_PLATFORMS,
  toggleComparePlatform,
} from '@/lib/personal-branding/output-test-compare';
import type { BrandPlatform } from '@/types/api/personal-branding.dto';
import { BRAND_PLATFORM_LABELS } from '@/types/api/personal-branding.dto';

export interface PlatformComparePickerProps {
  compareMode: boolean;
  selectedPlatforms: BrandPlatform[];
  availablePlatforms: BrandPlatform[];
  disabled?: boolean;
  onCompareModeChange: (enabled: boolean) => void;
  onPlatformsChange: (platforms: BrandPlatform[]) => void;
  className?: string;
}

export default function PlatformComparePicker({
  compareMode,
  selectedPlatforms,
  availablePlatforms,
  disabled = false,
  onCompareModeChange,
  onPlatformsChange,
  className,
}: PlatformComparePickerProps) {
  const selectionValid = isValidCompareSelection(selectedPlatforms);

  const handleToggleMode = () => {
    if (disabled) return;
    if (!compareMode) {
      onCompareModeChange(true);
      if (!isValidCompareSelection(selectedPlatforms)) {
        onPlatformsChange(
          DEFAULT_COMPARE_PLATFORMS.filter((platform) => availablePlatforms.includes(platform))
        );
      }
      return;
    }
    onCompareModeChange(false);
  };

  const handlePlatformToggle = (platform: BrandPlatform) => {
    if (disabled) return;
    onPlatformsChange(toggleComparePlatform(selectedPlatforms, platform));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={compareMode}
          onChange={handleToggleMode}
          disabled={disabled}
          className="size-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
        />
        <Columns2 className="size-3.5 text-gray-500" aria-hidden />
        Compare platforms
      </label>

      {compareMode ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select {MIN_COMPARE_PLATFORMS}–{MAX_COMPARE_PLATFORMS} platforms to compare side by
            side.
          </p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Platforms to compare">
            {availablePlatforms.map((platform) => {
              const selected = selectedPlatforms.includes(platform);
              const atMax = !selected && selectedPlatforms.length >= MAX_COMPARE_PLATFORMS;
              return (
                <button
                  key={platform}
                  type="button"
                  disabled={disabled || atMax}
                  onClick={() => handlePlatformToggle(platform)}
                  aria-pressed={selected}
                  className={selectableChipClassName(
                    selected,
                    'rounded-full px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {BRAND_PLATFORM_LABELS[platform]}
                </button>
              );
            })}
          </div>
          {!selectionValid ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Choose at least {MIN_COMPARE_PLATFORMS} platforms to generate a comparison.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
