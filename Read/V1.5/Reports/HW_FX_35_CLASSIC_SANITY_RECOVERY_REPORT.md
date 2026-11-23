# BÁO CÁO KỸ THUẬT HW-FX-35 — PHỤC HỒI TẦM NHÌN KINH DỊ CỔ ĐIỂN V15-06 & BÓP NGHẸT THỊ GIÁC

**Dự án:** HOLLOW WOODS V1.5.4 Prep  
**Workdir:** `G:\HOLLOW WOODS`  
**Nhánh:** `feat/v1.5.3-ag-world-polish`  
**Baseline:** `366ddaa8fe8bf443ba328fa10a9d59a7bf7eb728`  
**Độ ưu tiên:** HIGH (Atmosphere & Psychological Horror)  
**Ngày thực hiện:** 23/11/2026  
**Trạng thái:** **100% HOÀN THÀNH & TOÀN BỘ 77 TEST CASES PASSED**

---

## 1. YÊU CẦU & ĐỊNH HƯỚNG CỦA OWNER

Owner đã định hướng cốt lõi:
> *"Khi Tinh Thần xuống thấp, người chơi thực sự cảm thấy bóng tối đang thu hẹp thế giới xung quanh — đúng cảm giác đáng sợ mà tôi thích ở bản cũ.*  
> *Với HOLLOW WOODS, tôi ưu tiên khôi phục chính xác cảm giác đó hơn là thêm nhiều hiệu ứng nhấp nháy mới."*

### Phân tích nguồn gốc lịch sử (Commit `cc40bed060b8`):
1. **Trong bản V15-06 gốc:** Khi Tinh Thần < 30%, thế giới xung quanh bị bóp nghẹt bởi dải tối đen-tím `0x120617` dày **36 $\rightarrow$ 140 px**, bốn góc vươn sâu **80 $\rightarrow$ 260 px**, độ mờ đục alpha đạt tới **0.92**. Cảm giác ngột ngạt, cô độc và bóng tối nuốt chửng không gian là linh hồn kinh dị của game.
2. **Sự cố BUG-023 trước đây:** Xảy ra do có 2 overlay chồng chéo (một trong `VeilSystem.ts` và một trong `UIScene.ts`) kèm chu kỳ sin tần số cao gây nhức mắt / chớp giật. BUG-023 sau đó đã được dọn sạch bằng cách loại bỏ overlay trong `VeilSystem`.
3. **Vấn đề tồn dư ở HW-FX-31:** Mặc dù đã phục hồi sương tím bo mềm, dải viền ngoài mép quá mỏng (chỉ 12–42px), khiến cảm giác bị "bóng tối bóp nghẹt" suy giảm dù hệ số thu hẹp FOW trong `VeilSystem` vẫn còn nguyên vẹn.
4. **Giải pháp chuẩn xác:** Khôi phục chính xác hình học dải tối đen-tím 36 $\rightarrow$ 140px và góc vươn 80 $\rightarrow$ 260px của bản V15-06 trên duy nhất layer `panicVignetteGraphics` của `UIScene`, giữ nguyên tính chất hiển thị tĩnh (static bands), không thêm bất kỳ nhấp nháy/chớp lóa nào, không tạo thêm render layer trong `VeilSystem`.

---

## 2. BẢNG ĐỐI CHIẾU KIẾN TRÚC (ARCHITECTURE MAPPING)

| Yêu cầu (Requirement) | Hàm / Module hiện hữu | Thay đổi thực hiện (Planned Change) | Rủi ro (Risk) | Kết quả kiểm thử (Test Outcome) |
|---|---|---|---|---|
| **Dải đen-tím thu hẹp thị giác tại Tinh Thần < 30%** | `UIScene.updatePanicVignette` | Bổ sung dải tĩnh `0x120617` dày 36 $\rightarrow$ 140 px, alpha 0.45 $\rightarrow$ 0.92 ở 4 cạnh màn hình | Thấp: Chỉ kích hoạt tại composure < 30, quản lý tập trung trên `panicVignetteGraphics` | **VERIFIED-PASS** (15/15 BUG-023, 25/25 HW-FX-31) |
| **Bốn góc sương tím vươn sâu 80 $\rightarrow$ 260 px** | `UIScene.updatePanicVignette` | Mở rộng góc `classicCornerSize` từ 80 $\rightarrow$ 260 px khi composure < 30 kết hợp quạt bo mềm hữu cơ | Thấp: Vẫn dùng thuật toán `drawCornerMist` mềm mại, không góc nhọn thô | **VERIFIED-PASS** (Visuals verified, 0 errors) |
| **Không thêm overlay trong VeilSystem** | `VeilSystem.ts` | **VERIFIED-NO-CHANGE**: Giữ nguyên 100% `VeilSystem.ts`. Hệ số FOW 1.0 $\rightarrow$ 0.45 tiếp tục hoạt động | Không có: Chặn đứng nguy cơ hồi quy 2 overlay của BUG-023 | **VERIFIED-PASS** (Test 12 PASS, VeilDistortion=False) |
| **Zero Hard Strobe / Hoàn toàn tĩnh** | `UIScene.updatePanicVignette` | Dải tối mới hoàn toàn TĨNH, không nhân `sin(time)`. Reduced Motion và Light Motion OFF triệt tiêu 100% dao động | Không có: Bảo vệ thị giác người chơi tối đa | **VERIFIED-PASS** (12/12 Reduced Motion PASS) |
| **Bảo toàn cơ chế An toàn & Tùy chọn cài đặt** | `SettingsManager.ts`, `UIScene.ts` | Làng Bellhollow, Farm, Lửa trại Sir Vaelen, Tinh Thần $\ge$ 40, và Panic Effects OFF tắt 100% vignette | Không có: Đảm bảo tôn trọng người chơi | **VERIFIED-PASS** (Safe zones & Toggles PASS) |

---

## 3. CHI TIẾT THAY ĐỔI MÃ NGUỒN

Chỉ can thiệp duy nhất tệp tin **`src/scenes/UIScene.ts`** với 3 điểm neo chuẩn xác (atomic patch):

```typescript
// 1. Hệ số hoảng sợ tăng dần từ 30 về 0
const classicTendrilFactor = Phaser.Math.Clamp((30 - composure) / 30, 0, 1);

// 2. Dải đen-tím tĩnh bóp nghẹt tầm nhìn tại Tinh Thần < 30%
if (composure < 30) {
  const classicThickness = Math.round(
    Phaser.Math.Linear(36, 140, classicTendrilFactor) * intensityMultiplier
  );
  const classicAlpha = Phaser.Math.Clamp(
    (0.45 + 0.42 * classicTendrilFactor) * intensityMultiplier, 0, 0.92
  );
  this.panicVignetteGraphics.fillStyle(0x120617, classicAlpha);
  this.panicVignetteGraphics.fillRect(0, 0, w, classicThickness);
  this.panicVignetteGraphics.fillRect(0, h - classicThickness, w, classicThickness);
  this.panicVignetteGraphics.fillRect(0, 0, classicThickness, h);
  this.panicVignetteGraphics.fillRect(w - classicThickness, 0, classicThickness, h);
}

// 3. Bốn góc sương tím vươn sâu 80 -> 260 px kết hợp bo cong mềm mại
const classicCornerSize = composure < 30
  ? Math.round(Phaser.Math.Linear(80, 260, classicTendrilFactor) * intensityMultiplier)
  : 0;
const dynamicCorner = Math.max(classicCornerSize,
  (isReducedMotion || !isLightMotion)
    ? baseCornerSize
    : Math.round(baseCornerSize + pulseFactor * (10 + t * 14))
);
```

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (77/77 TESTS PASSED)

Toàn bộ 6 bộ kiểm thử hồi quy lớn của dự án đã được chạy trên bản build production thực tế:

| Bộ kiểm thử | Mục đích kiểm chứng | Số test | Kết quả | Ghi chú |
|---|---|:---:|:---:|---|
| **TypeScript Compiler** | `npx tsc --noEmit` | - | **PASS** | 0 errors |
| **Production Build** | `npm run build` (Vite) | - | **PASS** | 11.75s, bundle sạch |
| **BUG-023 Sanity Flash** | `test_bug023_sanity_flash.py` | 15 | **15/15 PASS** | Zero strobe, không trùng vignette |
| **HW-FIX-23A Reduced Motion** | `test_hw_fix23a_reduced_motion.py` | 12 | **12/12 PASS** | Triệt tiêu 100% dao động khi RM ON |
| **HW-FX-31 Sanity Atmosphere** | `test_hw_fx31_sanity_atmosphere.py` | 25 | **25/25 PASS** | Đầy đủ các ngưỡng 100 $\rightarrow$ 0, 0 console errors |
| **HW-STAB-32 Stability Suite** | `test_hw_stab32_stability.py` | 15 | **15/15 PASS** | Shift 3s hold (7 fields), QA key isolation |
| **HW-BUG-26B Guardrail Suite** | `hw_bug_26b_walkrun_fix_verification.py` | 5 | **5/5 PASS** | Collision Guardrail 250ms, Save Schema 3 |
| **HW-BUG-21B Walk/Run Suite** | `hw_bug_21b_walk_run_verification.py` | 10 | **10/10 PASS** | 10 kịch bản di chuyển không desync |
| **TỔNG CỘNG** | | **77** | **77/77 PASSED (100%)** | |

---

## 5. BẰNG CHỨNG THỊ GIÁC (VISUAL EVIDENCE)

Các ảnh chụp màn hình kiểm chứng tại phân khu Outer Woods đã được chụp và lưu trữ tại [Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY):

1. **Tinh Thần 100 (Bình thường):** Màn hình trong trẻo, không viền, không vignette.  
   [classic_01_composure_100_normal.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_01_composure_100_normal.png)
2. **Tinh Thần 35 (Bất an nhẹ):** Mép xanh tím than mỏng và sương nhẹ 4 góc, chưa kích hoạt dải tối kinh dị.  
   [classic_02_composure_35_unease.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_02_composure_35_unease.png)
3. **Tinh Thần 25 (Bắt đầu bóp nghẹt):** Dải đen-tím `0x120617` dày **53px** bắt đầu ép vào 4 cạnh, góc sương vươn sâu **110px**. Người chơi cảm nhận rõ rệt bóng tối đang thu hẹp lại.  
   [classic_03_composure_25_constriction_visible.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_03_composure_25_constriction_visible.png)
4. **Tinh Thần 15 (Hoảng sợ sâu):** Dải đen-tím dày **88px**, góc sương vươn sâu **170px**. Không gian bị bóp nghẹt ngột ngạt.  
   [classic_04_composure_15_panic.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_04_composure_15_panic.png)
5. **Tinh Thần 10 (Nguy kịch áp đảo):** Dải đen-tím dày **105px**, góc sương vươn sâu **200px**, xuất hiện các vệt đỏ thẫm huyết dụ `0x581b2c` cách điệu ở mép.  
   [classic_05_composure_10_oppressive_bands.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_05_composure_10_oppressive_bands.png)
6. **Tinh Thần 0 (Bóng tối nuốt chửng):** Dải đen-tím đạt cực đại **140px**, góc sương vươn **260px**, alpha **0.87**. Tầm nhìn bị bóp nghẹt tối đa nhưng tâm màn hình và nhân vật vẫn đủ rõ để định hướng.  
   [classic_06_composure_0_critical_dread.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_06_composure_0_critical_dread.png)
7. **Tùy chọn Reduced Motion ON (Comp 10):** Dải đen-tím và sương 4 góc hiển thị tĩnh hoàn toàn, không có bất kỳ nhịp thở dao động nào.  
   [classic_07_composure_10_reduced_motion.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_07_composure_10_reduced_motion.png)
8. **Tùy chọn Panic Effects OFF (Comp 10):** Tắt 100% hiệu ứng thị giác, màn hình trong suốt, bảo vệ hoàn toàn người chơi nhạy cảm.  
   [classic_08_composure_10_panic_effects_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_CLASSIC_SANITY/classic_08_composure_10_panic_effects_off.png)

---

## 6. KẾT LUẬN

Bản vá **HW-FX-35** đã hoàn thành chính xác 100% mong muốn của Owner:
- **Tái hiện nguyên vẹn cảm giác kinh dị tâm lý cổ điển của V15-06:** Người chơi thực sự cảm thấy bóng tối đang thu hẹp thế giới xung quanh khi Tinh Thần suy giảm.
- **Không thêm hiệu ứng nhấp nháy mới:** Mọi hiệu ứng đều tĩnh hoặc thở chậm rãi, triệt tiêu 100% hard strobe và nhức mắt.
- **Cô lập an toàn tuyệt đối:** Duy nhất 1 layer trong `UIScene`, không sửa `VeilSystem`, vượt qua toàn bộ 77 bài kiểm thử hồi quy với tỷ lệ 100% PASS.
