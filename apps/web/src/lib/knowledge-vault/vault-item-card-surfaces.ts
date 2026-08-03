/** Shared surface tokens for Knowledge Vault Library grid cards. */

import { cn } from '@/lib/utils';

interface VaultItemCardShellOptions {
  selected?: boolean;
  multiSelected?: boolean;
  highlighted?: boolean;
  interactive?: boolean;
}

const vaultItemCardSoftShadowClassName =
  'shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.25)]';

export function vaultItemCardShellClassName({
  selected = false,
  multiSelected = false,
  highlighted = false,
  interactive = false,
}: VaultItemCardShellOptions = {}): string {
  const emphasized = selected || multiSelected;
  return cn(
    'group relative flex h-full flex-col rounded-lg border-2 bg-white p-4 shadow-sm dark:bg-gray-800',
    'transition-[border-color,box-shadow] duration-150 ease-out',
    interactive && 'cursor-pointer focus:outline-none',

    highlighted &&
      'border-violet-500 ring-2 ring-violet-500/20 shadow-lg dark:shadow-violet-900/20',

    !highlighted && emphasized && cn('border-primary/40', vaultItemCardSoftShadowClassName),

    !highlighted &&
      !emphasized &&
      cn(
        'border-gray-200 dark:border-gray-700',
        'hover:border-primary/40',
        'hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.25)]'
      ),

    interactive &&
      'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900'
  );
}

interface VaultItemCardAccentBarOptions {
  selected?: boolean;
  multiSelected?: boolean;
}

/** Absolute left accent: hidden at rest; visible on keyboard focus or when selected. */
export function vaultItemCardAccentBarClassName({
  selected = false,
  multiSelected = false,
}: VaultItemCardAccentBarOptions = {}): string {
  const emphasized = selected || multiSelected;
  return cn(
    'pointer-events-none absolute bottom-0 left-0 top-0 w-1 rounded-l-md bg-primary/50 transition-opacity duration-150 ease-out',
    emphasized
      ? 'opacity-100'
      : 'opacity-0 group-focus-within:opacity-100 group-focus-visible:opacity-100'
  );
}

interface VaultItemCardCheckboxVisibilityOptions {
  isSelected?: boolean;
  selectionActive?: boolean;
}

export function vaultItemCardSelectCheckboxClassName({
  isSelected = false,
  selectionActive = false,
}: VaultItemCardCheckboxVisibilityOptions = {}): string {
  return cn(
    'absolute left-2 top-2 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-opacity duration-200',
    isSelected || selectionActive
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
  );
}
