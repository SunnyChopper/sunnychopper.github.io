import { labelFromCatalog } from '@/lib/personal-branding/platform-rule-display';
import type { StructuralDiff } from '@/lib/personal-branding/output-test-compare';
import { statusPillClassName } from '@/pages/admin/personal-branding/personal-branding-ui';
import { cn } from '@/lib/utils';
import type { BrandPlatform, PlatformRuleCatalog } from '@/types/api/personal-branding.dto';
import { BRAND_PLATFORM_LABELS } from '@/types/api/personal-branding.dto';

export interface OutputTestStructuralDiffStripProps {
  diff: StructuralDiff;
  catalog?: PlatformRuleCatalog | null;
  className?: string;
}

function formatModeLabel(catalog: PlatformRuleCatalog | null | undefined, modeId: string): string {
  return labelFromCatalog(catalog?.modes, modeId);
}

function formatDeviceLabel(
  catalog: PlatformRuleCatalog | null | undefined,
  deviceId: string
): string {
  return labelFromCatalog(catalog?.devices, deviceId);
}

export default function OutputTestStructuralDiffStrip({
  diff,
  catalog,
  className,
}: OutputTestStructuralDiffStripProps) {
  if (diff.columns.length < 2) return null;

  return (
    <section
      className={cn(
        'rounded-lg border border-blue-200/80 bg-blue-50/60 px-3 py-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/20',
        className
      )}
      aria-label="Structural differences"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">Structural differences</h3>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Hook style</p>
          <ul className="mt-1.5 space-y-1" role="list">
            {diff.columns.map((column) => (
              <li key={column.platform} className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {BRAND_PLATFORM_LABELS[column.platform]}:
                </span>{' '}
                <span
                  className={cn(
                    diff.hookStylesDiffer && 'font-medium text-blue-800 dark:text-blue-200'
                  )}
                >
                  {column.hookLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Length</p>
          <ul className="mt-1.5 space-y-1" role="list">
            {diff.columns.map((column) => (
              <li key={column.platform} className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {BRAND_PLATFORM_LABELS[column.platform]}:
                </span>{' '}
                {column.wordCount} words · {column.characterCount} chars
                {column.characterLimit != null ? (
                  <span
                    className={cn(
                      column.withinCharacterLimit === false &&
                        'font-medium text-red-700 dark:text-red-300'
                    )}
                  >
                    {' '}
                    (limit {column.characterLimit.toLocaleString()})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Rhetorical policy</p>
          <div className="mt-1.5 space-y-2">
            {diff.sharedModes.length > 0 ? (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Shared modes</p>
                <ul className="mt-1 flex flex-wrap gap-1" role="list">
                  {diff.sharedModes.map((mode) => (
                    <li key={mode}>
                      <span className={statusPillClassName('info')}>
                        {formatModeLabel(catalog, mode)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {diff.sharedDevices.length > 0 ? (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Shared devices</p>
                <ul className="mt-1 flex flex-wrap gap-1" role="list">
                  {diff.sharedDevices.map((device) => (
                    <li key={device}>
                      <span className={statusPillClassName('info')}>
                        {formatDeviceLabel(catalog, device)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(Object.keys(diff.uniqueModes) as BrandPlatform[]).map((platform) => {
              const modes = diff.uniqueModes[platform];
              if (!modes?.length) return null;
              return (
                <p key={`modes-${platform}`} className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {BRAND_PLATFORM_LABELS[platform]} modes:
                  </span>{' '}
                  {modes.map((mode) => formatModeLabel(catalog, mode)).join(', ')}
                </p>
              );
            })}
            {(Object.keys(diff.uniqueDevices) as BrandPlatform[]).map((platform) => {
              const devices = diff.uniqueDevices[platform];
              if (!devices?.length) return null;
              return (
                <p key={`devices-${platform}`} className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {BRAND_PLATFORM_LABELS[platform]} devices:
                  </span>{' '}
                  {devices.map((device) => formatDeviceLabel(catalog, device)).join(', ')}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
