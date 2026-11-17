# BÁO CÁO KỸ THUẬT V14-P2-01
## HỆ THỐNG CHU KỲ THỜI GIAN THẾ GIỚI (360s/NGÀY) & KHÍ QUYỂN MÔI TRƯỜNG

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P2-01`
- **Mục tiêu:** Xây dựng bộ quản lý thời gian thế giới `TimeSystem`, bảng tham số cân bằng `TimeConfig`, cơ chế chuyển pha mượt mà 3 tầng, tác động tầm nhìn / bình tâm, quy tắc tạm dừng và đồng bộ HUD.
- **Ngày thực hiện:** 17/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (PASS TẤT CẢ KIỂM THỬ)**

---

## 1. THIẾT KẾ & PHÂN BỔ CHU KỲ 360 GIÂY (6 PHÚT THỰC)

Chu kỳ 1 ngày sinh tồn được chia thành 3 pha rõ rệt với bảng cấu hình độc lập tại [src/config/TimeConfig.ts](file:///G:/HOLLOW%20WOODS/src/config/TimeConfig.ts):

| Pha Thời Gian | Thời Lượng | Tỷ Lệ | Tầm Nhìn Không Đèn | Tầm Nhìn Đèn Lồng | Bình Tâm Tắt Đèn (Vùng Thường / Sương Sâu) | Hồi Bình Tâm Có Đèn | Màu Ánh Sáng Môi Trường | Màu Sắc & Alpha Sương Mù | Cường Độ Gió |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`DAY`** (Ban Ngày) | **180s** (3m00) | 50% | **~220 px** | **260 px** | **0.0/s** (Ổn định) / -0.35/s | +2.2/s | `0xffffff` (Trắng dịu) | `0x22362b` (Alpha × 0.85) | 0.35 |
| **`DUSK`** (Hoàng Hôn) | **90s** (1m30) | 25% | **~150 px** | **195 px** | **-0.6/s** (Áp lực nhẹ) / -1.5/s | +1.8/s | `0xd47a5b` (Cam tím) | `0x3d2539` (Alpha × 1.15) | 0.65 |
| **`NIGHT`** (Đêm Sương) | **90s** (1m30) | 25% | **~55 px** (Tối đặc) | **140 px** | **-1.8/s** (Nguy hiểm) / -3.2/s | +1.2/s | `0x0c131d` (Chàm đêm) | `0x090f16` (Alpha × 1.40) | 1.10 |

---

## 2. KIẾN TRÚC & TRIỂN KHAI KỸ THUẬT

### 2.1. Bộ Quản Lý Thời Gian Thế Giới (`TimeSystem.ts`)
- **Tập tin:** [src/systems/TimeSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/TimeSystem.ts)
- **Cơ chế chuyển tiếp mượt mà (Hermite Smoothstep & Lerp Color):**
  - Cửa sổ chuyển tiếp `transitionBlendDuration = 8s` xung quanh các mốc ranh giới (176s–184s, 266s–274s, 356s–4s).
  - Tầm nhìn FOW, màu ánh sáng và mật độ sương mù chuyển đổi liên tục không giật nấc.
- **Vòng lặp ngày mới:**
  - Khi `timeOfDay >= 360`, tự động trừ 360, tăng `dayCount++`, phát sự kiện `new_day`.
- **Đồng bộ hai chiều với trạng thái người chơi:**
  - Liên tục đồng bộ `PlayerState.dayCount` và `PlayerState.timeOfDay` để [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts) tự động lưu chính xác khi người chơi lưu game.

### 2.2. Quy Tắc Tạm Dừng Đồng Hồ Thế Giới (Pause Rules)
Trong [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts):
- Đồng hồ thế giới **tạm dừng hoàn toàn** (`timeSystem.setPaused(true)`) khi cờ `isUIBusy` bật:
  1. Mở **Pause Menu** (`pauseModal.isOpen`).
  2. Đọc **Hội thoại cốt truyện** (`dialogueSystem.isActive`).
  3. Mở **Bàn Chế Tạo** (`craftingModal.isOpen`) hoặc **Sổ Tay** (`journalModal.isOpen`).
  4. Màn hình **Game Over** (`gameOverModal.isOpen`) hoặc **Ending** (`endingSystem.isEndingActive`).
- Khi đóng các giao diện trên, thời gian thế giới lập tức tiếp tục trôi mượt mà.

### 2.3. Tích Hợp Đa Hệ Thống
1. **VeilSystem (`src/systems/VeilSystem.ts`):**
   - Đón nhận `timeSystem` trong hàm `update()`.
   - Nhân hệ số `getFogAlphaMultiplier()` lên 3 tầng sương (Ground, Mid, High).
   - Đổi tint sương mù theo `getFogTint()`, giữ nguyên lớp sương hồng ban mai độc đáo tại cửa ngõ Fog Crossing (`x <= 560`).
2. **SurvivalSystem (`src/systems/SurvivalSystem.ts`):**
   - Nhận diện `timePhase` (`DAY`, `DUSK`, `NIGHT`).
   - Ban ngày (`DAY`): Bình Tâm giữ ổn định khi tắt đèn ở vùng thường (cho phép người chơi thoải mái đi giao lưu NPC, thu hoạch, trồng trọt mà không sợ hoảng loạn oan).
   - Hoàng hôn (`DUSK`): Áp lực nhẹ (-0.6/s), gợi nhắc người chơi về làng hoặc đốt lửa trại.
   - Đêm sương (`NIGHT`): Bóng tối rút Bình Tâm rất nhanh (-1.8/s vùng thường, -3.2/s rừng sâu).
3. **AudioManager (`src/audio/AudioManager.ts`):**
   - Cường độ tiếng gió `setWindIntensity()` được điều biến tự động theo pha: 0.35 (Ban ngày) ➔ 0.65 (Hoàng hôn) ➔ 1.10 (Đêm sương).
4. **HUD Clock Widget (`src/scenes/UIScene.ts`):**
   - Đặt tại góc trên bên phải màn hình (`x: 753, y: 16`, kích thước `155×78 px`), nằm ngay cạnh Khung Nhiệm Vụ (`x: 920`).
   - Thiết kế đồng bộ phong cách khung gỗ sẫm viền đồng cổ điển `0xd4af37`.
   - Hiển thị đầy đủ:
     + Biểu tượng lớn: Mặt Trời ☀️ (Vàng), Hoàng Hôn 🌅 (Cam), Mặt Trăng 🌙 (Xanh chàm).
     + Nhãn: `NGÀY X` và Tên pha (`BAN NGÀY`, `HOÀNG HÔN`, `ĐÊM SƯƠNG`).
     + Đồng hồ thời gian đã trôi qua trong pha (vd: `1:45 / 3:00`).
     + Thanh tiến trình pha có rãnh nền và vạch sáng đổi màu trực quan theo từng pha.

---

## 3. KẾT QUẢ KIỂM THỬ & NGHIỆM THU

### 3.1. Bộ kiểm thử chức năng Thời Gian (`scripts/test_time_system_v14.mjs`)
- **Kết quả:** **19/19 TESTCASES PASS (100%)**
  1. `[PASS]` Cấu hình tổng thời lượng 1 ngày là đúng 360 giây.
  2. `[PASS]` Phân bổ thời lượng 3 pha: Ban ngày 180s, Hoàng hôn 90s, Đêm sương 90s.
  3. `[PASS]` Thời gian chuyển tiếp hòa trộn (transitionBlendDuration) là 8 giây.
  4. `[PASS]` Cấu hình tầm nhìn không đèn: DAY (220px), DUSK (150px), NIGHT (55px).
  5. `[PASS]` Cấu hình Bình Tâm: DAY ổn định (0.0/s), DUSK (0.6/s), NIGHT (1.8/s).
  6. `[PASS]` TimeSystem khai báo đầy đủ các phương thức truy vấn API.
  7. `[PASS]` TimeSystem tích hợp hàm nội suy màu sắc lerpColor và hàm làm mịn smoothstep.
  8. `[PASS]` TimeSystem phát ra các sự kiện: phase_changed, new_day, time_tick.
  9. `[PASS]` Toán học: Xác định chính xác 3 pha tại các mốc thời gian 0s, 90s, 180s, 225s, 270s, 315s.
  10. `[PASS]` Toán học: Tiến độ pha đạt chuẩn [0.0 - 1.0] tại các mốc phân đoạn.
  11. `[PASS]` Toán học: Thuật toán lerpColor và smoothstep biến thiên liên tục, không tràn giá trị.
  12. `[PASS]` SurvivalSystem chấp nhận tham số timePhase để điều chỉnh Composure.
  13. `[PASS]` VeilSystem chấp nhận tham số timeSystem và hòa trộn sắc độ / độ dày sương mù.
  14. `[PASS]` UIScene sở hữu Widget Đồng Hồ góc trên phải kèm biểu tượng Mặt Trời / Hoàng Hôn / Mặt Trăng.
  15. `[PASS]` GameScene khởi tạo TimeSystem với dữ liệu từ SaveData hoặc PlayerState.
  16. `[PASS]` GameScene tạm dừng thời gian thế giới khi isUIBusy (Pause, Dialogue, Game Over, Ending).
  17. `[PASS]` GameScene truyền timePhase sang SurvivalSystem và VeilSystem trong update loop.
  18. `[PASS]` GameScene đồng bộ bán kính ánh sáng FOW theo TimeSystem.getVisionRadius.
  19. `[PASS]` GameScene dọn dẹp timeSystem.destroy() khi shutdown scene.

### 3.2. Bộ kiểm thử hồi quy V1.3 & Chuyển đổi Save V1.4
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 KIỂM TRA ĐẠT (100% PASS)**.
- `node scripts/test_save_migration_v14.mjs`: **41/41 KIỂM TRA ĐẠT (100% PASS)**.
