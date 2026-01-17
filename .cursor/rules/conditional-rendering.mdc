---
description: "USE WHEN implementing conditional rendering patterns in React components."
globs: ""
alwaysApply: false
---

# Conditional Rendering

Standards for conditional rendering patterns in React.

## Basic Conditionals

### Logical AND (&&)

```tsx
// Show element when condition is true
{isLoggedIn && <UserMenu />}

// With multiple conditions
{isAdmin && hasPermission && <AdminPanel />}

// CAUTION: Avoid with numbers (0 renders as "0")
// Bad:
{count && <Badge>{count}</Badge>}  // Renders "0" when count is 0

// Good:
{count > 0 && <Badge>{count}</Badge>}
{count ? <Badge>{count}</Badge> : null}
```

### Ternary Operator

```tsx
// Choose between two elements
{isLoading ? <Spinner /> : <Content />}

// With null fallback
{error ? <ErrorMessage error={error} /> : null}

// Nested (avoid deep nesting)
{isLoading
  ? <Spinner />
  : error
    ? <ErrorMessage />
    : <Content />
}
```

### Early Returns

```tsx
// Clean conditional rendering with early returns
function TaskCard({ task }: TaskCardProps) {
  if (!task) {
    return null;
  }

  if (task.isArchived) {
    return <ArchivedTaskCard task={task} />;
  }

  return <ActiveTaskCard task={task} />;
}
```

## State-Based Rendering

### Loading/Error/Data Pattern

```tsx
function TaskList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load tasks" onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No tasks yet" action={<CreateTaskButton />} />;
  }

  return (
    <ul>
      {data.map(task => <TaskCard key={task.id} task={task} />)}
    </ul>
  );
}
```

### Status-Based Rendering

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error';

function StatusContent({ status, data, error }: StatusContentProps) {
  const content: Record<Status, React.ReactNode> = {
    idle: <IdleState />,
    loading: <LoadingState />,
    success: <SuccessContent data={data} />,
    error: <ErrorState error={error} />,
  };

  return content[status];
}
```

## Conditional Classes

```tsx
// Using clsx/cn utility
<div
  className={cn(
    'p-4 rounded-lg border',
    isActive && 'border-blue-500 bg-blue-50',
    isDisabled && 'opacity-50 cursor-not-allowed',
    variant === 'outlined' ? 'bg-transparent' : 'bg-white'
  )}
/>

// Multiple conditional classes
<button
  className={cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    {
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
      'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
      'bg-transparent text-blue-600 hover:bg-blue-50': variant === 'ghost',
    }
  )}
/>
```

## Conditional Props

```tsx
// Spread conditional props
<button
  {...(isDisabled && { disabled: true, 'aria-disabled': true })}
  {...(tooltip && { title: tooltip })}
/>

// Conditional event handlers
<div
  onClick={isClickable ? handleClick : undefined}
  className={isClickable ? 'cursor-pointer' : ''}
/>
```

## Conditional Rendering Components

```tsx
// Reusable Show component
function Show({
  when,
  fallback = null,
  children,
}: {
  when: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  return when ? <>{children}</> : <>{fallback}</>;
}

// Usage
<Show when={isAdmin} fallback={<AccessDenied />}>
  <AdminPanel />
</Show>

// Reusable Switch component
function Switch({
  value,
  cases,
  default: defaultCase,
}: {
  value: string;
  cases: Record<string, React.ReactNode>;
  default?: React.ReactNode;
}) {
  return <>{cases[value] ?? defaultCase}</>;
}

// Usage
<Switch
  value={status}
  cases={{
    pending: <PendingBadge />,
    active: <ActiveBadge />,
    completed: <CompletedBadge />,
  }}
  default={<UnknownBadge />}
/>
```

## Avoid These Patterns

```tsx
// Don't use index as conditional
// Bad:
{items.length && <List items={items} />}  // Renders 0

// Good:
{items.length > 0 && <List items={items} />}

// Don't deeply nest ternaries
// Bad:
{a ? b ? c : d : e ? f : g}

// Good: Use early returns or extract to variables
const content = useMemo(() => {
  if (a && b) return c;
  if (a) return d;
  if (e) return f;
  return g;
}, [a, b, e]);

// Don't mix && and ternary confusingly
// Bad:
{isLoading && data ? <Content /> : <Empty />}

// Good:
{isLoading ? <Spinner /> : data ? <Content /> : <Empty />}
```
