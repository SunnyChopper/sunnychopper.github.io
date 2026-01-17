---
description: 'USE WHEN creating buttons, CTAs, and clickable actions.'
globs: ''
alwaysApply: false
---

# Button Patterns

Standards for buttons and interactive actions.

## Button Variants

```tsx
// Primary - main actions
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-blue-600 hover:bg-blue-700 text-white
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition
">
  Primary Action
</button>

// Secondary - alternative actions
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-gray-100 dark:bg-gray-700
  hover:bg-gray-200 dark:hover:bg-gray-600
  text-gray-700 dark:text-gray-300
  transition
">
  Secondary
</button>

// Ghost - subtle actions
<button className="
  px-4 py-2 rounded-lg font-medium
  text-gray-700 dark:text-gray-300
  hover:bg-gray-100 dark:hover:bg-gray-700
  transition
">
  Ghost
</button>

// Danger - destructive actions
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-red-600 hover:bg-red-700 text-white
  transition
">
  Delete
</button>

// Outline - bordered buttons
<button className="
  px-4 py-2 rounded-lg font-medium
  border border-gray-300 dark:border-gray-600
  text-gray-700 dark:text-gray-300
  hover:bg-gray-50 dark:hover:bg-gray-800
  transition
">
  Outline
</button>
```

## Button Sizes

```tsx
// Small
<button className="px-3 py-1.5 text-sm rounded-md">Small</button>

// Medium (default)
<button className="px-4 py-2 text-sm rounded-lg">Medium</button>

// Large
<button className="px-6 py-3 text-base rounded-lg">Large</button>

// Icon only
<button className="p-2 rounded-lg">
  <Icon className="w-5 h-5" />
</button>
```

## Button with Icon

```tsx
// Icon before text
<button className="inline-flex items-center gap-2 px-4 py-2 ...">
  <Plus className="w-4 h-4" />
  <span>Create New</span>
</button>

// Icon after text
<button className="inline-flex items-center gap-2 px-4 py-2 ...">
  <span>Next</span>
  <ArrowRight className="w-4 h-4" />
</button>

// Icon only with accessible label
<button
  className="p-2 rounded-lg hover:bg-gray-100"
  aria-label="Delete item"
>
  <Trash className="w-5 h-5" />
</button>
```

## Loading State

```tsx
<button disabled={isLoading} className="inline-flex items-center gap-2 px-4 py-2 ...">
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Saving...</span>
    </>
  ) : (
    <>
      <Save className="w-4 h-4" />
      <span>Save</span>
    </>
  )}
</button>
```

## Button Group

```tsx
<div className="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
  <button className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
    Left
  </button>
  <button className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
    Middle
  </button>
  <button className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
    Right
  </button>
</div>
```

## FAB (Floating Action Button)

```tsx
<button
  className="
  fixed bottom-6 right-6
  w-14 h-14 rounded-full
  bg-blue-600 hover:bg-blue-700 text-white
  shadow-lg hover:shadow-xl
  flex items-center justify-center
  transition
  z-50
"
>
  <Plus className="w-6 h-6" />
</button>
```

## Required States

Every button must have:

1. **Hover state** - visual change on hover
2. **Focus state** - visible focus ring
3. **Active state** - pressed appearance
4. **Disabled state** - reduced opacity, not-allowed cursor
5. **Loading state** - for async actions

## Accessibility

```tsx
// Always include accessible text
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>

// Indicate loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Indicate expanded state
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>
```
