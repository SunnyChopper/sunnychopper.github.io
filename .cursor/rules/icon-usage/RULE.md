---
description: 'USE WHEN adding icons, choosing icon styles, and sizing icons.'
globs: ''
alwaysApply: false
---

# Icon Usage

Standards for using icons consistently.

## Icon Library

This project uses **Lucide React** for icons:

```tsx
import { Plus, ChevronRight, AlertCircle } from 'lucide-react';
```

## Icon Sizes

Match icon size to context:

```tsx
// Small (badges, inline text)
<Icon className="w-4 h-4" />   // 16px

// Medium (buttons, list items)
<Icon className="w-5 h-5" />   // 20px

// Large (headers, cards)
<Icon className="w-6 h-6" />   // 24px

// Extra Large (empty states, heroes)
<Icon className="w-8 h-8" />   // 32px
<Icon className="w-12 h-12" /> // 48px
```

## Icon in Buttons

```tsx
// Icon before text
<button className="inline-flex items-center gap-2">
  <Plus className="w-4 h-4" />
  <span>Add Item</span>
</button>

// Icon after text
<button className="inline-flex items-center gap-2">
  <span>Next</span>
  <ChevronRight className="w-4 h-4" />
</button>

// Icon only (requires aria-label)
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>
```

## Icon Colors

```tsx
// Inherit text color (default)
<Icon className="w-5 h-5" />

// Specific color
<Icon className="w-5 h-5 text-blue-600" />

// Muted
<Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />

// Status colors
<CheckCircle className="w-5 h-5 text-green-600" />  // Success
<AlertCircle className="w-5 h-5 text-red-600" />    // Error
<AlertTriangle className="w-5 h-5 text-yellow-600" /> // Warning
<Info className="w-5 h-5 text-blue-600" />          // Info
```

## Icon Containers

```tsx
// Circle container (stats, features)
<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
</div>

// Square container (cards)
<div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
</div>

// Gradient container (feature highlights)
<div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
  <Icon className="w-8 h-8 text-white" />
</div>
```

## Icon in Navigation

```tsx
<NavLink
  to={href}
  className={({ isActive }) =>
    cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg',
      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
    )
  }
>
  <Icon className="w-5 h-5" />
  <span>{label}</span>
</NavLink>
```

## Common Icon Patterns

```tsx
// Loading spinner
<Loader2 className="w-5 h-5 animate-spin" />

// Chevron for expandable
<ChevronDown className={cn(
  'w-4 h-4 transition-transform',
  isExpanded && 'rotate-180'
)} />

// External link
<a href={url} className="inline-flex items-center gap-1">
  {text}
  <ExternalLink className="w-3 h-3" />
</a>

// Copy to clipboard
<button onClick={copy} aria-label="Copy to clipboard">
  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
</button>
```

## Icon Selection Guidelines

| Use Case   | Icons                              |
| ---------- | ---------------------------------- |
| Add/Create | Plus, PlusCircle                   |
| Edit       | Pencil, Edit2, PenSquare           |
| Delete     | Trash2, X                          |
| Save       | Save, Check                        |
| Close      | X, XCircle                         |
| Back       | ArrowLeft, ChevronLeft             |
| Forward    | ArrowRight, ChevronRight           |
| Menu       | Menu, MoreVertical, MoreHorizontal |
| Search     | Search                             |
| Settings   | Settings, Cog                      |
| User       | User, UserCircle                   |
| Expand     | ChevronDown, PlusCircle            |
| Collapse   | ChevronUp, MinusCircle             |

## Accessibility

```tsx
// Decorative icons (hidden from screen readers)
<Icon className="w-5 h-5" aria-hidden="true" />

// Interactive icon buttons need labels
<button aria-label="Delete item">
  <Trash2 className="w-5 h-5" />
</button>

// Icons conveying meaning need accessible text
<span className="inline-flex items-center gap-1">
  <AlertCircle className="w-4 h-4 text-red-500" />
  <span className="sr-only">Error:</span>
  {errorMessage}
</span>
```
