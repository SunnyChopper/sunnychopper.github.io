---
description: 'USE WHEN creating cards, panels, and contained content blocks.'
globs: ''
alwaysApply: false
---

# Card Patterns

Standards for cards and content containers.

## Basic Card

```tsx
<div
  className="
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg
  p-6
"
>
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Card description or content goes here.</p>
</div>
```

## Card with Header

```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Card Title</h3>
      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  </div>

  {/* Body */}
  <div className="p-6">
    <p className="text-gray-600 dark:text-gray-400">Card content</p>
  </div>

  {/* Footer (optional) */}
  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button>Save</Button>
    </div>
  </div>
</div>
```

## Clickable Card

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={onClick}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
  className="
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-lg p-6
    cursor-pointer
    hover:border-blue-500 dark:hover:border-blue-500
    hover:shadow-md
    transition
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
>
  {/* Card content */}
</div>
```

## Stat Card

```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
  <div className="flex items-center gap-4">
    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">42</p>
    </div>
  </div>
</div>
```

## Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

## Entity Card (Task, Goal, etc.)

```tsx
<div
  className="
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg p-4
  hover:shadow-md transition
"
>
  <div className="flex items-start gap-4">
    {/* Status indicator */}
    <div className="flex-shrink-0">
      <StatusBadge status={task.status} />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-3">
        <AreaBadge area={task.area} />
        <span className="text-xs text-gray-400">Due {formatDate(task.dueDate)}</span>
      </div>
    </div>

    {/* Actions */}
    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
      <MoreVertical className="w-4 h-4 text-gray-400" />
    </button>
  </div>
</div>
```

## Card Elevation Levels

```tsx
// Level 0: Flat (border only)
className = 'border border-gray-200 dark:border-gray-700';

// Level 1: Subtle shadow
className = 'shadow-sm';

// Level 2: Medium shadow (hover states)
className = 'shadow-md';

// Level 3: Prominent (modals, dropdowns)
className = 'shadow-lg';

// Level 4: High (floating elements)
className = 'shadow-xl';
```

## Best Practices

1. **Consistent padding** - use p-4 or p-6
2. **Clear hierarchy** - title, content, meta, actions
3. **Hover feedback** - for clickable cards
4. **Keyboard accessible** - if clickable, add tabIndex and key handlers
5. **Truncation** - prevent text overflow
