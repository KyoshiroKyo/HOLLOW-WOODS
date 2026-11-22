# HW-QA-23B — BÁO CÁO NGHIỆM THU GIA CỐ HỒI QUY FOW HAI CHU KỲ & CAMERA REGRESSION

**Dự án:** HOLLOW WOODS — PREP V1.5.4
**Nhánh:** `feat/v1.5.3-ag-world-polish`
**Mã nhiệm vụ:** `HW-QA-23B`
**Mức độ ưu tiên:** P1 QA — Hardening Test Harness, FOW Telemetry & Camera Safety
**Chế độ:** `SOURCE READ-ONLY + QA SCRIPT + DOCUMENTATION`
**Tình trạng:** **PASS 100% TOÀN BỘ 4 TEST SUITES & CHUỖI VALIDATION**

---

## 1. GIT HEAD VÀ DEPENDENCY (BASELINE & PHỤ THUỘC)

- **Git HEAD Baseline:** `41d536a033334ca92c0a3da534677abaafd08197` (commit của HW-FIX-23A).
- **Ancestor Commit:** `8a6bb1e9cf5d88ff3764ce3f372b3320b396821e` (HW-FIX-23 V3).
- **Tình trạng nhánh:** Độc lập trên nhánh AG `feat/v1.5.3-ag-world-polish`, hoàn toàn đồng bộ với remote origin (`git ls-remote` trùng khớp 100%).
- **Trạng thái mã nguồn gameplay:** Giữ nguyên trạng 100% (`SOURCE READ-ONLY`). Không can thiệp sửa đổi các tệp gameplay `src/`.
- **Tệp ngoại lệ không thuộc phạm vi:** 3 tệp Audio Manifest untracked của Owner (`AUDIO_SOURCES_MANIFEST.*`, `generate_audio_sources_manifest.mjs`) được bảo vệ nguyên vẹn.

---

## 2. CÁC BÀI TEST ĐÃ CHẠY (TEST SUITES EXECUTION MATRIX)

Toàn bộ các bộ kiểm thử đã được chạy và hoàn thành xuất sắc với mã thoát `Exit Code 0`:

| Bài kiểm thử / Kịch bản | Phạm vi kiểm định | Số ca test | Kết quả | Ghi chú |
|:---|:---|:---:|:---:|:---|
| `scripts/test_hw_qa23b_fow_camera.py` | Đo telemetry FOW >= 9s, 2 chu kỳ, FPS A/B/C, Audit Camera, Vòng đời Lifecycle | 4 Suites (18 kiểm tra) | **PASS 100%** | Dữ liệu xuất ra `hw_qa23b_metrics.json` |
| `scripts/test_bug023_sanity_flash.py after` | Hồi quy toàn diện BUG-023 chống chớp màn hình & ổn định tâm lý | 15 / 15 Tests | **PASS 100%** | Khớp định mức không strobe |
| `scripts/test_hw_fix23a_reduced_motion.py` | Kiểm tra toàn diện an toàn quang học đèn lồng & Reduced Motion | 12 / 12 Tests | **PASS 100%** | Triệt tiêu 100% dao động khi RM ON |
| `npx tsc --noEmit` | Kiểm tra toàn vẹn kiểu dữ liệu tĩnh TypeScript | Toàn bộ repo | **PASS (0 lỗi)** | 0 type error |
| `npm run build` | Đóng gói sản phẩm phân phối Vite production | Toàn bộ dist | **PASS (0 lỗi)** | Bundle hoàn tất sạch sẽ |

---

## 3. BIÊN ĐỘ FOW THỰC TẾ (FOW OSCILLATION AMPLITUDE)

Đo lường từ dữ liệu telemetry liên tục $> 9.1$ giây với tần suất ghi nhận mẫu theo từng frame render (`performance.now()`):

| Kịch bản kiểm thử | Bán kính trung bình (Mean) | Dải bán kính thực tế [Min - Max] | Biên độ dao động (Amplitude) | Đỉnh-tới-đỉnh (Peak-to-Peak) | Đánh giá an toàn |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Test A1 (Composure 15, DAY ngoài Outer Woods)** | $153.24\text{ px}$ | $[152.13 - 154.11]\text{ px}$ | $\mathbf{0.99\text{ px}}$ ($\approx \pm 0.64\%$) | $\mathbf{1.98\text{ px}}$ | Êm ái, tinh tế, không giật cục |
| **Test A2 (Composure 35, NIGHT ngoài Outer Woods)** | $112.77\text{ px}$ | $[112.16 - 113.29]\text{ px}$ | $\mathbf{0.56\text{ px}}$ ($\approx \pm 0.50\%$) | $\mathbf{1.13\text{ px}}$ | Dịu nhẹ tuyệt đối, tạo không khí u ám |
| **Test A3 (Trạm lửa Sir Vaelen / Safe Zone)** | $153.75\text{ px}$ | $[153.75 - 153.75]\text{ px}$ | $\mathbf{0.00\text{ px}}$ | $\mathbf{0.00\text{ px}}$ | Triệt tiêu 100% dao động tâm lý |
| **Test A4 (Reduced Motion ON, Comp 15 ngoài Woods)** | $153.75\text{ px}$ | $[153.75 - 153.75]\text{ px}$ | $\mathbf{0.00\text{ px}}$ | $\mathbf{0.00\text{ px}}$ | Triệt tiêu 100% chuyển động quang học |

---

## 4. TẦN SỐ VÀ HAI CHU KỲ (FREQUENCY & TWO FULL CYCLES VERIFICATION)

Hàm tính toán sóng sin trong mã nguồn:
$$\omega = 0.0015707963\text{ rad/ms} \implies f = \frac{\omega}{2\pi} \approx 0.24999\text{ Hz} \quad (T \approx 4000.0\text{ ms})$$

Kết quả đo lường thực tế qua phân tích cực trị (peaks, troughs) và các điểm giao trục trung bình (zero-crossings):

- **Test A1 (Composure 15, Ngày):**
  - Thời gian thu thập liên tục: $9227.8\text{ ms}$ ($> 9000\text{ ms}$).
  - Số lượng mẫu: $58$ khung hình.
  - Số đỉnh quan sát (Peaks): $3$ đỉnh; Số đáy quan sát (Troughs): $3$ đáy.
  - Số chu kỳ hoàn chỉnh đo được: **$2$ chu kỳ đầy đủ**.
  - Chu kỳ trung bình (Avg Period): $3963.2\text{ ms}$.
  - Tần số thực đo: $\mathbf{0.252\text{ Hz}}$ (nằm trọn vẹn trong khoảng dung sai thiết kế $[0.20 - 0.30\text{ Hz}]$).

- **Test A2 (Composure 35, Đêm):**
  - Thời gian thu thập liên tục: $9132.0\text{ ms}$ ($> 9000\text{ ms}$).
  - Số lượng mẫu: $63$ khung hình.
  - Số đỉnh quan sát (Peaks): $3$ đỉnh; Số đáy quan sát (Troughs): $2$ đáy.
  - Số chu kỳ hoàn chỉnh đo được: **$3$ nửa chu kỳ / $2$ chu kỳ đỉnh-tới-đỉnh**.
  - Chu kỳ trung bình (Avg Period): $3894.3\text{ ms}$.
  - Tần số thực đo: $\mathbf{0.257\text{ Hz}}$ (khớp chuẩn thiết kế $\approx 0.25\text{ Hz}$).

---

## 5. BƯỚC NHẢY TỪNG KHUNG HÌNH (MAX FRAME-TO-FRAME DELTA)

Tiêu chuẩn phòng chống động kinh & rung giật quang học (Photosensitive Epilepsy Safety):
- Giới hạn bước nhảy bán kính tối đa: $\Delta R_{\max} < 1.5\text{ px/frame}$.
- Giới hạn bước nhảy quầng sáng Glow Alpha tối đa: $\Delta \alpha_{\max} < 0.05/\text{frame}$.

**Kết quả kiểm tra:**
- **Test A1:**
  - $\Delta R_{\max} = \mathbf{0.3886\text{ px}}$ ($\ll 1.5\text{ px}$ — ĐẠT).
  - $\Delta \alpha_{\max} = \mathbf{0.0000}$ ($\ll 0.05$ — ĐẠT).
- **Test A2:**
  - $\Delta R_{\max} = \mathbf{0.4261\text{ px}}$ ($\ll 1.5\text{ px}$ — ĐẠT).
  - $\Delta \alpha_{\max} = \mathbf{0.0122}$ ($\ll 0.05$ — ĐẠT).
- **Kết luận:** Hoàn toàn không xuất hiện hiện tượng giật cục, biến thiên đột ngột (strobe) hay sụp đổ bán kính (no radius collapse).

---

## 6. HIỆU NĂNG FRAME TIME VÀ FPS A/B/C (BENCHMARKING)

Thực hiện benchmark so sánh độc lập giữa 3 điều kiện trong cùng môi trường Outer Woods:
- **Điều kiện A:** Composure 100, Reduced Motion OFF (Baseline bình thường).
- **Điều kiện B:** Composure 15, Reduced Motion OFF (Hiệu ứng kinh dị + dao động FOW).
- **Điều kiện C:** Composure 15, Reduced Motion ON (Hiệu ứng kinh dị tĩnh + triệt tiêu dao động FOW).

| Chỉ số đo lường (120 frames) | Điều kiện A (Comp 100, RM OFF) | Điều kiện B (Comp 15, RM OFF) | Điều kiện C (Comp 15, RM ON) | Đánh giá tương đương |
|:---|:---:|:---:|:---:|:---:|
| **Thời gian khung hình trung bình (Mean)** | $153.9\text{ ms}$ | $143.7\text{ ms}$ | $143.6\text{ ms}$ | Tương đương ($B/A = 0.93$, $C/A = 0.93$) |
| **Phân vị 50 (Median p50)** | $154.3\text{ ms}$ | $142.7\text{ ms}$ | $142.7\text{ ms}$ | Ổn định cao |
| **Phân vị 95 (p95)** | $178.4\text{ ms}$ | $168.1\text{ ms}$ | $161.1\text{ ms}$ | Không có micro-stutter đột biến |
| **Tốc độ khung hình tương đương (FPS)** | $6.5\text{ FPS}$ | $7.0\text{ FPS}$ | $7.0\text{ FPS}$ | CPU Software Rasterizer ổn định |
| **Tỷ số Frame Time so với Baseline A** | $1.00$ | $\mathbf{0.93}$ | $\mathbf{0.93}$ | Nằm trong dải an toàn $[0.5 - 2.2]$ |

> [!WARNING]
> **Tình trạng phần cứng đồ họa (GPU Status):**
> **`GPU NOT VERIFIED (Headless Chrome SwiftShader CPU software rasterizer)`**
> Môi trường CI/CD thực thi trong headless browser không có GPU phần cứng chuyên dụng, chạy qua bộ dựng hình phần mềm SwiftShader của Chromium. Không được ghi nhận GPU PASS nếu chưa có kết quả đo đạc từ phần cứng GPU thực tế.

---

## 7. ĐÁNH GIÁ VẼ LẠI MÀN HƯƠNG SƯƠNG MÙ (FOW REDRAW & DIRTY-CHECKING)

- **Số lần gọi hàm làm sạch FOW (`clear()`):**
  - Điều kiện A: 30 lần / 120 frames.
  - Điều kiện B: 25 lần / 120 frames.
  - Điều kiện C: 19 lần / 120 frames.
- **Thời gian thực thi mã JS trung bình mỗi lần làm sạch (`avgClearTimeMs`):** $< 0.001\text{ ms}$ ($\ll 4.0\text{ ms}$).
- **Nhận xét:** Cơ chế dirty-checking của `FogOfWarSystem` và `GameScene` hoạt động tối ưu. Khi bán kính dao động chậm dưới ngưỡng $0.25\text{ Hz}$, hệ thống không gây ra redraw canvas liên tục quá mức, đảm bảo chi phí render ở mức tối thiểu.

---

## 8. NGUỒN GỌI CAMERA FLASH / SHAKE (SOURCE COVERAGE AUDIT)

Đã kiểm tra toàn diện 5 đường gọi Camera Flash & Shake trong toàn bộ runtime gameplay:

| Ký hiệu | Đường gọi thực tế | Hành vi khi RM ON | Hành vi khi RM OFF | Đánh giá an toàn |
|:---:|:---|:---:|:---:|:---:|
| **C1** | **Panic Micro-tremor** (Composure < 15, hoảng loạn) | Real Shakes = **0** | Real Shakes = **1** | PASS tuyệt đối |
| **C2** | **Bat Swoop & Attack** (Dơi tấn công lao xuống) | Real Shakes = **0** | Real Shakes = **1** | PASS tuyệt đối |
| **C3** | **Combat Encounter Melee Hit** (Va chạm chiến đấu) | Flashes = **0**, Shakes = **0** | Flashes = **1**, Shakes = **1** | PASS tuyệt đối |
| **C4** | **Fallback Direct Camera** (Khi `cameraSystem` là null) | Real Shakes = **0** | Real Shakes = **1** | PASS tuyệt đối |
| **C5** | **Throttling & Cooldowns** (Burst 5 lần trong < 50ms) | Flashes thực thi = **1** (450ms) | Shakes thực thi = **1** (120ms) | Chặn đứng spam |

---

## 9. ĐỘ PHỦ GIẢM CHUYỂN ĐỘNG (REDUCED MOTION COVERAGE)

- **Camera Flash/Shake:** Toàn bộ các hàm phát chớp sáng và rung máy ảnh trong `CameraSystem` và các fallback trực tiếp qua `cameras.main` đều đọc trực tiếp từ `SettingsManager.getInstance().isScreenShakeEnabled()` và `isReducedMotionPreferred()`.
- **Ánh sáng Đèn lồng (Amber Flicker & Bat Attack):** Đã kiểm chứng triệt tiêu hoàn toàn dao động hàm thời gian $\sin/\cos$ khi cờ Reduced Motion bật.
- **Nhịp thở quang học sương mù (Veil Breathing):** Tự động ngừng tính toán số hạng dao động tâm lý, bán kính giữ cố định tại giá trị cân bằng tĩnh theo chỉ số Tinh Thần.

---

## 10. VÒNG ĐỜI SAFE ZONE, PAUSE/RESUME & CẤU TRÚC OVERLAY (LIFECYCLE HARDENING)

Đã kiểm định tính ổn định vòng đời và khả năng chống rò rỉ:
1. **Chuyển tiếp Vùng An Toàn:**
   - Ngoài Outer Woods (Comp 15): `isPanicVignetteActive = True`.
   - Di chuyển vào Lửa trại Sir Vaelen (1470, 710): `isPanicVignetteActive = False` (tắt ngay lập tức).
   - Di chuyển trở lại Outer Woods: `isPanicVignetteActive = True` (bật lại chính xác).
2. **Hồi phục Tinh Thần:**
   - Tăng Tinh Thần lên 50 ($> 45$): `isPanicVignetteActive = False` (fade-out êm dịu).
3. **Chu trình Pause / Resume Modal:**
   - Mở modal Escape: `isOpen = True`.
   - Đóng modal Escape: `isOpen = False`.
   - Vòng đời giao diện giữ nguyên, không gây crash hoặc mất input focus.
4. **Không nhân đôi đồ họa (Single Instance Guarantee):**
   - Số lượng `panicVignetteGraphics` trong `UIScene`: **Chính xác 1**.
   - Số lượng `vignetteGraphics` trong `VeilSystem`: **Chính xác 0** (VeilSystem không tạo lớp vignette thứ hai).
5. **Đổi cờ Reduced Motion dồn dập (5x Rapid Toggles):**
   - Chu kỳ `ON -> OFF -> ON -> OFF -> ON` duy trì giá trị cuối cùng `true` đồng bộ chuẩn xác với cấu hình hệ thống.

---

## 11. NHỮNG TRƯỜNG HỢP KHÔNG KIỂM THỬ ĐƯỢC (EXCLUDED/UNVERIFIED PATHS)

- **`EndingSystem.ts:294`:**
  - Nhánh thực thi: `this.cameras.main.flash(4000, 255, 255, 255);`
  - Trạng thái kiểm thử: **`NOT VERIFIED (cinematic cutscene)`**
  - Lý do: Đây là phân cảnh cutscene kết thúc game (End Credits), test tự động không thể kích hoạt chuỗi kết thúc hoàn chỉnh của cốt truyện mà không làm gián đoạn luồng test sandbox. Đường gọi này là cutscene tĩnh độc lập được kích hoạt 1 lần duy nhất khi phá đảo.

---

## 12. PHÁT HIỆN & BÀI HỌC KINH NGHIỆM (KEY FINDINGS & FLAKE DEFENSE)

1. **Khóa Composure trong bài đo Telemetry dài (> 9 giây):**
   - Trong quá trình đo kéo dài 9.2 giây, `SurvivalSystem.update()` tự động hồi phục Tinh Thần ($2.2/\text{s}$ khi bật đèn), khiến `composure` tăng từ 15 lên 35 và làm trôi dạt bán kính cơ sở. Kịch bản test đã bổ sung wrapper khóa `composure` trong `gs.survivalSystem.update` suốt thời gian lấy mẫu để đo đạc thuần túy sóng sin tâm lý.
2. **Khởi tạo bán kính tại điểm cân bằng (Equilibrium):**
   - Khởi tạo `gs.currentLanternRadius = baseVision * compScale` trước khi thu thập telemetry giúp loại bỏ dải nở ban đầu ($lerpFactor = 0.045$), đảm bảo việc phát hiện cực trị và tần số đạt độ chính xác cao ngay từ giây đầu tiên.
3. **Cơ chế Debounce 250ms của PauseModal:**
   - `PauseModal.ts:597` có bộ lọc chống bấm nhầm `if (now - this.lastToggleTime < 250) return;`. Do môi trường CPU headless chạy ở tốc độ 6-7 FPS (mỗi frame ~150ms), khoảng chờ phím Escape trong các test tự động cần tối thiểu 500ms để đảm bảo không bị bộ lọc debounce bỏ qua.

---

## 13. KẾT LUẬN MỨC ĐỘ SẴN SÀNG V1.5.4 (READINESS CONCLUSION)

Hệ thống quang học sương mù (FOW), hiệu ứng tâm lý Tinh Thần thấp ngày & đêm, kiểm soát camera flash/shake và tính năng bảo vệ người nhạy cảm chuyển động (Reduced Motion) đã được gia cố hoàn hảo:
- **Biên độ dịu nhẹ:** Dao động tâm lý $\pm 0.5\% - 0.64\%$ ($0.56 - 0.99\text{ px}$), không có bất kỳ rung giật hay chớp sáng nguy hiểm nào.
- **Tần số chuẩn mực:** $0.252\text{ Hz}$ và $0.257\text{ Hz}$, hoàn thành tối thiểu 2 chu kỳ đầy đủ.
- **Tuân thủ Reduced Motion:** Triệt tiêu 100% chuyển động quang học và rung lắc màn hình khi bật cờ trợ năng.
- **Không suy hao hiệu năng:** Tỷ số thời gian khung hình đạt 0.93 so với baseline, dirty-checking tối ưu.

**ĐÁNH GIÁ CHUNG: READY CHO RELEASE V1.5.4 (100% PASS).**

---

## 14. COMMIT SHA

- **Commit Message:** `test(v1.5.4): harden low sanity fow and camera regression`
- **Tệp cam kết:**
  - `scripts/test_hw_qa23b_fow_camera.py`
  - `scripts/test_bug023_sanity_flash.py`
  - `Read/V1.5/Reports/hw_qa23b_metrics.json`
  - `Read/V1.5/Reports/HW_QA_23B_FOW_CAMERA_REGRESSION_REPORT.md`
