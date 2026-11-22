# AGENTS.md

Neon Defense: a tower defense game in React 19, TypeScript and HTML5 Canvas, with a flat neon style. The game loop lives in a plain Canvas engine; React renders only the HUD and menus.

## Stack

- Vite, React, TypeScript, Tailwind CSS v4, `vite-plugin-pwa`, ESLint, Playwright (verification scripts).
- Procedural audio via Web Audio API (`SoundManager`).

## Commands

```bash
pnpm install
pnpm dev                 # Vite dev server on :5173
pnpm build               # tsc -b && vite build
pnpm lint                # eslint .
pnpm preview             # serve the production build
python verification/verify.py        # Playwright checks; needs `pnpm dev` running on :5173
python verification/verify_hud.py    # HUD checks; same requirement
```

## Structure

- `src/game/GameEngine.ts`: core loop, canvas rendering, entity management.
- `src/game/`: entities (`Tower`, `Enemy`, `Projectile`, `Particle`), `StatusEffects.ts`, `Mods.ts` (roguelite upgrades), `Maps.ts`, `Skins.ts`, `ObjectPool.ts`, `SoundManager.ts`.
- `src/game/systems/`: `InputManager`, `ProjectileSystem`, `RenderSystem`, `WaveManager`.
- `src/components/`: React HUD (`HUD.tsx`, `hud/`), `StartMenu.tsx`, `TopBar.tsx`.
- `verification/`: Playwright scripts and their outputs. `public/`: PWA manifest and icons.

## Conventions

- Max 180 lines per file. Logic is split across `GameEngine`, entity classes and `StatusEffects`.
- Object pooling: never `new Projectile()` (or other high-frequency entity) inside the game loop. Use `ObjectPool`.
- Call `notifyState()` whenever money, lives, waves or active mods change, so the HUD stays in sync.
- Pure Canvas: no heavy CSS filters in the game loop. Use native canvas shadows sparingly.
- Keep the flat neon style. No realistic textures (see `GEMINI.md`).
- New tower types follow Plan, then Act, then Validate. Validation includes a performance check on low-end device simulation.
- GitHub Actions: <!-- base-actions-main-policy -->
  - Reference internal actions by branch, never by SHA: `uses: juninmd/base-actions/<action>@main` and `uses: juninmd/base-actions/.github/workflows/<file>.yml@main`.
  - Do not pin `@<sha>` for `juninmd/base-actions`; updates are centralized on `main`.
  - PRs whose checks do not start because of billing or spending limits are auto-merged by `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`. Apply the `do-not-merge` label to block that.

## Gotchas

- `src/components/TopBar.spec.ts` and `src/game/*.test.ts` / `*.spec.ts` exist, but no test runner is in `package.json`. No script runs them. Do not claim they pass.
- `pages.yml` deploys to GitHub Pages on every push to `master`. A merge publishes the site.
- Playwright scripts need the dev server running first (`pnpm dev`).
