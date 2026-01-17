---
description: 'TypeScript conventions and patterns for this codebase.'
globs: '**/*.ts,**/*.tsx'
alwaysApply: false
---

# TypeScript Patterns

Standards for TypeScript usage in this codebase.

## Type Definition Location

- **Shared types**: `src/types/` directory
- **Component props**: Inline in component file
- **Service types**: Co-located with service or in `src/types/`
- **API contracts**: `src/types/api-contracts.ts`

## Type vs Interface

```tsx
// Use interface for object shapes (extendable)
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions, intersections, and primitives
type Status = 'pending' | 'active' | 'completed';
type ID = string | number;
type UserWithRole = User & { role: string };
```

## Naming Conventions

- Interfaces: PascalCase, no `I` prefix (`User`, not `IUser`)
- Types: PascalCase (`Status`, `CreateUserInput`)
- Props: `ComponentNameProps`
- Input types: `CreateEntityInput`, `UpdateEntityInput`
- Enums: PascalCase values (`Status.Active`)

## Type Imports

```tsx
// Always use type-only imports for types
import type { User, Status } from '../types';
import { someFunction } from '../utils';

// Not this
import { User, someFunction } from '../utils';
```

## Generics

```tsx
// Good: Descriptive generic names
function getById<TEntity extends { id: string }>(
  items: TEntity[],
  id: string
): TEntity | undefined {
  return items.find((item) => item.id === id);
}

// Good: Constrained generics
interface ApiResponse<TData> {
  data: TData;
  error?: string;
  loading: boolean;
}
```

## Null Handling

```tsx
// Use optional chaining
const name = user?.profile?.name;

// Use nullish coalescing for defaults
const displayName = user?.name ?? 'Anonymous';

// Type narrowing for null checks
function processUser(user: User | null) {
  if (!user) return;
  // user is now User, not User | null
}
```

## Required Patterns

- Enable strict mode in tsconfig
- Explicitly type function parameters
- Use `unknown` over `any` when type is truly unknown
- Use discriminated unions for state machines
- Export types that are used across files

## Forbidden Patterns

- `any` without explicit justification in a comment
- Type assertions (`as`) without necessity
- `!` non-null assertions (prefer proper null handling)
- Implicit `any` from missing parameter types
- `@ts-ignore` without explanation comment
