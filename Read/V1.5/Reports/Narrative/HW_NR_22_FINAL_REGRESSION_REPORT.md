# HW-NR-22 — FULL NARRATIVE & GAMEPLAY REGRESSION REPORT (`FINAL RELEASE GATE`)

- **Mission ID:** `HW-NR-22`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` (`FINAL QA & RELEASE GATE`)
- **Mode:** `READ-ONLY FINAL REGRESSION AUDIT` (`0` bug fixes applied during QA, `0` asset deletions, `0` release packaging, `0` commit/push)
- **Deliverable:** `Read/V1.5/Reports/Narrative/HW_NR_22_FINAL_REGRESSION_REPORT.md`
- **Test Evidence Files:**
  - Machine JSON Telemetry: [HW_NR_22_TEST_RESULTS.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW_NR_22_TEST_RESULTS.json)
  - Live Screenshots (`1280×720`, Production Build on `NVIDIA GeForce GTX 1070 Ti`): [01_main_menu.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/01_main_menu.png), [02_act0_fog_crossing.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/02_act0_fog_crossing.png), [03_bellhollow_dialogue.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/03_bellhollow_dialogue.png), [04_world_map_ui.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/04_world_map_ui.png), [05_journal_lore.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/05_journal_lore.png), [06_classic_sanity_low.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/06_classic_sanity_low.png)

---

## 1. Technical Gate Execution Summary

| Gate Command / Check | Scope | Result | Measured Output |
| :--- | :--- | :---: | :--- |
| `npm run check` (`tsc --noEmit`) | Full TypeScript codebase | **PASS** | `exit code 0` (`0` compile errors) |
| `npm run verify:data` | Items, Recipes, Dialogues, Quests, Registry, Lore | **PASS** | `15 / 15` checks passed (`43` items, `18` recipes, `92` registry, `29` lore) |
| `npm run build` (`tsc && vite build`) | Production bundle (`dist/`) | **PASS** | Built cleanly in `11.69s` (`vendor-phaser` `1,685.15 kB`, `index` `1,186.59 kB`, `game-data` `160.99 kB`) |
| `node scripts/verify_zero_404_assets.mjs` | `PreloadScene` & `AudioManager` paths | **PASS** | `212 / 212` valid, **`0` missing (`404`)** |
| `node scripts/verify_v15_16_story_and_dialogue.mjs` | Dialogue choices, `trustDelta`, `storyFlags` | **PASS** | `90 / 90` PASS (`0` FAIL) |
| `node scripts/test_v15_60_quest_chain_restructuring.mjs` | Main route `A → E → B → D → F → E → C` | **PASS** | `72 / 72` PASS (`0` FAIL) |
| `node scripts/test_v153_save_schema3.mjs` | Schema `3` compatibility & QA namespace | **PASS** | Passed schema & local round-trip assertions |
| `node scripts/verify_v15_20_multiple_endings.mjs` | Ending specs, thresholds & illustrations | **PARTIAL (`45/46`)** | `45 PASS / 1 FAIL` (`lore_ending_sacrifice` now uses *"Vòng Sáng Hộ Tâm"* instead of legacy regex *"ngọn đèn"*) |
| Live Production Preview (`vite preview` + Chrome GTX 1070 Ti) | Runtime `T01–T24`, console/HTTP, FPS, RAM, visuals | **PASS (Technical)** | `0` console errors, `0` page errors, `0` failed requests (`584` textures loaded, `59.95–59.96 FPS`) |

---

## 2. Full `T01–T24` Test Matrix Results

| ID | Test Area | Verdict | Concrete Verified Evidence & Reference |
| :---: | :--- | :---: | :--- |
| **`T01`** | New Game & Opening Cutscene | **PARTIAL / BLOCKED** | `startNewGame()` cleanly starts Act 0; Opening Prologue scene (`HW-NR-16`) blocked on `DEC-LOCK-20` + Menu spoiler at `MainMenuScene:797`. ([01_main_menu.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/01_main_menu.png)) |
| **`T02`** | Act 0 & Tutorial | **PASS** | `fog_crossing`, `startAct0Intro()`, Echo sprite at `(350,220)`, bronze bell, torn note `[E]`, Light Aura `[F]` all verified live. ([02_act0_fog_crossing.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/02_act0_fog_crossing.png)) |
| **`T03`** | Bellhollow NPC Dialogues | **PARTIAL** | All `59/59` dialogue keys open cleanly (`HW-NR-21`); Edda still contains legacy `"trở về thế giới của mình"` (`HW-NR-05` awaiting Owner sign-off); Finn routing bug (`finn_rumors` skipping `finn_chat`) open (`HW-NR-05`). ([03_bellhollow_dialogue.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/03_bellhollow_dialogue.png)) |
| **`T04`** | Sir Vaelen Progression | **PARTIAL** | Campfire `SQ06–SQ08`, Sanctuary music isolation & `Q05` functional; `q2 vs q3` lore conflict (`C02`) & `DLG-009/014/015` blocked (`HW-NR-06`). |
| **`T05`** | Sir Mordric Progression | **BLOCKED (Canon)** | Entity/Boss mapping `Sir Mordric = HoodedKnightBoss?` (`DEC-LOCK-09`) and `DLG-012..013` unsigned (`HW-NR-07`). |
| **`T06`** | Dialogue Choices | **PARTIAL** | `90/90` script PASS & mouse/keys `1–3` work live (`HW-NR-08`); choices lack one-time `trustDelta` guard & keys `4–5` for `campfire_knight_intro`. |
| **`T07`** | Lore Collection | **PARTIAL** | `29/29` unique entries (`verify:data`); `lore.json` still contains `"Sir Valen"` (`L85`), `Algiz` (`L78`), and `"hàng trăm năm"` (`L155`). |
| **`T08`** | Journal & Torn Pages | **PARTIAL** | Journal `[J]` opens cleanly (`open: true`), minor UI overlap observed visually between header `"DANH SÁCH CÁC HỒI"` and `[TẤT CẢ]` button; title at `JournalModal:909` still shows `"HIỆP SĨ ĐEN"`. ([05_journal_lore.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/05_journal_lore.png)) |
| **`T09`** | Memory Unlocks | **PARTIAL** | Monotonic `setMemoryAwakeningStage` prevents stage downgrade (`HW-NR-10`); `PlayerState:610-622` still early-unlocks `lore_wayfarer_inner_journal`, and `MEM-04` missing-lore backfill unimplemented. |
| **`T10`** | Identity Reveal | **FAIL (Canon)** | Early spoiler still active at `MainMenuScene:797`, `GameScene:4849`, `UIScene:1063`, `EvilKnights:833,839`; `Meliodas` (`0` hits) awaits `DEC-LOCK-07`. |
| **`T11`** | Main Quest Route | **PASS** | `A → E → B → D → F → E → C → A` (`72/72` + live `1→7` Chrome traversal with optional `SQ01–09` skipped) confirmed zero softlock (`HW-NR-19`). |
| **`T12`** | Quest Rewards | **PARTIAL** | `quest_purification_key` (`<=1`) & `quest_corrupted_crest` (`<=1`) guarded; `edda_rune_guide` repeats grant duplicate `eqp_bell_ward_charm` (`charmAfter2 = 2`, `HW-NR-19`). |
| **`T13`** | Boss Progression | **PASS (Baseline)** | `BossMireWarden` + `HoodedKnightBoss` baseline encounter hooks intact; post-`DEC-LOCK-09` Knight Boss upgrades unimplemented. |
| **`T14`** | Map Navigation & Collider | **PASS (Mechanics)** | Player moves cleanly via WASD (`x: 120 → 162.5`), `WorldGatingSystem` cleanly locks Stage `2/3` zones (`HW-NR-19`); World 2.0 `W20-BUG-001..010` queued on World track (`HW-NR-11`). |
| **`T15`** | World Map UI | **PARTIAL** | `[N]` opens `ParchmentWorldMapModal` cleanly (`open: true`, crisp parchment UI showing Bellhollow & Fog Crossing); node table currently displays **`10` zones** (`10/17`, missing expansion zones). ([04_world_map_ui.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/04_world_map_ui.png)) |
| **`T16`** | Classic Sanity 2.1 | **PARTIAL** | Visual 4-corner vignette + Hallucination apparition verified cleanly at `composure = 16` (`BUG-023` no center block); legacy whisper `'Satyr... quay lại đi...'` still present at `VeilSystem:44`. ([06_classic_sanity_low.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/06_classic_sanity_low.png)) |
| **`T17`** | Vòng Sáng Hộ Tâm | **PASS** | `[F]` toggles warm amber radial aura cleanly around Wayfarer without obscuring sprites/ground ([02_act0_fog_crossing.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-22/02_act0_fog_crossing.png)). |
| **`T18`** | Player Scale & Texture Clarity | **PASS (Baseline)** | `black_knight_armed_idle`, `scaleX = 1.5, scaleY = 1.5`, `pixelArt: true`, `roundPixels: true` verified live; `BUG-058`/`BUG-059` preserved for Codex per `HW-NR-15`. |
| **`T19`** | Audio Settings | **PARTIAL / BUG** | Mute, Sanctuary isolation, cooldowns & `stopAll()` pass (`HW-NR-18`); **Bugs:** `Music` slider (`setMusicVolume`) does not sync `bgmVolume`, `[M]` key does not sync `SettingsManager`, `ambience_forest.mp3` at `-12.8 LUFS`, `bell` `11.22s`, `V12.2` stems missing. |
| **`T20`** | Pause & Continue | **PASS** | `PauseModal`, full `page.reload()`, and `Continue` cleanly preserve state without replaying Act 0 (`HW-NR-20`). |
| **`T21`** | Save Compatibility | **PASS (with 1 Gap)** | `Schema 3` (`test_v153_save_schema3.mjs` + ephemeral `v1.3`/Mid/Post/Corrupt tests) passes; `MEM-04` Stage-3 missing lore backfill logged (`HW-NR-20`). |
| **`T22`** | Các Ending Hiện Hành | **PARTIAL** | All `3` Ending boundaries (`50/3/65`) work identically (`HW-NR-19`); `EndingSystem:1037` (`Satyr:` headlights) and `L78` (`hàng trăm năm`) await `DEC-LOCK-04/08/18`. |
| **`T23`** | Performance HIGH / MEDIUM | **PASS** | Measured on main game (`dist/` preview, **NVIDIA GeForce GTX 1070 Ti**): `HIGH` = **`59.95 FPS`** (`avg 16.68 ms`, `p95 16.8 ms`, `max 16.9 ms`), `MEDIUM` = **`59.96 FPS`** (`avg 16.68 ms`, `p95 16.8 ms`, `max 16.9 ms`); heap `241.24 → 246.15 MB` (`+4.91 MB`) across `6` modal toggles; `0` console/404 errors. |
| **`T24`** | Final Narrative Consistency | **FAIL (Blocked Gate)** | `Drager = 0` (`PASS`), but `32+` legacy residue items (`Satyr:`, `Algiz`, `Chỉ Huy`, `Sir Valen`, `trăm năm`, `dầu thông`) remain in `dist/` until Owner signs `DEC-LOCK-01..20` (`HW-NR-21`). |

---

## 3. Consolidated Bug & Gap Inventory Discovered/Confirmed During QA (`Do NOT Self-Fix`)

1. **[P0 Canon / Narrative]** `32` legacy text/lore/ending residues (`Satyr:` at `EndingSystem.ts:1037` & `VeilSystem.ts:44`; `Algiz` self-seal; `Chỉ Huy` spoilers at `MainMenuScene.ts:797`, `GameScene.ts:4849`, `EvilKnights.ts:833,839`; `"hàng trăm năm"`; `"Sir Valen"`) await Owner sign-off (`DEC-LOCK-01..20`).
2. **[P1 Gameplay / Economy]** `DialogueSystem.ts:304-310` & `:352` lack one-time `trustDelta` guard and duplicate check for non-`quest_` item rewards (`eqp_bell_ward_charm` duplicated on `edda_rune_guide`), plus missing keyboard keys `4–5` (`campfire_knight_intro`).
3. **[P1 Progression / Routing]** `GameScene.ts:4800-4806` (`npc_finn` always routes to `finn_rumors` skipping `finn_chat`), `GameScene.ts:4826-4836` (`hasCrest` vs `SQ08` ordering edge case), and `PlayerState.ts:610-622` early `lore_wayfarer_inner_journal` unlock.
4. **[P1 Save / Memory]** `SaveManager.applySaveToState()` (`L699, L719`) does not backfill `lore_memory_chapter_1..4` when restoring sparse saves with `memoryAwakeningStage >= 1..3` (`MEM-04`).
5. **[P1 Audio]** `SettingsManager.setMusicVolume()` (`L146, L322`) updates `AudioManager.ambienceVolume` without syncing `AudioManager.bgmVolume`; `GameScene.ts:1108` `[M]` mute bypasses `SettingsManager`; `ambience_forest.mp3` raw loudness (`-12.8 LUFS`); `Vaelen`/`Hooded` speech falls back to `dialogue_garth.wav`.
6. **[P2 UI]** `JournalModal` header `"DANH SÁCH CÁC HỒI"` touches `[TẤT CẢ]` button (`05_journal_lore.png`); `ParchmentWorldMapModal` displays `10/17` zones (`04_world_map_ui.png`).
7. **[P2 Codex Scope]** `BUG-058` / `BUG-059` (`BlackKnightPlayer.ts`) remain explicitly reserved for Codex (`HW-NR-15`).

---

## 4. Items Requiring Owner Verification & Manual Playtest

1. **Canon Decisions (`DEC-LOCK-01..20`):** Sign [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) (`OQ-01..20`) and [HW_STORY_TIMELINE_APPROVAL.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_STORY_TIMELINE_APPROVAL.md) (`D6` vs `D7` reveal).
2. **Asset & Cutscene Gate:** Select Prologue mode (`A/B/C`) + storyboard `CS01–CS06`; publish Approved Cinematic Event Registry (`HW-NR-17`); supply `V12.2` DAW stems & approve `Mystic_Autumn_Knights` license (`HW-NR-18`).
3. **Human Playtest & Listening Check:** Perform human-ear audio mix balance test (Forest `-12.8 LUFS` vs Mire `-36.9 LUFS` + Bell `11.22s`), EVKey Vietnamese typing across Modals, and full walkthrough Bellhollow → First Toll after `NR-REC-02..08` are executed.

---

## 5. FINAL STATUS

- **CANON CONSISTENCY:** **`BLOCKED / CONFLICTS OPEN (`C01–C05`, `DEC-LOCK-01..20` UNSIGNED)`**
- **LEGACY DIALOGUES REMAINING:** **`YES — `32` DEFERRED CLUSTERS ACTIVE IN `dist/` (`Drager = 0` PASS)`**
- **QUEST INTEGRITY:** **`PASS` (`72/72` Checks, Route `A → E → B → D → F → E → C → A`, Zero Softlock)**
- **SAVE COMPATIBILITY:** **`PASS` (`Schema 3` Verified Across V1.3/Mid/Post/Corrupt/Reload; `MEM-04` Backfill Queued)**
- **ENDING INTEGRITY:** **`PASS` (`3` Existing Endings & Thresholds `50 / 3 / 65` Preserved; Canon Copy Pending)**
- **VISUAL QUALITY:** **`PASS` (Baseline Pixel Art, Light Aura `[F]`, Classic Sanity 2.1; Minor Journal `[TẤT CẢ]` Label Overlap)**
- **PERFORMANCE:** **`PASS` (`59.95 FPS` HIGH / `59.96 FPS` MEDIUM on `GTX 1070 Ti`, `0` Console Errors, `0` 404s)**
- **ARCHIVES PRESERVED:** **`PASS` (`24` SHA-256 Backups Intact in `Backups/steps/backup_hw_nr_03/`, Originals Untouched)**
- **OWNER PLAYTEST:** **`PENDING` (Human-Ear Audio Verification & Canon Approval Needed)**
- **FINAL GATE:** **`NO-GO` FOR NARRATIVE V2 RELEASE** *(Technical baseline stability is **`CONDITIONAL GO`** for internal playtest only; Narrative Reconstruction release requires Owner sign-off on `DEC-LOCK-01..20`, execution of `NR-REC-02..08` / `HW-NR-16..19`, and P1 UI/Audio/Save bug fixes).*
