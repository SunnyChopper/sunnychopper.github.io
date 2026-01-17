---
description: "Global frontend quality bar for this repo: UI polish, accessibility, interaction states, consistency."
globs: ""
alwaysApply: true
---

# Frontend Quality Constitution

This rule defines the non-negotiable quality standards for all frontend code in this repository.

## Core Principles

- **Polish over speed**: Take time to get spacing, typography, and interactions right
- **Consistency is king**: Follow established patterns; don't invent new ones without reason
- **States are features**: Loading, empty, error, and disabled states are not optional
- **Accessibility by default**: Semantic HTML, keyboard nav, and screen reader support always

## Visual Quality Standards

- Maintain consistent spacing rhythm using the 8px grid system
- Ensure typography hierarchy is clear (headings, body, captions)
- Use consistent border-radius across similar elements
- Apply shadows purposefully for elevation, not decoration
- Colors must meet WCAG AA contrast requirements

## Interaction Standards

- Every clickable element needs hover, active, and focus states
- Transitions should be smooth (150-300ms) and purposeful
- Loading states must appear within 100ms of action
- Disabled elements must be visually distinct and non-interactive

## Code Quality Standards

- No inline styles except for truly dynamic values
- No magic numbers - use design tokens/Tailwind classes
- Components must be self-contained and reusable
- Props should have sensible defaults
- TypeScript strict mode compliance required

## Forbidden Patterns

- `any` type without explicit justification
- Hardcoded colors outside the design system
- Missing loading/error states on async operations
- Non-semantic HTML (`div` soup)
- Inconsistent spacing (mixing arbitrary values)

## Required Patterns

- Dark mode support on all UI components
- Responsive behavior on all layouts
- Proper error boundaries around async content
- Accessible labels on all interactive elements
