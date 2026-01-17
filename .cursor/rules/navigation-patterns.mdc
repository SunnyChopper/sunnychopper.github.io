---
description: "USE WHEN building navigation, menus, and routing interfaces."
globs: ""
alwaysApply: false
---

# Navigation Patterns

Standards for navigation and routing interfaces.

## Sidebar Navigation

```tsx
<nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen">
  {/* Logo/Brand */}
  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
    <Logo />
  </div>

  {/* Nav items */}
  <div className="p-4 space-y-1">
    {navItems.map(item => (
      <NavLink
        key={item.href}
        to={item.href}
        className={({ isActive }) => cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition',
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </NavLink>
    ))}
  </div>
</nav>
```

## Collapsible Nav Section

```tsx
function NavSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between w-full
          px-3 py-2 text-left
          text-gray-700 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-700
          rounded-lg transition
        "
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="pl-10 space-y-1 mt-1">
          {children}
        </div>
      )}
    </div>
  );
}
```

## Tab Navigation

```tsx
<div className="border-b border-gray-200 dark:border-gray-700">
  <nav className="flex gap-4">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
          activeTab === tab.id
            ? 'text-blue-600 dark:text-blue-400 border-blue-600'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-300'
        )}
      >
        {tab.label}
      </button>
    ))}
  </nav>
</div>
```

## Breadcrumbs

```tsx
<nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
  {items.map((item, index) => (
    <React.Fragment key={item.href}>
      {index > 0 && (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
      {index === items.length - 1 ? (
        <span className="text-gray-900 dark:text-white font-medium">
          {item.label}
        </span>
      ) : (
        <Link
          to={item.href}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {item.label}
        </Link>
      )}
    </React.Fragment>
  ))}
</nav>
```

## Mobile Navigation

```tsx
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b">
        <Logo />
        <button onClick={() => setIsOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <nav className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 p-4">
            {/* Nav content */}
          </nav>
        </div>
      )}
    </>
  );
}
```

## Bottom Tab Bar (Mobile)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
  <div className="flex justify-around">
    {tabs.map(tab => (
      <NavLink
        key={tab.href}
        to={tab.href}
        className={({ isActive }) => cn(
          'flex flex-col items-center py-2 px-4',
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400'
        )}
      >
        <tab.icon className="w-6 h-6" />
        <span className="text-xs mt-1">{tab.label}</span>
      </NavLink>
    ))}
  </div>
</nav>
```

## Active State Patterns

```tsx
// Background highlight
isActive && 'bg-blue-50 dark:bg-blue-900/20'

// Text color change
isActive && 'text-blue-600 dark:text-blue-400'

// Border indicator
isActive && 'border-l-2 border-blue-600'

// Combined
isActive
  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
```
