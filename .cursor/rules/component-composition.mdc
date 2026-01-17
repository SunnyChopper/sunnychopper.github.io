---
description: "USE WHEN designing component APIs with composition patterns."
globs: ""
alwaysApply: false
---

# Component Composition

Standards for building composable, flexible component APIs.

## Children Pattern

```tsx
// Basic children composition
function Card({ children, className }: CardProps) {
  return (
    <div className={cn('p-4 bg-white rounded-lg border', className)}>
      {children}
    </div>
  );
}

// Usage
<Card>
  <h3>Title</h3>
  <p>Content goes here</p>
</Card>
```

## Compound Components

```tsx
// Create related components that work together
interface CardContextType {
  variant: 'default' | 'outlined';
}

const CardContext = createContext<CardContextType>({ variant: 'default' });

function Card({ children, variant = 'default' }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className="rounded-lg border">{children}</div>
    </CardContext.Provider>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-t bg-gray-50">{children}</div>;
}

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

## Render Props

```tsx
// For customizable rendering
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={tasks}
  keyExtractor={(task) => task.id}
  renderItem={(task) => <TaskCard task={task} />}
/>
```

## Slot Pattern

```tsx
// Named slots for flexible layouts
interface PageLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function PageLayout({ header, sidebar, children, footer }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header className="border-b">{header}</header>}

      <div className="flex-1 flex">
        {sidebar && <aside className="w-64 border-r">{sidebar}</aside>}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {footer && <footer className="border-t">{footer}</footer>}
    </div>
  );
}

// Usage
<PageLayout
  header={<NavBar />}
  sidebar={<SideMenu />}
  footer={<Footer />}
>
  <h1>Page Content</h1>
</PageLayout>
```

## Polymorphic Components

```tsx
// Component that can render as different elements
type ButtonProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
} & React.ComponentPropsWithoutRef<T>;

function Button<T extends React.ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';

  return (
    <Component
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800'
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Usage
<Button>Click me</Button>
<Button as="a" href="/page">Link Button</Button>
<Button as={Link} to="/page">Router Link</Button>
```

## Forwarding Refs

```tsx
// Forward ref to inner element
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
        {error && <span className="text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Usage with ref
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} label="Email" />
```

## Controlled vs Uncontrolled

```tsx
// Support both patterns
interface ToggleProps {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

function Toggle({ defaultChecked, checked, onChange }: ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = () => {
    const newValue = !isChecked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <button
      role="switch"
      aria-checked={isChecked}
      onClick={handleChange}
    >
      {/* Toggle UI */}
    </button>
  );
}

// Uncontrolled usage
<Toggle defaultChecked onChange={(v) => console.log(v)} />

// Controlled usage
<Toggle checked={isEnabled} onChange={setIsEnabled} />
```
