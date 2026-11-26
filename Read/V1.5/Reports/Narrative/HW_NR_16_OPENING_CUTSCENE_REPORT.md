# HW-NR-16 — OPENING CUTSCENE IMPLEMENTATION REPORT

- **Mission ID:** `HW-NR-16`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** Codex
- **Dependencies Checked:**
  - [HW_NR_04_PROLOGUE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_04_PROLOGUE_REPORT.md)
  - [OPENING_CUTSCENE_IMPLEMENTATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OPENING_CUTSCENE_IMPLEMENTATION_PLAN.md)
  - [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)
  - [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md)
  - [OWNER_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_DECISIONS_REQUIRED.md)
  - [OWNER_LORE_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_LORE_DECISIONS_REQUIRED.md)
- **Overall Execution Status:** **`BLOCKED — OWNER GATE PENDING`** (`0` edits to `src/` and `public/assets/`)

---

## 1. Executive Conclusion (`BLOCKED` Status)

`HW-NR-16` requires implementing the cinematic opening cutscene on `New Game` using **"phương án In-engine, Video hoặc Hybrid đã được Owner lựa chọn"** and **"storyboard đã duyệt"** (`DEPENDENCY: HW-NR-04 + APPROVED OPENING STORYBOARD`).

Direct audit of repository documentation, Master Bibles, runtime assets, and source code confirms that **neither dependency has been approved by the Owner yet**:

1. **Upstream Task Blocked:** [HW_NR_04_PROLOGUE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_04_PROLOGUE_REPORT.md) explicitly remains at **`DRAFT SUBMITTED — STOPPED BEFORE SOURCE EDIT`** due to unsigned locks `DEC-LOCK-02`, `DEC-LOCK-03`, `DEC-LOCK-07`, and `DEC-LOCK-20`.
2. **Delivery Mode Unselected (`DEC-LOCK-20` / `OQ-19` / `CIN-K13`):** In [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md#L46), all four checkboxes `[ ] A (In-Engine)  [ ] B (Video)  [ ] C (Hybrid)  [ ] D (No Cutscene)` remain **unchecked**.
3. **Opening Storyboard Unapproved (`CS01–CS06`):** In [OPENING_CUTSCENE_IMPLEMENTATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OPENING_CUTSCENE_IMPLEMENTATION_PLAN.md#L10) and [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md#L46), the `28s` `CS01–CS06` sequence is explicitly **`PROPOSED — Chưa Duyệt Canon`**, with `Duyệt 6 câu dẫn CS01–CS06? [ ] Duyệt [ ] Chỉnh câu: ____` still unsigned. The unified Master Bible (`HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`, section `09`) likewise labels `CS01–06` as `PROPOSED` with unresolved open question `OQ-19`.
4. **Core Lore Gates Affecting Opening Text Unsigned:** `DEC-LOCK-02` / `OQ-02` (nature of the call for help: Forest vs Veil vs Listener vs Echo), `DEC-LOCK-03` / `OQ-03` & `OQ-08` (memory loss & time gap), and `DEC-LOCK-07` / `OQ-20` (spoiler timing for `Meliodas` / `Chỉ Huy`).
5. **No Approved Cutscene Media Assets in Runtime:** Neither trimmed low-weight keyframe plates (`CS01–CS06`) nor an approved opening video cut exist under `public/assets/`. Only full promotional trailers exist outside runtime under `G:\HOLLOW WOODS\HW\Trailer\...` and `G:\HOLLOW WOODS\HW\HOLLOW_WOODS_TRAILER\...`.

In accordance with `HW-NR-16`, `HW-NR-04`, and `Read/AGENTS.md`, **Codex did not self-approve a mode, fabricate unapproved narrative copy, embed full `V12.2` trailer footage, or alter production `src/` or `public/assets/`.**

---

## 2. Trailer & Media Budget Guard Verification

Checked trailer assets under `G:\HOLLOW WOODS\HW\Trailer\Video Game Trailer\v12\`:

| File | Size | Suitability for Production Opening |
| :--- | :---: | :--- |
| `HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4` | `232.02 MB` | **REJECTED** — Full `70s` trailer (`4K60`), exceeds web bundle budget and contains late-game character/encounter spoilers |
| `HOLLOW_WOODS_V12_1_CINEMATIC_SOUND_MASTER_4K60.mp4` | `232.02 MB` | **REJECTED** — Full `4K60` trailer |
| `HOLLOW_WOODS_V12_THE_UNBROKEN_OATH_CINEMATIC_4K60.mp4` | `231.85 MB` | **REJECTED** — Full `4K60` trailer |
| `HOLLOW_WOODS_V12_2_CINEMATIC_SOUNDTRACK.mp3` | `2.29 MB` | Music stem candidate only (`AUD-K12` = `TRAILER-ONLY`; not licensed/cleared as loop without Owner sign-off) |

---

## 3. Codebase Integration Readiness Audit (Observed Read-Only)

Verified current production entry flow and hooks so implementation can start immediately once the Owner signs the gate:

### 3.1 New Game vs Continue Flow
- [MainMenuScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L281-L297):
  - `startNewGame()` (`L290–297`) calls `SaveManager.clearSave()`, fades `500ms`, and runs `this.scene.start(SCENE_GAME, { isContinue: false })`.
  - `continueGame()` (`L281–288`) loads save async and runs `this.scene.start(SCENE_GAME, { isContinue: true, saveData })`.
  - Pre-existing early spoiler at [MainMenuScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L797) (*"Ngươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi..."*) remains untouched pending `DEC-LOCK-02` / `OQ-20`.

### 3.2 Act 0 Runtime Handoff (`Fog Crossing`)
- [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L240-L247): `init(data)` sets `this.isContinueMode`.
- [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1064-L1076): On fresh start (`isAct0IntroPending === true`), calls `this.startAct0Intro()`; on Continue, displays zone banner and `"▶ Đã tiếp tục chuyến hành trình!"` without replaying Act 0.
- [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1393-L1430): `startAct0Intro()` fades camera in (`600ms`), spawns `act0EchoGfx`, triggers bronze bell toll at `800ms`, and displays zone banner at `4200ms`.
- [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L2712-L2742): `updateAct0Progression()` completes `Q00_WAKE_UP` when `x >= 280` in `fog_crossing`, sets `Q01_MEET_EDDA`, and auto-saves checkpoint.
- [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L3324-L3355): `triggerAct0AtmosphereTelegraph()` handles atmospheric twig snap + wisp at `x >= 175`.

### 3.3 Save Schema Compatibility
- [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L60-L68): `CURRENT_SCHEMA_VERSION = 3` (`L68`) already provides `storyFlags?: string[]` (`L62`). Recording `'prologue_seen'` requires **zero** schema version bump and preserves backward compatibility with existing saves.

### 3.4 Lifecycle / Pause / Focus Loss Infrastructure
- [main.ts](file:///G:/HOLLOW%20WOODS/src/main.ts#L133-L153): `window.p2.onPause` and `window.p2.onResume` already call `game.loop.sleep()` / `game.loop.wake()` and `game.sound.pauseAll()` / `game.sound.resumeAll()`. Any future `OpeningCutsceneScene` must bind Phaser `Pause` (`ESC`), `visibilitychange`/focus-loss timer pause (especially if video or HTML DOM overlays are used), `Skip` input debounce, and asset load-error timeout fallback directly to `SCENE_GAME`.

---

## 4. Test Matrix Status (Blocked Pending Cutscene Implementation)

Because no approved cutscene exists to execute, runtime cutscene tests cannot pass and are honestly marked **`NOT EXECUTED (BLOCKED BY OWNER GATE)`**:

| Required Test Case (`HW-NR-16`) | Status | Notes |
| :--- | :---: | :--- |
| `New Game` opening trigger | `NOT EXECUTED — BLOCKED` | Requires approved mode (`A/B/C`) + storyboard |
| `Skip` input lock & restore | `NOT EXECUTED — BLOCKED` | Pending cutscene scene implementation |
| `Pause` during cutscene | `NOT EXECUTED — BLOCKED` | Pending cutscene scene implementation |
| Browser tab / focus loss handling | `NOT EXECUTED — BLOCKED` | Pending cutscene scene implementation |
| `Continue` skips opening cleanly | `NOT EXECUTED — BLOCKED` | Baseline `isContinue: true` skips `startAct0Intro()`; cutscene flag awaits implementation |
| Video/asset load failure fallback | `NOT EXECUTED — BLOCKED` | Awaits selected mode (Video/Hybrid vs In-Engine) |
| Handoff to `fog_crossing` (`Act 0`) | `NOT EXECUTED — BLOCKED` | `startAct0Intro()` & `Q00_WAKE_UP` remain intact and unmodified |

---

## 5. Verification Commands Run After Audit

- `npm run check` (`tsc --noEmit`): **PASS** (`exit code 0`, clean TypeScript compile on unmodified source).
- `npm run verify:data`: **PASS** (`15/15` data integrity checks passed, verified on current repository state).
- `git status -s -- src/ public/assets/`: Confirmed `0` source or asset changes introduced by `HW-NR-16`.

---

## 6. Hard Stop Compliance

- Did NOT modify original trailer files (`HW/Trailer/...`, `HW/HOLLOW_WOODS_TRAILER/...`).
- Did NOT alter quest progression (`Q00_WAKE_UP`, `Q01_MEET_EDDA`, main route).
- Did NOT delete any resources.
- Did NOT reveal `Meliodas` early or invent unapproved lore/storyboard text.
- Did NOT embed any 4K MP4 into `public/` or build outputs.
- Did NOT commit or push.

---

## 7. Exact Owner Action Required to Unlock `HW-NR-16`

To unblock implementation, Owner must complete **`DEC-LOCK-20` / `OQ-19`** and **`DEC-LOCK-02 / 03 / 07`** in [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md):

1. **Select Cutscene Mode (`DEC-LOCK-20`):** `[A] In-Engine` | `[B] Video` (plus approved bitrate/MB budget) | `[C] Hybrid` (keyframe art + camera/caption/in-engine handoff) | `[D] None / Keep current Act 0`.
2. **Approve Storyboard & Copy (`CS01–CS06`):** Sign off or revise the `6` caption lines, duration (`28s`), and confirm zero early `Meliodas` / `Chỉ Huy` reveal (`DEC-LOCK-02`, `DEC-LOCK-03`, `DEC-LOCK-07`).
3. **Approve Production Assets (if Mode B or C):** Supply or authorize final compressed keyframe plates / trimmed WebM/MP4 file (`<=` approved MB budget) placed under `public/assets/`.
