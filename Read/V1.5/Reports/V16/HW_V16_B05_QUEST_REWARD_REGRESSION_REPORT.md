# HW-V16-B05 — QUEST & REWARD REGRESSION HARDENING (ENTRY GATE BLOCKED)

- **Task ID:** `HW-V16-B05`
- **Project:** `HOLLOW WOODS` (`V1.6.0 — The Unbroken Oath`)
- **Roadmap:** `3.1`
- **Status:** **`BLOCKED`** *(Safe Docs-Only Checkpoint per `HW_GIT_REPORTING_POLICY.md` §2C)*
- **Branch / Worktree:** `fix/v1.6-b05-quest-reward` (`G:\HOLLOW_WOODS_B05`, branched from `HW-V16-B04` `6fd63fb3d566f9f44777155a7cdeb75631520561`)
- **Primary Worktree (`G:\HOLLOW WOODS`):** Left completely untouched (`e4edb07bcbf2865681277a12404624c4c495bb1f`, preserving uncommitted `A07` and staged `Pixel_Art/` index entries).
- **Source Code Changes (`src/`):** **`0`** (zero edits made; hard stop enforced).

---

## 1. Entry Gate Evaluation (`BLOCKED`)

Task specification `HW-V16-B05` defines strict dependencies and stop conditions:
- **Dependencies:** `A05, A06-R1, A07 verified checkpoints`
- **Explicit Gate Rule (`§2 BASELINE`):** *"Nếu A07 vẫn chưa được commit và nghiệm thu, báo BLOCKED."*
- **Hard Stop (`§6`):** *"Không làm lại A07."*

Live repository & report verification found the following gate blocker:

| Dependency | Verified Branch / Location | Git Commit / Remote State | Acceptance State | Impact on B05 |
| :--- | :--- | :--- | :---: | :--- |
| **A05** | `feat/v1.5.3-ag-world-polish` | Committed & pushed prior to `e4edb07` | **PASS** | `DialogueSystem.ts` idempotency (`dlg_trust:`, `dlg_reward:`, `dlg_quest:`) present. |
| **A06-R1** | `feat/v1.6-a06-r1-identity-evidence` | Committed & pushed (`fc5bf1d5f849f694a6b92e270ef747b2f2914246`), not merged into `feat/v1.5.3-ag-world-polish` or `B04` | **PENDING GPT ACCEPTANCE / UNMERGED** | Identity Reveal Option 1 runtime exists only on isolated branch `feat/v1.6-a06-r1-identity-evidence`. |
| **A07** | `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish`) | **UNCOMMITTED** (`4` modified `src/` files: `GameScene.ts`, `PlayerState.ts`, `BossEncounterSystem.ts`, `WorldGatingSystem.ts` [+47/-42]; `2` untracked files: `verify_v16_a07_quest_and_endings.mjs`, `HW_V16_A07_ENDING_APPROVAL_DRAFT.md`). Last doc checkpoint: `36f43b6`. | **NOT VERIFIED / NOT COMMITTED / BLOCKED** | **Direct B05 Entry Gate Failure.** `HW_V16_A07_RESUME_CHECKPOINT.md` §4 confirms `0` builds/tests have been run on A07 edits and worktree awaits GPT acceptance of `A06-R1` before resuming Step 2/5 of `A07`. |
| **B04** | `fix/v1.6-b04-input-ui` | Committed & pushed (`6fd63fb3d566f9f44777155a7cdeb75631520561`) | **PASS** | UI/input isolation baseline intact. |

---

## 2. Read-Only Source Diff & Targeted Bug Pre-Audit

Without modifying any source files or executing tests against unaccepted code:

1. **Uncommitted `A07` Diff Inspected in `G:\HOLLOW WOODS` (`4 files changed, 47 insertions(+), 42 deletions(-)`):**
   - `GameScene.ts` (`+20/-20` block summary, 72 lines changed in diff): adds `dialogue_completed` handlers for `talked_to_finn_rumors` / `campfire_knight_q3_completed`, updates `npc_finn` & `npc_campfire_knight` quest indicators, updates `broken_bell_shrine` boss trigger flags, adds guard on `relic_heart_of_roots` & drops premature `clapper_collected` assignment in `finishMireWardenDefeat()`.
   - `PlayerState.ts` (`8` lines changed): prevents `mire_pillars_solved` from advancing to `Q06_RETRIEVE_CLAPPER` unless `mire_root_seal_broken || shrine_bridge_lowered`.
   - `BossEncounterSystem.ts` (`4` lines changed): guards `addItem('relic_heart_of_roots', 1)` with `!state.hasFlag('boss_mire_warden_defeated') && state.getItemCount('relic_heart_of_roots') === 0`.
   - `WorldGatingSystem.ts` (`5` lines changed): restricts `isZoneUnlocked('broken_bell_shrine')` to `mire_root_seal_broken || shrine_bridge_lowered || clapper_collected`.
2. **Baseline `A05` Audit (`DialogueSystem.ts:445-488`):**
   - Verified persistent markers `dlg_trust:<dialogueKey>`, `dlg_quest:<dialogueKey>`, and `dlg_reward:<dialogueKey>` (plus `hadRuneCharmBeforePass` for `edda_rune_guide`) already exist in `DialogueSystem.ts`.
   - Notice that checking `state.getItemCount(rewardItem) === 0` alone (e.g., in `BossEncounterSystem.ts` draft or non-dialogue item pickups) will need runtime regression verification once `A07` lands, specifically covering consumed/converted items.

---

## 3. Target Checklist Status (`NOT EXECUTED DUE TO ENTRY GATE`)

| Targeted Item | Status | Note |
| :--- | :---: | :--- |
| `H4-NEW-03` / `OPEN-01` (`relic_heart_of_roots x2`, early `clapper_collected`) | **`BLOCKED / NOT RUN`** | Uncommitted `A07` draft addresses these; awaiting A07 test, commit & acceptance. |
| `OPEN-02` (`broken_bell_shrine` early unlock) | **`BLOCKED / NOT RUN`** | Uncommitted `A07` draft addresses this; awaiting A07 test, commit & acceptance. |
| `Finn dialogue routing`, `SQ08 optional` | **`BLOCKED / NOT RUN`** | Uncommitted `A07` draft addresses this; awaiting A07 test, commit & acceptance. |
| `edda_rune_guide`, `Neris poultice`, `A05 trust markers`, consumed-item reopen tests | **`BLOCKED / NOT RUN`** | Full B05 test matrix (`New Game`, `SQ08 skipped/completed`, consumed reward reopen, `16` Ending boundary cases, `Identity Reveal`, Save/Load) not run until A07 & A06-R1 checkpoints are accepted & merged. |

---

## 4. Required Steps to Unblock `HW-V16-B05`

1. GPT / Owner accept `HW-V16-A06-R1` (`fc5bf1d5f849f694a6b92e270ef747b2f2914246`).
2. Resume & complete `HW-V16-A07` (`Steps 2–5` per `HW_V16_A07_RESUME_CHECKPOINT.md`), run full verification, commit `feat(narrative): stabilize quest progression and ending compatibility [HW-V16-A07]`, push, and accept.
3. Re-dispatch `HW-V16-B05` against the merged/verified `A06-R1` + `A07` + `B04` codebase.

---

## 5. Evidence

- Entry-gate inspection snapshot: `Read/V1.5/Reports/Evidence/HW-V16-B05/b05_entry_gate_audit.json`
