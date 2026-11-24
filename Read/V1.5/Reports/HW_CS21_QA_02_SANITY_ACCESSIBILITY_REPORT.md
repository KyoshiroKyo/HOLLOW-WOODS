# HOLLOW WOODS V1.5.4 — HW-CS21-QA-02 ACCEPTANCE AUDIT REPORT
## SANITY STATE TRANSITIONS, ACCESSIBILITY MATRIX & BUG-023 REGRESSION AUDIT

- **Mã kiểm thử:** `HW-CS21-QA-02`
- **Mức ưu tiên:** P0 (Chặn Release)
- **Chế độ:** READ-ONLY SOURCE AUDIT & DYNAMIC PLAYWRIGHT VERIFICATION
- **Repository:** `G:\HOLLOW WOODS`
- **Nhánh kiểm thử:** `feat/v1.5.3-ag-world-polish`
- **Baseline Commit:** `2086d7afdae056fa6605af2d3abfcad8dbb4e0a3`
- **Ngày thực hiện:** 24/11/2026
- **Tiêu chuẩn áp dụng:** QA EXECUTION PROTOCOL V3 (AG FLASH HIGH)

---

## 1. TỔNG QUAN KẾT QUẢ NGHIỆM THU (EXECUTIVE SUMMARY)

Đợt kiểm định `HW-CS21-QA-02` đã thực thi kiểm tra toàn diện vòng đời hiệu ứng **Classic Sanity 2.1**, cơ chế chuyển tiếp trạng thái Tinh Thần, ma trận thiết lập Trợ Năng (Accessibility), tính ổn định theo phân khu thế giới, và xác minh sự triệt tiêu hoàn toàn của **4 nguyên nhân gốc gây lỗi BUG-023**.

### Kết quả tóm tắt:
- **TypeScript Typecheck (`npm run check`):** 0 lỗi (PASS).
- **Production Build (`npm run build`):** Thành công trong 10.28s, 100 modules bundled (PASS).
- **Bộ kiểm thử chuyên sâu QA-02 (22 Test Cases Groups A, B, C, D):** **22/22 PASS (100%)**, 1 WARN (Ghi nhận lỗi ngoại vi ngoài phạm vi).
- **Bộ kiểm thử hồi quy bắt buộc BUG-023 (`test_bug023_sanity_flash.py`):** **15/15 PASS (100%)**.
- **Bộ kiểm thử hồi quy bắt buộc Reduced Motion (`test_hw_fix23a_reduced_motion.py`):** **12/12 PASS (100%)**.
- **Bộ kiểm thử hồi quy bắt buộc Khí quyển Tinh Thần (`test_hw_fx31_sanity_atmosphere.py`):** **25/25 PASS (100%)**.
- **Tính toàn vẹn mã nguồn & Audio Manifest:** 100% SHA-256 Hashes khớp chuẩn tuyệt đối, 0 thay đổi ngoài ý muốn.
- **Phát hiện ngoài phạm vi (Out-of-Scope Finding):** Đã phát hiện 1 lỗi Trợ năng tiền ẩn tại `EndingSystem.ts` liên quan đến tiếng chuông kết thúc game (Đã phân loại BUG-HW-CS21-01, mức P2, không chặn release đợt này).

---

## 2. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ CHI TIẾT (GROUPS A, B, C, D)

Raw metrics được lưu trữ độc lập tại: `Backups/steps/HW-CS21-QA-02/run-01/qa02_raw_metrics.json`.

| Nhóm | Mã Test | Tên Kiểm Thử | Trạng Thái | Chi Tiết Kỹ Thuật & Đo Đạc Thực Tế |
| :--- | :--- | :--- | :---: | :--- |
| **A** | A01 | Giảm Tinh Thần $100 \rightarrow 0$ | **PASS** | Sanity 100, 50, 40: 0 vignette (inactive). Sanity $\le 30, 15, 11, 0$: Active, 208 draw commands, tăng mượt theo SmoothStep. |
| **A** | A02 | Hồi phục Tinh Thần $0 \rightarrow 100$ | **PASS** | Tinh thần vượt ngưỡng 40 kích hoạt fade-out tween 280ms Quad.easeOut. Kết thúc: active=false, commandCount=0. |
| **A** | A03 | Rung lắc ngưỡng nhạy cảm (Flutter) | **PASS** | Quét 5 chu kỳ nhanh qua các cặp 41/39, 39/37, 31/29, 26/24, 16/14, 11/9: Đồ họa không vỡ, không crash, không rò rỉ object. |
| **A** | A04 | Hồi phục giữa tiến trình fade-out | **PASS** | Sanity 15 $\rightarrow$ 50: Tween khởi tạo chính xác (vignetteTweens=1). Sau 800ms: hoàn tất an toàn, commands=0, alpha reset 1.0. |
| **A** | A05 | Tụt Tinh Thần trở lại giữa fade-out | **PASS** | Sanity 15 $\rightarrow$ 50 $\rightarrow$ tụt lại 15 sau 100ms: Tween bị hủy ngay lập tức (`stop()`), alpha khôi phục 1.0, tiếp tục vẽ ngay, không mờ dở dang. |
| **A** | A06 | 10 chu kỳ dao động Tinh Thần dồn dập | **PASS** | Lặp 10 chu kỳ tụt/hồi liên tục: Settle tại 100 $\rightarrow$ activePanicFadeTween=undefined, commandCount=0, zero leaked tweens. |
| **B** | B01 | Panic Effects OFF tại Sanity 11 & 0 | **PASS** | Tắt Panic Effects: `panicVignetteGraphics` được clear sạch sẽ (0 commands), `activeRedDangerTween` bị hủy lập tức. |
| **B** | B02 | Panic Effects ON trở lại | **PASS** | Bật lại Panic Effects: Đồ họa ba tầng tam giác tái xuất hiện đầy đủ (208 commands), không bị nhân đôi layer graphics. |
| **B** | B03 | Reduced Motion ON (Tĩnh, An toàn) | **PASS** | RM ON: Triệt tiêu hoàn toàn breath/pulse quang học (`breath = 0`), đồ họa góc tĩnh và an toàn thị giác. |
| **B** | B04 | Light Motion OFF | **PASS** | LM OFF: Vô hiệu hóa dao động ánh sáng môi trường và fade tween chuyển tiếp, graphics clear dứt khoát không gây chóng mặt. |
| **B** | B05 | Screen Flash OFF | **PASS** | Flash OFF: Chặn 100% các lời gọi `cameras.main.flash` từ `CameraSystem` và các bẫy bóng tối. |
| **B** | B06 | Ma trận kết hợp: RM ON + LM OFF + Panic ON | **PASS** | Kiểm tra đồng thời cả 3 cờ tại Sanity 11 & 0: Đồ họa hiển thị sắc nét, tĩnh, an toàn thị giác tuyệt đối, không crash. |
| **B** | B07 | Bảo lưu cài đặt qua Save / Load | **PASS** | Trạng thái 4 tùy chọn trợ năng (Panic, RM, LM, Flash) được quản lý tập trung và bảo toàn vẹn toàn qua các phiên game. |
| **C** | C01 | Rừng Ngoài (Outer Woods) Ngày & Đêm | **PASS** | Ban ngày và ban đêm tại Outer Woods đều hiển thị Vignette chính xác (tuân thủ HW-FIX-23 & HW-FX-31: hoang dã không an toàn). |
| **C** | C02 | Vùng Làng An Toàn (Bellhollow & Farm) | **PASS** | Di chuyển vào Bellhollow hoặc Sanctuary Farm: Tự động fade-out và triệt tiêu Vignette về 0 ngay cả khi Sanity = 11. |
| **C** | C03 | Fog Crossing Safe Zone | **PASS** | Vùng Cầu Sương (Fog Crossing) kích hoạt `isProtectedZone = true`, bảo vệ người chơi, tắt toàn bộ hiệu ứng hoảng loạn. |
| **C** | C04 | Lửa trại Sir Vaelen (Sanctuary Outpost) | **PASS** | Đến gần nguồn nhiệt/lửa trại (1470, 710): Vignette mượt mà tắt về 0; rời xa lửa trại: Vignette tự động phục hồi trọn vẹn. |
| **C** | C05 | Pause / Resume Vòng đời Game | **PASS** | Tạm dừng và tiếp tục gameplay: Đồ họa Vignette được bảo toàn nguyên vẹn trên màn hình, không bị biến mất hoặc lỗi vị trí. |
| **D** | D01 | Khử triệt để dao động tần số cao FOW | **PASS** | FOW nhịp thở ổn định mượt mà (Mean=134.08, Delta=0.32), hoàn toàn không có hiện tượng nhấp nháy/strobe nguy hiểm. |
| **D** | D02 | Khử trùng lặp Overlay trong VeilSystem | **PASS** | `veilSystem.hasDistortionDrawn === false`, VeilSystem hoàn toàn không vẽ thêm bất kỳ distortion overlay toàn màn hình nào. |
| **D** | D03 | Tách biệt Red Danger Flash & Panic Vignette | **PASS** | `redDangerGraphics` (Depth 901) hoàn toàn độc lập với `panicVignetteGraphics` (Depth 900), không còn timer 35ms lặp lại. |
| **D** | D04 | Kiểm soát Camera Flash chặt chẽ | **PASS** | `CameraSystem.flash()` kiểm soát cooldown $\ge 450$ms, trần an toàn RGB $\le 190$ (chống chói lóa tương phản gay gắt). |
| **D** | D05 | Rà soát Camera Flash tại EndingScene/System | **WARN** | Phát hiện `EndingSystem.ts:292-294` gọi trực tiếp `cam.flash` và `cam.shake` mà không qua Settings check (Xem Bug ID bên dưới). |

---

## 3. BẢNG PHÁT HIỆN LỖI NGOÀI PHẠM VI (OUT-OF-SCOPE DEFECT)

Tuân thủ nghiêm ngặt **QUY TẮC 01 (Phạm vi và quyền hạn)** và **QUY TẮC 06 (Không tự ý sửa mã nguồn ngoài phạm vi)** của Protocol V3, lỗi dưới đây được phân loại và ghi nhận độc lập để Owner quyết định kế hoạch xử lý:

### BUG-HW-CS21-01: EndingSystem Unchecked Fullscreen White Camera Flash & Shake
- **Vị trí phát hiện:** `src/systems/EndingSystem.ts`, dòng 291–295.
- **Đoạn mã nguồn liên quan:**
  ```typescript
  // GIAI ĐOẠN 1: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN (THE FIRST TOLL)
  cam.shake(1200, 0.02);
  cam.flash(1200, 255, 255, 255);
  if (this.uiScene) {
    this.uiScene.cameras.main.flash(1200, 255, 255, 255);
  }
  ```
- **Mô tả hành vi lỗi:** Khi hoàn thành cốt truyện và kích hoạt tiếng chuông kết thúc (The First Toll), `EndingSystem` gọi trực tiếp `cam.shake(1200, 0.02)` và chớp trắng toàn màn hình `cam.flash(1200, 255, 255, 255)` đồng thời trên cả GameScene lẫn UIScene mà **KHÔNG** kiểm tra cờ `SettingsManager.getInstance().isScreenFlashEnabled()` hoặc `SettingsManager.getInstance().isScreenShakeEnabled()`.
- **Mức độ nghiêm trọng:** **P2 (Trung bình / Trợ năng)**.
  - *Tại sao không phải P0?* Lỗi này chỉ xảy ra duy nhất 1 lần khi người chơi đạt được màn kết thúc (Ending), hoàn toàn không xảy ra trong quá trình chơi bình thường (gameplay loop), không gây crash hay đơ game.
  - *Ảnh hưởng trợ năng:* Người chơi bật tùy chọn tắt Screen Flash hoặc tắt Screen Shake vẫn sẽ bị chớp trắng và rung màn hình ở đúng phân cảnh ngân chuông kết thúc này.
- **Khuyến nghị khắc phục (Sau khi Owner phê duyệt):**
  Bọc các lời gọi trên bằng điều kiện kiểm tra từ `SettingsManager`:
  ```typescript
  const sm = SettingsManager.getInstance();
  if (sm.isScreenShakeEnabled()) {
    cam.shake(1200, 0.02);
  }
  if (sm.isScreenFlashEnabled()) {
    cam.flash(1200, 255, 255, 255);
    if (this.uiScene) {
      this.uiScene.cameras.main.flash(1200, 255, 255, 255);
    }
  }
  ```

---

## 4. XÁC MINH CÁC BỘ REGRESSION SUITES BẮT BUỘC

Toàn bộ 3 bộ kịch bản kiểm thử tự động chính thức của dự án đã được chạy trên bản build production mới nhất và đều vượt qua 100%:

1. **`python scripts/test_bug023_sanity_flash.py`:**
   - Kết quả: **15/15 PASS (100%)**, 0 Console Errors.
   - Xác nhận: Hiệu ứng kinh dị ban ngày ngoài vùng an toàn hoạt động chính xác; làng Bellhollow, Sanctuary Farm và lửa trại Sir Vaelen bảo vệ tuyệt đối; nhịp thở FOW êm dịu triệt tiêu strobe; không có overlay thứ hai trong VeilSystem.
2. **`python scripts/test_hw_fix23a_reduced_motion.py`:**
   - Kết quả: **12/12 PASS (100%)**, 0 Console Errors.
   - Xác nhận: Reduced Motion ON triệt tiêu 100% dao động quang học ở cả 3 mức đồ họa HIGH/MEDIUM/LOW; bật/tắt đèn lồng ổn định; hiệu ứng dơi tấn công không gây chao đảo; hiệu năng FPS tương đương không sụt giảm.
3. **`python scripts/test_hw_fx31_sanity_atmosphere.py`:**
   - Kết quả: **25/25 PASS (100%)**, 0 Console Errors.
   - Xác nhận: Dải Tinh Thần từ 100 xuống 0 qua các mốc 40, 39, 25, 20, 10, 0 chuyển tiếp chuẩn mực; các cờ Panic Visuals, Light Motion, Reduced Motion tương thích ngược hoàn hảo với cấu hình lưu trữ cũ.

---

## 5. KIỂM ĐỊNH TÍNH TOÀN VẸN MÃ NGUỒN (SAFETY GATE AUDIT)

Bảng so sánh SHA-256 Hash trước và sau kiểm định:

| Đường Dẫn File | SHA-256 Hash Trước Khi Chạy | SHA-256 Hash Sau Khi Chạy | Đánh Giá |
| :--- | :--- | :--- | :---: |
| `src/scenes/UIScene.ts` | `271BE89D2D75CE140D876146D3EB87A20EE4608964A8D9E8E6DF64539B34BED2` | `271BE89D2D75CE140D876146D3EB87A20EE4608964A8D9E8E6DF64539B34BED2` | **NGUYÊN VẸN** |
| `src/world/WorldBuilder.ts` | `2C76B1F2F26C68848976C1863C1CA291AD4ECBB0CC14A54A16D88697F59EE8DA` | `2C76B1F2F26C68848976C1863C1CA291AD4ECBB0CC14A54A16D88697F59EE8DA` | **NGUYÊN VẸN** |
| `src/animation/BlackKnightAnimations.ts` | `C7A718C030DF8972689CCDCE4B14D42E44E921C68AE493BE96D052E465A52894` | `C7A718C030DF8972689CCDCE4B14D42E44E921C68AE493BE96D052E465A52894` | **NGUYÊN VẸN** |
| `scripts/AUDIO_SOURCES_MANIFEST.csv` | `326EB987BE308155E991C936CAD0E987532A3343F4B5A1F46FA86FACCBA8229E` | `326EB987BE308155E991C936CAD0E987532A3343F4B5A1F46FA86FACCBA8229E` | **BẢO VỆ TUYỆT ĐỐI** |
| `scripts/AUDIO_SOURCES_MANIFEST.json` | `5CE3FEC78F18D79504B4383306ED1F97340D9528CB569BC7C6698C7954E20089` | `5CE3FEC78F18D79504B4383306ED1F97340D9528CB569BC7C6698C7954E20089` | **BẢO VỆ TUYỆT ĐỐI** |
| `scripts/generate_audio_sources_manifest.mjs` | `D48E362718B835E32CB6A06A3B06A0FA396B29A5FF8D09B0D9AB213E99B60EE3` | `D48E362718B835E32CB6A06A3B06A0FA396B29A5FF8D09B0D9AB213E99B60EE3` | **BẢO VỆ TUYỆT ĐỐI** |

- Trạng thái Git: `git diff --cached --stat` rỗng (0 file staged).
- Không có lệnh reset, clean, restore hoặc force push nào được thực hiện.
- Thư mục script tạm `scripts/temp/` đã được dọn dẹp sạch sẽ sau khi kiểm thử.

---

## 6. KẾT LUẬN & ĐỀ XUẤT TIẾP THEO

1. **Kết luận Nghiệm thu:**
   Phiên bản **Classic Sanity 2.1** hoạt động ổn định tuyệt đối về mặt kỹ thuật, chuyển tiếp trạng thái Tinh Thần trơn tru, fade tween 280ms triệt tiêu pop-in, hủy tween và reset alpha chuẩn xác khi tụt Tinh Thần giữa chừng, không rò rỉ tween, tích hợp trọn vẹn với các tùy chọn Trợ Năng (Panic Effects, Reduced Motion, Light Motion, Screen Flash), và **100% không tái phát bất kỳ nguyên nhân nào của BUG-023**.
2. **Khuyến nghị cho Owner:**
   - Hoàn tất nghiệm thu kỹ thuật cho đợt kiểm thử **HW-CS21-QA-02**.
   - Cân nhắc giao thêm nhiệm vụ vá lỗi nhỏ cho `EndingSystem.ts` (BUG-HW-CS21-01) ở giai đoạn tiếp theo để hoàn thiện trải nghiệm trợ năng 100% cho màn kết thúc.
   - Thực thi **HARD STOP**: Không commit, không push, không merge; giữ nguyên trạng mã nguồn hiện tại chờ Owner xem xét và phê duyệt.
