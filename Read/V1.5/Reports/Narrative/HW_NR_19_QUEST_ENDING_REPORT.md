# HW-NR-19 — QUEST PROGRESSION & ENDING SYNCHRONIZATION REPORT

- **Mission ID:** `HW-NR-19`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** Codex
- **Dependency Required:** `APPROVED QUEST AND ENDING DECISIONS`
- **Deliverable:** `Read/V1.5/Reports/Narrative/HW_NR_19_QUEST_ENDING_REPORT.md`
- **Overall Execution Status:** **`PARTIAL / CANON SYNC BLOCKED — WAITING FOR OWNER DECISIONS; BASELINE ROUTE & 3 ENDINGS LIVE-VERIFIED`** (`0` edits to `src/` and `public/assets/`)

---

## 1. Executive Conclusion & Owner Gate Status

`HW-NR-19` requires synchronizing quests, quest descriptions/dialogues, memory progression, and Ending narrative copy with newly approved Canon lore (`DEPENDENCY: APPROVED QUEST AND ENDING DECISIONS`), while preserving the three existing Endings, route, rewards, and Save Schema `3` unless explicitly approved.

Audit of [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md), [OWNER_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_DECISIONS_REQUIRED.md), and [QUEST_IMPACT_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/QUEST_IMPACT_REGISTRY.md) confirms that all Quest & Ending canon gates remain **unsigned**:
- **`DEC-LOCK-01 / 04 / 07 / 08`:** Title (`Chỉ Huy` vs `Người Thầy`), `"hàng trăm năm"` removal (`EndingSystem.ts:78`, `lore_ending_true`), `Meliodas` reveal milestone (`D6` vs `D7`), and removing legacy `Satyr` Time Rift text (`EndingSystem.ts:1037`: *"'Satyr: Ánh đèn pha ô tô... quốc lộ ven rừng?!...'"*).
- **`DEC-LOCK-09 / 10 / 11 / 16` (`OQ-04, 06, 14, 15, 16`):** `Vaelen q2 vs q3`, `Sir Mordric` vs `HoodedKnightBoss`, `SQ08` optional (`deep_forest`) vs `veil_origin_cavern`, and Mordric/Vaelen fates.
- **`DEC-LOCK-18` (`OQ-18`):** `ENDING_CONFIGS` narrative rewrite (`NAR-021`) and choice-impact vs idempotency rules.

Consequently, **no lore/ending text or quest routing was altered (`0` source edits)**. However, the entire 7-stage Main Quest route, gate dependency graph, optional/missed-interaction paths, reward uniqueness, and all three current Endings were **audited and live-tested in Headless Chrome**.

---

## 2. Main Quest Route & Dependency Graph (`A → E → B → D → F → E → C → A`)

Verified against [quests.json](file:///G:/HOLLOW%20WOODS/src/data/quests.json#L1-L214), [QuestSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/QuestSystem.ts#L90-L267), and [WorldGatingSystem.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts#L90-L296):

```
[A: Bellhollow] --(east_gate_unlocked + Q04:t1)--> [E: Silent Mire]
       ^                                                  |
       | (First Toll / Clapper)             (Stage 2: quest_corrupted_crest)
       |                                                  v
[C: Broken Bell Shrine] <--(Stage 6: quest_purification_key)-- [B: Vaelen Outer Woods]
                                  |                       |
                     [F: Deep Forest Rune] <--(Stage 4)-- [D: Bell Workshop (item_bell_mold)]
```

| Stage | Route (`quests.json`) | Required Item / Flag | Unlock Gate (`WorldGatingSystem.ts`) | Text / Sync Gaps Pending Owner Gate |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `A → E` (`Q_STAGE_1_A_TO_E` / `Q04`) | `east_gate_unlocked`, `Q04:t1` | Unlocks `crooked_path`, `silent_mire`, `deep_forest` | `edda_intro` still references legacy *"trở về thế giới của mình"* (`HW-NR-05`). |
| **2** | `E → B` (`Q_STAGE_2_E_TO_B` / `Q05`) | `quest_corrupted_crest` (Silent Mire seal) | `outer_woods` / `silent_mire` open (`Layer 1` ↔ `3`) | Dual source risk with `SQ08` (`GameScene.ts:4826–4836`) preserved untouched. |
| **3** | `B → D` (`Q_STAGE_3_B_TO_D` / `SQ01`) | `item_bell_mold` + `vaelen_mold_quest_assigned` | `sub_bell_workshop` (`always_unlocked`) | HUD dynamically swaps `Q05` display to Stage 3 target (`sub_bell_workshop`). |
| **4** | `D → F` (`Q_STAGE_4_D_TO_F` / `Q04`) | `quest_rune_fragment` | `deep_forest` requires `east_gate_unlocked` + `Q04+` | Must keep `Bell Workshop` lore free of early `Chỉ Huy` spoilers (`HW-NR-10`). |
| **5** | `F → B/A` (`Q_STAGE_5_F_TO_B` / `SQ06`) | `quest_purification_key` (`item_bell_mold` + `quest_rune_fragment`) | `outer_woods` (Vaelen) or `bellhollow` (Bram fallback) | Bram fallback ensures missed Vaelen quest never blocks key crafting. |
| **6** | `Quay lại E → Mở C` (`Q_STAGE_6_BACK_TO_E`) | `unlockBridge()` (`mire_root_seal_broken`, `Q06`) | `broken_bell_shrine` gated by `mire_root_seal_broken` | Unlocks `broken_bell_shrine` strictly after `quest_purification_key`. |
| **7** | `Tại C → A` (`Q_STAGE_7_AT_C` / `Q06`) | `quest_bronze_clapper` (`clapper_collected`) | Also unlocks `sunken_crypt_ruins` (`clapper_collected`) | `lore.json:496, 505` (`SQ08`) still labels boss `"Chỉ Huy Hiệp Sĩ Trùm Mũ"`. |

---

## 3. Three Existing Endings & Memory Synchronization Check

Verified [EndingSystem.ts:64-222](file:///G:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L64-L222) and [lore.json:151-170](file:///G:/HOLLOW%20WOODS/src/data/lore.json#L151-L170):
- **`true_ending`** (`ending_true_achieved`, `lore_ending_true`): requires `composure >= 50 && memoryAwakeningStage >= 3 && villageTrustScore >= 65`.
  - *Canon sync blockers:* `EndingSystem.ts:78` (*"suốt hàng trăm năm"*), `L79` (*"Chỉ Huy Hiệp Sĩ Đen"*), and `EndingSystem.ts:1037` (*"Satyr: Ánh đèn pha ô tô..."*).
- **`sacrifice_ending`** (`ending_sacrifice_achieved`, `lore_ending_sacrifice`): `memoryAwakeningStage >= 2` when `true_ending` conditions are not met.
  - *Canon sync blocker:* `EndingSystem.ts:97` (*"Chỉ Huy Hiệp Sĩ Đen"*).
- **`fog_loop_ending`** (`ending_fog_loop_achieved`, `lore_ending_fog_loop`): `memoryAwakeningStage < 2`.
  - *Canon sync blocker:* `EndingSystem.ts:117` (*"Chỉ Huy Hiệp Sĩ Đen"*).
- **Memory Synchronization Risk (Carried from `HW-NR-10`):** `PlayerState.ts:610–622` still unlocks `lore_wayfarer_inner_journal` on early choice flags at Stage `0`, and `GameScene.ts:4849` still pops up *"Chỉ Huy Hiệp Sĩ Đen"* directly (untouched pending `DEC-LOCK-07`).

---

## 4. Live Runtime Test Results (`Chrome Headless + Vite Dev Server`)

Executed non-destructive live verification via `test_nr19_quest_ending.py` (`console_errors = []`, `page_errors = []`):

| `HW-NR-19` Test Case | Status | Observed Live Telemetry |
| :--- | :---: | :--- |
| **Main Quest Route (`1 → 7`)** | **PASS** | Progressed cleanly across all `7` stages (`Stage 1 → 2 → 3 (targetZone: sub_bell_workshop) → 4 → 5 → 6 (canBreakSeal: true) → 7 (questId: Q06_RETRIEVE_CLAPPER)`). |
| **Missed Interactions (`SQ01–SQ09` skipped)** | **PASS** | Skipping all optional side quests & dialogues still completed Stages `1 → 7`, crafted `quest_purification_key`, and unlocked `broken_bell_shrine` (`missedOptionalBypassOk: true`). |
| **Gate Dependencies (`WorldGatingSystem`)** | **PASS** | Fresh start: `bellhollow/sub_bell_workshop/sub_root_cellar = true`, `crooked_path/silent_mire/deep_forest/broken_bell_shrine/sunken_crypt_ruins/veil_origin_cavern = false`. Stage 1 opens frontier + `silent_mire`; Stage 6 `unlockBridge()` opens `broken_bell_shrine`; `clapper_collected` opens `sunken_crypt_ruins`. |
| **Unique Rewards (`Purification Key` vs `Charm`)** | **PARTIAL / KNOWN BUG** | `QuestSystem.craftPurificationKey()` ×2 kept **`keyCountAfterDoubleCraft = 1`** (`PASS`). Repeating `edda_rune_guide` ×2 granted **`charmAfter2 = 2`** (`eqp_bell_ward_charm` duplicated because `DialogueSystem.ts:352` only deduplicates `'quest_*'`). |
| **Optional Dialogue (`Vaelen / Edda` trust)** | **CONFIRMED GAP** | `DialogueSystem` choice `trustDelta` still lacks one-time guard (`HW-NR-08`), allowing `villageTrustScore` manipulation before Ending evaluation once repeated. |
| **Ba Ending Hiện Hành (`determineEndingType`)** | **PASS** | `(comp=40, stage=3, trust=90) → sacrifice_ending`; `(80, 3, 64) → sacrifice_ending`; `(50, 3, 65) → true_ending`; `(100, 2, 100) → sacrifice_ending`; `(100, 1, 100) → fog_loop_ending`; `(100, 0, 100) → fog_loop_ending`. |

---

## 5. Verification Commands Run After Audit

- `npm run check` (`tsc --noEmit`): **PASS** (`exit code 0`).
- `npm run verify:data`: **PASS** (`15/15` data integrity checks passed).
- `git status -s -- src/ public/assets/`: Confirmed `0` edits to `src/` and `public/assets/`.

---

## 6. Hard Stop Compliance & Unlock Actions

- Did NOT invent or approve new Endings, did NOT alter `determineEndingType` thresholds, did NOT alter Save Schema `3`, did NOT delete resources, did NOT commit/push.
- **To Unlock Quest & Ending Canon Sync:** Sign `DEC-LOCK-01, 04, 07, 08, 09, 10, 11, 16, 18` in [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) so `EndingSystem.ts:64–120, 1037`, `lore_ending_*`, `quests.json`, `GameScene.ts`, and `DialogueSystem.ts` choice/reward deduplication can be updated in lockstep.
