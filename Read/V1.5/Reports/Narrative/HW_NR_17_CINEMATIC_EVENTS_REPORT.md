# HW-NR-17 — IN-GAME CINEMATIC EVENTS REPORT

- **Mission ID:** `HW-NR-17`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** Codex
- **Dependency Required:** `APPROVED CINEMATIC EVENT REGISTRY`
- **Deliverable:** `Read/V1.5/Reports/Narrative/HW_NR_17_CINEMATIC_EVENTS_REPORT.md`
- **Overall Execution Status:** **`BLOCKED — APPROVED CINEMATIC EVENT REGISTRY NOT FOUND / UPSTREAM GATES PENDING`** (`0` edits to `src/` and `public/assets/`)

---

## 1. Executive Conclusion (`BLOCKED` Status)

`HW-NR-17` explicitly directs:
- `DEPENDENCY: APPROVED CINEMATIC EVENT REGISTRY`
- **"Chỉ triển khai các cảnh đã được Owner duyệt: Gặp Edda, Gặp Vaelen tại trạm lửa, Các sự kiện ký ức, Cuộc hội ngộ với Mordric, Các phân cảnh quan trọng khác."**
- `HARD STOP`: No invented lore, no boss encounter changes, no quest reward changes, no Sanity edits, no deleted resources.

Direct inspection of `Read/`, `docs/`, `src/`, and `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` confirms that:
1. **No `APPROVED CINEMATIC EVENT REGISTRY` exists** in the repository or Master Bible handover documents.
2. **All five target event groups remain upstream-blocked** on unsigned Owner canon locks (`DEC-LOCK-*` / `OQ-*`) in [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) and pending narrative reports (`HW-NR-05`, `06`, `07`, `08`, `10`, `16`).
3. Implementing custom camera/animation/dialogue event sequences before Owner sign-off would violate both the dependency requirement and `HW-NR-01` ([HW_MASTER_CANON_LOCK.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_MASTER_CANON_LOCK.md#L9-L10)), as participant identities, dialogue lines (`DLG-006..015`), boss/NPC mapping (`Mordric = HoodedKnightBoss?`), location (`deep_forest` vs `veil_origin_cavern`), Vaelen support role, and `Meliodas` reveal timing (`D6` vs `D7`) are unresolved.

Accordingly, **`0` runtime changes were made**; this report audits every requested event against its current codebase trigger and upstream blockers, and defines the modular in-engine event architecture ready once the registry is approved.

---

## 2. Per-Event Gate & Runtime Audit

| Requested Event Group (`HW-NR-17`) | Current Runtime Hook Verified in Source | Blocking Canon / Narrative Gates | Action Taken |
| :--- | :--- | :--- | :--- |
| **1. Gặp Edda** | [GameScene.ts:4740-4741](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4735-L4750) launches inline dialogue `edda_intro` (`talked_to_edda` flag). | [HW_NR_05_BELLHOLLOW_DIALOGUE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_05_BELLHOLLOW_DIALOGUE_REPORT.md) (`DIALOGUE DIFF FOR OWNER APPROVAL`); `DEC-LOCK-02` (`OQ-02`), `DEC-LOCK-17` (`DLG-006..007`). | `BLOCKED — NO EDIT` |
| **2. Gặp Vaelen tại Trạm Lửa** | [GameScene.ts:4807-4898](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4807-L4901) handles `campfire_knight_intro` / `q1..q3` inline via `CampSanctuarySystem` + `DialogueSystem` (`L4849` early spoiler popup, `L4882` direct `stage = 1`). | [HW_NR_06_VAELEN_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_06_VAELEN_REPORT.md) (`DIALOGUE DIFF & ROUTING PLAN`); `DEC-LOCK-01` (`OQ-01`), `DEC-LOCK-10` (`OQ-06`), `DEC-LOCK-11` (`OQ-05/11/16`), `DEC-LOCK-17` (`DLG-009/014/015`). | `BLOCKED — NO EDIT` |
| **3. Các Sự Kiện Ký Ức** | [PlayerState.ts:758-778](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts#L758-L778) (`setMemoryAwakeningStage`), [EchoSystem.ts:105-124](file:///G:/HOLLOW%20WOODS/src/systems/EchoSystem.ts#L105-L124) (`dissolveEcho` → Stage 2), [EvilKnights.ts:817-821](file:///G:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L817-L821), [GameScene.ts:4842-4850](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4842-L4850). | [HW_NR_10_MEMORY_SYSTEM_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_10_MEMORY_SYSTEM_REPORT.md) (`TIMELINE INTEGRATION BLOCKED`); `HW_STORY_TIMELINE_APPROVAL §4` (`D6` vs `D7` reveal) & `DEC-LOCK-07` (`OQ-20`). | `BLOCKED — NO EDIT` |
| **4. Cuộc Hội Ngộ với Mordric** | [EvilKnights.ts:815-842](file:///G:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L815-L842) triggers `stagger (2200ms)` + `hooded_knight_encounter_intro` at `distToPlayer <= 220`; [EvilKnights.ts:990-1030](file:///G:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L990-L1030) handles `hooded_knight_encounter_defeat` & `dialogue_completed` fade-out. | [HW_NR_07_MORDRIC_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_07_MORDRIC_REPORT.md) (`RUNTIME INTEGRATION: BLOCKED`); `DEC-LOCK-09` (`OQ-04`: `Mordric` vs `HoodedKnightBoss`), `DEC-LOCK-11` (fate & Vaelen support `OQ-14/16`), `DEC-LOCK-16` (`OQ-15`), `DEC-LOCK-17` (`DLG-012..015`). | `BLOCKED — NO EDIT` |
| **5. Các Phân Cảnh Khác (Prologue / First Toll / Endings)** | Prologue `startAct0Intro()` ([GameScene.ts:1393-1430](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1393-L1430)); Finale `EndingSystem.ts` (`determineEndingType`, `triggerTheFirstTollFinale`). | [HW_NR_16_OPENING_CUTSCENE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_16_OPENING_CUTSCENE_REPORT.md) (`DEC-LOCK-20`); `OQ-18` & `RES-SATYR-TXT` in [OWNER_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_DECISIONS_REQUIRED.md). | `BLOCKED — NO EDIT` |

---

## 3. Existing Engine Primitives & Planned Event Architecture (Once Approved)

Audit of existing subsystems confirms no rewrite is needed; an isolated controller/module pattern fits directly over current primitives:

- **Camera Primitives ([CameraSystem.ts:1-90](file:///G:/HOLLOW%20WOODS/src/systems/camera/CameraSystem.ts#L1-L90)):**
  - Has `follow(target)`, `centerOn(x, y)`, `shake(...)` (gated by `SettingsManager`), `flash(...)` (gated + `450ms` cooldown), and `zoomTo(zoom, duration)` (`DEFAULT_WORLD_ZOOM = 2.2`).
  - **Planned Safety Wrapper:** Any cinematic sequence panning/zooming away from `BlackKnightPlayer` must record `zoneZoom` / `follow(player)` in a `finally`/cleanup hook so aborting via `Skip`, `ESC`, damage interruption, or zone transition immediately restores camera follow and zoom.
- **Dialogue & Modal Isolation ([DialogueSystem.ts:125-185](file:///G:/HOLLOW%20WOODS/src/systems/DialogueSystem.ts#L125-L185)):**
  - Automatically closes conflicting UI modals (`craftingModal`, `journalModal`, `pauseModal`), runs `onDialogueStart` input lock, cleans `typewriterTimer`, and supports `cancelDialogue()` (`ESC`) returning control cleanly (`HW-NR-08` verified).
- **Persistence & Uniqueness ([SaveManager.ts:60-68](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L60-L68)):**
  - `CURRENT_SCHEMA_VERSION = 3` includes `storyFlags?: string[]`, enabling one-time event uniqueness (`cine_<eventId>_seen`) without modifying save schema version, boss encounter triggers, quest rewards, or Sanity formulas.
- **Lifecycle Isolation Rule (Ready for Queue Execution):**
  - Each approved event (`Edda`, `Vaelen`, `Memory`, `Mordric`) should be registered as an independent module implementing `{ id, canTrigger(state), play(ctx), skip(), dispose() }`, guaranteeing automatic removal of Phaser timers, tweens, and scene event listeners on skip, interruption, zone transition, or scene shutdown.

---

## 4. Test Matrix Status

Because `0` approved cinematic event modules exist to integrate yet, runtime event tests cannot pass and are reported accurately as **`NOT EXECUTED (BLOCKED BY OWNER GATE)`**:

| Required Test Case (`HW-NR-17`) | Status | Notes |
| :--- | :---: | :--- |
| Trigger uniqueness (no replay after completion / reload) | `NOT EXECUTED — BLOCKED` | Awaits approved event IDs & `storyFlags` keys |
| `Skip` during camera/dialogue sequence | `NOT EXECUTED — BLOCKED` | Pending approved cinematic controller |
| Interruption handling (damage / pause / ESC) | `NOT EXECUTED — BLOCKED` | Pending approved cinematic controller |
| Zone transition mid-event / post-event | `NOT EXECUTED — BLOCKED` | Pending approved cinematic controller |
| `Save / Load` (`Schema 3` compatibility) | `NOT EXECUTED — BLOCKED` | Baseline `storyFlags` persistence intact |
| Input recovery after sequence end/skip | `NOT EXECUTED — BLOCKED` | Pending approved cinematic controller |
| Timer & listener cleanup (`dispose()`) | `NOT EXECUTED — BLOCKED` | Pending approved cinematic controller |

---

## 5. Verification Commands Run After Audit

- `npm run check` (`tsc --noEmit`): **PASS** (`exit code 0`).
- `npm run verify:data`: **PASS** (`15/15` data integrity checks passed).
- `git status -s -- src/ public/assets/`: Confirmed `0` source or asset edits made by `HW-NR-17`.

---

## 6. Hard Stop Compliance

- Did NOT invent or add new lore events or transform the `V12.2` trailer montage into mandatory quest flow.
- Did NOT modify boss encounters (`BossMireWarden`, `HoodedKnightBoss`), quest rewards, or Sanity mechanics.
- Did NOT delete any assets or resources.
- Did NOT commit or push.

---

## 7. Exact Owner Action Required to Unlock `HW-NR-17`

1. Publish/approve an **`APPROVED CINEMATIC EVENT REGISTRY`** specifying which exact scenes (`Edda`, `Vaelen`, `Memory`, `Mordric`, etc.) are approved for in-engine playback, their trigger conditions, and whether each is one-time/skippable.
2. Sign off upstream Canon decisions in [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md): `DEC-LOCK-01`, `02`, `07`, `09`, `10`, `11`, `16`, `17` (unlocking `HW-NR-05`, `06`, `07`, `10`).
