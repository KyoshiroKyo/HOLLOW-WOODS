# HW-AG-MICRO-01-R1 — Báo Cáo Xác Minh Runtime Resource Node (`node_resin_ow_1`)

- **Project:** HOLLOW WOODS V1.6.1
- **Branch:** `feat/v1.6-competition-preview`
- **Baseline Commit:** `a29be7d1bd59cd58373f23d658997891f372535a`
- **Mode:** REFINEMENT, NOT REPLACEMENT (giữ nguyên báo cáo và bằng chứng lịch sử của `HW-AG-MICRO-01`)
- **Status:** **PASS (16/16 CDP Runtime)** — Không cần sửa source (`src/systems/InventorySystem.ts` giữ nguyên)
- **Date:** 2026-11-28

---

## 1. Mục Tiêu & Phạm Vi R1

Khắc phục thiếu sót của script `verify_micro01_hiding_overlap.mjs` ở lượt trước (kiểm tra map interactable `gather_resin_ow_1` tại `(1170, 630)` thay vì runtime node `node_resin_ow_1` của `InventorySystem` tại tọa độ mới `(1520, 595)`).

Script mới: `scripts/verify_micro01_r1_runtime_node.mjs`
Bằng chứng R1 riêng: `Read/V1.5/Reports/Evidence/HW-AG-MICRO-01-R1/`

Các điểm đã nâng cấp trong R1:
- Truy xuất trực tiếp `InventorySystem.nodes` và `getNearbyAvailableNodes(foot.x, foot.y, 65)` theo `player.getFootPosition()`.
- Kiểm tra tính khả tiếp cận (walkability) tại `(1520, 595)` bằng di chuyển `WASD` thực tế qua hệ thống va chạm (không chỉ dùng fixture teleport).
- Kiểm tra **exact active prompt**, **outline target** (thông qua `renderInteractionOutline` và `interactionOutlineGfx.commandBuffer`), **inventory delta (`+1`)**, **trạng thái depleted** theo đúng ID `node_resin_ow_1`, và **không cấp trùng** khi nhấn `E` lần 2.
- Bắt buộc fail exit code nếu có `Runtime.exceptionThrown` hoặc bất kỳ assertion nào không đạt.

---

## 2. Kết Quả Kiểm Thử (16/16 PASS, 0 Runtime Errors)

| Test Case | Loại Input | Kết Quả | Chi Tiết Quan Sát |
|---|---|---|---|
| R1-1 | Runtime inspection | PASS | `node_resin_ow_1` tồn tại tại `(1520,595)`, `itemId="res_tree_resin"`, `count=1`, `available=true`, `visible=true` |
| R1-2 | Fixture foot `(1360,620)` | PASS | `node_resin_ow_1` không nằm trong bán kính quét `65px` tại `hide_tree_ow_north` (`runtimeNodesInRange=[]`) |
| R1-3 | Fixture foot `(1360,620)` | PASS | Prompt chính xác `"[E] Ẩn nấp"`, outline trỏ đúng `hide_tree_ow_north` |
| R1-4 | Real `E` input | PASS | `isHiding=true`, prompt chuyển thành `"[E] Rời chỗ ẩn nấp"`, `res_tree_resin=0`, `hideCalls=1` |
| R1-5 | Real `E` input | PASS | Thoát ẩn nấp bằng `E` (`wasHiding=true -> isHiding=false`) |
| R1-6 | Real `E` + `W` input | PASS | Thoát ẩn nấp bằng `WASD` (`wasHiding=true -> isHiding=false`) |
| R1-7 | Fixture `(1520,650)` + real `W` hold | PASS | Nhân vật đi bộ qua va chạm tới `{"x":1512,"y":612}`, cách `node_resin_ow_1` `19px` (`<= 50px`) |
| R1-8 | Real `W` approach | PASS | Prompt chính xác `"[E] Thu thập Nhựa Cây Dính (x1)"`, outline trỏ đúng `{"x":1520,"y":595,"id":"node_resin_ow_1"}` |
| R1-9 | Real `E` input | PASS | `res_tree_resin`: `0 -> 1` (`+1`), `isNodeDepleted('node_resin_ow_1')=true`, `available=false`, `visible=false` |
| R1-10 | Real `E` input (lần 2) | PASS | Không cấp trùng (`res_tree_resin=1`), `prompt="null"` |
| R1-11 | Fixture foot `(1360,620)` | PASS | Sau khi `node_resin_ow_1` cạn, prompt tại `(1360,620)` vẫn là `"[E] Ẩn nấp"`, outline `hide_tree_ow_north` |
| R1-12 | Real `E` input | PASS | Vào ẩn nấp thành công (`isHiding=true`) sau khi `node_resin_ow_1` đã cạn |
| R1-13 | Fixture `(1170,630)` + real `E` | PASS | Map interactable `gather_resin_ow_1` hoạt động độc lập (`"[E] Thu Thập Nhựa Thông Rừng Già"`, `flag=true`, `res_tree_resin: 1 -> 3`) |
| R1-14 | Fixture foot `(1150,655)` | PASS | `hide_bush_ow_s_curve` hiển thị đúng `"[E] Ẩn nấp"`, outline `hide_bush_ow_s_curve` |
| R1-15 | Fixture foot `(1470,710)` | PASS | `quiet_forest_bonfire` hiển thị đúng `"[E] Sưởi Ấm Bên Lửa Cổ"`, không có `hiding_spot` trong tầm |
| R1-16 | Runtime monitor | PASS | `0` uncaught runtime errors |

---

## 3. Phân Biệt Fixture vs Real Input & Điểm Chưa Kiểm Thử

- **Fixture (`placeFootAt`):** Dùng để đưa chân nhân vật tới các điểm kiểm thử `(1360,620)`, `(1520,650)`, `(1170,630)`, `(1150,655)`, `(1470,710)`.
- **Real Input (`Input.dispatchKeyEvent`):** Dùng cho di chuyển `W` tiếp cận `node_resin_ow_1`, toàn bộ thao tác `E` thu thập / ẩn nấp / thoát ẩn nấp, và `W` thoát ẩn nấp.
- **Chưa kiểm thử (ngoài phạm vi R1):** Save/Load round-trip kiểm tra trạng thái depleted của `node_resin_ow_1` (dành cho QA Codex độc lập, không chạm `SaveManager`).

---

## 4. Bằng Chứng & Dọn Dẹp

- **Screenshots & Trace:** `Read/V1.5/Reports/Evidence/HW-AG-MICRO-01-R1/`
  - `micro01_r1_results.json`
  - `R1_01_hide_spot_node_available.png`
  - `R1_02_hiding_active.png`
  - `R1_03_walked_to_node_resin_ow_1.png`
  - `R1_04_after_harvest_node_resin_ow_1.png`
- **Tiến trình:** Đã tắt Vite dev server (port 5224) và Chrome CDP (port 9263).
