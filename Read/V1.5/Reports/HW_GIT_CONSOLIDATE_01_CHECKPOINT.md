# HW-GIT-CONSOLIDATE-01 — PRE-REBOOT SAFE CHECKPOINT

- **Timestamp:** 2026-11-27T13:15:00+07:00
- **Worktree:** `G:\HOLLOW_WOODS_C02`
- **Branch:** `integration/hw-git-consolidate-01`
- **Status:** SAFE FOR REBOOT (Integration candidate preserved cleanly in Git; working tree clean after checkpoint commit; Playwright/Vite test processes stopped = 0)
- **Next Priority After Reboot:** Finish remaining B01/B03/B04/B06/B08 Playwright verification against unchanged `dist/`, finalize `Read/V1.5/Reports/HW_GIT_CONSOLIDATE_01_REPORT.md`, merge cleanly into `main` & push `origin/main`, then prepare P2Game release workflow.

## 1. Integration Candidate Lineage Preserved

Started from `feat/v1.6-c02-fog-bellhollow` (`8e1b1dc`) — which already linearly contains `B01` (`ce88553`), `B02` (`c3b6bbf`), `B03` (`3fe8a8f`), `B04` (`6fd63fb`), `B06` (`cd756a4`), `B08` (`c9de0c2`), `C01` (`77e532f`), and `C02` (`8e1b1dc`) — and cleanly merged:
1. `89a8de4` — `Merge remote-tracking branch 'origin/main' into integration/hw-git-consolidate-01` (includes `94efc03 Update title translation in README.md`)
2. `92c7ee9` — `Merge branch 'feat/v1.6-a07-quest-endings' into integration/hw-git-consolidate-01` (includes `A06-R1` `fc5bf1d` and `A07` `c25d8d4`)
3. Checkpoint commit (this commit) adding:
   - `scripts/verify_v16_a07_quest_and_endings.mjs` (CRLF line-ending normalization for `src/scenes/GameScene.ts` static check)
   - `Read/V1.5/Reports/HW_GIT_CONSOLIDATE_01_CHECKPOINT.md`

### Excluded Branches / Worktrees (Preserved Untouched)
- `fix/v1.6-b05-quest-reward` (`73a5d63`, `G:\HOLLOW_WOODS_B05`) — BLOCKED doc-only checkpoint
- `fix/v1.6-b07-save-migration` (`76a235f`, `G:\HOLLOW_WOODS_B07`) — BLOCKED doc-only checkpoint
- `feat/v1.5.3-ag-world-polish` (`e01be4b`, `G:\HOLLOW WOODS`) — Unpushed WIP commit (`1831 files`, includes `Pixel_Art`/`.pyc` — `BACKUP REQUIRED`)
- `feat/v1.6-codex-development` (`17e5241` / `7a55391`, `G:\HOLLOW_WOODS_CODEX`) — Active Codex worktree (untouched)

## 2. Completed Checks on Integrated Build (`G:\HOLLOW_WOODS_C02`) — DO NOT RE-RUN IF SOURCE UNCHANGED

### Build, TypeScript, Data & Static Suites (ALL PASSED)
- `npm run check`: **PASS** (`0` errors)
- `npm run verify:data`: **PASS** (`15/15`)
- `npm run build`: **PASS** (`12.70s`)
- `node scripts/validate_p2game_build.mjs`: **PASS** (`23/23`, `totalMB: 79.51`, `fileCount: 292`, `errors: []`)
- `node scripts/verify_v16_a06_r1_identity_evidence.mjs`: **PASS** (`24/24`)
- `node scripts/verify_v16_a07_quest_and_endings.mjs`: **PASS** (`23/23`)
- `node scripts/test_v153_save_schema3.mjs`: **PASS**
- `node scripts/test_v15_60_quest_chain_restructuring.mjs`: **PASS** (`72/72`)
- `node scripts/test_v15_59_ending_screen_and_branching.mjs`: **PASS** (`22/22`)
- `node scripts/verify_zero_404_assets.mjs`: **PASS** (`216` valid, `0` HTTP 404)
- `node scripts/test_v15_61_pixel_art_trees_and_village_clean.mjs`: **PASS**
- `node scripts/verify_v15_10_bellhollow_buildings.mjs`: **PASS**
- `node scripts/test_v152_08_p2game_sdk.mjs`: **PASS** (`31/31`)

### Runtime Playwright Suites Completed on Integrated Build
- `python scripts/test_hw_bug06_interaction_anchors.py`: **PASS** (`5/5` TC1..TC5, Save/Continue, `0` console errors)
- Integrated smoke/regression (`C:\Users\Kyoshiro\.gemini\antigravity\brain\dc0f9c86-d78f-43b6-895c-34fe12680156\scratch\verify_integrated_consolidate.py`, report saved in `consolidate_runtime_report.json`): **PASS 100%** (B01/B02 Black Knight `scale=1.5` & textures, B03 move + blur stop, C01/C02 Fog Crossing -> Bellhollow WASD + Main Road East straight to `x=873, y=265`, B04 `[C]`/`[ESC]`/`[N]` Map/no-mute-conflict, B06 `[M]` mute sync, Classic Sanity 2.1 `100/11/0`, A06-R1 Q05 reveal + A07 ending thresholds, Save/Continue, `0` console/page/HTTP>=400 errors). Note: in low-FPS headless SwiftShader (~8-11 FPS), zone auto-sheathe 400ms Phaser timer takes ~2.5s wall time while `_isTogglingWeapon` has `_actionLockTimestamp = 0`.
- `a06_r1_test_hw_v16_a06_r1_with_a07.py` (saved to `scratch\consolidate_runs\out\a06_r1\hw_v16_a06_r1_playwright_results.json`): **PASS** (`EXIT=0`, `0` console/page errors)
- `a07_test_hw_v16_a07_run.py` (saved to `scratch\consolidate_runs\out\a07\hw_v16_a07_playwright_results.json`): **PASS** (`A07-T01..T14`, `EXIT=0`, `0` console/page errors)
- `python scripts/test_bug029_boundary_walk.py`: Two-way boundary walk **PASS** (`Bellhollow <-> Sanctuary Farm`, note port `5198` `WinError 10013` only affected internal listener because prior server wasn't needed/bound; verify cleanly on free port only if desired).
- `b04_verify_b04_matrix.py` partial run (saved to `scratch\consolidate_runs\out\b04\after_b04_verification.json`): `10/11` B04 functional subchecks **PASS** with `0` page/console errors; `save_load_continue_and_zero_listener_leak` was interrupted by user-requested task cancellation.

### Legacy V1.5 Static Scripts Notes (V1.6 Differences Expected)
- `node scripts/test_v15_42_wetlands_boss_sprite.mjs`: `25 PASS / 2 FAIL` (Boss death/respawn lines refactored for V1.6)
- `node scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs`: `18 PASS / 5 FAIL` (HUD height >80px & Bellhollow C02 lantern coords updated)

## 3. Remaining Work After Reboot

1. **Complete remaining runtime Playwright suites against unchanged `G:\HOLLOW_WOODS_C02\dist`** (update `b01_verify_b01_full.py` & `b03_verify_b03_full.py` in `scratch\consolidate_runs\` to serve `dist/` via ephemeral `HTTPServer(('127.0.0.1', 0), ...)` instead of fixed `npx vite preview` ports `4180`/`4186`):
   - `b01_verify_b01_full.py` (B01 scale & combat animations)
   - `b03_verify_b03_full.py` (B03 full IME/diagonal/blur/dialogue/crafting matrix)
   - `b04_verify_b04_matrix.py` (re-run cleanly to include `save_load_continue_and_zero_listener_leak`)
   - `b06_verify_b06_matrix.py` (AudioManager/SettingsManager/BGM race/listener cleanup)
   - `b08_verify_b08_p2game.py` (P2Game subpath `/games/hollow-woods/v1.5.2/`, HTTP 206, iframe host, offline SDK, error UI)
2. **Preserve Honest Open Caveats in Final Report (DO NOT mark PASS):**
   - `BUG-059`: `PARTIAL — SOURCE ART ASSET GAP`
   - `B03` Physical Windows EVKey: `PHYSICAL EVKEY NOT RUN`
   - `B06` Audio Human Listening: `HUMAN LISTENING NOT RUN` + Vaelen/Mordric VO `BLOCKED ON AUDIO ASSET DEPENDENCY`
   - `B08` Hosted P2Game Portal QA: `HOSTED QA NOT RUN`
3. **Publish `HW_GIT_CONSOLIDATE_01_REPORT.md` (with full Worktree Cleanup Plan — NO actual deletion of worktrees/branches), merge into `main`, push `origin/main`, verify `LOCAL_HEAD == REMOTE_SHA`.**
4. **Proceed to Owner's afternoon P2Game release priority once consolidation on `main` is verified.**
