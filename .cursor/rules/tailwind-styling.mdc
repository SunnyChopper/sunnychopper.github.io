---
description: "Tailwind CSS styling patterns and conventions."
globs: "**/*.tsx,**/*.css"
alwaysApply: false
---

# Tailwind Styling Patterns

Standards for using Tailwind CSS in this codebase.

## Class Organization Order

Apply classes in this order for consistency:

```tsx
className={`
  // 1. Layout (display, position)
  flex items-center justify-between
  // 2. Sizing (width, height)
  w-full h-12
  // 3. Spacing (margin, padding)
  p-4 mt-2 gap-3
  // 4. Typography
  text-sm font-medium text-gray-900
  // 5. Visual (background, border, shadow)
  bg-white border border-gray-200 rounded-lg shadow-sm
  // 6. States (hover, focus, disabled)
  hover:bg-gray-50 focus:ring-2 disabled:opacity-50
  // 7. Dark mode
  dark:bg-gray-800 dark:text-white dark:border-gray-700
  // 8. Responsive (mobile-first)
  md:flex-row lg:w-1/2
  // 9. Transitions
  transition-colors duration-200
`}
```

## Spacing Scale

Use the consistent spacing scale:

- `gap-1`, `p-1`: 4px - tight spacing
- `gap-2`, `p-2`: 8px - compact spacing
- `gap-3`, `p-3`: 12px - default element spacing
- `gap-4`, `p-4`: 16px - section padding
- `gap-6`, `p-6`: 24px - card padding
- `gap-8`, `space-y-8`: 32px - section spacing

## Color Conventions

```tsx
// Text colors
text-gray-900 dark:text-white        // Primary text
text-gray-700 dark:text-gray-300     // Secondary text
text-gray-500 dark:text-gray-400     // Muted/helper text
text-gray-400 dark:text-gray-500     // Placeholder text

// Background colors
bg-white dark:bg-gray-800            // Card/surface
bg-gray-50 dark:bg-gray-900          // Page background
bg-gray-100 dark:bg-gray-700         // Hover states

// Border colors
border-gray-200 dark:border-gray-700 // Default borders
border-gray-300 dark:border-gray-600 // Input borders

// Status colors
text-green-600 bg-green-100          // Success
text-red-600 bg-red-100              // Error
text-yellow-600 bg-yellow-100        // Warning
text-blue-600 bg-blue-100            // Info
```

## Interactive States Pattern

```tsx
// Buttons
className="
  bg-blue-600 hover:bg-blue-700
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition
"

// Clickable cards/items
className="
  hover:bg-gray-50 dark:hover:bg-gray-700
  cursor-pointer
  transition
"

// Form inputs
className="
  border-gray-300 dark:border-gray-600
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  disabled:bg-gray-100 disabled:cursor-not-allowed
"
```

## Responsive Patterns

```tsx
// Mobile-first approach
className="
  flex flex-col          // Mobile: stack
  md:flex-row            // Tablet+: row
  lg:grid lg:grid-cols-3 // Desktop: grid
"

// Hide/show at breakpoints
className="hidden md:block"  // Hidden on mobile
className="md:hidden"        // Hidden on tablet+
```

## Forbidden Patterns

- Arbitrary values like `w-[327px]` - use scale or custom config
- Mixing spacing units inconsistently
- Using `!important` via `!` prefix
- Inline styles for things Tailwind can do
- Forgetting dark mode variants on visible elements
