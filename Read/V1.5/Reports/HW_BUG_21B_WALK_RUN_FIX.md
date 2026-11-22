# HW-BUG-21B — BLACK KNIGHT WALK/RUN STATE FIX REPORT

**Dự án:** HOLLOW WOODS (Tiến tới Release V1.5.4)  
**Nhánh:** `feat/v1.5.3-ag-world-polish`  
**Chế độ:** `GAMEPLAY CODE FIX + COMPREHENSIVE AUTOMATED VERIFICATION`  
**Báo cáo tham chiếu tiền đề:** [HW_BUG_21A_WALK_RUN_AUDIT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_21A_WALK_RUN_AUDIT.md)  
**Tệp mã nguồn chỉnh sửa:** 
- [src/entities/BlackKnightPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts)
- [src/animation/BlackKnightAnimations.ts](file:///G:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts)  
**Tệp kiểm thử tự động toàn diện:** [tests/hw_bug_21b_walk_run_verification.py](file:///G:/HOLLOW%20WOODS/tests/hw_bug_21b_walk_run_verification.py)  
**Tệp tái hiện lỗi ban đầu:** `scratch/test_hw_bug_21b_repro.py`  
**Ngày thực hiện:** 22/11/2026  

---

## 1. TỔNG QUAN & NGUYÊN NHÂN CỐT LÕI (ROOT CAUSE SUMMARY)

Dựa trên kết luận từ cuộc kiểm toán chuyên sâu [HW-BUG-21A](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_21A_WALK_RUN_AUDIT.md), nguyên nhân khiến nhân vật Black Knight đi bộ bình thường bằng các phím W/A/S/D nhưng đôi khi phát hoạt ảnh Run (chạy nhanh) và tốc độ bị đẩy vọt lên 140 px/s gồm 3 lỗ hổng phối hợp:

1. **Bẫy nuốt sự kiện `keyup` của bộ gõ Tiếng Việt (EVKey / UniKey IME Trap):**
   - Trong `handleDOMKeyUp()`, khi người chơi bật bộ gõ Tiếng Việt (Telex/VNI), sự kiện nhả phím gửi kèm `keyCode: 229` / `key: 'Process'` (`isImePacket === true`).
   - Khối điều kiện cũ kiểm tra `if (isImePacket && this.isMovementOrSprintCode(code)) return;` dẫn đến việc sự kiện nhả phím Shift bị nuốt, `event.stopImmediatePropagation()` được gọi và hàm thoát sớm mà **không bao giờ gọi `releasePhysicalCode('ShiftLeft')`**.
   - Hậu quả: `ShiftLeft` / `ShiftRight` bị kẹt vĩnh viễn trong `activePhysicalCodes`.

2. **Thiếu cơ chế Watchdog tự giải phóng cho phím bổ trợ Shift:**
   - Trong khi các phím di chuyển (W/A/S/D) được quản lý qua `movementHolds` có thời gian hết hạn an toàn (450ms - 2000ms), phím Shift lại bị bỏ qua hoàn toàn khỏi cơ chế watchdog này. Khi phím Shift bị kẹt trong `activePhysicalCodes`, không có cơ chế định kỳ nào kiểm tra xem hệ điều hành có thực sự đang giữ phím Shift phần cứng hay không.

3. **Biểu thức đánh giá `shiftDown` 5 nguồn lỏng lẻo (5-source OR Evaluation):**
   - Trước khi sửa, `shiftDown` được tính bằng phép OR giữa 5 nguồn độc lập: `isPhysicalShiftHeld || isPhysicalCodeDown('ShiftLeft') || isPhysicalCodeDown('ShiftRight') || keyShift.isDown || cursors.shift.isDown`. Chỉ cần 1 nguồn bị kẹt (ví dụ do Alt-Tab, IME hoặc mở Modal), nhân vật luôn luôn bị kích hoạt chế độ Sprint (`isSprinting = true`).

4. **Thiếu sót khai báo `unarmed_run` trong danh mục hoạt ảnh di chuyển:**
   - Trong `src/animation/BlackKnightAnimations.ts` dòng 132, mảng `isMovement` chỉ chứa `['idle', 'walk', 'run', 'unarmed_walk']`, bỏ sót `'unarmed_run'`. Điều này dẫn đến cấu trúc tạo animation cho `unarmed_run` bị sinh khóa kép không đồng nhất giữa 4 hướng.

---

## 2. CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN (MINIMAL FIX DETAILS)

### 2.1 Cải tiến `src/entities/BlackKnightPlayer.ts`

- **Đồng bộ hóa tức thời `syncPhysicalShift()`:**
  - Luôn kiểm tra trạng thái phần cứng của phím Shift thông qua `event.getModifierState('Shift')` hoặc `event.shiftKey`.
  - Nếu `!this.isPhysicalShiftHeld`, tự động giải phóng tức thì `ShiftLeft` và `ShiftRight` khỏi `activePhysicalCodes`, đồng thời thiết lập lại `isDown = false` trên các phím Phaser `keyShift` và `cursors.shift`.
- **Loại bỏ bẫy IME trong `handleDOMKeyDown` và `handleDOMKeyUp`:**
  - `handleDOMKeyDown()`: Luôn gọi `this.syncPhysicalShift(event, isShift)` trước khi rẽ nhánh, đảm bảo cờ Shift phần cứng luôn cập nhật chính xác kể cả trong gói tin IME.
  - `handleDOMKeyUp()`: Luôn gọi `this.syncPhysicalShift(event)`. Với mã `ShiftLeft` và `ShiftRight`, không cho phép gói tin IME thoát sớm; luôn gọi `this.releasePhysicalCode(code)` và gán `this.isPhysicalShiftHeld = false`.
- **Cơ chế Watchdog bảo hiểm mồ côi (Orphan Shift Auto-Purge) trong `handleMovement()`:**
  - Mỗi khung hình di chuyển, kiểm tra chéo: Nếu `!this.isPhysicalShiftHeld`, tự động xóa sạch `ShiftLeft` và `ShiftRight` khỏi `activePhysicalCodes` và dọn dẹp các phím Phaser.
  - Thu hẹp biểu thức `shiftDown`: Phím Shift chỉ được xem là đang nhấn nếu `this.isPhysicalShiftHeld || this.isPhysicalCodeDown('ShiftLeft') || this.isPhysicalCodeDown('ShiftRight')`. Các cờ nội bộ của Phaser chỉ được phép bổ trợ khi cờ phần cứng xác nhận.
- **Bảo vệ biên giới hạn khung hình trong `playWalkOrRunAnim()`:**
  - Giới hạn chỉ số frame trong clip bảo toàn pha: `const frameIdx = Math.min(targetAnim.frames.length - 1, Math.max(0, ...))` để ngăn chặn hiện tượng nhảy vượt khung hình khi chuyển đổi giữa các clip có số lượng frame khác nhau (6 frame vs 12 frame).

### 2.2 Cải tiến `src/animation/BlackKnightAnimations.ts`

- Bổ sung `'unarmed_run'` vào mảng `isMovement` tại dòng 132:
  ```typescript
  const isMovement = ['idle', 'walk', 'run', 'unarmed_walk', 'unarmed_run'].includes(action);
  ```
  Bảo đảm hoạt ảnh chạy không vũ khí (Unarmed Run) được đối xử đồng bộ như hoạt ảnh chạy có vũ khí và đi bộ.

---

## 3. ĐỐI CHIẾU THỰC NGHIỆM TRƯỚC VÀ SAU KHI SỬA (BEFORE VS AFTER TELEMETRY)

### 3.1 Kịch bản tái hiện lỗi gốc (`scratch/test_hw_bug_21b_repro.py`)
Mô phỏng người chơi chạy nhanh (Shift + W), sau đó nhả Shift trong khi bộ gõ EVKey gửi gói tin IME `Process` (nuốt `keyup`), rồi tiếp tục nhấn `KeyW` để đi bộ:

| Chỉ số Telemetry | Trước khi sửa (BEFORE - BUG) | Sau khi sửa (AFTER - FIXED) | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Trạng thái phím Shift** | Bị kẹt trong `activePhysicalCodes` | Tự động giải phóng sạch sẽ | Đã giải quyết triệt để |
| **Vận tốc nhân vật (`speed`)** | `140.0 px/s` (Chạy nhanh) | `85.0 px/s` (Đi bộ chuẩn) | Khớp 100% vận tốc thiết kế |
| **Cờ Sprint (`isSprinting`)** | `True` (Sai lệch) | `False` (Chính xác) | Không còn kẹt Sprint |
| **Animation phát ra (`animKey`)** | `wayfarer_run_up` (Chạy) | `wayfarer_walk_up` (Đi bộ) | Đúng hoạt ảnh đi bộ |
| **Kết quả kiểm thử Assert** | `AssertionError: BUG CONFIRMED` (Exit 1) | `PASS: Walking state is correct!` (Exit 0) | Đạt tuyệt đối |

---

## 4. MA TRẬN 10 BÀI KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (FULL VERIFICATION SUITE)

Tất cả 10 kịch bản kiểm thử nghiêm ngặt trong [tests/hw_bug_21b_walk_run_verification.py](file:///G:/HOLLOW%20WOODS/tests/hw_bug_21b_walk_run_verification.py) đều được thực thi tự động qua Playwright Headless và đạt kết quả **PASS 10/10**:

| STT | Kịch bản kiểm thử (Test Scenario) | Vận tốc đo được | Hoạt ảnh ghi nhận | Kết quả | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | Khởi động New Game tại Bellhollow (Noclip OFF) | `0.0 px/s` | `wayfarer_idle_down` | **PASS** | Tọa độ chuẩn, không noclip |
| **2** | Đi bộ 4 hướng W/A/S/D không giữ Shift | `85.0 px/s` | `wayfarer_walk_{dir}` | **PASS** | Kiểm tra độc lập cả 4 hướng (up/down/left/right) |
| **3** | Chạy nhanh giữ Shift + W | `140.0 px/s` | `wayfarer_run_up` | **PASS** | Hoạt ảnh 12 frame `armed_run_sequence` mượt mà |
| **4** | Nhả Shift trong khi vẫn tiếp tục giữ W | `140 -> 85 px/s` | `run_up -> walk_up` | **PASS** | Chuyển đổi trạng thái tức thì, không khựng |
| **5** | Kiểm tra độ ổn định Key-Repeat khi giữ W lâu | `85.0 px/s` | `wayfarer_walk_up` | **PASS** | Key-repeat không làm kích hoạt nhầm Run |
| **6** | Chuyển cửa sổ Alt-Tab (Mất Focus) & Gói tin IME | `85.0 px/s` | `wayfarer_walk_up` | **PASS** | `isPhysicalShiftHeld = False`, xóa phím mồ côi |
| **7** | Mở / Đóng Modal (Menu Tạm dừng ESC) | `85.0 px/s` | `wayfarer_walk_up` | **PASS** | Nhả Shift trong modal không làm kẹt gameplay |
| **8** | Chuyển động Có vũ khí vs Không vũ khí (Armed / Unarmed) | `85.0 / 140.0` | `unarmed_walk / unarmed_run` | **PASS** | Unarmed Walk (85) và Unarmed Sprint (140) chuẩn xác |
| **9** | Chuyển phân khu Rừng Ngoại Vi (Outer Woods, Noclip OFF) | `85.0 px/s` | `wayfarer_walk_up` | **PASS** | Vận tốc đi bộ ngoài thiên nhiên hoang dã đúng 85 px/s |
| **10** | Kiểm thử khói chiến đấu hồi quy (Attack, Roll, Parry) | `0 / 70 / 85` | `attack / roll / parry / walk` | **PASS** | Sau đòn đánh, né và đỡ đòn, đi bộ phục hồi đúng 85 px/s |

---

## 5. CAM KẾT AN TOÀN HỆ THỐNG & ĐỘ TOÀN VẸN REPO

1. **Bảo toàn Scale cho nhiệm vụ tiếp theo (HW-BUG-22):**
   - Hoàn toàn **không chỉnh sửa** tỉ lệ hiển thị (Sprite Scale) trong `getLocomotionArtworkScale()` hay các thông số kích thước cơ thể, bảo đảm nguyên vẹn phạm vi công việc cho nhiệm vụ HW-BUG-22.
2. **Không làm hồi quy âm thanh:**
   - Bảo toàn nguyên vẹn 3 tệp nguồn âm thanh untracked được chấp thuận (`AUDIO_SOURCES_MANIFEST.csv`, `AUDIO_SOURCES_MANIFEST.json`, `generate_audio_sources_manifest.mjs`).
3. **Không ảnh hưởng Save Schema hay Quest Gates:**
   - Không can thiệp vào Save Schema V3, không sửa đổi Quest Gates hay các trạng thái cốt truyện.
4. **Biên dịch & Build:**
   - `npx tsc --noEmit`: Thoát với mã 0 (Không phát sinh bất kỳ lỗi TypeScript nào).
   - `npm run build`: Vite build hoàn tất thành công trong 12.22s.

---
*Báo cáo được khởi tạo tự động và xác thực độc lập trên HEAD của nhánh `feat/v1.5.3-ag-world-polish`.*
