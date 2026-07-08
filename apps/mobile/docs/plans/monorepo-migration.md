# Monorepo Migration + Web App Plan

## Overview

Restructure the repo into a Bun workspace monorepo, moving the mobile app into
`apps/mobile/` and scaffolding a Next.js landing page at `apps/web/`. The web app
hosts the Play Store privacy policy and serves as the app's public landing page.

---

## Target Structure

```
thread/
  apps/
    mobile/         ← entire current root (Expo/RN app)
    web/            ← new Next.js landing page
  package.json      ← root workspace (bun workspaces)
  bun.lock
  .gitignore
  README.md
```

---

## Phase 1 — Root Workspace Setup

Create the root `package.json` that declares workspaces. This file replaces nothing
— it sits at the repo root and bun uses it to hoist/link dependencies.

**`/package.json`**
```json
{
  "name": "thread-monorepo",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "packageManager": "bun@1.3.14"
}
```

---

## Phase 2 — Move Mobile App to `apps/mobile/`

Move all current root-level files (except `apps/`, `.git/`, `.gitignore`, `README.md`,
`bun.lock`) into `apps/mobile/`.

Files/folders to move:
```
android/
ios/
app/
assets/
components/
db/
docs/
drizzle/
features/
hooks/
lib/
patches/
types/
.agents/
.claude/
.codex/
.expo/
app.json
babel.config.js
components.json
drizzle.config.ts
drizzle/migrations.js
eslint.config.js
expo-env.d.ts
global.css
metro.config.js
metro.config.js
package.json         ← becomes apps/mobile/package.json
prettier.config.js / .prettierrc
.prettierignore
skills-lock.json
tsconfig.json
uniwind-types.d.ts
AGENTS.md
```

The `apps/mobile/package.json` keeps its current content (name, deps, scripts) — no
changes needed to it.

### Path fixes after move

These files reference paths that need updating after the move:

**`apps/mobile/android/app/build.gradle`**
All native paths use `node --print require.resolve(...)` which resolves relative to
the gradle file — these will still work since `node_modules` will be in
`apps/mobile/node_modules` (or hoisted to root). No change needed.

**`apps/mobile/metro.config.js`**
Check if `projectRoot` or `watchFolders` are set. If not explicitly set, Metro
defaults to the directory containing `package.json` — which will now be
`apps/mobile/`, so it should still work. Verify after move.

**`apps/mobile/drizzle.config.ts`**
Check for any hardcoded relative paths to schema files. Update if needed.

**Root `.gitignore`**
After the move, update the keystore gitignore path:
```
# was:
android/app/release.keystore

# becomes:
apps/mobile/android/app/release.keystore
```

---

## Phase 3 — Scaffold Next.js Web App

Run this from the repo root:

```bash
bunx create-next-app@latest apps/web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

This gives:
```
apps/web/
  src/
    app/
      layout.tsx
      page.tsx
  package.json
  next.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
```

The `apps/web/package.json` name should be `"thread-web"`.

---

## Phase 4 — Web App Styling

Match the mobile app's dark theme (zinc palette from `lib/theme.ts`).

**`apps/web/src/app/globals.css`**
```css
@import "tailwindcss";

:root {
  --background: #09090b;      /* zinc-950 */
  --foreground: #fafafa;      /* zinc-50 */
  --card: #111113;
  --muted: #1a1a1d;           /* zinc-900 */
  --muted-foreground: #71717a; /* zinc-500 */
  --border: #1f1f23;          /* zinc-850 */
  --primary: #fafafa;
  --primary-foreground: #09090b;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Geist', sans-serif;
}
```

**Font**: Use `next/font/google` with Geist (same as mobile):
```tsx
import { Geist, Geist_Mono } from 'next/font/google';
```

---

## Phase 5 — Web App Pages

### `src/app/layout.tsx`
- Root layout with Geist font
- Dark background (`#09090b`)
- Minimal `<head>` metadata (title: "Thread", description)

### `src/app/page.tsx` — Landing page
Keep it minimal. Sections:
1. **Hero** — App name "Thread", one-line description ("A private, on-device AI assistant"), Google Play badge/button (link TBD)
2. **Features** — 3 bullet points max (runs locally, no data sent, open source)
3. **Footer** — Link to `/privacy`

### `src/app/privacy/page.tsx` — Privacy Policy
Content:
- **Last updated**: [date]
- **Data collection**: Thread does not collect, transmit, or store any personal data. All processing happens on-device.
- **Permissions**: Microphone (speech-to-text, optional), Storage (model files, on-device only)
- **Third parties**: No third-party analytics, tracking, or SDKs that transmit data
- **Contact**: usmankhalil8011@gmail.com

This page's URL (`https://your-domain.com/privacy`) is what goes into the Play Store.

---

## Phase 6 — Vercel Deployment

1. Push the monorepo to GitHub
2. Import into Vercel
3. Set **Root Directory** to `apps/web` in Vercel project settings
4. Deploy — Vercel auto-detects Next.js
5. Copy the deployed `/privacy` URL into the Play Store app listing

---

## Install After Migration

After all files are in place, from the repo root:
```bash
bun install
```

Bun will hoist shared deps and link workspaces.

---

## Scripts

Root `package.json` can optionally add convenience scripts:
```json
{
  "scripts": {
    "dev:web": "bun run --cwd apps/web dev",
    "dev:mobile": "bun run --cwd apps/mobile dev",
    "build:web": "bun run --cwd apps/web build"
  }
}
```

---

## Notes for Implementer

- Do NOT run `expo prebuild` after the move without first verifying that all
  native paths resolve correctly from `apps/mobile/`.
- The `android/app/release.keystore` file lives in `apps/mobile/android/app/` after
  the move — update `.gitignore` accordingly.
- The `apps/mobile/android/app/build.gradle` has custom llama.rn `.so` stripping in
  the `androidComponents` block and arm64-only release pinning in `settings.gradle`
  — do not overwrite these if re-running prebuild.
- Bun workspaces hoist dependencies by default — if there are peer dep conflicts
  between mobile and web packages, use `bun install --no-hoist` per-package.
