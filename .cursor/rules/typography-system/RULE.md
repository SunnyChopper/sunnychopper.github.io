---
description: 'USE WHEN working with text, headings, fonts, and typography hierarchy.'
globs: ''
alwaysApply: false
---

# Typography System

Consistent typography creates clear visual hierarchy.

## Font Families

```tsx
font - sans; // Montserrat - UI, body text, labels
font - serif; // Playfair Display - Marketing headings (use sparingly)
```

## Type Scale

| Class       | Size | Usage                                     |
| ----------- | ---- | ----------------------------------------- |
| `text-xs`   | 12px | Captions, badges, timestamps              |
| `text-sm`   | 14px | Secondary text, descriptions, form labels |
| `text-base` | 16px | Body text, paragraphs                     |
| `text-lg`   | 18px | Section headings, card titles             |
| `text-xl`   | 20px | Page section titles                       |
| `text-2xl`  | 24px | Page subtitles                            |
| `text-3xl`  | 30px | Page titles                               |
| `text-4xl`  | 36px | Hero text                                 |

## Heading Hierarchy

```tsx
// Page title (h1)
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
  Page Title
</h1>

// Section title (h2)
<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
  Section Title
</h2>

// Card title (h3)
<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
  Card Title
</h3>

// Subsection (h4)
<h4 className="text-base font-medium text-gray-900 dark:text-white">
  Subsection
</h4>
```

## Body Text

```tsx
// Primary body text
<p className="text-gray-900 dark:text-white">
  Main content
</p>

// Secondary text
<p className="text-gray-600 dark:text-gray-400">
  Supporting information
</p>

// Muted text
<span className="text-sm text-gray-500 dark:text-gray-400">
  Less important info
</span>

// Caption text
<span className="text-xs text-gray-400 dark:text-gray-500">
  Timestamps, metadata
</span>
```

## Font Weights

```tsx
font - normal; // 400 - Body text
font - medium; // 500 - Labels, emphasized text
font - semibold; // 600 - Headings, titles
font - bold; // 700 - Page titles, CTAs
```

## Line Height

```tsx
leading - tight; // 1.25 - Headings
leading - snug; // 1.375 - Subheadings
leading - normal; // 1.5 - Body text (default)
leading - relaxed; // 1.625 - Long-form content
```

## Text Truncation

```tsx
// Single line truncation
<p className="truncate">Long text that will be truncated...</p>

// Multi-line truncation
<p className="line-clamp-2">
  Text that will be limited to two lines...
</p>

// Wrap prevention
<span className="whitespace-nowrap">Don't break this</span>
```

## Text Colors

```tsx
text-gray-900 dark:text-white        // Primary text
text-gray-700 dark:text-gray-300     // Secondary text
text-gray-600 dark:text-gray-400     // Tertiary text
text-gray-500 dark:text-gray-400     // Muted text
text-gray-400 dark:text-gray-500     // Disabled/placeholder

// Accent colors
text-blue-600 dark:text-blue-400     // Links, interactive
text-green-600 dark:text-green-400   // Success
text-red-600 dark:text-red-400       // Error
text-yellow-600 dark:text-yellow-400 // Warning
```

## Common Patterns

```tsx
// Page header
<div>
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
  <p className="text-gray-600 dark:text-gray-400 mt-1">
    Description
  </p>
</div>

// Card with title and description
<div>
  <h3 className="font-semibold text-gray-900 dark:text-white">
    {title}
  </h3>
  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
    {description}
  </p>
</div>

// Label + value
<div>
  <span className="text-xs text-gray-500 dark:text-gray-400">Label</span>
  <p className="font-medium text-gray-900 dark:text-white">{value}</p>
</div>
```
