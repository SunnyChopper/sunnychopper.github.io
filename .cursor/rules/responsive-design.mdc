---
description: "USE WHEN making components and layouts responsive across screen sizes."
globs: ""
alwaysApply: false
---

# Responsive Design

Mobile-first responsive design patterns.

## Breakpoint Reference

| Prefix | Min-width | Target Devices |
|--------|-----------|----------------|
| (none) | 0px | Mobile phones |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

## Mobile-First Approach

Always start with mobile styles, then add breakpoints:

```tsx
// Correct: Mobile-first
<div className="
  flex flex-col           // Mobile: stack vertically
  md:flex-row             // Tablet+: horizontal
  lg:grid lg:grid-cols-3  // Desktop: grid
">

// Incorrect: Desktop-first
<div className="grid grid-cols-3 md:grid-cols-2 sm:flex sm:flex-col">
```

## Common Responsive Patterns

### Navigation

```tsx
// Mobile: hamburger menu, Desktop: horizontal nav
<nav className="flex items-center justify-between">
  <Logo />
  <button className="md:hidden">Menu</button>
  <div className="hidden md:flex gap-6">
    {navItems}
  </div>
</nav>
```

### Grid Columns

```tsx
// Stats grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Card grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Sidebar layout
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-3">Main</div>
  <div>Sidebar</div>
</div>
```

### Typography Scaling

```tsx
// Page titles that scale
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Description text
<p className="text-sm md:text-base">
```

### Spacing Adjustments

```tsx
// Page padding
<div className="px-4 md:px-6 lg:px-8">

// Section spacing
<div className="space-y-6 md:space-y-8">

// Card padding
<div className="p-4 md:p-6">
```

### Show/Hide Elements

```tsx
// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show on mobile only
<div className="md:hidden">Mobile only</div>

// Show on tablet+
<div className="hidden sm:block">Tablet and up</div>
```

### Flex Direction

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="md:w-1/3">Sidebar</div>
  <div className="md:w-2/3">Content</div>
</div>
```

## Container Patterns

```tsx
// Centered content container
<div className="max-w-4xl mx-auto px-4 md:px-6">

// Full-width with max
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

## Image Responsiveness

```tsx
// Responsive image
<img
  src={src}
  alt={alt}
  className="w-full h-auto object-cover rounded-lg"
/>

// Aspect ratio container
<div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
  <img className="w-full h-full object-cover" />
</div>
```

## Testing Checklist

- [ ] Works on 320px width (small phones)
- [ ] Works on 768px (tablets)
- [ ] Works on 1024px (laptops)
- [ ] Works on 1440px (desktops)
- [ ] Text is readable at all sizes
- [ ] Touch targets are 44px+ on mobile
- [ ] No horizontal scroll on any viewport
