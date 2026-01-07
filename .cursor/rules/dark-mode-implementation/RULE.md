---
description: "Dark mode implementation patterns and requirements."
globs: "**/*.tsx"
alwaysApply: false
---

# Dark Mode Implementation

Standards for implementing dark mode support.

## Core Principle

Every visible UI element MUST have dark mode variants. This is not optional.

## Color Pairing Reference

```tsx
// Backgrounds
bg-white           -> dark:bg-gray-800
bg-gray-50         -> dark:bg-gray-900
bg-gray-100        -> dark:bg-gray-700

// Text
text-gray-900      -> dark:text-white
text-gray-700      -> dark:text-gray-300
text-gray-600      -> dark:text-gray-400
text-gray-500      -> dark:text-gray-400

// Borders
border-gray-200    -> dark:border-gray-700
border-gray-300    -> dark:border-gray-600

// Shadows (reduce or remove in dark mode)
shadow-lg          -> dark:shadow-none (or dark:shadow-gray-900/20)
```

## Implementation Pattern

```tsx
// Card component example
<div className="
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-sm dark:shadow-none
">
  <h3 className="text-gray-900 dark:text-white font-semibold">
    Title
  </h3>
  <p className="text-gray-600 dark:text-gray-400">
    Description text
  </p>
</div>

// Button example
<button className="
  bg-blue-600 hover:bg-blue-700
  dark:bg-blue-500 dark:hover:bg-blue-600
  text-white
  transition
">
  Action
</button>
```

## Interactive State Dark Variants

```tsx
// Hover states
hover:bg-gray-100 dark:hover:bg-gray-700
hover:bg-gray-50 dark:hover:bg-gray-800

// Focus states
focus:ring-blue-500 dark:focus:ring-blue-400
focus:border-blue-500 dark:focus:border-blue-400

// Selected/active states
bg-blue-100 dark:bg-blue-900/30
text-blue-700 dark:text-blue-300
```

## Status Colors in Dark Mode

```tsx
// Success
bg-green-100 dark:bg-green-900/30
text-green-700 dark:text-green-300
border-green-200 dark:border-green-800

// Error
bg-red-100 dark:bg-red-900/30
text-red-700 dark:text-red-300
border-red-200 dark:border-red-800

// Warning
bg-yellow-100 dark:bg-yellow-900/30
text-yellow-700 dark:text-yellow-300
border-yellow-200 dark:border-yellow-800

// Info
bg-blue-100 dark:bg-blue-900/30
text-blue-700 dark:text-blue-300
border-blue-200 dark:border-blue-800
```

## Checklist for New Components

- [ ] Background color has dark variant
- [ ] All text colors have dark variants
- [ ] Border colors have dark variants
- [ ] Hover states have dark variants
- [ ] Focus states have dark variants
- [ ] Shadows are adjusted for dark mode
- [ ] Status colors use dark-appropriate variants
- [ ] Images/icons are visible in both modes
