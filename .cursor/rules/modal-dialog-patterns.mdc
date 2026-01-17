---
description: "USE WHEN creating modals, dialogs, drawers, and overlay components."
globs: ""
alwaysApply: false
---

# Modal & Dialog Patterns

Standards for overlays, modals, and slide-out panels.

## Basic Modal

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="
          relative z-10
          bg-white dark:bg-gray-800
          rounded-lg shadow-xl
          max-w-md w-full
          max-h-[90vh] overflow-hidden
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## Modal Sizes

```tsx
// Small
className="max-w-sm w-full"

// Medium (default)
className="max-w-md w-full"

// Large
className="max-w-lg w-full"

// Extra Large
className="max-w-2xl w-full"

// Full Width
className="max-w-4xl w-full"
```

## Modal with Footer

```tsx
<div className="flex flex-col max-h-[90vh]">
  {/* Header */}
  <div className="p-6 border-b">...</div>

  {/* Scrollable body */}
  <div className="flex-1 overflow-y-auto p-6">
    {/* Content */}
  </div>

  {/* Sticky footer */}
  <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button onClick={onSave}>Save Changes</Button>
    </div>
  </div>
</div>
```

## Confirmation Dialog

```tsx
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  );
}
```

## Slide-out Panel (Drawer)

```tsx
function Drawer({ isOpen, onClose, title, children }) {
  return (
    <div className={cn(
      'fixed inset-0 z-50',
      isOpen ? 'visible' : 'invisible'
    )}>
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity',
          isOpen ? 'opacity-50' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        'absolute right-0 top-0 h-full w-full max-w-md',
        'bg-white dark:bg-gray-800 shadow-xl',
        'transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## Focus Management

```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      closeButtonRef.current?.focus();

      // Trap focus and handle escape
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // ...
}
```

## Body Scroll Lock

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }
}, [isOpen]);
```

## Best Practices

1. **Focus management** - focus first element, trap focus
2. **Escape to close** - always support keyboard dismiss
3. **Click outside** - backdrop click should close
4. **Scroll lock** - prevent body scroll when open
5. **ARIA attributes** - role, aria-modal, aria-labelledby
6. **Animation** - smooth entrance/exit transitions
