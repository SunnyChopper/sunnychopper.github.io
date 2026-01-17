---
description: "USE WHEN applying spacing, padding, margins, and gaps to UI elements."
globs: ""
alwaysApply: false
---

# Spacing System

Consistent spacing creates visual rhythm and hierarchy.

## The 8px Grid

All spacing should align to an 8px base grid:

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight inline spacing |
| `2` | 8px | Compact elements |
| `3` | 12px | Default element spacing |
| `4` | 16px | Section padding |
| `5` | 20px | Large element spacing |
| `6` | 24px | Card padding |
| `8` | 32px | Section spacing |
| `10` | 40px | Large sections |
| `12` | 48px | Page sections |

## Component-Level Spacing

```tsx
// Buttons
<button className="px-4 py-2">     // Standard button
<button className="px-3 py-1.5">   // Small button
<button className="px-6 py-3">     // Large button

// Cards
<div className="p-6">              // Standard card padding
<div className="p-4">              // Compact card padding

// Form inputs
<input className="px-3 py-2" />    // Standard input padding

// List items
<div className="p-4">              // Clickable list items
<div className="px-4 py-3">        // Compact list items
```

## Vertical Spacing

```tsx
// Page sections
<div className="space-y-8">        // Between major sections

// Within sections
<div className="space-y-6">        // Card groups
<div className="space-y-4">        // Content blocks
<div className="space-y-3">        // Form fields
<div className="space-y-2">        // List items
<div className="space-y-1">        // Tight lists (meta info)
```

## Horizontal Spacing

```tsx
// Between elements
<div className="gap-6">            // Major element groups
<div className="gap-4">            // Standard element spacing
<div className="gap-3">            // Compact elements
<div className="gap-2">            // Icon + text, badge groups
<div className="gap-1">            // Very tight spacing
```

## Margin Patterns

Prefer gap/space-y over margins, but when needed:

```tsx
// Section margins
<section className="mt-8">         // After header
<section className="mb-8">         // Before footer

// Element margins
<h2 className="mb-4">              // After heading
<p className="mt-1">               // Supporting text
```

## Forbidden Patterns

- Arbitrary spacing like `mt-[13px]`
- Mixing spacing scales inconsistently
- Using margins when gap/space-y works
- Different spacing for similar elements
- Spacing that doesn't align to 4px/8px grid

## Quick Reference

```
Tight:    gap-1, space-y-1, p-1     (4px)
Compact:  gap-2, space-y-2, p-2     (8px)
Default:  gap-3, space-y-3, p-3     (12px)
Standard: gap-4, space-y-4, p-4     (16px)
Roomy:    gap-6, space-y-6, p-6     (24px)
Large:    gap-8, space-y-8, p-8     (32px)
```
