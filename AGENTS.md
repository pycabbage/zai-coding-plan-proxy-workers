# zai-coding-plan-proxy-workers

## What this is

A single Cloudflare Worker (`src/index.tsx`, Hono app) that proxies Cloudflare AI Gateway custom-provider
requests to the Z.ai Coding Plan API. It rewrites `/api/v1/chat/completions` to the upstream
`/api/coding/paas/v4/chat/completions` path and strips the `provider/` prefix from the JSON `model` field;
everything else under `/api/*` is passed through unchanged. `/` renders an info page via
`src/renderer.tsx` (hono/jsx-renderer + vite-ssr-components) styled with Tailwind v4 (`src/style.css`).
See `README.md` for the full rationale. There is no other app/package in this repo — it's a single Worker.

## Package manager: pnpm only

`packageManager` is pinned to `pnpm@11.24.0`. Do not use npm/yarn. `pnpm-workspace.yaml` pre-approves
build scripts for `esbuild` and `workerd`; without this, pnpm 11+ install aborts with `ERR_PNPM_IGNORED_BUILDS`.

## Commands

| Command           | Purpose                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `pnpm dev`        | Local dev via `vite dev` (not `wrangler dev`)                    |
| `pnpm start`      | Local dev via `wrangler dev` directly                            |
| `pnpm build`      | `vite build` (outputs to `dist/`)                                |
| `pnpm preview`    | Build then `vite preview`                                        |
| `pnpm deploy`     | Build then `wrangler deploy`                                     |
| `pnpm test`       | Run vitest (uses `@cloudflare/vitest-plugin`, workerd runtime)   |
| `pnpm lint`       | Runs `oxfmt` and `oxlint --fix` **concurrently** — mutates files |
| `pnpm cf-typegen` | `wrangler types` — regenerates `worker-configuration.d.ts`       |

There is no separate typecheck script; use `pnpm tsc --noEmit` if needed. There is no CI workflow
(only Dependabot) — lint/test are only enforced locally via the pre-commit hook below.

Run `pnpm cf-typegen` after changing bindings in `wrangler.jsonc`; do not hand-edit
`worker-configuration.d.ts`, it is generated.

## Pre-commit

Husky runs `pnpm lint-staged` (see `lint-staged.config.ts`) on staged files: `oxfmt` + `oxlint --fix`
for `*.ts/.tsx`, `oxfmt` only for `*.json/.jsonc/.md`. `oxlint` has `typeCheck`/`typeAware` enabled
(`.oxlintrc.json`), so lint is type-informed and slower than a plain syntax lint.

## Formatting conventions (`.oxfmtrc.json`, `.editorconfig`)

No semicolons, tabs for indentation (except `*.yml`, which uses spaces), LF line endings, ES5 trailing
commas. `.oxfmtrc.json`/`.oxlintrc.json` both ignore `worker-configuration.d.ts`.

## Tests

`test/index.spec.ts` is the stock Workers template placeholder (`"Hello World!"` snapshot) — it does
**not** exercise the actual proxy logic in `src/index.tsx`. Treat it as unverified boilerplate, not a
source of truth about behavior. `test/tsconfig.json` extends the root config with
`@cloudflare/vitest-plugin/types` and is excluded from the root `tsconfig.json`'s `include`.

## Cloudflare Workers docs

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current
documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`
- Limits/quotas: product's `/platform/limits/` page, e.g. `/workers/platform/limits`
- Errors: https://developers.cloudflare.com/workers/observability/errors/ (Error 1102 = CPU/memory exceeded)
- Node.js compat: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
