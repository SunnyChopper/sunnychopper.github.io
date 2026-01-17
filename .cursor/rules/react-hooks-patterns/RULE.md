---
description: 'USE WHEN writing React hooks, custom hooks, and hook-related patterns.'
globs: 'src/hooks/**/*.ts'
alwaysApply: false
---

# React Hooks Patterns

Standards for hook usage and custom hook creation.

## Hook Naming

```tsx
// Custom hooks always start with "use"
useAuth();
useTheme();
useLocalStorage();
useDebounce();
useMediaQuery();
```

## useState Patterns

```tsx
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Object state (prefer separate states when independent)
const [formData, setFormData] = useState({ name: '', email: '' });

// Updating object state
setFormData((prev) => ({ ...prev, name: newName }));

// Lazy initialization for expensive computations
const [data, setData] = useState(() => computeExpensiveValue());
```

## useEffect Patterns

```tsx
// Cleanup pattern
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    /* ... */
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);

// Dependency array rules
useEffect(() => {}, []); // Run once on mount
useEffect(() => {}, [dep]); // Run when dep changes
useEffect(() => {}); // AVOID: runs every render

// Async in useEffect
useEffect(() => {
  const fetchData = async () => {
    const result = await api.getData();
    setData(result);
  };
  fetchData();
}, []);
```

## useCallback and useMemo

```tsx
// useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// useMemo for expensive computations
const sortedItems = useMemo(() => items.sort((a, b) => a.name.localeCompare(b.name)), [items]);

// Don't overuse - only when needed for:
// 1. Preventing unnecessary child re-renders
// 2. Expensive computations
// 3. Stable references for dependencies
```

## useRef Patterns

```tsx
// DOM references
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// Mutable values that don't trigger re-renders
const timerRef = useRef<number>();
timerRef.current = window.setTimeout(() => {}, 1000);

// Previous value tracking
const prevValueRef = useRef(value);
useEffect(() => {
  prevValueRef.current = value;
}, [value]);
```

## Custom Hook Structure

```tsx
// Standard custom hook template
function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const doSomething = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.call(value);
      setValue(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [value]);

  return { value, setValue, isLoading, error, doSomething };
}
```

## Common Custom Hooks

```tsx
// useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// useDebounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// useMediaQuery
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

## Hook Rules

1. Only call hooks at the top level (not in loops/conditions)
2. Only call hooks from React functions
3. Custom hooks must start with "use"
4. Include all dependencies in dependency arrays
5. Clean up side effects in useEffect return
