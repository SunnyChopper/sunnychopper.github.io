---
description: 'Standards for form implementation, field grouping, and form UX.'
globs: '**/*Form*.tsx,**/*form*.tsx'
alwaysApply: false
---

# Form Patterns

Standards for building forms with great UX.

## Form Structure

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Form sections */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Basic Information</h3>

    {/* Form fields */}
    <FormField label="Name" required error={errors.name}>
      <input
        type="text"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
      />
    </FormField>
  </div>

  {/* Form actions */}
  <div className="flex justify-end gap-3 pt-4 border-t">
    <Button type="button" variant="ghost" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit" isLoading={isSubmitting}>
      Save
    </Button>
  </div>
</form>
```

## Form Field Component

```tsx
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {hint && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
```

## Input Styling

```tsx
// Base input classes
const inputClasses = `
  w-full px-3 py-2
  rounded-lg border
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-300 dark:border-gray-600
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  disabled:bg-gray-100 disabled:cursor-not-allowed
  transition
`;

// Error state
const errorClasses = `
  border-red-500 dark:border-red-500
  focus:ring-red-500
`;

// Input component
<input className={cn(inputClasses, error && errorClasses)} {...props} />;
```

## Common Field Types

### Text Input

```tsx
<input
  type="text"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  placeholder="Enter text..."
  className={inputClasses}
/>
```

### Textarea

```tsx
<textarea
  value={value}
  onChange={(e) => onChange(e.target.value)}
  rows={4}
  placeholder="Enter description..."
  className={inputClasses}
/>
```

### Select

```tsx
<select value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses}>
  <option value="">Select an option</option>
  {options.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
```

### Checkbox

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  />
  <span className="text-sm text-gray-700 dark:text-gray-300">Label text</span>
</label>
```

## Form State Management

```tsx
const [values, setValues] = useState<FormValues>(initialValues);
const [errors, setErrors] = useState<Partial<FormValues>>({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate
  const validationErrors = validate(values);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  // Submit
  setIsSubmitting(true);
  try {
    await onSubmit(values);
  } catch (error) {
    setErrors({ form: 'Failed to save. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};
```

## Form Section Pattern

```tsx
<div className="space-y-6">
  {/* Section 1 */}
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Enter the basic details</p>
    </div>
    {/* Fields */}
  </div>

  <hr className="border-gray-200 dark:border-gray-700" />

  {/* Section 2 */}
  <div className="space-y-4">{/* More fields */}</div>
</div>
```

## Best Practices

1. **Label all fields** - never leave inputs unlabeled
2. **Show required fields** - use asterisk or "(required)"
3. **Inline validation** - show errors as user types/blurs
4. **Disable during submit** - prevent double submissions
5. **Preserve data** - don't clear form on validation failure
6. **Logical grouping** - group related fields together
