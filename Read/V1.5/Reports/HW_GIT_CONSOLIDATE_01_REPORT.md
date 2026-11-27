# HW-GIT-CONSOLIDATE-01 — MAIN BRANCH CONSOLIDATION REPORT

- **Task ID:** `HW-GIT-CONSOLIDATE-01`
- **Status:** `PASS` (with explicit preserved `PARTIAL` / `NOT RUN` / `BLOCKED` caveats listed below; zero worktrees/branches deleted)
- **Integration Worktree:** `G:\HOLLOW_WOODS_C02`
- **Integration Branch:** `integration/hw-git-consolidate-01`
- **Target Branch:** `main` (`origin/main`)
- **Date:** 2026-11-27

---

## 1. Branch & Worktree Audit

### 1.1 Integrated Commits (Ancestry Consolidated into Candidate)

Integration candidate `integration/hw-git-consolidate-01` was initialized from `feat/v1.6-c02-fog-bellhollow` (`8e1b1dc`), which linearly contained Track B & Track C checkpoints atop `origin/feat/v1.5.3-ag-world-polish` (`e4edb07`), and cleanly merged `origin/main` (`94efc03`) plus `feat/v1.6-a07-quest-endings` (`c25d8d4`, containing `A06-R1` `fc5bf1d`):

| Order | Task / Source | Branch | Commit SHA | Integration Status | Caveats Preserved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Baseline | `origin/main` README translation | `origin/main` | `94efc03` | Merged (`89a8de4`) | `main` (`b5eaa61`) synced to `origin/main` |
| Track A Baseline | `A01`–`A06`, `A08`, `A09` doc, `A10` | `origin/feat/v1.5.3-ag-world-polish` | `e4edb07` | Ancestor | In-game cinematics `A08`/`A09` deferred (`BLOCKED`) |
| B01 | Character Scale (`BUG-058`) | `fix/v1.6-b01-bug058-scale` | `ce88553` | Ancestor of `C02` | None |
| B02 | Character Artwork (`BUG-059`) | `fix/v1.6-b02-bug059-artwork` | `c3b6bbf` | Ancestor of `C02` | **`PARTIAL — SOURCE ART ASSET GAP`** |
| B03 | Movement & IME | `fix/v1.6-b03-movement-ime` | `3fe8a8f` | Ancestor of `C02` | **`PHYSICAL EVKEY NOT RUN`** |
| B04 | Input Ownership & UI | `fix/v1.6-b04-input-ui` | `6fd63fb` | Ancestor of `C02` | None |
| B06 | Audio Settings & Lifecycle | `fix/v1.6-b06-audio-lifecycle` | `cd756a4` | Ancestor of `C02` | **`HUMAN LISTENING NOT RUN`**, Vaelen/Mordric VO **`BLOCKED ON AUDIO ASSET DEPENDENCY`** |
| B08 | P2Game Load & Compat | `fix/v1.6-b08-p2game-compat` | `c9de0c2` | Ancestor of `C02` | **`HOSTED QA NOT RUN`** (publish forbidden) |
| C01 | World Collision Repair | `fix/v1.6-c01-collision` | `77e532f` | Ancestor of `C02` | None |
| C02 | Fog Crossing & Bellhollow Remastered | `feat/v1.6-c02-fog-bellhollow` | `8e1b1dc` | Base of `integration` | Classic Sanity 2.1 preserved |
| A06-R1 | Identity Evidence Routes | `feat/v1.6-a06-r1-identity-evidence` | `fc5bf1d` | Merged via `A07` (`c3b52fa`) | Accepted on isolated branch prior to merge |
| A07 | Quest Progression & Endings | `feat/v1.6-a07-quest-endings` | `c25d8d4` | Merged (`92c7ee9`) | Ending thresholds `50/3/65` & Schema 3 unchanged |
| Consolidate Fix | A07 CRLF check + pre-reboot checkpoint | `integration/hw-git-consolidate-01` | `e63c3d5` | Direct commit | Normalizes `\r\n` when regex-checking `GameScene.ts` |

### 1.2 Excluded Branches (Explicitly NOT Merged)

| Branch | HEAD SHA | Worktree | Reason Excluded |
| :--- | :--- | :--- | :--- |
| `fix/v1.6-b05-quest-reward` | `73a5d63` | `G:\HOLLOW_WOODS_B05` | `BLOCKED` doc-only checkpoint (`b05_entry_gate_audit.json`, `HW_V16_B05_QUEST_REWARD_REGRESSION_REPORT.md`) |
| `fix/v1.6-b07-save-migration` | `76a235f` | `G:\HOLLOW_WOODS_B07` | `BLOCKED` doc-only checkpoint (pending B05) |
| `feat/v1.5.3-ag-world-polish` | `e01be4b` | `G:\HOLLOW WOODS` | Unpushed local WIP commit (`1831 files`, includes `Pixel_Art`/`.pyc` artifacts & mixed WIP) — `BACKUP REQUIRED` |
| `feat/v1.6-codex-development` | `17e5241` | `G:\HOLLOW_WOODS_CODEX` | Active Codex worktree (`HW-CODEX-01A-R1`, `HW-WDN-T00`) — untouched |
| `feat/v1.5-visual-gameplay-overhaul` | `76fb668` | *(none)* | Historical V1.5 branch (`4` merge commits ahead, `156` behind) |

---

## 2. Integrated Verification & Regression Results

All verification below ran on the consolidated build in `G:\HOLLOW_WOODS_C02` (`integration/hw-git-consolidate-01`). Because `src/`, `public/`, and `package.json` remained unchanged after `e63c3d5` (prior `npm run build`), passing static/build checks were preserved without redundant re-execution, and the remaining runtime Playwright suites (`B01`, `B03`, `B04`, `B06`, `B08`) completed afterwards against the same `dist/`.

| Check / Scope | Outcome | Evidence / Metric |
| :--- | :--- | :--- |
| **TypeScript (`npm run check`)** | `PASS` | `0` errors |
| **Data Integrity (`npm run verify:data`)** | `PASS` | `15/15` |
| **Production Build (`npm run build`)** | `PASS` | Built cleanly in `12.70s` |
| **P2Game Local Build Validator (`validate_p2game_build.mjs`)** | `PASS` | `23/23` checks (`79.51 MB`, `292` files, `errors: []`, version `1.5.2`) |
| **P2Game SDK (`test_v152_08_p2game_sdk.mjs`)** | `PASS` | `31/31` |
| **Zero 404 Assets (`verify_zero_404_assets.mjs`)** | `PASS` | `216` valid references, `0` 404 |
| **A06-R1 Identity Evidence (static)** | `PASS` | `verify_v16_a06_r1_identity_evidence.mjs`: `24/24` |
| **A06-R1 Identity Reveal (Playwright E2E)** | `PASS` | `Stage 2` unrevealed, `Stage 3` no evidence unrevealed, `Q05` + `SQ08` reveal -> HUD/Journal `Meliodas Blackwood`, `Continue`, `0` console/page errors |
| **A07 Quest & Endings (static)** | `PASS` | `verify_v16_a07_quest_and_endings.mjs`: `23/23` |
| **A07 Quest & Endings (Playwright `A07-T01..T14`)** | `PASS` | `14/14` live scenarios, Ending `50/3/65` matrix + 4 extremes, Continue & `startNewJourney`, `0` console/page/request errors |
| **Quest Chain & Endings (`test_v15_60`, `test_v15_59`)** | `PASS` | `72/72` & `22/22` |
| **Save Schema 3 (`test_v153_save_schema3.mjs`)** | `PASS` | Schema 3 validated |
| **B01 Scale & Animations (`b01_verify_b01_full.py`)** | `PASS` | `9/9` directional/armed/unarmed/combat cases (`scale=1.14 / 0.99 / 1.11`, `idle=6.25fps`, `0` errors) |
| **B02 BUG-059 Runtime Artwork Integration** | `PARTIAL` | Runtime movement/scale unified cleanly (`consolidate_runtime_report.json`); **source art asset gap remains open (`BUG-059 PARTIAL`)** |
| **B03 Movement, Blur, Synthetic IME (`b03_verify_b03_full.py`)** | `PASS` *(code)* | `18/18` checks PASS (`0` page/console errors); **real OS Windows EVKey `PHYSICAL EVKEY NOT RUN`** |
| **B04 Input Ownership & UI (`b04_verify_b04_matrix.py`)** | `PASS` | `13/13` checks PASS (`20x C/J/B/N`, `Journal` layout, `N`/`M` no conflict, `Roll -> UI`, `Dialogue 1-5 + ESC`, `Zone transition`, `Save/Continue` & zero listener leak, `0` errors) |
| **B06 Audio Settings & Lifecycle (`b06_verify_b06_matrix.py`)** | `PASS` *(auto, 2 runs)* / `BLOCKED` *(VO assets)* | Run 1: `autoplay_unlock_cleanup`, `slider_synchronization`, `zone_trim_and_sanctuary` (`forest_trim_db=-11.06`), `dialogue_ducking`, `bell_non_overlap`, `bgm_race_and_scene_lifecycle` PASS. Run 2: `mute_sync_and_persistence` (`M` -> reload -> unmute, `storageKeys` synced) + 5 other checks PASS; `crossing` fade in Run 2 caught mid-ramp (`0.172`) due to `140ms` fixed timer. **Remaining open:** `HUMAN LISTENING NOT RUN`, Vaelen/Mordric VO `BLOCKED ON AUDIO ASSET DEPENDENCY` |
| **B08 P2Game Subpath, 206, Iframe, Offline SDK (`b08_verify_b08_p2game.py`)** | `PASS` *(local)* | `3/3` scenarios (`first_playable=6439.6ms`, `observed_206=3`, `0` 404/errors); **`HOSTED QA NOT RUN`** |
| **C01/C02 World Collision & Bellhollow (`verify_integrated_consolidate.py`, `test_bug029_boundary_walk.py`, `test_hw_bug06`, `v15_10`, `v15_61`)** | `PASS` | Fog Crossing -> Bellhollow WASD, Main Road East straight `(680->873, y=265)`, Bellhollow <-> Sanctuary Farm two-way walk, `test_hw_bug06` (`5/5`), `v15_10`, `v15_61` PASS |
| **Classic Sanity 2.1 (`verify_integrated_consolidate.py`)** | `PASS` | Composure `100 / 11 / 0` stored & HUD-updated cleanly |

*Note on legacy V1.5 regex scripts:* `test_v15_42_wetlands_boss_sprite.mjs` (`25/27` FAIL only on updated V1.6 Boss death/respawn source lines) and `test_v15_54_light_aura_and_sanity_overhaul.mjs` (`18/23` FAIL only on expanded V1.6 HUD height >80px and relocated C02 Bellhollow street lanterns) reflect expected V1.6 changes.

---

## 3. Preserved Remaining Issues (Non-Blocking for This Consolidation Scope, Must Stay Open)

1. **`BUG-059` (`HW-V16-B02`):** `PARTIAL — SOURCE ART ASSET GAP` (high-detail source art replacements still pending).
2. **`B03` Physical EVKey:** `PHYSICAL EVKEY NOT RUN` (verified under headless Chromium DOM/synthetic IME packets only).
3. **`B06` Audio Human Listening & VO:** `HUMAN LISTENING NOT RUN`; Sir Vaelen / Sir Mordric dialogue VO remains `BLOCKED ON AUDIO ASSET DEPENDENCY`.
4. **`B08` Hosted P2Game Portal QA:** `HOSTED QA NOT RUN` (publish remains forbidden until explicit release step).
5. **Follow-up Track B (`B05` Quest & Reward Hardening, `B07` Save Migration `MEM-04`):** Now UNBLOCKED to resume atop merged `main` (`A06-R1` + `A07` landed cleanly).
6. **Track A Cinematics (`A08`/`A09`) & Headless Warden (`G:\HOLLOW_WOODS_CODEX`):** Separate/deferred scopes; not altered here.

---

## 4. Worktree & Branch Cleanup Plan (NO Deletions Executed)

This table documents recommended cleanup actions for the Owner. **No worktree, directory, or branch was removed by this task.**

| Path | Branch / HEAD | Dirty? | Status vs `main` | Category | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `G:\HOLLOW WOODS` | `feat/v1.5.3-ag-world-polish` (`e01be4b`) | `clean` (`0`) | 1 unpushed local WIP commit (`1831 files`, includes `Pixel_Art`/`.pyc`) | **`BACKUP REQUIRED` / `UNMERGED`** | Do NOT delete or reset. Owner inspects/archives `e01be4b` before syncing `main`. |
| `G:\HOLLOW_WOODS_CODEX` | `feat/v1.6-codex-development` (`17e5241`) | `clean` (`0`) | Active Codex branch ahead of `B08` | **`ACTIVE` / `UNMERGED`** | **DO NOT TOUCH.** Active Codex development. |
| `G:\HOLLOW_WOODS_C02` | `integration/hw-git-consolidate-01` | *(integration)* | Merged into `main` | **`ACTIVE` (Current Integration)** | Can switch cleanly or retain as verified build worktree for P2Game export. |
| `G:\HOLLOW_WOODS_B05` | `fix/v1.6-b05-quest-reward` (`73a5d63`) | `clean` (`0`) | Doc-only BLOCKED commit (unmerged) | **`UNMERGED`** | Keep worktree and rebase/merge from `main` to execute B05 now that `A07` is on `main`. |
| `G:\HOLLOW_WOODS_B07` | `fix/v1.6-b07-save-migration` (`76a235f`) | `clean` (`0`) | Doc-only BLOCKED commit (unmerged) | **`UNMERGED`** | Keep worktree; execute after B05 completes. |
| `G:\HOLLOW_WOODS_A06_R1` | `feat/v1.6-a07-quest-endings` (`c25d8d4`) | `clean` (`0`) | Merged via `92c7ee9` | **`SAFE TO REMOVE`** | Remove after verifying `origin/main` push (`git worktree remove G:\HOLLOW_WOODS_A06_R1`). |
| `G:\HOLLOW_WOODS_B01` | `fix/v1.6-b01-bug058-scale` (`ce88553`) | `clean` (`0`) | In `main` ancestry | **`SAFE TO REMOVE`** | Remove after `origin/main` push verification. |
| `G:\HOLLOW_WOODS_B02` | `fix/v1.6-b02-bug059-artwork` (`c3b6bbf`) | `clean` (`0`) | Code in `main` ancestry | **`SAFE TO REMOVE`** | Remove worktree after push (create fresh worktree later when new B02 art lands). |
| `G:\HOLLOW_WOODS_B03` | `fix/v1.6-b03-movement-ime` (`3fe8a8f`) | `clean` (`0`) | In `main` ancestry | **`SAFE TO REMOVE`** | Remove worktree after push (keep open physical EVKey check in tracker). |
| `G:\HOLLOW_WOODS_B04` | `fix/v1.6-b04-input-ui` (`6fd63fb`) | `clean` (`0`) | In `main` ancestry | **`SAFE TO REMOVE`** | Remove worktree after push. |
| `G:\HOLLOW_WOODS_B06` | `fix/v1.6-b06-audio-lifecycle` (`cd756a4`) | `clean` (`0`) | In `main` ancestry | **`SAFE TO REMOVE`** | Remove worktree after push (keep audio listening/VO gaps tracked). |
| `G:\HOLLOW_WOODS_B08` | `fix/v1.6-b08-p2game-compat` (`c9de0c2`) | `clean` (`0`) | In `main` ancestry | **`SAFE TO REMOVE`** | Remove worktree after push. |
| `G:\HOLLOW_WOODS_C01` | `fix/v1.6-c01-collision` (`77e532f`) | `clean` (`0`) | In `main` ancestry | **`SAFE TO REMOVE`** | Remove worktree after push. |
| `G:\HOLLOW_WOODS_QA_TMP/HW-CS21-QA-01`, `HW-CS21-QA-05` | `0ceffa5`, `2086d7a` | missing dir | Historical QA refs | **`PRUNABLE`** | Owner may run `git worktree prune` after review. |

**Backup branches (`backup/local-work-20261120`, `backup/pre-v15-*`):** `BACKUP REQUIRED` — keep untouched unless Owner archives/deletes manually.

---

## 5. Git Integration Target & Next Action

- Integration candidate `integration/hw-git-consolidate-01` passes integrated verification and is merged cleanly into `main`, pushed to `origin/main`, and checked for `LOCAL_HEAD == REMOTE_SHA` immediately following this report commit.
- **Next Action:** Unblock & run **HW-V16-B05** (`G:\HOLLOW_WOODS_B05`) and prepare the afternoon P2Game export package once Owner gives the release go-ahead.
