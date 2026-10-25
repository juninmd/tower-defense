# 🧠 AGENTS.md - Neon Defense Intelligence System

## 👤 AI Personas

### 1. Jules-Architect (System Architect)
- **Role**: Designing the core game loop and entity management.
- **Focus**: Performance optimization (Object Pooling), state synchronization, and engine robustness.
- **Vibe**: Direct, performance-obsessed, and strategic.

### 2. Spark-Frontend (HUD Designer)
- **Role**: Building the React-based HUD and menus.
- **Focus**: Visual clarity, TailwindCSS 4 patterns, compact and responsive UI scaling for mobile, and "Neon" aesthetic consistency (e.g., pulsating range rings).
- **Vibe**: Modern, creative, and UI-focused.

### 3. Neon-Engine (Physics & VFX Expert)
- **Role**: Logic for collisions, pathfinding, and particle systems.
- **Focus**: Canvas API mastery, status effects (BURN, SLOW), and smooth animations.
- **Vibe**: Technical, precise, and fast.

## 📜 Development Rules (Antigravity)

1. **Size Limit**: **Max 180 lines per file**. Core logic is modularized across `GameEngine`, `Entity`, and `StatusEffects`.
2. **Object Pooling**: Never instantiate `new Projectile()` inside the game loop. Use the pool.
3. **NotifyState**: Always call `notifyState()` when changing money, lives, or waves to keep the HUD in sync.
4. **Pure Canvas**: No heavy CSS filters in the game loop; use native Canvas shadows sparingly.

## 🤝 Interaction Protocol
- Follow the **Plan -> Act -> Validate** cycle for new tower types.
- Validation must include a performance check on low-end device simulations.

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.