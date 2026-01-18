# CLAUDE.md — Repo Quick Start (LLM)

## What this repo is

- **Frontend**: React + TypeScript + Vite + Tailwind.
- **App shape**: Public site + `/admin/*` “Growth System” (auth-gated) with AI-powered features.
- **Deploy**: GitHub Pages via GitHub Actions; **build-time** Vite env vars come from **GitHub Secrets**.

## Open these first (entrypoints)

- **App bootstrap + providers**: `src/main.tsx` (React Query, `AuthProvider`, wallet/rewards; calls `configureAmplify()`).
- **Routes/layouts**: `src/App.tsx` + `src/routes.ts` (`MainLayout` public, `AdminLayout` behind `ProtectedRoute`).
- **HTTP + auth header wiring**: `src/lib/api-client.ts` (baseURL + token interceptors).
- **Cognito env usage**: `src/lib/aws-config.ts`, `src/lib/auth/cognito-config.ts`.
- **Build quirks**: `vite.config.ts` (Node polyfills + `async_hooks` polyfill for LangGraph; copies `public/CNAME` → `dist/CNAME`).

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

- **Adapter mode** (`direct` vs `api`, stored in localStorage): `src/lib/llm/llm-config.ts`.
- **Main façade used by UI/services**: `src/services/llm.service.ts` (delegates to `getLLMAdapter()`).
- **Per-feature provider/model selection** (loaded from backend w/ defaults):
  - `src/lib/llm/config/feature-config-store.ts`
- **Provider API keys** (loaded/saved via backend endpoints):
  - `src/lib/llm/config/api-key-store.ts`
- **Provider construction**: `src/lib/llm/providers/provider-factory.ts`

Debug heuristic: “AI not working” is usually **(1) adapter type**, **(2) missing API key**, **(3) feature provider/model config**, or **(4) backend endpoints failing**.

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
