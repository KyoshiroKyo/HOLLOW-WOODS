# HW-NR-21 — FINAL NARRATIVE RESIDUE SCAN REPORT

- **Mission ID:** `HW-NR-21`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` (`INDEPENDENT QA`)
- **Dependency Audited:** `APPROVED NARRATIVE IMPLEMENTATION COMPLETE` (Checked against `HW-NR-02`, `HW-NR-03`, `HW_CANON_OWNER_DECISION_MATRIX.md`)
- **Deliverable:** `Read/V1.5/Reports/Narrative/HW_NR_21_FINAL_RESIDUE_REPORT.md`
- **Overall Independent QA Verdict:** **`FAIL (RUNTIME LEGACY TEXT STILL ACTIVE — UPSTREAM `NR-REC-02..08` IMPLEMENTATION NOT YET UNLOCKED BY OWNER)`** · **`Drager` Cleanup & Technical Baseline: `PASS`** (`0` edits applied per `HARD STOP`)

---

## 1. Executive QA Determination

1. **Upstream Dependency Status (`NOT COMPLETE`):** Across [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) and [HW_NR_03_CLEANUP_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_03_CLEANUP_REPORT.md), Owner decisions `DEC-LOCK-01` → `DEC-LOCK-20` remain unsigned, so the `32` deferred residue items (`NR2-001..016d`) have **not** yet been rewritten into production.
2. **Release-Gate Residue Verdict:** Because those unresolved `NR2-*` strings remain present in `src/` and compiled into the current production bundle (`G:\HOLLOW WOODS\dist\`, `289` files, `83,374,777 B`), **Final Residue Clearance currently `FAIL`s** for player-facing release until `NR-REC-02..08` are approved and executed.
3. **Rule Separation Honored:** Legacy strings inside `Read/` reports and `Backups/steps/backup_hw_nr_03/` archival snapshots are excluded from failure counts. Internal Save Schema `3` compatibility identifiers (`lore_satyr_journal`, `satyr_*` animations, `knight_commander_defeated`) are classified `PASS (TECHNICAL-ID-KEEP)`.

---

## 2. Scan Matrix Across All Required Surfaces (`src/`, `public/`, `dist/`, Runtime)

| Residue Category (`HW-NR-02` Ref) | `src/` + `public/` + `index.html` Scan | Production `dist/` Scan (`289` files) | QA Status | Exact Runtime Evidence |
| :--- | :---: | :---: | :---: | :--- |
| **`Drager` (`CHAR-K01`)** | **`0` hits** | **`0` hits** | **PASS** | Absent across all code, JSON, lore, quests, UI, and `dist/`. |
| **Technical Compatibility Keys (`NR2-019`)** | Active (`105` refs incl. constants/comments/aliases) | **`9` hits** (`game-data` + `index` + atlas) | **PASS (`KEEP`)** | `lore_satyr_journal`, `satyr_*` aliases, `SatyrAnimations`, `knight_commander_defeated` intact for Schema `3`. |
| **`Satyr:` Player Dialogue (`NR2-001/002`)** | **`2` player strings** (`EndingSystem:1037`, `VeilSystem:44`) | **`2` hits** (`dist/assets/index-FGtorazy.js`) | **FAIL** | `'Satyr: “Ánh đèn pha ô tô... quốc lộ ven rừng?!”'` (`EndingSystem.ts:1037`); `'“Satyr... quay lại đi...”'` (`VeilSystem.ts:44`). |
| **Isekai World Strings (`edda_intro`)** | **`2` runtime lines** (`dialogues.json:148, 154`) | **`3` hits** (`2` `game-data`, `1` `index`) | **FAIL** | `"bờ bên kia ranh giới"` & `"trở về thế giới của mình"` still served to player at Bellhollow. |
| **Algiz Self-Seal / Reincarnation (`C01`)** | **`8` line hits** (`dialogues`, `lore`, `zones`, `GameScene:5531` rune puzzle) | **`7` hits** (`6` `game-data`, `1` `index`) | **FAIL** | `campfire_knight_q3_complete` (`L768`), `hooded_knight_encounter_defeat` (`L820–821`), `lore_wayfarer_inner_journal` (`L78`), `veil_commander_epistle` (`zones.json:4179`). |
| **Early `Chỉ Huy` / `Hiệp Sĩ Đen` Spoil (`C04`)** | **`45+` hits** (`MainMenuScene:797`, `GameScene:4849`, `EvilKnights:833,839`, `JournalModal:909`, `dialogues`, `lore`, `tornPagesData`, `items`, `zones`) | **`32` hits** (`23` `game-data`, `9` `index`) | **FAIL** | Visible immediately in Main Menu Chronicle (`MainMenuScene.ts:797`) before clicking `New Game`. |
| **Typo `Sir Valen` (`NR2-003`)** | **`2` hits** (`lore.json:85`, `tornPagesData.ts:299`) | **`2` hits** (`game-data-DB3Gx1Mn.js`) | **FAIL** | Missing `'e'` in `Sir Vaelen` inside Memorial Stele & Torn Page data. |
| **Time Claim `"trăm năm"` (`DEC-LOCK-04`)** | **`3` hits** (`dialogues.json:898`, `lore.json:155`, `EndingSystem.ts:78`) | **`3` hits** (`2` `game-data`, `1` `index`) | **FAIL** | Unapproved *"hàng trăm năm"* / *"lời nguyền trăm năm"* remains in Ending I & Edda. |
| **Legacy `"dầu thông"` Loading Tip (`NR2-005`)** | **`1` hit** (`PreloadScene.ts:142`) | **`1` hit** (`index-FGtorazy.js`) | **FAIL** | References old oil-refill mechanic (`AI_IRON_RULES` uses Light Aura `[F]`). *(Separate from Elian's `đèn bão` props/lore).* |
| **New Canon Names Integration (`Meliodas`, `Mordric`, `Roderick`, `Aldemar`)** | **`0` hits** | **`0` hits** | **NOT INTEGRATED** | Zero new Canon character copy present in runtime or `dist/` awaiting Owner sign-off. |
| **Localization (`i18n` files)** | Inline VN/EN in `src/data/` & `.ts` (`0` separate locale files) | Bundled cleanly | **PASS (Audit Scope)** | Verified no hidden side-locale file overrides. |

---

## 3. Execution Tests Results (`PASS` / `FAIL` / `NOT RUN`)

Executed via Python static/bundle scanner and Chrome Headless verification (`test_nr21_residue.py`, `console_errors = []`, `page_errors = []`), plus `npm run check` & `npm run verify:data`:

| Test Suite (`HW-NR-21 §TESTS`) | Verdict | Concrete Evidence Observed |
| :--- | :---: | :--- |
| **Static Scan (`src/`, `public/`, `index.html`)** | **FAIL (Residue Found)** | `drager = 0` (`PASS`), but `32+` legacy residue items (`Satyr:`, `Algiz`, `Chỉ Huy`, `Sir Valen`, `trăm năm`, `dầu thông`) confirmed present (`EXPECTED` pre-`NR-REC` baseline). |
| **Production Build Scan (`dist/`)** | **FAIL (Residue Found)** | Scanned `289` build artifacts: `drager = 0`, `satyr_player_text = 2`, `isekai_car_world = 3`, `algiz_self_seal = 7`, `early_commander_spoil = 32`, `sir_valen_typo = 2`, `hundred_years = 3`, `oil_tip = 1`. |
| **Dialogue Traversal (`59/59` keys)** | **PASS (Runtime) / FAIL (Content)** | All `59` keys opened/cancelled cleanly (`allOpenedCleanly = true`, `0` errors); content scan flagged `2` `Algiz/tái sinh` keys and `10` `Chỉ Huy` keys. |
| **Quest Progression (`Stage 1–7`)** | **PASS** | `QuestSystem` progression verified (`stage5Verified = true`), `dragerInQuests = false`. |
| **`New Game` Initialization** | **PASS (Mechanics) / FAIL (Menu Spoiler)** | `fog_crossing`, `stage = 0`, `0` console errors; Main Menu Chronicle at `MainMenuScene:797` still contains early commander spoiler. |
| **`Continue` & Save Compatibility** | **PASS** | `SaveManager` round-trip (`zoneId = outer_woods`, `item_bell_mold = 1`, `Schema 3`) intact; dynamic key lookup ensures no stale dialogue caching once updated. |
| **Final TypeScript & Data Integrity** | **PASS** | `npm run check` (`exit 0`); `npm run verify:data` (`15/15 PASS`). |
| **Post-Implementation Canon Sign-Off Pass** | **`NOT RUN (BLOCKED)`** | Cannot certify release cleanly until `NR-REC-02..08` execute post-`DEC-LOCK-*` approval. |

---

## 4. Hard Stop Compliance

- Read-only QA report only (`0` code edits, `0` residue fixes applied).
- Preserved all historical documentation (`Read/`) and backups (`Backups/steps/backup_hw_nr_03/`).
- Did NOT delete any assets, saves, or backups; did NOT commit or push.
