# HW-V16-B04 — INPUT OWNERSHIP & UI INTERACTION STABILITY REPORT

- **Task ID:** `HW-V16-B04`
- **Project:** `HOLLOW WOODS` (`V1.6.0 — The Unbroken Oath`)
- **Roadmap:** `3.1`
- **Baseline Dependency (`HW-V16-B03`):** `3fe8a8f72857462dba1964b9c536bfc871c4acc3`
- **Isolated Worktree:** `G:\HOLLOW_WOODS_B04`
- **Branch:** `fix/v1.6-b04-input-ui`
- **Primary / Prior Worktree Safety:**
  - `G:\HOLLOW WOODS` (`e4edb07bcbf2865681277a12404624c4c495bb1f`, uncommitted `A07`): untouched.
  - `G:\HOLLOW_WOODS_B01` (`ce88553ad2a2a5062e8234c2e36a62edfcce6371`), `G:\HOLLOW_WOODS_B02` (`c3b6bbf5e6dd69e67ba5c2d8e822a30f0c25fa26`), `G:\HOLLOW_WOODS_B03` (`3fe8a8f72857462dba1964b9c536bfc871c4acc3`): untouched.
- **Scope Guards Honored:**
  - No `A05` reward/trust/flag logic weakened; no `H4-12A` `[C]` regression.
  - `[N]` preserved as World Map shortcut; no arbitrary keybind overhaul.
  - Save Schema (`3`), Ending thresholds, Quest/Trust/Reward rules, and Headless Warden scope untouched.

---

## 1. Bug Classification Table (`A–F` & Regression Findings)

| ID / Area | Description | Status | Resolution Summary |
| :--- | :--- | :---: | :--- |
| **A. ESC / Dialogue Cancel (`H4-NEW-02` / `OPEN-03` vs `A05`)** | Respawn after `boss_hooded_knight_defeated` was already blocked in `WildlifeSystem.ts`; `A05` intentionally keeps `cancelDialogue()` from applying rewards or emitting `dialogue_completed`. However, `HoodedKnightBoss.defeat()` only listened to `dialogue_completed` (plus `repeat: -1` stagger fallback), so cancelling post-defeat dialogue with `ESC` left the boss sprite frozen on screen (`OPEN-03`). | **`REPRODUCED` -> `FIXED`** (respawn `ALREADY FIXED`) | `DialogueSystem.cancelDialogue()` now emits non-reward lifecycle event `dialogue_cancelled` (preserving `A05` atomic reward rollback); `EvilKnights.ts` listens cleanly to both `dialogue_completed` and `dialogue_cancelled` (plus `1200ms` fallback) to trigger fadeout & destroy. |
| **B. Crafting Double-Toggle (`H4-12A`)** | Pressing `[C]` previously opened then immediately closed `CraftingModal`. | **`ALREADY FIXED`** | Preserved `H4-12A` + `B03` centralized `UIScene.handleShortcut` with `WeakSet<KeyboardEvent>` deduplication (`20/20` continuous toggles PASS). |
| **C. Map / Mute Key Conflict (`H4-NEW-05`)** | `UIScene.ts` bound both `KeyN` and `KeyM` to `toggleWorldMap()`, hijacking `BlackKnightPlayer`/`GameScene` Audio Mute `[M]` (`before_b04_baseline.json`: pressing `M` opened Map and left `muted=false`). `ParchmentWorldMapModal` subtitle & taskbar also advertised `[M]`. | **`REPRODUCED` -> `FIXED`** | Removed `KeyM -> toggleWorldMap()` from `UIScene.handleShortcut` and updated taskbar/scroll subtitle labels to `[N]`. `[N]` opens/closes World Map exclusively; `[M]` toggles Mute exclusively (`JournalModal` `[M]` still switches to Map tab while Journal owns input). |
| **D. Roll State Check (`GameScene.ts:7093`)** | `const isRolling = (this.player as any).isRolling \|\| false;` treated the method `BlackKnightPlayer.isRolling()` as a truthy property (`before_b04_baseline.json`: `bool_property_access=true` while idle). | **`REPRODUCED` -> `FIXED`** | Updated `GameScene.ts:7093` to invoke `this.player.isRolling()` safely without altering dodge physics or timings. |
| **E. Journal UI Header / `[TẤT CẢ]` Overlap** | `JournalModal.ts` rendered `DANH SÁCH CÁC HỒI:` (`x: 670..840`) overlapping `[TẤT CẢ]` (`x: 835..879`) on row `my + 66..68` (`before_journal_overlap.png`: `overlaps=true`). | **`REPRODUCED` -> `FIXED`** | Moved `[TẤT CẢ]`, `[CHÍNH]`, `[PHỤ]` onto a clean filter row at `my + 89` (`x: +30/+115/+190`) below `DANH SÁCH CÁC HỒI:` (`my + 64`) and shifted list start to `my + 114` (`after_journal_fixed.png`: `overlaps=false`). |
| **F. Input Ownership & Modal Isolation** | (1) `EquipmentModal.close()` shared `< 200ms` `lastToggleTime` debounce with `open()`, blocking quick `ESC`/`✕`/tab switches; (2) `[B]`/`[N]`/`[C]`/`[J]` could stack over `PauseModal`/`CampfireModal`/`TornPageModal`, and `toggleEquipment()` didn't close sibling tabs; (3) `PauseModal` `[H]` guide overlay closed all of Pause on 1 `ESC`; (4) `2B` portal transitions didn't close open modals; (5) `BlackKnightPlayer.forceUnlockActionState()` / `playIdleAnim()` and `PauseModal.updateGraphicsQualityText()` could throw `anims`/`context` null/undefined errors during teardown/restart. | **`REPRODUCED` -> `FIXED`** | Moved debounce to `EquipmentModal.toggle()` only; added `hasBlockingOverlayModal()` in `UIScene.handleShortcut` & cross-panel cleanup in `toggleEquipment()`; updated `UIScene.handleESC()` to close `PauseModal` Guide overlay first; added `UIScene.closeAllModalsForTransition()` called in `GameScene.executeTransition()` `2B` portals; added teardown null guards in `BlackKnightPlayer.ts` & `PauseModal.ts`. Preserved Dialogue `[1]..[5]` choices cleanly. |
| **Physical Windows EVKey Host Verification** | OS-level Windows EVKey hook daemon interaction outside headless Chromium. | **`NOT RUN`** | Inherited from `B03`; headless Chromium Playwright verifies browser/DOM keyboard & IME events only. |

---

## 2. Modified Files (`G:\HOLLOW_WOODS_B04`)

Local backups saved under `Backups/steps/backup_hw_v16_b04/` (not staged or committed):

- `src/systems/DialogueSystem.ts`
- `src/entities/EvilKnights.ts`
- `src/entities/BlackKnightPlayer.ts`
- `src/scenes/GameScene.ts`
- `src/scenes/UIScene.ts`
- `src/ui/EquipmentModal.ts`
- `src/ui/JournalModal.ts`
- `src/ui/ParchmentWorldMapModal.ts`
- `src/ui/PauseModal.ts`

(`9 files changed, 88 insertions(+), 38 deletions(-)`)

---

## 3. Build & Test Matrix Results (Executed After Final Edit)

| Suite / Gate | Scope Covered | Result |
| :--- | :--- | :---: |
| `npm run check` (`tsc --noEmit`) | Full TypeScript strict compilation | **PASS** (exit `0`) |
| `npm run verify:data` | `items`, `recipes`, `dialogues`, `quests`, `content_registry`, `lore` integrity | **PASS** (`15/15`) |
| `npm run build` (`tsc && vite build`) | Production bundle (`dist/assets/index-t6-Xk45b.js`, `10.51s`) | **PASS** (exit `0`) |
| `verify_b04_matrix.py` (`after_b04_verification.json`) | 13 matrix checks: 20x open/close (`C/J/B/N`), Mouse `[✕/✖]` close, Journal non-overlap + `[CHÍNH]` filter click, Map `[N]` vs Mute `[M]`, `isRolling()` & Roll -> Crafting UI, Dialogue `[1..5]` choice `4` ownership + `ESC` cancel (`0` trust leak), `executeTransition` modal cleanup, `HoodedKnightBoss` defeat + `ESC` cancel fadeout (`0` respawn), Pause Guide `[H]` -> 2-step `ESC`, held `S` cleared on open modal, Pause Save -> Reload -> Continue (`Schema 3`) + `scene.restart()` listener count (`2 -> 2 -> 2`), `0` `pageerror`, `0` `console_errors` | **PASS (`13/13`)** |
| `tests/hw_bug_21b_walk_run_verification.py` | 4-dir walk/run, Sprint, Shift release, IME+Blur, Pause ESC, Armed/Unarmed, Outer Woods transition, Combat smoke | **PASS (`10/10`)** |
| `tests/hw_bug_26b_walkrun_fix_verification.py` | 600ms Shift watchdog, Outer Woods obstacle collision guardrail, Combat action locks, Save Schema 3 | **PASS (`5/5`)** |

---

## 4. Visual & JSON Evidence

- **Baseline JSON:** `Read/V1.5/Reports/Evidence/HW-V16-B04/before_b04_baseline.json`
- **Verification JSON:** `Read/V1.5/Reports/Evidence/HW-V16-B04/after_b04_verification.json`
- **Journal BEFORE (overlap reproduced):** `Read/V1.5/Reports/Evidence/HW-V16-B04/before_journal_overlap.png`
- **Journal AFTER (clean separation):** `Read/V1.5/Reports/Evidence/HW-V16-B04/after_journal_fixed.png`
- **World Map `[N]`:** `Read/V1.5/Reports/Evidence/HW-V16-B04/after_world_map_N.png`
- **Dialogue Choices `[1]–[5]`:** `Read/V1.5/Reports/Evidence/HW-V16-B04/after_dialogue_choices.png`
