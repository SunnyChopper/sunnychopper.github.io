---
description: 'USE WHEN adding keyboard support, shortcuts, and navigation.'
globs: ''
alwaysApply: false
---

# Keyboard Navigation

Standards for keyboard interaction patterns.

## Basic Keyboard Support

Every interactive element must be:

1. **Focusable** - can receive focus via Tab
2. **Activatable** - responds to Enter/Space
3. **Visually indicated** - focus state is visible

```tsx
// Native elements are keyboard accessible by default
<button>Click me</button>
<a href="/page">Link</a>
<input type="text" />

// Custom interactive elements need explicit handling
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

## List Navigation

For lists of items (menus, dropdowns, etc.):

```tsx
function NavigableList({ items, onSelect }) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  return (
    <ul role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={index === focusedIndex}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

## Modal Keyboard Handling

```tsx
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus first element when opened
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
    }
  }, [isOpen]);

  return (/* modal content */);
}
```

## Keyboard Shortcuts

For app-wide shortcuts:

```tsx
function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = options.ctrl ? e.ctrlKey : !e.ctrlKey;
      const metaMatch = options.meta ? e.metaKey : !e.metaKey;
      const shiftMatch = options.shift ? e.shiftKey : !e.shiftKey;

      if (e.key === key && ctrlMatch && metaMatch && shiftMatch) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
}

// Usage
useKeyboardShortcut('k', openCommandPalette, { meta: true });
useKeyboardShortcut('/', focusSearch);
```

## Skip Link

For main content skip:

```tsx
<a
  href="#main-content"
  className="
    sr-only focus:not-sr-only
    focus:absolute focus:top-4 focus:left-4
    focus:z-50 focus:px-4 focus:py-2
    focus:bg-blue-600 focus:text-white
    focus:rounded-lg
  "
>
  Skip to main content
</a>;

{
  /* Later in the page */
}
<main id="main-content" tabIndex={-1}>
  {/* Main content */}
</main>;
```

## Tab Order

Control tab order with tabIndex:

```tsx
// In natural tab order
tabIndex={0}

// Removed from tab order (but focusable programmatically)
tabIndex={-1}

// Custom tab order (avoid if possible)
tabIndex={1}, tabIndex={2}, etc.
```

## Focus Visible

Only show focus ring for keyboard users:

```tsx
// Tailwind's focus-visible
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"

// Or use :focus-visible CSS
.button:focus-visible {
  outline: 2px solid var(--color-primary);
}
```

## Common Patterns

| Element  | Enter       | Space       | Escape | Arrows         |
| -------- | ----------- | ----------- | ------ | -------------- |
| Button   | Activate    | Activate    | -      | -              |
| Link     | Navigate    | -           | -      | -              |
| Menu     | Open        | -           | Close  | Navigate items |
| Modal    | -           | -           | Close  | -              |
| Dropdown | Open/Select | Open/Select | Close  | Navigate items |
| Tabs     | Switch tab  | Switch tab  | -      | Navigate tabs  |
| Checkbox | Toggle      | Toggle      | -      | -              |
