# HW-AG-MICRO-01 — Báo Cáo Kiểm Tra & Khắc Phục Trùng Tọa Độ Điểm Thu Nhựa Với Điểm Ẩn Nấp (`hide_tree_ow_north`)

- **Project:** HOLLOW WOODS V1.6.1
- **Branch:** `feat/v1.6-competition-preview`
- **Baseline Commit:** `7246f4b74b51f013395c123edc16f0134196f905`
- **Status:** **REPRODUCED & FIXED** (14/14 CDP Runtime PASS)
- **Date:** 2026-11-28

---

## 1. Kết Luận & Nguyên Nhân Gốc (Root Cause)

Lỗi từ báo cáo **SYNC-02** đã được **tái hiện thành công** trong runtime trước khi sửa:

1. **Phân tích `src/data/zones.json` (tĩnh):**
   - `hide_tree_ow_north` (`type: "hiding_spot"`) đặt tại `(1360, 620)`.
   - `gather_resin_ow_1` (`type: "gather"`) đặt tại `(1170, 630)` — cách 190px, không trùng.
2. **Phân tích node tài nguyên tạo tại runtime (`src/systems/InventorySystem.ts`):**
   - Trong `spawnDefaultResourceNodes()` tại `src/systems/InventorySystem.ts:108`, node `node_resin_ow_1` (`itemId: 'res_tree_resin'`, `"Nhựa Cây Dính (x1)"`) được tạo tại **chính xác tọa độ `(1360, 620)`** — trùng 100% (khoảng cách 0px) với `hide_tree_ow_north`.
3. **Hệ quả runtime trước khi sửa:**
   - Khi đứng tại `hide_tree_ow_north` `(1360, 620)` lúc chưa nhặt `node_resin_ow_1`, game hiển thị `[E] Thu thập Nhựa Cây Dính (x1)` thay vì `[E] Ẩn nấp`.
   - Nhấn `E` thu thập `res_tree_resin` (`0 -> 1`) và **không** vào trạng thái ẩn nấp (`isHiding = false`).
   - Chỉ sau khi nhặt xong `node_resin_ow_1`, prompt mới chuyển về `[E] Ẩn nấp`.

---

## 2. Thay Đổi Khắc Phục (Surgical Fix)

Chỉ sửa đúng tọa độ spawn của `node_resin_ow_1` trong `src/systems/InventorySystem.ts`:

```diff
--- a/src/systems/InventorySystem.ts
+++ b/src/systems/InventorySystem.ts
@@ -105,7 +105,7 @@ export class InventorySystem {
       // 2B. C4-12-20: Rừng Ngoại Vi (Outer Woods: x=1120..1600, y=560..1040 - Vùng tài nguyên tự do đầu game)
       { id: 'node_wood_ow_1', itemId: 'res_dry_wood', x: 1190, y: 650, count: 1 },
-      { id: 'node_resin_ow_1', itemId: 'res_tree_resin', x: 1360, y: 620, count: 1 },
+      { id: 'node_resin_ow_1', itemId: 'res_tree_resin', x: 1520, y: 595, count: 1 },
       { id: 'node_flint_ow_1', itemId: 'res_flint', x: 1300, y: 755, count: 1 },
```

**Kiểm tra khoảng cách tại tọa độ mới `(1520, 595)`:**
- Cách `hide_tree_ow_north` `(1360, 620)`: **162px** (> 65px bán kính quét).
- Cách `abandoned_ranger_outpost` `(1420, 620)`: **103px**.
- Cách `ranger_outpost_chest` `(1445, 645)`: **90px**.
- Cách `shortcut_titan_trunk_outer` `(1540, 680)`: **87px**.
- Cách `quiet_forest_bonfire` `(1470, 710)`: **125px**.

Không thay đổi quy tắc ưu tiên tương tác, `SaveManager`, colliders, boss, combat hoặc artwork.

---

## 3. Kết Quả Kiểm Chứng (Verification)

- `npx tsc --noEmit`: **PASS**
- `npm run build`: **PASS**
- `node scripts/verify_micro01_hiding_overlap.mjs`: **14/14 PASS** (0 runtime errors)

| Test Case | Kết Quả | Chi Tiết |
|---|---|---|
| A1: `gather_resin_ow_1` không trong tầm tại `(1360,620)` | PASS | `resinInRange=false` |
| A2: `hide_tree_ow_north` trong tầm tại `(1360,620)` | PASS | `hideInRange=true` |
| A3: Prompt tại chỗ ẩn nấp hiển thị ẩn nấp (không hiện nhựa) | PASS | `prompt="[E] Ẩn nấp"` |
| A4: Nhấn `E` tại `hide_tree_ow_north` vào ẩn nấp | PASS | `isHiding=true` |
| A5: Nhấn `E` tại chỗ ẩn nấp không nhặt nhầm nhựa | PASS | `resin before=0 after=0` |
| A6: `WASD` thoát ẩn nấp | PASS | `isHiding=false` |
| A7: Một lần nhấn `E` chỉ gọi `hide_player` đúng 1 lần | PASS | `hideCallCount=1` |
| B1: Thu thập nhựa `gather_resin_ow_1` hoạt động | PASS | `gathered=true, resinCount=2` |
| B2: Prompt `hide_tree_ow_north` đúng sau khi cạn nhựa | PASS | `prompt="[E] Ẩn nấp", hideInRange=true` |
| B3: Nhấn `E` ẩn nấp bình thường sau khi cạn nhựa | PASS | `isHiding=true` |
| C1: `hide_bush_ow_s_curve` `(1150,655)` trong tầm | PASS | `candidates=gather_wood_ow_1,gather_resin_ow_1,hide_bush_ow_s_curve` |
| C2: Nhấn `E` tại `hide_bush_ow_s_curve` vào ẩn nấp | PASS | `isHiding=true` |
| D1: Prompt lửa trại `(1470,710)` hiển thị đúng | PASS | `prompt="[E] Sưởi Ấm Bên Lửa Cổ"` |
| D2: Không có prompt ẩn nấp dư thừa tại khu vực lửa trại | PASS | `hideSpotsInRange=` |

**Bằng chứng lưu tại:** `Read/V1.5/Reports/Evidence/HW-AG-MICRO-01/`
- `micro01_results.json`
- `01A_at_hide_spot_resin_available.png` (`[E] Ẩn nấp` hiển thị sạch, không còn node nhựa trùng lên)
- `01B_after_E_at_hide_spot.png` (ẩn nấp thành công, prompt chuyển sang `[E] Rời chỗ ẩn nấp`)

---

## 4. Phạm Vi Chưa Kiểm Thử & Dọn Dẹp Tiến Trình

- **Chưa kiểm thử:** Điều khiển bàn phím vật lý thủ công ngoài Chrome CDP (`Input.dispatchKeyEvent`) và Save/Load round-trip cho `node_resin_ow_1` (`SaveManager` không bị chạm).
- **Tiến trình kiểm thử:** Đã đóng Vite dev server (port 5224) và Chrome CDP (port 9262) sau khi hoàn tất.
