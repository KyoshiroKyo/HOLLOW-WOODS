# HOLLOW WOODS V1.1 — COMMAND C4-02A-HF: CRITICAL W-KEY FREEZE HOTFIX REPORT

- **Project:** HOLLOW WOODS V1.1 — *Dị Cảnh Rừng Liễu*
- **Command:** `C4-02A-HF` (P0 Gameplay Blocker Hotfix)
- **Workspace:** `G:\HOLLOW WOODS`
- **Live Dev Server:** `http://127.0.0.1:3000/` (Preserved continuously, HMR active)
- **Status:** **RESOLVED & VERIFIED IN LIVE CHROME (`0` Runtime Exceptions)**

---

## 1. Executive Summary

Pressing **`W`** or **`ArrowUp`** in Chrome immediately froze the entire Phaser 4.2.1 game loop, whereas **`A`**, **`S`**, and **`D`** continued running without crashing.

Live Chrome DevTools Protocol (CDP) reproduction against `http://127.0.0.1:3000/` isolated the exact root cause in one pass (**Hypothesis H — Missing / Out-of-Range Upward Animation Frames**):

- The active runtime sprite sheet `public/assets/characters/satyr/satyr_sheet.png` measures **`640 × 320` px** (`10 × 5` grid of `64 × 64` px cells = **`50` valid frame indices `0..49`**).
- `src/data/satyr_animations.json` still contained stale **`88`-frame (`0..87`)** indices authored for an older `1408 × 256` layout:
  - `down` (`[4..9]`), `left` (`[26..31]`), and `right` (`[48..53]` clipped by Phaser to `[48, 49]`) all retained `>= 2` frames `< 50`, so `A`, `S`, and `D` did not throw (though they rendered mismatched/blank frames).
  - **Every `*_up` animation** (`satyr_idle_up` `[66..69]`, `satyr_walk_up` `[70..75]`, `satyr_run_up` `[70..75]`, `satyr_attack_up` `[76..79]`, `satyr_hurt_up` `[80..82]`, `satyr_death_up` `[83..87]`) had **100% of its frame indices `>= 50`**.
  - Consequently, `anims.generateFrameNumbers('satyr_sheet', { frames: [70..75] })` returned an **empty array `[]`** (`0` frames).
  - On the very first frame where `facing` became `'up'`, `SatyrPlayer.playWalkOrRunAnim()` invoked `this.play('satyr_walk_up', true)`, causing Phaser's `Animation.getFirstTick()` to evaluate `this.frames[0].duration` on `undefined` and throw an uncaught `TypeError` inside `GameScene.update()`, permanently halting the `requestAnimationFrame` loop.

---

## 2. Pre-Fix Reproduction & Isolation Matrix

Reproduced via real Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) against `http://127.0.0.1:3000/` (`repro_w_freeze_chrome.mjs` → `w_repro_before.json`):

### Uncaught Exception Captured Before Fix
```text
TypeError: Cannot read properties of undefined (reading 'duration')
    at Animation2.getFirstTick (phaser.js:1454:95)
    at AnimationState2.startAnimation (phaser.js:3133:14)
    at AnimationState2.play (phaser.js:3037:21)
    at SatyrPlayer.play (phaser.js:48189:27)
    at SatyrPlayer.playWalkOrRunAnim (src/entities/SatyrPlayer.ts:171:12)
    at SatyrPlayer.handleMovement (src/entities/SatyrPlayer.ts:120:12)
    at SatyrPlayer.update (src/entities/SatyrPlayer.ts:88:12)
    at GameScene.update (src/scenes/GameScene.ts:408:19)
```

### Pre-Fix Isolation Results
| # | Isolation Case | Result Before Fix | Root Mechanism |
| :---: | :--- | :---: | :--- |
| 1 | `W` alone (`350ms`) | **CRASH / FREEZE** | `facing = 'up'` → `satyr_walk_up` had `0` frames (`[70..75]` > `49`) |
| 2 | `ArrowUp` alone (`350ms`) | **CRASH / FREEZE** | Same `up` branch (`cursors.up.isDown`) → `satyr_walk_up` (`0` frames) |
| 3 | `A` alone (`350ms`) | No exception | `satyr_walk_left` (`[26..31]`) had 6 indices `< 50` |
| 4 | `S` alone (`350ms`) | No exception | `satyr_walk_down` (`[4..9]`) had 6 indices `< 50` |
| 5 | `D` alone (`350ms`) | No exception | `satyr_walk_right` (`[48..53]`) clipped to `[48, 49]` (`2` frames `< 50`) |
| 6 | `W + A` diagonal (from `facing=down`) | No exception | Tie-breaker set `facing = 'left'` (`[26..31]`) |
| 7 | `W + D` diagonal (when `facing=up`) | **CRASH / FREEZE** | `satyr_walk_up` (`0` frames) |
| 8 | `W + S` opposing (after `up` frame) | **CRASH / FREEZE** | `satyr_idle_up` (`[66..69]`, `0` frames) |
| 9 | `W` near north boundary wall | **CRASH / FREEZE** | `satyr_walk_up` (`0` frames, crashed before physics step) |
| 10 | `W` short tap (`50ms`) | **CRASH / FREEZE** | First `update()` tick triggered `satyr_walk_up` |

---

## 3. Backup & SHA-256 Verification

All modified animation and controller files were backed up to `C:\HOLLOW_WOODS_BACKUPS\V1.1\C4-02A\20261115_011211\` and SHA-256 verified byte-for-byte prior to editing:

| File | Original Size | Pre-Edit SHA-256 | Backup Verified |
| :--- | :---: | :--- | :---: |
| `src/data/satyr_animations.json` | `4,251` B | `02818d60c12c8de3627ba03510e48f47619b47e41eca789acef715dde2697172` | **PASS** |
| `src/animation/SatyrAnimations.ts` | `1,722` B | `c6620e9b5d9d9ec8da828898fa9f7a123c9d5db73216b6a669842e1e92791982` | **PASS** |
| `src/entities/SatyrPlayer.ts` | `14,840` B | `e82d6d14a849e64063979535bb53d8518ab75683516ff71e7cf20524e262a056` | **PASS** |

---

## 4. Minimal Surgical Fix Applied

1. **`src/data/satyr_animations.json`**
   - Remapped all 27 directional and legacy animation keys from invalid `0..87` indices to the actual non-empty rows of the `640 × 320` (`50`-frame `0..49`) `satyr_sheet.png`:
     - **Row 0 (`[0..5]`):** Idle (`satyr_idle_{down,left,right,up}`, `satyr_idle`)
     - **Row 1 (`[10..17]`):** Walk (`8 fps`) & Run (`13 fps`) (`satyr_walk_*`, `satyr_run_*`)
     - **Row 2 (`[20..29]`):** Attack (`satyr_attack_*`, `satyr_attack`)
     - **Row 3 (`[30..33]`):** Hurt (`satyr_hurt_*`, `satyr_hurt`)
     - **Row 4 (`[40..49]`):** Death (`satyr_death_*`, `satyr_death`)
2. **`src/animation/SatyrAnimations.ts`**
   - Added defensive frame validation: if `anims.generateFrameNumbers(SATYR_SHEET_KEY, { frames: spec.frames })` ever produces `0` valid frames, it safely falls back to frame `[0]` rather than registering a fatal `0`-frame Phaser `Animation`.
3. **`src/entities/SatyrPlayer.ts`**
   - Added `safePlayAnim(key, ignoreIfPlaying)` guards across `playWalkOrRunAnim()`, `playIdleAnim()`, `attack()`, `playHurt()`, and `die()` so missing or empty animations can never crash `GameScene.update()`.
   - Added automatic horizontal mirroring (`setFlipX(true)` when moving/facing left, `setFlipX(false)` when moving/facing right) for `<= 50`-frame sheets while keeping future `> 50`-frame 4-direction sheets unflipped (`setFlipX(false)`).
   - Preserved normalized diagonal velocity (`85 / √2 = 60.10 px/s`), `Direction Persistence Rule`, stamina hysteresis, `[SPACE]` melee attack (decoupled from `[J]` Journal), and unified `PlayerState.stats` delegation.

---

## 5. Post-Fix Live Chrome Regression Results

Verified in headless Chrome against `http://127.0.0.1:3000/` (`verify_w_hotfix_chrome.mjs` → `w_verify_after.json`) plus `npx tsc --noEmit` (`exit code 0`):

### Movement & Isolation Regression Matrix (`14 / 14 PASS`)
| # | Test Case | Position Delta `(dx, dy)` | Mid Velocity `(vx, vy)` | Active → Idle Animation | `flipX` | Exceptions | Result |
| :---: | :--- | :---: | :---: | :--- | :---: | :---: | :---: |
| 1 | `W` alone | `(0, -24.08)` | `(0, -85)` | `satyr_walk_up` → `satyr_idle_up` | `false` | `0` | **PASS** |
| 2 | `ArrowUp` alone | `(0, -22.67)` | `(0, -85)` | `satyr_walk_up` → `satyr_idle_up` | `false` | `0` | **PASS** |
| 3 | `A` alone | `(-32.58, 0)` | `(-85, 0)` | `satyr_walk_left` → `satyr_idle_left` | `true` | `0` | **PASS** |
| 4 | `S` alone | `(0, +34.00)` | `(0, +85)` | `satyr_walk_down` → `satyr_idle_down` | `false` | `0` | **PASS** |
| 5 | `D` alone | `(+31.17, 0)` | `(+85, 0)` | `satyr_walk_right` → `satyr_idle_right` | `false` | `0` | **PASS** |
| 6 | `W + A` diagonal | `(-24.46, -24.46)` | `(-60.1, -60.1)` | `satyr_walk_up` → `satyr_idle_left` | `true` | `0` | **PASS** |
| 7 | `W + D` diagonal | `(+24.46, -24.46)` | `(+60.1, -60.1)` | `satyr_walk_up` → `satyr_idle_right` | `false` | `0` | **PASS** |
| 8 | `W + S` opposing | `(0, +2.83)` | `(0, 0)` | `satyr_idle_down` → `satyr_idle_down` | `false` | `0` | **PASS** |
| 9 | `W` into north wall `(120, 54)` | `(0, -22.40)` | `(0, -85)` | `satyr_walk_up` → `satyr_idle_up` | `false` | `0` | **PASS** |
| 10 | `W` short tap (`60ms`) | `(0, -9.92)` | `(0, -85)` | `satyr_walk_up` → `satyr_idle_up` | `false` | `0` | **PASS** |
| 11 | `ArrowLeft` alone | `(-29.75, 0)` | `(-85, 0)` | `satyr_walk_left` → `satyr_idle_left` | `true` | `0` | **PASS** |
| 12 | `ArrowDown` alone | `(0, +34.00)` | `(0, +85)` | `satyr_walk_down` → `satyr_idle_down` | `false` | `0` | **PASS** |
| 13 | `ArrowRight` alone | `(+32.58, 0)` | `(+85, 0)` | `satyr_walk_right` → `satyr_idle_right` | `false` | `0` | **PASS** |
| 14 | Sprint `Shift + W` | `(0, -57.42)` | `(0, -140)` | `satyr_run_up` → `satyr_idle_up` | `false` | `0` | **PASS** |

### Gameplay Subsystem Regression Checks (`6 / 6 PASS`)
- **Camera Upward Follow:** `camScrollY` moved smoothly upward (`-15.64` → `-45.36`, `cameraFollowedUpward: true`).
- **Melee Attack Facing Up (`[SPACE]`):** `isAttacking: true`, played `satyr_attack` cleanly and returned to idle (`PASS`).
- **Lantern Toggle (`[F]`):** `isLanternOn: true` (`PASS`).
- **Journal Modal (`[J]`):** `journalOpen: true`, `attackedDuringJ: false` — `[J]` conflict completely eliminated (`PASS`).
- **Crafting Modal (`[I]`):** `craftingOpen: true` (`PASS`).
- **Pause Modal (`[ESC]`):** `pauseOpen: true` (`PASS`).
- **Total Runtime Exceptions:** `0`.

---

## 6. Safety & Constraints Check

- **Git State:** Untouched (`.git/index` and `.git/index.lock` unmodified; zero Git write commands executed).
- **Production Build:** `dist/` untouched (`npm run build` not executed).
- **Vite Dev Server:** Existing `http://127.0.0.1:3000/` server preserved without interruption.
