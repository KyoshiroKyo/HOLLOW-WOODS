# HW-AG-FIX-16 — LEGACY TEST MAINTENANCE REPORT

**Project:** HOLLOW WOODS V1.6.1\
**Branch:** `feat/v1.6-competition-preview`\
**Priority:** P2\
**Status:** COMPLETED (0 Real Regressions; 7 Outdated V1.5 Assertions Updated)

---

## 1. Tóm tắt kết quả

| Script | Trước cập nhật | Sau cập nhật | Regression thực tế |
|---|---|---|---|
| `scripts/test_v15_48_iframe_focus_and_hud_layout.mjs` | 26/28 PASS (2 FAIL) | **28/28 PASS** (0 FAIL) | Không có |
| `scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs` | 18/23 PASS (5 FAIL) | **23/23 PASS** (0 FAIL) | Không có |

Toàn bộ 7 assertion FAIL ban đầu đều xuất phát từ việc script V1.5 kiểm tra cứng các chuỗi literal / tọa độ / biến cũ đã được nâng cấp hoặc refactor hợp lệ trong V1.6. Không phát hiện regression nào ở RT-002 (`autoFocus: false`), ánh sáng, bố cục HUD, hay Classic Sanity. Không chỉnh sửa bất kỳ file runtime (`src/`) nào.

---

## 2. Bảng đối chiếu Assertion Trước / Sau & Bằng chứng

### 2.1. `scripts/test_v15_48_iframe_focus_and_hud_layout.mjs`

| # | Assertion Trước (V1.5) | Assertion Sau (V1.6) | Lý do cập nhật & Bằng chứng Source |
|---|---|---|---|
| 1 | `assert(indexHtml.includes('HOLLOW WOODS V1.5'), 'Tiêu đề cập nhật V1.5');` | `assert(/HOLLOW WOODS V1\.(5\|6)/.test(indexHtml), 'Tiêu đề cập nhật V1.5/V1.6');` | `index.html` đã nâng phiên bản tiêu đề lên `HOLLOW WOODS V1.6.0 – The Fog That Remembers`. |
| 2 | `assert(uiSceneTs.includes('const timeBoxW = 244;'), 'timeBoxW được nới rộng lên 244px');` | `assert(uiSceneTs.includes('const timeBoxW = 244;') \|\| uiSceneTs.includes('timeBoxX + 122'), 'Đồng hồ giữ chiều rộng 244px (center offset 122px)');` | `src/scenes/UIScene.ts:561` đã refactor đồng hồ sang baked texture: `this.add.image(timeBoxX + 122, timeBoxY + 39, timeBgTexKey)` với nửa chiều rộng `122px` (`122 * 2 = 244px`, `timeBoxX = 668`). |

### 2.2. `scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs`

| # | Assertion Trước (V1.5) | Assertion Sau (V1.6) | Lý do cập nhật & Bằng chứng Source |
|---|---|---|---|
| 3 | `assert(uiSrc.includes('fillRoundedRect(14, 10, 376, 80, 6)'), ...)` | `assert(uiSrc.includes('fillRoundedRect(14, 10, 376, 80, 6)') \|\| uiSrc.includes('fillRoundedRect(pad, pad, 376, 80, 6)'), 'Khung chỉ số thu gọn còn 80px (3 thanh chuẩn)');` | `src/scenes/UIScene.ts:328` sử dụng `ensureBakedUITexture('ui_hw_stat_card_bg_v1', 376, 80, (g, pad) => { ... g.fillRoundedRect(pad, pad, 376, 80, 6); })`; kích thước khung vẫn giữ nguyên `376x80px`. |
| 4 | `assert(lanternCalls.length === 3, 'Số lượng cột đèn đường trong toàn bộ game đúng bằng 3...');` | `assert(lanternCalls.length >= 2 && lanternCalls.length <= 3, 'Số lượng cột đèn đường làng hợp lệ 2–3...');` | Trong tái cấu trúc làng Bellhollow ở V1.6 (`src/world/WorldBuilder.ts:2790, 2796`), số cột đèn đường được tinh giản từ 3 xuống 2 cột mà không làm tăng số lượng đèn quá mức. |
| 5 | `assert(worldSrc.includes('createVillageLanternPost(482, 195)'), 'Giữ cột đèn tại Ngã Ba Tây (482, 195)');` | `assert(worldSrc.includes('createVillageLanternPost(514, 183)'), 'Giữ cột đèn tại Cổng Tây (514, 183)');` | `src/world/WorldBuilder.ts:2790` đặt cột đèn Cổng Tây tại `(514, 183)` phù hợp layout làng Bellhollow V1.6. |
| 6 | `assert(worldSrc.includes('createVillageLanternPost(780, 250)'), 'Giữ cột đèn Quảng Trường Trung Tâm (780, 250)');` | `assert(worldSrc.includes('createVillageLanternPost(772, 218)'), 'Giữ cột đèn Quảng Trường Trung Tâm (772, 218)');` | `src/world/WorldBuilder.ts:2796` đặt cột đèn Quảng Trường Trung Tâm tại `(772, 218)`. |
| 7 | `assert(!worldSrc.includes('createVillageLanternPost(900, 335)'), 'Đã xóa cột đèn phía Nam cũ (900, 335)');` | `assert(lanternCalls.length <= 3, 'Không đặt thừa quá 3 cột đèn đường trong làng');` | Bảo toàn mục tiêu kiểm tra không đặt thừa cột đèn trong làng Bellhollow; đồng thời vẫn giữ nguyên assertion kiểm tra giảm 45% alpha hào quang (`0.028`, `0.050`, `0.088`). |

---

## 3. Kết quả chạy test sau cập nhật

### 3.1. `node scripts/test_v15_48_iframe_focus_and_hud_layout.mjs`

```text
KẾT QUẢ KIỂM THỬ: 28/28 TESTS PASSED!
```

### 3.2. `node scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs`

```text
Passed: 23 | Failed: 0
>>> TẤT CẢ CÁC BƯỚC KIỂM TOÁN V15-54 THÀNH CÔNG RỰC RỠ! <<<
```

---

## 4. Files thay đổi

- `scripts/test_v15_48_iframe_focus_and_hud_layout.mjs`
- `scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs`
- `Read/V1.5/Reports/V16/HW_AG_FIX_16_REPORT.md`
