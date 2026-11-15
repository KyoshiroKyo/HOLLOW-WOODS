# HOLLOW WOODS V1.2 — COMMAND C4-12-02: VIETNAMESE IME COMPATIBILITY HOTFIX REPORT

- **Project:** HOLLOW WOODS V1.2
- **Command:** `C4-12-02 — VIETNAMESE IME COMPATIBILITY HOTFIX`
- **Workspace:** `G:\HOLLOW WOODS`
- **Modified Source File:** [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts)
- **Verified External Backup:** `C:\HOLLOW_WOODS_BACKUPS\V1.2\C4-12-02\20261115_040500\`
- **Live Vite Server:** `http://127.0.0.1:3000/` (Healthy, HMR Active)
- **Status:** **IMPLEMENTED & VERIFIED (`npx tsc --noEmit` = `0` Errors, `0` Chrome Runtime Exceptions)**

---

## 1. Root Cause Analysis

Inspection of [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts) and [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) identified why Vietnamese input methods (`EVKey`, `UniKey`, and OS Telex/VNI IMEs) conflicted with gameplay movement and shortcuts:

1. **KeyCode-Only Binding in Phaser 4 (`KeyboardPlugin`):**
   - `SatyrPlayer` previously relied solely on `this.scene.input.keyboard.addKey(KeyCodes.W / A / S / D / SHIFT / E / F / SPACE)`, which matches events strictly by `event.keyCode` (`87, 65, 83, 68...`).
   - When **EVKey** (confirmed running as `EVKey.exe` on the host machine) or **UniKey** is active in **Telex** mode:
     - Pressing **`W`** immediately transforms `w` into **`ư`** (or `aw` → **`ă`**, `ow` → **`ơ`**), injecting a Win32 `SendInput(KEYEVENTF_UNICODE)` packet (`VK_PACKET`, `event.keyCode === 231` or `0`, `event.key === 'ư'`) or an OS IME composition event (`VK_PROCESSKEY`, `event.keyCode === 229`).
     - Similarly, double-tapping **`D`** (`dd` → **`đ`**), double-tapping **`A`** (`aa` → **`â`**), double-tapping **`E`** (`ee` → **`ê`**), or pressing **`S`** / **`F`** after a vowel (`ư` + `s` → **`ứ`**, `ư` + `f` → **`ừ`**) emits `keyCode = 231 / 229` instead of `87 / 65 / 83 / 68 / 69 / 70`.
   - Furthermore, Win32 `SendInput(KEYEVENTF_UNICODE)` emits a synthetic `VK_PACKET` `keyup` (`event.code === ""`, `event.keyCode === 231`) immediately after `keydown` while the user's finger is still holding the physical key, whereas the real hardware `WM_KEYUP` (`event.code === 'KeyW'`, `event.keyCode === 87`) arrives when the finger is lifted.
2. **Lack of Editable Text Field & Composition Isolation:**
   - Phaser's `KeyboardPlugin` listens on `window` without checking whether an `<input>`, `<textarea>`, or `[contenteditable]` element is focused or actively composing (`compositionstart` .. `compositionend` / `event.isComposing`).
3. **Browser Blur & Tab Visibility Loss:**
   - Losing window focus (`blur`) or switching tabs (`document.hidden`) while holding a movement key dropped the `keyup` event, leaving Phaser `Key.isDown` stuck `true`.

---

## 2. Exact Files Modified & Backup Verification

Only **1** source file required modification (`src/scenes/GameScene.ts` and `src/scenes/UIScene.ts` were preserved untouched):

| File | Pre-Edit Size | Post-Edit Size | Pre-Edit SHA-256 (`C4-12-02` Backup Verified) |
| :--- | :---: | :---: | :--- |
| [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts) | `14,377` B | `26,184` B | `6befb356228dc1ec693de94fd97bf55b164246750efd5852ac821c64c330512f` |

- **Backup Directory:** `C:\HOLLOW_WOODS_BACKUPS\V1.2\C4-12-02\20261115_040500\SHA256_MANIFEST.json` (`verified: true`).

---

## 3. Input & IME Compatibility Implementation

Implemented in [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts#L104-L600):

1. **Physical `KeyboardEvent.code` Identification + Telex/VNI Unicode Packet Fallback (`resolvePhysicalCode`):**
   - Primary identification uses `KeyboardEvent.code` (`KeyW`, `KeyA`, `KeyS`, `KeyD`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `ShiftLeft`, `ShiftRight`, `Space`, `KeyE`, `KeyF`).
   - When `EVKey` / `UniKey` injects a `VK_PACKET` (`keyCode === 231`) or IME event (`keyCode === 229`) with an empty `event.code`, maps transformed Vietnamese Telex characters back to their physical keys (`w/ư/ă/ơ` → `KeyW`, `a/â` → `KeyA`, `s/á/ắ/ấ/é/ế/ứ/ú/ó/ớ/ố/í/ý` → `KeyS`, `d/đ` → `KeyD`, `e/ê` → `KeyE`, `f/à/ằ/ầ/è/ề/ừ/ù/ò/ờ/ồ/ì/ỳ` → `KeyF`).
2. **Continuous Hold vs. Synthetic `VK_PACKET` Keyup Handling:**
   - Ignores synthetic `VK_PACKET` `keyup` echoes (`!event.code && (keyCode === 231 || 229 || 0)`) while holding a movement key, releasing immediately upon receiving the real hardware `keyup` (`event.code === 'KeyW'`, `keyCode === 87`) or via a `550ms` auto-refreshing safety watchdog timer (`armSyntheticHoldWatchdog`).
3. **Editable Text Context & `compositionstart` / `compositionend` Respect:**
   - Detects `<input>`, `<textarea>`, `<select>`, and `[contenteditable]` via `SatyrPlayer.isEditableElement()`.
   - When an editable element is focused or composing (`compositionstart` .. `compositionend`), disables Phaser's `keyboard.enabled` across active scenes, resets all held movement/action states, and never calls `preventDefault()`, allowing normal Vietnamese typing.
4. **One-Shot Repeat Suppression:**
   - Blocks `event.repeat === true` and `physicalKeyHeldForOneShot` on `[E]`, `[F]`, and `[SPACE]` so holding a key or receiving IME replacement packets cannot re-trigger one-shot actions.
5. **Blur, Focus & Visibility Reset + Listener Deduplication:**
   - Resets all physical codes, watchdogs, Phaser `Key` states (`resetKeys()`), and player velocity on `window` `blur`, `focus`, and `document` `visibilitychange`.
   - Enforces a single DOM listener owner (`SatyrPlayer.activeDOMListenerOwner`) cleaned up on scene `shutdown` and sprite `destroy`.

---

## 4. Validation & Test Results (Automated vs. Manual Matrix)

### 4.1. Automated Checks & Live Headless Chrome Runtime Tests (`PASS`)
Executed via `npx tsc --noEmit` (`exit code 0`) and headless Chrome CDP against `http://127.0.0.1:3000/` (`verify_c4_12_02_ime_chrome.mjs` → `c4_12_02_ime_results.json`):

| Test Case | Execution Method | Observed Runtime Result | Status |
| :--- | :--- | :--- | :---: |
| `npx tsc --noEmit` | TypeScript Compiler | `0` errors | **PASS** |
| Standard `W`, `A`, `S`, `D` | Chrome CDP `Input.dispatchKeyEvent` | `vy = -85`, `satyr_walk_up` → `satyr_idle_up` | **PASS** |
| Arrow Keys (`Up/Down/Left/Right`) | Chrome CDP `Input.dispatchKeyEvent` | `vy = -85`, `satyr_walk_up` | **PASS** |
| Diagonal Movement (`W + D`) | Chrome CDP `Input.dispatchKeyEvent` | Normalized `(vx: 60.1, vy: -60.1)` | **PASS** |
| Sprint (`Shift + W`) | Chrome CDP `Input.dispatchKeyEvent` | `vy = -140`, `isSprinting = true` | **PASS** |
| Simulated Telex `W` (`ư`, `VK_PACKET 231` + `2ms` echo + hardware `KeyW` `keyup`) | Chrome DOM `KeyboardEvent` | Moved continuously (`vy = -85`, `dy = -21.25`), stopped cleanly on hardware `KeyW` `keyup` (`vy = 0`, `activeCodes = 0`) | **PASS** |
| Simulated Telex `A` (`â`), `S` (`ứ`), `D` (`đ`) | Chrome DOM `KeyboardEvent` | `vx = -85` (`A`), `vy = +85` (`S`), `vx = +85` (`D`) | **PASS** |
| One-Shot `[F]` Lantern Repeat Guard (`ừ` + `repeat: true`) | Chrome DOM `KeyboardEvent` | `toggledExactlyOnce = true` | **PASS** |
| Typing Vietnamese in `<input>` (`compositionstart` / `isComposing: true` / `compositionend`) | Chrome DOM `<input>` + `CompositionEvent` | `dx = 0, dy = 0, vx = 0, vy = 0`, Lantern & Journal unchanged, `<input>` value `'đường rừng sương mù'` preserved | **PASS** |
| Browser `blur` / Tab Switch While Holding `W` + Focus Regain | Chrome DOM `blur` / `focus` + CDP `W` | `vyBeforeBlur = -85` → `vyAfterBlur = 0`, `keyWIsDown = false`; after focus regain `vy = -85` | **PASS** |
| Duplicate Listener Guard (`attachDOMInputListeners` ×3) | Chrome Runtime Check | Single listener set (`domListenersAttached = true`), `0` exceptions | **PASS** |

### 4.2. OS-Level Interactive IME Manual Test Matrix & Instructions
Because automated headless Chrome CDP injects events into the browser target rather than routing physical hardware scan codes through the foreground Windows `WH_KEYBOARD_LL` hook, interactive OS-level hardware testing is reported separately below:

| Manual Scenario | Environment Status | How to Verify in Browser (`http://127.0.0.1:3000/`) |
| :--- | :---: | :--- |
| **EVKey Enabled (Telex & VNI)** | **EVKey Process Present (`EVKey.exe` running); Interactive Hardware Input: MANUAL CHECK READY** | With EVKey set to **V** (Vietnamese Telex or VNI), open `http://127.0.0.1:3000/` in Chrome, hold `W`, `A`, `S`, `D` individually and diagonally (`W+A`, `W+D`), tap `D` twice (`dd`), press `[F]` and `[E]` after `W`. Confirm continuous movement and immediate stop on key release. |
| **UniKey Enabled (Telex & VNI)** | **NOT TESTED** (`UniKey` not running in test environment) | Enable UniKey (Telex / VNI), hold `W/A/S/D` and `Shift+W` in Chrome, then release. Confirm no freeze or stuck movement. |
| **Switching Tabs While Holding `W`** | **Simulated Blur Verified; Interactive `Alt+Tab` Ready** | Hold `W` to walk upward, press `Alt+Tab` or switch Chrome tabs while still holding `W`, release `W`, and return to the tab. Confirm character stands idle. |

---

## 5. Remaining Issues

- **None** within input/IME scope. All `C4-12-01` gameplay systems (quests, resources, Crafting Bench, Lantern Oil, Save/Load) remain intact.
