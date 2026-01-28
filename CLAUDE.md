# CLAUDE.md — Repo Quick Start (LLM)

## What this repo is

- **Frontend**: React + TypeScript + Vite + Tailwind.
- **App shape**: Public site + `/admin/*` “Growth System” (auth-gated) with AI-powered features.
- **Deploy**: GitHub Pages via GitHub Actions; **build-time** Vite env vars come from **GitHub Secrets**.

## Open these first (entrypoints)

- **App bootstrap + providers**: `src/main.tsx` (React Query, `AuthProvider`, wallet/rewards; calls `configureAmplify()`).
- **Routes/layouts**: `src/App.tsx` + `src/routes.ts` (`MainLayout` public, `AdminLayout` behind `ProtectedRoute`).
- **HTTP + auth header wiring**: `src/lib/api-client.ts` (baseURL + token interceptors).
- **Auth + token lifecycle**: `src/lib/auth/auth.service.ts` (Cognito sign-in, token storage, refresh flow).
- **Cognito env usage**: `src/lib/aws-config.ts`, `src/lib/auth/cognito-config.ts`.
- **Build quirks**: `vite.config.ts` (Node polyfills + `async_hooks` polyfill for LangGraph; copies `public/CNAME` → `dist/CNAME`).

## Normalization & DTOs

- Read and follow: `docs/reference/normalization-and-dtos.md`

## API endpoint checklist (frontend)

1. Define/extend types in `src/types/api-contracts.ts` and/or `src/types/api/*.dto.ts`.
2. Implement service calls in `src/services/**` using `apiClient.get/post/patch/delete`.
3. (Optional, dev-only) Pass Zod schemas into `apiClient.get/post` for response validation.
4. Ensure React Query caches store normalized domain models (not raw DTOs).

## Commands (source of truth: `package.json`)

- **Dev**: `npm run dev`
- **Build/preview**: `npm run build`, `npm run preview`
- **Quality**: `npm run lint`, `npm run type-check`, `npm run format:check`
- **Tests**: `npm run test` (Vitest), `npm run test:e2e` (Playwright)
- **Meta**: `npm run validate` (runs repo validation scripts)

## Environment variables (canonical)

### Runtime usage in code

- **API base URL**: `VITE_API_BASE_URL` (fallback: `'/api'`) in `src/lib/api-client.ts`.
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

**Critical Rule**: When frontend types don't match backend API responses, **update the frontend types to match the backend**—do NOT create mapping/normalization functions.

**Decision Tree**:

1. **Key naming convention?** (snake_case → camelCase) → Normalization OK during migration only
2. **Field name difference?** (e.g., `description` vs `text`) → Update frontend type
3. **Backend contract stable?** → Update frontend type

**Normalization should ONLY be used for**: Key naming conventions during migration, not for field name differences.

**See**: `docs/post-mortems/2026-01-28-success-criteria-field-mismatch.md` for detailed analysis and decision framework.

**Backend snake_case fields**: See `docs/reference/backend-snake-case-fields.md` for complete list of fields that need to be updated to camelCase in the backend API.

## Post-Mortems and Learnings

Detailed post-mortems, decision frameworks, and lessons learned are stored in `docs/post-mortems/`. Each post-mortem is a separate markdown file with date-prefixed naming (e.g., `2026-01-28-issue-name.md`).

**When writing post-mortems**:

- Store in `docs/post-mortems/` folder
- Use descriptive, date-prefixed filenames
- Include full analysis, decision frameworks, affected files, and action items
- Keep `CLAUDE.md` lean with only actionable takeaways
