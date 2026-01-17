---
description: "USE WHEN implementing form validation, error messages, and input constraints."
globs: ""
alwaysApply: false
---

# Form Validation

Patterns for validating user input and providing feedback.

## Validation Timing

1. **On blur** - validate field when user leaves it
2. **On change** - clear error when user starts fixing
3. **On submit** - validate all fields before submission

```tsx
const [touched, setTouched] = useState<Record<string, boolean>>({});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleBlur = (field: string) => {
  setTouched({ ...touched, [field]: true });
  validateField(field);
};

const handleChange = (field: string, value: string) => {
  setValues({ ...values, [field]: value });
  // Clear error when user starts typing
  if (errors[field]) {
    setErrors({ ...errors, [field]: '' });
  }
};
```

## Validation Functions

```tsx
interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

const rules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value !== '' && value !== null && value !== undefined,
    message,
  }),

  minLength: (min: number): ValidationRule => ({
    validate: (value) => String(value).length >= min,
    message: `Must be at least ${min} characters`,
  }),

  maxLength: (max: number): ValidationRule => ({
    validate: (value) => String(value).length <= max,
    message: `Must be no more than ${max} characters`,
  }),

  email: (): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(value),
    message,
  }),
};

function validateField(value: any, fieldRules: ValidationRule[]): string | null {
  for (const rule of fieldRules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
}
```

## Field-Level Validation

```tsx
const fieldValidation = {
  name: [rules.required(), rules.minLength(2), rules.maxLength(100)],
  email: [rules.required(), rules.email()],
  description: [rules.maxLength(500)],
};

const validateForm = (values: FormValues): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(fieldValidation)) {
    const error = validateField(values[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};
```

## Async Validation

```tsx
const validateEmail = async (email: string): Promise<string | null> => {
  // Check format first (sync)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email';
  }

  // Check availability (async)
  try {
    const exists = await checkEmailExists(email);
    if (exists) {
      return 'This email is already registered';
    }
  } catch {
    return 'Unable to verify email';
  }

  return null;
};

// Usage with debouncing
const debouncedEmailValidation = useMemo(
  () => debounce(async (email: string) => {
    setIsValidating(true);
    const error = await validateEmail(email);
    setErrors(prev => ({ ...prev, email: error || '' }));
    setIsValidating(false);
  }, 500),
  []
);
```

## Error Display Patterns

### Inline Error

```tsx
<div className="space-y-1">
  <input
    className={cn(inputClasses, error && 'border-red-500')}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : undefined}
  />
  {error && (
    <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
      {error}
    </p>
  )}
</div>
```

### Error Summary

```tsx
{Object.keys(errors).length > 0 && (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
    <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
      Please fix the following errors:
    </h4>
    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400">
      {Object.values(errors).map((error, i) => (
        <li key={i}>{error}</li>
      ))}
    </ul>
  </div>
)}
```

## Good Error Messages

| Bad | Good |
|-----|------|
| "Invalid input" | "Please enter a valid email address" |
| "Error" | "Name must be at least 2 characters" |
| "Required" | "Please enter your email" |
| "Format error" | "Phone number should be in format: (555) 123-4567" |

## Best Practices

1. **Validate early** - give feedback before submission
2. **Clear on fix** - remove error when user corrects input
3. **Be specific** - tell users exactly what's wrong
4. **Guide correction** - explain the expected format
5. **Accessible** - use aria-invalid and aria-describedby
6. **Don't block** - allow submission attempts (show all errors)
