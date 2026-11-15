# BÁO CÁO KIỂM TOÁN & SỬA CHỮA KIẾN TRÚC TILE ĐỊA HÌNH & TRÍCH XUẤT SPRITE
## HOLLOW WOODS V1.1 — GATE 2A: TERRAIN, TILESET & SPRITE EXTRACTION INTEGRITY

- **Dự án:** HOLLOW WOODS V1.1 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)
- **Thư mục làm việc:** `G:\Hollow Woods` (Đường dẫn vật lý: `G:\HOLLOW WOODS`)
- **Phiên bản:** `V1.1`
- **Nhân vật chính:** **SATYR** (`SatyrPlayer`)
- **Vai trò thực hiện:** Senior Phaser 4 Pixel Art Technical Artist & Asset Pipeline Engineer
- **Thời gian thực hiện:** 2026-11-14
- **Trạng thái Gate 2A:** **HOÀN THÀNH (100% PASS - 12/12 CHECKS)**

---

## 1. TỔNG QUAN ĐIỀU HÀNH & KẾT QUẢ SỬA CHỮA (EXECUTIVE SUMMARY)

Gate 2A tập trung xử lý toàn diện lỗi trích xuất tile địa hình nghiêm trọng **BUG-04** (Mặt đất bị thủng lỗ chỗ như bàn cờ rách trên toàn bộ bản đồ thế giới).

### Tóm tắt khiếm khuyết trước sửa chữa:
1. **Lỗi `tile_forest_grass.png` (BUG-04):**
   - Kịch bản lịch sử `step7_extract_terrain_tiles.mjs` trích xuất vùng `{ x: 0, y: 0, w: 32, h: 32 }` từ `forest_Tileset.png`.
   - Vùng tọa độ `(0, 0)` trong `forest_Tileset.png` thực chất là góc đỉnh của một bụi cây / gờ đá có đường viền răng cưa tiếp giáp với không khí.
   - Giải mã bằng `pngjs` xác nhận: File chứa **202 pixel hoàn toàn trong suốt (Alpha = 0)** chiếm **19.7%** diện tích (toàn bộ hàng đầu tiên $y=0$ và sườn trái $x=0..10$ bị rách thủng).
   - Khi `WorldBuilder.ts` sử dụng `tileSprite` để trải rộng thảm cỏ trên 4 phân khu (`fog_crossing`, `bellhollow`, `crooked_path`, `broken_bell_shrine`) ở độ sâu `depth = -100`, Phaser lặp lại tile 32×32 này hàng nghìn lần. Vì bên dưới `ground` là nền đen xóa màn hình (`0x000000`), các pixel trong suốt tạo thành một mạng lưới đốm đen và ô cờ thủng lỗ chỗ phá hủy hoàn toàn mỹ thuật u ám của khu rừng.
2. **Lỗi tiềm ẩn `tile_swamp_mud.png`:**
   - Kịch bản cũ trích xuất `{ x: 0, y: 160, w: 32, h: 32 }` từ `forest_Tileset.png`.
   - Vùng `(0, 160)` là mép trái của vùng đầm lầy, chứa **100 pixel hoàn toàn trong suốt (Alpha = 0)** chiếm **9.8%** diện tích. Khi lát tại phân khu `silent_mire`, mặt bùn lầy cũng xuất hiện các vệt thủng đen lặp lại.

### Kết quả sau khi thực thi Gate 2A:
1. **Khắc phục triệt để BUG-04 trên `tile_forest_grass.png`:**
   - Chuyển nguồn trích xuất sang gói tileset chuẩn đã duyệt bản quyền: `TX Tileset Grass.png` (256×256 px) từ tác giả Cainos.
   - Trích xuất ô cỏ nguyên sinh liền mạch tại tọa độ `{ x: 32, y: 0, w: 32, h: 32 }`.
   - Kết quả giải mã: Kích thước 32×32 px, **0 pixel trong suốt (100% Opaque)**, độ lệch biên tiếp giáp (Edge Delta) Left-Right = 0.00, Top-Bottom = 0.00 (liền mạch hoàn hảo tuyệt đối).
2. **Khắc phục triệt để lỗi trên `tile_swamp_mud.png`:**
   - Điều chỉnh tọa độ trích xuất trong `forest_Tileset.png` từ `(0, 160)` sang ô bùn khối bên trong tại `{ x: 96, y: 160, w: 32, h: 32 }`.
   - Kết quả giải mã: Kích thước 32×32 px, **0 pixel trong suốt (100% Opaque)**, độ lệch biên tiếp giáp Left-Right = 0.00, Top-Bottom = 0.00.
3. **Kiểm định toàn bộ 5 tile địa hình mặt đất:**
   - `tile_forest_grass.png` (32×32): 0 px trong suốt (100% Opaque).
   - `tile_dirt_trail.png` (32×32): 0 px trong suốt (100% Opaque).
   - `tile_swamp_mud.png` (32×32): 0 px trong suốt (100% Opaque).
   - `tile_cobble_road.png` (16×16): 0 px trong suốt (100% Opaque).
   - `tile_stone_floor.png` (16×16): 0 px trong suốt (100% Opaque).
   - **Tổng số pixel trong suốt trên toàn bộ hệ thống mặt đất = 0 (100% Opaque).**
4. **Kiểm toán Sprite & Chân dung NPC:**
   - Cả 3 NPC (`npc_garth.png`, `npc_edda.png`, `npc_neris.png`) đạt chuẩn 64×64 px, có bóng đổ gót chân, hàng đáy không bị đứt xén (bottom row = 0 pixel đứt ngọn).
5. **Xác thực toàn diện:** TypeScript (`tsc --noEmit`) đạt 0 lỗi, build Vite đạt 0 lỗi, script kiểm toán 12/12 tiêu chí PASS.

---

## 2. BẰNG CHỨNG FORENSIC VỀ KHIẾM KHUYẾT BAN ĐẦU (ORIGINAL DEFECT EVIDENCE)

### 2.1. Phân tích Pixel thực tế của `tile_forest_grass.png` lỗi cũ:
- **Kích thước:** 32 × 32 px (Tổng 1024 pixel).
- **Pixel đục hoàn toàn (Alpha = 255):** 822 pixel (80.3%).
- **Pixel trong suốt hoàn toàn (Alpha = 0):** **202 pixel (19.7%)**.
- **Màu sắc chủ đạo:**
  * `#a3b315` (163, 179, 21): 704 pixel (Màu cỏ sáng).
  * `Alpha = 0` (0, 0, 0, 0): **202 pixel (Lỗ thủng)**.
  * `#70801a` (112, 128, 26): 74 pixel.
  * `#7a3f20` (122, 63, 32): 29 pixel.
  * `#4b4317` (75, 67, 23): 11 pixel.

### 2.2. Bản đồ phân bố pixel lỗi cũ (Lưới ASCII 32×32):
*Ký hiệu: `.` = Pixel trong suốt (Alpha = 0), `#` = Cỏ sáng, `+` = Cỏ đậm, `o` = Khác.*
```
00: ................................  <-- Toàn bộ hàng 00 là không khí trống rỗng!
01: ...................#............
02: ..............#...###....#.#..#.
03: .............##.###+#o...###.##+
04: .....#.#....##+##+oooo#.+##+##o+
05: ..#.##o##..##++#+##oo###++#++o+#
06: ..##+o.oo.##########+++####+####
07: .#+#o...#.o++########+##########
08: ..oo..#.##.o++###########++++###
09: ......##+#..o###########+#+#####
10: .....#+#o#.#####################
11: ....##oo########################
12: ..#.#+++########################
13: .###++#+++######################
14: .+######+#######################
15: .oo+############################
16: ...o+###########################
17: ....o###########################
18: .....o++#+######################
19: ...#.##++#+#####################
20: ..##############################
21: ..ooo+++########################
22: ...ooo##########################
23: ...#o+##########################
24: .#.#####+#+#####################
25: #####o+#+oo#+###################
26: .++oooo##+o+####################
27: ......##########################
28: ..#.#.##+#######################
29: .######+++######################
30: ###+###+#+######################
31: .oo++###########################
```

Khi được lặp lại vô tận bằng `tileSprite` trong Phaser:
- Mỗi 32 pixel theo trục Y xuất hiện một đường rãnh đen nằm ngang dày 1–2 px xuyên suốt toàn màn hình.
- Mỗi 32 pixel theo trục X xuất hiện các khóm đốm đen lởm chởm.
- Đây chính là nguyên nhân trực tiếp của hiện tượng "bàn cờ rách đen" được báo cáo trong Gate 0.

---

## 3. BẢNG ĐỐI CHIẾU NGUỒN TÀI NGUYÊN & TỌA ĐỘ TRÍCH XUẤT

```
========================================================================================================
                          MA TRẬN TRÍCH XUẤT TILE ĐỊA HÌNH TRƯỚC VÀ SAU SỬA CHỮA
========================================================================================================
Tile Name               Trước Gate 2A (LỖI)                  Sau Gate 2A (ĐÃ KHẮC PHỤC)           Trạng thái
────────────────────────────────────────────────────────────────────────────────────────────────────────
tile_forest_grass.png   forest_Tileset (0, 0, 32, 32)        TX Tileset Grass (32, 0, 32, 32)     100% Opaque
                        202 px Alpha=0 (19.7% thủng)         0 px Alpha=0 (Liền mạch 0.00 delta)  ✅ PASS
────────────────────────────────────────────────────────────────────────────────────────────────────────
tile_swamp_mud.png      forest_Tileset (0, 160, 32, 32)      forest_Tileset (96, 160, 32, 32)     100% Opaque
                        100 px Alpha=0 (9.8% thủng)          0 px Alpha=0 (Liền mạch 0.00 delta)  ✅ PASS
────────────────────────────────────────────────────────────────────────────────────────────────────────
tile_dirt_trail.png     forest_Tileset (96, 0, 32, 32)       forest_Tileset (96, 0, 32, 32)       100% Opaque
                        0 px Alpha=0                         0 px Alpha=0 (Bảo toàn nguyên bản)   ✅ PASS
────────────────────────────────────────────────────────────────────────────────────────────────────────
tile_cobble_road.png    castle_cobble_road (0, 0, 16, 16)    castle_cobble_road (0, 0, 16, 16)    100% Opaque
                        0 px Alpha=0                         0 px Alpha=0 (Bảo toàn nguyên bản)   ✅ PASS
────────────────────────────────────────────────────────────────────────────────────────────────────────
tile_stone_floor.png    castle_stone_floor (0, 0, 16, 16)    castle_stone_floor (0, 0, 16, 16)    100% Opaque
                        0 px Alpha=0                         0 px Alpha=0 (Bảo toàn nguyên bản)   ✅ PASS
========================================================================================================
```

---

## 4. PHƯƠNG PHÁP KIỂM TRA ĐỘ LIỀN MẠCH BIÊN TIẾP GIÁP (SEAMLESS EDGE CONTINUITY)

Để đảm bảo các tile khi được ghép cạnh nhau (tiling) không xuất hiện đường viền nối gượng gạo hay đứt gãy điểm ảnh, công thức tính toán độ lệch viền tiếp giáp toán học được áp dụng:

### 4.1. Độ lệch biên Trái - Phải (Left-Right Delta):
$$\Delta_{\text{LR}} = \frac{1}{H} \sum_{y=0}^{H-1} \left( |R_{0, y} - R_{W-1, y}| + |G_{0, y} - G_{W-1, y}| + |B_{0, y} - B_{W-1, y}| \right)$$

### 4.2. Độ lệch biên Trên - Dưới (Top-Bottom Delta):
$$\Delta_{\text{TB}} = \frac{1}{W} \sum_{x=0}^{W-1} \left( |R_{x, 0} - R_{x, H-1}| + |G_{x, 0} - G_{x, H-1}| + |B_{x, 0} - B_{x, H-1}| \right)$$

### Kết quả kiểm định thực nghiệm:
- **`tile_forest_grass.png` mới:** $\Delta_{\text{LR}} = 0.00$, $\Delta_{\text{TB}} = 0.00$ (Khớp điểm ảnh tuyệt đối ở 4 cạnh).
- **`tile_swamp_mud.png` mới:** $\Delta_{\text{LR}} = 0.00$, $\Delta_{\text{TB}} = 0.00$ (Khớp điểm ảnh tuyệt đối ở 4 cạnh).

---

## 5. BẰNG CHỨNG THỊ GIÁC (VISUAL EVIDENCE)

Sơ đồ đối chiếu Before/After và bản đồ mô phỏng in-game 4×4 đã được tạo tại:
`Read/V1.1/Reports/REMEDIATION/evidence_terrain_repaired.png`

![Bằng chứng thị giác Gate 2A](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_terrain_repaired.png)

### Bố cục hình học trên ảnh bằng chứng 1280×720:
- **Khối 1 (Góc trên bên trái):** So sánh trực tiếp `tile_forest_grass.png` Before (phóng to 6×, hiện rõ lưới ô cờ đen do 202 pixel Alpha=0) vs After (cỏ xanh mịn màng, 100% opaque từ `TX Tileset Grass`).
- **Khối 2 (Góc dưới bên trái):** So sánh trực tiếp `tile_swamp_mud.png` Before (rách mép trái 100 px Alpha=0) vs After (bùn rêu nước đầm lầy liền mạch từ `forest_Tileset`).
- **Khối 3 (Góc trên bên phải):** Mô phỏng ghép bản đồ thực tế `tileSprite` 4×4 ô (256×256 px). Bên trái là thế giới cũ chằng chịt mắt lưới đen; bên phải là thế giới mới xanh mướt, liền mạch, đồng nhất.
- **Khối 4 (Góc dưới bên phải):** Contact Sheet của toàn bộ 5 tile địa hình với khung xác nhận đạt chuẩn 100% PASS.

---

## 6. KIỂM TOÁN BẢN QUYỀN TÀI NGUYÊN (ASSET PROVENANCE AUDIT)

Tuân thủ nghiêm ngặt quy định không sử dụng tài nguyên trôi nổi hoặc không rõ bản quyền:
1. **`TX Tileset Grass.png` (256×256 px):**
   - Thuộc gói **Pixel Art Top Down – Basic v1.2.3** của tác giả **Cainos** (itch.io).
   - Đã được phê duyệt trong danh mục `Read/V3.0/Asset_Registry/ASSET_LICENSES.md` mục 2.2 (#1).
   - Giấy phép: *Cainos Standard Asset License* (Cho phép sử dụng tự do trong game 2D thương mại và phi thương mại).
2. **`forest_Tileset.png` (128×240 px):**
   - Thuộc gói **TopDownFantasy Forest v1** của tác giả **Cainos** (itch.io).
   - Đã được phê duyệt trong `ASSET_LICENSES.md` mục 2.2 (#3).
3. **`castle_cobble_road.png` & `castle_stone_floor.png` (16×16 px):**
   - Thuộc gói **Pixel Castle Medieval Tileset v1.0** của tác giả **Cainos** (itch.io).
   - Đã được phê duyệt trong `ASSET_LICENSES.md` mục 2.2 (#2).
- **Kết luận bản quyền:** **100% tài nguyên có nguồn gốc pháp lý minh bạch, không có bất kỳ rủi ro bản quyền nào (Zero Unresolved Asset Provenance).**

---

## 7. KẾT QUẢ XÁC MINH KỸ THUẬT & KIỂM THỬ TỰ ĐỘNG

### 7.1. Kiểm tra biên dịch TypeScript
```powershell
npx tsc --noEmit
# Mã trả về: 0 (Zero errors)
```

### 7.2. Kiểm tra đóng gói sản phẩm Vite
```powershell
npm run build
# Mã trả về: 0 (✓ built in 5.66s)
# Output: dist/index.html (1.06 kB), dist/assets/index-Bh9vv2vc.js (1,811.60 kB)
```

### 7.3. Kết quả kịch bản kiểm toán tự động (`scripts/verify_gate_2a.mjs`)
```
==================================================================
   HOLLOW WOODS V1.1 - GATE 2A ARCHITECTURAL VERIFICATION SCRIPT
==================================================================

[PASS] Source Tileset Provenance & Dimensions
       -> TX Tileset Grass: 256x256 | forest_Tileset: 128x240
[PASS] BUG-04 Remediated: tile_forest_grass.png (32x32) 100% Opaque
       -> Kích thước: 32×32 px, Pixel trong suốt: 0 (0.0%) [Đã sửa triệt để 202 px trong suốt lỗi cũ]
[PASS] tile_forest_grass.png Seamless Edge Continuity
       -> Độ lệch biên: Left-Right = 0.00, Top-Bottom = 0.00 (Liền mạch hoàn hảo)
[PASS] tile_swamp_mud.png (32x32) 100% Opaque
       -> Kích thước: 32×32 px, Pixel trong suốt: 0 (0.0%) [Đã sửa triệt để 100 px trong suốt lỗi cũ]
[PASS] tile_swamp_mud.png Seamless Edge Continuity
       -> Độ lệch biên: Left-Right = 0.00, Top-Bottom = 0.00 (Liền mạch hoàn hảo)
[PASS] Road & Trail Tiles Dimension & Opacity
       -> dirt_trail (32x32), cobble_road (16x16), stone_floor (16x16) đầy đủ và hợp lệ
[PASS] Zero Transparent Pixels Across All 5 Terrain Tiles
       -> Tổng số pixel trong suốt = 0 trên toàn bộ 5 tile mặt đất
[PASS] Extraction Script (step7) References TX Tileset Grass
       -> Cắt tile cỏ chuẩn từ TX Tileset Grass (32, 0) và tile bùn liền mạch từ forest_Tileset (96, 160)
[PASS] PreloadScene Registers All 5 Terrain Tiles
       -> Toàn bộ 5 khóa texture TILE_* được nạp đường dẫn hợp lệ
[PASS] WorldBuilder Correctly Renders Terrain Using TileSprite
       -> WorldBuilder trải thảm cỏ và bùn lầy qua tileSprite với độ sâu -100
[PASS] NPC Sprites Dimensions & Grounding Integrity
       -> Cả 3 NPC chuẩn 64×64 px, có bóng đổ gót chân, hàng đáy không bị đứt xén
[PASS] Gate 2A Visual Evidence File Exists
       -> evidence_terrain_repaired.png tồn tại (35100 bytes)

==================================================================
VERIFICATION RESULT: 12/12 CHECKS PASSED
==================================================================
>>> ALL GATE 2A ARCHITECTURAL & ASSET CHECKS COMPLETED WITH 100% SUCCESS <<<
```

---

## 8. KẾT LUẬN & DỪNG LẠI (STOP)

- **Kết luận:** Toàn bộ nhiệm vụ của **GATE 2A** đã hoàn thành đạt chất lượng cao nhất. Lỗi BUG-04 được giải quyết tận gốc, toàn bộ bề mặt thế giới của HOLLOW WOODS V1.1 trở nên liền mạch, không còn bất kỳ ô cờ đen hay điểm ảnh trong suốt lỗi nào.
- **Tuân thủ quy định:**
  - Không thay đổi animation của Satyr.
  - Không chỉnh sửa hệ thống thoại, chế tạo, sổ tay, pause.
  - Không commit hay push lên Git từ xa.
  - **DỪNG LẠI TẠI ĐÂY (STOP). Không tự ý chuyển sang Gate 2B.**

