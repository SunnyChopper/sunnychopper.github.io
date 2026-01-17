---
description: 'USE WHEN adding hover, active, focus, and disabled states to interactive elements.'
globs: ''
alwaysApply: false
---

# Hover & Active States

Standards for interactive state styling.

## Button States

```tsx
// Complete interactive states
className="
  bg-blue-600 text-white
  hover:bg-blue-700
  active:bg-blue-800
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
"

// With transition
className="
  transition-colors duration-150
  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
"
```

## Card Hover States

```tsx
// Lift on hover
className="
  transition-all duration-200
  hover:shadow-lg hover:-translate-y-1
"

// Border highlight
className="
  border border-transparent
  hover:border-blue-500
  transition-colors
"

// Background change
className="
  bg-white dark:bg-gray-800
  hover:bg-gray-50 dark:hover:bg-gray-700
  transition-colors
"
```

## Link States

```tsx
// Text link
className="
  text-blue-600 dark:text-blue-400
  hover:text-blue-800 dark:hover:text-blue-300
  hover:underline
"

// Nav link
className={cn(
  'px-3 py-2 rounded-lg transition-colors',
  isActive
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
)}
```

## List Item States

```tsx
// Selectable list item
className={cn(
  'p-3 cursor-pointer transition-colors',
  isSelected
    ? 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/30'
    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
)}
```

## Icon Button States

```tsx
// Ghost icon button
className="
  p-2 rounded-lg
  text-gray-400 hover:text-gray-600
  hover:bg-gray-100 dark:hover:bg-gray-800
  transition-colors
"

// Danger action
className="
  text-gray-400 hover:text-red-600
  hover:bg-red-50 dark:hover:bg-red-900/20
  transition-colors
"
```

## Disabled State Patterns

```tsx
// Standard disabled
disabled:opacity-50
disabled:cursor-not-allowed
disabled:pointer-events-none

// Preserve hover color when disabled
disabled:hover:bg-blue-600  // Same as non-hover

// Complete disabled pattern
className={cn(
  'px-4 py-2 rounded-lg',
  disabled
    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
    : 'bg-blue-600 text-white hover:bg-blue-700'
)}
```

## Group Hover

```tsx
// Parent triggers child hover
<div className="group">
  <span className="group-hover:text-blue-600">Text</span>
  <Icon className="opacity-0 group-hover:opacity-100 transition-opacity" />
</div>

// Reveal action buttons on row hover
<tr className="group hover:bg-gray-50">
  <td>Content</td>
  <td>
    <button className="opacity-0 group-hover:opacity-100">
      Edit
    </button>
  </td>
</tr>
```

## State Combinations

Always define states in this order:

1. Base styles
2. Hover state
3. Active/pressed state
4. Focus state
5. Disabled state

```tsx
className="
  bg-blue-600          // Base
  hover:bg-blue-700    // Hover
  active:bg-blue-800   // Active
  focus:ring-2         // Focus
  disabled:opacity-50  // Disabled
"
```
