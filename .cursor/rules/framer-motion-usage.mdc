---
description: "Framer Motion animation patterns and best practices."
globs: "**/*.tsx"
alwaysApply: false
---

# Framer Motion Usage

Standards for using Framer Motion animations.

## Basic Animation

```tsx
import { motion } from 'framer-motion';

// Animate on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## Common Animation Variants

### Fade In

```tsx
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

<motion.div {...fadeIn}>Content</motion.div>
```

### Slide Up

```tsx
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

<motion.div {...slideUp} transition={{ duration: 0.3 }}>
  Content
</motion.div>
```

### Scale

```tsx
const scale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};
```

## AnimatePresence (Exit Animations)

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## Staggered Children

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i.id} variants={item}>
      {i.content}
    </motion.li>
  ))}
</motion.ul>
```

## Hover & Tap Animations

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
  Click me
</motion.button>

// With transition customization
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  Card
</motion.div>
```

## Layout Animations

```tsx
// Animate layout changes
<motion.div layout>
  Content that changes size
</motion.div>

// Shared layout animations
<motion.div layoutId="modal-image">
  <img src={src} alt={alt} />
</motion.div>
```

## Page Transitions

```tsx
// Wrap routes with AnimatePresence
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</AnimatePresence>

// Add animation to pages
function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

## Reduced Motion Support

```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

## Performance Tips

1. Use `layout` prop sparingly - it can be expensive
2. Avoid animating expensive properties (width, height)
3. Prefer `transform` and `opacity` for smooth 60fps
4. Use `will-change` hint for complex animations
5. Use `AnimatePresence mode="wait"` for sequential animations

```tsx
// Prefer
animate={{ x: 100, opacity: 1 }}

// Over
animate={{ left: '100px', width: '200px' }}
```
