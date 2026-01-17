---
description: "USE WHEN displaying lists, tables, and data collections."
globs: ""
alwaysApply: false
---

# Table & List Patterns

Standards for displaying collections of data.

## Simple List

```tsx
<div className="space-y-2">
  {items.map(item => (
    <div
      key={item.id}
      className="
        flex items-center gap-4 p-4
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition
      "
    >
      {/* Item content */}
    </div>
  ))}
</div>
```

## Clickable List Item

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => onSelect(item)}
  onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
  className="
    flex items-center gap-4 p-4
    rounded-lg cursor-pointer
    hover:bg-gray-100 dark:hover:bg-gray-700
    focus:outline-none focus:ring-2 focus:ring-blue-500
    transition
  "
>
  {/* Content */}
</div>
```

## List with Selection

```tsx
<div className="space-y-2">
  {items.map(item => (
    <div
      key={item.id}
      onClick={() => onSelect(item.id)}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition',
        selectedId === item.id
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
      )}
    >
      {/* Content */}
    </div>
  ))}
</div>
```

## Data Table

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Name
        </th>
        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Status
        </th>
        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map(item => (
        <tr
          key={item.id}
          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <td className="py-3 px-4 text-gray-900 dark:text-white">
            {item.name}
          </td>
          <td className="py-3 px-4">
            <StatusBadge status={item.status} />
          </td>
          <td className="py-3 px-4 text-right">
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## Sortable Table Header

```tsx
<th
  onClick={() => handleSort('name')}
  className="
    text-left py-3 px-4
    text-sm font-medium text-gray-500
    cursor-pointer hover:text-gray-700
  "
>
  <div className="flex items-center gap-1">
    <span>Name</span>
    {sortBy === 'name' && (
      sortOrder === 'asc'
        ? <ChevronUp className="w-4 h-4" />
        : <ChevronDown className="w-4 h-4" />
    )}
  </div>
</th>
```

## Virtualized List (Long Lists)

For lists with 100+ items:

```tsx
// Use a virtualization library like react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  width="100%"
  itemCount={items.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  )}
</FixedSizeList>
```

## Empty List

```tsx
{items.length === 0 ? (
  <EmptyState
    icon={<Inbox />}
    title="No items"
    description="Create your first item to get started"
    action={<Button onClick={onCreate}>Create</Button>}
  />
) : (
  <div className="space-y-2">
    {items.map(item => <ListItem key={item.id} {...item} />)}
  </div>
)}
```

## List with Loading More

```tsx
<div className="space-y-2">
  {items.map(item => <ListItem key={item.id} {...item} />)}

  {hasMore && (
    <div className="text-center py-4">
      <Button
        variant="ghost"
        onClick={loadMore}
        isLoading={isLoadingMore}
      >
        Load More
      </Button>
    </div>
  )}
</div>
```

## Best Practices

1. **Key prop** - always use unique, stable keys
2. **Loading states** - skeleton or spinner for async data
3. **Empty state** - helpful message when no items
4. **Virtualization** - for long lists (100+ items)
5. **Accessible** - proper roles for interactive lists
6. **Responsive** - tables should scroll horizontally on mobile
