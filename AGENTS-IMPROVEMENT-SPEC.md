# AGENTS.md Improvement Spec — Urban Refit

## Current State

No `AGENTS.md` exists. No agent configuration files (`.cursorrules`, `CLAUDE.md`, `.ona/skills/`) are present. The only agent-adjacent artifacts are an empty `.ona/review/comments.json` and a `.manus/db/` directory with cached query results.

---

## Audit Summary

### What's Good

- **Formatting**: `.prettierrc` with explicit rules (double quotes, 2-space indent, trailing commas, LF line endings).
- **Type safety**: `tsconfig.json` with strict mode, path aliases (`@/` → `client/src`, `@shared/` → `shared/`).
- **Testing infra**: `vitest.config.ts` configured, 40+ server test files exist.
- **Auth layering**: tRPC middleware defines `publicProcedure`, `protectedProcedure`, `adminProcedure` in `server/_core/trpc.ts`.
- **Schema docs**: Drizzle schema tables have JSDoc comments explaining purpose.
- **Build config**: Vite chunk splitting for vendor libs is well-organized.

### What's Missing

| Gap | Impact |
|-----|--------|
| No `AGENTS.md` | Agents have zero project context — they guess at conventions, file locations, and workflows |
| No `.env.example` | Agents cannot know which env vars are required or what they do |
| No architecture doc | Agents don't understand the monorepo layout or data flow |
| No testing conventions | 40+ test files but no documented patterns for mocking, naming, or coverage expectations |
| No migration workflow doc | Two migration directories exist (`drizzle/` and `migrations/`) with no guidance on which to use |
| No ESLint config | No automated code quality enforcement beyond Prettier formatting |
| No `CODEOWNERS` | No ownership mapping for code review routing |
| No deployment docs | Agents cannot reason about production constraints |

### What's Wrong

| Issue | Location | Severity |
|-------|----------|----------|
| Monolith router file (2,334 lines) | `server/routers.ts` | High — agents will struggle to navigate, and changes risk merge conflicts |
| Monolith DB file (3,803 lines) | `server/db.ts` | High — same problem |
| Duplicate `adminProcedure` | Defined in both `server/_core/trpc.ts` and `server/routers.ts` | Medium — agents may use the wrong one |
| Cached query files in repo | `.manus/db/*.json` (100+ files) | Medium — bloats repo, confuses agents about what's source code |
| Loose test result files in root | `*-test-results.txt`, `*_test_results.md` | Low — clutter that agents may treat as documentation |
| Loose utility files in root | `test-storage.mjs`, `cdn-urls.json`, multiple `*_notes.md` | Low — unclear purpose, no organization |
| 57KB `todo.md` in root | Historical task tracker | Low — not useful for agents, adds noise |
| Dual migration directories | `drizzle/` (canonical) vs `migrations/` (one-off SQL) | Medium — ambiguous for agents running migrations |

---

## Improvement Spec

### 1. Create `AGENTS.md`

The file should contain the following sections:

#### 1.1 Project Overview
- Urban Refit: secondhand fashion e-commerce platform (NZ-based)
- Monorepo: `client/` (React + Vite), `server/` (Express + tRPC), `shared/` (types + constants), `drizzle/` (schema + migrations)
- Key tech: TypeScript, React 19, tRPC v11, Drizzle ORM, MySQL, Stripe, S3, Tailwind v4, Radix UI

#### 1.2 Directory Map
```
client/src/pages/       → Page components (file = route)
client/src/components/  → Shared UI components
client/src/hooks/       → Custom React hooks
client/src/lib/         → Utilities (trpc client, cn helper)
client/src/contexts/    → React context providers
server/_core/           → Server infrastructure (express setup, tRPC init, auth, env)
server/routers/         → tRPC sub-routers (badges, feedback)
server/routers.ts       → Main tRPC router (appRouter)
server/db.ts            → Database query functions
server/admin-routes.ts  → Admin-only tRPC routes
drizzle/schema.ts       → Drizzle table definitions
drizzle/relations.ts    → Drizzle relation definitions
drizzle/*.sql           → Generated migrations
shared/types.ts         → Shared TypeScript types
shared/const.ts         → Shared constants
```

#### 1.3 Code Conventions
- **Formatting**: Prettier — double quotes, 2-space indent, trailing commas (es5), no semicolons optional. Run `pnpm format`.
- **Imports**: Use `@/` for client code, `@shared/` for shared code. Server files use relative imports.
- **Components**: Functional components only. Use shadcn/ui patterns from `client/src/components/ui/`.
- **State management**: TanStack Query via tRPC hooks. No Redux or Zustand.
- **Routing**: `wouter` (not react-router). File-based convention in `pages/`.
- **Forms**: `react-hook-form` + `zod` validation via `@hookform/resolvers`.
- **Styling**: Tailwind CSS v4 with `cn()` utility from `@/lib/utils`. Use `class-variance-authority` for component variants.

#### 1.4 tRPC Patterns
- Three procedure types: `publicProcedure`, `protectedProcedure`, `adminProcedure` — all from `server/_core/trpc.ts`.
- Input validation with Zod schemas.
- The canonical `adminProcedure` is in `server/_core/trpc.ts` (not the duplicate in `routers.ts`).
- New route groups should be sub-routers in `server/routers/` and merged into `appRouter` in `server/routers.ts`.

#### 1.5 Database
- ORM: Drizzle with MySQL dialect.
- Schema: `drizzle/schema.ts`. Relations: `drizzle/relations.ts`.
- Migrations: `pnpm db:push` (generates + applies). Canonical migrations live in `drizzle/`.
- Connection: `server/db.ts` exports the `db` instance and all query functions.
- Env var: `DATABASE_URL` (MySQL connection string).

#### 1.6 Testing
- Framework: Vitest. Config: `vitest.config.ts`.
- Test files: `server/*.test.ts` (colocated with server code).
- Run: `pnpm test`.
- Tests are server-side only. No client-side test infrastructure currently.

#### 1.7 Environment Variables
Document required vars (derive from `server/_core/env.ts`):
- `DATABASE_URL` — MySQL connection string
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe integration
- `RESEND_API_KEY` — Email via Resend
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` — S3 storage
- Plus any Forge/Manus API keys from `ENV`

#### 1.8 Commands
```
pnpm dev          → Start dev server (Vite + Express)
pnpm build        → Production build
pnpm test         → Run Vitest
pnpm check        → TypeScript type check
pnpm format       → Prettier format
pnpm db:push      → Generate and apply DB migrations
```

#### 1.9 Anti-patterns
- Do NOT add new routes directly to `server/routers.ts` — create a sub-router in `server/routers/` instead.
- Do NOT define new `adminProcedure` — use the one from `server/_core/trpc.ts`.
- Do NOT add query functions to `server/db.ts` for new features — colocate with the router.
- Do NOT use `axios` for new server-side HTTP calls — use native `fetch`.
- Do NOT commit `.manus/db/` query cache files.

---

### 2. Create `.env.example`

Extract all required environment variables from `server/_core/env.ts` and document them with placeholder values and comments.

---

### 3. Gitignore Additions

Add to `.gitignore`:
```
# Manus cached queries
.manus/

# Test result artifacts
*-test-results.txt
*_test_results.md
```

---

### 4. Remove Duplicate `adminProcedure`

In `server/routers.ts`, remove the local `adminProcedure` definition (lines ~21-27) and import it from `server/_core/trpc.ts` instead. This is already exported there.

---

### 5. Recommended Structural Refactors (Future)

These are not blockers for the AGENTS.md but would improve agent effectiveness:

| Refactor | Rationale |
|----------|-----------|
| Split `server/routers.ts` into domain sub-routers under `server/routers/` | 2,334 lines is unnavigable. Group by domain: `auth`, `products`, `orders`, `cart`, `reviews`, `notifications`, etc. |
| Split `server/db.ts` into domain query modules under `server/db/` | 3,803 lines. Colocate queries with their routers. |
| Split `drizzle/schema.ts` into per-domain schema files | 1,045 lines. Drizzle supports multi-file schemas. |
| Clean up root directory | Move `*_notes.md`, `*_test_results.*`, `cta-audit.md`, `todo.md` into a `docs/` or `notes/` directory, or delete if obsolete. |
| Add ESLint | No linting beyond Prettier. Add `@typescript-eslint` with recommended rules. |
| Optimize devcontainer | Replace universal image with `mcr.microsoft.com/devcontainers/javascript-node:22` + pnpm feature. Add `postCreateCommand` for `pnpm install`. |

---

### 6. Priority Order

1. **Create `AGENTS.md`** — immediate, highest impact for agent effectiveness
2. **Create `.env.example`** — immediate, prevents agent guessing on env setup
3. **Update `.gitignore`** — immediate, reduces noise
4. **Fix duplicate `adminProcedure`** — quick fix, prevents confusion
5. **Structural refactors** — plan and execute incrementally
