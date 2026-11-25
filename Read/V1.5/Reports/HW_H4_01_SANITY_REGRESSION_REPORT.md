# HW-H4-01 — CLASSIC SANITY 2.1 & BUG-023 REGRESSION REPORT

**Dự án:** HOLLOW WOODS (Kyoshiro Studio)
**Giao thức:** HOLLOW WOODS — HYDRO HIGH ENGINEERING PROTOCOL V4 (`REPRODUCE FIRST, TARGETED FIX ONLY`)
**Nhánh Git:** `feat/v1.5.3-ag-world-polish` (dựa trên commit `0617668a97f462877cbe2c30d304323e8fd48f6e`, **chưa commit/push**)
**Ngày thực hiện:** 25/11/2026

---

## 1. Kết quả kiểm toán Source & Tái hiện ban đầu (Reproduce First)

### 1.1. Core Classic Sanity 2.1 (`UIScene`, `VeilSystem`, `GameScene`, `SettingsManager`, `CameraSystem`)
Kiểm tra mã nguồn thực tế tại [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L1817-L2037), [VeilSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/VeilSystem.ts#L356-L402), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L2087-L2121), [SettingsManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SettingsManager.ts#L243-L430) và [CameraSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/camera/CameraSystem.ts#L57-L86):
- **Bảo toàn 100% thiết kế QA commit `0ceffa5`:** `UIScene.updatePanicVignette` render đủ 3 tầng tam giác góc (`0x280712` Outer Crimson, `0x18030b` Mid Crimson-Black `72%`, `0x0a0105` Deep Corner Void `45%`) khi `composure < 38` cùng 5 dải viền mép nhẹ (max inset `130px`, chừa trống hoàn toàn khung trung tâm `1020×460 px`).
- **Không nhân đôi lớp phủ / không strobe:** `VeilSystem.distortionOverlay` duy trì `hasDistortionDrawn = false` và `.clear()`; không tồn tại timer `35ms`; nhịp thở FOW `0.25 Hz` và dao động góc vignette `Math.sin(time * 0.0022) * 0.5` chỉ chạy khi `isLightMotionEnabled()` bật (và tự động triệt tiêu khi `Reduced Motion = ON`); không tồn đọng Tween sau hồi phục hoặc chuyển vùng an toàn.
- **Kết luận cho lõi Classic Sanity 2.1:** Không phát hiện lỗi hồi quy; **không chỉnh sửa** bất kỳ tham số thẩm mỹ hay logic vignette nào của Classic Sanity 2.1.

### 1.2. Đường gọi Camera Flash độc lập trong `EndingSystem` (`BUG-HW-CS21-01` — Đã tái hiện & Đã sửa)
- **Vị trí nguồn trước khi sửa:** [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L291-L295) trong `triggerTheFirstTollFinale()`:
  - Gọi trực tiếp `cam.shake(1200, 0.02)`, `cam.flash(1200, 255, 255, 255)` và `this.uiScene.cameras.main.flash(1200, 255, 255, 255)`.
  - Phớt lờ hoàn toàn `SettingsManager.isScreenFlashEnabled()`, `SettingsManager.isScreenShakeEnabled()` và `isReducedMotionPreferred()`, đồng thời vượt ngưỡng kẹp an toàn của `CameraSystem` (`<= 380ms`, `RGB <= 190`).
- **Kết quả tái hiện live trước khi sửa** (`Screen Flash = OFF`, `Screen Shake = OFF`, `Reduced Motion = ON`):
  - `gsFlashCalls: [[1200, 255, 255, 255]]`
  - `gsShakeCalls: [[1200, 0.02]]`
  - `uiFlashCalls: [[1200, 255, 255, 255]]`

---

## 2. Sửa lỗi mục tiêu & Git Diff

Chỉ thực hiện **duy nhất 1 sửa lỗi đã tái hiện xác thực** tại [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L28-L310):
- Nạp `SettingsManager.getInstance()` để guard cả `Shake` và `Flash` trên cả `GameScene` lẫn `UIScene`.
- Khi `Screen Shake` / `Screen Flash` tắt hoặc `Reduced Motion` bật: triệt tiêu `100%` flash và shake ở hồi kết.
- Khi được phép (`Screen Flash = ON`, `Reduced Motion = OFF`): đi qua `gameScene.cameraSystem` (nếu có) với mức dịu mắt `(360, 180, 175, 165)` / shake `(400, 0.015)` đồng bộ cho cả 2 camera, loại bỏ hoàn toàn xung trắng `1200ms (255, 255, 255)` mất kiểm soát.

```diff
diff --git a/src/systems/EndingSystem.ts b/src/systems/EndingSystem.ts
index 7a22e02..95cb931 100644
--- a/src/systems/EndingSystem.ts
+++ b/src/systems/EndingSystem.ts
@@ -25,6 +25,7 @@ import { PlayerState } from '../state/PlayerState';
 import { AudioManager } from '../audio/AudioManager';
 import { HDTextHelper } from '../utils/HDTextHelper';
 import { SaveManager } from './SaveManager';
+import { SettingsManager } from './SettingsManager';
 import loreData from '../data/lore.json';

 export type EndingType = 'true_ending' | 'sacrifice_ending' | 'fog_loop_ending';
@@ -288,10 +289,24 @@ export class EndingSystem {
     const endingConfig = EndingSystem.ENDING_CONFIGS[endingType];

     // GIAI ĐOẠN 1: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN (THE FIRST TOLL)
-    cam.shake(1200, 0.02);
-    cam.flash(1200, 255, 255, 255);
-    if (this.uiScene) {
-      this.uiScene.cameras.main.flash(1200, 255, 255, 255);
+    const settings = SettingsManager.getInstance();
+    const camSys = gameScene?.cameraSystem;
+    if (settings.isScreenShakeEnabled()) {
+      if (camSys && typeof camSys.shake === 'function') {
+        camSys.shake(400, 0.015);
+      } else {
+        cam.shake(400, 0.015);
+      }
+    }
+    if (settings.isScreenFlashEnabled()) {
+      if (camSys && typeof camSys.flash === 'function') {
+        camSys.flash(360, 180, 175, 165);
+      } else {
+        cam.flash(360, 180, 175, 165);
+      }
+      if (this.uiScene) {
+        this.uiScene.cameras.main.flash(360, 180, 175, 165);
+      }
     }

     // Phát âm thanh chuông tương ứng với kết thúc
```

---

## 3. Bảng kiểm tra Settings Matrix (`ON` / `OFF` sau khi sửa)

| Cấu hình thử nghiệm (`Outer Woods Night`, `Composure < 10`) | `Panic Effects` | `Reduced Motion` | `Light Motion (Raw / Active)` | `Screen Flash` | Kết quả quan sát thực tế |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **All ON** | `ON` | `OFF` | `ON / ON` | `ON` | Vignette `Active = true` (`208` cmds, `0x280712` / `0x18030b` / `0x0a0105`), RedDanger Tween chạy mượt, `CameraSystem.flash` = `1`, `shake` = `1`, `VeilDistortionDrawn = false`. |
| **Panic Effects OFF** | `OFF` | `OFF` | `ON / ON` | `ON` | `isPanicVignetteActive = false`, `panicCmdCount = 0`, `activeRedDangerTween = false`; Audio Heartbeat vẫn giữ (`135 BPM`) để bảo toàn gameplay cue. |
| **Reduced Motion ON** | `ON` | `ON` | `ON / OFF` *(suppressed)* | `OFF` *(suppressed)* | `isPanicVignetteActive = true` tĩnh (không nhấp nháy/thở), `lightMotionActive = false`, `screenFlashEnabled = false`, `screenShakeEnabled = false`, `CameraSystem.flash/shake = 0`, FOW breathing delta = `0.000000`. |
| **Light Motion OFF** | `ON` | `OFF` | `OFF / OFF` | `ON` | Vignette 3 tầng vẫn hiển thị rõ, `breath === 0` (tĩnh hoàn toàn góc và FOW glow delta `= 0`), `VeilDistortionDrawn = false`. |
| **Screen Flash & Shake OFF** | `ON` | `OFF` | `ON / ON` | `OFF` | `screenFlashEnabled = false`, `screenShakeEnabled = false`, `CameraSystem.flash = 0`, `CameraSystem.shake = 0`. |
| **EndingSystem (`Screen Flash OFF / RM ON`)** | `ON` | `ON` | `OFF` | `OFF` | `gsFlashCalls: []`, `gsShakeCalls: []`, `uiFlashCalls: []` (**đã triệt tiêu 100%** sau sửa). |
| **EndingSystem (`Screen Flash ON / RM OFF`)** | `ON` | `OFF` | `ON / ON` | `ON` | `gsFlashCalls: [[360, 180, 175, 165]]`, `uiFlashCalls: [[360, 180, 175, 165]]`, `gsShakeCalls: [[400, 0.015]]` (êm dịu, đúng ngưỡng `CameraSystem`). |

---

## 4. Log Runtime & Đối chiếu thông số

### 4.1. Thang Sanity/Composure: `100 → 50 → 35 → 25 → 15 → 11 → 10 → 0 → 100` (`Outer Woods Night`)

| Mốc đích | Composure thực đo | Vignette Active | Cmd Count | 3 màu `0ceffa5` (`280712`/`18030b`/`0a0105`) | Corner Reach lý thuyết (`px`) | Tâm `1020×460` | Fade/Gfx Tweens | Heartbeat (BPM) | Veil Drawn |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `100` | `99.85` | `false` | `7` | `false / false / false` | `0` | Trống | `0` | `false (75)` | `false` |
| `50` | `49.94` | `false` | `7` | `false / false / false` | `0` | Trống | `0` | `false (75)` | `false` |
| `35` | `34.89` | `true` | `208` | `true / true / true` | `109` | Trống | `0` | `true (95)` | `false` |
| `25` | `24.60` | `true` | `208` | `true / true / true` | `173` | Trống | `0` | `true (116)` | `false` |
| `15` | `14.48` | `true` | `208` | `true / true / true` | `~218` | Trống | `0` | `true (135)` | `false` |
| `11` | `10.48` | `true` | `208` | `true / true / true` | `241` | Trống | `0` | `true (135)` | `false` |
| `10` | `9.13` | `true` | `208` | `true / true / true` | `245` | Trống | `0` | `true (135)` | `false` |
| `0` | `0.00` | `true` | `208` | `true / true / true` | `245` (max cap) | Trống | `0` | `true (135)` | `false` |
| `100` *(hồi phục)* | `99.07` | `false` | `208 -> 0` *(fading)* | Đang fade alpha `0.283 -> 0` rồi `.clear()` | `0` sau `280ms` | Trống | `1 -> 0` | `false (75)` | `false` |

### 4.2. Chuyển ngưỡng, Vùng an toàn, Lửa trại & Vòng Sáng Hộ Tâm `[F]`
- **Dao động quanh ngưỡng (`40↔39`, `38↔37`, `15↔14`)** cả khi `Light Motion = OFF` và `ON`: kích hoạt/tắt chính xác tại `40` và bung 3 tầng tam giác mượt từ `38`; `panicTweensOnGfx` quay về `0`, không kẹt alpha hoặc duplicate overlay.
- **Khu vực & Lửa trại (`Composure = 12`, Lantern `[F]` `OFF` & `ON`):**
  - `Outer Woods` ban ngày (`DAY`) & ban đêm (`NIGHT`): `isPanicVignetteActive = true`, `BPM = 135` với cả Lantern `OFF` lẫn `ON`.
  - Bấm `KeyF` bật Vòng Sáng trực tiếp khi đang hoảng loạn (`Composure = 15`): bán kính sáng mở rộng tự nhiên, `flashCountDuringKeyF = 0`, `VeilDistortionDrawn = false`.
  - `Bellhollow` (quảng trường & lửa trại trung tâm `(860, 310)`), `Sanctuary Farm (700, 750)`, `Fog Crossing (150, 195)`, lửa trại `Sir Vaelen (1470, 710)` (cả Lantern `OFF` và `ON`): **100% dập tắt vignette & heartbeat an toàn** (`isPanicVignetteActive = false`, `heartbeatActive = false`, `panicCmdCount = 0`).

---

## 5. Ảnh đối chiếu trực quan (`Visuals/HW-H4-01/`)

Các ảnh chụp trực tiếp trên bản `dist/` sau khi sửa (không dùng strobe nhân tạo):
1. Bình thường (`Sanity 100`): [h4_01_sanity_100.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_sanity_100.png)
2. Bất an khởi phát (`Sanity 35`): [h4_01_sanity_35.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_sanity_35.png)
3. Ngưỡng QA chuẩn (`Sanity 11`): [h4_01_sanity_11.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_sanity_11.png)
4. Nguy kịch cực hạn (`Sanity 0` — max cap `245px`, tâm màn hình thoáng): [h4_01_sanity_0.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_sanity_0.png)
5. Hồi phục (`Sanity 0 → 100`): [h4_01_sanity_recovered_100.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_sanity_recovered_100.png)
6. Tắt `Panic Effects`: [h4_01_setting_panic_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_setting_panic_off.png)
7. Bật `Reduced Motion` (Sanity thấp vẫn giữ viền tĩnh, triệt tiêu chớp/rung/thở): [h4_01_setting_reduced_motion_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_setting_reduced_motion_on.png)
8. Tắt `Screen Flash`: [h4_01_setting_screen_flash_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-01/h4_01_setting_screen_flash_off.png)

*(Kèm bộ ảnh tham chiếu tự động của `test_hw_fx31_sanity_atmosphere.py` tại [Visuals/HW_FX_31](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_FX_31)).*

---

## 6. Kết quả Regression Verification (`§6` — Chạy sau lần sửa cuối)

| Lệnh kiểm tra | Tồn tại script | Exit Code | Kết quả thực tế quan sát |
| :--- | :---: | :---: | :--- |
| `npm run check` | N/A | `0` | `0` lỗi TypeScript |
| `npm run build` | N/A | `0` | Build `dist/` sạch trong `10.99s` (100 modules) |
| `python scripts/test_bug023_sanity_flash.py` | Có | `0` | **15/15 PASS**, `0` console errors, xuất `bug023_metrics_after.json` |
| `python scripts/test_hw_fix23a_reduced_motion.py` | Có | `0` | **12/12 PASS**, `0` console errors, xuất `hw_fix23a_metrics.json` |
| `python scripts/test_hw_fx31_sanity_atmosphere.py` | Có | `0` | **25/25 PASS**, `0` console errors, xuất `hw_fx31_metrics.json` + `HW_FX_31/*.png` |
| Probe Runtime `HW-H4-01` (`100→0→100`, Settings, Ending) | Temp *(đã xóa)* | `0` | **PASS 100%**, `0` console/page/HTTP errors |

---

## 7. Backlog (Các điểm nhỏ ngoài phạm vi sửa duy nhất `HW-H4-01`)

1. [TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts#L109-L121): `checkDirectGaze` vẽ overlay `0x2c3e50` (`alpha: 0.22`, fade `300ms`) khi nhìn trực tiếp vào Echo lúc tắt đèn chưa kiểm tra `SettingsManager.getInstance().isScreenFlashEnabled()`.
2. [VeilSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/VeilSystem.ts#L446-L470): `updateRainThreatVisualIndicator` dùng `Math.sin(Date.now() * 0.007)` khi trời mưa và The Listener áp sát `< 260px` chưa check `isReducedMotionPreferred()`.

---

**HARD STOP:** Chỉ sửa duy nhất [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts) và tạo báo cáo/ảnh đối chiếu cho `HW-H4-01`; chưa `commit` hoặc `push`. Chờ chỉ thị tiếp theo từ Owner.
