# ThinkArena

Web app, deployed on Netlify, protected by per-user accounts.

## Stack

- Vite + React + TypeScript (static SPA build → `dist/`)
- Netlify config in `netlify.toml` (build `npm run build`, publish `dist`, SPA fallback)
- Per-user accounts via **Supabase Auth** (email + password) — see [Accounts](#accounts-supabase-auth)
- Netlify Functions can be added under `netlify/functions/` if server-side work is needed
- *(The old site-wide HTTP Basic Auth edge function is disabled — see `netlify/edge-functions.disabled/`.)*

## Features

- **Weekly learning arena** — spelling, math, Bible-verse practice, weekly map
- **Multi-timeframe goals** (`/goals`) — Weekly / Monthly / Yearly tabs with progress
  bars and a GitHub-style activity heatmap. Month/year totals are *derived* from an
  append-only daily timeline (`src/services/timeframeEngine.ts`), so they can't drift.
- **Layered avatar wardrobe** (`/wardrobe`) — mix-and-match cosmetics across 7 slots
  (base, skin, hair, outfit, accessory, pet, aura) with rarity tiers. Every item is
  code-drawn SVG (`src/components/Avatar.tsx`); drop PNGs in `public/avatars/` and point
  a wardrobe item's `image` field at them to swap in raster art.
- **Parent mode** (`/parent`, PIN `1234` by default) — edit weekly + long-term goals,
  reward multiplier.
- **Accounts + learner profiles** (`/learners`) — parents sign in with email + password;
  each parent owns one or more kid profiles. Nothing is stored unless a parent is signed in.

## Tests

```bash
npm run test:auth      # (legacy) HTTP Basic Auth edge-function cases
npm run test:engines   # XP / timeframe / wardrobe engine smoke tests
```

## Access control (Supabase Auth)

The app is gated by **per-user Supabase accounts** (email + password), not a shared
password. Parents sign in, then manage kid learner profiles.

> **HTTP Basic Auth is disabled.** The old single shared username/password gate was a
> Netlify Edge Function that ran on every request and made the browser show a native
> login dialog *before* the app loaded. It now lives in
> `netlify/edge-functions.disabled/basic-auth.ts` — outside the `netlify/edge-functions/`
> directory Netlify auto-deploys — so it no longer runs.
>
> Do **not** "disable" it by deleting `BASIC_AUTH_USER`/`BASIC_AUTH_PASS`: the handler is
> written to fail closed (HTTP 503) when those are unset. Removing the function file from
> the deploy path is the correct way to turn it off.

To re-enable the shared gate: move the file back into `netlify/edge-functions/`, set
`BASIC_AUTH_USER` and `BASIC_AUTH_PASS` (Site configuration → Environment variables), and
redeploy.

## Accounts (Supabase Auth)

**Model:** a parent/guardian is a Supabase Auth user (email + password). Kids are
`students` rows owned by that parent — no email needed for a child. Each kid can later be
given their own login via the nullable `students.auth_user_id`, with no migration.

The longer-term platform architecture is documented in
[`docs/platform-foundation.md`](docs/platform-foundation.md). It keeps today's family
experience working while preparing for households, teachers, tutors, classrooms, schools,
permission-scoped child access, learning events, reward ledgers, companions, and future AI
features.

### Tables (all Row-Level-Security'd to the owner)

| table | purpose |
| --- | --- |
| `profiles` | one row per auth user; auto-created on signup by a trigger |
| `students` | kid profiles (`owner_id` → parent) |
| `weekly_lessons` | one row per student per week (`unique(student_id, week_of)`) |
| `student_progress` | one row per student |

Access helpers (`can_access_student`, `owns_student`) live in a non-exposed `private`
schema and are callable only by `authenticated`.

### Enabling it

1. Netlify → **Environment variables** → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (publishable key — public by design; RLS is the guard)
2. **Redeploy** (Vite bakes `VITE_*` at build time).

If those variables are absent the app falls back to local-only (localStorage) mode, so the
site keeps working before the keys are set.

### Notes

- **Data persistence:** with Supabase configured, `weekly_lessons.lesson`,
  `student_progress.progress`, and `students.avatar` (cosmetics) are the source of truth;
  `localStorage` is kept as an instant/offline cache. Writes are debounced (~800 ms) and
  hydration is gated so the local cache never overwrites remote data on startup. In local
  mode (no env vars) `localStorage` is the only store, exactly as before.
- Supabase's **Confirm email** setting, if enabled, requires a click-through before the
  first sign-in. Disable it (Authentication → Providers → Email) for a frictionless,
  kid-focused flow.
- Learner data is namespaced per student in localStorage, so two accounts on one browser
  never read each other's data.

## Local dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build locally
```

To test the auth layer locally, use the Netlify CLI (runs edge functions):

```bash
npx netlify dev    # requires `netlify link` and the env vars set locally
```

## Deploy (Netlify)

Two supported paths:

1. **Git-connected (recommended):** create a Netlify site from this GitHub repo. Netlify reads
   `netlify.toml` and builds on every push to `main`.
2. **CLI:** `npx netlify deploy --build --prod` (requires `netlify login` / `netlify link` first).

## Repo

- Local: `/home/neteng/.openclaw/workspace/ThinkArena`
- Remote: https://github.com/AlfredIngram/ThinkArena (public)
