# HW-V16-A07 — QUEST PROGRESSION & MULTIPLE ENDINGS FINAL ACCEPTANCE REPORT

- **Project:** HOLLOW WOODS (`V1.6.0 — THE UNBROKEN OATH`)
- **Roadmap Track:** `3.1` (`HW-V16-A07`)
- **Base & Accepted Dependency:** `e4edb07` (`origin/feat/v1.5.3-ag-world-polish`) merged cleanly with accepted **`HW-V16-A06-R1`** (`fc5bf1d5f849f694a6b92e270ef747b2f2914246` on `feat/v1.6-a06-r1-identity-evidence`)
- **Worktree / Branch:** `G:\HOLLOW_WOODS_A06_R1` (`feat/v1.6-a07-quest-endings`)
- **Ending Copy Draft Status:** **`DRAFT — PENDING OWNER APPROVAL`** ([`HW_V16_A07_ENDING_APPROVAL_DRAFT.md`](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/V16/HW_V16_A07_ENDING_APPROVAL_DRAFT.md)) — thresholds locked (`50 / 3 / 65`), no unapproved Ending/cinematic copy injected into runtime

---

## 1. Safe Integration Summary (`A06-R1` + `A07`)

Preserved **all** accepted `A06-R1` logic (`IdentityRevealResolver.ts`, `QuestSystem.ts`, `SaveManager.ts`, `UIScene.ts`, `promoteToMemoryStage3()`, `reconcileIdentityRevealState`, redaction) and **all** `A07` progression fixes across 4 `src/` files (`47 insertions(+), 44 deletions(-)` vs `fc5bf1d`), with zero `Pixel_Art/` or unrelated workspace changes committed:

1. **Atomicity & Routing of `npc_finn` (`SQ05_FINN_INTEL`) & `SQ08_PURIFY_FALLEN` ([`GameScene.ts`](file:///G:/HOLLOW_WOODS_A06_R1/src/scenes/GameScene.ts)):**
   - Routed `npc_finn` (`finn_rumors` -> `finn_chat`) via `talked_to_finn_rumors` and moved `SQ05_FINN_INTEL:t1` completion + `finn_talked` into the `dialogue_completed` listener.
   - Required `boss_hooded_knight_defeated` (rather than `quest_corrupted_crest` alone from `MAIN_PATH_Q05`) for `SQ08` completion and turn-in indicator (`getNPCQuestStatus`), moving `SQ08` task completion (`t1..t3`) and `promoteToMemoryStage3()` atomically into `dialogue_completed` (`campfire_knight_q3_completed`) so `ESC` cancel mid-dialogue never grants quest completion, reward charm, or reveal.
   - Combined `A06-R1` `wasRevealed` / `promoteToMemoryStage3()` / `justRevealed` guards inside `dialogue_completed` so both `MAIN_PATH_Q05` and `SIDE_PATH_SQ08` trigger the live `"⚔️ KHÔI PHỤC DANH TÍNH: Bạn là Meliodas Blackwood — The Wolf Lord!"` banner cleanly once without duplicate stage popups.
2. **Broken Bell Shrine Gating & Mire Warden / Clapper Guards ([`WorldGatingSystem.ts`](file:///G:/HOLLOW_WOODS_A06_R1/src/world/WorldGatingSystem.ts), [`PlayerState.ts`](file:///G:/HOLLOW_WOODS_A06_R1/src/state/PlayerState.ts), [`BossEncounterSystem.ts`](file:///G:/HOLLOW_WOODS_A06_R1/src/systems/BossEncounterSystem.ts), [`GameScene.ts`](file:///G:/HOLLOW_WOODS_A06_R1/src/scenes/GameScene.ts)):**
   - Narrowed `broken_bell_shrine` unlock strictly to `mire_root_seal_broken || shrine_bridge_lowered || clapper_collected` (solving `mire_pillars_solved` alone no longer unlocks Shrine or jumps `getStoryQuestId()` early to `Q06_RETRIEVE_CLAPPER`).
   - Added duplicate guards on `relic_heart_of_roots` (`!hasFlag('boss_mire_warden_defeated') && getItemCount('relic_heart_of_roots') === 0`) and removed premature `clapper_collected` / `quest_bronze_clapper` grant from `finishMireWardenDefeat()` so the clapper is collected only at the shrine altar (`collect_bell_tongue`).
   - Synchronized `broken_bell_shrine` boss trigger checks with `mire_root_seal_broken || shrine_bridge_lowered || mire_pillars_solved || mire_puzzle_solved`.

---

## 2. Verification Results (After Final Edit & Rebuild)

### Build, Static & Regression Suites
- `npm run check` (`tsc --noEmit`): **PASS** (`0` errors)
- `npm run verify:data`: **PASS** (`15/15`)
- `npm run build` (`vite build`): **PASS** (`10.43s`)
- `node scripts/verify_v16_a06_r1_identity_evidence.mjs`: **PASS (`24 PASS, 0 FAIL`)** — confirms `R1-T01..T14`, Case D legacy save sync, `MAIN_PATH_Q05` & `SIDE_PATH_SQ08`, redaction, Save Schema 3
- [`verify_v16_a07_quest_and_endings.mjs`](file:///G:/HOLLOW_WOODS_A06_R1/scripts/verify_v16_a07_quest_and_endings.mjs): **PASS (`23 PASS, 0 FAIL`)**
- `node scripts/test_v15_60_quest_chain_restructuring.mjs`: **PASS (`72/72`)**
- `node scripts/test_v153_save_schema3.mjs`: **PASS** (Save Schema 3 metadata, compatibility IDs, farming, round trip)
- `node scripts/verify_v15_16_story_and_dialogue.mjs`: **PASS**
- `node scripts/test_v15_59_ending_screen_and_branching.mjs`: **PASS (`22/22`)**
- `node scripts/test_v15_38_vaelen_rest_blessing.mjs`: **PASS (`12/12`)**

### Live Playwright E2E Verification (`A06-R1` Reveal + `A07-T01..T14`)
1. **Merged `A06-R1` Identity Reveal Regression (`test_hw_v16_a06_r1_with_a07.py` on freshly built `dist/`):**
   - **Errors:** `Console errors: 0, Page errors: 0`.
   - **Main Path (`MAIN_PATH_Q05`):** Reached Stage 3 without SQ08 -> stayed fail-closed -> inspected black knight stele -> popup `"⚔️ KHÔI PHỤC DANH TÍNH: Bạn là Meliodas Blackwood — The Wolf Lord!"`, HUD badge `"⚔️ Meliodas Blackwood"`, `lore_wayfarer_inner_journal` unlocked, Continue & Garth reverence (`garth_black_knight_reverence`) preserved.
   - **Side Path (`SQ08_PURIFY_FALLEN`):** Fresh run -> `boss_hooded_knight_defeated` + completed `campfire_knight_q3_complete` dialogue choice -> promoted atomically to Stage 3 via `promoteToMemoryStage3()` -> `matchedEvidenceRuleIds: ["SIDE_PATH_SQ08"]`, `sq08Completed: true`, popup `"⚔️ KHÔI PHỤC DANH TÍNH: Bạn là Meliodas Blackwood — The Wolf Lord!"`, `lore_wayfarer_inner_journal` unlocked.
   - **Live Ending Reveal Check:** Confirmed `true_ending` displays `"Meliodas Blackwood"` / `"The Wolf Lord"` when revealed.
2. **A07 Progression, Save/Load & Ending Matrix (`hw_v16_a07_playwright_results.json`):**
   - Evidence JSON: [`hw_v16_a07_playwright_results.json`](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Evidence/HW-V16-A07/hw_v16_a07_playwright_results.json) (`0` console errors, `0` page errors, `0` failed requests under HTTP `<400` check; initial teardown saw 3 SwiftShader mid-stream `<audio>` `ERR_ABORTED` on reload/restart for existing `knights_quiet_fire.mp3` before filtering teardown aborts).
   - Source diff against `fc5bf1d`: [`a07_source.diff`](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Evidence/HW-V16-A07/a07_source.diff) (`31,138` bytes).
   - **All `14` Playwright checks PASS:**
     - `A07-T01`: Start `Q01_MEET_EDDA` in `fog_crossing`, Finn `new` -> `finn_rumors` -> `none` (`finn_talked: true`, `talked_to_finn_rumors: true`, `SQ05_FINN_INTEL:t1: true`), East Gate unlocked -> `Q03_PREPARE_RESOURCES`.
     - `A07-T03 & T07`: Early `mire_pillars_solved` does NOT unlock Shrine (`shrineOpenJustFromPillars: false`, `storyAfterPillarsOnly: "Q03_PREPARE_RESOURCES"`); `quest_corrupted_crest` alone keeps `SQ08` indicator `'none'`; `collect_bell_tongue` before boss defeat triggers Mire Warden without granting clapper (`earlyClapper: false, earlyCount: 0`).
     - `A07-T02, T04 & T06`: Full Main Route reaches `Q06_RETRIEVE_CLAPPER` with `SQ08` skipped; double boss defeat grants exactly `1` `relic_heart_of_roots` (`clapperBeforeAltar: false`); double altar collect grants `1` `quest_bronze_clapper` and starts Act 5 escape chase.
     - `A07-T05`: `ESC` cancel mid `campfire_knight_q3_complete` leaves `completed: false`, `charms: 0`; double completion yields `completed: true`, `charms: 1`, `stage: 3`, `sq08Done: true`.
     - `A07-T08`: Save/Continue round-trip at `Q01_MEET_EDDA`, `Q05_SOLVE_MIRE`, `Q06_RETRIEVE_CLAPPER` preserves Schema 3 state & clapper inventory cleanly.
     - `A07-T09`: Exact `16`-case Ending Boundary Grid (`8 fog_loop_ending`, `7 sacrifice_ending`, `1 true_ending`) + `4` extreme cases (`[3,0,0]`, `[3,100,100]`, `[1,100,100]`, `[0,0,100]`) match Owner-locked thresholds (`composure >= 50 && stage >= 3 && trust >= 65`).
     - `A07-T10..T14`: Live [`01_true_ending.png`](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A07/01_true_ending.png), [`02_sacrifice_ending.png`](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A07/02_sacrifice_ending.png), [`03_fog_loop_ending.png`](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A07/03_fog_loop_ending.png) render cleanly, replay guard on `inspect_bell` holds, unrevealed Stage 3 stays fail-closed (`revealed: false`), Continue preserves `bell_rung`, and `startNewJourney()` cleanly resets (`bell_rung: false, stage: 0, quest: "Q01_MEET_EDDA"`).
