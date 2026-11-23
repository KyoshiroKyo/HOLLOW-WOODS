# BÁO CÁO NGHIỆM THU: HW-STAB-32 — PLAYER INPUT, PANIC SETTINGS & QA CONFIG STABILITY

- **Dự án:** HOLLOW WOODS — PREP V1.5.4
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Nhánh thực hiện:** `feat/v1.5.3-ag-world-polish`
- **Baseline SHA:** `e93b2f48c90e8235db2d6fde75241d3796fe3f70`
- **Chế độ:** `TARGETED SOURCE FIX + RUNTIME REGRESSION`
- **Ngày thực hiện:** 23/11/2026
- **Tác giả:** Gemini Flash High (Implementation Agent)
- **Trạng thái:** **HOÀN THÀNH 100% (ALL SUITES PASS)**

---

## 1. YÊU CẦU ĐÃ NHẬN (REQUIREMENTS)

1. **PART A — HW-BUG-26C SHIFT REVALIDATION:**
   - Khắc phục hiện tượng watchdog Shift 600ms tự hủy phím Shift đang được giữ hợp lệ khi người chơi đứng yên.
   - Kịch bản tái hiện:
     - Giữ Shift 1000ms, không nhả.
     - Sau đó nhấn W và tiếp tục giữ Shift $\rightarrow$ Expected: Sprint được kích hoạt (140 px/s, `wayfarer_run_*`).
     - Giữ Shift+W thêm 3 giây $\rightarrow$ Expected: Sprint tiếp tục khi còn thể lực, thể lực tiêu hao hợp lệ.
     - Nhả Shift nhưng giữ W $\rightarrow$ Expected: Trở về Đi bộ (85 px/s, `wayfarer_walk_*`).
   - Ngăn chặn triệt để gói tin IME giả (`keyCode: 229/231`, `key: 'Process'`) kích hoạt Sprint.
   - Đánh giá modifier state hợp lệ (`event.getModifierState('Shift')`) trên các sự kiện bàn phím mới.
   - Không tăng timeout tùy tiện, không đổi atlas, scale, combat, stamina hoặc tốc độ cơ bản.

2. **PART B — PANIC TOGGLE BOSS FIX:**
   - Trong `src/scenes/UIScene.ts: updatePanicVignette()`, nhánh `isBossFight` trước đây bỏ qua cờ `!isPanicEnabled`.
   - Sửa điều kiện tối thiểu để thiết lập Panic Visuals OFF luôn được tôn trọng 100%, kể cả trong trận đấu Boss Miếu Chuông Phế Tích (`broken_bell_shrine`).
   - Bảo toàn ngưỡng đặc biệt Boss 50 và ngưỡng môi trường thông thường 40.
   - Đảm bảo chuyển đổi động ON/OFF mid-fight, fade-out và Reduced Motion hoạt động hoàn hảo. Không sửa VeilSystem hay tạo overlay mới.

3. **PART C — QA SETTINGS ISOLATION:**
   - Thiết kế khóa LocalStorage riêng cho cấu hình QA (`hollow_woods_qa_settings`) dựa trên chính sách `DevSessionPolicy`.
   - Đảm bảo cách ly hoàn toàn giữa môi trường QA và Retail trên cùng một origin:
     - Chỉnh sửa cài đặt bên QA $\rightarrow$ Khóa Retail (`hollow_woods_settings`, `hw_settings`) không bị thay đổi.
     - Chỉnh sửa cài đặt bên Retail $\rightarrow$ Khóa QA (`hollow_woods_qa_settings`) không bị thay đổi.
   - Hỗ trợ tải lại (reload) và cơ chế dự phòng (fallback), bảo toàn dữ liệu cấu hình cũ, không sửa Save Schema 3.

4. **PART D — REDUCED MOTION UI:**
   - Tích hợp công tắc trực quan **"Giảm Chuyển Động"** (`reducedMotionEnabled`) vào tab `👁️ Hình Ảnh & Tiếp Cận` trong cả `PauseModal` và `MainMenuScene`.
   - Bố cục thẩm mỹ, không đè chữ/nút, không làm hỏng điều khiển phím/gamepad.
   - Cài đặt lưu tức thì và có hiệu lực ngay lập tức (chặn rung giật camera và dao động ánh sáng).

---

## 2. HIỆN TRẠNG KIẾN TRÚC & NGUYÊN NHÂN GỐC (ROOT CAUSE ANALYSIS)

### 2.1. Part A: Watchdog tự hủy phím Shift khi đứng yên
- **Nguyên nhân gốc:**
  - Trong `BlackKnightPlayer.ts`, khi người chơi nhấn Shift, `shiftExpiresAt` được đặt là `performance.now() + 600`.
  - Nếu người chơi đứng yên giữ Shift trong 1000ms trước khi nhấn phím di chuyển (W/A/S/D), tại mốc 600ms, bộ đếm watchdog trong `update()` thấy `nowPerf >= this.shiftExpiresAt`, cưỡng bức gọi `releasePhysicalCode('ShiftLeft')` và xóa sạch `activePhysicalCodes`.
  - Sau đó khi phím W được nhấn ở mốc 1000ms, hàm `syncPhysicalShift()` kiểm tra điều kiện `modifierShift && (this.activePhysicalCodes.has('ShiftLeft') || ...)` $\rightarrow$ do `activePhysicalCodes` đã bị xóa oan, điều kiện này sai $\rightarrow$ rơi vào nhánh `else`, xóa hoàn toàn cờ Shift và bắt nhân vật đi bộ thay vì chạy.

### 2.2. Part B: Lọt cờ Panic Visuals trong Boss Fight
- **Nguyên nhân gốc:**
  - Trong `UIScene.ts`, dòng 1857:
    ```typescript
    const isSafeState = isBossFight
      ? (composure >= 50)
      : (isProtectedZone || composure >= 40 || !isPanicEnabled);
    ```
  - Khi `isBossFight = true`, toán tử 3 ngôi đánh giá nhánh `(composure >= 50)`. Nhánh này hoàn toàn không có `!isPanicEnabled`. Do đó, người chơi đã tắt "Hiệu Ứng Hoảng Sợ" trong Cài Đặt nhưng khi đánh Boss và Tinh Thần < 50, màn hình vẫn bị phủ sương tím và vệt đỏ trái ý muốn.

### 2.3. Part C: Ghi đè LocalStorage giữa QA và Retail
- **Nguyên nhân gốc:**
  - `DevSessionPolicy.ts` đã khai báo `QA_SETTINGS_KEY = 'hollow_woods_qa_settings'`, và `CloudSaveService` đã áp dụng một phần, nhưng `SettingsManager.ts` vẫn hardcode hai khóa Retail: `LOCAL_PREFIX_KEY = 'hollow_woods_settings'` và `STORAGE_KEY = 'hw_settings'`.
  - Mọi thao tác lưu/đọc trong `scheduleSave()` và `loadFromLocalStorage()` của `SettingsManager` đều can thiệp trực tiếp vào khóa Retail, gây ô nhiễm dữ liệu cài đặt của người chơi Retail khi chạy kiểm thử QA.

### 2.4. Part D: Thiếu công tắc trực tiếp cho Reduced Motion
- **Nguyên nhân gốc:**
  - `SettingsManager.ts` đã có sẵn đầy đủ API `isReducedMotionEnabled()`, `setReducedMotionEnabled()`, `toggleReducedMotion()`, nhưng giao diện `PauseModal` và `MainMenuScene` chưa tích hợp công tắc này vào tab `Hình Ảnh & Tiếp Cận`.

---

## 3. THIẾT KẾ & SOURCE DIFF ĐÃ SỬA ĐỔI

### 3.1. Part A: `src/entities/BlackKnightPlayer.ts`
1. **Tái hợp lệ hóa qua Modifier State:** Trong `syncPhysicalShift()`, nếu sự kiện bàn phím mới là non-IME (`!isIme`) và mang cờ `modifierShift === true`, hệ thống tái kích hoạt phím Shift vật lý ngay lập tức (`isPhysicalShiftHeld = true`, `activePhysicalCodes.add('ShiftLeft')`, gia hạn watchdog 600ms).
2. **Khóa Watchdog khi đứng yên:** Trong `handleMovement()`, watchdog chỉ kiểm tra quá hạn khi nhân vật đang thực sự di chuyển:
   ```typescript
   const isMoving = moveX !== 0 || moveY !== 0;
   const isShiftTimeValid = !isMoving || this.shiftExpiresAt === 0 || nowPerf < this.shiftExpiresAt;
   ```
   Khi đứng yên (`!isMoving`), phím Shift không bị xóa vô cớ.

### 3.2. Part B: `src/scenes/UIScene.ts`
Chỉnh sửa điều kiện an toàn tối thiểu:
```typescript
// HW-FX-31 & HW-STAB-32: Tắt Panic Visuals luôn được tôn trọng tuyệt đối
const isSafeState = !isPanicEnabled || (isBossFight
  ? (composure >= 50)
  : (isProtectedZone || composure >= 40));
```

### 3.3. Part C: `src/debug/DevSessionPolicy.ts`, `src/systems/SettingsManager.ts`, `src/services/CloudSaveService.ts`
1. Bổ sung `isQABuild()` hỗ trợ override kiểm thử runtime trên cùng origin:
   ```typescript
   export function isQABuild(): boolean {
     if (typeof window !== 'undefined' && typeof (window as any).__HOLLOW_WOODS_QA_OVERRIDE__ === 'boolean') {
       return (window as any).__HOLLOW_WOODS_QA_OVERRIDE__;
     }
     return QA_BUILD;
   }
   ```
2. Trong `SettingsManager.ts`:
   - `loadFromLocalStorage()`: Đọc `QA_SETTINGS_KEY` khi `isQABuild()` là true; đọc `LOCAL_PREFIX_KEY` / `STORAGE_KEY` khi Retail.
   - `scheduleSave()`: Ghi vào `QA_SETTINGS_KEY` khi QA; ghi vào `LOCAL_PREFIX_KEY` và `STORAGE_KEY` khi Retail.
   - Bổ sung `reloadFromStorage()` và `flushSaveAsync()` hỗ trợ đồng bộ tức thì.
3. Trong `CloudSaveService.ts`: Đồng bộ `saveSettings` và `loadSettings` sử dụng `isQABuild()`.

### 3.4. Part D: `src/ui/PauseModal.ts`, `src/scenes/MainMenuScene.ts`
1. Bổ sung `reducedMotionToggleControl` vào `PauseModal`:
   - Đặt tại `sBoxY + 78` với nhãn `♿ Giảm Chuyển Động (Reduced Motion):`.
   - Căn chỉnh lại khoảng cách giữa 6 điều khiển (Graphics: 38, Reduced Motion: 78, Screen Shake: 118, Panic: 158, Light Motion: 198, Intensity: 238, Tip: 276) trong khung 314px thông thoáng.
   - Kết nối `updateVolumeTexts()` để cập nhật tức thì cờ phụ thuộc (Screen Shake, Light Motion).
2. Bổ sung `reducedMotionToggle` vào `MainMenuScene`:
   - Đặt tại `-modalH / 2 + 165`.

---

## 4. PHẦN GIỮ NGUYÊN (PRESERVED ARCHITECTURE)

- **Save Schema 3:** Giữ nguyên 100% cấu trúc lưu game, không thêm trường save game vào save progress.
- **Retail Storage:** Khóa `hollow_woods_settings` và `hw_settings` của người chơi Retail giữ nguyên 100%.
- **Locomotion Stats & Constants:** Giữ nguyên `PLAYER_WALK_SPEED = 85`, `PLAYER_SPRINT_SPEED = 140`, hệ thống thể lực, combat cooldowns.
- **VeilSystem & Vignette:** Không tạo texture/graphics trùng lặp, duy trì đồ họa hữu cơ `drawCornerMist` và guardrail chống strobe của HW-FX-31 / BUG-023.

---

## 5. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (TEST RESULTS)

### 5.1. Bộ kiểm thử mới: `scripts/test_hw_stab32_stability.py` (15/15 PASS — 100%)

| Test Case | Nội dung kiểm chứng | Kết quả | Chi tiết đo đạc |
| :--- | :--- | :---: | :--- |
| **TEST 1 (A1)** | Giữ Shift 1000ms $\rightarrow$ Nhấn W $\rightarrow$ Kích hoạt Sprint | **PASS** | `isSprinting=True, spd=140, anim=wayfarer_run_up` |
| **TEST 2 (A2)** | Giữ Shift+W 3s $\rightarrow$ Sprint duy trì & Stamina tiêu hao | **PASS** | `isSprinting=True, spd=140, stamina=50.4/100` |
| **TEST 3 (A3)** | Nhả Shift khi vẫn giữ W $\rightarrow$ Trở về Đi bộ | **PASS** | `isSprinting=False, spd=85, anim=wayfarer_walk_up` |
| **TEST 4 (A4)** | Phòng thủ EVKey nuốt keyup (Modifier false xóa Shift) | **PASS** | `isShiftHeld=False, hasShiftCode=False` |
| **TEST 5 (A5)** | Gói tin IME Process (keyCode 229) không kích hoạt Sprint | **PASS** | `isShiftHeld=False, hasShiftCode=False, isSprinting=False` |
| **TEST 6 (B1)** | Boss Fight Composure 10 + Panic ON $\rightarrow$ Vignette bật | **PASS** | `panicEnabled=True, isPanicActive=True` |
| **TEST 7 (B2)** | Boss Fight Composure 10 + Panic OFF $\rightarrow$ Vignette tắt | **PASS** | `panicEnabled=False, isPanicActive=False (isSafeState=True)` |
| **TEST 8 (B3)** | Chuyển đổi động ON/OFF giữa trận Boss | **PASS** | `onActive=True, offActive=False` |
| **TEST 9 (B4)** | Ngưỡng Boss 50 bảo toàn (55=Safe, 45=Active) | **PASS** | `comp55Active=False, comp45Active=True` |
| **TEST 10 (C1)** | Sửa đổi cài đặt QA không ảnh hưởng khóa Retail | **PASS** | `Retail(vol=0.9, panic=True) vs QA(vol=0.35, panic=False)` |
| **TEST 11 (C2)** | Sửa đổi cài đặt Retail không ảnh hưởng khóa QA | **PASS** | `Retail(vol=0.75) vs QA(vol=0.35)` |
| **TEST 12 (C3)** | ReloadFromStorage duy trì trạng thái độc lập | **PASS** | `QA(vol=0.35) vs Retail(vol=0.75)` |
| **TEST 13 (D1)** | PauseModal chứa công tắc Reduced Motion | **PASS** | `hasControl=True, initialValue=False` |
| **TEST 14 (D2)** | Reduced Motion ON chặn rung & dao động tức thì | **PASS** | `rmPref=True, shakeBlocked=True, lightBlocked=True` |
| **TEST 15 (D3)** | MainMenuScene Settings Modal hỗ trợ Reduced Motion | **PASS** | `toggledOff=False, toggledOn=True` |

### 5.2. Các bộ kiểm thử hồi quy toàn diện (Regression Suites)

| Bộ kiểm thử | Số ca kiểm thử | Kết quả | Ghi chú |
| :--- | :---: | :---: | :--- |
| `tests/hw_bug_21b_walk_run_verification.py` | 10 / 10 | **PASS (100%)** | 4 hướng walk, sprint, repeat key, focus loss, combat smoke |
| `tests/hw_bug_26b_walkrun_fix_verification.py` | 5 / 5 | **PASS (100%)** | Watchdog expiry, collision guardrail, action locks |
| `scripts/test_bug023_sanity_flash.py after` | 15 / 15 | **PASS (100%)** | Zero strobe, safe zones, fade-out, camera safety |
| `scripts/test_hw_fix23a_reduced_motion.py` | 12 / 12 | **PASS (100%)** | Đèn lồng hổ phách tĩnh khi RM ON, bat flicker, graphics levels |
| `scripts/test_hw_qa23b_fow_camera.py` | 4 Suites (18 tests) | **PASS (100%)** | FOW 2 chu kỳ 0.25 Hz, A/B/C benchmarks, real call path |
| `scripts/test_hw_fx31_sanity_atmosphere.py` | 25 / 25 | **PASS (100%)** | Sương tím 4 cấp, vệt đỏ mép, tab settings, persistence |
| `npx tsc --noEmit` & `npm run build` | - | **PASS (0 errors)** | Bundle xuất bản `dist/` thành công |

Console Errors: **0** trên toàn bộ các bộ test.

---

## 6. TEST FAIL HOẶC NOT VERIFIED

- **GPU Hardware Observation:** Ghi nhận `NOT VERIFIED` do môi trường tự động chạy trên Headless Chromium SwiftShader CPU Software Rasterizer (đây là đặc thù kiểm thử headless, hiệu năng frame và GPU render thật sẽ do Owner nghiệm thu trực tiếp).

---

## 7. RỦI RO CÒN LẠI (RESIDUAL RISKS)

- Không có rủi ro đối với người chơi Retail vì khóa dữ liệu và Save Schema 3 được bảo vệ 100%.
- Cần Owner kiểm tra trực tiếp với bộ gõ EVKey/UniKey trên môi trường Windows vật lý để xác nhận trải nghiệm phím Shift bấm-nhả thực tế.

---

## 8. DANH SÁCH FILE SỬA ĐỔI & TẠO MỚI

1. `src/entities/BlackKnightPlayer.ts` (Sửa đổi logic Shift revalidation & watchdog).
2. `src/scenes/UIScene.ts` (Sửa điều kiện an toàn Boss Panic Visuals).
3. `src/debug/DevSessionPolicy.ts` (Bổ sung hàm kiểm tra `isQABuild()`).
4. `src/systems/SettingsManager.ts` (Cách ly khóa lưu trữ QA/Retail, thêm reload & flush).
5. `src/services/CloudSaveService.ts` (Đồng bộ cách ly cấu hình QA).
6. `src/ui/PauseModal.ts` (Bổ sung công tắc UI Reduced Motion).
7. `src/scenes/MainMenuScene.ts` (Bổ sung công tắc UI Reduced Motion).
8. `scripts/test_hw_stab32_stability.py` (Bộ test tự động 15 ca kiểm thử mới).
9. `Read/V1.5/Reports/hw_stab32_metrics.json` (Dữ liệu kết quả test tự động).
10. `Read/V1.5/Reports/HW_STAB_32_SOURCE_STABILITY_REPORT.md` (Báo cáo nghiệm thu này).

---

## 9. VIỆC CẦN OWNER NGHIỆM THU

1. **Phím Shift vật lý:** Thử nghiệm trong game: đứng yên giữ Shift ~1 giây rồi bấm W xem nhân vật có chạy ngay lập tức không. Nhả Shift khi đang chạy xem nhân vật có quay lại đi bộ mượt mà không.
2. **Cài Đặt Boss Fight:** Vào Cài Đặt tắt "Hiệu Ứng Hoảng Sợ", đánh Boss Miếu Chuông khi Tinh Thần thấp xem màn hình có giữ trong trẻo không.
3. **Công Tắc Giảm Chuyển Động:** Mở Menu Cài Đặt (ESC hoặc Main Menu) $\rightarrow$ tab Hình Ảnh & Tiếp Cận $\rightarrow$ kiểm tra công tắc `♿ Giảm Chuyển Động (Reduced Motion)`.
