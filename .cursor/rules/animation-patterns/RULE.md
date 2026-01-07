---
description: "USE WHEN adding animations, transitions, and motion to the UI."
globs: ""
alwaysApply: false
---

# Animation Patterns

Standards for smooth, purposeful animations.

## Transition Basics

```tsx
// Simple transition
className="transition"
className="transition-colors"
className="transition-opacity"
className="transition-transform"
className="transition-all"

// With duration
className="transition duration-150"  // Fast (interactions)
className="transition duration-200"  // Default
className="transition duration-300"  // Medium
className="transition duration-500"  // Slow (page transitions)

// With easing
className="transition ease-in"
className="transition ease-out"
className="transition ease-in-out"
```

## Common Transitions

### Hover Effects

```tsx
// Color change
className="transition-colors hover:bg-gray-100"

// Scale on hover
className="transition-transform hover:scale-105"

// Opacity change
className="transition-opacity opacity-80 hover:opacity-100"

// Shadow change
className="transition-shadow hover:shadow-lg"
```

### Fade In/Out

```tsx
// Conditional render with opacity
<div className={cn(
  'transition-opacity duration-200',
  isVisible ? 'opacity-100' : 'opacity-0'
)}>
  Content
</div>
```

### Slide In/Out

```tsx
// Slide from right
<div className={cn(
  'transform transition-transform duration-300',
  isOpen ? 'translate-x-0' : 'translate-x-full'
)}>
  Sidebar
</div>

// Slide from bottom
<div className={cn(
  'transform transition-transform duration-300',
  isOpen ? 'translate-y-0' : 'translate-y-full'
)}>
  Bottom sheet
</div>
```

### Expand/Collapse

```tsx
// Height animation (use max-height)
<div className={cn(
  'overflow-hidden transition-all duration-300',
  isExpanded ? 'max-h-96' : 'max-h-0'
)}>
  Collapsible content
</div>

// With opacity
<div className={cn(
  'overflow-hidden transition-all duration-300',
  isExpanded
    ? 'max-h-96 opacity-100'
    : 'max-h-0 opacity-0'
)}>
  Content
</div>
```

## Keyframe Animations

```tsx
// Spin (loading)
className="animate-spin"

// Ping (notification)
className="animate-ping"

// Pulse (skeleton loading)
className="animate-pulse"

// Bounce
className="animate-bounce"
```

## Staggered Animations

```tsx
// Stagger children entry
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fadeIn"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {item.content}
  </div>
))}
```

## Framer Motion Patterns

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>

// Slide up on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Exit animation
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>

// Hover animation
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

## Animation Guidelines

### Timing

- **Micro-interactions**: 100-150ms (hover, toggle)
- **Standard transitions**: 200-300ms (modals, panels)
- **Complex animations**: 300-500ms (page transitions)
- **Never exceed**: 500ms for UI transitions

### Purpose

Animations should:
- Provide feedback on interactions
- Guide attention to changes
- Create spatial relationships
- Maintain context during transitions

Animations should NOT:
- Distract from content
- Block user actions
- Cause motion sickness
- Add unnecessary delay

### Reduced Motion

```tsx
// Respect user's motion preferences
className="motion-safe:animate-bounce"
className="motion-reduce:transition-none"

// Or check in JS
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
```
