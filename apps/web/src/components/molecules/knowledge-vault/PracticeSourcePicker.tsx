import { useDeferredValue, useMemo, useState } from 'react';
import { Search, FileText, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VaultItem } from '@/types/knowledge-vault';

export type PracticeSourceTypeFilter = 'all' | 'note' | 'document';

export interface PracticeSourcePickerProps {
  items: VaultItem[];
  value: string[];
  onChange: (ids: string[]) => void;
  initialSourceIds?: string[];
  className?: string;
}

const typeIcons = {
  note: FileText,
  document: FileCheck,
} as const;

const typeColors = {
  note: 'text-blue-600 dark:text-blue-400',
  document: 'text-purple-600 dark:text-purple-400',
} as const;

function formatUpdatedAt(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TYPE_CHIPS: { id: PracticeSourceTypeFilter; label: string; icon?: typeof FileText }[] = [
  { id: 'all', label: 'All' },
  { id: 'note', label: 'Note', icon: FileText },
  { id: 'document', label: 'Document', icon: FileCheck },
];

export function PracticeSourcePicker({
  items,
  value,
  onChange,
  initialSourceIds = [],
  className,
}: PracticeSourcePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PracticeSourceTypeFilter>('all');
  const deferredSearch = useDeferredValue(searchQuery);

  const initialIdSet = useMemo(() => new Set(initialSourceIds), [initialSourceIds]);

  const filteredItems = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return items.filter((item) => {
      if (item.status === 'archived') return false;
      if (item.type !== 'note' && item.type !== 'document') return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        (item.searchableText ?? '').toLowerCase().includes(query)
      );
    });
  }, [items, typeFilter, deferredSearch]);

  const handleToggle = (itemId: string) => {
    if (value.includes(itemId)) {
      onChange(value.filter((id) => id !== itemId));
    } else {
      onChange([...value, itemId]);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sources…"
          aria-label="Search library sources"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-green-600"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        {TYPE_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const active = typeFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setTypeFilter(chip.id)}
              aria-pressed={active}
              className={cn(
                'rounded-full px-3 py-1 text-xs transition flex items-center gap-1.5',
                active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              {Icon ? <Icon size={12} aria-hidden /> : null}
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
        {items.length === 0 ? (
          <p className="p-2 text-sm text-gray-500">No notes or documents in Library.</p>
        ) : filteredItems.length === 0 ? (
          <p className="p-2 text-sm text-gray-500">No matching sources.</p>
        ) : (
          filteredItems.map((item) => {
            const Icon = typeIcons[item.type as keyof typeof typeIcons];
            const colorClass = typeColors[item.type as keyof typeof typeColors];
            const selected = value.includes(item.id);
            const isPreselected = selected && initialIdSet.has(item.id);
            const checkboxId = `practice-source-${item.id}`;

            return (
              <label
                key={item.id}
                htmlFor={checkboxId}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-sm transition',
                  selected
                    ? isPreselected
                      ? 'bg-green-50 ring-1 ring-green-300 dark:bg-green-950/30 dark:ring-green-700'
                      : 'bg-green-50 dark:bg-green-950/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleToggle(item.id)}
                  className="mt-0.5 shrink-0"
                />
                <Icon size={16} className={cn('mt-0.5 shrink-0', colorClass)} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Updated {formatUpdatedAt(item.updatedAt)}</span>
                    {isPreselected ? (
                      <span className="text-green-700 dark:text-green-400">From this note</span>
                    ) : null}
                  </span>
                </span>
              </label>
            );
          })
        )}
      </div>

      {value.length > 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {value.length} source{value.length === 1 ? '' : 's'} selected
        </p>
      ) : null}
    </div>
  );
}
