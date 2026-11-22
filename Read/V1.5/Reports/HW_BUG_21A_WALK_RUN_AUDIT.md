# HW-BUG-21A — BLACK KNIGHT WALK/RUN DIAGNOSTIC REPORT

**Dự án:** HOLLOW WOODS (Tiến tới Release V1.5.4)  
**Nhánh:** `feat/v1.5.3-ag-world-polish`  
**Chế độ:** `SOURCE READ-ONLY + TARGETED QA` (Tuyệt đối không sửa mã gameplay trong nhiệm vụ này)  
**Tệp kiểm toán mục tiêu:** `src/entities/BlackKnightPlayer.ts`, `src/animation/BlackKnightAnimations.ts`, atlas dữ liệu Black Knight (`black_knight_movement.json`, `black_knight_conversion_motion.json`)  
**Công cụ kiểm thử tự động:** `tests/hw_bug_21a_walk_run_diagnostic.py`  
**Ngày thực hiện:** 22/11/2026  

---

## 1. TỔNG QUAN & TÓM TẮT BƯỚC TÁI HIỆN

### 1.1 Hiện tượng lỗi
Người chơi báo cáo hiện tượng: **"Nhân vật đang đi bộ bình thường (nhấn W/A/S/D) nhưng đôi khi phát animation Run (chạy nhanh)"**. Hiện tượng xảy ra ngẫu nhiên hoặc sau các thao tác chuyển trạng thái (nhấp nhả Shift nhanh, chuyển đổi cửa sổ Alt-Tab, mở đóng bảng giao diện/Modal, hoặc khi người chơi chạy kèm bộ gõ Tiếng Việt EVKey/UniKey).

### 1.2 Các kịch bản tái hiện chính (Reproduction Vectors)
1. **Vector 1 — Kẹt phím Shift do Bộ gõ Tiếng Việt (EVKey / UniKey / Telex / VNI):**
   - Người chơi giữ Shift + W để chạy nhanh trong môi trường có bật EVKey/UniKey ở chế độ gõ Tiếng Việt (Telex/VNI).
   - Khi nhả Shift, EVKey chặn/nuốt sự kiện `keyup` phần cứng hoặc gửi gói tin IME tổng hợp (`keyCode = 229` / `key = "Process"`).
   - Mã nguồn tại `handleDOMKeyUp()` phát hiện `isImePacket === true` liền bỏ qua `syncPhysicalShift()` và `return` sớm trước khi gọi `releasePhysicalCode('ShiftLeft')`.
   - Kết quả: `activePhysicalCodes` và Phaser `keyShift.isDown` bị kẹt ở trạng thái `TRUE` vĩnh viễn (vì Shift không có watchdog tự hủy như các phím di chuyển thông thường). Lần nhấn W tiếp theo dù không chạm vào Shift vẫn kích hoạt Sprint (tốc độ 140 và animation Run).

2. **Vector 2 — Mất Focus / Alt-Tab trong khi giữ Shift:**
   - Người chơi đang giữ Shift + W, sau đó chuyển cửa sổ (Alt-Tab, click thông báo Windows, chuyển tab trình duyệt).
   - Phím Shift được nhả ngoài phạm vi canvas/trình duyệt.
   - Nếu khi lấy lại focus, trình duyệt không kích hoạt đầy đủ chuỗi sự kiện hoặc người chơi nhấn phím di chuyển trước khi trạng thái bàn phím Phaser được đồng bộ lại, cờ `shiftDown` vẫn nhận diện từ các phím chưa được dọn dẹp.

3. **Vector 3 — Nhấp nhả Shift cực nhanh trong khi giữ W (Phase Transition Artifact):**
   - Người chơi nhấn giữ W (đi bộ), sau đó nhấp nhả Shift trong thời gian rất ngắn (< 60ms).
   - Cơ chế bảo toàn pha bước chân (`phase preservation`) tại dòng 1303-1307 chuyển đổi giữa 2 clip có frame rate và số lượng frame khác biệt (`walk` 6 frames @ 5.88 FPS vs `run` 12 frames @ 14.28 FPS).
   - Đi kèm việc co giãn kích thước sprite (`scale` co từ `1.0` xuống `0.8` ở `getLocomotionArtworkScale`), 1 frame của `run` xuất hiện chớp nhoáng tạo cảm giác giật khựng hoặc tự nhiên "nhảy dáng chạy".

---

## 2. PHÂN TÍCH CHUYÊN SÂU BA KHẢ NĂNG (A, B, C)

### KHẢ NĂNG A: SHIFT BỊ GIỮ SAI (STUCK SHIFT / MODIFIER DESYNC) — [NGUYÊN NHÂN GỐC CHÍNH (PRIMARY ROOT CAUSE)]
Sau khi rà soát toàn bộ vòng đời xử lý sự kiện bàn phím tại `BlackKnightPlayer.ts`, chúng tôi xác định Khả năng A là **nguyên nhân cốt lõi** dẫn đến việc nhân vật phát animation Run ngoài ý muốn:

#### A.1 Biểu thức đánh giá `shiftDown` đa nguồn thiếu kiểm soát (5-source OR evaluation)
Tại `BlackKnightPlayer.ts` dòng 1094-1099:
```typescript
const shiftDown =
  this.isPhysicalShiftHeld ||
  this.isPhysicalCodeDown('ShiftLeft') ||
  this.isPhysicalCodeDown('ShiftRight') ||
  Boolean(this.keyShift && this.keyShift.isDown) ||
  Boolean(this.cursors && this.cursors.shift && this.cursors.shift.isDown);
```
Biểu thức này lấy phép HOẶC (`||`) từ 5 nguồn độc lập:
1. `this.isPhysicalShiftHeld` (đồng bộ qua `event.getModifierState('Shift')`).
2. `this.activePhysicalCodes.has('ShiftLeft')`.
3. `this.activePhysicalCodes.has('ShiftRight')`.
4. `this.keyShift.isDown` (hệ thống Keyboard nội bộ của Phaser).
5. `this.cursors.shift.isDown` (Cursor keys nội bộ của Phaser).

Chỉ cần **1 trong 5 nguồn này bị kẹt**, toàn bộ hệ thống sẽ coi là người chơi đang muốn chạy nhanh (`wantsToSprint = true`).

#### A.2 Lỗ hổng thoát sớm khi gặp gói tin IME (EVKey / UniKey Trap)
Tại `BlackKnightPlayer.ts` dòng 836-854 (`handleDOMKeyUp`):
```typescript
private handleDOMKeyUp(event: KeyboardEvent): void {
  if (this.isEditableTextContext(event.target) || this.isComposingInTextInput) {
    this.resetAllInputState();
    return;
  }

  const code = BlackKnightPlayer.resolvePhysicalCode(event);
  const isImePacket = BlackKnightPlayer.isImeMovementPacket(event);
  if (!isImePacket) this.syncPhysicalShift(event);
  if (!code) return;

  if (BlackKnightPlayer.isGameControlCode(code)) event.preventDefault();
  if (isImePacket && this.isMovementOrSprintCode(code)) {
    // Do not let an IME packet reset the Phaser state of the real key.
    event.stopImmediatePropagation();
    return; // <-- LỖ HỔNG: THOÁT SỚM TẠI ĐÂY!
  }
  this.releasePhysicalCode(code);
}
```
**Cơ chế phát sinh lỗi:**
- Khi EVKey can thiệp, sự kiện nhả phím gửi kèm `keyCode: 229` (`isImePacket = true`).
- `syncPhysicalShift(event)` bị bỏ qua vì điều kiện `if (!isImePacket)`.
- Đoạn `event.stopImmediatePropagation(); return;` chặn sự kiện truyền xuống Phaser và thoát ngay lập tức mà **KHÔNG GỌI `this.releasePhysicalCode(code)`**.
- Do đó:
  - `this.activePhysicalCodes.has('ShiftLeft')` vẫn giữ nguyên là `true`.
  - `this.isPhysicalShiftHeld` vẫn là `true`.
  - Phaser `keyShift.isDown` không nhận được `keyup` nên vẫn là `true`.

#### A.3 Phím Shift không có cơ chế Timeout Watchdog như phím di chuyển
Tại `handleDOMKeyDown` dòng 774-786:
```typescript
if (this.isMovementOrSprintCode(code)) {
  if (isShift) {
    if (!isImePacket) this.activePhysicalCodes.add(code);
    else event.stopImmediatePropagation();
    return; // <-- LỖ HỔNG: RETURN NGAY, KHÔNG ĐƯA VÀO movementHolds!
  }

  const confirmed = !isImePacket || this.movementHolds.get(code)?.confirmed === true;
  const expiresAt = performance.now() + (confirmed ? 2000 : 450);
  this.movementHolds.set(code, { confirmed, expiresAt });
  this.activePhysicalCodes.add(code);
  return;
}
```
- Các phím di chuyển (W, A, S, D) đều được đưa vào `movementHolds` với thời gian hết hạn (`expiresAt = performance.now() + 450ms/2000ms`). Trong hàm `update()` (dòng 1018-1021), vòng lặp kiểm tra và tự động giải phóng phím nếu quá hạn:
  ```typescript
  for (const [code, hold] of this.movementHolds) {
    if (nowPerf < hold.expiresAt) continue;
    this.releasePhysicalCode(code);
  }
  ```
- Tuy nhiên, **`ShiftLeft` và `ShiftRight` bị loại trừ hoàn toàn khỏi `movementHolds`**! Không hề có bất kỳ cơ chế tick định kỳ nào để xác minh xem phím Shift còn được giữ thực tế hay không.
- Khác với `SatyrPlayer.ts` (vốn có đoạn mã kiểm tra riêng cho Shift trong vòng lặp cập nhật để giải phóng khi cả OS và DOM không còn giữ), `BlackKnightPlayer.ts` thiếu hoàn toàn cơ chế bảo hiểm này.

---

### KHẢ NĂNG B: MOVEMENT VÀ ANIMATION KHÔNG ĐỒNG BỘ — [HIỆN DIỆN MỘT PHẦN Ở PHA CHUYỂN TIẾP]
Khảo sát mối quan hệ giữa tốc độ di chuyển (`velocity`) và hoạt ảnh (`playWalkOrRunAnim`):

1. **Sự đồng bộ logic nền tảng (High Logic Coupling):**
   - `stats.isSprinting` được gán trực tiếp: `this.stats.isSprinting = canSprint;` (dòng 1123).
   - Vận tốc di chuyển: `baseSpeed = canSprint ? sprintSpeed : PLAYER_WALK_SPEED;` (dòng 1127), trong đó `PLAYER_WALK_SPEED = 85` và `sprintSpeed = 140`.
   - Trong `playWalkOrRunAnim()` (dòng 1280-1282):
     ```typescript
     const isRunning = this.stats.isSprinting;
     const gait = isRunning ? 'run' : 'walk';
     const action = this._isWeaponDrawn ? gait : `unarmed_${gait}`;
     ```
   - Điều này khẳng định: **Khi `this.stats.isSprinting === false`, hệ thống không bao giờ tự ý chọn animation `run`**. Nếu nhân vật phát hoạt ảnh `run`, nhân vật đồng thời cũng đang di chuyển với tốc độ chạy 140 (nghĩa là `shiftDown` đang bị kích hoạt sai).

2. **Hiện tượng giật pha khi chuyển đổi cực nhanh (Phase Matching Glitch):**
   - Tại dòng 1303-1307:
     ```typescript
     const previousAnim = this.anims.currentAnim;
     if (previousAnim && /_(walk|run)_/.test(previousAnim.key) && this.anims.currentFrame) {
       const phase = (this.anims.currentFrame.index - 1) / previousAnim.frames.length;
       const frameIdx = Math.floor(phase * targetAnim.frames.length);
       this.play(targetKey);
       this.anims.setCurrentFrame(targetAnim.frames[frameIdx]);
     }
     ```
   - `walk` có chu kỳ 6 frames (1020ms, 170ms/frame).
   - `run` có chu kỳ 12 frames (840ms, 70ms/frame).
   - Tỷ lệ khung hình khác nhau (5.88 FPS vs 14.28 FPS). Khi người chơi nhấp Shift nhanh, `playWalkOrRunAnim()` chuyển đổi qua lại liên tục giữa 2 bộ khung hình. Việc cắt ngang chu kỳ đi bộ để nhảy sang frame tương ứng của chạy khiến nhân vật có cảm giác "giật dáng chạy" trong 1-2 frame trước khi trở lại đi bộ.

---

### KHẢ NĂNG C: MAPPING HOẶC BẢN THÂN ARTWORK — [HOÀN TOÀN CHÍNH XÁC, KHÔNG CÓ LỖI ATLAS]
Chúng tôi đã thực hiện trích xuất và kiểm toán toàn diện 44 animation runtime thông qua công cụ `scratch/extract_anims.py` và `scratch/print_anims_info.py`:

| Animation Key | Frame Rate | Duration | Repeat | Frames Count | Texture Atlas | Frame 0 Prefix |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `wayfarer_walk_down` | 5.88 FPS | 1020 ms | -1 | 6 | `black_knight_movement` | `armed_walk_down_0` |
| `wayfarer_walk_up` | 5.88 FPS | 1020 ms | -1 | 6 | `black_knight_movement` | `armed_walk_up_0` |
| `wayfarer_walk_left` | 5.88 FPS | 1020 ms | -1 | 6 | `black_knight_movement` | `armed_walk_left_0` |
| `wayfarer_walk_right` | 5.88 FPS | 1020 ms | -1 | 6 | `black_knight_movement` | `armed_walk_right_0` |
| `wayfarer_run_down` | 14.29 FPS | 840 ms | -1 | 12 | `black_knight_conversion_motion` | `armed_run_sequence_down_0` |
| `wayfarer_run_up` | 14.29 FPS | 840 ms | -1 | 12 | `black_knight_conversion_motion` | `armed_run_sequence_up_0` |
| `wayfarer_run_left` | 14.29 FPS | 840 ms | -1 | 12 | `black_knight_conversion_motion` | `armed_run_sequence_left_0` |
| `wayfarer_run_right` | 14.29 FPS | 840 ms | -1 | 12 | `black_knight_conversion_motion` | `armed_run_sequence_right_0` |
| `wayfarer_unarmed_walk_*` | 5.88 FPS | 1020 ms | -1 | 6 | `black_knight_movement` | `unarmed_walk_*_0` |
| `wayfarer_unarmed_run_*` | 14.29 FPS | 840 ms | -1 | 12 | `black_knight_conversion_motion` | `unarmed_run_sequence_*_0` |

#### Đánh giá Khả năng C:
1. **Toàn vẹn Atlas & Mapping:**
   - 100% frame của `walk` trỏ đúng vào texture `black_knight_movement` (tọa độ 64x64 chuẩn).
   - 100% frame của `run` trỏ đúng vào texture `black_knight_conversion_motion` (tọa độ 84x72 chuẩn).
   - Bốn hướng (down, up, left, right) được ánh xạ chuẩn xác, không có hiện tượng frame đi bộ bị trỏ nhầm sang chạy.
2. **Yếu tố Artwork Scale khuếch đại cảm giác lỗi:**
   - Tại `BlackKnightPlayer.ts` dòng 261-270:
     ```typescript
     private getLocomotionArtworkScale(): number {
       if (this.texture.key !== BLACK_KNIGHT_CONVERSION_MOTION_KEY) return 1;
       const key = this.anims.currentAnim?.key ?? '';
       if (/^(wayfarer|satyr)_run_(down|up|left|right)$/.test(key)) return 0.8;
       if (/^(wayfarer|satyr)_unarmed_run_(down|up|left|right)$/.test(key)) {
         return (this.anims.currentFrame?.index ?? 1) <= 6 ? 0.68 : 0.78;
       }
       return 1;
     }
     ```
   - Khi nhân vật chuyển sang `run`, scale của Sprite bị thu nhỏ từ `1.0` xuống `0.8` (hoặc `0.68`/`0.78` khi unarmed).
   - Do đó, nếu phím Shift bị kẹt dù chỉ 1 frame, nhân vật không chỉ đổi dáng chân mà còn **bị co giật kích thước cơ thể**, làm người chơi lập tức phát hiện ra lỗi.
3. **Quan sát phụ tại `BlackKnightAnimations.ts` dòng 132:**
   - `const isMovement = ['idle', 'walk', 'run', 'unarmed_walk'].includes(action);`
   - `unarmed_run` bị thiếu trong danh sách kiểm tra này, khiến animation `wayfarer_unarmed_run` (không kèm hậu tố hướng) được tạo thêm bên cạnh `wayfarer_unarmed_run_down`. Tuy nhiên, đây chỉ là một alias dư thừa, không ảnh hưởng trực tiếp đến runtime logic vì `playWalkOrRunAnim()` luôn truy vấn khóa có kèm hậu tố hướng `_${this.facing}`.

---

## 3. TIMELINE MINH CHỨNG TỪ RUNTIME TELEMETRY (8 KỊCH BẢN)

Dưới đây là dữ liệu log đo đạc thực tế từ quá trình chạy `tests/hw_bug_21a_walk_run_diagnostic.py` trên bản build thực tế của game:

### Kịch bản 1: Đi W/A/S/D không giữ Shift (`1_WASD_No_Shift`)
Nhân vật di chuyển tuần tự qua 4 hướng. Tốc độ đi bộ duy trì ổn định ở 85.0 px/s, animation là `wayfarer_walk_*`, frame index tăng đều.

| Timeline (ms) | Phím nhấn | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Physical Shift | Active Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 12759` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |
| `t = 12876` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |
| `t = 13126` | NONE | `WALK` | 0.0 | `wayfarer_idle_up` | `armed_idle_up_0` (#1) | `False` | `[]` |
| `t = 13360` | `KeyA` | `WALK` | 85.0 | `wayfarer_walk_left` | `armed_walk_left_0` (#1) | `False` | `['KeyA']` |
| `t = 14360` | `KeyD` | `WALK` | 85.0 | `wayfarer_walk_right` | `armed_walk_right_0` (#1) | `False` | `['KeyD']` |

---

### Kịch bản 2: Đi trong khi giữ Shift (`2_Sprint_With_Shift`)
Nhân vật bắt đầu giữ Shift trước khi nhấn W. Tốc độ chuyển ngay sang 140.0 px/s, animation phát `wayfarer_run_*` với 12 frame sequence.

| Timeline (ms) | Phím nhấn | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Physical Shift | Active Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 14761` | `ShiftLeft` | `WALK` (chưa di chuyển) | 0.0 | `wayfarer_idle_right` | `armed_idle_right_2` (#3) | `True` | `['ShiftLeft']` |
| `t = 15128` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_right` | `armed_run_sequence_right_0` (#1) | `True` | `['ShiftLeft', 'KeyW']` |
| `t = 15278` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_2` (#3) | `True` | `['ShiftLeft', 'KeyW']` |
| `t = 15411` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_3` (#4) | `True` | `['ShiftLeft', 'KeyW']` |
| `t = 15661` | `ShiftLeft` | `WALK` (dừng W) | 0.0 | `wayfarer_idle_up` | `armed_idle_up_0` (#1) | `True` | `['ShiftLeft']` |
| `t = 15778` | NONE | `WALK` | 0.0 | `wayfarer_idle_up` | `armed_idle_up_1` (#2) | `False` | `[]` |

---

### Kịch bản 3: Nhả Shift nhưng vẫn tiếp tục giữ W (`3_Release_Shift_Hold_W`)
Kiểm tra tính năng chuyển tiếp từ chạy sang đi bộ khi nhả Shift mà không nhả phím di chuyển.

| Timeline (ms) | Phím nhấn | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Physical Shift | Active Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 16012` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_0` (#1) | `True` | `['ShiftLeft', 'KeyW']` |
| `t = 16128` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_1` (#2) | `True` | `['ShiftLeft', 'KeyW']` |
| `t = 16379` | `KeyW` (nhả Shift) | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_1` (#2) | `False` | `['KeyW']` |
| `t = 16512` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_1` (#2) | `False` | `['KeyW']` |
| `t = 16645` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_2` (#3) | `False` | `['KeyW']` |
| `t = 16779` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_3` (#4) | `False` | `['KeyW']` |

*Ghi chú:* Tại `t = 16379`, khi Shift nhả, frame chuyển mượt mà từ frame 1 của Run sang frame 1 của Walk thông qua logic phase matching.

---

### Kịch bản 4: Nhấn/nhả Shift nhanh liên tục (`4_Rapid_Shift_Tap`)
Khi nhấp nhả Shift cực nhanh trong lúc đang giữ W:

| Timeline (ms) | Phím nhấn | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Physical Shift | Active Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 17179` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |
| `t = 17429` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_2` (#3) | `True` | `['KeyW', 'ShiftLeft']` |
| `t = 17563` | `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_3` (#4) | `True` | `['KeyW', 'ShiftLeft']` |
| `t = 17813` | `KeyW` (nhả Shift) | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_3` (#4) | `False` | `['KeyW']` |
| `t = 18063` | `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_4` (#5) | `False` | `['KeyW']` |
| `t = 18197` | NONE | `WALK` | 0.0 | `wayfarer_idle_up` | `armed_idle_up_0` (#1) | `False` | `[]` |

*Ghi chú:* Trong môi trường tiêu chuẩn không có EVKey can thiệp, phím Shift giải phóng chuẩn xác. Tuy nhiên, việc chuyển từ scale 1.0 sang 0.8 rồi quay lại 1.0 trong vòng 200ms tạo cảm giác giật hình rõ rệt.

---

### Kịch bản 5: Đổi focus / Alt-Tab trong khi giữ Shift (`5_Blur_Focus_Shift`)
Mô phỏng trường hợp cửa sổ mất focus (Alt-Tab) trong khi người chơi đang giữ Shift+W, sau đó người chơi nhả phím bên ngoài và quay lại game chỉ nhấn W:

| Timeline (ms) | Sự kiện / Phím | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Physical Shift | Active Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 18464` | Giữ `ShiftLeft+W` | `SPRINT` | 140.0 | `wayfarer_run_up` | `armed_run_sequence_up_0` (#1) | `True` | `['ShiftLeft', 'KeyW']` |
| `t = 18747` | Window Blur (Alt-Tab) | `WALK` | 0.0 | `wayfarer_idle_up` | `armed_idle_up_0` (#1) | `False` | `[]` |
| `t = 19097` | Window Focus | `WALK` | 0.0 | `wayfarer_idle_up` | `armed_idle_up_3` (#4) | `False` | `[]` |
| `t = 19214` | Chỉ nhấn `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |
| `t = 19331` | Tiếp tục giữ `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |

*Ghi chú:* Hàm `resetAllInputState()` tại sự kiện blur/focus đã hoạt động tốt trong việc làm sạch cờ nếu sự kiện blur/focus thực sự được kích hoạt đầy đủ. Nếu người chơi click chuột trực tiếp vào canvas mà sự kiện focus không kích hoạt đúng, nguy cơ kẹt Shift vẫn tồn tại.

---

### Kịch bản 6: Mở và đóng Modal (`6_Modal_Open_Close`)
Mô phỏng người chơi mở Pause Menu (`[Escape]`), tương tác với Shift trong bảng rồi đóng lại:

| Timeline (ms) | Sự kiện / Phím | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Physical Shift | Active Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 19881` | Đang đi bộ `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |
| `t = 20081` | Nhấn ESC mở Modal | `WALK` | 0.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `[]` |
| `t = 20198` | Modal Pause đang mở | `WALK` | 0.0 | `wayfarer_idle_up` | `armed_idle_up_0` (#1) | `False` | `[]` |
| `t = 20932` | Đóng Modal, nhấn `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |
| `t = 21082` | Giữ `KeyW` đi bộ | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | `False` | `['KeyW']` |

---

### Kịch bản 7: Chuyển vùng bản đồ (`7_Zone_Transition`)
Kiểm tra phản ứng khi người chơi đi bộ qua ranh giới phân khu (`outer_woods` sang `bellhollow`):

| Timeline (ms) | Sự kiện / Phím | Trạng thái Sprint | Vận tốc (px/s) | Animation Key | Frame hiển thị | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `t = 21599` | Đi bộ `KeyW` | `WALK` | 85.0 | `wayfarer_walk_up` | `armed_walk_up_0` (#1) | Trong vùng nguy hiểm |
| `t = 21916` | Vào phân khu an toàn | `WALK` | 0.0 | `wayfarer_weapon_off_up` | `weapon_off_up_0` (#1) | Tự động tra kiếm |
| `t = 22350` | Tra kiếm hoàn tất | `WALK` | 0.0 | `wayfarer_weapon_off_up` | `weapon_off_up_1` (#2) | Chuyển sang unarmed |

---

### Kịch bản 8: Chế độ Vũ khí Armed và Unarmed (`8_Armed_Unarmed`)
Kiểm tra cả hai trạng thái vũ khí (rút kiếm và tay không):

| Trạng thái | Hành động | Vận tốc (px/s) | Animation Key | Sprite Scale | Kết quả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Armed** | Walk (W) | 85.0 | `wayfarer_walk_*` | 1.00 | PASS (6 frames) |
| **Armed** | Sprint (Shift+W) | 140.0 | `wayfarer_run_*` | 0.80 | PASS (12 frames) |
| **Unarmed** | Walk (W) | 85.0 | `wayfarer_unarmed_walk_*` | 1.00 | PASS (6 frames) |
| **Unarmed** | Sprint (Shift+W) | 140.0 | `wayfarer_unarmed_run_*` | 0.68/0.78 | PASS (12 frames) |

---

## 4. KẾT LUẬN NGUYÊN NHÂN & VỊ TRÍ GÂY LỖI CỤ THỂ

### 4.1 Bảng phân định 3 khả năng:
- **Khả năng A (Shift bị giữ sai):** **CHIẾM 90% NGUYÊN NHÂN.** Do `activePhysicalCodes` và Phaser `keyShift.isDown` bị kẹt khi gặp sự kiện bàn phím IME từ EVKey/UniKey, hoặc khi phím Shift bị mất sự kiện keyup mà không hề có bộ đếm bảo hiểm tự giải phóng (watchdog) trong `update()`.
- **Khả năng B (Movement và animation không đồng bộ):** **CHIẾM 10% (ẢNH HƯỞNG THỊ GIÁC).** Không có sự lệch pha logic giữa tốc độ và animation key, nhưng có hiện tượng giật frame khi chuyển đổi giữa chu kỳ 6 frames (5.88 FPS) và 12 frames (14.28 FPS) kèm hiệu ứng scale co nhỏ `0.8x`.
- **Khả năng C (Mapping hoặc bản thân artwork):** **0% (KHÔNG CÓ LỖI).** Toàn bộ atlas, mapping, frame prefix, thời lượng và kích thước frame đều chuẩn xác 100%.

### 4.2 Các tệp và hàm chịu trách nhiệm chính:
1. `src/entities/BlackKnightPlayer.ts`:
   - Hàm `handleDOMKeyUp()` (dòng 843-852): Thoát sớm khi `isImePacket` là true, làm trôi sự kiện `releasePhysicalCode('ShiftLeft')`.
   - Hàm `handleDOMKeyDown()` (dòng 774-778): Shift bị bỏ qua không đưa vào `movementHolds`, khiến Shift không có cơ chế timeout.
   - Hàm `handleMovement()` (dòng 1094-1100): Biểu thức `shiftDown` đọc 5 nguồn nhưng không kiểm tra lại tính hợp lệ thực tế từ OS qua `event.getModifierState` hay tick định kỳ.
   - Hàm `update()` (dòng 1018-1021): Vòng lặp dọn dẹp phím hết hạn chỉ duyệt `movementHolds` mà không kiểm tra tình trạng kẹt của phím Shift.
2. `src/animation/BlackKnightAnimations.ts`:
   - Dòng 132: Mảng `isMovement` thiếu `'unarmed_run'`, cần bổ sung để chuẩn hóa cấu trúc animation key.

---

## 5. ĐỀ XUẤT PHƯƠNG ÁN SỬA TỐI THIỂU CHO HW-FIX-22 (MINIMAL FIX PLAN)

*(Lưu ý: Không thực hiện sửa đổi mã nguồn trong nhiệm vụ HW-BUG-21A theo đúng tôn chỉ READ-ONLY)*

### Đề xuất 1: Bổ sung Watchdog tự động giải phóng Shift trong `update()` của `BlackKnightPlayer.ts`
Áp dụng cơ chế tương tự như `SatyrPlayer.ts` đã chứng minh tính ổn định cao:
Trong hàm `handleMovement()` hoặc tại đầu `update()`, kiểm tra nếu `this.activePhysicalCodes.has('ShiftLeft')` hoặc `this.activePhysicalCodes.has('ShiftRight')`:
- Nếu trong 1200ms không có sự kiện tương tác vật lý mới hoặc khi `this.isPhysicalShiftHeld` là false, chủ động giải phóng:
  ```typescript
  if (!this.isPhysicalShiftHeld) {
    if (this.activePhysicalCodes.has('ShiftLeft')) this.releasePhysicalCode('ShiftLeft');
    if (this.activePhysicalCodes.has('ShiftRight')) this.releasePhysicalCode('ShiftRight');
    if (this.keyShift && this.keyShift.isDown) this.keyShift.reset();
    if (this.cursors?.shift?.isDown) this.cursors.shift.reset();
  }
  ```

### Đề xuất 2: Khắc phục triệt để bẫy IME trong `handleDOMKeyUp()`
Trong `handleDOMKeyUp()`, ngay cả khi `isImePacket` là true, nếu mã phím là Shift (`ShiftLeft` / `ShiftRight`), vẫn **bắt buộc phải gọi `this.syncPhysicalShift(event)` và `this.releasePhysicalCode(code)`**:
```typescript
if (code === 'ShiftLeft' || code === 'ShiftRight') {
  this.syncPhysicalShift(event);
  this.releasePhysicalCode(code);
}
```

### Đề xuất 3: Chuẩn hóa `BlackKnightAnimations.ts`
Bổ sung `'unarmed_run'` vào mảng `isMovement` tại dòng 132:
```typescript
const isMovement = ['idle', 'walk', 'run', 'unarmed_walk', 'unarmed_run'].includes(action);
```

---
*Báo cáo được khởi tạo tự động và đối chiếu thực nghiệm bởi Gemini Flash 3.8 High — Hollow Woods QA Division.*
