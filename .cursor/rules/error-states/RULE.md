---
description: 'USE WHEN handling errors, failed requests, and exception states.'
globs: ''
alwaysApply: false
---

# Error States

Handle errors gracefully with clear feedback and recovery options.

## Error State Types

### 1. Inline Field Errors

```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
  <input
    type="email"
    className={cn(
      'w-full px-3 py-2 rounded-lg border transition',
      error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
    )}
  />
  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
</div>
```

### 2. Form-Level Errors

```tsx
{
  formError && (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-800 dark:text-red-300">Unable to save</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{formError}</p>
        </div>
      </div>
    </div>
  );
}
```

### 3. Page-Level Errors

```tsx
if (error) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load data
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <Button onClick={retry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

### 4. Toast/Notification Errors

```tsx
function showError(message: string) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: message,
  });
}
```

## Error Alert Component

```tsx
interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function ErrorAlert({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
}: ErrorAlertProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-red-800 dark:text-red-300">{title}</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button size="sm" variant="ghost" onClick={onRetry}>
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Error Messages

### Good Error Messages

- "Unable to save changes. Please check your connection and try again."
- "This email is already registered. Try signing in instead."
- "Session expired. Please sign in again to continue."

### Bad Error Messages

- "Error: 500"
- "Something went wrong"
- "null is not an object"

## Error Handling Pattern

```tsx
const { mutate, isPending, error } = useMutation({
  mutationFn: saveData,
  onError: (error) => {
    // Log for debugging
    console.error('Save failed:', error);
    // Show user-friendly message
    toast.error(getUserFriendlyMessage(error));
  },
});

function getUserFriendlyMessage(error: Error): string {
  if (error.message.includes('network')) {
    return 'Connection lost. Please check your internet and try again.';
  }
  if (error.message.includes('401')) {
    return 'Session expired. Please sign in again.';
  }
  return 'Something went wrong. Please try again.';
}
```

## Best Practices

1. **Be specific** - tell users what went wrong
2. **Offer recovery** - always provide a next step (retry, contact support)
3. **Don't blame** - avoid "you did something wrong" tone
4. **Log details** - send technical details to error tracking
5. **Test failure paths** - error states need as much attention as success
