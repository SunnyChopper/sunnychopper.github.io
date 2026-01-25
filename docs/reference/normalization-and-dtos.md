## Normalization and DTOs

### Rule of thumb

- Always normalize backend responses at the **service boundary** before they reach React Query caches or UI components.
- UI, hooks, and components must only consume **domain models** (camelCase keys, spaced enum values).
- Backend payloads (DTOs) live under `src/types/api/` and are never passed directly to components.

### Why this exists

- Backend payloads use camelCase keys and human-readable enum values with spaces (e.g. `"Day Job"`, `"On Hold"`, `"Not Started"`).
- Frontend domain types also use camelCase keys and the same spaced enum values (aligned with backend).
- Normalization adapts **key naming** (during migration from snake_case → camelCase) but enum **values** pass through unchanged.

### Structure

- **DTOs (API shapes)**: `src/types/api/`
  - Example: `src/types/api/projects.dto.ts`
- **Domain models (frontend shapes)**: `src/types/`
  - Example: `src/types/growth-system.ts`
- **Adapters/normalizers**: `src/services/normalization/`
  - Example: `normalizeProject(dto)` or `normalizeDashboardSummary(dto)`

### Checklist for new endpoints

1. Define a DTO in `src/types/api/` matching the backend response.
2. Add/extend a normalizer in `src/services/normalization/` (primarily for legacy snake_case → camelCase key mapping).
3. Update the service to call `apiClient` with the DTO type and return the domain model.
4. Add a lightweight test that covers key normalization (if needed).
5. Ensure React Query caches only store normalized domain models.

### Current state (after alignment)

- **Enum values**: Frontend now uses the same spaced enum values as the backend (e.g. `"Day Job"`, `"On Hold"`, `"Not Started"`).
- **Keys**: During migration from snake_case backend, normalizers map keys (e.g. `start_date` → `startDate`). Once backend is fully camelCase, key normalization can be removed.

### Common pitfalls

- Writing raw DTOs into caches (`queryClient.setQueryData`) without normalization.
- Mixing DTO types and domain types in components.
- Hardcoding old joined enum values (`DayJob`, `OnHold`) instead of using the new spaced values.
