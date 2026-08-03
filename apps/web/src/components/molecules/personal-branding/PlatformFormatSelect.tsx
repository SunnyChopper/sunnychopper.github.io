import { Select } from '@/components/atoms/Select';
import {
  PLATFORM_FORMAT_HELPER_COPY,
  PLATFORM_FORMAT_LABELS,
  PLATFORM_FORMATS_BY_PLATFORM,
  type PlatformFormat,
} from '@/lib/personal-branding/platform-format-helpers';
import type { BrandPlatform } from '@/types/api/personal-branding.dto';

interface PlatformFormatSelectProps {
  platform: BrandPlatform;
  value: PlatformFormat;
  onChange: (value: PlatformFormat) => void;
  disabled?: boolean;
  id?: string;
}

export default function PlatformFormatSelect({
  platform,
  value,
  onChange,
  disabled = false,
  id = 'profile-output-platform-format',
}: PlatformFormatSelectProps) {
  const formats = PLATFORM_FORMATS_BY_PLATFORM[platform];
  const helperCopy = PLATFORM_FORMAT_HELPER_COPY[value];

  if (formats.length <= 1) {
    return null;
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        Content format
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as PlatformFormat)}
        disabled={disabled}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-950"
      >
        {formats.map((format) => (
          <option key={format} value={format}>
            {PLATFORM_FORMAT_LABELS[format]}
          </option>
        ))}
      </Select>
      {helperCopy ? (
        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">{helperCopy}</p>
      ) : null}
    </div>
  );
}
