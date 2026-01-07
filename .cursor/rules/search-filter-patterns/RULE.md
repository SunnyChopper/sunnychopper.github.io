---
description: "USE WHEN implementing search, filter, and sort functionality."
globs: ""
alwaysApply: false
---

# Search & Filter Patterns

Standards for implementing search, filtering, and sorting.

## Search Input

```tsx
function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

## Debounced Search

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function TaskSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data } = useQuery({
    queryKey: ['tasks', { search: debouncedSearch }],
    queryFn: () => tasksService.search(debouncedSearch),
  });

  return <SearchInput value={searchTerm} onChange={setSearchTerm} />;
}
```

## Filter Panel

```tsx
interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  projectId: string | null;
}

function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
      >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {/* Clear filters */}
      {(filters.status !== 'all' || filters.priority !== 'all') && (
        <button
          onClick={() => onChange({ status: 'all', priority: 'all', projectId: null })}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
```

## Active Filter Badges

```tsx
function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== 'all' && value !== null);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full"
        >
          {key}: {value}
          <button
            onClick={() => onRemove(key)}
            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
```

## Sort Controls

```tsx
interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const options = [
    { value: 'createdAt:desc', label: 'Newest first' },
    { value: 'createdAt:asc', label: 'Oldest first' },
    { value: 'title:asc', label: 'Title A-Z' },
    { value: 'title:desc', label: 'Title Z-A' },
    { value: 'priority:desc', label: 'Highest priority' },
    { value: 'dueDate:asc', label: 'Due date' },
  ];

  return (
    <select
      value={`${value.field}:${value.direction}`}
      onChange={(e) => {
        const [field, direction] = e.target.value.split(':');
        onChange({ field, direction: direction as 'asc' | 'desc' });
      }}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
```

## Sortable Table Header

```tsx
function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;
  const nextDirection = isActive && currentSort.direction === 'asc' ? 'desc' : 'asc';

  return (
    <button
      onClick={() => onSort({ field, direction: nextDirection })}
      className="flex items-center gap-1 font-medium hover:text-blue-600"
    >
      {label}
      <span className="w-4">
        {isActive && (
          currentSort.direction === 'asc'
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </span>
    </button>
  );
}
```

## Combined Search/Filter State

```tsx
function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get('q') || '',
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    sortBy: searchParams.get('sort') || 'createdAt',
    sortOrder: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
  };

  const setFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  return { filters, setFilters };
}
```
