---
description: "USE WHEN implementing loading states, spinners, and skeleton loaders."
globs: ""
alwaysApply: false
---

# Loading States

Every async operation needs a loading state. No exceptions.

## When to Show Loading

- Data fetching (API calls)
- Form submissions
- File uploads
- Navigation transitions
- Lazy-loaded components

## Loading State Types

### 1. Spinner (Short Operations)

For operations < 2 seconds:

```tsx
import { Loader2 } from 'lucide-react';

// Inline spinner
<Loader2 className="w-5 h-5 animate-spin text-blue-600" />

// Centered spinner
<div className="flex items-center justify-center min-h-[200px]">
  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
</div>

// Button with loading
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</button>
```

### 2. Skeleton (Content Loading)

For lists, cards, and content:

```tsx
// Skeleton card
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
</div>

// Skeleton list
<div className="space-y-4">
  {[1, 2, 3].map(i => (
    <div key={i} className="animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  ))}
</div>

// Skeleton card with structure
<div className="animate-pulse p-4 border rounded-lg">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
    <div className="flex-1">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  </div>
</div>
```

### 3. Progress (Long Operations)

For operations with measurable progress:

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Uploading...</span>
    <span>{progress}%</span>
  </div>
  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    <div
      className="h-full bg-blue-600 transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

## Page-Level Loading

```tsx
// Full page loader
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Section loader
if (isLoading) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
```

## Best Practices

1. **Show loading immediately** - within 100ms of action
2. **Match skeleton to content** - skeleton should preview layout
3. **Disable interactions** - prevent double-clicks/submissions
4. **Show progress when possible** - gives user feedback
5. **Use subtle animations** - avoid jarring transitions

## Button Loading Pattern

```tsx
interface ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

function Button({ isLoading, loadingText = 'Loading...', children, ...props }) {
  return (
    <button disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
```
