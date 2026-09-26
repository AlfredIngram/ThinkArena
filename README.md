# ThinkArena

Web app, deployed on Netlify, protected by a username + password.

## Stack

- Vite + React + TypeScript (static SPA build → `dist/`)
- Netlify config in `netlify.toml` (build `npm run build`, publish `dist`, SPA fallback)
- Site-wide HTTP Basic Auth via a Netlify Edge Function (`netlify/edge-functions/basic-auth.ts`)
- Netlify Functions can be added under `netlify/functions/` if server-side work is needed

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

## Tests

```bash
npm run test:auth      # HTTP Basic Auth edge-function cases
npm run test:engines   # XP / timeframe / wardrobe engine smoke tests
```

## Access control (username + password)

`netlify/edge-functions/basic-auth.ts` runs on every request (`/*`) and requires HTTP
Basic Auth. Browsers show their native login dialog. Credentials come from environment
variables and are never stored in the repo.

### One-time setup

1. Netlify → your site → **Site configuration → Environment variables** → add:
   - `BASIC_AUTH_USER` — the username
   - `BASIC_AUTH_PASS` — the password
2. **Redeploy** the site (Deploys → Trigger deploy) so the function picks them up.

Without those variables set, the site returns `503` instead of serving unprotected
content — it fails closed.

CLI alternative:

```bash
npx netlify env:set BASIC_AUTH_USER "youruser"
npx netlify env:set BASIC_AUTH_PASS "yourpass"
npx netlify deploy --build --prod
```

### Changing the password

Update `BASIC_AUTH_PASS` and redeploy. Browsers cache Basic credentials per session;
to force a re-prompt, close the tab or use a private window.

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
