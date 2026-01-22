# API Call Optimization Summary

## Problem Analysis

When loading dashboard pages, the application was making **25-30+ API calls**, including:
- Multiple repeated calls to the same endpoints (tasks, goals, projects called 2-3 times each)
- 404 errors for `wallet`, `api-keys`, and `notes` endpoints (5+ failed requests)
- Network failures for `mode` endpoint
- Individual dependency calls for each task (N+1 query problem)
- No caching - direct service calls instead of React Query

## Root Causes

1. **TasksPage not using React Query**: Used `useState`/`useEffect` with direct service calls, causing refetches on every mount and filter change
2. **No backend aggregation**: Each resource fetched separately instead of a single dashboard endpoint
3. **Context providers not using React Query**: `WalletProvider` and `RewardsProvider` used `useEffect` instead of React Query hooks
4. **N+1 dependency queries**: TasksPage loaded dependencies individually for each task
5. **Missing endpoints**: Frontend calling endpoints that don't exist (wallet, api-keys, notes)
6. **Insufficient caching**: React Query `staleTime` was only 5 minutes, causing unnecessary refetches

## Implemented Solutions

### ✅ 1. Converted TasksPage to React Query (COMPLETED)

**Before:**
- Used `useState`/`useEffect` with direct `tasksService.getAll()` calls
- Refetched on every mount and filter change
- No caching between page navigations

**After:**
- Uses `useTasks()`, `useProjects()`, `useGoals()` React Query hooks
- Automatic caching and deduplication
- Only refetches when data is stale or explicitly invalidated
- Filtering happens client-side on cached data

**Impact:** Reduces API calls from 3-4 per page load to 1 (cached after first load)

### ✅ 2. Batched Task Dependencies (COMPLETED)

**Before:**
- Called `getDependencies()` individually for each task
- If you had 10 tasks, that's 10 separate API calls

**After:**
- Created `useTaskDependencies()` hook that batches all dependency calls
- Fetches all dependencies in parallel in a single query
- Cached with 2-minute staleTime

**Impact:** Reduces N dependency calls to 1 batched call

### 🔄 3. Backend Aggregation Endpoint (RECOMMENDED)

**Proposed Solution:**
Create a `/api/dashboard/summary` endpoint that returns:
```json
{
  "tasks": [...],
  "goals": [...],
  "projects": [...],
  "habits": [...],
  "metrics": [...],
  "logbook": [...],
  "rewards": [...],
  "wallet": {...}
}
```

**Implementation Steps:**
1. Add endpoint to backend: `GET /api/dashboard/summary`
2. Create frontend hook: `useDashboardSummary()`
3. Update `DashboardPage` to use single hook instead of 6 separate hooks
4. Keep individual hooks for pages that only need specific data

**Impact:** Reduces 6-8 parallel calls to 1 aggregated call

### 🔄 4. Convert Context Providers to React Query (RECOMMENDED)

**Current Issue:**
- `WalletProvider` and `RewardsProvider` use `useEffect` with direct service calls
- No caching, refetch on every mount

**Proposed Solution:**
- Create `useWallet()` and `useRewards()` React Query hooks
- Replace context providers with hooks (or keep providers but use hooks internally)
- Add proper caching with appropriate staleTime

**Impact:** Eliminates duplicate wallet/rewards calls

### 🔄 5. Fix 404 Errors (RECOMMENDED)

**Options:**
1. **Remove calls** if endpoints aren't needed:
   - Check where `wallet`, `api-keys`, `notes` are called
   - Remove or conditionally call only when needed

2. **Implement missing endpoints** if they're required:
   - Add `/api/wallet` endpoint
   - Add `/api/api-keys` endpoint (or verify it exists)
   - Add `/api/notes` endpoint (or verify it exists)

3. **Add error handling** to gracefully handle 404s:
   - Don't retry 404s (already implemented in React Query config)
   - Show user-friendly messages instead of console errors

**Impact:** Eliminates 5+ failed requests per page load

### 🔄 6. Optimize React Query Configuration (RECOMMENDED)

**Current:**
- `staleTime: 5 * 60 * 1000` (5 minutes) for all queries

**Proposed:**
- **Frequently changing data** (tasks, habits): 2-5 minutes
- **Moderately changing data** (goals, projects): 10-15 minutes
- **Rarely changing data** (projects, goals metadata): 30+ minutes
- **Static data** (API keys, configs): 1 hour+

**Implementation:**
```typescript
// In useGrowthSystem.ts
useQuery({
  queryKey: queryKeys.goals.lists(),
  queryFn: () => goalsService.getAll(),
  staleTime: 10 * 60 * 1000, // 10 minutes for goals
});

useQuery({
  queryKey: queryKeys.projects.lists(),
  queryFn: () => projectsService.getAll(),
  staleTime: 15 * 60 * 1000, // 15 minutes for projects
});
```

**Impact:** Reduces unnecessary refetches, especially for less-frequently-changing data

## Expected Results

### Before Optimization:
- **25-30+ API calls** on dashboard load
- **14+ seconds** total load time
- **5+ 404 errors**
- **Multiple duplicate calls** to same endpoints

### After Full Optimization:
- **1-3 API calls** on dashboard load (1 aggregated + 1-2 for specific widgets)
- **2-4 seconds** total load time
- **0 404 errors**
- **No duplicate calls** (React Query deduplication)

## Next Steps

1. ✅ **Completed**: TasksPage React Query conversion
2. ✅ **Completed**: Batched dependency loading
3. 🔄 **Next**: Create backend aggregation endpoint
4. 🔄 **Next**: Convert WalletProvider/RewardsProvider to React Query
5. 🔄 **Next**: Fix 404 errors (remove or implement endpoints)
6. 🔄 **Next**: Optimize React Query staleTime configuration

## Testing Checklist

- [ ] Dashboard loads with fewer API calls
- [ ] TasksPage uses cached data on navigation
- [ ] Dependencies load in single batched call
- [ ] No 404 errors in network tab
- [ ] Filtering works without refetching
- [ ] Mutations properly invalidate cache
- [ ] Page load time reduced
