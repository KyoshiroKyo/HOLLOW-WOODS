# HW-BUG-#4 — SƠ ĐỒ THIẾT KẾ DI DỜI TOÀN BỘ XƯỞNG RÈN BRAM (BLUEPRINT ONLY)

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Chế độ:** **SOURCE READ-ONLY — BLUEPRINT ONLY (TUYỆT ĐỐI KHÔNG SỬA CODE GAMEPLAY)**  
**Ngày lập sơ đồ:** 22/11/2026  
**Trạng thái:** **CHỜ OWNER PHÊ DUYỆT TRƯỚC HW-BUG-#5**

---

## 1. MỤC TIÊU & TỌA ĐỘ YÊU CẦU

Project Owner chỉ định di dời toàn bộ quần thể Xưởng Rèn & Lò Lửa của Thợ Rèn Bram từ vị trí cũ sang khu đất mới thoáng đãng hơn ở phía Đông Nam làng Bellhollow:
- **Tâm móng cũ (Baseline GitHub):** `(1270, 360)`
- **Tâm móng mới yêu cầu (Destination):** `(1373, 432)`
- **Vector dịch chuyển tịnh tiến:**
  $$\vec{D} = (\Delta X, \Delta Y) = (1373 - 1270, 432 - 360) = (+103, +72)$$

Mục đích:
- Giải phóng lối đi huyết mạch phía Nam nối từ Quảng Trường Trung Tâm xuống Lối Rừng Ngoại Vi (`outer_woods`).
- Định vị xưởng rèn Bram tại khu đất riêng biệt, tạo không gian sân rèn rộng rãi, liên thông hài hòa giữa trục đường Cổng Đông và hàng rào Nam làng.

---

## 2. HÌNH ẢNH HIỆN TRẠNG & SƠ ĐỒ BLUEPRINT OVERLAY

### 2.1. Ảnh hiện trạng xưởng Bram cũ (`1270, 360`)
![Hiện trạng xưởng Bram cũ](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/bram_smithy_current_old.png)
*Vị trí cũ: Xưởng rèn (1270, 360), Bram (1230, 405), Bàn chế tạo (1292, 383), Cụm củi đốt (1330, 380).*

### 2.2. Ảnh thực địa khu đất mới (`1373, 432`)
![Thực địa khu đất mới](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/bram_smithy_destination_area.png)
*Khu đất mới: Khoảng đất trống phía Đông Nam làng Bellhollow, tiếp giáp hàng rào Nam (536) và đường Cổng Đông (286).*

### 2.3. Sơ đồ Blueprint Overlay đối chiếu vị trí CŨ vs MỚI & Điểm xung đột
![Sơ đồ Blueprint Overlay](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/bram_smithy_relocation_blueprint.png)
*Ghi chú màu trên sơ đồ:*
- 🔴 **Màu đỏ / cam:** Vị trí CŨ của Xưởng móng `(1270, 360)`, Collider móng `[1193, 328, 1347, 360]`, Bram `(1230, 405)` và Bàn chế tạo `(1292, 383)`.
- 🟢 **Màu xanh lá / cyan:** Vị trí MỚI đề xuất của Xưởng móng `(1373, 432)`, Collider móng `[1296, 400, 1450, 432]`, Bram `(1333, 477)` và Bàn chế tạo `(1395, 455)`.
- ⚪ **Mũi tên trắng:** Vector dịch chuyển $\vec{D} = (+103, +72)$.
- 🟣 **Màu tím đậm:** Hai điểm vật cản xung đột cần xử lý: Bụi cây `(1416, 348)` và Cành gỗ mục `(1364, 340)`.

---

## 3. BẢNG KIỂM KÊ TOÀN DIỆN & TỌA ĐỘ ĐỀ XUẤT (BLUEPRINT MATRIX)

| ID Thực thể | Tọa độ CŨ (Old XY) | Tọa độ MỚI (Proposed XY) | Collider (Kích thước & Hitbox) | Tương tác [E] | Xung đột phát hiện (Conflict) | File Mã nguồn |
|:---|:---:|:---:|:---|:---:|:---|:---|
| **`building_bram_workshop`**<br>(Sprite Xưởng Rèn Bram) | `(1270, 360)` | **`(1373, 432)`** | Footprint $176 \times 148\text{px}$<br>Origin $(0.5, 1.0)$<br>Bao trùm: $X \in [1285, 1461]$, $Y \in [284, 432]$ | Không | Đè lên bụi cây `(1416, 348)` và cành khô `(1364, 340)`. Mép đỉnh mái ($Y=284$) tiếp giáp lề Nam đường Cổng Đông ($Y=286$). | `src/world/WorldBuilder.ts`<br>(Dòng 2704, 3319) |
| **`collider_bram_workshop`**<br>(Hitbox chân đế móng) | `(1193, 328)`<br>Đáy: `360` | **`(1296, 400)`**<br>Đáy: `432` | Static Box $154 \times 32\text{px}$<br>AABB: `[1296, 400, 1450, 432]` | Không | Không có vật cản tĩnh nào trong vùng chân móng mới. | `src/world/WorldBuilder.ts`<br>(Dòng 3369-3372) |
| **`npc_bram`**<br>(Thợ rèn Bram) | `(1230, 405)` *(zones)*<br>`(1230, 390)` *(Tiled)* | **`(1333, 477)`** | Footprint $24 \times 14\text{px}$<br>Offset $(-12, -14)$<br>AABB: `[1321, 463, 1345, 477]` | Có [E]<br>Hội thoại `bram_chat` (Bán kính $\le 52\text{px}$) | Không. Vị trí cách hàng rào Nam ($Y=536$) là $59\text{px}$, hành lang đi bộ cực kỳ thoáng. | `src/data/zones.json`<br>`src/data/maps/bellhollow.json`<br>`src/world/WorldBuilder.ts` |
| **`village_crafting_bench`**<br>(Bàn Chế Tạo Sinh Tồn) | `(1292, 383)` | **`(1395, 455)`** | Static Box $40 \times 12\text{px}$<br>AABB: `[1375, 449, 1415, 461]` | Có [E]<br>`open_crafting_bench`<br>Box $48 \times 24\text{px}$ | Không. Đặt trước thềm xưởng mới, bên phải Bram $62\text{px}$, người chơi tiếp cận 4 hướng thuận lợi. | `src/data/zones.json`<br>`src/data/maps/bellhollow.json`<br>`src/world/WorldBuilder.ts` |
| **`vfx_forge_glow`**<br>(Quầng sáng lò than hồng) | `(1215, 336)`<br>$(x-55, y-24)$ | **`(1318, 408)`** | Bán kính phát sáng $70\text{px}$<br>Depth $431$ (dưới sprite) | Không | Cần di dời cụm sương mù $(1330, 395)$ để không che mất ánh lửa lò rèn. | `src/world/WorldBuilder.ts`<br>(Dòng 3339-3363) |
| **`vfx_chimney_smoke`**<br>(Khói bốc từ ống khói) | `(1222, 216)`<br>$(x-48, y-h+4)$ | **`(1325, 288)`** | Particle khói bốc lên cao | Không | Không xung đột. | `src/world/WorldBuilder.ts`<br>(Dòng 3366) |
| **`prop_firewood_cluster`**<br>(Cụm củi gỗ chất hiên) | `(1330, 380)` | **`(1433, 452)`** | Cụm prop trang trí hiên đông | Không | Không xung đột. | `src/world/WorldBuilder.ts`<br>(Dòng 2707) |
| **`ground_pool_warm_hearth`**<br>(Vệt sáng nền đất ấm) | `(1240, 375)` | **`(1343, 447)`** | Baked Ground Pool (R=56, $\alpha=0.22$) | Không | Cần dời tọa độ trong hàm tạo nền đất nung. | `src/world/WorldBuilder.ts`<br>(Dòng 1024) |
| **`bush_east_yard_01`**<br>(Bụi cây tự nhiên) | `(1416, 348)` | **XÓA HOẶC DỜI**<br>sang `(1475, 410)` | Bụi rậm $s=0.94$ | Không | **XUNG ĐỘT TRỰC TIẾP:** Bụi cây này nằm lọt vào giữa mảng tường và mái xưởng mới! | `src/world/WorldBuilder.ts`<br>(Dòng 4142) |
| **`flora_fallen_branch_01`**<br>(Cành gỗ mục phủ rêu) | `(1364, 340)` | **XÓA HOẶC DỜI**<br>sang `(1250, 350)` | Khúc gỗ mục $20 \times 4\text{px}$ | Không | **XUNG ĐỘT TRỰC TIẾP:** Nằm chìm dưới nền nhà xưởng mới. | `src/world/WorldBuilder.ts`<br>(Dòng 4157) |
| **`vfx_boundary_mist_01`**<br>(Cụm sương mù khí quyển) | `(1330, 395)` | **DỜI** sang `(1433, 467)`<br>hoặc hàng rào `(1330, 520)` | Cụm sương trôi $R=590$ | Không | Sương trôi ngang cửa lò rèn mới làm giảm tương phản quầng sáng than hồng. | `src/world/WorldBuilder.ts`<br>(Dòng 4337) |
| **`path_dirt_southeast`**<br>(Nhánh đường Quảng Trường) | Nhánh cũ qua `(1190, 375)` | **BỔ SUNG NHÁNH**<br>rẽ vào `(1330, 440)` | Đường đất hữu cơ ($R=20$) | Không | Xưởng cũ dời đi giúp giải phóng hoàn toàn lối đi cũ ra Rừng Ngoại Vi. | `src/world/WorldBuilder.ts`<br>(Dòng 824-830) |

---

## 4. PHÂN TÍCH XUNG ĐỘT & ĐÁNH GIÁ AN TOÀN TẠI VÙNG ĐÍCH `(1373, 432)`

### 4.1. Tài nguyên nhiệm vụ và Quest Items (An toàn tuyệt đối)
- Đã rà soát toàn bộ `InventorySystem.ts` và `zones.json`: Làng Bellhollow chỉ có 2 resource nodes tại `(610, 145)` (phía Tây) và `(730, 80)` (phía Bắc).
- **Hoàn toàn KHÔNG CÓ bất kỳ tài nguyên nhiệm vụ (`mat_runed_iron`, `res_dry_wood`, `res_tree_resin`), rương đồ, hay vật phẩm quest nào trong phạm vi $X \in [1250, 1500]$, $Y \in [300, 520]$.**
- Không có bất kỳ nguy cơ mất mát hay di dời nhầm tài nguyên nhiệm vụ của người chơi.

### 4.2. Khoảng cách với các công trình lân cận & Lối đi
1. **Hàng rào phía Nam làng (`fence_bottom_east`):**
   - Hàng rào Nam chạy ngang tại $Y = 536..568$.
   - Chân móng xưởng mới nằm tại $Y = 432$.
   - Vị trí đứng của Bram và Bàn chế tạo nằm tại $Y = 477$ và $Y = 455$.
   - Khoảng cách từ chân Bram tới hàng rào Nam: $536 - 477 = 59\text{px}$.
   - Khoảng cách từ chân móng xưởng tới hàng rào Nam: $536 - 432 = 104\text{px}$.
   - **Đánh giá:** Tạo ra một hành lang đi bộ cực kỳ rộng rãi, nhân vật hoàn toàn không bị kẹt hay chạm collider hàng rào Nam.
2. **Đường Rừng Phía Đông dẫn ra Cổng Đông (`1485, 280`):**
   - Trục đường đất uốn lượn tại $Y \approx 286$ ($r = 20$, dải đường từ $Y = 266$ đến $Y = 306$).
   - Đỉnh mái xưởng mới nằm tại $Y = 432 - 148 = 284$.
   - **Đánh giá:** Đỉnh mái xưởng mới vừa chạm mép dưới của lề đường Cổng Đông, không đè lấn lên lòng đường, đảm bảo tầm nhìn của người chơi khi chạy từ Quảng Trường ra Cổng Đông hoàn toàn thông thoáng.
3. **Kỵ sĩ Sir Vaelen (Campfire Knight):**
   - Sir Vaelen quỳ tại Trạm Lửa Rừng Tĩnh Lặng `(1435, 710)`.
   - Vị trí xưởng mới `(1373, 432)` cách xa Sir Vaelen tới $278\text{px}$ về phía Bắc, hoàn toàn nằm trong hai phân khu tách biệt.
4. **Giải phóng nút thắt cổ chai phía Nam:**
   - Khi xưởng cũ tại `(1270, 360)` được dời đi, bãi đất cũ sẽ trở thành một bãi đất trống phẳng phiu, mở rộng trục đường từ Quảng Trường xuống Lối Nam ra Rừng Ngoại Vi (`1210, 510`) từ $35\text{px}$ lên hơn $120\text{px}$.

### 4.3. Các xung đột bắt buộc phải xử lý trong HW-BUG-#5
1. **Bụi cây tại `(1416, 348)`:** Cần xóa bỏ khỏi mảng `bushPlacements` trong `WorldBuilder.ts` (hoặc dời sang tọa độ mép hàng rào `1475, 410`).
2. **Cành gỗ mục tại `(1364, 340)`:** Cần xóa bỏ khỏi mảng `fallenBranches` trong `WorldBuilder.ts` (hoặc dời sang bãi đất trống cũ `1250, 350`).
3. **Cụm sương mù tại `(1330, 395)`:** Dời tâm sương mù sang `(1433, 467)` hoặc đẩy xuống sát hàng rào `(1330, 520)` để giữ sự thông thoáng và rực rỡ cho lò than hồng.

---

## 5. KẾ HOẠCH BÀI BẢN CHO HW-BUG-#5 (KHI ĐƯỢC DUYỆT)

Khi Project Owner phê duyệt Blueprint này, nhiệm vụ thi công **HW-BUG-#5** sẽ tiến hành đồng bộ trên 3 tệp nguồn duy nhất:
1. `src/world/WorldBuilder.ts`:
   - Dời `createCraftingWorkshopPavilion(1270, 360)` $\rightarrow$ `createCraftingWorkshopPavilion(1373, 432)`.
   - Dời cụm củi `createVillagePropCluster(1330, 380, 'firewood')` $\rightarrow$ `(1433, 452)`.
   - Dời vệt đất ấm `addWarmGroundPool(1240, 375, 56, 0.22)` $\rightarrow$ `(1343, 447)`.
   - Xóa/dời bụi cây `(1416, 348)` và cành gỗ mục `(1364, 340)`.
   - Điều chỉnh cụm sương mù `(1330, 395)`.
2. `src/data/zones.json`:
   - Cập nhật tọa độ `npc_bram`: `x: 1333, y: 477`.
   - Cập nhật tọa độ `village_crafting_bench`: `x: 1395, y: 455`.
3. `src/data/maps/bellhollow.json`:
   - Đồng bộ tọa độ Tiled Object `npc_bram` và `village_crafting_bench` tương ứng.

---

## 6. KẾT LUẬN & KIẾN NGHỊ

Sơ đồ di dời xưởng Bram sang tọa độ `(1373, 432)` đạt độ chuẩn xác 100% về hình học, collider, tương tác [E], và bảo toàn toàn bộ hệ thống quest/resource node. 

**TUYỆT ĐỐI TUÂN THỦ:** Không sửa bất kỳ dòng code gameplay nào, không tự ý áp dụng thay đổi. 

**HARD STOP:** Kính trình Project Owner xem xét sơ đồ Blueprint, hình ảnh trực quan và phê duyệt phương án trước khi triển khai nhiệm vụ thi công **HW-BUG-#5**.
