# HW-NR-20 — NARRATIVE SAVE COMPATIBILITY REPORT

- **Mission ID:** `HW-NR-20`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** Codex
- **Dependencies Verified:** `SaveManager.ts`, `PlayerState.ts`, `CloudSaveService.ts`, `EndingSystem.ts`, `DialogueSystem.ts`, `HW-NR-10`, `HW-NR-19`
- **Deliverable:** `Read/V1.5/Reports/Narrative/HW_NR_20_SAVE_COMPATIBILITY_REPORT.md`
- **Overall Execution Status:** **`VERIFIED — SCHEMA 3 COMPATIBLE (MIGRATION SPEC & 1 BACKFILL GAP SUBMITTED FOR GATE; 0 WRITES TO REAL SAVES / SCHEMA / SRC)`**

---

## 1. Executive Conclusion

1. **Non-Destructive Verification Completed:** All save compatibility checks executed inside an isolated ephemeral Chromium browser context (`QA_SAVE_KEY` / temporary test payloads only) — **zero** edits to real user saves, **zero** real Cloud writes, **zero** schema version modifications, and **zero** changes to `src/` or `public/assets/`.
2. **Current Save Schema `3` Readiness (`SaveManager.CURRENT_SCHEMA_VERSION = 3`):**
   - Already supports narrative persistence fields (`memoryAwakeningStage`, `villageTrustScore`, `storyFlags[]`, `flags[]`, `quests[]`, `unlockedLoreIds[]`, `equippedSlots`, `storageChest`, `observedCreatures`, `legacyExtraData`) without needing a schema bump (`Schema v4` NOT required).
   - **Replaced Dialogue Protection:** Save files store only keys/flags (`dialogue` lines themselves are never persisted inside `SaveData` and always load dynamically from `src/data/dialogues.json`; `unlockedLoreIds` resolves fresh content by ID from `src/data/lore.json`).
   - **Pre-Narrative Migration:** Legacy V1.3 saves migrate idempotently (`JSON.stringify(mig1) === JSON.stringify(mig2)`), normalizing `quest_corrupted_knight_crest → quest_corrupted_crest`, deriving `east_gate_unlocked`, and preserving unknown keys in `legacyExtraData`.
3. **Submitted Migration Specification & Edge Gaps (Pending Owner Sign-Off Before Editing `SaveManager.ts` / `PlayerState.ts`):**
   - **Gap 1 (`MEM-04` Backfill):** A minimal/legacy save carrying `memoryAwakeningStage = 3` with only `['lore_three_rules']` in `unlockedLoreIds` currently restores `stage = 3` without backfilling `lore_memory_chapter_1..4`.
   - **Gap 2 (Cloud vs Local Envelope Alignment):** In [CloudSaveService.ts:299-300](file:///G:/HOLLOW%20WOODS/src/services/CloudSaveService.ts#L277-L340), `migrateSaveSchema()` places `villageTrustScore` and `storyFlags` under `player.*`, relying on [SaveManager.ts:381, 388](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L380-L396) fallback readers; normalizing both top-level and `player.*` on Cloud payload ensures parity.
   - **Gap 3 (QA Dev Build Isolation):** Because `QA_BUILD = true` routes `saveGameNow` / `loadGameAsync` to `QA_SAVE_KEY`, real remote P2Game server sync requires staging-environment verification outside standalone local Vite dev mode.

---

## 2. Entity & Narrative State Mapping Verification

| State Category (`HW-NR-20`) | Storage Location (`SaveData` Schema `3` / `PlayerState`) | Backward Compatibility & Stale-Copy Behavior | Verified Status |
| :--- | :--- | :--- | :---: |
| **Dialogue flags** | `storyFlags[]` (`choice_*`), `flags[]` (`talked_to_*`), `DialogueSystem` dynamic lookup | Dialogue text is never serialized; updating `dialogues.json` ensures old saves never display removed/replaced dialogue lines. | **PASS** |
| **Quest flags** | `currentQuestId`, `quests[]` (`tasks[{id, done}]`), `flags[]`, `questFlags[]` | Pre-narrative V1.3 `questFlags` object & array both import cleanly into `flags[]`; `east_gate_unlocked` derived automatically. | **PASS** |
| **Memory unlocks** | `memoryAwakeningStage` (`0..3`, clamped) | Preserved cleanly (`0..3`); monotonic guard avoids stage downgrade, though missing `lore_memory_chapter_*` needs `MEM-04` backfill. | **PARTIAL (`MEM-04`)** |
| **Lore collection** | `unlockedLoreIds[]` → `PlayerState.restoreUnlockedLore()` | Resolves updated text live from `lore.json` by ID (`lore_three_rules`, `lore_clapper_curse`, etc.); fallback prevents empty lore list. | **PASS** |
| **NPC relationship states** | `villageTrustScore` (`0..100`, default `50`), `talked_to_*`, `campfire_knight_q*` | Defaults safely to `50` on pre-narrative V1.3 saves; clamps `[0, 100]` cleanly. | **PASS** |
| **Boss states** | `flags[]` (`boss_hooded_knight_defeated`, `boss_mire_warden_defeated`), `observedCreatures[]` / `unlockedBestiary[]` | Preserved across Mid-Quest, Post-Quest, Reload, and Continue. | **PASS** |
| **Inventory & Gear** | `inventory[]`, `equippedSlots`, `storageChest` / `storageChestInventory`, `activeWeapon` | `quest_corrupted_knight_crest → quest_corrupted_crest` normalized in both `inventory` and `storageChest`; unknown keys preserved. | **PASS** |
| **Ending states** | `storyFlags[]` (`ending_true_achieved`, `ending_sacrifice_achieved`, `ending_fog_loop_achieved`) | Round-trips accurately when persisted in `storyFlags`; `New Game` clears cleanly. | **PASS** |
| **Cutscene completion** | Proposed `prologue_seen` / `cine_*_seen` stored in `storyFlags[]` | Tested round-trip (`prologue_seen = true`) across Save, Reload, and `Continue` (`isAct0IntroPending = false`); requires no Schema `4` bump. | **PASS (Ready)** |

---

## 3. Proposed Non-Breaking Migration Specification (For Owner Approval Prior to Runtime Edit)

Keep `SaveManager.CURRENT_SCHEMA_VERSION = 3`. Apply purely additive/non-destructive steps inside `SaveManager.applySaveToState()` / `sanitizeAndMigrateSaveData()` once Narrative checkpoints unlock:
1. **Default Safe Missing Flags:** Any new `storyFlags` (`prologue_seen`, `cine_*_seen`, one-time `choice_*` guards) default to absent (`false`) for legacy/existing saves; **never** replay unapproved cutscenes forcibly on `Continue` (`isContinueMode === true`).
2. **Memory Chapter Backfill (`MEM-04`):** When `memoryAwakeningStage >= 1/2/3`, ensure missing mandatory `lore_memory_chapter_1..4` entries for that stage are appended via `unlockLore()` without removing existing lore or reducing `memoryAwakeningStage`.
3. **Stale Pre-Retcon Flag & Reveal Protection:** Legacy saves that already hold `lore_wayfarer_inner_journal` or `campfire_knight_q2_completed` keep their quest progress intact (`no progression loss`), while UI/Dialogue text comes strictly from updated `lore.json` / `dialogues.json` (`no stale text replay`). Wait for `DEC-LOCK-07` (`D6` vs `D7`) to gate UI display names.

---

## 4. Live Ephemeral Chrome Runtime Test Results (`0` Console / Page Errors)

Executed via isolated Chromium context (`test_nr20_save_compat.py`, zero changes to real local/cloud saves):

| `HW-NR-20` Test Case | Status | Verified Runtime Output |
| :--- | :---: | :--- |
| **`New Game`** | **PASS** | `stage = 0`, `trust = 50`, `storyFlags = []`, `flagsCount = 0`, `quest = 'Q01_MEET_EDDA'`, `lore = ['lore_three_rules']`, `res_dry_wood = 2`, `seed_herbs = 3`. |
| **Legacy Save Before Narrative (`v1.3`)** | **PASS** | Upgraded to `saveSchemaVersion = 3`; `quest_corrupted_knight_crest → quest_corrupted_crest`; `res_dry_wood = 6`; `east_gate_unlocked = true`; `trust = 50`; `extraPreserved = 'preserve_me'`; idempotent (`true`). |
| **Mid-Quest Save (`Stage 2`, `deep_forest`)** | **PASS** | Restored `prologue_seen = true`, `choice_garth_cooperative = true`, `boss_hooded_knight_defeated = true`, `bestiary = true`, `trust = 62`, `stage = 2`, `loreCount = 7`, `item_bell_mold = 1`, `quest_corrupted_crest = 1`, `boots = eqp_trail_boots`, `chest.res_flint = 4`, `campfireLevel = 2`, `quest = Q05_SOLVE_MIRE`. |
| **Post-Quest & Ending Save (`Stage 3`, Shrine)** | **PASS** | Restored `ending_true_achieved = true`, `clapper_collected = true`, `quest_bronze_clapper = 1`, `boss_mire_warden_defeated = true`, `stage = 3`, `trust = 78`, all `8` lore IDs. |
| **Sparse `Stage 3` Save Backfill Check** | **CONFIRMED GAP (`MEM-04`)** | `{ memoryAwakeningStage: 3, unlockedLoreIds: ['lore_three_rules'] }` restored `stage = 3` with only `['lore_three_rules']` (needs non-destructive backfill when approved). |
| **Corrupt / Invalid Save Data** | **PASS** | `null`, `'bad'`, `123` returned `null`; corrupted bounds safely clamped/fell back (`hp = 100`, `comp = 100`, `temp = 0`, `herbs = 3`, `zone = 'bellhollow'`, `stage = 3`, `trust = 0`). |
| **Cloud Save Mock / Dev `QA_BUILD` Isolation** | **PASS (Dev Isolation)** | In Vite dev (`QA_BUILD = true`), `saveGameNow` / `loadGameAsync` routes through `QA_SAVE_KEY` cleanly preserving `trust = 84` and `storyFlags = ['cloud_flag_win', 'prologue_seen']`; real `p2.storage` server upload was not touched (`HARD STOP`). |
| **Full `Reload` + `Continue`** | **PASS** | After `page.reload()` + `continueGame()`, `GameScene` resumed cleanly (`isContinueMode = true`, `isAct0IntroPending = false`, `stage = 2`, `trust = 84`, `prologue_seen = true`, `boss_hooded_knight_defeated = true`, `crest = 1`, `mold = 1`). |

---

## 5. Verification Commands Run After Audit

- `npm run check` (`tsc --noEmit`): **PASS** (`exit code 0`).
- `npm run verify:data`: **PASS** (`15/15` data integrity checks passed).
- `git status -s -- src/ public/assets/`: Confirmed `0` edits to `src/` and `public/assets/`.

---

## 6. Hard Stop Compliance

- Did NOT delete or overwrite Owner's real local saves or real cloud saves.
- Did NOT alter Save Schema version (`CURRENT_SCHEMA_VERSION = 3`) or auto-reset progression.
- Did NOT delete any resources.
- Did NOT commit or push.
