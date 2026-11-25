# HW-H4-08 — SAVE INTEGRITY & TEST HARNESS HARDENING REPORT

- **Project:** HOLLOW WOODS (`V1.5.4`)
- **Branch:** `feat/v1.5.3-ag-world-polish` (HEAD `0617668a97f462877cbe2c30d304323e8fd48f6e` + uncommitted HW-H4-01..08 working tree)
- **Protocol:** `HYDRO HIGH ENGINEERING PROTOCOL V4` (including `HW-H4-08-R1` Quota Recovery)
- **Git Commit / Push:** None (`0 git commit`, `0 git push` — Hard Stop respected)

---

## 1. Save Integrity Bugs Reproduced & Fixed (Zero Save Schema Changes)

Save Schema version `3` (`saveVersion: 3`, `saveSchemaVersion: 3`) was preserved untouched across `SaveManager` and `CloudSaveService`.

| # | Defect Reproduced on Baseline (`dist/`) | Baseline Evidence ([hw_h4_08_save_baseline.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_save_baseline.json)) | Root Cause & Exact Fix | Verified After Fix ([hw_h4_08_save_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_save_after.json)) |
| --- | --- | --- | --- | --- |
| 1 | `unlockedLoreIds` dropped on Continue & Legacy load | `before_save.loreIds` had `4` IDs → `after_continue.loreIds` reset to `["lore_three_rules"]`; `after_legacy_v13.loreIds` dropped `"lore_runestones"` | `SaveManager.applySaveToState()` never restored `data.unlockedLoreIds`. Added [PlayerState.restoreUnlockedLore()](file:///g:/HOLLOW%20WOODS/src/state/PlayerState.ts#L735-L753) and called it in [SaveManager.applySaveToState()](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L718-L720) (with null-safe `equippedSlots` fields at [SaveManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L676-L683)). | `continue_lore_restored: true` (all 5 unlocked IDs restored); Legacy V1.3 restores `["lore_three_rules", "lore_runestones"]`. |
| 2 | `activeWeapon`, `campfireLevel`, `campfireFuel` leaked across `New Game` / `Restart` | `after_new_game.activeWeapon` stayed `"wpn_iron_spear"`, `campfireFuel` stayed `110.26` | [PlayerState.reset()](file:///g:/HOLLOW%20WOODS/src/state/PlayerState.ts#L157-L163) omitted resetting `campfireLevel = 1`, `campfireFuel = 180`, and `activeWeapon = 'wpn_walking_staff'`. Added explicit reset defaults. | `restart_clean_reset: true`, `new_game_clean_and_no_stale_debounce: true` (`activeWeapon: "wpn_walking_staff"`, `campfireLevel: 1`, `campfireFuel` ~`177–179`). |
| 3 | Production debounced save could resurrect/overwrite cleared saves | `cancelPendingGameSave()` was gated inside `if (QA_BUILD)` in `SaveManager.clearSave()` and `CloudSaveService.saveGameNow()`, and omitted in `GameScene.handleRestartGame()` | Moved `cancelPendingGameSave()` before `if (QA_BUILD)` in [SaveManager.clearSave()](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L771-L775) and [CloudSaveService.saveGameNow()](file:///g:/HOLLOW%20WOODS/src/services/CloudSaveService.ts#L354-L357); called `cancelPendingGameSave()` in [GameScene.handleRestartGame()](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1265-L1269). | Waiting `3.2s` past `2.5s` debounce window after `New Game` leaves `hasStaleSaveInLocalStorage: false`. |
| 4 | Legacy V1.3/V1.4 object-form `storageChest` & `quest_corrupted_knight_crest` dropped | `after_legacy_v13.chestHerbs: 0` (from `{ res_herbs: 3 }`) | Extended [CloudSaveService.migrateSaveSchema()](file:///g:/HOLLOW%20WOODS/src/services/CloudSaveService.ts#L169-L265) to accept plain-object `storageChest` maps and normalize `'quest_corrupted_knight_crest'` → `'quest_corrupted_crest'`. | `legacy_v13_compat: true`: `crest: 1`, `oldCrest: 0`, `chestHerbs: 3`, `wood: 4`, `garthFlag: true`, `currentQuestId: "Q02_MEET_NERIS"`. |
| 5 | `updateAct0Progression()` could regress higher quests on Continue | `before_save.currentQuestId: "Q03_PREPARE_RESOURCES"` regressed to `"Q01_MEET_EDDA"` | Guarded [GameScene.updateAct0Progression()](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L2674-L2679) with `canCompleteAct0` (`currentZoneId === 'fog_crossing' && !isQuestTaskCompleted('Q00_WAKE_UP', 't2') && currentQuestId === 'Q01_MEET_EDDA'`). | `after_continue.currentQuestId: "Q03_PREPARE_RESOURCES"` preserved cleanly. |

### 1.1 Production Backups, Final SHA-256 Checksums & HW-H4-06 Preservation

- **Backups stored in:** `Backups/steps/backup_hw_h4_08/` (`SaveManager.ts`, `CloudSaveService.ts`, `PlayerState.ts`, `GameScene.ts`, plus original copies of all 9 Python scripts in `Backups/steps/backup_hw_h4_08/scripts/`).
- **Verified Production SHA-256 (unchanged between `hw_h4_08_save_after.json` and `hw_h4_08_r1_extra_checks.json`):**
  - [PlayerState.ts](file:///g:/HOLLOW%20WOODS/src/state/PlayerState.ts): `074AF4187810CF7DB0E782AC2CA1280114AB53AF1E409362ECFA7857DAE206D3`
  - [SaveManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts): `7D637A1959449F6DAE19E189D7771386CEE3F84EE058E5177FD805425BFB0606`
  - [CloudSaveService.ts](file:///g:/HOLLOW%20WOODS/src/services/CloudSaveService.ts): `4CF6A9887F8CD69F5FED710FB06C5355480FB2598954A38A568186551BD64EF2`
  - [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts): `86A3156ECF025251A7E86E725CD80A00616471BCAF9A0873320DD04207B79DF3`
- **HW-H4-06 / Core Protection:** [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts), [QuickCraftSidebar.ts](file:///g:/HOLLOW%20WOODS/src/ui/QuickCraftSidebar.ts), [InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts), and [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts) were NOT modified by `HW-H4-08`; [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts) preserves `HW-H4-05` listener cleanup (`L973-L993`) and `HW-H4-06` World Node Culling / Cached Shadows hooks (`L1019`, `L6722-L6725`).

### 1.2 Save Domains Verified (`Save -> Reload -> Continue`, `Restart`, `New Game`, `Legacy V1.3`)

- **Save/Continue E2E (`13/13` assertions PASS in [hw_h4_08_save_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_save_after.json), `reused` across identical production SHA-256/build):**
  - Position & zone (`bellhollow`, `(820, 260)`)
  - Stats & resources (`hp`, `stamina`, `composure`, `lanternOil: 53`)
  - Vòng Sáng Hộ Tâm state (`isLanternOn: true` → Continue `true`; toggled `false` → Save → Reload → Continue `false`)
  - Inventory, equipped weapon/slots & storage chest (`res_dry_wood: 9`, `quest_corrupted_crest: 1`, `wpn_iron_spear`, `eqp_moss_cloak`, `eqp_trail_boots`, `mat_runed_iron: 4`)
  - Quest progression, boss flags & NPC/story flags (`Q03_PREPARE_RESOURCES`, `boss_hooded_knight_defeated`, `boss_mire_warden_defeated`, `talked_to_garth`, `choice_hooded_knight_resolve`)
  - Zones & campfire (`visitedZones` incl. `outer_woods`/`sanctuary_farm`, `unlockedZones` incl. `crooked_path`, `campfireLevel: 2`, `campfireFuel: 249`)
  - Lore unlocked (`5` lore IDs including `lore_mire_warden_memory`, `lore_runestones`)
  - Settings persistence (`masterVolume: 0.45`, `graphicsQuality: "MEDIUM"`, `reducedMotionEnabled: true`, `screenShakeEnabled: false`, `screenFlashEnabled: false`)
  - Clean `Restart`, `New Game` past `3.2s` debounce (`hasStaleSaveInLocalStorage: false`), Legacy V1.3 compat, `0` page/console errors.
- **Depleted Resource Nodes E2E ([hw_h4_08_r1_extra_checks.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_r1_extra_checks.json)):**
  - `node_wood_1` and `node_herb_1` marked depleted → Save → Reload → Continue: `d1: true`, `d2: true`, `n1Visible: false`, `n1Available: false` → `Restart`: reset to `d1: false`, `d2: false`.
- **CloudSave / LocalSave Priority (`test_cloud_priority.mjs` on real `CloudSaveService.ts`):**
  - Exit `0` (`CLOUD_LOCAL_PRIORITY_PASS`): verified newer `localSave` (`updatedAt: 2000`) wins over older `cloudSave` (`1000`), and newer `cloudSave` (`3000`) wins over older `localSave` (`2000`) and mirrors to `localStorage`.

---

## 2. Test Harness Audit & Hardening Summary

### 2.1 Why Scripts Could Previously Report False PASS & Changes Applied

1. **Missing exit codes / missing fail-fast (`#12`, `26B`):**
   - [test_hw_bug12_hotfix_regression.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug12_hotfix_regression.py) previously had zero `assert`/`sys.exit(1)`, swallowed port `5263` bind errors, and lacked `pageerror`/`requestfailed` tracking and `try/finally` cleanup. Hardened with ephemeral port, error listeners, strict Part A/B/C/D assertions, and `sys.exit(0 if overall_pass else 1)`.
   - [hw_bug_26b_walkrun_fix_verification.py](file:///g:/HOLLOW%20WOODS/tests/hw_bug_26b_walkrun_fix_verification.py) lacked Chrome→Edge fallback, `pageerror`/`console.error` fail-fast, `try/finally` cleanup, and used fixed `time.sleep(0.8)` in Test 2 (replaced with deterministic `wait_for_function` polling without weakening the 250ms collision guardrail assertion).
2. **Silent errors & assertion blind spots (`#13`–`#19`):**
   - Added Chrome→Edge fallback (`chrome.exe` is absent on this host; `msedge.exe` is used), ephemeral `TCPServer(..., 0)` port, `pageerror`/`console.error` fail-fast, and `try/finally` cleanup with guaranteed JSON flush.
   - Closed specific assertion gaps: `#14` Test 6 checks `boundsContainPlayer`; `#15` checks `nerisBypass`, `bramCourtyardOpen`, and (fixed in `HW-H4-08-R1`) `staticBodies.size > 0` + deterministic `__hw15PrevPlayer` reload wait instead of buggy `.length == 0`; `#16` checks `initialCullable > 0`; `#17` Test 6 checks cleared flags/weapon/zones; `#19` computes real `isStuck` instead of hardcoded `False` and checks `map_route['badgeFound']`.
3. **Strict Network Error Classification (`#13`, `#14`, `#15`, `#16`, `#18`):**
   - Added `page.on("response")` (`http_errors` catching HTTP `status >= 400`, non-`p2game`) AND strict `_on_request_failed` classification: ONLY `req.resource_type == "media"` AND `"ERR_ABORTED"` in `req.failure` AND URL matching the 5 verified `BGM_MANIFEST` streaming MP3 paths in `dist/assets/audio/bgm/` (`knights_quiet_fire.mp3`, `embervale.mp3`, `beyond_the_hills.mp3`, `evergrove.mp3`, `forgotten_orchard.mp3`) is classified into `abortedAudioRequests` (`url`, `method`, `resource_type`, `failure`, `timestamp_iso`, `elapsed_s`, `reason`) caused by `AudioManager.stopBGM()` cancelling in-flight HTML5 `<audio>` byte streams during rapid zone switches or reload/close.
   - Any HTTP `>= 400`, any non-BGM `ERR_ABORTED`, or any other `requestfailed` stays in `failedRequests` / `httpErrors` and fails the run (`exit=1`).
4. **Static Audit of Helper Scripts:**
   - [test_v153_save_schema3.mjs](file:///g:/HOLLOW%20WOODS/scripts/test_v153_save_schema3.mjs): **True Unit Test** bundling live `CloudSaveService.ts` via `esbuild`.
   - [verify_v15_27_performance_and_save_compatibility.mjs](file:///g:/HOLLOW%20WOODS/scripts/verify_v15_27_performance_and_save_compatibility.mjs): **Static check + mocked sanitizer** (`mockSanitizeAndMigrate` at L101 rather than importing `SaveManager.ts`); documented honestly as not being a live runtime E2E check.

### 2.2 Negative Fail-Fast Verification (Isolated in Scratch Dir)

| Negative Scenario | Fault Injected (Isolated Scratch Copy) | Observed Exit Code | Observed Failure Output |
| --- | --- | --- | --- |
| `negative_pageerror_bug12` | Synthetic uncaught Error `HW_H4_08_SYNTHETIC_FAILURE` via `add_init_script` | **`1`** | `PageErrors=1, ConsoleErrors=1, OVERALL RESULT: FAIL` |
| `negative_badge_false_bug19` | Business assertion `map_route['badgeFound']` forced `False` | **`1`** | `STAGE4 PASS: False`, `OVERALL RESULT: FAIL` |
| `negative_http_404_bug16` | Real browser `fetch('/assets/nonexistent_asset_404_check.png')` returning HTTP 404 | **`1`** | `Console Errors: 1 \| HTTP Errors: 1`, `OVERALL RESULT: FAIL` |

---

## 3. Final Verification Matrix & Honest Test Classification

| Check / Script | Classification | Run Context / Evidence Source | Exit Code | Key Observed Metrics & Notes |
| --- | --- | --- | --- | --- |
| `npm run check` (`tsc --noEmit`) | Static type check | Current (`task-23596`, zero later TS edits) | `0` | `0` TypeScript errors |
| `npm run verify:data` | Static data integrity | Current (`task-23596`) | `0` | `15/15 PASS` |
| `node scripts/test_v153_save_schema3.mjs` | Unit test (live `CloudSaveService.ts` + mock storage) | Current (`task-23596`) | `0` | `2/2` suites PASS |
| CloudSave/LocalSave timestamp priority | Unit test (live `CloudSaveService.ts` + mock storage) | Current (`task-23652`, [hw_h4_08_r1_extra_checks.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_r1_extra_checks.json)) | `0` | `CLOUD_LOCAL_PRIORITY_PASS` |
| `npm run build` (`tsc && vite build`) | Production build | Current (`task-23596`, zero later TS edits) | `0` | `dist/assets/index-B48zhYTu.js` |
| `python -m py_compile` (all 9 `.py` scripts) | Static Python syntax check | Current (`task-23652`, after last `.py` edit) | `0` | `9/9` compiled clean |
| Save/Continue/Restart/NewGame/Legacy V1.3 E2E | Staged integration (`dist/`, Edge SwiftShader) | Reused (`task-23487`, identical production SHA-256, [hw_h4_08_save_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_save_after.json)) | `0` | `13/13` assertions PASS (`0` runtime errors) |
| Depleted resource nodes E2E (`Save -> Continue -> Restart`) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23640`, [hw_h4_08_r1_extra_checks.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-08/hw_h4_08_r1_extra_checks.json)) | `0` | `d1: true, d2: true, n1Visible: false` on Continue; reset to `false` on Restart |
| [test_hw_bug12_hotfix_regression.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug12_hotfix_regression.py) | Staged integration (`dist/`, Edge SwiftShader) | Reused (`task-23487`, unchanged build/script, [HW_BUG_12_REGRESSION_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_12_REGRESSION_DATA.json)) | `0` | Part D Prelim/Details + Parts A/B/C PASS (`0` errors, `0` failed requests) |
| [test_hw_bug13_camera_stability.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug13_camera_stability.py) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23605`, [HW_BUG_13_CAMERA_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_13_CAMERA_DATA.json)) | `0` | Cases A–F PASS; `0` failed requests, `0` HTTP `>=400`, `1` aborted BGM stream (`media`) |
| [test_hw_bug14_route_integrity.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug14_route_integrity.py) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23605`, [HW_BUG_14_ROUTES_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_14_ROUTES_DATA.json)) | `0` | Tests 1–6 PASS; `0` failed requests, `0` HTTP `>=400`, `6` aborted BGM streams (`media`) |
| [test_hw_bug15_collision_regression.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug15_collision_regression.py) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23652`, [HW_BUG_15_COLLISION_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_15_COLLISION_DATA.json)) | `0` | Cases A–E PASS (`staticBodies: 329 -> 329`, `ColliderGroup: 329 -> 329`); `0` failed requests, `0` HTTP `>=400`, `5` aborted BGM streams |
| [test_hw_bug16_map_rendering.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug16_map_rendering.py) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23605`, [HW_BUG_16_RENDER_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_16_RENDER_DATA.json)) | `0` | All 8 checks PASS (`cullable: 747`, `0` missing textures); `0` failed/HTTP errors, `2` aborted BGM streams |
| [test_hw_bug17_world_state_sync.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug17_world_state_sync.py) | Staged integration (`dist/`, Edge SwiftShader) | Reused (`task-23487`, unchanged build/script, [HW_BUG_17_SAVE_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_17_SAVE_DATA.json)) | `0` | Tests 1–8 PASS; `0` errors / `0` failed requests |
| [test_hw_bug18_perf_benchmark.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug18_perf_benchmark.py) | Staged integration (CPU-constrained SwiftShader) | Current (`task-23605`, [HW_BUG_18_PERF_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_18_PERF_DATA.json)) | `0` | `170` frames, culling `0.226 ms/call` (`172` calls), `8.76 FPS` (**GPU NOT VERIFIED — SwiftShader CPU rasterizer**); `0` failed/HTTP errors, `3` aborted BGM streams |
| [test_hw_bug19_progression_playtest.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug19_progression_playtest.py) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23605`, [HW_BUG_19_PLAYTEST_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_19_PLAYTEST_DATA.json)) | `0` | Stages 1–4 PASS; `0` console/page/failed requests |
| [hw_bug_26b_walkrun_fix_verification.py](file:///g:/HOLLOW%20WOODS/tests/hw_bug_26b_walkrun_fix_verification.py) | Staged integration (`dist/`, Edge SwiftShader) | Current (`task-23605`) | `0` | `5/5` verification suites PASS (`saveSchemaVersion=3`) |
| Uninterrupted Minute-0 full playthrough + OS IME (`EVKey`/`UniKey`) + live P2Game backend auth sync | **Manual playtest / Not run** | Out of headless local `dist/` automation scope | **N/A** | Requires Owner/QA manual session on real Windows desktop/P2Game host |

---

## 4. Repository Cleanliness Check

- Root directory clean (`0` stray `.md`, `.bak`, `.zip`, or temp scripts).
- `scripts/temp/` verified empty (`0` files).
- `git diff --check` exited `0`.
