# BÁO CÁO NGHIỆM THU: HW-FIX-23 V3 — HIỆU ỨNG TINH THẦN THẤP NGÀY & ĐÊM VÀ HỒI QUY BUG-023

- **Dự án:** HOLLOW WOODS — PREP V1.5.4
- **Mã nhiệm vụ:** `HW-FIX-23 V3 — LOW-SANITY HORROR EFFECTS DAY & NIGHT + BUG-023 REGRESSION`
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Môi trường QA:** Headless Chromium Playwright Suite, Node v20+, Vite v5.4.21, Phaser 3.88.2
- **Trạng thái:** HOÀN THÀNH TOÀN DIỆN (15/15 TEST CASES PASS — 0 CONSOLE ERRORS)

---

## 1. NGUYÊN NHÂN GỐC (ROOT CAUSE)

Trước bản sửa lỗi HW-FIX-23, hệ thống kinh dị tâm lý khi Tinh Thần (Composure) suy giảm bị vô hiệu hóa hoàn toàn vào ban ngày do logic xác định vùng an toàn:
1. Tại `GameScene.ts:2088` (trước đây):
   ```typescript
   const isSafeZoneOrCampfire = !isBossArena && (isDay || isSafeVillageZone || isNearWarmth || isSanctuaryCamp);
   ```
   Biến `isDay` được gộp trực tiếp vào điều kiện Safe Zone, khiến toàn bộ thế giới trò chơi vào ban ngày (dù người chơi đang ở sâu trong Rừng Ngoài - Outer Woods hay Đầm Lầy Tĩnh Lặng - Silent Mire) đều bị xem là "Vùng An Toàn".
2. Tại `UIScene.ts:1837` (trước đây):
   ```typescript
   const isProtectedZone = isDaytime || isSafeVillageZone || isNearWarmth || isSanctuaryCamp;
   ```
   Tương tự, cờ `isDaytime` tự động tắt toàn bộ lớp hiển thị viền tối hoảng loạn (`panicVignetteGraphics`).
3. **Hệ quả:** Khi người chơi kiệt quệ Tinh Thần vào ban ngày ngoài tự nhiên, trò chơi không phát ra bất kỳ phản hồi kinh dị nào: không có viền hoảng loạn mờ ảo, không có tiếng nhịp tim Web Audio trầm đục, không có micro-tremor camera. Điều này triệt tiêu hoàn toàn áp lực sinh tồn tâm lý mà Hollow Woods hướng đến.

---

## 2. KÊ KHAI CÁC FILE ĐÃ SỬA ĐỔI VÀ SO SÁNH BEFORE / AFTER

### 2.1. `src/scenes/UIScene.ts`
- **Before:**
  - `isProtectedZone` chứa `isDaytime ||`, làm tắt viền hoảng loạn ban ngày.
  - Viền hoảng loạn chưa chuẩn hóa độ mờ $t \in [0, 1]$, khi bật/tắt có hiện tượng nhảy frame đột ngột (pop-in/pop-out).
  - Không có tween chuyển tiếp mềm mại khi Tinh Thần hồi phục về ngưỡng an toàn.
- **After:**
  - Loại bỏ `isDaytime ||`, bảo lưu vùng bảo vệ cho `isSafeVillageZone`, `isNearWarmth`, `isSanctuaryCamp`.
  - Chuẩn hóa hệ số hoảng loạn $t \in [0, 1]$ qua 3 bậc phân cấp:
    * $25 \le \text{composure} < 45$: Bậc nhẹ ($t \in [0.05, 0.35]$).
    * $15 \le \text{composure} < 25$: Bậc vừa ($t \in [0.35, 0.75]$).
    * $0 \le \text{composure} < 15$: Bậc nguy kịch ($t \in [0.75, 1.0]$), mép ngoài màu huyết dụ sẫm nhưng tâm màn hình giữ thoáng $100\%$ không bị che khuất.
  - Bổ sung `activePanicFadeTween`: Thực hiện fade-out êm dịu trong 280ms (`Quad.easeOut`) khi Tinh Thần đạt $\ge 45$ hoặc bước vào Safe Zone.
  - Tích hợp kiểm tra `SettingsManager.getInstance().isReducedMotionPreferred()`: Tắt ngay lập tức mọi hiệu ứng viền động khi người chơi bật Reduced Motion.
  - Dọn dẹp tween triệt để trong `destroy()`.

### 2.2. `src/scenes/GameScene.ts`
- **Before:**
  - `isSafeZoneOrCampfire` chứa `isDay ||`, ức chế nhịp tim Web Audio và micro-tremor ban ngày.
  - Tồn tại thông báo HUD trùng lặp: `GameScene` tự phát popup `⚠️ Tâm trí đang rạn nứt...` song song với popup của `UIScene`.
  - Quầng sáng Fog of War (FOW) thiếu nhịp thở sinh học, hoặc nếu có thì biên độ không kiểm soát gây nguy cơ giật mắt.
  - Một số kỹ năng/ảo ảnh gọi trực tiếp `this.cameras.main.shake()` và `flash()` bỏ qua tùy chọn tiếp cận (Accessibility Settings).
- **After:**
  - Loại bỏ `isDay ||` khỏi `isSafeZoneOrCampfire`. Kích hoạt nhịp tim Web Audio động (75..135 BPM) cả ngày lẫn đêm ngoài Safe Zone.
  - Triệt tiêu hoàn toàn popup duplicate: Xóa lệnh gọi popup HUD khỏi `GameScene`, chuyển giao toàn bộ quyền phát cảnh báo tâm trí cho `UIScene`.
  - Triển khai nhịp thở quầng sáng FOW tần số $0.25\text{ Hz}$ ($\omega = 0.00157\text{ rad/ms}$), điều chế `targetBaseRadius` và `glowAlpha` trong giới hạn cực kỳ êm dịu ($\pm 1\%$ đến $\pm 2\%$). Tự động tắt nhịp thở khi bật Reduced Motion hoặc khi ở trong Safe Zone.
  - Chuyển hướng toàn bộ các lệnh gọi camera sang `this.cameraSystem` và bọc kiểm tra qua `SettingsManager.getInstance().isScreenShakeEnabled() / isScreenFlashEnabled()`.
  - Phơi bày `window.__SETTINGS_MANAGER__ = SettingsManager.getInstance()` trong `create()` phục vụ runtime QA.

### 2.3. `src/entities/AmbushMonsters.ts`
- **Before:** Các chiêu thức hù dọa của Dơi Sương Mù và Hồn Ma Phiêu Bạt gọi trực tiếp `cameras.main.shake()` và `cameras.main.flash()`.
- **After:** Bọc qua kiểm tra `SettingsManager.getInstance().isScreenShakeEnabled()` và `isScreenFlashEnabled()`, đảm bảo an toàn tuyệt đối khi bật Reduced Motion.

### 2.4. `scripts/test_bug023_sanity_flash.py`
- Mở rộng thành bộ kiểm thử hồi quy 15 bài chuyên sâu, kiểm tra toàn diện cả Ngày/Đêm, Safe Zones, Fade-out tween, FOW breathing, Zero strobe, Zero duplicate popups/vignettes, Reduced Motion execution và FOW redraw stability.

---

## 3. ĐÁNH GIÁ HÀNH VI THEO CÁC MỨC TINH THẦN (COMPOSURE)

| Mức Tinh Thần | Trạng thái Viền Ám Ảnh | Âm thanh Nhịp Tim | Camera Tremor | Trải nghiệm Người Chơi |
| :--- | :--- | :--- | :--- | :--- |
| **100** | Tắt hoàn toàn (`clear()`) | Tắt (`isHeartbeatActive: false`) | Tắt | Tỉnh táo hoàn toàn, tầm nhìn trong trẻo. |
| **45** | Ngưỡng an toàn / Bắt đầu kích hoạt fade-out 280ms | Tắt ngay khi chạm $\ge 45$ | Tắt | Thoát khỏi bất an, nhịp thở FOW trở lại tĩnh. |
| **35** | Viền tối mờ nhẹ ($t \approx 0.20$, alpha $\approx 0.07$) | 95 BPM, âm lượng êm dịu | Tắt | Cảm giác rờn rợn, bất an ngoài hoang dã. |
| **25** | Viền tối rõ rệt ($t \approx 0.35$, alpha $\approx 0.12$) | 115 BPM, âm lượng trung bình | Tắt | Căng thẳng dâng cao, bóng tối co cụm. |
| **15** | Viền huyết dụ đậm nét ($t \approx 0.75$, alpha $\approx 0.35$) | 135 BPM, BGM ducking 0.55 | Micro-tremor nhẹ 120ms/0.0015 | Nguy kịch, tiếng thở dốc vang lên. |
| **0** | Cường độ tối đa ($t = 1.0$), tâm màn hình thoáng $100\%$ | 135 BPM dồn dập | Micro-tremor 120ms/0.0015 | Hoảng loạn cực độ, giữ trọn khả năng chiến đấu/né đòn. |

---

## 4. MA TRẬN KHÔNG GIAN VÀ THỜI GIAN (NGÀY / ĐÊM / SAFE ZONE)

| Khu vực | Ban Ngày (DAY) | Ban Đêm (NIGHT) | Ghi chú bảo vệ |
| :--- | :---: | :---: | :--- |
| **Làng Bellhollow** | **Safe Zone** (Vig: Tắt, Hb: Tắt) | **Safe Zone** (Vig: Tắt, Hb: Tắt) | Làng an toàn tuyệt đối 24/7. |
| **Sanctuary Farm** | **Safe Zone** (Vig: Tắt, Hb: Tắt) | **Safe Zone** (Vig: Tắt, Hb: Tắt) | Trang trại nông nghiệp có kết giới hộ tâm. |
| **Fog Crossing** | **Safe Zone** (Vig: Tắt, Hb: Tắt) | **Safe Zone** (Vig: Tắt, Hb: Tắt) | Trạm gác mở đầu được bảo hộ. |
| **Lửa trại Sir Vaelen (1470, 710)** | **Safe Zone** (Vig: Tắt, Hb: Tắt) | **Safe Zone** (Vig: Tắt, Hb: Tắt) | Bán kính hơi ấm 180px loại bỏ hoảng sợ. |
| **Rừng Ngoài (Outer Woods)** | **Kinh Dị Kích Hoạt** (Vig: Bật, Hb: 75..135 BPM) | **Kinh Dị Kích Hoạt** (Vig: Bật, Hb: 75..135 BPM) | Tinh Thần thấp tạo áp lực cả ngày và đêm. |
| **Đầm Lầy Tĩnh Lặng (Silent Mire)** | **Kinh Dị Kích Hoạt** (Vig: Bật, Hb: 75..135 BPM) | **Kinh Dị Kích Hoạt** (Vig: Bật, Hb: 75..135 BPM) | Vùng sâu sương mù nguy hiểm cao. |

---

## 5. BẢO VỆ NGƯỜI CHƠI NHẠY CẢM VÀ QUY TẮC AN TOÀN QUANG HỌC

1. **Triệt tiêu Strobe (Phòng chống động kinh quang học — Anti-Epilepsy):**
   - Không sử dụng flash trắng toàn màn hình khi hoảng loạn.
   - Nhịp thở Fog of War được giới hạn tần số cực thấp $0.25\text{ Hz}$ (1 chu kỳ mất 4 giây), biên độ bán kính chỉ $\pm 1\%$ đến $\pm 2\%$ ($117.09\text{px} - 120.61\text{px}$ quanh giá trị trung bình $119.00\text{px}$).
   - Biến thiên bán kính giữa 2 frame liên tiếp: $\Delta R_{\max} = 0.646\text{ px/frame} < 0.8\text{ px/frame}$.
   - Số bước nhảy đột ngột (Erratic Jumps): **0**.
2. **Chế độ Giảm Chuyển Động (Reduced Motion Preferred):**
   - Khi `SettingsManager.getInstance().isReducedMotionPreferred()` trả về `true`:
     * Camera Shakes: **0 lần** (Bị triệt tiêu hoàn toàn).
     * Camera Flashes: **0 lần** (Bị triệt tiêu hoàn toàn).
     * Viền hoảng loạn: Không rung nhịp pulse factor ($= 0$), hiển thị tĩnh.
     * Quầng sáng FOW: Tắt hoàn toàn dao động thở, giữ bán kính tĩnh ổn định.
3. **Cô lập Kiến trúc Đồ họa (Zero Duplicate Overlays):**
   - Không sinh thêm lớp vignette thứ hai trong `VeilSystem`.
   - `VeilSystem.hasDistortionDrawn = false`.
   - Toàn bộ hiệu ứng hoảng loạn tập trung duy nhất tại `UIScene.panicVignetteGraphics` (depth 900).
4. **Triệt tiêu Popup Trùng Lặp:**
   - Xóa bỏ cảnh báo tâm trí trong `GameScene`.
   - Số lượng popup rạn nứt tâm trí hiển thị: **Đúng 1 thông báo duy nhất** từ `UIScene`.

---

## 6. BẢNG KẾT QUẢ 15 CA KIỂM THỬ TỰ ĐỘNG (PLAYWRIGHT QA SUITE)

Dữ liệu ghi nhận từ file kết quả nghiệm thu tự động `Read/V1.5/Reports/bug023_metrics_after.json`:

| STT | Tên Ca Kiểm Thử | Mục Tiêu Nghiệm Thu | Kết Quả Thực Tế | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **01** | `test_1_outer_woods_day_comp35` | Ban ngày Outer Woods comp 35 phát viền & nhịp tim | Vig: True, Hb: True, BPM: 95, Phase: DAY | **PASS** |
| **02** | `test_2_outer_woods_day_comp15` | Ban ngày Outer Woods comp 15 dồn dập 135 BPM | Vig: True, Hb: True, BPM: 135, Phase: DAY | **PASS** |
| **03** | `test_3_outer_woods_night_comp35` | Ban đêm Outer Woods comp 35 duy trì kinh dị | Vig: True, Hb: True, BPM: 95, Phase: NIGHT | **PASS** |
| **04** | `test_4_outer_woods_night_comp15` | Ban đêm Outer Woods comp 15 dồn dập 135 BPM | Vig: True, Hb: True, BPM: 135, Phase: NIGHT | **PASS** |
| **05** | `test_5_bellhollow_sanctuary` | Làng Bellhollow bảo vệ tuyệt đối ngày & đêm | Day(Vig: F, Hb: F), Night(Vig: F, Hb: F) | **PASS** |
| **06** | `test_6_sanctuary_farm` | Nông trại Sanctuary Farm bảo vệ ngày & đêm | Day(Vig: F, Hb: F), Night(Vig: F, Hb: F) | **PASS** |
| **07** | `test_7_sir_vaelen_campfire` | Hơi ấm Lửa trại Sir Vaelen bảo vệ tức thì | isNearWarmth: True, Vig: F, Hb: F | **PASS** |
| **08** | `test_8_reduced_motion` | Cài đặt Reduced Motion bật/tắt chính xác | RM_ON(Shake: F, Flash: F), RM_OFF(T, T) | **PASS** |
| **09** | `test_9_composure_fadeout` | Hồi phục 15 $\rightarrow$ 50 fade-out êm trong 280ms | Mid Tween: True, Hb: False, End: Inactive | **PASS** |
| **10** | `test_10_pause_resume` | Vòng đời tạm dừng Pause/Resume không lỗi | Pause Opened: True, Closed: True | **PASS** |
| **11** | `test_11_fow_breathing` | Quầng sáng FOW thở êm dịu, không giật nhấp nháy | Mean: 119.0, Delta: 0.646px, Strobe: 0 | **PASS** |
| **12** | `test_12_no_duplicate_vignette` | VeilSystem không vẽ đè lớp vignette thứ hai | VeilDistortion: False, UISPanic: True | **PASS** |
| **13** | `test_13_no_duplicate_popups` | Triệt tiêu cảnh báo HUD trùng lặp | Total Popups: 1, FractureCount: 1 | **PASS** |
| **14** | `test_14_camera_safety` | Reduced Motion triệt tiêu 100% shake & flash | When RM: Flashes: 0, Shakes: 0 | **PASS** |
| **15** | `test_15_fow_performance` | Hiệu năng vẽ FOW ổn định, dirty-check giữ vững | RedrawCount: 4/500ms, AvgTime: 0.00ms | **PASS** |

**Tổng kết QA:** 15/15 bài test đạt chuẩn PASS 100%. Số lỗi Console trình duyệt: **0**.

---

## 7. RỦI RO CÒN LẠI VÀ KHUYẾN NGHỊ

1. **Hiệu năng GPU Canvas trên thiết bị cấp thấp:** Việc vẽ quầng sáng Fog of War với nhịp thở $0.25\text{ Hz}$ tiêu tốn lượng CPU/GPU cực nhỏ (đo đạc thực tế xấp xỉ 0ms trên mỗi lần stamp). Tuy nhiên, trên các máy quá yếu có bật chế độ tiết kiệm pin trình duyệt, khuyến nghị bật `Reduced Motion` trong menu Settings để dừng hoàn toàn vòng lặp thở.
2. **Logic tính toán Tinh Thần của SurvivalSystem:** Hệ thống bảo toàn nguyên vẹn quy tắc sinh tồn gốc của dự án: không can thiệp logic trừ máu hay hồi phục của `SurvivalSystem`. Khi đứng ban ngày ngoài Outer Woods không bật đèn, Tinh Thần người chơi hồi phục nhẹ theo nhịp ngày của hệ thống sinh tồn, điều này hoàn toàn bình thường và đúng kịch bản game.

---

## 8. KẾT LUẬN

Nhiệm vụ **HW-FIX-23 V3** đã hoàn thành trọn vẹn mọi mục tiêu được giao:
- Khôi phục không khí kinh dị sinh tồn cho Tinh Thần thấp cả ngày lẫn đêm ngoài vùng an toàn.
- Ngăn ngừa hoàn toàn hiện tượng strobe, không tạo thêm vignette thừa, dập tắt popup trùng lặp.
- Bảo vệ an toàn quang học tối đa với tùy chọn Reduced Motion.
- Đạt 100% pass trên toàn bộ 15 bài kiểm tra hồi quy tự động.
- Sẵn sàng tích hợp cho bản phát hành **Hollow Woods V1.5.4**.
