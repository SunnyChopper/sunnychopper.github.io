---
description: 'React component implementation standards for this repo.'
globs: 'src/components/**/*.tsx,src/pages/**/*.tsx'
alwaysApply: false
---

# React Component Standards

Standards for writing React components in this codebase.

## Component Structure

```tsx
// 1. Imports (external, then internal, then types)
import { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { SomeType } from '../../types';

// 2. Interface definition (props first)
interface ComponentNameProps {
  required: string;
  optional?: number;
  onAction?: () => void;
}

// 3. Component definition (export default for pages, named for components)
export default function ComponentName({ required, optional = 10, onAction }: ComponentNameProps) {
  // 4. Hooks first
  const [state, setState] = useState(false);

  // 5. Effects
  useEffect(() => {
    // effect logic
  }, []);

  // 6. Handlers
  const handleClick = () => {
    onAction?.();
  };

  // 7. Early returns for loading/error/empty
  if (!data) return <LoadingState />;

  // 8. Main render
  return <div className="...">{/* JSX */}</div>;
}
```

## Naming Conventions

- Components: PascalCase (`UserProfile`, `TaskCard`)
- Props interfaces: `ComponentNameProps`
- Event handlers: `handle` + `Event` (`handleClick`, `handleSubmit`)
- Boolean props: `is` or `has` prefix (`isLoading`, `hasError`)
- Callbacks: `on` prefix (`onClick`, `onSubmit`, `onChange`)

## Props Patterns

```tsx
// Good: Destructure with defaults
function Button({ variant = 'primary', size = 'md', disabled = false, children }: ButtonProps) {}

// Good: Spread remaining props for flexibility
function Input({ label, error, ...inputProps }: InputProps) {
  return <input {...inputProps} />;
}

// Bad: Don't use `props` object directly
function Bad(props) {
  return <div>{props.title}</div>;
}
```

## Component Size Guidelines

- Components should do ONE thing well
- If a component exceeds 150 lines, consider splitting
- Extract repeated JSX into sub-components
- Keep render logic simple; extract complex conditionals

## Required Practices

- Always define prop types with TypeScript interfaces
- Use `children` prop for composition
- Prefer controlled components for forms
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to children with `useCallback`

## Forbidden Patterns

- `any` typed props
- Inline function definitions in JSX (except simple ones)
- Direct DOM manipulation
- Mutating props or state directly
- Missing key props in lists
