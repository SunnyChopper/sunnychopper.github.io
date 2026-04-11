# API Endpoints Specification (Derived Reference)

This file is a wrapper only.

- Canonical source of truth: `../../../docs/backend/API_ENDPOINTS.md`
- Direct link: [Root API Contract](../../../docs/backend/API_ENDPOINTS.md)

## Usage in this repo

- Use the root contract for endpoint paths, request/response shapes, auth, casing, and pagination conventions.
- If frontend code and contract drift, fix backend contract behavior at the source and then update frontend DTOs/services.
- Do not add frontend normalization layers for backend casing/field-name mismatches.

## Local pointers

- API client: `src/lib/api-client.ts`
- Contract types: `src/types/api/` and `src/types/api-contracts.ts`
- Services: `src/services/`
