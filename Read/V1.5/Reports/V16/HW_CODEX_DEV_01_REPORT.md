# HW-CODEX-DEV-01 — QA entity snapshot

**PARTIAL** · Implemented and verified the independent read-only slice. F9 lists active entities by category and supports filtering by name, type or zone. JSON export includes active rows, registered catalog, mod and asset references, registry checks, current logs and performance. Checks flag missing texture/animation registration, player gait mismatch, unknown exposed runtime key, duplicate exposed ID, invalid/out-of-zone position, invalid collision size and unwanted apparition physics. Existing Developer actions and leaderboard guard are unchanged. No new spawn/factory, automatic runtime edits or new teleport workflow.

- TypeScript and private QA/production builds passed. Chromium production F4/F9 stayed locked with `?dev=1`. Chromium private QA opened/closed/reopened F9 with one panel, filtered NPCs and captured a valid JSON payload with 11 active entries and 23 catalog entries including mod metadata. Zero runtime exceptions/HTTP errors in the two smokes. Chromium fixture intercepted Blob export to inspect the download payload.
- Validator local 23/23, RT-002 28/28, SE-004 app bundle scan and SaveManager 18/18 passed. Vite/Chromium processes closed and test profiles cleaned. Evidence at `scratch/hw-codex-dev-01/`.
- Remaining: approval/spawnability model and full spawn lifecycle, safe navigation, general collider-anchor diagnostics and coverage of live boss/apparition in the UI. Safe navigation depends on the WORLD-02 destination policy. No verified spawn/teleport coverage claimed.

## Other R4 gates

- QA-MICRO-01 and MICRO-03-R1 reuse their verified checkpoint results. No new MICRO-01 AG ingestion was performed.
- BALANCE-01-R2 needs the ecology/Sanity tuning decision and identification of Reaper. Candidate 30 HP corresponds to 3/2/2 landed hits for staff/hatchet/spear by source. No gameplay patch or timed damage trial.
- BOSS-01-R3 still needs approved distinct artwork and a defined Vaelen aid behavior for playtest. FIX-18 identifies the runtime encounter; FIX-19 shows the shared base art. Gameplay implementation and boss QA remain outstanding. No Canon or asset edits.
