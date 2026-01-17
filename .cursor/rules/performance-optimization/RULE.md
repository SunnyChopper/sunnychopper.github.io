---
description: 'USE WHEN optimizing React component performance and reducing re-renders.'
globs: ''
alwaysApply: false
---

# Performance Optimization

Standards for optimizing React application performance.

## Memoization

### React.memo for Components

```tsx
// Memo components that receive stable props but parent re-renders often
const TaskCard = memo(function TaskCard({ task, onEdit }: TaskCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{task.title}</h3>
      <button onClick={() => onEdit(task)}>Edit</button>
    </div>
  );
});

// With custom comparison
const TaskCard = memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id && prevProps.task.updatedAt === nextProps.task.updatedAt
  );
});
```

### useMemo for Expensive Computations

```tsx
// Memo expensive calculations
const sortedTasks = useMemo(() => {
  return [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}, [tasks]);

// Memo filtered results
const filteredItems = useMemo(() => {
  return items.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
}, [items, searchTerm]);
```

### useCallback for Stable References

```tsx
// Stable callback for child components
const handleTaskUpdate = useCallback((id: string, data: Partial<Task>) => {
  setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
}, []);

// Stable callback with dependencies
const handleSearch = useCallback(
  (term: string) => {
    setSearchTerm(term);
    logSearch(term, userId);
  },
  [userId]
);
```

## List Rendering

### Keys for Stable Identity

```tsx
// Good: stable unique ID
{
  tasks.map((task) => <TaskCard key={task.id} task={task} />);
}

// Bad: array index (causes re-render issues)
{
  tasks.map((task, index) => <TaskCard key={index} task={task} />);
}
```

### Virtualization for Long Lists

```tsx
// For lists > 100 items, consider virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## State Management

### Colocate State

```tsx
// Good: state close to where it's used
function TaskList() {
  const [filter, setFilter] = useState('all');
  return <FilteredList filter={filter} onFilterChange={setFilter} />;
}

// Bad: state lifted unnecessarily high
function App() {
  const [taskFilter, setTaskFilter] = useState('all'); // Only used in TaskList
}
```

### Avoid State Duplication

```tsx
// Bad: duplicated/derived state
const [tasks, setTasks] = useState<Task[]>([]);
const [completedCount, setCompletedCount] = useState(0);

// Good: derive from source
const completedCount = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks]);
```

## Image Optimization

```tsx
// Lazy load images below fold
<img loading="lazy" src={imageUrl} alt={alt} />

// Use appropriate image sizes
<img
  src={imageUrl}
  srcSet={`${smallUrl} 480w, ${mediumUrl} 800w, ${largeUrl} 1200w`}
  sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 33vw"
  alt={alt}
/>

// Skeleton while loading
function LazyImage({ src, alt }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative">
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <img src={src} alt={alt} onLoad={() => setLoaded(true)} />
    </div>
  );
}
```

## Code Splitting

```tsx
// Lazy load routes
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Lazy load heavy components
const ChartComponent = lazy(() => import('./components/ChartComponent'));

// With suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <ChartComponent data={data} />
</Suspense>;
```

## Event Handlers

```tsx
// Debounce search input
const debouncedSearch = useMemo(() => debounce((term: string) => search(term), 300), []);

// Throttle scroll handlers
useEffect(() => {
  const throttledScroll = throttle(handleScroll, 100);
  window.addEventListener('scroll', throttledScroll);
  return () => window.removeEventListener('scroll', throttledScroll);
}, []);
```

## Avoid These Patterns

```tsx
// Don't create objects in render
// Bad:
<Component style={{ marginTop: 10 }} />

// Good:
const style = useMemo(() => ({ marginTop: 10 }), []);
<Component style={style} />

// Don't create functions in render (for memo'd children)
// Bad:
<Button onClick={() => handleClick(id)} />

// Good:
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```
