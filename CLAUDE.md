# CLAUDE.md — Repo Quick Start (LLM)

## What this repo is

- **Frontend**: React + TypeScript + Vite + Tailwind.
- **App shape**: Public site + `/admin/*` “Personal OS” (auth-gated) with AI-powered, LLM-driven features.
- **Deploy**: GitHub Pages via GitHub Actions; **build-time** Vite env vars come from **GitHub Secrets**.

## Open these first (entrypoints)

If you are new to the codebase or debugging app behavior, start here for the fastest context.

- **App bootstrap + providers**: `src/main.tsx` (provider tree, `configureAmplify()`, theme init).
- **Routes/layouts**: `src/App.tsx` + `src/routes.ts` (routing ownership, layouts, `ProtectedRoute`). Admin **Memory Audit** route: `ROUTES.admin.memoryAudit` → `/admin/memory-audit` (`MemoryAuditPage`).
- **HTTP + auth header wiring**: `src/lib/api-client.ts` (baseURL, auth header, 401 refresh/redirect, response wrapping).
- **Auth + token lifecycle**: `src/lib/auth/auth.service.ts` (Cognito sign-in/out, token storage, refresh, `apiClient` sync).
- **Cognito env usage**: `src/lib/aws-config.ts`, `src/lib/auth/cognito-config.ts` (env vars + “is configured” logic).
- **Build quirks**: `vite.config.ts` (Node polyfills, `async_hooks` polyfill, CNAME copy).

Quick mapping:

- **Assistant LTM audit UI** (not Knowledge Vault) → `src/pages/admin/MemoryAuditPage.tsx`, `src/services/ltm.service.ts` (HTTP `/ltm` on the API host). Contract: monorepo `docs/backend/API_ENDPOINTS.md` (LTM audit). Do not call `/assistant/memory/*` for this page.
- **Proactive assistant UI** → `src/pages/admin/ProactiveAutomationsPage.tsx`, `ROUTES.admin.assistantProactive` in `src/routes.ts` (`/admin/assistant/proactive`); API via `apiClient` proactive + `preferences/time-zone` methods. Ops/architecture: monorepo `docs/backend/PROACTIVE_ASSISTANT.md`.
- Auth/login/redirect issues → `src/lib/auth/auth.service.ts`, then `src/lib/api-client.ts`
- Routes/layout/rendering issues → `src/App.tsx`, then `src/routes.ts`
- Backend calls/401/headers → `src/lib/api-client.ts`
- Cognito env misconfig → `src/lib/aws-config.ts`, `src/lib/auth/cognito-config.ts`
- Build/deploy quirks → `vite.config.ts`

## API Contracts & DTOs

- Read and follow: `docs/reference/normalization-and-dtos.md`

## API endpoint checklist (frontend)

1. Define/extend types in `src/types/api-contracts.ts` and/or `src/types/api/*.dto.ts`.
2. Implement service calls in `src/services/**` using `apiClient.get/post/patch/delete`.
3. (Optional, dev-only) Pass Zod schemas into `apiClient.get/post` for response validation.
4. Ensure React Query caches store contract-aligned domain models (not raw DTOs with mismatched shapes).

## Commands (source of truth: `package.json`)

When this repo is opened inside the monorepo workspace (sibling `personal-os-backend/`, root `package.json`), prefer workspace-root **`npm run verify:frontend`** for the standard lint + type-check chain; use **`npm run verify:frontend:all`** for the stricter gate.

- **Dev**: `npm run dev`
- **Build/preview**: `npm run build`, `npm run preview`
- **Quality**: `npm run lint`, `npm run type-check`, `npm run format:check`
- **Tests**: `npm run test` (Vitest), `npm run test:e2e` (Playwright)
- **Meta**: `npm run validate` (runs repo validation scripts)

## Local logging

- Frontend dev logs are written to `../logs/frontend/app.jsonl`
- Backend dev logs are in `../logs/backend/app.jsonl` and `../logs/backend/error.jsonl`
- Use the centralized logger in `src/lib/logger.ts`; do not add raw `console.*` calls in app code
- Search logs with `rg`; see `../docs/agent-learnings/log-analysis-guide.md`

## Environment variables (canonical)

### Runtime usage in code

- **API base URL**: `VITE_API_BASE_URL` (fallback: `'/api'`) in `src/lib/api-client.ts`.
- **Assistant WebSocket URL**: `VITE_WS_URL` (e.g. `wss://...`) in `src/hooks/useAssistantStreaming.ts`.
- **AWS Cognito**:
  - `VITE_AWS_REGION` (fallback: `'us-east-1'`)
  - `VITE_AWS_USER_POOL_ID`
  - `VITE_AWS_USER_POOL_WEB_CLIENT_ID`
  - `VITE_AWS_IDENTITY_POOL_ID` (optional)

### Local dev vs deploy

- **Local dev**: use `.env` (see `.env.example`).
- **Deploy (GitHub Pages)**: build step injects env vars from **GitHub Secrets** in `.github/workflows/deploy.yml`.

Note: Some older docs mention `VITE_API_URL` / `VITE_COGNITO_*`. For this frontend build, treat **`VITE_API_BASE_URL` + `VITE_AWS_*` as canonical**.

## AI / LLM subsystem (where to look)

- **Adapter (API-only)**: `src/lib/llm/llm-config.ts`, `src/lib/llm/api-llm-adapter.ts`
- **Main façade used by UI/services**: `src/services/llm.service.ts` (delegates to `getLLMAdapter()`).
- **Per-feature provider/model selection** (loaded from backend w/ defaults):
  - `src/lib/llm/config/feature-config-store.ts`
  - `src/lib/llm/config/feature-types.ts`
- **Provider + model catalog (frontend choices)**:
  - `src/lib/llm/config/provider-types.ts`
  - `src/lib/llm/config/model-catalog.ts`
- **Backend contract**: `docs/backend/API_ENDPOINTS.md` (AI endpoints + response shape)

Debug heuristic: “AI not working” is usually **(1) auth/token issue**, **(2) backend `/ai/*` endpoint shape or availability**, **(3) feature config fetch/cache**, or **(4) backend LLM configuration**.
Note: `APILLMAdapter` expects `{ success, data: { result, confidence, provider, model, cached } }` from AI endpoints.

## Deploy-time env vars via Terraform (GitHub Secrets)

Goal: ensure the GitHub Pages workflow has the required secrets **before** `npm run build` runs in Actions.

### What Terraform manages

Terraform in `infrastructure/` creates/updates GitHub Actions secrets:

- `VITE_API_BASE_URL`
- `VITE_WS_URL`
- `VITE_AWS_REGION`
- `VITE_AWS_USER_POOL_ID`
- `VITE_AWS_USER_POOL_WEB_CLIENT_ID`
- `VITE_AWS_IDENTITY_POOL_ID`

Implementation: `infrastructure/github-secrets.tf` (provider `integrations/github`).

### One-time setup (local machine)

1. Create `infrastructure/terraform.tfvars` from `infrastructure/terraform.tfvars.example` and fill values.

- **Never commit** `terraform.tfvars` (it is gitignored).

2. Provide a GitHub token (classic PAT with `repo` scope):

- Option A: set `github_token` in `terraform.tfvars`
- Option B: set env var `GITHUB_TOKEN` (provider fallback)

### Apply

From `infrastructure/`:

- `terraform init`
- `terraform plan`
- `terraform apply`

### Verify (safe)

- `terraform plan` shows masked outputs; see `infrastructure/outputs.tf`.
- Optional local checks: `infrastructure/verify-values.ps1` or `infrastructure/verify-values.sh` (masked display).

### Gotchas

- `infrastructure/github-secrets.tf` currently hardcodes:
  - GitHub **owner**: `SunnyChopper`
  - GitHub **repository**: `sunnychopper.github.io`
    Update these if you fork/rename.
- GitHub token must be a **classic** PAT (fine-grained tokens often fail here).

## Type Alignment: Frontend Should Match Backend

**Critical Rule**: The backend API must return canonical camelCase contracts. If it does not, treat that as a backend bug and fix the backend contract. Do **not** add frontend mapping/normalization layers to compensate.

**Decision Tree**:

1. **Backend response shape differs from contract?** (including snake_case keys) → Fix backend response to contract shape.
2. **Frontend type differs from stable backend contract?** → Update frontend type to match contract.
3. **Need temporary frontend transform?** → No. Avoid this; fix the backend/source contract instead.

**Normalization/mapping policy**: Do not introduce frontend response normalization for backend casing/field mismatches.

**See**: `docs/post-mortems/2026-01-28-success-criteria-field-mismatch.md` for detailed analysis and decision framework.

**Backend snake_case fields**: See `docs/reference/backend-snake-case-fields.md` for backend-side fixes required to enforce camelCase contracts.

## Frontend-specific learnings

- Cross-repo anti-patterns (filter by `[frontend]`): `../docs/agent-learnings/anti-patterns.md`
- After modifying API types, verify alignment with `../docs/backend/API_ENDPOINTS.md`.
- After adding or modifying components, verify applicable `.mdc` rules in `.cursor/rules/` were followed.
- Before declaring done, complete and report the self-assessment protocol from root `../CLAUDE.md`.
- Treat final completion as blocked until the self-assessment is explicitly included in the final response.

## Post-Mortems and Learnings

Detailed post-mortems, decision frameworks, and lessons learned are stored in `docs/post-mortems/`. Each post-mortem is a separate markdown file with date-prefixed naming (e.g., `2026-01-28-issue-name.md`).

**When writing post-mortems**:

- Store in `docs/post-mortems/` folder
- Use descriptive, date-prefixed filenames
- Include full analysis, decision frameworks, affected files, and action items
- Keep `CLAUDE.md` lean with only actionable takeaways
- Add a compact entry to `../docs/agent-learnings/anti-patterns.md` that links back to the full post-mortem
