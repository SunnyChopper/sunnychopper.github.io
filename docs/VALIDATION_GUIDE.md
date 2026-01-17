# Code Validation Guide

This guide explains how to quickly validate AI-generated code in this repository.

## Quick Validation Commands

### Fast Feedback (Recommended for AI-generated code)

```bash
npm run validate:quick
```

Runs essential checks in ~10-30 seconds:

- TypeScript type checking
- ESLint
- Prettier format check

### Full Validation (Before Commits)

```bash
npm run validate
```

Runs all validation checks:

- Type checking
- Linting
- Format checking
- Type coverage (optional)
- Architecture validation
- Pattern checking

### Complete Validation (Before PRs)

```bash
npm run validate:full
```

Includes all checks plus:

- Unit tests
- E2E tests

## Individual Validation Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix  # Auto-fix issues

# Formatting
npm run format:check
npm run format     # Auto-format

# Architecture & Patterns
npm run validate-architecture
npm run check-patterns
npm run check-type-coverage

# Testing
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
```

## What Gets Validated

### 1. **Type Safety**

- TypeScript strict mode compliance
- No `any` types (warns)
- Proper return types on functions
- Type coverage (90% minimum)

### 2. **Code Quality**

- ESLint rules (React, TypeScript, Accessibility, Code Quality)
- Custom project rules:
  - Service functions return `ApiResponse<T>`
  - No inline styles (except dynamic)
  - Components handle loading/error states
- Prettier formatting
- Import organization

### 3. **Architecture**

- Atomic design structure (atoms → molecules → organisms)
- Service layer patterns
- File naming conventions
- Import/export conventions

### 4. **Patterns**

- Loading/error state handling
- Dark mode support
- Accessibility (ARIA, keyboard nav)
- Tailwind usage (no hardcoded colors)
- No console.log in production

### 5. **Testing**

- Unit test coverage (70% threshold)
- E2E test execution
- Test setup and mocks

## CI/CD Validation

### GitHub Actions

- **CI Workflow** (`.github/workflows/ci.yml`):
  - Runs on every PR and push
  - Validates code quality
  - Runs tests
  - Blocks merge if validation fails

- **Deploy Workflow** (`.github/workflows/deploy.yml`):
  - Validates before building
  - Only builds if validation passes

## Git Hooks

### Pre-commit

- Runs `lint-staged` on staged files
- Auto-fixes ESLint and Prettier issues
- Fast feedback (< 5 seconds)

### Pre-push

- Full type checking
- Full linting
- Format checking
- Slower but comprehensive

## Common Issues & Fixes

### Type Errors

```bash
# Fix: Add proper types
npm run type-check  # See errors
# Add types to fix
```

### Linting Errors

```bash
# Auto-fix most issues
npm run lint:fix
```

### Formatting Issues

```bash
# Auto-format
npm run format
```

### Architecture Violations

```bash
# See violations
npm run validate-architecture
# Fix file organization/naming
```

### Pattern Violations

```bash
# See violations
npm run check-patterns
# Fix: Add loading states, error handling, etc.
```

## Best Practices for AI-Generated Code

1. **Always run quick validation first:**

   ```bash
   npm run validate:quick
   ```

2. **Fix type errors immediately:**
   - AI often misses return types
   - Add explicit types for functions

3. **Check for missing states:**
   - Loading states for async operations
   - Error states for error handling
   - Empty states for lists

4. **Verify accessibility:**
   - Keyboard navigation
   - ARIA attributes
   - Alt text on images

5. **Run full validation before committing:**
   ```bash
   npm run validate
   ```

## Validation Scripts Reference

| Script                  | Purpose            | Speed         | When to Use             |
| ----------------------- | ------------------ | ------------- | ----------------------- |
| `validate:quick`        | Essential checks   | Fast (~10s)   | During development      |
| `validate`              | All checks         | Medium (~30s) | Before commit           |
| `validate:full`         | Everything + tests | Slow (~2min)  | Before PR               |
| `type-check`            | TypeScript only    | Fast (~5s)    | Quick type check        |
| `lint`                  | Linting only       | Fast (~5s)    | Quick lint check        |
| `validate-architecture` | Architecture       | Medium (~15s) | After refactoring       |
| `check-patterns`        | Pattern compliance | Medium (~20s) | After adding components |

## Troubleshooting

### Validation Scripts Not Found

```bash
# Ensure scripts directory exists
ls scripts/

# Install dependencies
npm install
```

### Custom ESLint Rules Not Working

```bash
# Check eslint.config.js includes custom rules
# Verify eslint-rules/custom-rules.js exists
```

### Type Coverage Fails

```bash
# Install type-coverage if missing
npm install --save-dev type-coverage

# Check coverage report
npm run check-type-coverage
```

### CI Validation Fails

- Check GitHub Actions logs
- Run validation locally first
- Fix issues before pushing
