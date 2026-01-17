---
description: 'USE WHEN defining TypeScript types, interfaces, and type utilities.'
globs: 'src/types/**/*.ts'
alwaysApply: false
---

# Type Definitions

Standards for TypeScript type organization and patterns.

## Type File Organization

```
src/types/
  index.ts           # Re-exports all types
  task.ts            # Task-related types
  user.ts            # User-related types
  api-contracts.ts   # API request/response types
  common.ts          # Shared utility types
```

## Interface vs Type

```tsx
// Use interface for object shapes (extendable)
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions, primitives, tuples
type Status = 'pending' | 'active' | 'completed';
type ID = string | number;
type Coordinates = [number, number];

// Extending interfaces
interface AdminUser extends User {
  permissions: string[];
}
```

## Entity Types

```tsx
// Base entity with common fields
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Domain entity
interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
}

// Status/enum types as unions
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
```

## Input Types

```tsx
// Create input (omit auto-generated fields)
type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

// Update input (all fields optional except id)
type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>> & {
  id: string;
};

// Or explicit definition for clarity
interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
```

## Component Props Types

```tsx
// Props interface naming: ComponentNameProps
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// Children prop
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Extending HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

## Utility Types

```tsx
// Pick specific fields
type TaskSummary = Pick<Task, 'id' | 'title' | 'status'>;

// Omit fields
type TaskWithoutDates = Omit<Task, 'createdAt' | 'updatedAt'>;

// Make fields optional
type PartialTask = Partial<Task>;

// Make fields required
type RequiredTask = Required<Task>;

// Record for object maps
type TaskMap = Record<string, Task>;

// Extract from union
type ActiveStatus = Extract<TaskStatus, 'pending' | 'in_progress'>;
```

## Generic Types

```tsx
// API response wrapper
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
  };
}

// Paginated response
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Service result
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };
```

## Re-exporting Types

```tsx
// types/index.ts
export type { Task, TaskStatus, TaskPriority, CreateTaskInput } from './task';
export type { User, UserRole } from './user';
export type { ApiResponse, PaginatedResponse } from './api-contracts';
```

## Type Guards

```tsx
// Type guard function
function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'status' in value
  );
}

// Discriminated union guard
type Result = { type: 'success'; data: Task } | { type: 'error'; message: string };

function handleResult(result: Result) {
  if (result.type === 'success') {
    // TypeScript knows result.data exists
    console.log(result.data.title);
  } else {
    // TypeScript knows result.message exists
    console.log(result.message);
  }
}
```
