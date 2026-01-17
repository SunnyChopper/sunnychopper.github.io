---
description: 'USE WHEN creating skeleton/shimmer loading placeholders for content.'
globs: ''
alwaysApply: false
---

# Skeleton Loaders

Standards for skeleton loading placeholders.

## Basic Skeleton Elements

```tsx
// Rectangle skeleton
<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

// Circle skeleton (avatar)
<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />

// Full-width skeleton
<div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

// Partial width for text variation
<div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
```

## Skeleton Component

```tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
}
```

## Card Skeleton

```tsx
function TaskCardSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3">
        {/* Checkbox placeholder */}
        <Skeleton variant="rectangular" className="w-5 h-5 flex-shrink-0" />

        <div className="flex-1 space-y-2">
          {/* Title */}
          <Skeleton className="w-3/4 h-5" />

          {/* Description */}
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />

          {/* Meta row */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-20 h-5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## List Skeleton

```tsx
function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

## Table Skeleton

```tsx
function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-4" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="flex-1 h-4"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Profile Skeleton

```tsx
function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <Skeleton variant="circular" className="w-16 h-16" />

      <div className="space-y-2">
        {/* Name */}
        <Skeleton className="w-32 h-5" />
        {/* Email/subtitle */}
        <Skeleton className="w-48 h-4" />
      </div>
    </div>
  );
}
```

## Dashboard Stats Skeleton

```tsx
function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="w-20 h-4 mb-2" />
      <Skeleton className="w-16 h-8 mb-1" />
      <Skeleton className="w-24 h-3" />
    </div>
  );
}
```

## Usage Pattern

```tsx
function TaskList() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll,
  });

  if (isLoading) {
    return <TaskListSkeleton count={5} />;
  }

  return (
    <div className="space-y-3">
      {data?.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

## Animation Customization

```css
/* Custom shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```
