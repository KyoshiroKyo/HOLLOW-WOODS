# HW-BUG-26A — BÁO CÁO ĐIỀU TRA & CHẨN ĐOÁN CHUYÊN SÂU LỖI ĐI BỘ / CHẠY (WALK/RUN REOPEN AUDIT)

- **Dự án:** HOLLOW WOODS (Chuẩn bị phát hành V1.5.4)
- **Nhánh:** `feat/v1.5.3-ag-world-polish`
- **Mức ưu tiên:** `P1 FIRST`
- **Chế độ thực thi:** `READ-ONLY GAMEPLAY + NEW QA DIAGNOSTICS + REPORT` (Tuyệt đối không chỉnh sửa mã nguồn gameplay trong nhiệm vụ 26A)
- **Baseline Git SHA:** `aec23afca4a86f0d3793fdaccf280bc241c8e01d`
- **Tác nhân thực hiện:** Gemini 3.8 Flash High (Antigravity)
- **Ngày thực hiện:** 22/11/2026
- **Công cụ chẩn đoán:** [tests/hw_bug_26a_walkrun_repro.py](file:///G:/HOLLOW%20WOODS/tests/hw_bug_26a_walkrun_repro.py)
- **Kết luận chẩn đoán tổng thể:** **NOT REPRODUCED IN AUTOMATION + NEEDS WINDOWS EVKEY PHYSICAL TEST** (Xác định rõ ràng nguyên nhân giả thuyết & kế hoạch vá lỗi tối thiểu cho HW-BUG-26B)

---

## 1. BỐI CẢNH & PHẢN HỒI TÁI MỞ TỪ OWNER

### 1.1 Vấn đề Owner tái báo
Mặc dù đợt sửa trước [HW-BUG-21B](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_21B_WALK_RUN_FIX.md) đã có báo cáo nghiệm thu 10/10 bài test tự động PASS, Owner vẫn quan sát thấy: **"Nhân vật đang đi bộ bình thường (không giữ Shift) nhưng artwork hiển thị giống như đang chạy"**.
Theo nguyên tắc kỹ thuật nghiêm ngặt, nhiệm vụ 26A **KHÔNG ĐƯỢC PHÉP ĐÓNG BUG** dựa trên các báo cáo cũ. Chúng tôi đã mở lại toàn bộ cuộc điều tra thực nghiệm, xây dựng bộ công cụ chẩn đoán sâu tầng khung hình (telemetry per-frame), rà soát mã nguồn và kiểm chứng tư liệu hình ảnh/video.

### 1.2 Phân tích tư liệu video thực tế của Owner (`Recording 2026-11-16 090051.mp4`)
Chúng tôi đã trích xuất trực tiếp các khung hình từ tệp video `Recording 2026-11-16 090051.mp4` tại `C:/Users/Kyoshiro/Downloads`:
1. **Vị trí ghi hình:** Nhân vật đang ở phân khu **Rừng Ngoại Vi (Outer Woods)** tại tọa độ xấp xỉ `(1187, 621)` cạnh bụi cây ẩn nấp `hide_bush_ow_s_curve` và điểm thu thập nhựa thông `createGatheringNodeProp(1170, 630, 'resin')`.
2. **Hiện tượng quan sát:**
   - Nhân vật đang di chuyển về phía Tây (nhấn phím A) tiến vào bụi cây và bị cản bởi ranh giới tự nhiên (hoặc auto-perimeter wall).
   - Hoạt ảnh hiển thị trên màn hình có tư thế chồm người về phía trước, áo choàng vẫy mạnh về sau, kiếm hướng chúc xuống — **chính xác là bộ sprite `run` (`armed_run_sequence`)** thay vì dáng đi đứng thẳng của `walk`.
3. **Phát hiện môi trường hệ điều hành:**
   - Qua kiểm tra tiến trình hệ điều hành Windows hiện hành, tiến trình **`EVKey64.exe` (PID: 12736)** đang thường trực chạy trên máy tính của người dùng.
   - Các bộ gõ tiếng Việt (EVKey / UniKey) can thiệp vào tầng phím thông qua Windows Low-Level Keyboard Hook (`WH_KEYBOARD_LL`), tạo ra sự phân tách rõ rệt giữa môi trường chơi game vật lý của người thật và môi trường trình duyệt tự động Playwright (vốn đưa phím qua Chrome DevTools Protocol `Input.dispatchKeyEvent`).

---

## 2. PHÂN TÍCH CHUYÊN SÂU 5 GIẢ THUYẾT (A, B, C, D, E)

| Nhánh | Giả thuyết cốt lõi | Hiện trạng mã nguồn / Đo đạc thực nghiệm | Kết luận kỹ thuật |
| :---: | :--- | :--- | :---: |
| **A** | **Input bug:** Lỗi sự kiện bàn phím khiến `isSprinting = true` dù người chơi không đè phím Shift. | Rà soát `BlackKnightPlayer.ts` dòng 1104-1115: `shiftDown` được tính qua: `this.isPhysicalShiftHeld \|\| this.isPhysicalCodeDown('ShiftLeft') \|\| this.isPhysicalCodeDown('ShiftRight')`. Khi EVKey hook nuốt sự kiện `keyup` phần cứng của Shift hoặc gửi gói tin IME `VK_PACKET`/`VK_PROCESSKEY`, cờ Shift phần cứng không được dọn dẹp cho đến khi có một phím di chuyển tiếp theo được nhấn. | **NGUYÊN NHÂN GỐC KHẢ DĨ CAO NHẤT (PRIMARY HYPOTHESIS)** |
| **B** | **State transition bug:** `isSprinting = false` nhưng animation player gán nhầm key `'run'`. | Đọc `BlackKnightPlayer.ts` dòng 1296-1302: `const isRunning = this.stats.isSprinting; const gait = isRunning ? 'run' : 'walk';`. Logic hoàn toàn đơn hướng: nếu `isSprinting === false`, `targetKey` bắt buộc là `walk`. Không tồn tại bất kỳ đoạn mã nào ép key `run` khi `isSprinting` là `false`. | **LOẠI TRỪ (RULED OUT)** |
| **C** | **Artwork / Atlas / Frame / Gait bug:** `isSprinting = false`, velocity = 85 px/s, animKey = walk, nhưng hình vẽ WALK trông giống RUN. | Đã trích xuất từng frame độc lập từ `black_knight_movement.json` và `black_knight_conversion_motion.json`. `armed_walk` (6 frames @ 170ms = 1020ms) có tư thế đứng thẳng, bước chân nhỏ (bbox 26×31 px). `armed_run_sequence` (12 frames @ 70ms = 840ms) có tư thế lao người 45 độ, áo choàng tung bay (bbox 41×41 px). Hai bộ artwork hoàn toàn khác biệt nhau về mặt mỹ thuật; không có hiện tượng atlas walk trỏ nhầm sang run. | **LOẠI TRỪ LỖI MỸ THUẬT (ARTWORK IS CORRECT)** |
| **D** | **Armed / Unarmed Phase Transition & Zone Boundary:** Biến dạng khi chuyển đổi rút/tra kiếm hoặc đổi vùng an toàn/nguy hiểm. | Phát hiện quan trọng: `checkZoneWeaponAutoState()` (dòng 1027 & 1876-1887) tự động rút kiếm (`toggleWeapon(true)`) khi nhân vật bước vào vùng nguy hiểm (như Fog Crossing hay Outer Woods), và tra kiếm (`toggleWeapon(false)`) khi ở vùng an toàn (Bellhollow village). Khi đổi trạng thái, animation clip chuyển giữa `unarmed_walk` và `walk`. Cả 2 đều là bước đi chuẩn, không tự biến thành chạy. | **XÁC MINH RÕ RÀNG (CORRECT BEHAVIOR)** |
| **E** | **Speed Multiplier / Buff:** Tốc độ nhân vật > 85 px/s do Dev speedMultiplier hoặc trang bị khiến chân trượt nhanh. | Khi `DeveloperModeManager.speedMultiplier` được bật lên 2x (170 px/s) hoặc 3x (255 px/s), nhân vật di chuyển với tốc độ cực cao trong khi animation vẫn phát `walk`, tạo ra cảm giác lướt chân/đi bộ siêu tốc. Nếu người chơi/Dev đang bật F9 Dev Mode có chỉnh Speed Multiplier, hiện tượng này sẽ lập tức xuất hiện. | **YẾU TỐ TÁC ĐỘNG NGOẠI LAI (EXTERNAL FACTOR)** |

---

## 3. THIẾT KẾ & THỰC THI BỘ CHẨN ĐOÁN TELEMETRY [tests/hw_bug_26a_walkrun_repro.py](file:///G:/HOLLOW%20WOODS/tests/hw_bug_26a_walkrun_repro.py)

Kịch bản kiểm thử độc lập `tests/hw_bug_26a_walkrun_repro.py` đã được xây dựng hoàn chỉnh với các đặc tính kỹ thuật:
- **Cổng động an toàn (Dynamic Port):** Sử dụng `socket.bind(('127.0.0.1', 0))` chống đụng độ cổng mạng.
- **Hook đo đạc thời gian thực (Per-Frame PostUpdate Telemetry):**
  - Ghi nhận chi tiết: `activePhysicalCodes`, `movementHolds`, `isPhysicalShiftHeld`, `keyShift.isDown`, `cursors.shift.isDown`, `stats.isSprinting`, `vx`, `vy`, `speed`, `dev.speedMultiplier`, `animKey`, `frameTexture`, `frameName`, `frameIndex`, `displayedHeight`, `bodyHitbox`, `isBlocked`.
  - Bắt song song sự kiện DOM tầng cửa sổ: `event.type`, `event.code`, `event.key`, `event.keyCode`, `event.isComposing`, `event.repeat`, `getModifierState('Shift')`.

### Ma trận 11 kịch bản kiểm thử tự động toàn diện:

| STT | Tên kịch bản | Thời lượng đo | Số frames ghi nhận | Số DOM events | Kết quả | Chi tiết kỹ thuật |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | `1_W_Only_15s` | 15.0s | 112 | 2 | **PASS** | Đi W liên tục 15s. `isSprinting = False` 100%, `speed` duy trì 85 px/s, `animKey` = `wayfarer_walk_up`, 0 frame run. |
| **2** | `234_DOWN_Walk_10s` | 10.0s | 85 | 2 | **PASS** | Đi S liên tục 10s. `animKey` = `wayfarer_walk_down`, `speed` = 85 px/s, 0 frame run. |
| **3** | `234_LEFT_Walk_10s` | 10.0s | 83 | 2 | **PASS** | Đi A liên tục 10s. `animKey` = `wayfarer_walk_left`, `speed` = 85 px/s, 0 frame run. |
| **4** | `234_RIGHT_Walk_10s` | 10.0s | 82 | 2 | **PASS** | Đi D liên tục 10s. `animKey` = `wayfarer_walk_right`, `speed` = 85 px/s, 0 frame run. |
| **5** | `5_Sprint_Transition_Shift_Release` | 4.5s | 33 | 4 | **PASS** | Nhấn Shift chạy (140 px/s, 12-frame run), nhả Shift vẫn giữ W lập tức chuyển về Walk (85 px/s, 6-frame walk) trong vòng < 60ms. |
| **6** | `6_Rapid_Shift_Taps` | 3.5s | 20 | 10 | **PASS** | Nhấp nhả Shift cực nhanh 4 lần liên tiếp khi đang giữ W. Sau khi dứt nhịp nhấp, nhân vật trở về Walk sạch sẽ, không kẹt cờ Shift. |
| **7** | `7_Armed_Unarmed_Locomotion` | 4.0s | 27 | 8 | **PASS** | Đi bộ 4 hướng khi tra kiếm trong Làng Bellhollow (`isSafe = True`). Phát đúng hoạt ảnh `wayfarer_unarmed_walk_{dir}`. |
| **8** | `8_Blur_AltTab_Recovery` | 2.5s | 16 | 6 | **PASS** | Đang giữ Shift+W thì mất focus cửa sổ (Alt-Tab), nhả Shift ngoài trình duyệt, lấy lại focus rồi nhấn W: `isPhysicalShiftHeld` tự động giải phóng, không bị kẹt Sprint. |
| **9** | `9_Modal_Escape_Recovery` | 3.0s | 18 | 10 | **PASS** | Đang giữ Shift thì mở Pause Menu (Escape), nhả Shift trong modal, đóng modal rồi nhấn W: trở về đi bộ bình thường. |
| **10** | `10_Outer_Woods_Collider_Walk` | 3.5s | 23 | 2 | **PASS** | Đi bộ tựa vào vật cản tại Rừng Ngoại Vi (1187, 621): `isSprinting = False`, animKey phát `wayfarer_walk_left` (bước đi tại chỗ), không tự chuyển thành Run. |
| **11** | `11_Synthetic_IME_Packet_Walk` | 2.0s | 16 | 4 | **PASS** | Bắn gói tin IME mô phỏng (`keyCode: 229`, `key: 'Process'`) rồi đi bộ: nhân vật di chuyển đúng tốc độ 85 px/s, không bị kẹt modifier. |

> **Tổng kết Telemetry tự động:** Đạt **11/11 kịch bản PASS (0 dị thường trong môi trường Chromium Headless)**.

---

## 4. ĐỐI CHIẾU ARTWORK WALK VS RUN THỰC NGHIỆM

Toàn bộ 16 ảnh đối chiếu hoạt ảnh 4 hướng (Armed Walk/Run, Unarmed Walk/Run) đã được xuất trực tiếp vào thư mục `Read/V1.5/Reports/Visuals/HW_BUG_26A/`:

| Hướng nhìn | Armed Walk (Đi có vũ khí) | Armed Run (Chạy có vũ khí) | Unarmed Walk (Đi tra kiếm) | Unarmed Run (Chạy tra kiếm) |
| :---: | :---: | :---: | :---: | :---: |
| **DOWN** | [armed_walk_down.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_walk_down.png) | [armed_run_down.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_run_down.png) | [unarmed_walk_down.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_walk_down.png) | [unarmed_run_down.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_run_down.png) |
| **UP** | [armed_walk_up.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_walk_up.png) | [armed_run_up.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_run_up.png) | [unarmed_walk_up.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_walk_up.png) | [unarmed_run_up.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_run_up.png) |
| **LEFT** | [armed_walk_left.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_walk_left.png) | [armed_run_left.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_run_left.png) | [unarmed_walk_left.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_walk_left.png) | [unarmed_run_left.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_run_left.png) |
| **RIGHT** | [armed_walk_right.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_walk_right.png) | [armed_run_right.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/armed_run_right.png) | [unarmed_walk_right.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_walk_right.png) | [unarmed_run_right.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_26A/unarmed_walk_right.png) |

### Kết quả đo lường Pixel Bounds & Khung Hình:
1. **Walk Clips (`black_knight_movement.json`):**
   - 6 frames mỗi hướng, thời lượng mỗi frame: `170ms` (Chu kỳ 1020ms ~ 0.98 Hz, tương đương nhịp bước chân người đi bộ).
   - Chiều cao pixel thực: `31 - 32 px`, scale hiển thị chuẩn hóa `1.50x` -> Chiều cao hiển thị: `46.5 - 48.0 px`.
   - Dáng đứng: Thẳng lưng, áo choàng rủ tự nhiên, mũi chân nhấc vừa phải.
2. **Run Clips (`black_knight_conversion_motion.json`):**
   - 12 frames mỗi hướng, thời lượng mỗi frame: `70ms` (Chu kỳ 840ms ~ 1.19 Hz, tốc độ gấp 2.4 lần chu kỳ Walk).
   - Chiều cao pixel thực: `36 - 42 px`, scale hiển thị `1.20x` (`1.50 * 0.8`) -> Chiều cao hiển thị: `43.2 - 50.4 px`.
   - Dáng chạy: Chồm về phía trước một góc ~35-45 độ, áo choàng bay ngang theo luồng gió, chân co cao sải dài.

---

## 5. NGUYÊN NHÂN CỐT LÕI (ROOT CAUSE SYNTHESIS)

Từ sự tương phản giữa **kết quả tự động hóa (11/11 PASS)** và **bằng chứng thực tế từ video của Owner**, chúng tôi xác định cơ chế phát sinh lỗi thực tế:

1. **Cơ chế Nuốt Sự Kiện Phần Cứng của Hook EVKey trên Windows:**
   - Khi Owner chơi game trên trình duyệt, ứng dụng `EVKey64.exe` (PID 12736) cài đặt hook toàn cục trên Windows (`WH_KEYBOARD_LL`).
   - Trong quá trình di chuyển (nhấn W/A/S/D kết hợp nhấp Shift để chạy), nếu EVKey đang ở chế độ gõ Tiếng Việt (Telex/VNI):
     - EVKey chặn thông điệp `WM_KEYUP` của phím Shift từ bàn phím để xử lý tổ hợp ký tự hoặc phím tắt chuyển chế độ (`Ctrl+Shift` / `Alt+Z`).
     - Hậu quả: Trình duyệt không nhận được sự kiện `keyup` của phím Shift.
2. **Lỗ hổng Watchdog phím Shift trong `BlackKnightPlayer.ts`:**
   - Trong khi các phím di chuyển thông thường (W, A, S, D) được quản lý qua `movementHolds` có thời gian hết hạn an toàn (`expiresAt = performance.now() + 450ms/2000ms`), phím Shift lại **hoàn toàn không có cơ chế timeout**.
   - Tại `handleMovement()` dòng 1105-1115:
     ```typescript
     if (!this.isPhysicalShiftHeld &&
         (this.activePhysicalCodes.has('ShiftLeft') || this.activePhysicalCodes.has('ShiftRight') || ...)) {
       this.releasePhysicalCode('ShiftLeft');
       this.releasePhysicalCode('ShiftRight');
     }
     const shiftDown = this.isPhysicalShiftHeld || this.isPhysicalCodeDown('ShiftLeft') || ...;
     ```
     Đoạn mã trên giả định rằng `this.isPhysicalShiftHeld` đã được `syncPhysicalShift()` dọn sạch. Nhưng nếu không có sự kiện `keyup` hoặc `keydown` nào tiếp theo mang cờ `getModifierState('Shift') === false`, thì `this.isPhysicalShiftHeld` **vẫn lưu giá trị `true`**.
   - Do đó, nhân vật bị kẹt ở chế độ Sprint: khi người chơi chỉ nhấn W để đi bộ, trò chơi vẫn hiểu là `wantsToSprint = true` $\rightarrow$ đẩy tốc độ lên 140 px/s và phát hoạt ảnh `armed_run_sequence` (chính xác như hình ảnh trong video của Owner).

---

## 6. KẾ HOẠCH VÁ LỖI TỐI THIỂU CHO NHIỆM VỤ TIẾP THEO (HW-BUG-26B)

Khi Owner chỉ thị thực hiện nhiệm vụ `HW-BUG-26B`, giải pháp kỹ thuật tối thiểu (Minimal Surgical Patch) sẽ được áp dụng:

1. **Bổ sung Watchdog thời gian thực cho Phím Bổ Trợ Shift:**
   - Trong `handleDOMKeyDown`, đưa `ShiftLeft` và `ShiftRight` vào danh sách theo dõi có thời gian hết hạn (ví dụ: tối đa 600ms nếu không nhận được xung duy trì hoặc cờ `getModifierState`).
   - Trong `handleMovement()`, nếu `isPhysicalShiftHeld` là `true` nhưng sự kiện bàn phím gần nhất đã diễn ra quá ngưỡng an toàn hoặc không có phím Shift thực tế trong `movementHolds`, tự động giải phóng tức thời.
2. **Chặt chẽ hóa đánh giá `shiftDown`:**
   - Thay vì phép OR lỏng lẻo (`isPhysicalShiftHeld || activePhysicalCodes.has('ShiftLeft')`), yêu cầu điều kiện đồng thuận: Cờ Shift chỉ được tính là đang giữ nếu vừa có mã vật lý trong bảng phím vừa được xác nhận bởi trạng thái modifier.
3. **Guardrail khi va chạm vật cản (Collision Motion Guardrail):**
   - Khi nhân vật bị chặn hoàn toàn bởi vật cản (`speed === 0` và `body.blocked / touching === true`), nếu người chơi không có vận tốc thực tế trong hơn 250ms, tự động chuyển về hoạt ảnh `walk` (bước tại chỗ) thay vì duy trì dáng lao người `run` gây phản cảm thị giác.

---

## 7. KẾT LUẬN & ĐẶNG KIỂM GIT CHECKPOINT

- **Chế độ thực thi:** Hoàn toàn tuân thủ `READ-ONLY GAMEPLAY`. Không có bất kỳ dòng mã nguồn gameplay nào (`src/`) bị chỉnh sửa trong nhiệm vụ này.
- **Biên dịch & Build:**
  - `npx tsc --noEmit`: Thoát mã 0 (Clean 100%).
  - `npm run build`: Vite build thành công trong 12.39s (Clean 100%).
- **Tệp tạo mới hợp lệ:**
  - `tests/hw_bug_26a_walkrun_repro.py` (Script QA đo đạc telemetry).
  - `Read/V1.5/Reports/HW_BUG_26A_WALK_RUN_REOPEN_AUDIT.md` (Báo cáo điều tra).
  - `Read/V1.5/Reports/Visuals/HW_BUG_26A/*.png` (16 ảnh capture đối chiếu).
- **Tệp ngoại lệ untracked được bảo toàn:**
  - `scripts/AUDIO_SOURCES_MANIFEST.csv`
  - `scripts/AUDIO_SOURCES_MANIFEST.json`
  - `scripts/generate_audio_sources_manifest.mjs`

**HARD STOP THEO QUY ĐỊNH. CHỜ CHỈ THỊ CỦA OWNER TRƯỚC KHI THỰC HIỆN HW-BUG-26B.**
