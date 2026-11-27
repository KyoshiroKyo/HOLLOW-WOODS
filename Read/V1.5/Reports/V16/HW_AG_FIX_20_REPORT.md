# HW-AG-FIX-20 — OUTER WOODS DECORATION RENDERING REPORT

**Project:** HOLLOW WOODS V1.6.1\
**Branch:** `feat/v1.6-competition-preview`\
**Priority:** P1\
**Status:** VERIFIED — NO LOCAL RENDERING/CULLING BUG REPRODUCED (0 Code Edits)

---

## 1. Kết quả tái hiện & kiểm tra trên Runtime (High / Medium / Low)

Đã chạy kiểm thử Playwright trên bản build hiện tại (`?dev=1`) tại hai phân khu **`outer_woods`** (Rừng Ngoại Vi) và **`sub_bell_workshop`** (Xưởng Chuông Bỏ Hoang) qua 4 trạng thái: **đứng yên → di chuyển (`WASD`) → chuyển vùng (`outer_woods` → `sub_bell_workshop`) → quay lại `outer_woods`**, trên cả 3 cấu hình đồ họa **`HIGH`**, **`MEDIUM`** và **`LOW`**.

| Cấu hình | Phân khu | Tổng Image | `dummy_transparent` | `__MISSING` | Bị cull sai trong camera | Vật thể tĩnh dịch chuyển | Console Errors |
|---|---|---:|---:|---:|---:|---:|---:|
| **HIGH** | `outer_woods` | 70 | 0 | 0 | 0 | **0** *(chỉ 7 lớp sương `fog_smooth` + 1 `the_echo` có tween dao động chủ đích)* | 0 |
| **HIGH** | `sub_bell_workshop` | 5 | 0 | 0 | 0 | **0** | 0 |
| **HIGH** | `outer_woods` (quay lại) | 70 | 0 | 0 | 0 | **0** | 0 |
| **MEDIUM** | `outer_woods` | 70 | 0 | 0 | 0 | **0** | 0 |
| **MEDIUM** | `sub_bell_workshop` | 5 | 0 | 0 | 0 | **0** | 0 |
| **MEDIUM** | `outer_woods` (quay lại) | 70 | 0 | 0 | 0 | **0** | 0 |
| **LOW** | `outer_woods` | 70 | 0 | 0 | 0 | **0** | 0 |
| **LOW** | `sub_bell_workshop` | 5 | 0 | 0 | 0 | **0** | 0 |
| **LOW** | `outer_woods` (quay lại) | 70 | 0 | 0 | 0 | **0** | 0 |

---

## 2. Phân tích kỹ thuật

1. **Texture Key & Atlas:**\
   - Toàn bộ 70 Image trong `outer_woods` và 5 Image trong `sub_bell_workshop` (cùng nền baked `outer_woods_ground_baked_v15` và `sub_bell_workshop_ground_baked_v15`) đều nạp đúng texture thật (`dummy_transparent = 0`, `__MISSING = 0`).
2. **Tọa độ & Dịch chuyển bất thường:**\
   - Toàn bộ 62 vật thể tĩnh trong `outer_woods` (cây, bụi rậm, đá, biển chỉ dẫn, trạm kiểm lâm, hàng rào, decal) và 5 vật thể trong `sub_bell_workshop` giữ nguyên tọa độ thế giới (`scrollFactor = 1.0`, `moved = 0`).\
   - Các đối tượng duy nhất có tọa độ thay đổi nhẹ (`12–20px`) là 7 dải sương mù ranh giới `createOuterWoodsBoundaryFog()` (`WorldBuilder.ts:5965-6012`, texture `hollow_props_atlas` / `fog_smooth` tại `(1560,640)`, `(1570,790)`, `(1560,940)`, `(1200,1010)`, `(1380,1015)`, `(1500,1010)`, `(1470,870)`) với tween `Sine.easeInOut` trôi ngang có chủ đích, và `the_echo` tại `(1480,840)` nhấp nhô nhẹ theo trục Y.
3. **Camera Culling (`CullingOptimizationModule`):**\
   - `updateCameraCulling(camera)` sử dụng biên an toàn `margin = 160px` (`WorldBuilder.ts:8248`) và không ẩn nhầm bất kỳ họa tiết nào trong khung nhìn, kể cả sau khi `hibernateDistantZoneObjects` và quay lại `outer_woods`.
4. **Ghi chú về mật độ họa tiết `sub_bell_workshop`:**\
   - `WorldBuilder.ts:8023-8039` (`renderSubBellWorkshopDecorations`) hiện chỉ đặt `crafting_bench` `(b.x+220, b.y+177)`, `rock_large_mossy_v14` `(b.x+320, b.y+193)`, `runed_iron_part`, trang nhật ký và `lampGfx` trên nền `sub_bell_workshop_ground_baked_v15` — không có lỗi mất render, mà thiết kế gốc vốn ít đạo cụ (việc bổ sung cảnh quan thuộc phạm vi `ENV-01`, không tự ý triển khai khi chưa được Owner duyệt).

---

## 3. Ảnh kiểm chứng (Artifacts)

- `outer_woods` (HIGH): `fix20_outer_woods_1.png`
- `sub_bell_workshop` (HIGH): `fix20_sub_bell_workshop_1.png`
- `outer_woods` (LOW): `fix20_low_ow.png`
- `sub_bell_workshop` (LOW): `fix20_low_sbw.png`
