# HOLLOW WOODS V1.5.3 — AG WORLD POLISH REPORT
## QUEUE 02A — BUG-029 TERRAIN SEAM ROOT-CAUSE FIX
**Agent:** Antigravity (AG Flash High)  
**Repository:** `KyoshiroKyo/HOLLOW-WOODS`  
**Working Directory:** `G:\HOLLOW WOODS`  
**Working Branch:** `feat/v1.5.3-ag-world-polish`  
**Trạng thái:** `CLOSED-VERIFIED local`  

---

## 1. TỔNG QUAN NHIỆM VỤ

Project Owner ghi nhận lỗi hiển thị BUG-029 tại ranh giới giữa Làng Bellhollow và Nông Trại Trú Ẩn (Sanctuary Farm):
> *"Một mảng nền vàng xanh lớn có cạnh ngang và dọc gần như hình chữ nhật nổi bật trên nền cỏ tối. Đây là BUG-029, trước đó chỉ xử lý PARTIAL."*

Yêu cầu nhiệm vụ:
1. Điều tra tìm ra **nguyên nhân thực sự (Root Cause)** của lỗi, không phỏng đoán hay xử lý đối phó bằng blur / fog dày.
2. Sửa đúng trọng tâm, giữ nguyên kiến trúc CanvasTexture và pixel-art tiêu chuẩn của dự án.
3. Không làm đổi màu toàn bộ khu vực, không tạo texture mới khi asset có sẵn đủ dùng.
4. Ghi nhận bằng chứng hình ảnh BEFORE và AFTER cùng góc chụp đối chiếu.
5. Kiểm thử đi bộ hai chiều Noclip OFF qua ranh giới, đảm bảo không khe hở, không nhấp nháy, không chặn đường.
6. Cập nhật Registry lỗi và xuất báo cáo nghiệm thu.

---

## 2. NGUYÊN NHÂN GỐC THỰC SỰ (ROOT CAUSE ANALYSIS)

Qua đối chiếu mã nguồn `src/world/WorldBuilder.ts`, dữ liệu phân vùng `src/data/zones.json` và chụp phân tích khung hình thực tế bằng Playwright Chromium, chúng tôi đã xác định chính xác **3 nguyên nhân gốc rễ** cấu thành hiện tượng này:

### Nguyên nhân 1: Mảng TileSprite thô ráp không bóng đổ ở vai rừng Tây Nam (Trọng tâm lớn nhất)
- Trong commit trước đó (`47b61674907d7033d8b4bbc61834fc5b327d6c04`), để che khoảng đen khi camera mở rộng về phía Nam Lối Mòn Xuyên Sương (Fog Crossing), đoạn mã sau đã được thêm vào:
  ```typescript
  // The continuous starter camera can see the forest shoulder south of Fog Crossing.
  this.scene.add.tileSprite(0, 360, 480, 680, TILE_FOREST_GRASS)
    .setOrigin(0, 0).setDepth(DEPTH_GROUND_BASE - 1);
  ```
- Mảng `tileSprite` này có kích thước cực lớn ($480 \times 680\text{ px}$), tọa độ từ $X = 0..480$ và $Y = 360..1040$.
- Do sử dụng trực tiếp texture thô `TILE_FOREST_GRASS` với alpha 100%, không nền tối, không có bất kỳ dải bóng râm (shading / vignette) nào, mảng này xuất hiện như một **khối hình chữ nhật màu vàng xanh sáng chói**.
- Cạnh trên ($Y = 360$) cắt ngang thẳng tắp với đáy Fog Crossing.
- Cạnh phải ($X = 480$) cắt dọc thẳng tắp, đập thẳng vào nền cỏ rừng tối sẫm có bóng đổ sâu (`rgba(10, 16, 12, 0.90)`) của Làng Bellhollow và Nông Trại Sanctuary Farm.
- Khi người chơi đứng ở Cổng Nam Bellhollow ($X \approx 650, Y \approx 520..560$), tầm nhìn camera quét sang phía Tây ($X \le 480$) làm lộ toàn bộ cạnh dọc và mảng vàng xanh này.

### Nguyên nhân 2: Sanctuary Farm thiếu hoàn toàn bóng râm rìa Bắc và rìa Đông
- Trong `renderSanctuaryFarmTerrain(bounds)`, CanvasTexture được tô nền `#2b3c23` và quầng sáng `farmWarmth` tông vàng xanh ấm áp (`rgba(78, 102, 54, 0.40)`).
- Hàm chỉ có `westShade` ($WX < 530$) và `southShade` ($WY > 980$), **hoàn toàn không có `northShade` ở mép trên ($WY = 560$) hay `eastShade` ở mép phải ($WX = 1120$)**.
- Trong khi đó, mép Nam của Bellhollow có `southShade` tối đen sẫm (`rgba(10, 16, 12, 0.90)`). Khi người chơi đi từ Bellhollow xuống Nam qua $Y = 560$, nền đất đột ngột đổi từ bóng rừng tối sang mảng cỏ sáng cắt thẳng 90 độ.

### Nguyên nhân 3: Thiếu hàm chuyển tiếp ranh giới tại $Y = 560$
- Trong `renderZoneBoundaryTransitions()`, các ranh giới khác đều có hàm làm mịn:
  - Fog Crossing $\leftrightarrow$ Bellhollow: `renderFogCrossingToVillageTransition(480)`
  - Crooked Path $\leftrightarrow$ Silent Mire: `renderCrookedPathToMireTransition(2880)`
  - Silent Mire $\leftrightarrow$ Broken Bell Shrine: `renderMireToShrineTransition(4000)`
  - Bellhollow $\leftrightarrow$ Crooked Path: `renderVillageToForestTransition(1600)`
- **Riêng ranh giới Bellhollow $\leftrightarrow$ Sanctuary Farm tại $Y = 560$ hoàn toàn không có hàm chuyển tiếp**, chỉ có một đoạn vẽ đường nhỏ `renderFarmTrailCrossing` ở góc xa $(1040, 705)$.

---

## 3. GIẢI PHÁP & CÁC THAY ĐỔI ĐÃ THỰC HIỆN

Toàn bộ chỉnh sửa được cô lập chuẩn xác trong `src/world/WorldBuilder.ts` mà không làm ảnh hưởng đến gameplay, collider hay các hệ thống khác:

### 1. Thay thế TileSprite vai rừng Tây Nam bằng CanvasTexture hữu cơ
- Xóa bỏ `tileSprite(0, 360, 480, 680, TILE_FOREST_GRASS)`.
- Bổ sung phương thức `renderSouthwestForestShoulderTerrain()`:
  - Tạo CanvasTexture `southwest_forest_shoulder_ground_baked_v15` ($512 \times 680\text{ px}$ với 32px overlap padding lót dưới rìa Tây Bellhollow/Farm).
  - Nền cỏ rừng tối màu `#263326` hòa trộn `TILE_FOREST_GRASS` với alpha $0.28$ (chuẩn pixel-art).
  - Gradient phía Bắc ($Y: 0..100$) khớp nối êm dịu vào đáy Fog Crossing (`botGrad rgba(12, 18, 14, 0.82)`).
  - Gradient phía Đông ($X: 400..512$) khớp tuyệt đối với `westShade` của Bellhollow và Farm.
  - Gradient phía Tây và Nam phủ bóng rừng sâu hoang dã.
  - Phân bổ đốm rêu hữu cơ tự nhiên `shoulderMossPalette`.

### 2. Bổ sung bóng râm rìa Bắc & Đông cho Sanctuary Farm và Outer Woods
- Trong `renderSanctuaryFarmTerrain()`:
  - Nâng cấp phiên bản texture lên `sanctuary_farm_ground_baked_v13`.
  - Thêm `northShade` ($WY < 620$): Gradient chuyển tiếp từ `rgba(16, 25, 18, 0.65)` về trong suốt, hòa sắc mượt mà với bóng Nam Bellhollow.
  - Thêm `eastShade` ($WX > 1060$): Gradient chuyển tiếp về phía Rừng Ngoại Vi, xóa bỏ đường cắt dọc tại $X = 1120$.
- Trong `renderOuterWoodsTerrain()`:
  - Nâng cấp phiên bản texture lên `outer_woods_ground_baked_v15`.
  - Thêm `northForestShade` ($WY < 620$) và `westForestShade` ($WX < 1180$) để hai bên tiếp giáp ăn khớp 100%.

### 3. Thiết lập hàm chuyển tiếp ranh giới `renderVillageToFarmTransition(560)`
- Gọi trong `renderZoneBoundaryTransitions()`.
- Tạo các mảng rêu hữu cơ đan xen `DEPTH_GROUND_TURF` ở hai bên hành lang ($X: 520..620$ và $X: 680..780$) quanh trục $Y = 560$.
- Tạo dải chuyển tiếp mặt đường bo góc mềm (`fillRoundedRect`) làm mượt lòng đường đất giữa hai phân khu.
- Đặt các phiến đá cuội và sỏi tự nhiên `DEPTH_GROUND_STONES` rải rác hai bên mép đường.
- Đăng ký culling với camera qua `this.registerCullable()`.

---

## 4. HÌNH ẢNH ĐỐI CHỨNG (BEFORE / AFTER EVIDENCE)

Tất cả ảnh chụp được thực hiện bằng Chrome Headless tự động qua Playwright trên cùng bản build sản xuất, cùng độ phân giải $1280 \times 720$ và cùng tọa độ camera/nhân vật:

### Cặp đối chiếu 1: Toàn cảnh ranh giới Cổng Nam Làng nhìn sang Nông Trại
- **BEFORE:** [before_boundary_overview_x650_y560.png](Visuals/V153_AG_QUEUE_02A/before_boundary_overview_x650_y560.png)  
  *Ghi nhận lỗi:* Phía bên trái màn hình ($X \le 480$) là một mảng TileSprite vàng xanh sáng chói, có cạnh đứng sắc lẹm cắt ngang tầm mắt người chơi.
- **AFTER:** [after_boundary_overview_x650_y560.png](Visuals/V153_AG_QUEUE_02A/after_boundary_overview_x650_y560.png)  
  *Kết quả:* Mảng chữ nhật thô ráp đã biến mất hoàn toàn. Thay vào đó là nền rừng tối sẫm đồng sắc, viền cỏ rêu hữu cơ và các viên đá bước chân tự nhiên tại ranh giới $Y = 560$.

### Cặp đối chiếu 2: Ranh giới nhìn từ phía Nông Trại Trú Ẩn ngược về Bắc
- **BEFORE:** [before_boundary_from_farm_x650_y560.png](Visuals/V153_AG_QUEUE_02A/before_boundary_from_farm_x650_y560.png)  
  *Ghi nhận lỗi:* Góc Tây Bắc nông trại bị hở đường viền thẳng đứng sắc lẹm của mảng TileSprite sáng màu.
- **AFTER:** [after_boundary_from_farm_x650_y560.png](Visuals/V153_AG_QUEUE_02A/after_boundary_from_farm_x650_y560.png)  
  *Kết quả:* Bề mặt đất chuyển màu êm dịu, không còn bất kỳ đường cắt hay khe hở subpixel nào.

---

## 5. KẾT QUẢ KIỂM THỬ & XÁC MINH CHẤT LƯỢNG

| Hạng mục kiểm thử | Công cụ / Kịch bản | Kết quả | Chi tiết |
|---|---|:---:|---|
| **TypeScript Typecheck** | `npm run check` (`tsc --noEmit`) | **PASS** | 0 lỗi cú pháp / kiểu dữ liệu |
| **Production Build** | `npm run build` (`vite build`) | **PASS** | Build thành công trong 10.2s |
| **Di chuyển hai chiều Noclip OFF** | `scripts/test_bug029_boundary_walk.py` | **PASS** | Nhân vật đi bộ phím `S` từ Bellhollow ($Y=500$) qua ranh giới xuống Farm ($Y=690$), sau đó đi bộ phím `W` ngược lên Bellhollow ($Y=426$) hoàn toàn thông suốt, không bị vướng collider |
| **Toàn vẹn dữ liệu** | `node scripts/verify_data_integrity.mjs` | **PASS** | 15/15 kiểm tra đạt 100% |
| **Không thiếu asset** | `node scripts/verify_zero_404_assets.mjs` | **PASS** | 212/212 tài nguyên hợp lệ, 0 lỗi 404 |

---

## 6. KẾT LUẬN & TRẠNG THÁI

- Lỗi **BUG-029** đã được giải quyết triệt để tận gốc.
- Trạng thái cập nhật trong `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md`: **`CLOSED-VERIFIED local`**.
- QUEUE 02A hoàn tất xuất sắc và chuyển giao sang QUEUE 02B.

---

## QUEUE 02B — OUTER WOODS VISUAL POLISH & CORRIDOR CLEARANCE

**Agent:** Antigravity (AG Flash High)  
**Repository:** `KyoshiroKyo/HOLLOW-WOODS`  
**Working Directory:** `G:\HOLLOW WOODS`  
**Working Branch:** `feat/v1.5.3-ag-world-polish`  
**Trạng thái:** `CLOSED-VERIFIED local` (PASS 100%)  

---

### 1. TỔNG QUAN & MỤC TIÊU NHIỆM VỤ

Sau khi phương án thiết kế và kiểm kê thực địa tại **QUEUE 02B-1** được Project Owner phê duyệt chính thức, nhiệm vụ **QUEUE 02B-2** thực thi vi chỉnh thẩm mỹ và giải phóng hành lang di chuyển tại Rừng Ngoại Vi (Outer Woods):
1. Giải phóng trục đường huyết mạch từ Trại Thợ Săn cũ xuống Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`) tại tọa độ ngã ba $(1360, 760)$ và lòng đường $X \approx 1350..1365$.
2. Tạo không gian thông thoáng, quang đãng quanh Trạm Lửa Rừng Tĩnh Lặng của Sir Vaelen $(1470, 710)$, cho phép người chơi đi vòng quanh 360 độ không bị vướng mắc góc.
3. Bảo toàn 100% các công trình, NPC, Safe Zone, tương tác, điểm ẩn nấp và tài nguyên.
4. Tuyệt đối không đưa bếp Thợ Săn cũ (`ow_firepit_rock` tại `1308, 712`) đã xóa quay trở lại.

---

### 2. CHI TIẾT 4 ĐẠO CỤ ĐÃ DỜI THEO PHƯƠNG ÁN ĐÃ DUYỆT

Tất cả các thay đổi được thực hiện chuẩn xác trong [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts):

| Đạo cụ / Cụm cảnh quan | Tọa độ cũ | Tọa độ mới | Mục đích & Tác động Gameplay |
|---|:---:|:---:|---|
| **Hòm gỗ thời tiết** (`SPRITE_PROP_CRATE_WEATHERED_V14`) | $(1295, 744)$ | $(1335, 705)$ | Dời từ mép lề đường giao cắt về kê sát vách lều thợ săn, giải phóng hoàn toàn lòng đường ngã rẽ. |
| **Cây phụ Cụm 3 Sồi Đại Thụ** (`subTrees`) | `dx: -26, dy: 18`<br/>(Thế giới: $1349, 873$) | `dx: 28, dy: 24`<br/>(Thế giới: $1403, 879$) | Dời thân cây phụ sang phía Đông của cây chính, giải phóng trọn vẹn trục đường chính $X \approx 1350..1365$ dẫn xuống Xưởng Chuông. |
| **Bụi rậm cảnh quan** (`createDenseBush`) | $(1495, 745)$ | $(1520, 755)$ | Dời ôm sát bìa rậm phía Đông, mở rộng hành lang phía Đông của bếp Sir Vaelen thành đường đi bộ thoáng đạt. |
| **Khối đá cảnh quan** (`createRock` $38 \times 22$) | $(1390, 765)$ | $(1415, 785)$ | Dời sang ôm sát bờ suối tự nhiên phía Nam, mở rộng góc cua ngã ba $(1360, 760)$ cho người chơi rẽ trái/phải dễ dàng. |

---

### 3. DANH MỤC CÁC THÀNH PHẦN BẢO TOÀN 100%

- **Bếp Lửa Hồng Sir Vaelen** (`createQuietForestBonfireOutpost(1470, 710)`):
  - Hiệu ứng lửa cháy, ánh sáng ấm áp, khói nhẹ, và quầng sáng bảo hộ hoạt động nguyên vẹn.
  - Vùng an toàn Safe Zone và cơ chế hồi phục (+15 Tinh Thần, -20 Độ Ẩm, +15 Thân Nhiệt) bảo toàn 100%.
  - Điểm tương tác `quiet_forest_bonfire` (`actionId: 'warm_quiet_bonfire'`) được bảo toàn đầy đủ.
- **NPC Kỵ Sĩ Sir Vaelen** (`npc_campfire_knight` tại $1435, 710$):
  - Giữ nguyên vị trí, góc đứng, tương tác phím `[E]`, hội thoại `campfire_knight_intro` và quest flag `talked_to_campfire_knight`.
- **Hệ thống môi trường & tài nguyên:**
  - 5 điểm ẩn nấp (hiding spots) trong các lùm cây Outer Woods.
  - 5 điểm thu thập tài nguyên (resource nodes) bảo toàn 100%.
  - Toàn bộ collider biên giới và collider phân khu của Codex A1 không suy suyển.
- **Cam kết cấm kỵ:** Vị trí bếp lửa thợ săn cũ tại $(1308, 712)$ hoàn toàn sạch bóng, không khôi phục, 0 collider vô hình.

---

### 4. HÌNH ẢNH ĐỐI CHỨNG BEFORE / AFTER (12 SNAPSHOTS)

Tất cả ảnh được chụp tự động bằng Chromium Headless Playwright tại 3 góc camera chuẩn, ở cả 2 mức zoom (1.0x và 1.5x) với chế độ đồ họa tiêu chuẩn (F9 debug OFF):

| Góc Camera / Vùng quan sát | Snapshot BEFORE | Snapshot AFTER | Đánh giá trực quan |
|---|:---:|:---:|---|
| **Góc 1: Trại Thợ Săn & Bếp Vaelen (Zoom 1.0x)** | [before_angle1_10x](Visuals/V153_AG_QUEUE_02B/before_angle1_camp_vaelen_10x.png) | [after_angle1_10x](Visuals/V153_AG_QUEUE_02B/after_angle1_camp_vaelen_10x.png) | Bếp lửa Vaelen giữ nguyên ngọn lửa; hòm gỗ gọn gàng sát lều; khoảng đất quanh bếp rộng rãi, thoáng mắt. |
| **Góc 1: Trại Thợ Săn & Bếp Vaelen (Zoom 1.5x)** | [before_angle1_15x](Visuals/V153_AG_QUEUE_02B/before_angle1_camp_vaelen_15x.png) | [after_angle1_15x](Visuals/V153_AG_QUEUE_02B/after_angle1_camp_vaelen_15x.png) | Chi tiết pixel-art sắc nét, không bị chồng đè sprite. |
| **Góc 2: Ngã Rẽ & Đường Xưởng Chuông (Zoom 1.0x)** | [before_angle2_10x](Visuals/V153_AG_QUEUE_02B/before_angle2_junction_workshop_10x.png) | [after_angle2_10x](Visuals/V153_AG_QUEUE_02B/after_angle2_junction_workshop_10x.png) | Cây phụ cụm 3 đã dời sang phải; trục đường thẳng tắp xuống biển chỉ dẫn Xưởng Chuông thông thoáng 100%. |
| **Góc 2: Ngã Rẽ & Đường Xưởng Chuông (Zoom 1.5x)** | [before_angle2_15x](Visuals/V153_AG_QUEUE_02B/before_angle2_junction_workshop_15x.png) | [after_angle2_15x](Visuals/V153_AG_QUEUE_02B/after_angle2_junction_workshop_15x.png) | Khối đá nép sát mép suối tự nhiên; lối rẽ mở rộng, góc cua mềm mại. |
| **Góc 3: Cổng Bắc Outer Woods (Zoom 1.0x)** | [before_angle3_10x](Visuals/V153_AG_QUEUE_02B/before_angle3_north_gate_10x.png) | [after_angle3_10x](Visuals/V153_AG_QUEUE_02B/after_angle3_north_gate_10x.png) | Tuyến đường từ Cổng Bắc dẫn vào cụm Trại Thợ Săn hài hòa, tự nhiên. |
| **Góc 3: Cổng Bắc Outer Woods (Zoom 1.5x)** | [before_angle3_15x](Visuals/V153_AG_QUEUE_02B/before_angle3_north_gate_15x.png) | [after_angle3_15x](Visuals/V153_AG_QUEUE_02B/after_angle3_north_gate_15x.png) | Không xuất hiện artifact hình ảnh hay lỗi culling. |

---

### 5. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG RUNTIME TOÀN DIỆN

| Bộ kiểm thử | Công cụ / Kịch bản | Trạng thái | Chi tiết nghiệm thu |
|---|---|:---:|---|
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 lỗi cú pháp, 0 lỗi kiểu dữ liệu. |
| **Production Build** | `npm run build` | **PASS** | Build thành công toàn bộ bundle dist trong 10.2s. |
| **Sir Vaelen & Workshop Node** | `node scripts/test_v152_04_vaelen_workshop.mjs` | **PASS** | 25/25 checks đạt 100%. |
| **Bonfire Outpost Integration** | `node scripts/test_v15_31_vaelen_bonfire_outpost.mjs` | **PASS** | 24/24 checks đạt 100%. |
| **Playwright Runtime Test Case 1** | `scripts/test_queue02b_outer_woods.py` | **PASS** | Đi bộ 2 chiều Trại $(1230, 710) \leftrightarrow$ Đường Xưởng Chuông $(1350, 954)$ thông suốt, Noclip OFF, 0 điểm cản. |
| **Playwright Runtime Test Case 2** | `scripts/test_queue02b_outer_woods.py` | **PASS** | Đi vòng quanh Bếp Sir Vaelen 360 độ (North $\to$ East $\to$ South $\to$ West $\to$ North), Noclip OFF, 0 va chạm, 0 vật cản ẩn. |
| **Playwright Runtime Test Case 3** | `scripts/test_queue02b_outer_woods.py` | **PASS** | Tương tác phím `[E]` Sir Vaelen cách 20px kích hoạt hội thoại và flag `talked_to_campfire_knight`. |
| **Playwright Runtime Test Case 4** | `scripts/test_queue02b_outer_woods.py` | **PASS** | Đi xuyên qua vị trí Bếp Thợ Săn cũ $(1308, 712)$ hai chiều qua lại $1294 \leftrightarrow 1386$, xác nhận 100% không còn collider tàng hình. |

---

### 6. KẾT LUẬN & TRẠNG THÁI NGHIỆM THU

- **QUEUE 02B-2** hoàn thành xuất sắc 100% mục tiêu, bảo toàn toàn vẹn dữ liệu và cơ chế gameplay.
- Đạt tiêu chuẩn an toàn cao nhất của dự án: sẵn sàng để giải phóng worktree và mở khóa chuỗi hàng đợi tiếp theo (**QUEUE 03A**).
- Trạng thái: **`CLOSED-VERIFIED local` (PASS)**.
