# TanStack Query Mutation Cache Update Guide

## Problem Statement

When implementing mutations (create, update, delete) in React applications using TanStack Query, it's critical to ensure that:

1. **Mutations update the local cache** so the UI reflects changes immediately without requiring a refetch
2. **Response data stays aligned** with the canonical backend contract shape
3. **All related query keys are updated** (list queries, detail queries, dashboard queries)

Important: this repo's policy is to fix backend/frontend contract drift at the source. Do not add frontend normalization layers just to paper over mismatched API field names.

## Common Issues

### Issue 1: Mutation Response Drifts From The Contract

**Symptom**: Data appears in the UI but fields are missing or incorrectly named (e.g., `description` instead of `text`).

**Root Cause**: The backend response shape and frontend type drifted apart. Hiding this with frontend normalization keeps multiple shapes alive in the cache and masks the real contract bug.

**Example**:

```typescript
// ❌ BAD: Hide contract drift in the frontend
async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
  const response = await apiClient.post<Goal>('/goals', requestBody);
  return response; // Backend returns { description: "..." } but frontend expects { text: "..." }
}

// ✅ GOOD: Fix the backend contract, then consume it directly
async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
  return apiClient.post<Goal>('/goals', requestBody);
}
```

### Issue 2: Page Uses Local State Instead of React Query Hook

**Symptom**: Mutations succeed on the backend, but the UI doesn't update. The TanStack Query cache remains empty or stale.

**Root Cause**: The page component manages data with local `useState` instead of using the React Query hook that provides mutations with cache update logic.

**Example**:

```typescript
// ❌ BAD: Using local state
export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const handleCreateGoal = async (input: CreateGoalInput) => {
    const response = await goalsService.create(input);
    if (response.success && response.data) {
      setGoals([response.data, ...goals]); // Only updates local state
      // TanStack Query cache is NOT updated!
    }
  };
}

// ✅ GOOD: Using React Query hook
export default function GoalsPage() {
  const { goals, isLoading, createGoal } = useGoals(); // Hook provides mutations

  const handleCreateGoal = async (input: CreateGoalInput) => {
    const response = await createGoal(input); // Mutation automatically updates cache
    if (response.success && response.data) {
      // Cache is updated via upsertGoalCache in the mutation's onSuccess
    }
  };
}
```

### Issue 3: Mutation Doesn't Update Cache

**Symptom**: Mutation succeeds, but the UI doesn't reflect the change until a manual refresh or navigation.

**Root Cause**: The mutation's `onSuccess` callback doesn't call the cache update function, or the cache update function doesn't update all relevant query keys.

**Example**:

```typescript
// ❌ BAD: Mutation doesn't update cache
const createMutation = useMutation({
  mutationFn: (input: CreateGoalInput) => goalsService.create(input),
  onSuccess: (response) => {
    // Missing: No cache update!
  },
});

// ✅ GOOD: Mutation updates cache
const createMutation = useMutation({
  mutationFn: (input: CreateGoalInput) => goalsService.create(input),
  onSuccess: (response) => {
    if (response.success && response.data) {
      upsertGoalCache(queryClient, response.data); // Updates all relevant query keys
    }
  },
});
```

## Solution Pattern

### Step 1: Ensure Service Methods Consume The Canonical Contract

All service methods that return data should consume the canonical backend contract directly. If the shape is wrong, fix the backend contract and shared types instead of adding a mapper:

```typescript
async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
  return apiClient.post<Goal>('/goals', requestBody);
}
```

If the API returns the wrong fields:

- fix the backend response shape
- update `docs/backend/API_ENDPOINTS.md` if the canonical contract changed
- update frontend DTOs and cache code in the same change

### Step 2: Use React Query Hooks in Components

Components should use React Query hooks that provide mutations with built-in cache updates:

```typescript
// In useGrowthSystem.ts
export const useGoals = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.growthSystem.goals.lists(),
    queryFn: async () => {
      const result = await goalsService.getAll();
      return result;
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsService.create(input),
    onSuccess: (response) => {
      if (response.success && response.data) {
        upsertGoalCache(queryClient, response.data); // ✅ Update cache
      }
    },
  });

  return {
    goals: data?.data || [],
    isLoading,
    createGoal: createMutation.mutateAsync, // ✅ Expose mutation
  };
};
```

### Step 3: Use Hooks in Page Components

Page components should use the hooks instead of managing local state:

```typescript
// In GoalsPage.tsx
export default function GoalsPage() {
  // ✅ Use hook instead of local state
  const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useGoals();

  const handleCreateGoal = async (input: CreateGoalInput) => {
    // ✅ Use mutation from hook
    const response = await createGoal(input);
    if (response.success && response.data) {
      // Cache is automatically updated by the mutation
      setIsCreateDialogOpen(false);
    }
  };
}
```

### Step 4: Update Cache for Non-Mutation Operations

For operations that don't use mutation hooks (e.g., direct service calls), manually update the cache:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { upsertGoalCache } from '@/lib/react-query/growth-system-cache';

export default function GoalsPage() {
  const queryClient = useQueryClient();

  const handleToggleCriterion = async (criterionId: string, isCompleted: boolean) => {
    const response = await goalsService.updateCriterion(goalId, criterionId, {
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
    });

    if (response.success && response.data) {
      // ✅ Manually update cache for non-mutation operations
      upsertGoalCache(queryClient, response.data);
      setSelectedGoal(response.data);
    }
  };
}
```

## Cache Update Functions

The cache update functions in `src/lib/react-query/growth-system-cache.ts` handle updating all relevant query keys:

- **List queries**: `["growth-system", "goals", "list"]`
- **Detail queries**: `["growth-system", "goals", "detail", goalId]`
- **Dashboard queries**: `["growth-system", "data"]`

Example:

```typescript
export const upsertGoalCache = (queryClient: QueryClient, goal: Goal): void => {
  // Update all list queries
  updateListQueries<Goal>(queryClient, queryKeys.growthSystem.goals.lists(), (items) =>
    upsertById(items, goal)
  );

  // Update dashboard queries
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    goals: upsertById(data.goals, goal),
  }));

  // Update detail cache
  updateDetailCache(queryClient, queryKeys.growthSystem.goals.detail, goal);
};
```

## Checklist for Implementing Mutations

When implementing a new mutation or fixing an existing one, verify:

- [ ] **Service method consumes the canonical response directly** (no frontend contract patch layer)
- [ ] **Component uses React Query hook** (not local state)
- [ ] **Mutation's `onSuccess` updates the cache** (calls `upsertXCache` or `removeXCache`)
- [ ] **All relevant query keys are updated** (list, detail, dashboard)
- [ ] **Non-mutation operations manually update cache** (if not using mutation hooks)
- [ ] **Response data structure matches frontend types** because the contract is aligned end-to-end

## Testing

After implementing a mutation:

1. **Create an entity** → Verify it appears in the list immediately
2. **Update an entity** → Verify changes appear without refresh
3. **Delete an entity** → Verify it disappears from the list immediately
4. **Check TanStack Query DevTools** → Verify cache contains the updated data
5. **Navigate away and back** → Verify data persists (cache is working)

## Debugging

If mutations aren't updating the UI:

1. **Check TanStack Query DevTools**:
   - Open React Query DevTools
   - Verify the query key exists and contains data
   - Check if the mutation's `onSuccess` is being called

2. **Verify contract alignment**:
   - Check the network response in DevTools
   - Compare backend field names with frontend type definitions
   - If they differ, fix the backend contract or shared types instead of adding a mapper

3. **Verify cache update**:
   - Check if `upsertXCache` or `removeXCache` is being called
   - Verify the function updates all relevant query keys
   - Check if the component is using the hook (not local state)

4. **Check component state**:
   - Verify the component uses `useX()` hook instead of `useState`
   - Ensure mutations come from the hook, not direct service calls
   - Check if local state is overriding React Query data

## Related Files

- `src/lib/react-query/growth-system-cache.ts` - Cache update functions
- `src/hooks/useGrowthSystem.ts` - React Query hooks with mutations
- `src/services/growth-system/*.service.ts` - Service methods that should consume canonical contract shapes

## Example: Complete Implementation

```typescript
// 1. Service that consumes the canonical contract directly
async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
  return apiClient.post<Goal>('/goals', requestBody);
}

// 2. Hook with mutation
export const useGoals = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsService.create(input),
    onSuccess: (response) => {
      if (response.success && response.data) {
        upsertGoalCache(queryClient, response.data);
      }
    },
  });
  return { createGoal: createMutation.mutateAsync };
};

// 3. Component using hook
export default function GoalsPage() {
  const { goals, createGoal } = useGoals();
  const handleCreate = async (input: CreateGoalInput) => {
    await createGoal(input); // Cache automatically updated
  };
}
```
