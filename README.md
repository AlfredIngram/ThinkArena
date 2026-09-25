# ThinkArena

Web app, deployed on Netlify.

## Stack

- Vite + React + TypeScript (static SPA build → `dist/`)
- Netlify config in `netlify.toml` (build `npm run build`, publish `dist`, SPA fallback)
- Netlify Functions can be added under `netlify/functions/` if server-side work is needed

## Local dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build locally
```

## Deploy (Netlify)

Two supported paths:

1. **Git-connected (recommended):** create a Netlify site from this GitHub repo. Netlify reads
   `netlify.toml` and builds on every push to `main`.
2. **CLI:** `npx netlify deploy --build --prod` (requires `netlify login` / `netlify link` first).

## Repo

- Local: `/home/neteng/.openclaw/workspace/ThinkArena`
- Remote: https://github.com/AlfredIngram/ThinkArena (private)
