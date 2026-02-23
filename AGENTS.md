# AGENTS.md — Urban Refit

## Project Overview

Urban Refit is a secondhand fashion e-commerce platform based in New Zealand. Users buy refurbished garments; thrift stores supply inventory and receive payouts. A portion of each sale goes to charity.

**Stack:** TypeScript monorepo — React 19 (Vite) frontend, Express + tRPC v11 backend, Drizzle ORM with MySQL, Stripe payments, S3 image storage, Tailwind CSS v4, Radix UI (shadcn/ui).

**Package manager:** pnpm (pinned via `packageManager` field in `package.json`).

## Directory Map

```
client/                     → Frontend (React + Vite)
  src/
    pages/                  → Page components (each file = one route)
    pages/admin/            → Admin panel pages
    pages/docs/             → Documentation pages
    components/             → Shared UI components
    components/ui/          → shadcn/ui primitives
    hooks/                  → Custom React hooks
    lib/                    → Utilities (tRPC client, cn helper)
    contexts/               → React context providers
    App.tsx                 → Route definitions
    main.tsx                → Entry point
    index.css               → Global styles + Tailwind imports

server/                     → Backend (Express + tRPC)
  _core/                    → Server infrastructure
    index.ts                → Express app setup, server entry point
    trpc.ts                 → tRPC init, procedure definitions (public/protected/admin)
    context.ts              → tRPC context creation
    env.ts                  → Environment variable access
    oauth.ts                → OAuth flow
    cookies.ts              → Session cookie config
    vite.ts                 → Vite dev middleware
    llm.ts                  → LLM integration
  routers/                  → tRPC sub-routers (badges, feedback)
  routers.ts                → Main appRouter — merges all routes
  admin-routes.ts           → Admin-only tRPC routes
  db.ts                     → Database connection + query functions
  stripe.ts                 → Stripe integration
  storage.ts                → File storage (S3/local)
  resend.ts                 → Email via Resend
  mailchimp.ts              → Mailchimp newsletter integration
  sustainability.ts         → Sustainability metrics calculations
  *.test.ts                 → Server tests (colocated)

shared/                     → Code shared between client and server
  types.ts                  → Shared TypeScript types
  const.ts                  → Shared constants (cookie name, error messages)

drizzle/                    → Database (Drizzle ORM)
  schema.ts                 → Table definitions
  relations.ts              → Table relations
  *.sql                     → Generated migrations
  meta/                     → Drizzle migration metadata
```

## Code Conventions

### Formatting
Prettier with these settings (see `.prettierrc`):
- Double quotes, 2-space indent, trailing commas (es5)
- 80 char print width, LF line endings
- Run: `pnpm format`

### Imports
- `@/` → `client/src/` (client code)
- `@shared/` → `shared/` (shared code)
- Server-internal modules use relative imports; server code imports shared modules via `@shared/*`

### Components
- Functional components only
- UI primitives from `client/src/components/ui/` (shadcn/ui pattern)
- Use `cn()` from `@/lib/utils` for conditional class merging

### State & Data Fetching
- TanStack Query via tRPC React hooks — no Redux, no Zustand
- tRPC client configured in `client/src/lib/trpc.ts`

### Routing
- `wouter` (not react-router)
- Routes defined in `client/src/App.tsx`
- Page components in `client/src/pages/`

### Forms
- `react-hook-form` + Zod validation via `@hookform/resolvers`

### Styling
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- `cn()` utility for class merging (`clsx` + `tailwind-merge`)
- `class-variance-authority` for component variants
- `framer-motion` for animations

## tRPC Patterns

Three procedure types defined in `server/_core/trpc.ts`:

| Procedure | Auth | Use for |
|-----------|------|---------|
| `publicProcedure` | None | Public endpoints (product listing, auth check) |
| `protectedProcedure` | Logged-in user | User actions (cart, orders, profile) |
| `adminProcedure` | Admin role | Admin operations (product CRUD, payouts) |

**Always import procedures from `server/_core/trpc.ts`.** Do not redefine them locally.

Input validation uses Zod schemas:
```typescript
myRoute: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input, ctx }) => { ... })
```

New route groups should be sub-routers in `server/routers/`:
```typescript
// server/routers/myFeature.ts
import { publicProcedure, router } from "../_core/trpc";

export const myFeatureRouter = router({
  list: publicProcedure.query(async () => { ... }),
});
```

Then merge into `appRouter` in `server/routers.ts`:
```typescript
import { myFeatureRouter } from "./routers/myFeature";

export const appRouter = router({
  myFeature: myFeatureRouter,
  // ...existing routes
});
```

## Database

- **ORM:** Drizzle with MySQL dialect
- **Schema:** `drizzle/schema.ts` (table definitions), `drizzle/relations.ts` (relations)
- **Connection:** `server/db.ts` exports the `db` instance and query functions
- **Config:** `drizzle.config.ts` (reads `DATABASE_URL`)
- **Migrations:** Run `pnpm db:push` to generate and apply. Canonical migrations live in `drizzle/`. The `migrations/` directory at root contains one-off SQL scripts — not part of the Drizzle workflow.

Key tables: `users`, `thriftStores`, `products`, `orders`, `orderItems`, `payouts`, `cartItems`, `reviews`, `charities`, `blogPosts`, `contactMessages`, `notifications`.

## Testing

- **Framework:** Vitest
- **Config:** `vitest.config.ts`
- **Test files:** `server/*.test.ts` (colocated with server code)
- **Run:** `pnpm test`
- **Scope:** Server-side only. No client-side test infrastructure currently.
- **Pattern:** Tests import from server modules directly. No shared test utilities or fixtures directory.

## Environment Variables

See `.env.example` for the full list. Key groups:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session cookie signing |
| `VITE_APP_ID` | Application identifier |
| `OAUTH_SERVER_URL` | OAuth provider URL |
| `OWNER_OPEN_ID` | Owner user identifier |
| `STRIPE_SECRET_KEY` | Stripe API (server) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe API (client, `VITE_` prefix exposes to browser) |
| `RESEND_API_KEY` | Email sending via Resend |
| `RESEND_FROM_EMAIL` | Sender email address |
| `MAILCHIMP_API_KEY` | Newsletter integration |
| `MAILCHIMP_AUDIENCE_ID` | Mailchimp list ID |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | S3 image storage |
| `S3_BUCKET`, `S3_BASE_URL` | S3 bucket config |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | Forge/Manus platform API |
| `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL` | Forge API (client-side, maps) |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL (client) |
| `VITE_APP_URL` | Public app URL (used in emails) |

Variables prefixed with `VITE_` are exposed to the browser via Vite.

## Commands

```
pnpm dev          # Start dev server (Vite HMR + Express, port 3000)
pnpm build        # Production build (Vite client + esbuild server)
pnpm start        # Run production build
pnpm test         # Run Vitest test suite
pnpm check        # TypeScript type check (no emit)
pnpm format       # Prettier format all files
pnpm db:push      # Generate + apply Drizzle migrations
```

## Anti-patterns

- **Do NOT add routes directly to `server/routers.ts`** — it is already 2,300+ lines. Create a sub-router in `server/routers/` and merge it into `appRouter`.
- **Do NOT redefine `adminProcedure`** — import it from `server/_core/trpc.ts`.
- **Do NOT add query functions to `server/db.ts`** for new features — colocate queries with the router or create a dedicated module.
- **Do NOT use `axios` for new server-side HTTP calls** — use native `fetch`. (`axios` is a legacy dependency.)
- **Do NOT commit `.manus/db/` files** — these are cached query results, not source code.
- **Do NOT commit test result files** (`*-test-results.txt`, `*_test_results.md`) — these are ephemeral artifacts.
