# HW-V16-B03 — MOVEMENT & VIETNAMESE IME COMPATIBILITY REPORT

- **Task ID:** `HW-V16-B03`
- **Project:** `HOLLOW WOODS` (`V1.6.0 — The Unbroken Oath`)
- **Roadmap:** `3.1`
- **Baseline Checkpoint (HW-V16-B02):** `c3b6bbf5e6dd69e67ba5c2d8e822a30f0c25fa26`
- **Isolated Worktree:** `G:\HOLLOW_WOODS_B03`
- **Branch:** `fix/v1.6-b03-movement-ime`
- **Primary / Prior Worktree Safety:**
  - `G:\HOLLOW WOODS` (`e4edb07bcbf2865681277a12404624c4c495bb1f`, uncommitted `A07`): untouched.
  - `G:\HOLLOW_WOODS_B01` (`ce88553ad2a2a5062e8234c2e36a62edfcce6371`): untouched.
  - `G:\HOLLOW_WOODS_B02` (`c3b6bbf5e6dd69e67ba5c2d8e822a30f0c25fa26`): untouched.
- **Physical OS EVKey Verification Status:** **`PHYSICAL EVKEY NOT RUN`** (Headless Chromium Playwright environment only simulates synthetic/DOM `KeyboardEvent` `keyCode=229` / `VK_PACKET` `keyCode=231` / `CompositionEvent` packets; interactive Windows EVKey daemon hook testing was not run in this environment).

---

## 1. Root Causes Identified

1. **Movement stall/stutter under IME `keyCode=229` with valid `KeyboardEvent.code`:**
   - Previously in `BlackKnightPlayer.ts`, any packet with `keyCode === 229` (`event.key === 'Process'`) marked held movement as `confirmed = false` (`450ms` expiration) and bypassed `syncPhysicalShift()`, dropping sustained holds after 450 ms (`before_movement_baseline.json`: `mid_600ms.codes = []`).
2. **Stuck key on IME `keyup` (`keyCode=229`) with hardware `event.code`:**
   - Previously in `BlackKnightPlayer.ts`, `handleDOMKeyUp()` called `event.stopImmediatePropagation(); return;` before `releasePhysicalCode(code)` whenever `isImeMovementPacket(event)` was true, leaving `activePhysicalCodes` latched when `keyup` arrived under IME `229`.
   - Synthetic `VK_PACKET` (`keyCode=231`, empty `event.code`) lacked accented Vietnamese Telex mappings (`ư`, `đ`, `á..ạ`, `ă..ặ`, `ơ..ợ`, `â..ậ`, `ê..ệ`, `í..ị`) in `resolvePhysicalCode()` and also skipped releasing unconfirmed (`confirmed === false`) holds on `keyup`.
3. **Capture-phase `preventDefault()` blocking Phaser `KeyboardManager` shortcuts (`KeyJ`, `KeyI`, `Tab`, `Escape`):**
   - `BlackKnightPlayer` attached its `window` `keydown` listener with `{ capture: true }` and invoked `event.preventDefault()`. Because Phaser's `KeyboardManager.onKeyDown` runs in the bubble phase and immediately returns when `event.defaultPrevented === true`, Phaser UI/modal/dialogue listeners stopped firing whenever `BlackKnightPlayer` captured those keys (`[I]`, `[Tab]`, `[J]`, idle `[Escape]`).
4. **Duplicate modal toggle / `ESC` listeners & stale typing replay:**
   - `CraftingModal`, `JournalModal`, `EquipmentModal`, `CampfireModal`, `CauldronModal`, `StorageChestModal`, and `BlackKnightPlayer` one-shot flags (`KeyI`/`Tab`/`KeyJ`/`Escape`) registered overlapping listeners alongside `UIScene`, causing `Tab` double-toggles (`before_movement_baseline.json`: `CraftingModal` remained `true -> true`), `ESC` opening `PauseModal` when closing overlay modals, `Escape` failing to close `PauseModal` directly in `UIScene.handleESC()`, and Phaser `KeyboardPlugin` queue replay duplicating search typing characters (`CraftingModal`).
5. **Focus / Pagehide cleanup & UI open reset:**
   - `UIScene.handleModalOpened()` did not call `player.resetAllInputState()` consistently across all UI modals, and `BlackKnightPlayer` did not listen to `pagehide` or call `resetAllInputState()` inside `cleanupDOMListeners()`.

---

## 2. Changes Implemented (`G:\HOLLOW_WOODS_B03`)

Local step backups were stored under `Backups/steps/backup_hw_v16_b03/` (not staged or committed).

| File | Summary of Changes |
| :--- | :--- |
| `src/entities/BlackKnightPlayer.ts` | Expanded `resolvePhysicalCode()` with accented Telex Unicode keys (`ư/ă/ơ/â/á..ạ/ê..ệ/í..ị/đ`) and `KeyC`/`KeyB`/`KeyN` codes/keys/keyCodes; added `hasHardwarePhysicalCode()` so `keyCode=229` events with real hardware `event.code` stay `confirmed=true` and sync `Shift`, while pure codeless synthetic `VK_PACKET` holds expire at `450ms` and release cleanly when unconfirmed; moved scroll/Tab `event.preventDefault()` to a bubble-phase listener (`boundPreventDefaultBubble`) so Phaser `KeyboardManager` sees `defaultPrevented === false`; removed duplicate UI one-shots (`KeyI`/`Tab`/`KeyJ`/`Escape`); added `pagehide` listener and `resetAllInputState()` inside `cleanupDOMListeners()`. |
| `src/scenes/UIScene.ts` | Centralized `[C]`, `[I]`, `[Tab]`, `[J]`, `[B]`, `[N]`, `[M]`, `[Escape]` in one `handleShortcut` handler using `WeakSet<KeyboardEvent>` deduplication (`seenShortcutEvents`), `event.repeat` / modifier / `BlackKnightPlayer.isTextInputOrComposing(event)` guards, and `BlackKnightPlayer.resolvePhysicalCode(event)`; added `player.resetAllInputState()` in `handleModalOpened()`; updated `handleESC()` to call `craftingModal.clearSearchIfActive()` before closing crafting and explicitly close `pauseModal` when open. |
| `src/ui/CraftingModal.ts` | Added `clearSearchIfActive()`, removed duplicate `keydown-I`/`J`/`TAB`/`ESC` listeners (routed via `UIScene`), and added `WeakSet<KeyboardEvent>` (`seenSearchEvents`) deduplication to search typing listener. |
| `src/ui/JournalModal.ts` | Removed duplicate `keydown-J`/`I`/`ESC` listeners (routed via `UIScene`), preserving tab/page shortcuts (`1..4`, `M`, `A`/`D`/`LEFT`/`RIGHT`). |
| `src/ui/EquipmentModal.ts` | Removed duplicate `keydown-B`/`ESC` listeners while preserving clean reference cleanup in `destroy()`. |
| `src/ui/CampfireModal.ts` | Removed duplicate `keydown-ESC` listener so `UIScene.handleESC()` is the sole Escape dispatcher without bouncing into `PauseModal`. |
| `src/ui/CauldronModal.ts` | Removed duplicate `keydown-ESC` listener so `UIScene.handleESC()` handles Escape consistently. |
| `src/ui/StorageChestModal.ts` | Removed duplicate `keydown-ESC` listener so `UIScene.handleESC()` handles Escape consistently. |

---

## 3. Verification Results

All checks below ran inside `G:\HOLLOW_WOODS_B03` after the final code edit:

1. **Typecheck & Production Build:**
   - `npm run check` (`tsc --noEmit`): **PASS** (exit `0`)
   - `npm run build` (`tsc && vite build`): **PASS** (exit `0`, bundle built cleanly into `dist/`)
   - `npm run verify:data`: **15/15 PASS** (run prior to UI `.ts`-only cleanup; no data files modified)
2. **B03 Comprehensive Playwright Suite (`after_b03_verification.json`):** **18/18 PASS**, `0` `pageerror`, `0` `console.error`:
   - `wasd_4dir_walk_85`: PASS (`85 px/s` all 4 cardinal directions, `0` after release)
   - `diagonal_sequential_release_and_sprint_140`: PASS (`~85 px/s` diagonal, sequential release retains active axis, `140 px/s` sprint, `0` on full release)
   - `b01_scale_1.14_and_b02_nearest_preserved`: PASS (`scaleX=1.5` walk, `1.14` armed run, `FilterMode.NEAREST` (`1`) intact)
   - `synthetic_ime_229_hold_past_450ms_and_release`: PASS (synthetic `keyCode=229` + `code='KeyS'` held past `650ms` without dropping at `450ms`, clears to `codes=[]`, `spd=0` on `keyup` `keyCode=229`)
   - `synthetic_ime_229_short_release_no_stick`: PASS
   - `synthetic_vk_packet_telex_char_mapping`: PASS (synthetic `keyCode=231` `ư`/`đ`/`á` mapped to `KeyW`/`KeyD`/`KeyA` and released cleanly)
   - `canvas_composition_does_not_block_or_stick`: PASS
   - `alt_tab_blur_cleanup_and_resume`: PASS (`blur` clears `codes`/`shiftHeld`/`spd`, movement resumes cleanly afterwards)
   - `pagehide_cleanup`: PASS
   - `modal_single_toggles_C_I_Tab_J_B`: PASS (`HW-H4-12A` `[C]` single-toggle preserved; `[I]`, `[Tab]`, `[J]`, `[B]` single-toggle open & close)
   - `movement_cleared_on_modal_and_search_typing_esc`: PASS (`[C]` while holding `S` clears movement, typing `wasd` in Crafting search produces `searchQuery="wasd"` with `spd=0`, 1st `ESC` clears search, 2nd `ESC` closes modal without Pause)
   - `overlay_modals_esc_does_not_open_pause`: PASS (`CampfireModal`, `CauldronModal`, `StorageChestModal` close on `ESC` with `pauseOpen=false`)
   - `pause_modal_esc_toggle`: PASS
   - `ime_229_modal_shortcut_keyJ`: PASS
   - `dialogue_blocks_movement_and_esc_cancels`: PASS (`garth_warning` dialogue stops movement `spd=0`, `ESC` cancels dialogue without opening `PauseModal`)
   - `continuous_780ms_movement_and_clean_stop`: PASS (`6/6` samples `vx=85`, `0` on release)
   - `zero_page_errors` / `zero_console_errors`: PASS (`0` errors)
3. **Existing Walk/Run Regression Suites:**
   - `python tests/hw_bug_21b_walk_run_verification.py`: **10/10 PASS** (`4-dir walk`, `sprint`, `shift release`, `key-repeat`, `IME+blur`, `Pause ESC`, `unarmed/armed`, `Outer Woods transition`, `combat smoke`)
   - `python tests/hw_bug_26b_walkrun_fix_verification.py`: **5/5 PASS** (`600ms Shift watchdog`, `Outer Woods collision guardrail`, `open sprint resumption`, `combat action locks`, `Save Schema 3` & zero errors)

### Known Environment Limitation (Mandatory Disclosure)
- **`PHYSICAL EVKEY NOT RUN`**: Live Windows EVKey / UniKey OS-level desktop IME hooks cannot be interactively driven in this headless Chrome Playwright sandbox. All Vietnamese IME results above verify DOM/Browser synthetic `keyCode=229`, `VK_PACKET` (`keyCode=231`), and `CompositionEvent` paths only; physical EVKey acceptance testing by the Owner in Windows remains required for OS-level sign-off.

---

## 4. Evidence & Backup Paths

- `Read/V1.5/Reports/Evidence/HW-V16-B03/before_movement_baseline.json`
- `Read/V1.5/Reports/Evidence/HW-V16-B03/after_b03_verification.json`
- Local backup (uncommitted): `Backups/steps/backup_hw_v16_b03/`
