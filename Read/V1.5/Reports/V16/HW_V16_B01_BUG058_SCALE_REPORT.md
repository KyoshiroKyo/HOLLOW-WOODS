# HW-V16-B01 — CHARACTER SCALE STABILIZATION (`BUG-058`)

- **PROJECT:** HOLLOW WOODS
- **STUDIO:** KYOSHIRO STUDIO
- **TARGET:** V1.6.0 — THE UNBROKEN OATH
- **ROADMAP:** 3.1
- **TASK ID:** HW-V16-B01
- **BUG ID:** BUG-058
- **STATUS:** `IMPLEMENTED & VERIFIED (ISOLATED WORKTREE)`
- **BRANCH:** `fix/v1.6-b01-bug058-scale`
- **WORKTREE:** `G:\HOLLOW_WOODS_B01` (isolated from primary `G:\HOLLOW WOODS` worktree holding uncommitted A07 changes)
- **BASE SHA:** `e4edb07bcbf2865681277a12404624c4c495bb1f`

---

## 1. ENTRY GATE & WORKTREE ISOLATION

- Primary repository `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish` at `e4edb07bcbf2865681277a12404624c4c495bb1f`) preserves uncommitted `HW-V16-A07` local edits (`4` modified `src/` files, `2` untracked files, and `297` staged `Pixel_Art/` index entries).
- Per Entry Gate isolation rule, all `HW-V16-B01` implementation, build verification, and artifacts were executed strictly inside isolated worktree `G:\HOLLOW_WOODS_B01` on branch `fix/v1.6-b01-bug058-scale`.
- Backup created prior to source edits at `Backups/steps/backup_hw_v16_b01/` (`Constants.ts`, `BlackKnightPlayer.ts`, excluded from git via `.gitignore`).

---

## 2. ROOT CAUSE ANALYSIS (`BUG-058`)

Atlas measurements (`public/assets/characters/black_knight/black_knight_*.png` + `.json`), Phaser `AnimationState` lifecycle analysis (`handleStart`, `startAnimation`, `setCurrentFrame`), and live Playwright telemetry identified the causes of Meliodas's locomotion scale pop:

1. **Unbalanced artwork multipliers on `black_knight_conversion_motion` (`84×72`, pivot `(0.5, 0.875)`):**
   - Baseline `Idle` (`black_knight_armed_idle` / `black_knight_movement`, `64×64` at `WAYFARER_BASE_SCALE = 1.50`) measures `42.0–46.5 px` world height (`avg 44.67 px` total / `42.75 px` armor) and `Walk` measures `45.0–48.0 px` (`avg 46.81 px` total / `44.56 px` armor). `Unarmed Idle`/`Walk` measure `46.5–48.0 px` (`avg 47.38–47.56 px`).
   - Previous `getLocomotionArtworkScale()` ratios inflated running frames and caused mid-cycle swelling:
     - **Armed Run (`0.80 × 1.50 = 1.20`):** Reached `49.2 px` (`down f0`) and `51.6 px` (`up f6/f9`, `+20%` peak vs `armed_idle_up` `42.0–46.5 px`), causing Meliodas to appear larger upon starting an armed run.
     - **Unarmed Run (`0.68 × 1.50 = 1.02` on frames `1..6`, `0.78 × 1.50 = 1.17` on frames `7..12`):** Frame 0/4 started oversized (`49.98 px` down, `51.00 px` up), then Pass 2 (`f7..12`) swelled `+14.7%` in sprite scale (`85.68×73.44 px` → `98.28×84.24 px`, peaking at `52.65 px` on `unarmed_run_right_7` and `51.48 px` on `left`/`up`) before snapping back to `1.02` on repeat (`f1`).
2. **Texture-guarded event listeners and two-step phase sync in `BlackKnightPlayer.ts`:**
   - `ANIMATION_UPDATE` only invoked `syncBodyFootAnchor()` when `this.texture.key === BLACK_KNIGHT_CONVERSION_MOTION_KEY`, and `ANIMATION_REPEAT` was not bound to `syncBodyFootAnchor()`.
   - `playWalkOrRunAnim()` called `this.play(targetKey)` (starting at frame `0` scale) followed by `this.anims.setCurrentFrame(targetAnim.frames[frameIdx])`, emitting two frame/scale transitions during `Walk → Run`.
   - `getLocomotionArtworkScale()` only matched `wayfarer/satyr_(run|unarmed_run)_*` animation keys without matching frame names (`armed_run_sequence_`, `unarmed_run_sequence_`, or `80×72` conversion roll frames).

---

## 3. IMPLEMENTED FIX

### `src/config/Constants.ts`
Preserved `WAYFARER_BASE_SCALE = 1.50`, physics body constants (`WAYFARER_BODY_WIDTH = 18`, `WAYFARER_BODY_HEIGHT = 12`), and movement speeds (`PLAYER_WALK_SPEED = 85`, `PLAYER_SPRINT_SPEED = 140`), adding normalized conversion-motion multipliers:
- `WAYFARER_ARMED_RUN_SCALE_RATIO = 0.76` (`1.14` world scale -> `avg 44.91 px` total / `43.49 px` armor across 4 directions)
- `WAYFARER_UNARMED_RUN_PASS1_SCALE_RATIO = 0.66` (`0.99` world scale for `f1..f6` -> `avg 46.08 px` total / `44.92 px` armor)
- `WAYFARER_UNARMED_RUN_PASS2_SCALE_RATIO = 0.74` (`1.11` world scale for `f7..f12` -> `avg 45.93 px` total / `44.68 px` armor, eliminating the `1.02 → 1.17` pop)
- `WAYFARER_CONVERSION_ROLL_SCALE_RATIO = 0.75` (`1.125` world scale guard for `80×72` conversion roll frames)

### `src/entities/BlackKnightPlayer.ts`
- Bound `syncBodyFootAnchor()` unconditionally to `ANIMATION_START`, `ANIMATION_UPDATE`, and `ANIMATION_REPEAT`.
- Updated `getLocomotionArtworkScale()` to match both animation keys and `this.frame?.name` (`armed_run_sequence_`, `unarmed_run_sequence_`, `armed_roll_sequence_`, `unarmed_roll_sequence_`) with fallback frame-index parsing from frame names, applying the normalized ratios above.
- Updated `playWalkOrRunAnim()` to pass `{ key: targetKey, startFrame: frameIdx }` directly to `this.play(...)` instead of two-step `play()` + `setCurrentFrame()`, and called `this.syncBodyFootAnchor()` immediately after playback updates in `safePlayAnim()` and `playWalkOrRunAnim()`.

### Preserved Non-Regression Guarantees
- `WAYFARER_BASE_SCALE = 1.50`, `WAYFARER_BODY_WIDTH = 18`, `WAYFARER_BODY_HEIGHT = 12` world physics box & bottom foot anchor preserved identically.
- Camera zoom (`2.2`), Walk speed (`85`), Sprint speed (`140`), Idle timing (`160 ms/frame`), combat timings, quests/endings, and `BUG-059` untouched.
- Zero scale tweens introduced; `BlackKnightAnimations.ts` frame counts and `ARMED_IDLE_FRAME_MS = 160` preserved.

---

## 4. VERIFICATION SUMMARY

| Check / Suite | Scope | Result |
|---|---|---|
| `npm run check` (`tsc --noEmit`) | TypeScript compilation | PASS (exit `0`) |
| `npm run verify:data` | Items, recipes, dialogues, quests, lore, registry | PASS (`15/15`) |
| `npm run build` | Production bundle (`tsc && vite build`) | PASS (exit `0`) |
| B01 Playwright Verification (`verify_b01_full.py`) | 4 dirs Armed & Unarmed Walk/Run + Combat/Defense (`Attack`, `Roll`, `Parry`) -> Run; `PRERENDER`/`START`/`UPDATE`/`REPEAT` telemetry | PASS (`9/9` scenarios, `0` violations, `0` console/page errors; `body = 18×12`, `camZoom = 2.2`, `idleMsPerFrame = 160`) |
| `tests/hw_bug_21b_walk_run_verification.py` | 4-dir Walk (`85`), Sprint (`140`), Shift release, key-repeat, IME/blur, pause modal, Armed/Unarmed, combat smoke | PASS (`10/10` tests) |
| `tests/hw_bug_26b_walkrun_fix_verification.py` | Shift watchdog, collision guardrail, sprint resume, action locks, Save Schema 3 | PASS (`5/5` suites) |

---

## 5. DELIVERABLES & EVIDENCE ARTIFACTS

- Telemetry evidence (`Read/V1.5/Reports/Evidence/HW-V16-B01/`):
  - `baseline_repro_probe.json`
  - `baseline_repro_full.json`
  - `edge_cases_probe.json`
  - `post_fix_verification.json`
- Visual strips (`Read/V1.5/Reports/Visuals/HW-V16-B01/`):
  - `b01_before_after_sprite_comparison.png`
  - `b01_live_gameplay_strip_armed.png`
  - `b01_live_gameplay_strip_unarmed.png`
- Final report: `Read/V1.5/Reports/V16/HW_V16_B01_BUG058_SCALE_REPORT.md`
