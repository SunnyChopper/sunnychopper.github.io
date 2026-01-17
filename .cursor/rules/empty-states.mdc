---
description: "USE WHEN handling empty data, no results, and first-use experiences."
globs: ""
alwaysApply: false
---

# Empty States

Empty states guide users when there's no data to display.

## When to Use

- First-time user experience (no data yet)
- Search/filter returns no results
- List is empty after deletion
- No items match current filters

## Empty State Components

### Basic Structure

```tsx
<div className="text-center py-12">
  {/* Icon */}
  <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
    <InboxIcon />
  </div>

  {/* Title */}
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    No tasks yet
  </h3>

  {/* Description */}
  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
    Create your first task to start tracking your progress
  </p>

  {/* Action */}
  <Button onClick={onCreate}>
    <Plus className="w-4 h-4 mr-2" />
    Create Task
  </Button>
</div>
```

### Reusable Empty State Component

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
```

## Context-Specific Empty States

### First-Time User

```tsx
<EmptyState
  icon={<Sparkles />}
  title="Welcome to Tasks!"
  description="Create your first task to start organizing your work and tracking your progress."
  action={
    <Button onClick={onCreate}>
      <Plus className="w-4 h-4 mr-2" />
      Create Your First Task
    </Button>
  }
/>
```

### No Search Results

```tsx
<EmptyState
  icon={<Search />}
  title="No results found"
  description={`No tasks match "${searchQuery}". Try adjusting your search or filters.`}
  action={
    <Button variant="ghost" onClick={clearSearch}>
      Clear Search
    </Button>
  }
/>
```

### No Filter Results

```tsx
<EmptyState
  icon={<Filter />}
  title="No matching items"
  description="No tasks match the current filters. Try changing or removing some filters."
  action={
    <Button variant="ghost" onClick={clearFilters}>
      Clear Filters
    </Button>
  }
/>
```

### All Done

```tsx
<EmptyState
  icon={<CheckCircle className="text-green-500" />}
  title="All caught up!"
  description="You've completed all your tasks. Great job!"
  action={
    <Button variant="ghost" onClick={showCompleted}>
      View Completed
    </Button>
  }
/>
```

## Empty State with Visual

```tsx
<div className="text-center py-12">
  <img
    src="/images/empty-tasks.svg"
    alt=""
    className="w-48 h-48 mx-auto mb-6 opacity-75"
  />
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    No tasks yet
  </h3>
  <p className="text-gray-500 dark:text-gray-400 mb-6">
    Start by creating your first task
  </p>
  <Button>Create Task</Button>
</div>
```

## Best Practices

1. **Be helpful** - explain why it's empty and what to do next
2. **Provide action** - always include a clear next step
3. **Use appropriate icons** - match the context
4. **Keep it brief** - short title, 1-2 sentence description
5. **Stay positive** - encouraging tone, not error-like
6. **Consider context** - first-time vs filtered vs completed
