---
description: 'USE WHEN applying colors, creating color schemes, and maintaining visual consistency.'
globs: ''
alwaysApply: false
---

# Color System

Consistent color usage for visual harmony and accessibility.

## Neutral Colors (Gray Scale)

```tsx
// Light mode backgrounds
bg - white; // Cards, surfaces
bg - gray - 50; // Page background, subtle sections
bg - gray - 100; // Hover states, dividers

// Dark mode backgrounds
dark: bg - gray - 900; // Page background
dark: bg - gray - 800; // Cards, surfaces
dark: bg - gray - 700; // Elevated surfaces, hover states
```

## Area Colors (Growth System)

```tsx
// Health - Green
bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300

// Wealth - Gold/Amber
bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300

// Love - Pink
bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300

// Happiness - Orange
bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300

// Operations - Gray
bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300

// DayJob - Blue
bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300
```

## Priority Colors

```tsx
// P1 - Critical (Red)
bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300

// P2 - High (Orange)
bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300

// P3 - Medium (Yellow)
bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300

// P4 - Low (Green)
bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300
```

## Status Colors

```tsx
// Success
bg-green-100 text-green-700 border-green-200
dark:bg-green-900/30 dark:text-green-300 dark:border-green-800

// Error
bg-red-100 text-red-700 border-red-200
dark:bg-red-900/30 dark:text-red-300 dark:border-red-800

// Warning
bg-yellow-100 text-yellow-700 border-yellow-200
dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800

// Info
bg-blue-100 text-blue-700 border-blue-200
dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800
```

## Interactive Colors

```tsx
// Primary action (blue)
bg-blue-600 hover:bg-blue-700 text-white
dark:bg-blue-500 dark:hover:bg-blue-600

// Secondary action
bg-gray-100 hover:bg-gray-200 text-gray-700
dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300

// Danger action
bg-red-600 hover:bg-red-700 text-white
dark:bg-red-500 dark:hover:bg-red-600

// Ghost/subtle
text-gray-700 hover:bg-gray-100
dark:text-gray-300 dark:hover:bg-gray-700
```

## Gradient Patterns

```tsx
// Primary gradient (avoid purple unless requested)
bg-gradient-to-r from-blue-600 to-cyan-600

// Success gradient
bg-gradient-to-r from-green-500 to-emerald-500

// Accent gradient (use sparingly)
bg-gradient-to-br from-blue-500 to-teal-500
```

## Color Accessibility

- Text on backgrounds must meet WCAG AA (4.5:1 contrast)
- Large text (18px+) needs 3:1 minimum
- Always test both light and dark modes
- Don't rely on color alone for meaning

## Forbidden

- Using purple/indigo unless explicitly requested
- Hardcoded hex colors (use Tailwind tokens)
- Colors that don't have dark mode variants
- Low-contrast text combinations
