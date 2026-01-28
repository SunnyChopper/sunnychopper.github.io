# Post-Mortem: Success Criteria Field Name Mismatch

**Date**: 2026-01-28  
**Issue**: Success criteria not displaying after goal creation  
**Root Cause**: Frontend type used `text` field, backend API returns `description` field  
**Incorrect Solution**: Added normalization mapping function  
**Correct Solution**: Update frontend type to match backend

## What Happened

When fixing the issue where success criteria weren't displaying after creating a goal, a normalization/mapping function was implemented to convert the backend's `description` field to the frontend's `text` field. This was the wrong approach.

## Why the Mapping Approach Was Chosen (Incorrectly)

1. **Pattern matching bias**: Saw existing normalization code in the codebase (`normalizeGoal` function) and assumed it was the correct pattern to follow.

2. **Didn't question existing code**: Found a `BackendSuccessCriterion` interface that used `description` and a `SuccessCriterion` interface that used `text`, and assumed the mapping was intentional and necessary.

3. **Didn't verify normalization purpose**: The normalization documentation (`docs/reference/normalization-and-dtos.md`) states normalization is for **key naming conventions** (snake_case → camelCase during migration), not for field name differences like `description` vs `text`.

4. **Didn't consider simpler solution**: Jumped to adding normalization instead of asking "Should the frontend type match the backend?"

5. **Assumed frontend type was correct**: Treated the frontend type as the source of truth instead of recognizing that the backend API contract is authoritative.

## Why This Was Wrong

1. **Backend is source of truth**: The backend API defines the data structure. Frontend should align with it, not the other way around.

2. **Adds unnecessary complexity**: Mapping functions add a transformation layer that must be maintained, tested, and remembered.

3. **Increases bug risk**: Field name mismatches can be missed during refactoring, and normalization can hide type mismatches.

4. **Violates normalization purpose**: According to the docs, normalization is for key naming conventions during migration, not for arbitrary field name differences.

5. **Makes codebase harder to understand**: New developers must understand why `description` becomes `text` and where this happens.

## The Correct Approach

1. **Update frontend type**: Change `SuccessCriterion.text` → `SuccessCriterion.description` to match backend.

2. **Update all component references**: Find all `criterion.text` usages and change to `criterion.description`.

3. **Remove normalization mapping**: Delete the `description` → `text` mapping from `normalizeGoal()`.

4. **Verify service methods**: Ensure all service methods return data that matches the updated frontend type (no mapping needed).

## Decision Framework for Future Type Mismatches

When encountering a frontend/backend type mismatch:

1. **Is it a key naming convention?** (snake_case vs camelCase)
   - ✅ If yes → Normalization may be appropriate during migration
   - ❌ If no → Update frontend type

2. **Is it a field name difference?** (e.g., `description` vs `text`)
   - ❌ Update frontend type to match backend
   - ❌ Do NOT create mapping function

3. **Is backend contract stable?**
   - ✅ If yes → Update frontend type
   - ⚠️ If no (migration in progress) → Temporary normalization may be acceptable, but plan to remove it

## Files Affected

- `src/types/growth-system.ts` - `SuccessCriterion` interface (needs `text` → `description`)
- `src/services/growth-system/goals.service.ts` - `normalizeGoal()` function (remove mapping)
- `src/components/molecules/SuccessCriteriaList.tsx` - Component references
- `src/components/organisms/GoalCreateForm.tsx` - Component references
- `src/components/organisms/GoalEditForm.tsx` - Component references
- `src/components/molecules/SortableCriteriaList.tsx` - Component references

## Action Items

- [ ] Update `SuccessCriterion` interface to use `description` instead of `text`
- [ ] Update all component references from `criterion.text` to `criterion.description`
- [ ] Remove `description` → `text` mapping from `normalizeGoal()` function
- [ ] Verify all service methods return data matching the updated type
- [ ] Update any form inputs that create/update success criteria
