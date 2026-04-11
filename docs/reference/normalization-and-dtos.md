## API Contract and DTOs

### Rule of thumb

- Backend responses must match the canonical API contract (camelCase keys, agreed field names, agreed enum values).
- Frontend should consume that contract directly via typed DTO/domain interfaces.
- Do not add frontend normalization/mapping for backend casing or field-name drift.

### Why this exists

- Frontend normalization hides backend contract regressions and makes bugs harder to detect.
- React Query cache integrity depends on consistent, canonical shapes.
- Contract drift should fail fast and be fixed at the source (backend), not patched in UI code.

### Structure

- **DTOs/API types**: `src/types/api/`
- **Domain/frontend types**: `src/types/`
- **Services**: call `apiClient` and return contract-aligned data without shape transforms.

### Checklist for new endpoints

1. Define/update DTOs and frontend types to match the canonical backend contract.
2. Implement service calls using those types without response mapping.
3. If backend response does not match contract, open/fix backend issue before adding frontend feature work.
4. Ensure React Query caches store contract-aligned models only.
5. Add/update tests around expected contract fields when practical.

### Common pitfalls

- Adding frontend response adapters to convert snake_case to camelCase.
- Mapping field names in services to work around backend response bugs.
- Writing ambiguous type unions that accept both legacy and canonical fields long-term.
