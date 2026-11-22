# HW-FIX-23A — BÁO CÁO NGHIỆM THU AN TOÀN QUANG HỌC ĐÈN LỒNG & REDUCED MOTION

**Dự án:** HOLLOW WOODS — PREP V1.5.4
**Nhánh:** `feat/v1.5.3-ag-world-polish`
**Mã nhiệm vụ:** `HW-FIX-23A`
**Mức độ ưu tiên:** P1 — An toàn tiền đình & trợ năng (Accessibility Safety)
**Baseline commit:** `8a6bb1e9cf5d88ff3764ce3f372b3320b396821e`

---

## 1. NGUYÊN NHÂN GỐC (ROOT CAUSE)

1. **Bỏ sót cờ Reduced Motion tại hiệu ứng Amber Pulsation của Đèn Lồng:**
   - Trong `src/scenes/GameScene.ts` (`updateFogOfWar()`), hiệu ứng nhịp thở hổ phách nhẹ nhàng (`breathing`) của quầng sáng đèn lồng được tính toán thuần túy dựa trên thiết lập chất lượng đồ họa:
     ```typescript
     const breathing = qSettings.enableAmberFlicker
       ? (Math.sin(this.time.now * 0.0035) * 0.012 + Math.cos(this.time.now * 0.006) * 0.008)
       : 0;
     ```
   - Do `qSettings.enableAmberFlicker` luôn là `true` ở cấu hình đồ họa `HIGH` và `MEDIUM`, khi người chơi bật **Chế độ Giảm chuyển động (Reduced Motion = ON)**, ánh sáng đèn lồng vẫn tiếp tục dao động quang học theo hàm thời gian hình sin/cosin, vi phạm tiêu chuẩn bảo vệ mắt và tiền đình.

2. **Dao động quang học chao đảo khi bị Dơi tấn công (`batLanternFlickerTimer`):**
   - Khi dơi cắn trúng người chơi, đèn lồng kích hoạt timer chao đảo `targetBaseRadius *= (0.82 + Math.sin(Date.now() * 0.008) * 0.18)`.
   - Khi Reduced Motion bật, số hạng `Math.sin(Date.now() * 0.008) * 0.18` vẫn tạo ra rung lắc quang học liên tục tần số cao trên bán kính tầm nhìn, gây khó chịu cho người nhạy cảm chuyển động.

---

## 2. GIẢI PHÁP & PHẠM VI SỬA ĐỔI (MINIMAL TARGETED FIX)

Đã áp dụng các sửa đổi nhỏ nhất có thể, bảo toàn 100% logic trò chơi và tính an toàn của hệ thống:

### File sửa đổi: `src/scenes/GameScene.ts`

1. **Triệt tiêu Amber Flicker khi Reduced Motion bật (Dòng ~6600):**
   ```typescript
   // BEFORE:
   const breathing = qSettings.enableAmberFlicker
     ? (Math.sin(this.time.now * 0.0035) * 0.012 + Math.cos(this.time.now * 0.006) * 0.008)
     : 0;

   // AFTER:
   const breathing = (!isReducedMotion && qSettings.enableAmberFlicker)
     ? (Math.sin(this.time.now * 0.0035) * 0.012 + Math.cos(this.time.now * 0.006) * 0.008)
     : 0;
   ```

2. **Chuẩn hóa hiệu ứng Dơi tấn công tĩnh mượt mà khi Reduced Motion bật (Dòng ~6499):**
   ```typescript
   // BEFORE:
   if (this.batLanternFlickerTimer > 0) {
     this.batLanternFlickerTimer -= 16.6;
     targetBaseRadius *= (0.82 + Math.sin(Date.now() * 0.008) * 0.18);
   }

   // AFTER:
   if (this.batLanternFlickerTimer > 0) {
     this.batLanternFlickerTimer -= 16.6;
     targetBaseRadius *= isReducedMotion ? 0.82 : (0.82 + Math.sin(Date.now() * 0.008) * 0.18);
   }
   ```
   - Khi Reduced Motion ON: Đèn lồng thu hẹp tĩnh mượt mà về $0.82 \times \text{bán kính}$ (người chơi nhận biết rõ đèn bị suy yếu), triệt tiêu hoàn toàn rung lắc sin dao động.
   - Khi Reduced Motion OFF: Giữ nguyên 100% nhịp chao đảo nguyên bản.
   - Gameplay (sát thương dơi, thời gian suy yếu 2500ms, AI quái vật) giữ nguyên vẹn 100%.

3. **Phơi bày tham chiếu kiểm thử an toàn (Dòng ~361):**
   ```typescript
   (window as any).__GRAPHICS_QUALITY_SYSTEM__ = GraphicsQualitySystem.getInstance();
   ```

---

## 3. KẾT QUẢ KIỂM THỬ RUNTIME HW-FIX-23A (12/12 TEST CASES PASS 100%)

Kịch bản kiểm thử: `scripts/test_hw_fix23a_reduced_motion.py`
Báo cáo dữ liệu số: `Read/V1.5/Reports/hw_fix23a_metrics.json`

| STT | Tên ca kiểm thử | Kết quả đo lường thực tế | Trạng thái |
|:---:|:---|:---|:---:|
| **T1** | Graphics HIGH + Reduced Motion OFF | $\Delta \text{Scale} = 0.007493$, Range $[0.9962 - 1.0036]$ | **PASS** |
| **T2** | Graphics HIGH + Reduced Motion ON | $\Delta \text{Scale} = 0.000000$ (tĩnh tuyệt đối), Visible = True, $\Delta \alpha = 0$ | **PASS** |
| **T3** | Graphics MEDIUM + Reduced Motion OFF | $\Delta \text{Scale} = 0.007583$ (duy trì nhịp thở tự nhiên) | **PASS** |
| **T4** | Graphics MEDIUM + Reduced Motion ON | $\Delta \text{Scale} = 0.000000$ (tĩnh tuyệt đối) | **PASS** |
| **T5** | Graphics LOW + Reduced Motion ON / OFF | $\Delta \text{Off} = 0.000000, \Delta \text{On} = 0.000000$ (LOW tự tắt flicker) | **PASS** |
| **T6** | Đèn lồng Bật / Tắt (Toggle) | Tắt: Glow ẩn, Dim mask; Bật: Glow hiện, Normal mask, $R=237.94$ | **PASS** |
| **T7** | Tinh Thần 35 & 15 ngoài Outer Woods | Comp 35: Vig=True, Hb=True (95 BPM), $\Delta=0$; Comp 15: Vig=True, Hb=True (134 BPM), $\Delta=0$ | **PASS** |
| **T8** | Safe Zone Sir Vaelen (1470, 710) | Warmth=True, Vig=False, Hb=False (an toàn tuyệt đối) | **PASS** |
| **T9** | Hiệu ứng Dơi tấn công | RM OFF: $\Delta=15.15\text{px}$; RM ON: $\Delta=0.0000\text{px}$ tĩnh, Timer $2500 \to 2168\text{ms}$ | **PASS** |
| **T10** | Chu trình Pause / Resume Lifecycle | Modal Escape Open = True, Closed = True, debounce an toàn | **PASS** |
| **T11** | Cài đặt & Tính bền vững lưu trữ | Chu kỳ ON $\to$ OFF $\to$ ON đồng bộ chuẩn xác | **PASS** |
| **T12** | Chuyển đổi trạng thái & Hiệu năng FPS | ON ($\Delta=0$) $\to$ OFF ($\Delta=0.007026$) $\to$ ON ($\Delta=0$); Tỷ số FPS tương đương = 0.83 | **PASS** |

- **Console Errors:** `0` lỗi.
- **Exit Code:** `0` (Success).

---

## 4. KẾT QUẢ BẢO TOÀN HỒI QUY BUG-023 (15/15 TEST CASES PASS 100%)

Kịch bản kiểm thử: `scripts/test_bug023_sanity_flash.py after`
Báo cáo dữ liệu số: `Read/V1.5/Reports/bug023_metrics_after.json`

- **T1 - T4 (Outer Woods Day/Night ở Comp 35 và 15):** PASS — Kích hoạt trọn vẹn visual vignette và Web Audio heartbeat dynamic.
- **T5 - T6 (Làng Bellhollow & Sanctuary Farm):** PASS — Bảo vệ tuyệt đối cả ngày lẫn đêm (0 vignette, 0 heartbeat).
- **T7 (Lửa trại Sir Vaelen):** PASS — Nguồn ấm che chở tuyệt đối.
- **T8 (Reduced Motion Toggle):** PASS — Tắt hoàn toàn camera shake & flash.
- **T9 (Fade-out khi hồi Tinh Thần 15 -> 50):** PASS — Tween êm dịu, không giật độ sáng.
- **T10 (Pause / Resume Lifecycle):** PASS — An toàn vòng đời.
- **T11 (Quầng sáng dao động chậm hợp lệ):** PASS — Tần số 0.25 Hz êm ái, biên độ 4.39%, MaxStepDelta = 0.38px, 0 giật cục (Zero strobe).
- **T12 (Không chồng lớp Vignette):** PASS — VeilSystem sạch 100%, không sinh lớp vignette thứ hai.
- **T13 (Không trùng lặp Popup HUD):** PASS — HUD tập trung tại UIScene.
- **T14 (Triệt tiêu Camera Flash/Shake khi RM ON):** PASS — Flashes = 0, Shakes = 0.
- **T15 (FOW Redraw Performance):** PASS — Dirty checking tối ưu, 3 redraws / 500ms, AvgTime = 0.00ms.
- **Console Errors:** `0` lỗi.

---

## 5. KIỂM TRA BIÊN DỊCH & BẢN BUILD SẢN XUẤT

- `npx tsc --noEmit`: **PASS** (0 lỗi cú pháp / type error).
- `npm run build`: **PASS** (100 modules transformed, build dist thành công trong 11.76s).

---

## 6. DANH MỤC THAY ĐỔI & BẢO VỆ MÃ NGUỒN

- **Mã nguồn game:**
  - `src/scenes/GameScene.ts`: Đã sửa điều kiện amber flicker và bat attack flicker khi Reduced Motion bật.
- **Kịch bản kiểm thử:**
  - `scripts/test_hw_fix23a_reduced_motion.py`: Bộ kiểm thử mới cho 12 ca kiểm thử Reduced Motion & Lantern Safety.
  - `scripts/test_bug023_sanity_flash.py`: Bổ sung đồng bộ reset Arcade Body cho teleport an toàn giữa các vùng.
- **Báo cáo số liệu:**
  - `Read/V1.5/Reports/hw_fix23a_metrics.json`
  - `Read/V1.5/Reports/bug023_metrics_after.json`
  - `Read/V1.5/Reports/HW_FIX_23A_REDUCED_MOTION_REPORT.md`
- **Bảo vệ mã nguồn tuyệt đối tuân thủ IRON RULES:**
  - `VeilSystem.ts`: Giữ nguyên vẹn, không chỉnh sửa.
  - Tinh Thần (Composure) recovery/drain logic: Giữ nguyên vẹn.
  - Heartbeat BPM: Giữ nguyên vẹn.
  - Save schema 3, Quest flags, World Map, NPC, Outer Woods: Giữ nguyên vẹn.
  - 3 file audio manifest untracked của Owner: Giữ nguyên, không chạm vào và không stage.

---

## 7. RỦI RO & KHUYẾN NGHỊ

- **Rủi ro còn tồn đọng:** 0 rủi ro quang học. Mọi hiệu ứng chớp nháy, dao động theo thời gian của đèn lồng và dơi đều đã được triệt tiêu 100% khi người chơi bật Reduced Motion.
- **Khuyến nghị:** Tiến hành đóng gói commit cho HW-FIX-23A và sẵn sàng cho đợt kiểm thử cuối kỳ V1.5.4.
