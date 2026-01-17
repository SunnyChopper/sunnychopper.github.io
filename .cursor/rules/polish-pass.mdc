---
description: "USE WHEN doing a final polish pass on UI components for production quality."
globs: ""
alwaysApply: false
---

# Polish Pass Checklist

Final quality checks before considering a component complete.

## Visual Polish

### Spacing Consistency
- [ ] Consistent padding within similar elements
- [ ] Proper margins between sections (use 8px scale)
- [ ] Adequate whitespace around content
- [ ] Aligned elements in rows/grids

### Typography
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Readable line lengths (max 65-75 characters)
- [ ] Adequate line height (1.5 for body, 1.2 for headings)
- [ ] No orphaned words on important headings
- [ ] Proper text truncation with ellipsis where needed

### Colors & Contrast
- [ ] Text passes WCAG contrast requirements
- [ ] Dark mode colors properly paired
- [ ] Hover states visible but not jarring
- [ ] Disabled states clearly distinguishable
- [ ] Error/success colors consistent with system

### Borders & Shadows
- [ ] Consistent border radius throughout
- [ ] Subtle borders for separation
- [ ] Shadows appropriate for elevation level
- [ ] No harsh edges without purpose

## Interaction Polish

### Hover States
- [ ] All clickable elements have hover feedback
- [ ] Cursor changes appropriately (pointer, grab, etc.)
- [ ] Transition duration feels natural (150-200ms)
- [ ] No flash of unstyled state

### Focus States
- [ ] All interactive elements have visible focus
- [ ] Focus ring consistent across components
- [ ] Focus order logical (tab through makes sense)
- [ ] No focus traps (except intentional modals)

### Loading States
- [ ] Skeleton loaders match content shape
- [ ] Spinners centered and appropriately sized
- [ ] Disabled state during async operations
- [ ] Optimistic updates where appropriate

### Empty States
- [ ] Helpful message explaining the empty state
- [ ] Clear call-to-action if applicable
- [ ] Appropriate icon or illustration
- [ ] Not just blank space

### Error States
- [ ] Clear error messages
- [ ] Instructions for resolution
- [ ] Retry option when applicable
- [ ] Errors don't break layout

## Responsive Polish

### Breakpoints
- [ ] Mobile layout usable (320px min)
- [ ] Tablet breakpoint transitions smoothly
- [ ] Desktop utilizes available space
- [ ] No horizontal scroll on any viewport

### Touch Targets
- [ ] Minimum 44x44px touch targets on mobile
- [ ] Adequate spacing between tap targets
- [ ] Hover states don't break touch experience

### Content Adaptation
- [ ] Images scale appropriately
- [ ] Text doesn't overflow containers
- [ ] Tables scroll horizontally if needed
- [ ] Modals fit mobile viewport

## Code Quality

### Component Structure
- [ ] Single responsibility
- [ ] Props interface clearly typed
- [ ] Default values for optional props
- [ ] No inline styles (use Tailwind)

### Performance
- [ ] No unnecessary re-renders
- [ ] Images lazy loaded where appropriate
- [ ] Lists virtualized if > 100 items
- [ ] No console errors or warnings

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Screen reader tested
- [ ] Keyboard navigable

## Final Checks

```tsx
// Before shipping, verify:
// 1. Component works in light AND dark mode
// 2. All states covered: default, hover, focus, active, disabled, loading, error, empty
// 3. Responsive from 320px to 1920px
// 4. No console errors
// 5. Works with keyboard only
// 6. Works with screen reader
```

## Common Polish Fixes

```tsx
// Add missing transitions
className="transition-colors duration-150"

// Fix text overflow
className="truncate" // single line
className="line-clamp-2" // multi-line

// Ensure minimum touch target
className="min-h-[44px] min-w-[44px]"

// Add focus visible ring
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"

// Proper disabled state
className="disabled:opacity-50 disabled:cursor-not-allowed"

// Smooth hover transition
className="transition-all hover:scale-105"
```
