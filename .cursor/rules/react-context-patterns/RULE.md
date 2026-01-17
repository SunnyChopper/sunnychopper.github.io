---
description: 'USE WHEN creating React Context providers and consumers for state management.'
globs: 'src/contexts/**/*.tsx'
alwaysApply: false
---

# React Context Patterns

Standards for context-based state management.

## Context Structure

```tsx
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

## Context with Reducer

```tsx
// For complex state logic
interface State {
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    isLoading: false,
    error: null,
  });

  const addItem = useCallback((item: Item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  return <ItemsContext.Provider value={{ ...state, addItem }}>{children}</ItemsContext.Provider>;
}
```

## Splitting Context

```tsx
// Split state and dispatch for performance
const StateContext = createContext<State | undefined>(undefined);
const DispatchContext = createContext<Dispatch | undefined>(undefined);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Components only re-render when their specific context changes
export const useState = () => useContext(StateContext);
export const useDispatch = () => useContext(DispatchContext);
```

## Provider Composition

```tsx
// Compose multiple providers cleanly
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Usage in App
function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}
```

## Context with Async Operations

```tsx
export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchData();
    setData(result);
    setIsLoading(false);
  }, []);

  return (
    <DataContext.Provider value={{ data, isLoading, refresh }}>{children}</DataContext.Provider>
  );
}
```

## When to Use Context

Good use cases:

- Theme/appearance settings
- User authentication state
- Locale/language preferences
- Feature flags
- App-wide modals/notifications

Avoid for:

- Frequently changing data (use React Query)
- Data that's only needed by few components (prop drilling is fine)
- Complex server state (use dedicated libraries)
