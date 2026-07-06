# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Single-product web app: **CEO Mind OS**, a bilingual (RO/EN) founder/CEO personal-development SaaS/PWA. It is a Vite + React + TypeScript + Tailwind + shadcn/ui SPA that talks directly to a **hosted Supabase backend** (Lovable Cloud). There is no local backend server, database, or docker-compose — the backend is remote and already reachable via the `VITE_SUPABASE_*` values in `.env` (committed).

### Package manager
Uses **Bun** (`bun.lock` committed), not npm, even though `README.md` says `npm`. The startup update script installs Bun (if missing) and runs `bun install`. Run all scripts with `bun run <script>`. Bun lives at `~/.bun/bin`; if `bun` is not on `PATH` in a fresh shell, run `export PATH="$HOME/.bun/bin:$PATH"` (already added to `~/.bashrc`).

### Commands (defined in `package.json`)
- Dev server: `bun run dev` — Vite on **port 8080** (host `::`). `predev`/`prebuild` run `bunx tsx scripts/generate-sitemap.ts` first, so first start takes a few extra seconds.
- Build: `bun run build` (production) or `bun run build:dev` (development mode).
- Lint: `bun run lint` — NOTE: the repo currently has many pre-existing eslint errors (mostly `@typescript-eslint/no-explicit-any` in `supabase/functions/**`). A non-zero exit is expected and is not caused by env setup.
- Preview built app: `bun run preview`.

### Auth / testing gotchas
- The hosted Supabase project **requires email confirmation** on signup: `POST /auth/v1/signup` returns a user with `email_verified: false` and no session, so a freshly-registered account **cannot log in** until the emailed link is clicked. Inboxes are not accessible from the VM, so end-to-end flows behind `ProtectedRoute` (e.g. `/dashboard`) need a pre-confirmed test account.
- Many routes are public and need no login: `/`, `/auth`, `/burnout-test`, `/life-score`, `/marriage-quiz`, `/vision-2026`, `/pricing`, `/ebook`, `/blog`, etc. Most `/dashboard`, `/minte/**`, `/parenting/**`, `/marriage`, coach, and admin routes are gated by `ProtectedRoute`.
- AI, Stripe, email, and SMS features rely on Edge Function secrets held in the hosted Supabase project (not in the repo); they only work where those secrets are configured.
