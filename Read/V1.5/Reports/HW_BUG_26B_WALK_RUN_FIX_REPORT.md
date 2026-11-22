# BÁO CÁO NGHIỆM THU: KHẮC PHỤC TRIỆT ĐỂ LỖI ĐỒNG BỘ ĐI BỘ / CHẠY VÀ VA CHẠM VẬT CẢN (HW-BUG-26B)

- **Dự án:** HOLLOW WOODS — V1.5.4 Preparation
- **Mã nhiệm vụ:** `HW-BUG-26B`
- **Độ ưu tiên:** `P1`
- **Nhánh thực hiện:** `feat/v1.5.3-ag-world-polish`
- **Commit gốc (26A Audit):** `1bd9c6ea66e7df147e2dc3972d746f99217532a3`
- **File sửa đổi mã nguồn:** `src/entities/BlackKnightPlayer.ts`
- **Bộ kiểm thử tự động:** `tests/hw_bug_26b_walkrun_fix_verification.py`
- **Trạng thái tự động hóa:** **PASS (5/5 Verification Suites, 10/10 Regression Suites, 11/11 Diagnostic Suites)**
- **Trạng thái thực tế môi trường OS (EVKey/UniKey):** **NEEDS OWNER PHYSICAL TEST WITH EVKEY** (Đã mô phỏng và khóa logic qua Watchdog, nhưng chưa chạy qua hook phần cứng `WH_KEYBOARD_LL` của tiến trình Windows thật).

---

## 1. NGUYÊN NHÂN GỐC (ROOT CAUSE ANALYSIS)

Từ kết quả phân tích chẩn đoán ở nhiệm vụ `HW-BUG-26A` và video phản ánh thực tế của Owner:
1. **Mất đồng bộ sự kiện phần cứng Shift khi dùng bộ gõ tiếng Việt (EVKey / UniKey):**
   - Khi bộ gõ can thiệp qua hook bàn phím toàn cục `WH_KEYBOARD_LL`, sự kiện `keyup` của phím Shift có thể bị nuốt, hoặc gửi kèm gói tin `VK_PROCESSKEY` (key code 229).
   - Hệ thống trước đây dựa vào `event.getModifierState('Shift')` hoặc `activePhysicalCodes.has('ShiftLeft')`. Nếu cờ này bị kẹt mà không có sự kiện `keyup`, `isPhysicalShiftHeld` bị treo vĩnh viễn ở trạng thái `true`. Bất kỳ phím di chuyển nào sau đó cũng biến thành chạy (140 px/s) thay vì đi bộ (85 px/s).
2. **Hiện tượng "Cắm đầu chạy vào vật cản" (Obstacle Sprint Visual Desync):**
   - Khi người chơi giữ Shift + A/W/S/D lao vào tảng đá/cây/tường (như tại Rừng Ngoại Vi `x: 1145, y: 615`), nhân vật bị vật lý Arcade Physics cản lại (`touching.left = true`, vị trí thực tế đứng yên).
   - Tuy nhiên, vì người chơi vẫn giữ phím Shift và phím hướng, logic cũ vẫn đánh giá `isMoving = true && shiftDown = true` $\rightarrow$ `isSprinting = true` $\rightarrow$ nhân vật tiếp tục phát hoạt ảnh `run` cắm đầu 45 độ bước nhanh liên tục vào tảng đá.
3. **Dư âm cờ Sprint sau các hành động khóa (Combat Action Locks):**
   - Khi đang chạy và người chơi nhấn Đánh (Light/Heavy/Art Attack), Lăn né (Roll), Đỡ đòn (Parry), hoặc Rút/Thu vũ khí (Toggle Weapon), cờ `stats.isSprinting` không được dọn sạch dứt điểm, có thể tạo frame glitch khi hành động vừa kết thúc.
4. **Đổi hướng đột ngột bị giữ frame cũ:**
   - Trong `handleMovement()`, khi người chơi nhả phím di chuyển (`moveX === 0 && moveY === 0`), nhánh `else` không gọi `updateFacingDirection(0, 0)`, khiến `this._wasMoving` vẫn giữ `true`. Khi chuyển ngay từ D sang A, bộ đệm hướng 40ms có thể giữ frame hướng cũ trong 1-2 frame đầu.

---

## 2. GIẢI PHÁP VÀ MÃ NGUỒN ĐÃ TRIỂN KHAI (IMPLEMENTATION DIFF)

Toàn bộ chỉnh sửa được cô lập và gói gọn trong `src/entities/BlackKnightPlayer.ts`:

### 2.1. Shift Watchdog (600ms) & Nguyên Tắc Đồng Thuận (Consensus Rule)
- Bổ sung `shiftExpiresAt: number = 0` và hằng số `SHIFT_WATCHDOG_TIMEOUT_MS = 600`.
- Khi nhấn Shift vật lý hợp lệ, gia hạn `shiftExpiresAt = performance.now() + 600`.
- Trong `syncPhysicalShift()`:
  - Gói tin IME không được phép kích hoạt hay duy trì Shift.
  - Cờ `modifierShift` chỉ có thể làm mới bộ đếm khi `activePhysicalCodes` thực sự chứa phím Shift vật lý.
  - Nếu `modifierShift` báo `false`, Shift bị giải phóng ngay lập tức (phủ định tức thì).
- Trong `update()`: Nếu `shiftExpiresAt > 0` và quá hạn 600ms mà không có phím Shift vật lý nào gửi tín hiệu làm mới, watchdog tự động giải phóng cờ `isPhysicalShiftHeld = false` và dọn `ShiftLeft/ShiftRight`.

### 2.2. Collision Motion Guardrail (250ms)
- Bổ sung `blockedMovementStartTime: number = 0` và hằng số `BLOCKED_MOVEMENT_GUARDRAIL_MS = 250`.
- Theo dõi trạng thái va chạm vật lý theo vector di chuyển:
  - `isBlockedX = (moveX < 0 && (blocked.left || touching.left)) || (moveX > 0 && (blocked.right || touching.right))`
  - `isBlockedY = (moveY < 0 && (blocked.up || touching.up)) || (moveY > 0 && (blocked.down || touching.down))`
- Khi nhân vật muốn di chuyển nhưng bị chặn hoàn toàn (`isCompletelyBlocked`), đồng hồ bấm giờ bắt đầu.
- Nếu bị chặn liên tục vượt quá **250ms**, hệ thống cưỡng chế `canSprint = false` $\rightarrow$ `stats.isSprinting = false`.
- Hoạt ảnh tự động hạ cấp từ `wayfarer_run_*` về `wayfarer_walk_*` (bước tại chỗ tự nhiên), loại bỏ tư thế lao người 45 độ phản cảm.
- Ngay khi người chơi quay ra hướng thoáng hoặc thả phím, `blockedMovementStartTime` reset về 0 và Sprint sẵn sàng kích hoạt lại bình thường.

### 2.3. Bất Biến Locomotion (Invariant Enforcement)
- Trong `playWalkOrRunAnim()`: Bổ sung guardrail triệt để:
  ```typescript
  if (!isRunning && targetKey.includes('_run_')) {
    const walkTarget = targetKey.replace('_run_', '_walk_');
    if (this.scene.anims.exists(walkTarget)) {
      this.safePlayAnim(walkTarget, true);
      return;
    }
  }
  ```
  Đảm bảo khi `isSprinting === false`, **tuyệt đối không bao giờ** xuất hiện bất kỳ khung hình nào của clip `_run_`.

### 2.4. Dọn Dẹp Hành Động Khóa (Action Lock Sprint Purge)
- Đặt `this.stats.isSprinting = false` trong toàn bộ các hàm chuyển trạng thái:
  - `resetAllActionAndMotionStates()`
  - `playAttackAnimation()` (Light Attack, Heavy Attack, Weapon Art)
  - `parry()`
  - `roll()`
  - `toggleWeapon()`
  - `playHurt()`
  - `playUtilityAction()`

### 2.5. Đồng Bộ Đổi Hướng (Facing Direction Reset)
- Trong `handleMovement()`, khi không còn tín hiệu di chuyển (`moveX === 0 && moveY === 0`), gọi `this.updateFacingDirection(0, 0)` để reset `_wasMoving = false`, triệt tiêu độ trễ hướng khi đảo phím.

---

## 3. CHI TIẾT MÃ NGUỒN SỬA ĐỔI (GIT DIFF)

```diff
diff --git a/src/entities/BlackKnightPlayer.ts b/src/entities/BlackKnightPlayer.ts
--- a/src/entities/BlackKnightPlayer.ts
+++ b/src/entities/BlackKnightPlayer.ts
@@ -81,6 +81,10 @@ export class BlackKnightPlayer extends Phaser.Physics.Arcade.Sprite {
   private isTextInputFocused: boolean = false;
   private domListenersAttached: boolean = false;
   private isPhysicalShiftHeld: boolean = false;
+  private shiftExpiresAt: number = 0;
+  private blockedMovementStartTime: number = 0;
+  private static readonly SHIFT_WATCHDOG_TIMEOUT_MS = 600;
+  private static readonly BLOCKED_MOVEMENT_GUARDRAIL_MS = 250;
...
@@ -624,11 +628,22 @@ export class BlackKnightPlayer extends Phaser.Physics.Arcade.Sprite {
   private syncPhysicalShift(event: KeyboardEvent, isShiftDown = false): void {
+    const isIme = BlackKnightPlayer.isImeMovementPacket(event);
     const modifierShift = typeof event.getModifierState === 'function' ? event.getModifierState('Shift') : Boolean(event.shiftKey);
+    const nowPerf = performance.now();
+
+    if (isShiftDown) {
+      this.isPhysicalShiftHeld = true;
+      this.shiftExpiresAt = nowPerf + BlackKnightPlayer.SHIFT_WATCHDOG_TIMEOUT_MS;
+    } else if (isIme) {
+      // Gói tin IME không được kích hoạt hay duy trì trạng thái Shift
+    } else if (modifierShift && (this.activePhysicalCodes.has('ShiftLeft') || this.activePhysicalCodes.has('ShiftRight'))) {
+      this.isPhysicalShiftHeld = true;
+      this.shiftExpiresAt = nowPerf + BlackKnightPlayer.SHIFT_WATCHDOG_TIMEOUT_MS;
+    } else {
+      this.isPhysicalShiftHeld = false;
+      this.shiftExpiresAt = 0;
       this.releasePhysicalCode('ShiftLeft');
       this.releasePhysicalCode('ShiftRight');
     }
```

---

## 4. KẾT QUẢ KIỂM THỬ VÀ HỒI QUY (VERIFICATION MATRIX)

### 4.1. Bộ Kiểm Thử Chuyên Biệt HW-BUG-26B (`tests/hw_bug_26b_walkrun_fix_verification.py`)
| Test Case | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|:---|:---|:---|:---:|
| **Test 1** | Shift Watchdog Auto-Expiry (600ms Timeout khi EVKey nuốt keyup) | Sau 750ms: `isPhysicalShiftHeld=False`, `activeCodes=[]`, nhấn W đi bộ `spd=85`, `anim=wayfarer_walk_up` | **PASS** |
| **Test 2** | Collision Motion Guardrail tại vật cản Rừng Ngoại Vi (1145, 615) | Chạy vào đá >250ms: `spd=85`, `isSprinting=False`, `anim=wayfarer_walk_left` | **PASS** |
| **Test 3** | Clean Sprint Resumption khi hết cản | Chạy về hướng Nam thoáng: `spd=140`, `isSprinting=True`, `anim=wayfarer_run_down` (12 frames) | **PASS** |
| **Test 4** | Action Locks dọn sạch `isSprinting` (Attack, Roll, Parry) | Trong hành động: `isSprinting=False`. Sau hành động: trở về Walk bình thường | **PASS** |
| **Test 5** | Save Schema 3 & P2Game Integrity | `saveSchemaVersion=3`, lưu trạng thái `isSprinting=False` an toàn | **PASS** |

### 4.2. Bộ Hồi Quy Tiêu Chuẩn (`tests/hw_bug_21b_walk_run_verification.py`)
- **10/10 Verification Tests PASSED RIGOROUSLY!**
  - Test 1: Khởi tạo game mới tại Bellhollow.
  - Test 2: Đi bộ 4 hướng không Shift (`spd=85`, `anim=wayfarer_walk_*`).
  - Test 3: Sprint có Shift (`spd=140`, `anim=wayfarer_run_up`).
  - Test 4: Nhả Shift khi vẫn giữ W (chuyển mượt từ 140 về 85).
  - Test 5: Ổn định Key-Repeat khi đi bộ.
  - Test 6: Mất focus / Alt-Tab / Gói tin IME (`physShift=False`).
  - Test 7: Mở / Đóng Modal (Pause ESC).
  - Test 8: Locomotion có vũ khí (armed) vs không vũ khí (unarmed).
  - Test 9: Chuyển vùng sang Rừng Ngoại Vi (Outer Woods).
  - Test 10: Hành động chiến đấu (Attack, Roll, Parry).

### 4.3. Kiểm Tra Biên Dịch & Build Sản Phẩm
- `npx tsc --noEmit` $\rightarrow$ **Exit Code 0 (Không có lỗi kiểu dữ liệu)**.
- `npm run build` $\rightarrow$ **Exit Code 0 (Vite build thành công trong 14.95s)**.
- `git diff --check` $\rightarrow$ **Exit Code 0 (Không có lỗi trailing whitespace)**.

---

## 5. BẢO TOÀN DỮ LIỆU DỰ ÁN & SAVE SCHEMA
- **Save Schema:** Giữ nguyên phiên bản 3 (`saveSchemaVersion === 3`).
- **P2Game Engine:** Giữ nguyên vẹn cấu hình retail và module loader.
- **Tài nguyên của Owner:** 3 file manifest âm thanh untracked (`scripts/AUDIO_SOURCES_MANIFEST.*`, `scripts/generate_audio_sources_manifest.mjs`) được bảo toàn tuyệt đối, không bị stage hay can thiệp.

---

## 6. ĐÁNH GIÁ RỦI RO & KHUYẾN NGHỊ THỬ NGHIỆM THỰC TẾ

> [!WARNING]
> **TRẠNG THÁI MÔI TRƯỜNG THỰC TẾ: NEEDS OWNER PHYSICAL TEST WITH EVKEY**
> - Môi trường kiểm thử tự động headless (Playwright/Chromium) đã chứng minh logic Shift Watchdog (600ms) và Collision Guardrail (250ms) hoạt động chính xác 100% trong việc hủy bỏ trạng thái Shift bị treo và hạ cấp hoạt ảnh khi va chạm.
> - Tuy nhiên, do Playwright chạy trong sandbox không đi qua hook tầng thấp của Windows (`SetWindowsHookEx(WH_KEYBOARD_LL)` từ `EVKey64.exe` hoặc `UniKeyNT.exe`), Owner nên thực hiện một bài kiểm tra ngắn trong game thực tế:
>   1. Bật EVKey (chế độ gõ tiếng Việt Telex/VNI).
>   2. Vào game, nhấn giữ Shift chạy một đoạn rồi nhả Shift, tiếp tục nhấn W.
>   3. Xác nhận nhân vật chuyển về bước đi bộ bình thường (85 px/s).
>   4. Chạy thẳng vào tảng đá hoặc thân cây ở Rừng Ngoại Vi, xác nhận nhân vật hạ xuống bước đi bộ tại chỗ thay vì cắm đầu chạy lao người vào vật cản.
