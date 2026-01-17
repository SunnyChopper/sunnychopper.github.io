---
description: 'Accessibility standards and WCAG compliance requirements.'
globs: '**/*.tsx'
alwaysApply: false
---

# Accessibility Standards

Ensure the application is usable by everyone.

## Semantic HTML

Use semantic elements instead of generic divs:

```tsx
// Good
<header>...</header>
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>
<aside>...</aside>
<footer>...</footer>
<button>...</button>

// Bad
<div className="header">...</div>
<div onClick={...}>...</div>
```

## Interactive Elements

### Buttons vs Links

```tsx
// Button: triggers an action
<button onClick={handleSubmit}>Submit</button>

// Link: navigates to a page
<a href="/about">About</a>
<Link to="/about">About</Link>

// Never use divs for interactive elements
// Bad:
<div onClick={handleClick}>Click me</div>
```

### Accessible Custom Buttons

```tsx
// If you must use a non-button element:
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

## Labels and Descriptions

### Form Labels

```tsx
// Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Hidden label (when visually hidden but needed for screen readers)
<label htmlFor="search" className="sr-only">Search</label>
<input id="search" type="search" placeholder="Search..." />
```

### ARIA Labels

```tsx
// Icon buttons
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>

// Describing element purpose
<nav aria-label="Main navigation">
  ...
</nav>

// Referencing description
<input aria-describedby="password-hint" type="password" />
<p id="password-hint">Password must be at least 8 characters</p>
```

## Focus Management

### Visible Focus

```tsx
// Always include focus styles
className="
  focus:outline-none
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
"

// Or visible outline
className="focus:outline-2 focus:outline-blue-500"
```

### Focus Trapping (Modals)

```tsx
useEffect(() => {
  if (isOpen) {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Trap focus within modal
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}, [isOpen]);
```

## Keyboard Navigation

Support these patterns:

| Key         | Action                             |
| ----------- | ---------------------------------- |
| Tab         | Move to next focusable element     |
| Shift+Tab   | Move to previous focusable element |
| Enter/Space | Activate button/link               |
| Escape      | Close modal/dropdown               |
| Arrow keys  | Navigate within lists/menus        |

## Screen Reader Text

```tsx
// Visually hidden but announced
<span className="sr-only">Loading...</span>

// Skip link for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Color Contrast

Minimum ratios:

- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

```tsx
// Good contrast
text-gray-900 on bg-white     // High contrast
text-gray-600 on bg-white     // Acceptable
text-white on bg-blue-600     // High contrast

// Check: don't rely on color alone
<span className="text-red-600">
  <AlertCircle className="inline w-4 h-4 mr-1" />
  Error message
</span>
```

## ARIA Roles and States

```tsx
// Expandable section
<button
  aria-expanded={isExpanded}
  aria-controls="section-content"
>
  Toggle Section
</button>
<div id="section-content" hidden={!isExpanded}>
  Content
</div>

// Loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Invalid input
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-message' : undefined}
/>
```

## Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] All form inputs have labels
- [ ] All images have alt text (or are marked decorative)
- [ ] Color is not the only indicator of meaning
- [ ] Focus is visible on all interactive elements
- [ ] Modals trap focus and can be closed with Escape
- [ ] Page has proper heading hierarchy (h1 > h2 > h3)
- [ ] Sufficient color contrast ratios
