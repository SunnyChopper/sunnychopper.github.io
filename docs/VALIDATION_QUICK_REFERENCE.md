# Validation Quick Reference

## 🚀 Most Common Commands

```bash
# Quick validation (use this most often)
npm run validate:quick

# Full validation (before commit)
npm run validate

# Auto-fix issues
npm run lint:fix
npm run format
```

## 📋 Validation Checklist

Before committing AI-generated code:

- [ ] `npm run validate:quick` passes
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code is formatted
- [ ] Components have loading/error states
- [ ] No `any` types
- [ ] No `console.log`
- [ ] Accessibility checks pass

## ⚡ Speed Guide

| Command          | Time  | Use When           |
| ---------------- | ----- | ------------------ |
| `validate:quick` | ~10s  | During development |
| `validate`       | ~30s  | Before commit      |
| `validate:full`  | ~2min | Before PR          |

## 🔧 Common Fixes

### Type Errors

```bash
npm run type-check  # See errors
# Add return types, fix types
```

### Lint Errors

```bash
npm run lint:fix  # Auto-fix
```

### Format Issues

```bash
npm run format  # Auto-format
```

### Pattern Violations

```bash
npm run check-patterns  # See issues
# Add loading states, error handling, etc.
```

## 📖 Full Documentation

- [Validation Guide](./VALIDATION_GUIDE.md) - Complete guide
- [Improvements Summary](./GUARDRAILS_IMPROVEMENTS_SUMMARY.md) - What was added
