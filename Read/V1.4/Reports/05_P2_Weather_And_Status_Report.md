# BÁO CÁO KỸ THUẬT V14-P2-02
## HỆ THỐNG THỜI TIẾT MƯA SƯƠNG & 2 HUY HIỆU TRẠNG THÁI PHỤ (ĐỘ ẨM, THÂN NHIỆT)

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P2-02`
- **Mục tiêu:**
  1. Triển khai hệ thống thời tiết Mưa Sương (`WeatherSystem`) theo phân khu và pha thời gian, tối ưu bộ đệm hạt mưa GPU.
  2. Tích hợp âm thanh mưa rào nhẹ vào `AudioManager` qua Web Audio API.
  3. Cơ chế đánh đổi chiến thuật công bằng (Fair Play): Mưa che 40% tiếng bước chân người chơi trước The Listener, bù đắp cảnh báo rung/nhịp tim trong bán kính 220px.
  4. Quản lý 2 chỉ số môi trường phụ trong `SurvivalSystem`: Độ Ẩm (`moisture` 0–100%) và Thân Nhiệt (`temperature` 0–100).
  5. Thiết kế 2 Huy hiệu Trạng thái phụ (Status Badges) gọn gàng trên HUD `UIScene`, tuyệt đối không dùng 2 thanh bar dài choán màn hình.
  6. Bảo toàn 100% kiểm thử hồi quy V1.3 (571/571 PASS) và 0 lỗi TypeScript.
- **Ngày thực hiện:** 17/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (PASS 27/27 KIỂM THỬ V14-P2-02, PASS 571/571 HỒI QUY)**

---

## 1. THIẾT KẾ THỜI TIẾT MƯA SƯƠNG (MIST RAIN)

### 1.1. Chu kỳ & Xác suất xuất hiện theo Phân khu
Hệ thống [src/systems/WeatherSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/WeatherSystem.ts) tự động đánh giá chu kỳ thời tiết mỗi 75–120 giây dựa trên vị trí người chơi và pha thời gian:

| Phân Khu (Zone) | Tỷ Lệ Xuất Hiện Cơ Sở | Hệ Số Cộng Pha (Dusk/Night) | Đặc Tính Thời Tiết |
| :--- | :---: | :---: | :--- |
| **`silent_mire`** (Đầm Lầy Tĩnh Lặng) | **65%** | +20% (Dusk) / +15% (Night) | Đầm nước ẩm ướt, mưa sương thường trực |
| **`outer_woods` / `crooked_path` / `deep_forest`** | **40%** | +20% (Dusk) / +15% (Night) | Rừng rậm ẩm mốc, mưa sương bất chợt |
| **`bellhollow` / `sanctuary_farm`** | **15%** | +20% (Dusk) / +15% (Night) | Thung lũng làng ít mưa, an toàn tương đối |

- Thời lượng mưa: 60s – 90s mỗi đợt.
- Quá trình bắt đầu và kết thúc diễn ra mượt mà trong 3.5 giây (Fade In / Fade Out mượt qua hàm lerp cường độ).

### 1.2. Tối Ưu Hóa Hiệu Năng Hạt Mưa (Zero Allocations)
- Sử dụng **Particle Pool** cố định tối đa 75 hạt mưa mảnh (`maxParticles = 75`), không cấp phát `new` trong vòng lặp game.
- Chiều dài hạt: 8–15 px, góc nghiêng gió -1.5 đến -3.0 px, tốc độ rơi 280–400 px/s.
- Hạt mưa rơi khỏi đáy màn hình (`y > 720`) được tái tạo ngay lập tức tại đỉnh (`y = -15`), gom vẽ trên một lớp `Phaser.GameObjects.Graphics` duy nhất.

### 1.3. Đánh Đổi Chiến Thuật Công Bằng (Fair Play Mechanics)
1. **Lợi thế cho người chơi:**
   - Tiếng mưa rơi át bớt tiếng chân người chơi.
   - Hàm `getFootstepNoiseDampening()` trả về hệ số tối đa `0.6` (giảm 40% bán kính phát hiện bước chân của The Listener).
2. **Bất lợi tương hỗ & Cơ chế chống chết oan:**
   - Người chơi cũng khó nghe tiếng bước chân The Listener hơn do lẫn vào tiếng mưa.
   - Để tránh việc quái vật đột ngột bắt chết mà người chơi không kịp phản ứng: khi The Listener áp sát trong cự ly `220 px` (`getFairPlayListenerAlertDistance()`), GameScene tự động kích hoạt hiệu ứng sương rùng mình và nhịp tim dồn dập cảnh báo trực quan.

---

## 2. QUẢN LÝ 2 CHỈ SỐ MÔI TRƯỜNG PHỤ (`SurvivalSystem.ts`)

Hai chỉ số phụ được tích hợp gọn gàng trong [src/systems/SurvivalSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/SurvivalSystem.ts):

### 2.1. Độ Ẩm (Moisture: 0 – 100%)
- **Phân cấp trạng thái:**
  - `DRY` (Khô ráo: 0–29%): Bình thường, không có hiệu ứng tiêu cực.
  - `DAMP` (Ẩm ướt: 30–69%): Cảnh báo nhẹ trên HUD, thân nhiệt bắt đầu hạ nhanh hơn khi vào đêm.
  - `SOAKED` (Ướt sũng: 70–100%): Quần áo ướt sũng. Tốc độ hồi phục thể lực (Stamina recovery) **giảm nhẹ 25%** (`staminaRecoveryMultiplier = 0.75`).
- **Quy tắc tăng / giảm:**
  - Tăng khi đứng dưới Mưa Sương (+3.2%/s) hoặc lội trong Đầm Lầy (+4.0%/s).
  - Giảm rất nhanh khi đứng gần Lửa Trại / Lò Rèn (-10.0%/s).
  - Tự khô chậm ngoài trời nắng ban ngày (-1.2%/s) hoặc ban đêm (-0.3%/s).

### 2.2. Thân Nhiệt (Temperature: 0 – 100)
- **Phân cấp trạng thái:**
  - `WARM` (Ấm áp: 70–100): Trạng thái lý tưởng, cơ thể dẻo dai.
  - `CHILLY` (Se lạnh: 35–69): Cảnh báo sớm thời tiết trở lạnh.
  - `FREEZING` (Cóng lạnh: 0–34): Rét buốt, tạo áp lực rút Bình Tâm nhẹ (-0.4/s), HUD nhấp nháy sắc xanh lạnh.
- **Quy tắc tăng / giảm:**
  - Tăng nhanh khi gần Lửa Trại / Lò Rèn (+7.5/s) hoặc dưới ánh mặt trời ban ngày (+1.2/s).
  - Giảm khi vào Hoàng Hôn (-0.4/s), Đêm Sương (-1.0/s), dưới Mưa Sương (-0.6/s) và khi bị Ướt Sũng (-0.6/s).

---

## 3. THIẾT KẾ HUY HIỆU STATUS TRÊN HUD (`UIScene.ts`)

Tuân thủ nguyên tắc thiết kế tối giản: **TUYỆT ĐỐI KHÔNG DÙNG THANH METER DÀI**.
Hai huy hiệu (Status Badges) dạng hộp gọn gàng được đặt ngay dưới cụm chỉ số sinh tồn chính tại [src/scenes/UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts):

- **Vị trí hiển thị:**
  - Khung thuộc tính chính giữ nguyên kích thước chuẩn `308×92 px` tại `(12, 8)`.
  - **Huy hiệu Độ Ẩm (Moisture Badge):** Tọa độ `x: 18, y: 104`, kích thước `142×20 px`.
    + Khô ráo: `💧 Khô ráo (X%)` (Màu xanh ngọc lục bảo `#1abc9c`).
    + Ẩm ướt: `💧 Ẩm ướt (X%)` (Màu xanh lơ cyan `#00cec9`).
    + Ướt sũng: `🌊 Ướt sũng (X%)` (Màu xanh biển đậm `#3498db`).
  - **Huy hiệu Thân Nhiệt (Temperature Badge):** Tọa độ `x: 166, y: 104`, kích thước `146×20 px`.
    + Ấm áp: `🔥 Ấm áp (X°)` (Màu cam hổ phách `#f39c12`).
    + Se lạnh: `🌡️ Se lạnh (X°)` (Màu xanh băng nhạt `#81ecec`).
    + Cóng lạnh: `❄️ Cóng lạnh (X°)` (Màu xanh tuyết lạnh `#74b9ff`).
- Cơ chế dirty-checking chỉ render lại khi số làm tròn thay đổi, đảm bảo 60 FPS mượt mà.

---

## 4. TÍCH HỢP ÂM THANH MƯA SƯƠNG (`AudioManager.ts`)

- Trong [src/audio/AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts):
  - Phương thức `setRainIntensity(intensity: number)` kết nối trực tiếp với bộ lọc âm tần thấp và nút điều khiển âm lượng `rainGain` qua Web Audio API.
  - Sử dụng đường cong trượt tuyến tính (`linearRampToValueAtTime`) để âm thanh mưa rơi hòa quyện êm dịu cùng tiếng gió rít và nhạc nền rừng già, không tạo tiếng lách tách gây khó chịu.

---

## 5. KẾT QUẢ KIỂM THỬ & NGHIỆM THU

### 5.1. Bộ kiểm thử chức năng Thời Tiết & Trạng Thái (`scripts/test_weather_and_status_v14.mjs`)
- **Kết quả:** **27/27 TESTCASES PASS (100%)**
  1. `[PASS]` File `src/systems/WeatherSystem.ts` tồn tại.
  2. `[PASS]` WeatherSystem hỗ trợ 2 trạng thái `CLEAR` và `MIST_RAIN`.
  3. `[PASS]` WeatherSystem giới hạn pool hạt mưa tối đa 75 hạt tránh quá tải hiệu năng.
  4. `[PASS]` WeatherSystem cung cấp phương thức `getFootstepNoiseDampening()`.
  5. `[PASS]` Tiếng bước chân giảm tối đa 40% (hệ số 0.6) khi trời Mưa Sương.
  6. `[PASS]` WeatherSystem cung cấp khoảng cách cảnh báo công bằng 220px (`getFairPlayListenerAlertDistance()`).
  7. `[PASS]` WeatherSystem tự động đồng bộ âm thanh mưa với `AudioManager`.
  8. `[PASS]` AudioManager có hàm `setRainIntensity()` điều chỉnh âm lượng mưa rơi.
  9. `[PASS]` AudioManager quản lý `rainGain` bằng Web Audio API chuẩn.
  10. `[PASS]` SurvivalSystem quản lý chỉ số `moisture` (Độ ẩm).
  11. `[PASS]` SurvivalSystem quản lý chỉ số `temperature` (Thân nhiệt).
  12. `[PASS]` Có hàm `getMoistureTier()` phân cấp `DRY` / `DAMP` / `SOAKED`.
  13. `[PASS]` Có hàm `getTemperatureTier()` phân cấp `WARM` / `CHILLY` / `FREEZING`.
  14. `[PASS]` Trạng thái `SOAKED` giảm 25% tốc độ hồi thể lực.
  15. `[PASS]` Trạng thái `FREEZING` tạo áp lực rút Bình Tâm nhẹ (-0.4/s).
  16. `[PASS]` Giữ nguyên 100% dòng rút máu nguyên thủy khi đói/khát để pass hồi quy V1.3.
  17. `[PASS]` UIScene giữ nguyên kích thước khung stat gốc 308x92 để pass hồi quy.
  18. `[PASS]` UIScene tạo badge Độ Ẩm riêng biệt dạng huy hiệu.
  19. `[PASS]` UIScene tạo badge Thân Nhiệt riêng biệt dạng huy hiệu.
  20. `[PASS]` UIScene có hàm `updateStatusBadges` cập nhật huy hiệu môi trường.
  21. `[PASS]` Huy hiệu Độ Ẩm hiển thị nhãn tiếng Việt chuẩn Khô ráo / Ẩm ướt / Ướt sũng.
  22. `[PASS]` Huy hiệu Thân Nhiệt hiển thị nhãn tiếng Việt chuẩn Ấm áp / Se lạnh / Cóng lạnh.
  23. `[PASS]` GameScene khởi tạo `WeatherSystem`.
  24. `[PASS]` GameScene áp dụng hệ số cản tiếng chân vào thính giác The Listener.
  25. `[PASS]` GameScene gọi render hạt mưa lên tầng `rainGfx`.
  26. `[PASS]` GameScene cập nhật `weatherSystem` theo `dt`.
  27. `[PASS]` GameScene truyền trạng thái mưa sang `SurvivalSystem`.

### 5.2. Toàn bộ Bộ Kiểm Thử Hồi Quy V1.3 & V1.4
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 KIỂM TRA ĐẠT (100% PASS)**.
- `node scripts/test_save_migration_v14.mjs`: **41/41 KIỂM TRA ĐẠT (100% PASS)**.
- `node scripts/test_time_system_v14.mjs`: **19/19 KIỂM TRA ĐẠT (100% PASS)**.
- `node scripts/test_weather_and_status_v14.mjs`: **27/27 KIỂM TRA ĐẠT (100% PASS)**.
- **Tổng cộng: 658 bài kiểm thử tự động đã PASS 100%.**
