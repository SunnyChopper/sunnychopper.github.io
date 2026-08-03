/** Shared surface tokens for Knowledge Vault Inbox list rows. */

import { cn } from '@/lib/utils';

const inboxItemRowSoftShadowClassName =
  'shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.25)]';

interface InboxItemRowShellOptions {
  selected?: boolean;
}

export function inboxItemRowShellClassName({
  selected = false,
}: InboxItemRowShellOptions = {}): string {
  return cn(
    'relative w-full text-left rounded-lg border border-gray-200 p-3 dark:border-gray-700',
    'transition-[background-color,box-shadow,border-color] duration-100 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',

    selected && cn('bg-green-50 dark:bg-green-900/20', inboxItemRowSoftShadowClassName),

    !selected &&
      cn(
        'bg-white dark:bg-gray-800',
        'hover:bg-gray-50 dark:hover:bg-gray-700/40',
        'hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.25)]'
      )
  );
}

interface InboxItemAccentBarOptions {
  selected?: boolean;
}

/** Absolute left accent: visible when row is selected. */
export function inboxItemAccentBarClassName({
  selected = false,
}: InboxItemAccentBarOptions = {}): string {
  return cn(
    'pointer-events-none absolute bottom-0 left-0 top-0 w-1 rounded-l-md bg-green-500 transition-opacity duration-100 ease-out',
    selected ? 'opacity-100' : 'opacity-0'
  );
}
