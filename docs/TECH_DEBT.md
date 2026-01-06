# Technical Debt & Refactor Opportunities (src/)

This document captures the highest-leverage cleanup opportunities before further feature work. It is organized by **Impact** and **Effort**, with concrete file pointers.

## High impact / low-medium effort (do these early)

### Centralize route paths (done)
- **Problem**: `/admin/...` paths were hard-coded across router, nav, widgets, and the command palette.
- **Fix**: Added `src/routes.ts` and updated call sites to use `ROUTES` / `ADMIN_CHILD_ROUTES`.
- **Benefit**: Route renames become a single edit, avoids drift between Router vs Nav vs deep links.

### Centralize Growth System option lists (done)
- **Problem**: `AREAS`, `PRIORITIES`, `STATUSES`, and `SUBCATEGORIES` were duplicated across many forms/filters/boards.
- **Fix**: Added `src/constants/growth-system.ts` and updated call sites to import from it.
- **Benefit**: Consistent UX + fewer bugs when you add a new Area/Status.

### Pick one “data access” pattern for Growth System pages
- **Problem**: The app mixes multiple patterns:
  - Page-level `useEffect` + direct service calls (ex: `src/pages/admin/ProjectsPage.tsx`)
  - React Query hooks in `src/hooks/useGrowthSystem.ts` (used by Dashboard/Widgets/CommandPalette)
  - A Zustand store in `src/stores/growth-system.store.ts` (appears unused)
- **Risk**: Cache incoherence and duplicated logic (filters, loading states, errors).
- **Recommendation**:
  - **Standardize on React Query hooks** for fetching/mutations and delete the unused Zustand store, *or*
  - Standardize on a store-based approach and remove React Query hooks.
- **Suggested starting change**: migrate one CRUD page (Tasks or Projects) to `useTasks/useProjects` and remove bespoke `useEffect` fetching.

### Fix incomplete relationship/linking flows (visible TODOs)
- **Projects ↔ Goals linking is stubbed**:
  - `src/pages/admin/ProjectsPage.tsx`: `handleGoalLink/handleGoalUnlink` are TODO.
- **Tasks ↔ Projects/Goals relationship loading looks incomplete**:
  - `src/pages/admin/TasksPageAdvanced.tsx` / `TasksPageAdvancedV2.tsx` keep `taskProjects`/`taskGoals` maps but do not populate them.
- **Recommendation**: implement relationship APIs in `projectsService` and add relationship load helpers shared across pages.

## Medium impact / medium effort

### Collapse “V2 / Advanced” duplication into a single feature-flagged implementation
- **Problem**: Multiple near-duplicates exist, especially around Tasks:
  - `src/pages/admin/TasksPageAdvanced.tsx`
  - `src/pages/admin/TasksPageAdvancedV2.tsx`
  - `src/components/organisms/TaskKanbanBoard.tsx` vs `TaskKanbanBoardV2.tsx`
  - `src/components/organisms/TaskCalendarView.tsx` vs `TaskCalendarViewV2.tsx`
- **Recommendation**:
  - Extract shared state/load logic into a dedicated hook (ex: `useTasksController()`).
  - Treat “V2” as a UI strategy (list/kanban/calendar renderers) rather than separate pages.
  - Remove the older variant after parity.

### Unify API/LLM call abstractions and error handling
- **Problem**: Three different networking styles exist:
  - Axios wrapper: `src/lib/api-client.ts`
  - Fetch inside LLM adapters: `src/lib/llm/*`
  - Storage abstraction that may use API or local storage: `src/lib/storage/*`
- **Risks**: inconsistent auth headers, inconsistent error shapes, inconsistent retries/timeouts.
- **Recommendation**:
  - Pick a single HTTP client (Axios or fetch) and standardize typed error results.
  - Ensure auth tokens are sourced from one place and applied consistently (interceptors/middleware).

### Reduce boilerplate in `useGrowthSystem.ts`
- **Problem**: The CRUD hooks are copy/paste across entities.
- **Recommendation**:
  - Introduce a small helper like `createCrudHooks({ key, list, create, update, remove })`.
  - Standardize mutation result handling and query invalidation.

## Lower impact / opportunistic cleanup

### Consolidate “loading spinner” UI patterns
- **Problem**: Many pages inline a spinner block with similar markup.
- **Recommendation**: a `LoadingState`/`CenteredSpinner` component in `src/components/molecules/`.

### Normalize naming
- **Example**: `TasksPageAdvancedV2.tsx` exports `function TasksPageAdvanced()` (name mismatch).
- **Recommendation**: keep exported component names aligned with filenames to improve stack traces and searchability.

## Notes / current status
- **Implemented in this pass**:
  - `src/routes.ts`
  - `src/constants/growth-system.ts`
  - Updated many call sites for routes + growth-system options
- **Lint status**: clean for the modified files.


