---
description: "USE WHEN building page layouts, sections, and content arrangement."
globs: ""
alwaysApply: false
---

# Layout Composition

Patterns for composing layouts and arranging content.

## Standard Page Layout

```tsx
<div className="space-y-6">
  {/* Page header */}
  <header className="flex items-center justify-between">
    <div>
      <h1>Title</h1>
      <p>Description</p>
    </div>
    <div>Actions</div>
  </header>

  {/* Main content */}
  <main>
    {/* Content sections */}
  </main>
</div>
```

## Grid Layouts

```tsx
// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>Left content</div>
  <div>Right content</div>
</div>

// Three-column layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// Sidebar layout (main + sidebar)
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-3">Main content</div>
  <div className="space-y-6">Sidebar</div>
</div>

// Dashboard grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map(stat => <StatCard key={stat.id} />)}
</div>
```

## Flex Layouts

```tsx
// Horizontal with space between
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

// Centered content
<div className="flex items-center justify-center min-h-[400px]">
  <CenteredContent />
</div>

// Stack with consistent gap
<div className="flex flex-col gap-4">
  {items.map(item => <Item key={item.id} />)}
</div>

// Horizontal scrolling
<div className="flex gap-4 overflow-x-auto pb-4">
  {items.map(item => <Card key={item.id} className="flex-shrink-0 w-72" />)}
</div>
```

## Content Sections

```tsx
// Section with header
<section className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      Section Title
    </h2>
    <Button variant="ghost" size="sm">View All</Button>
  </div>
  <div className="grid grid-cols-3 gap-4">
    {/* Section content */}
  </div>
</section>

// Card section
<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
    Card Title
  </h3>
  <div className="space-y-4">
    {/* Card content */}
  </div>
</div>
```

## Responsive Breakpoint Strategy

- `default` (0px+): Mobile-first base styles
- `sm` (640px+): Large phones
- `md` (768px+): Tablets
- `lg` (1024px+): Laptops
- `xl` (1280px+): Desktops
- `2xl` (1536px+): Large screens

```tsx
// Responsive grid example
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2     // Tablet: 2 columns
  lg:grid-cols-3     // Desktop: 3 columns
  xl:grid-cols-4     // Large: 4 columns
  gap-4
">
```

## Spacing Rhythm

Use consistent spacing for visual rhythm:

- Section spacing: `space-y-8` or `gap-8`
- Card internal: `p-6` and `space-y-4`
- List items: `space-y-2` or `gap-2`
- Tight groups: `space-y-1` or `gap-1`
