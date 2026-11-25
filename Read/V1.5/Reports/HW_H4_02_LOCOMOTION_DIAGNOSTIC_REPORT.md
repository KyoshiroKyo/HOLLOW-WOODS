# HW-H4-02 — WALK/RUN STATE & BUG-26B DIAGNOSTIC REPORT

**Dự án:** HOLLOW WOODS (Kyoshiro Studio)
**Giao thức:** HOLLOW WOODS — HYDRO HIGH ENGINEERING PROTOCOL V4
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`
**HEAD Commit:** `0617668a97f462877cbe2c30d304323e8fd48f6e` *(kèm thay đổi chưa commit từ `HW-H4-01` tại `src/systems/EndingSystem.ts` và báo cáo nghiệm thu)*
**Ngày thực hiện:** 25/11/2026

---

## 1. Tóm tắt kết luận & Quyết định kỹ thuật

1. **Logic Walk/Run/Idle trong production source hoạt động chuẩn xác:** Toàn bộ ma trận kiểm tra 4 hướng (`Armed` tại `outer_woods`, `Unarmed` tại `bellhollow`), 10 chu kỳ lặp `Idle → Walk → Run → Walk → Idle`, giữ `W` rồi nhả `Shift` theo cả hai thứ tự phím, `key-repeat`, mất tiêu điểm `Alt-Tab blur/focus`, đổi vũ khí `[X]`, mở/đóng `Journal [J]` / `Equipment [B]` / `Pause [ESC]` + `Resume`, `Continue` Save/Load, hồi phục sau Guardrail chạm vật cản và hồi quy `Combat`/`Roll` đều chuyển trạng thái đúng `85 px/s (walk) ↔ 140 px/s (run) ↔ 0 px/s (idle)`.
2. **Bảo toàn 100% Idle Animation 160ms/frame:** Tất cả 8 clip Idle (`wayfarer_idle_*` và `wayfarer_unarmed_idle_*`) giữ nguyên `160 ms/frame`, `6 frames`, `repeat: -1`.
3. **Nguyên nhân lỗi lịch sử của `tests/hw_bug_26b_walkrun_fix_verification.py`:** Không phải production bug. Tái hiện thực nghiệm frame-by-frame cho thấy Test 2 dùng `time.sleep(0.15) + time.sleep(0.8)` (`950 ms` wall-clock) trong khi dưới headless Chrome SwiftShader (~`100–108 ms/frame`), nhân vật từ `(1155, 615)` mới chạm vật cản `x=1145` tại `~759 ms`, khiến tại mốc `967.3 ms` thời gian bị chặn mới đạt **`232.1 ms < 250 ms`** (`BLOCKED_MOVEMENT_GUARDRAIL_MS`). Ngay frame kế tiếp (`1070.8 ms`, bị chặn `335.2 ms`), Guardrail hạ xuống `wayfarer_walk_left` (`85 px/s`, `isSprinting=false`). Phân loại theo Quy tắc §4: **`Lỗi môi trường kiểm thử` (Timing race condition của script test dưới SwiftShader)**.
4. **Không sửa code production / Không sửa Scale Pop / HD:** Tuân thủ Quy tắc §4 và Ràng buộc cứng §5 (dành Scale Pop & HD Consistency cho Codex ngày 27/11/2026), **không chỉnh sửa** `BlackKnightPlayer.ts`, `BlackKnightAnimations.ts`, scale/asset hay nới assertion của `hw_bug_26b_walkrun_fix_verification.py`. Chỉ xuất dữ liệu đo đạc đầy đủ để bàn giao cho Codex ở Mục 5.

---

## 2. Kiểm toán mã nguồn (Source Audit)

| Thành phần | Vị trí | Cơ chế đã xác minh trong source |
| --- | --- | --- |
| Watchdog & Guardrail constants | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L1-L125) | `SHIFT_WATCHDOG_TIMEOUT_MS = 600`; `BLOCKED_MOVEMENT_GUARDRAIL_MS = 250`; đăng ký `boundWindowBlur`, `boundWindowFocus`, `boundVisibilityChange`, `boundPointerDown`. |
| Scale & Foot Anchor | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L220-L310) | `ANIMATION_START` gọi `syncBodyFootAnchor()`; `ANIMATION_UPDATE` trên `BLACK_KNIGHT_CONVERSION_MOTION_KEY` gọi lại `syncBodyFootAnchor()`. `getLocomotionArtworkScale()` trả về `base * 0.8` (`1.2`) cho `armed_run`; `base * 0.68` (`1.02`) cho frames `1..6` và `base * 0.78` (`1.17`) cho frames `7..12` của `unarmed_run`. *(Giữ nguyên không sửa)* |
| Reset Input & Blur | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L718-L760) | `resetAllInputState()` gọi `forceUnlockActionState()`, xóa `activePhysicalCodes`, `movementHolds`, đặt `isSprinting = false`, `isPhysicalShiftHeld = false`, `lastModifierShift = false`, `shiftExpiresAt = 0`, `blockedMovementStartTime = 0`, gọi `keyboard.resetKeys()` và `body.setVelocity(0, 0)`. |
| Update & Movement | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L1062-L1456) | `update()` kiểm tra `checkZoneWeaponAutoState()` mỗi `600 ms`, `movementHolds` TTL, Shift Watchdog auto-expiry (`shiftExpiresAt`), chạy `handleMovement()` khi `!isActionLocked()`. `playWalkOrRunAnim()` ép bất biến `!isRunning => _walk_` (`1387-1430`). |
| Animation Definitions | [BlackKnightAnimations.ts](file:///g:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts#L1-L146) | `ARMED_IDLE_FRAME_MS = 160`, `unarmed_idle: frameMs = 160` (`6 frames`); `walk` / `unarmed_walk` `170 ms` (`6 frames`); `run` / `unarmed_run` `70 ms` (`12 frames`, chu kỳ `840 ms`). |
| Modal UI Lock & Idle | [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L543-L590), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1819-L1989) | Khi `pauseModal.isOpen` hoặc `isUIBusy`: set velocity `(0,0)`, gọi `player.playIdle()`, `player.resetAllInputState()`. Khi `journalModal.onOpen` / `craftingModal.onOpen` / `pauseModal.onOpen` kích hoạt giữa frame, `resetAllInputState()` dừng vận tốc & `isSprinting` ngay lập tức, sau đó tick `GameScene.update()` kế tiếp (`<=180 ms` trên SwiftShader) gọi `playIdle()`. |
| UI Debounce & Focus | [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L3068-L3234), [PauseModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/PauseModal.ts#L743-L750) | `PauseModal.toggle()` chống dội `250 ms` (`this.lastToggleTime`); `UIScene.togglePause()` chặn `lastModalCloseTime < 300 ms`; `handleModalClosed()` reset input và trả focus về canvas. |
| Zone Auto-Sheathe | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L1988) | Tự động cất vũ khí (`_isWeaponDrawn = false`) tại `bellhollow`, `sanctuary_farm` và trong bán kính `160 px` quanh `(1435, 710)` của `outer_woods`; tự động rút kiếm ngoài vùng an toàn mỗi `600 ms`. |

---

## 3. Bằng chứng Runtime Telemetry (Playwright + Bàn phím thật trên `dist/`)

Toàn bộ các phiên đo bên dưới ghi nhận **`0` console errors** và **`0` page errors**.

### 3.1. Xác nhận thông số Clip Animation (Idle 160ms/frame)

| Animation Key | `msPerFrame` | Frames | Repeat | Trạng thái |
| --- | :---: | :---: | :---: | --- |
| `wayfarer_idle_down / up / left / right` | `160` | `6` | `-1` | PASS (Bảo toàn) |
| `wayfarer_unarmed_idle_down / up / left / right` | `160` | `6` | `-1` | PASS (Bảo toàn) |
| `wayfarer_walk_up` / `wayfarer_unarmed_walk_up` | `170` | `6` | `-1` | PASS |
| `wayfarer_run_up` / `wayfarer_unarmed_run_up` | `70` | `12` | `-1` | PASS |

### 3.2. Ma trận 4 hướng `Idle → Walk → Run → Walk → Idle` (Armed & Unarmed)

- **Armed** đo tại `outer_woods` (`(1220, 620)`):

| Hướng | Giai đoạn | `activePhysicalCodes` | Speed (`px/s`) | `isSprinting` | `animKey` | `frameName` (`idx`) | `scaleX / Y` | Display (`W×H`) | Foot Anchor (`x, y`) |
| --- | --- | --- | :---: | :---: | --- | --- | :---: | :---: | --- |
| **Up** (`KeyW`) | Idle 1 | `[]` | `0` | `false` | `wayfarer_idle_down` | `armed_idle_down_1` (`2`) | `1.5 / 1.5` | `96×96` | `(1220, 620)` |
| **Up** (`KeyW`) | Walk 1 | `['KeyW']` | `85` | `false` | `wayfarer_walk_up` | `armed_walk_up_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1220, 617.2)` |
| **Up** (`KeyW+ShiftLeft`) | Run | `['KeyW', 'ShiftLeft']` | `140` | `true` | `wayfarer_run_up` | `armed_run_sequence_up_0` (`1`) | `1.2 / 1.2` | `100.8×86.4` | `(1220, 611.1)` |
| **Up** (`KeyW`) | Walk 2 | `['KeyW']` | `85` | `false` | `wayfarer_walk_up` | `armed_walk_up_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1220, 607.3)` |
| **Down** (`KeyS`) | Idle 1 | `[]` | `0` | `false` | `wayfarer_idle_up` | `armed_idle_up_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1220, 620)` |
| **Down** (`KeyS`) | Walk 1 | `['KeyS']` | `85` | `false` | `wayfarer_walk_down` | `armed_walk_down_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1220, 622.8)` |
| **Down** (`KeyS+ShiftLeft`) | Run | `['KeyS', 'ShiftLeft']` | `140` | `true` | `wayfarer_run_down` | `armed_run_sequence_down_2` (`3`) | `1.2 / 1.2` | `100.8×86.4` | `(1220, 639)` |
| **Down** (`KeyS`) | Walk 2 | `['KeyS']` | `85` | `false` | `wayfarer_walk_down` | `armed_walk_down_1` (`2`) | `1.5 / 1.5` | `96×96` | `(1220, 639)` |
| **Down** | Idle 2 | `[]` | `0` | `false` | `wayfarer_idle_down` | `armed_idle_down_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1220, 639)` |
| **Left** (`KeyA`) | Walk 1 | `['KeyA']` | `85` | `false` | `wayfarer_walk_left` | `armed_walk_left_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1207.2, 620)` |
| **Left** (`KeyA+ShiftLeft`) | Run | `['KeyA', 'ShiftLeft']` | `140` | `true` | `wayfarer_run_left` | `armed_run_sequence_left_4` (`5`) | `1.2 / 1.2` | `100.8×86.4` | `(1179.2, 620)` |
| **Left** (`KeyA`) | Walk 2 | `['KeyA']` | `85` | `false` | `wayfarer_walk_left` | `armed_walk_left_2` (`3`) | `1.5 / 1.5` | `96×96` | `(1154.7, 620)` |
| **Left** | Idle 2 | `[]` | `0` | `false` | `wayfarer_idle_left` | `armed_idle_left_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1147.7, 620)` |
| **Right** (`KeyD`) | Walk 1 | `['KeyD']` | `85` | `false` | `wayfarer_walk_right` | `armed_walk_right_1` (`2`) | `1.5 / 1.5` | `96×96` | `(1237, 620)` |
| **Right** (`KeyD+ShiftLeft`) | Run | `['KeyD', 'ShiftLeft']` | `140` | `true` | `wayfarer_run_right` | `armed_run_sequence_right_4` (`5`) | `1.2 / 1.2` | `100.8×86.4` | `(1273.5, 620)` |
| **Right** (`KeyD`) | Walk 2 | `['KeyD']` | `85` | `false` | `wayfarer_walk_right` | `armed_walk_right_3` (`4`) | `1.5 / 1.5` | `96×96` | `(1296, 620)` |
| **Right** | Idle 2 | `[]` | `0` | `false` | `wayfarer_idle_right` | `armed_idle_right_0` (`1`) | `1.5 / 1.5` | `96×96` | `(1304.5, 620)` |

*(Ghi chú kỹ thuật ở đợt chạy Armed 4-hướng đầu tiên: mẫu `armed_up_idle2` chụp ở `160 ms` sau `keyup('KeyW')` — sớm hơn 1 tick `GameScene.update` dưới SwiftShader — nên vẫn mang vận tốc frame trước; mẫu `Idle 2` ở Up khi đợi `>= 220 ms` trong ma trận 10 chu kỳ bên dưới chuyển sạch về `spd=0`, `wayfarer_idle_up`.)*

- **Unarmed** đo trong Safe Zone `bellhollow` (`(960, 280)` để không bị auto-draw vũ khí của vùng nguy hiểm):

| Hướng | Giai đoạn | `activePhysicalCodes` | Speed (`px/s`) | `isSprinting` | `animKey` | `frameName` (`idx`) | `scaleX / Y` | Display (`W×H`) | Foot Anchor (`x, y`) |
| --- | --- | --- | :---: | :---: | --- | --- | :---: | :---: | --- |
| **Up** | Idle 1 → Walk 1 → Run → Walk 2 → Idle 2 | `[] → [KeyW] → [KeyW,ShiftLeft] → [KeyW] → []` | `0 → 85 → 140 → 85 → 0` | `F→F→T→F→F` | `unarmed_idle_down → unarmed_walk_up → unarmed_run_up → unarmed_walk_up → unarmed_idle_up` | `unarmed_run_sequence_up_0` (`1`) khi Run | `1.5 → 1.5 → 1.02 → 1.5 → 1.5` | `96×96` (`85.68×73.44` Run fr 1) | `(960,280) → (960,277.17) → (960,268.75) → (960,266.42) → (960,265)` |
| **Down** | Idle 1 → Walk 1 → Run → Walk 2 → Idle 2 | `[] → [KeyS] → [KeyS,ShiftLeft] → [KeyS] → []` | `0 → 85 → 140 → 85 → 0` | `F→F→T→F→F` | `unarmed_idle_up → unarmed_walk_down → unarmed_run_down → unarmed_walk_down → unarmed_idle_down` | `unarmed_run_sequence_down_1` (`2`) khi Run | `1.5 → 1.5 → 1.02 → 1.5 → 1.5` | `96×96` (`85.68×73.44` Run) | `(960,280) → (960,284.25) → (960,297.33) → (960,314.25) → (960,327)` |
| **Left** | Idle 1 → Walk 1 → Run → Walk 2 → Idle 2 | `[] → [KeyA] → [KeyA,ShiftLeft] → [KeyA] → []` | `0 → 85 → 140 → 85 → 0` | `F→F→T→F→F` | `unarmed_idle_down → unarmed_walk_left → unarmed_run_left → unarmed_walk_left → unarmed_idle_left` | `unarmed_run_sequence_left_4` (`5`) khi Run | `1.5 → 1.5 → 1.02 → 1.5 → 1.5` | `96×96` (`85.68×73.44` Run) | `(960,280) → (940.17,280) → (912.08,280) → (886.25,280) → (880.58,280)` |
| **Right** | Idle 1 → Walk 1 → Run → Walk 2 → Idle 2 | `[] → [KeyD] → [KeyD,ShiftLeft] → [KeyD] → []` | `0 → 85 → 140 → 85 → 0` | `F→F→T→F→F` | `unarmed_idle_left → unarmed_walk_right → unarmed_run_right → unarmed_walk_right → unarmed_idle_right` | `unarmed_run_sequence_right_4` (`5`) khi Run | `1.5 → 1.5 → 1.02 → 1.5 → 1.5` | `96×96` (`85.68×73.44` Run) | `(960,280) → (981.25,280) → (1009.33,280) → (1044.5,280) → (1050.17,280)` |

### 3.3. Lặp tối thiểu 10 chu kỳ Walk/Run (`outer_woods` `(1230, 760)`)

Toàn bộ **`10 / 10` chu kỳ Armed** (`C1..C10`) chuyển đổi sạch `Walk (85) → Run (140) → Walk (85) → Idle (0)` với `_isWeaponDrawn = true` xuyên suốt:

| Chu kỳ | Phím | Walk 1 (`spd`/`spr`/`anim`) | Run (`spd`/`spr`/`anim`) | Walk 2 (`spd`/`spr`/`anim`) | Idle (`spd`/`spr`/`anim`) |
| :---: | :---: | --- | --- | --- | --- |
| `C1` | `KeyW` | `85 / False / wayfarer_walk_up` | `140 / True / wayfarer_run_up` | `85 / False / wayfarer_walk_up` | `0 / False / wayfarer_idle_up` |
| `C2` | `KeyS` | `85 / False / wayfarer_walk_down` | `140 / True / wayfarer_run_down` | `85 / False / wayfarer_walk_down` | `0 / False / wayfarer_idle_down` |
| `C3` | `KeyW` | `85 / False / wayfarer_walk_up` | `140 / True / wayfarer_run_up` | `85 / False / wayfarer_walk_up` | `0 / False / wayfarer_idle_up` |
| `C4` | `KeyS` | `85 / False / wayfarer_walk_down` | `140 / True / wayfarer_run_down` | `85 / False / wayfarer_walk_down` | `0 / False / wayfarer_idle_down` |
| `C5` | `KeyW` | `85 / False / wayfarer_walk_up` | `140 / True / wayfarer_run_up` | `85 / False / wayfarer_walk_up` | `0 / False / wayfarer_idle_up` |
| `C6` | `KeyS` | `85 / False / wayfarer_walk_down` | `140 / True / wayfarer_run_down` | `85 / False / wayfarer_walk_down` | `0 / False / wayfarer_idle_down` |
| `C7` | `KeyW` | `85 / False / wayfarer_walk_up` | `140 / True / wayfarer_run_up` | `85 / False / wayfarer_walk_up` | `0 / False / wayfarer_idle_up` |
| `C8` | `KeyS` | `85 / False / wayfarer_walk_down` | `140 / True / wayfarer_run_down` | `85 / False / wayfarer_walk_down` | `0 / False / wayfarer_idle_down` |
| `C9` | `KeyW` | `85 / False / wayfarer_walk_up` | `140 / True / wayfarer_run_up` | `85 / False / wayfarer_walk_up` | `0 / False / wayfarer_idle_up` |
| `C10` | `KeyS` | `85 / False / wayfarer_walk_down` | `140 / True / wayfarer_run_down` | `85 / False / wayfarer_walk_down` | `0 / False / wayfarer_idle_down` |

*(Ngoài ra ở đợt đo đầu tiên gần điểm cắm trại, các chu kỳ `C5..C10` ở trạng thái Unarmed cũng đạt `6/6` chuyển pha `85 / wayfarer_unarmed_walk_* → 140 / wayfarer_unarmed_run_* → 85 / wayfarer_unarmed_walk_* → 0 / wayfarer_unarmed_idle_*`.)*

### 3.4. Các tình huống biên (Edge Cases & Regression)

| Kịch bản kiểm thử | Kết quả đo được | Đánh giá |
| --- | --- | --- |
| **Giữ `W` + nhả `Shift` (`W → Shift → up(Shift)`)** | Run: `['KeyW','ShiftLeft']`, `140 px/s`, `wayfarer_run_up`, `sc=1.2` → Walk: `['KeyW']`, `85 px/s`, `wayfarer_walk_up`, `sc=1.5` | **PASS** |
| **Giữ `W` + nhả `Shift` (`Shift → W → up(Shift)`)** | Run: `['ShiftLeft','KeyW']`, `140 px/s`, `wayfarer_run_up`, `sc=1.2` → Walk: `['KeyW']`, `85 px/s`, `wayfarer_walk_up`, `sc=1.5` | **PASS** |
| **Key-Repeat (`KeyboardEvent` `repeat: true`)** | `run` (`140`, `wayfarer_run_up`) → `walkBack` (`85`, `wayfarer_walk_up`) → `idle` (`0`, `wayfarer_idle_up`) | **PASS** |
| **Alt-Tab (`window` `blur` & `focus`)** | `beforeBlur`: `['ShiftLeft','KeyW']`, `140`, `wayfarer_run_up` → `duringBlur`: `[]`, `isPhysicalShiftHeld=false`, `0`, `wayfarer_idle_up` → `afterFocusWalk`: `['KeyW']`, `85`, `wayfarer_walk_up` | **PASS** |
| **Giữ `Shift` đứng yên `750 ms` (không repeat) rồi ấn `KeyD`** | Watchdog hết hạn tại `750 ms` (`activePhysicalCodes=[]`, `isPhysicalShiftHeld=false`, `lastModifierShift=true`); ấn `KeyD` khi Shift vật lý còn giữ nhận `lastModifierShift=true` → chạy ngay `140 px/s` (`wayfarer_run_right`) | **PASS** |
| **Bị chặn tường `1150 ms` rồi quay sang `KeyD` vẫn giữ `Shift`** | Sau `1046 ms` bị chặn ở `(1145, 615)`: Guardrail giữ `85 px/s`, `isSprinting=false`, `wayfarer_walk_left`. Thả `A` bấm `D` khi Shift còn giữ: hồi phục ngay `140 px/s`, `isSprinting=true`, `wayfarer_run_right` | **PASS** |
| **Đổi vũ khí `[X]` trong Safe Zone (`bellhollow`)** | Đứng yên: `wayfarer_weapon_on_right` → `wayfarer_idle_right` (`drawn=true`). Đang Walk `KeyS`: khóa ngắn `wayfarer_weapon_off_down`, mở khóa xong tiếp tục Walk `85 px/s` (`wayfarer_unarmed_walk_down`, `drawn=false`) | **PASS** |
| **Mở/đóng Journal `[J]` khi đang Run** | Pre: `140`, `wayfarer_run_up` → `60 ms` (trước tick `GameScene.update` kế): `spd=0, spr=false, keys=[]` (`onOpen` đã reset input), `180 ms` & `450 ms`: `0`, `wayfarer_idle_up` → Đóng: `0`, `wayfarer_idle_up` → Đi tiếp: `85`, `wayfarer_walk_up` | **PASS** |
| **Mở/đóng Equipment `[B]` khi đang Run** | Pre: `140`, `wayfarer_run_up` → `60 ms`, `180 ms`, `450 ms`: `0`, `wayfarer_idle_up` → Đóng → Đi tiếp: `85`, `wayfarer_walk_up` | **PASS** |
| **Pause `[ESC]` → Đóng `[ESC]` / Nút Resume** | Mở `450 ms`: `pauseOpen=true`, `0`, `wayfarer_idle_up`. Đóng bằng `ESC` (chờ `>250 ms` qua debounce `PauseModal.toggle()`) hoặc `close()`: `pauseOpen=false`, đi tiếp `85 px/s` (`wayfarer_walk_*`). *(Lưu ý: nhấn `ESC` lần 2 chỉ sau `<250 ms` bị `PauseModal.toggle()` bỏ qua có chủ đích để chống double-tap.)* | **PASS** |
| **`Continue` Save/Load Round-Trip** | `handleSaveManual()` → reload trang → `continueGame()`: `continue_idle` (`0`, `wayfarer_idle_down`) → `continue_walk` (`85`, `wayfarer_walk_up`) → `continue_run` (`140`, `wayfarer_run_up`) | **PASS** |
| **Combat (`Space` Attack, `KeyZ` Roll, `KeyV` Parry)** | During: `attack` (`0`, `wayfarer_attack_up`), `roll` (`220`, `wayfarer_roll_up`), `parry` (`0`, `wayfarer_parry_up`). Sau mỗi action: `postIdle` (`0`) → `postWalk` (`85`, `wayfarer_walk_up`) → `postRun` (`140`, `wayfarer_run_up`) | **PASS** |

---

## 4. Điều tra thất bại lịch sử của `tests/hw_bug_26b_walkrun_fix_verification.py`

### 4.1. Đối chiếu lần chạy hiện tại và báo cáo `HW-CS21-QA-04`
- **Chạy trực tiếp trên HEAD hiện tại:** `python tests/hw_bug_26b_walkrun_fix_verification.py` → **`5 / 5 PASS` (`EXIT=0`)**.
- **Lỗi lịch sử được ghi nhận trong [HW_CS21_QA_04_PLAYER_ANIMATION_DIAGNOSTICS.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CS21_QA_04_PLAYER_ANIMATION_DIAGNOSTICS.md#L216-L221):**
  ```text
  Early contact (<150ms): spd=0, sprint=False, anim=wayfarer_idle_up
  Blocked >250ms guardrail: spd=140, sprint=True, anim=wayfarer_run_left, frame=armed_run_sequence_left_1, x=1145, blockStart=14281.2
  AssertionError: Collision Guardrail must force isSprinting=False when blocked
  ```

### 4.2. Dữ liệu tái hiện Frame-by-Frame (Root Cause Proof)
Đo trực tiếp quá trình chạy `ShiftLeft + KeyA` từ `(1155, 615)` về phía vật cản `x=1145` trong headless Chrome SwiftShader:

| `wallMs` | `x` | `blockedLeft` | `blockStart` | `nowPerf` | Elapsed Blocked (`nowPerf - blockStart`) | Speed | `isSprinting` | `animKey` | Diễn giải |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- | --- |
| `107.9` | `1155` | `False` | `0` | `8618.7` | `—` | `140` | `True` | `wayfarer_run_left` | Frame đầu bắt đầu chạy sang trái |
| `640.0` | `1145.7` | `False` | `0` | `9155.6` | `—` | `140` | `True` | `wayfarer_run_left` | Chưa chạm tới collider `x=1145` (`~100 ms/frame` SwiftShader) |
| `759.0` | `1145` | `True` | `9238.5` | `9262.4` | `23.9 ms` | `140` | `True` | `wayfarer_run_left` | Bắt đầu ghi nhận `blockedMovementStartTime = 9238.5` |
| `863.1` | `1145` | `True` | `9238.5` | `9366.4` | `127.9 ms` | `140` | `True` | `wayfarer_run_left` | Chưa tới ngưỡng `250 ms` |
| **`967.3`** | **`1145`** | **`True`** | **`9238.5`** | **`9470.6`** | **`232.1 ms (< 250 ms)`** | **`140`** | **`True`** | **`wayfarer_run_left`** | **Trùng thời điểm thức dậy của `time.sleep(0.15) + time.sleep(0.8) = 950 ms` trong Test 2 → Tái hiện chính xác lỗi `QA-04`!** |
| `1070.8` | `1145` | `True` | `9238.5` | `9573.7` | `335.2 ms (>= 250 ms)` | `85` | `False` | `wayfarer_walk_left` | Guardrail hạ xuống Walk đúng thiết kế |
| `1763.4` | `1145` | `True` | `9238.5` | `10266.7` | `1028.2 ms` | `85` | `False` | `wayfarer_walk_left` | Duy trì ổn định |

- **Phân loại nguyên nhân gốc (§4):** **`Lỗi môi trường kiểm thử`** (`Timing race condition` giữa `time.sleep(0.15) + time.sleep(0.8)` cố định tại [hw_bug_26b_walkrun_fix_verification.py](file:///g:/HOLLOW%20WOODS/tests/hw_bug_26b_walkrun_fix_verification.py#L166-L171) và tốc độ dựng hình CPU SwiftShader ~`100–150 ms/frame`). Trong log `QA-04`, ngay dòng `Early contact (<150ms): spd=0, sprint=False, anim=wayfarer_idle_up` cũng cho thấy sau `150 ms` ngủ, frame đầu chưa kịp cập nhật vận tốc, làm thời điểm chạm `x=1145` bị đẩy muộn thêm so với cửa sổ `950 ms`.
- **Khuyến nghị (chưa chỉnh sửa test để giữ nguyên đặc tả & assertion theo §4):** Nếu Owner đồng ý gia cố harness sau này, chỉ cần thay `time.sleep(0.8)` ở Test 2 bằng `page.wait_for_function("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; return p.blockedMovementStartTime > 0 && (performance.now() - p.blockedMovementStartTime) >= 300; }")` mà vẫn giữ nguyên mọi assertion `> 250 ms`.

---

## 5. Bàn giao cho Codex ngày 27/11/2026 — Scale Pop & HD Consistency *(Không sửa theo §5)*

Các số liệu đo thực tế dưới đây được thu thập chỉ đọc để hỗ trợ Codex xử lý thẩm mỹ / đồng nhất HD sau này:

1. **Unarmed Run Mid-Cycle Scale Pop (`wayfarer_unarmed_run_down`, sheet `black_knight_conversion_motion`, frame gốc `84×72`, `origin (0.5, 0.875)`):**
   - Frames `1..6` (`unarmed_run_sequence_down_0..5`): `scaleX = 1.02`, kích thước hiển thị **`85.68 × 73.44 px`**.
   - Frames `7..12` (`unarmed_run_sequence_down_6..11`): `scaleX = 1.17`, kích thước hiển thị **`98.28 × 84.24 px`**.
   - Độ nhảy giữa frame 6 và frame 7 trong cùng 1 vòng animation (`ANIMATION_UPDATE` gọi `syncBodyFootAnchor()` → `getLocomotionArtworkScale()`): **`+12.60 px` rộng / `+10.80 px` cao (`+14.7%`)**.
2. **So sánh kích thước hiển thị giữa các sheet của Black Knight:**
   - `black_knight_armed_idle` / `black_knight_movement` / `black_knight_defense` (`64×64`, `origin (0.5, 1)`): `scale 1.5` → **`96 × 96 px`**, body offset `(26, 52)`.
   - `black_knight_conversion_motion` (`84×72`, `origin (0.5, 0.875)`): `armed_run_*` ở `scale 1.2` → **`100.8 × 86.4 px`**, body offset `(34.5, 48)`; `unarmed_run_*` nhảy giữa `85.68×73.44` (offset `33.18, 45.35`) và `98.28×84.24`.
   - `black_knight_conversion_actions` (`parry_miss_up_2`, `80×64`, `origin (0.5, 0.875)`): `scale 1.5` → **`120 × 96 px`**, body offset `(34, 44)`.

---

## 6. Kết quả bộ kiểm tra bắt buộc (§6)

Tất cả các script tạm trong `scripts/temp/` đã được dọn dẹp (`TEMP_DIR_COUNT=0`). Kết quả chạy tuần tự sau trạng thái cuối:

| Lệnh kiểm tra | Kết quả | Exit Code |
| --- | --- | :---: |
| `npm run check` (`tsc --noEmit`) | PASS (0 lỗi TypeScript) | `0` |
| `npm run build` (`tsc && vite build`) | PASS (`dist/` build trong `9.73s`) | `0` |
| `python tests/hw_bug_21b_walk_run_verification.py` | **PASS (`10 / 10` tests)** | `0` |
| `python tests/hw_bug_26b_walkrun_fix_verification.py` | **PASS (`5 / 5` suites)** | `0` |
| `git diff --check` | PASS (không lỗi whitespace / conflict marker) | `0` |

**Trạng thái Git (HARD STOP — Không commit / Không push):**
- Không tạo thay đổi mới trong `src/` hoặc `tests/` từ nhiệm vụ `HW-H4-02`.
- Workspace vẫn giữ nguyên phần sửa `HW-H4-01` (`M src/systems/EndingSystem.ts`), file manifest âm thanh của Owner, báo cáo/ảnh nghiệm thu `HW-CS21` / `HW-H4-00` / `HW-H4-01`, và báo cáo mới [HW_H4_02_LOCOMOTION_DIAGNOSTIC_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_02_LOCOMOTION_DIAGNOSTIC_REPORT.md).
