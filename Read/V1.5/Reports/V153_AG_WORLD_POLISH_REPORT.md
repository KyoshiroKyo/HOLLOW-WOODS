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
- Dừng tác vụ QUEUE 02A tại đây theo đúng chỉ thị, chờ phê duyệt của Project Owner trước khi chuyển sang QUEUE tiếp theo.
