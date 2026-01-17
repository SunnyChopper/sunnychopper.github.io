---
description: 'USE WHEN managing focus states, focus trapping, and focus restoration.'
globs: ''
alwaysApply: false
---

# Focus Management

Proper focus handling for accessible, keyboard-friendly interfaces.

## Focus Ring Styles

```tsx
// Standard focus ring
className="
  focus:outline-none
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
"

// For dark mode
className="
  focus:ring-2 focus:ring-blue-500
  dark:focus:ring-offset-gray-800
"

// For inputs
className="
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
"

// Focus-visible only (hide for mouse clicks)
className="
  focus:outline-none
  focus-visible:ring-2 focus-visible:ring-blue-500
"
```

## Programmatic Focus

```tsx
import { useRef, useEffect } from 'react';

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}

// Focus after action
function handleCreate() {
  createItem();
  inputRef.current?.focus();
}
```

## Focus Trap (Modals)

```tsx
import { useEffect, useRef } from 'react';

function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get focusable elements
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstElement?.focus();

    // Handle Tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore previous focus
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// Usage
function Modal({ isOpen, onClose, children }) {
  const containerRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

## Focus Restoration

```tsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setIsOpen(false);
    // Restore focus to trigger
    triggerRef.current?.focus();
  };

  return (
    <>
      <button ref={triggerRef} onClick={() => setIsOpen(true)}>
        Open Menu
      </button>
      {isOpen && <DropdownMenu onClose={handleClose} />}
    </>
  );
}
```

## Auto-Focus Patterns

```tsx
// Form: focus first field
function ContactForm() {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
    <form>
      <input ref={nameRef} name="name" />
    </form>
  );
}

// Search: focus on open
function SearchOverlay({ isOpen }) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      searchRef.current?.focus();
    }
  }, [isOpen]);

  return isOpen ? <input ref={searchRef} type="search" /> : null;
}

// Error: focus first error field
function handleSubmit() {
  const errors = validate();
  if (Object.keys(errors).length > 0) {
    const firstErrorField = document.querySelector('[aria-invalid="true"]');
    (firstErrorField as HTMLElement)?.focus();
    return;
  }
  // Submit...
}
```

## Skip Focus for Decorative Elements

```tsx
// Remove from tab order
<div className="decorative" tabIndex={-1}>
  Decorative content
</div>

// Focusable but not in tab order (for programmatic focus)
<section id="main-content" tabIndex={-1}>
  Main content
</section>
```

## Focus Order

Ensure logical focus order:

1. Follow visual layout (left-to-right, top-to-bottom)
2. Group related elements
3. Put primary actions before secondary
4. Modal focus should stay within modal

```tsx
// Good: natural order
<header>Logo, Nav</header>
<main>Content</main>
<footer>Links</footer>

// Bad: using tabIndex to reorder
<div tabIndex={3}>Third</div>
<div tabIndex={1}>First</div>
<div tabIndex={2}>Second</div>
```
