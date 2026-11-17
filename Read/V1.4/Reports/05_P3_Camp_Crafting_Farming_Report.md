# BÁO CÁO KỸ THUẬT V14-P3-01
## SANCTUARY CAMP HUB THỐNG NHẤT TẠI LÀNG BELLHOLLOW

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P3-01` & `V14-P3-02`
- **Mục tiêu:**
  1. Hợp nhất cụm chuẩn bị sinh tồn thành một **Sanctuary Hub** ấm áp ngay trong làng Bellhollow, không tách thành 2 căn cứ riêng biệt gây mất thời gian di chuyển.
  2. Xây dựng **Lửa Trại Trung Tâm 3 Cấp (Campfire 3-Tier)**: Nạp Gỗ Khô (`res_dry_wood`) hoặc Nhựa Cây (`res_tree_resin`) duy trì và nâng cấp ngọn lửa (Cấp 1 -> Cấp 2 -> Cấp 3), mở rộng vùng ấm và hồi phục Bình Tâm.
  3. Xây dựng **Rương Chứa Đồ 12 Ô (Storage Chest)**: Lưu trữ dự trữ tài nguyên ổn định vào `SaveManager`, phân biệt rõ giữa túi đồ người chơi và rương cất trữ.
  4. Xây dựng **Nồi Thảo Dược Neris (Herbal Cauldron)**: Sắc các loại trà an thần, thuốc đắp và tinh dầu thắp sáng.
  5. Xây dựng **Lều Trú Ẩn (Shelter Tent)**: Cho phép nghỉ ngơi hồi phục toàn bộ thể lực và chuyển sang pha thời gian tiếp theo; tự động khóa chức năng ngủ nếu có nguy hiểm hoặc bị The Listener truy đuổi.
  6. **V14-P3-02:** Bổ sung chuỗi vật phẩm/công thức giá trị vòng lặp thời Trung cổ (Dây Thừng Rừng, Than Củi, Phụ Kiện Sắt Cổ Ngữ, Trà An Thần, Nấm Nướng, Súp Rễ Rừng).
  7. **V14-P3-02:** Bảo vệ tuyệt đối vật phẩm Nhiệm vụ (`quest_*`) và Nhật ký (`lore_*`) trong `PlayerState`, ngăn ngừa tiêu thụ hoặc vứt bỏ nhầm.
  8. **V14-P3-02:** Phân trang giao diện Bàn Chế Tạo `CraftingModal` mượt mà, hỗ trợ không giới hạn số lượng công thức.
  9. **V14-P3-02:** Nâng cấp chiều sâu nông trại Sanctuary Farm với quy trình 5 bước trực quan và 3 nhóm cây trồng đặc trưng (Dược liệu, Lương thực, Cỏ sợi bện dây).
  10. Bảo toàn dữ liệu lưu không phá hủy, không nhân đôi hay thất thoát vật phẩm.
  11. `npx tsc --noEmit` đạt 0 lỗi; 100% kiểm thử hồi quy V1.3 (571/571 PASS) và kiểm thử V1.4 (194/194 PASS).
- **Ngày thực hiện:** 17/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (PASS TẤT CẢ KIỂM THỬ)**

---

## 1. BỐ CỤC KHÔNG GIAN SANCTUARY CAMP HUB TRONG BELLHOLLOW

Cụm chuẩn bị sinh tồn được tích hợp tự nhiên vào không gian làng Bellhollow, gắn kết mật thiết với các NPC và công trình cốt truyện:

```
                  [ Nhà Neris & Vườn Thảo Dược ]
                                |
                   (935, 140) [Nồi Thảo Dược Neris]
                                |
[ Cổng Tây Garth ]              |              [ Tháp Chuông & Edda ]
  (530, 220)                    |                   (820, 252)
         \                      |                       /
          \---- [Lều Trú Ẩn] ---+--- [Lửa Trại 3 Cấp] --/
                (715, 220)      |      (780, 260)
                     |          |
              [Rương 12 Ô]      |
               (735, 255)       |
                                |
                  [ Xưởng Rèn Bram & Lò Nung ]
                          (960, 360)
```

---

## 2. CHI TIẾT KỸ THUẬT 4 THÀNH PHẦN THIẾT YẾU

### 2.1. Lửa Trại Trung Tâm 3 Cấp ([CampSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/CampSystem.ts), [CampfireModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CampfireModal.ts))
- **Vị trí:** Tọa độ `(780, 260)` tại trung tâm bãi trại Quảng trường Làng Bellhollow.
- **Cơ chế nạp nhiên liệu:**
  - `res_dry_wood` (Gỗ Khô): +90 giây nhiên liệu.
  - `res_tree_resin` (Nhựa Cây Rừng): +150 giây nhiên liệu, tỏa nhiệt lượng lớn.
  - Tối đa tích trữ 600 giây (10 phút cháy liên tục). Nhiên liệu tiêu hao đều theo thời gian thực `dt`.
- **Phân cấp ngọn lửa & Hiệu ứng sinh tồn:**

| Cấp Độ | Mức Nhiên Liệu | Bán Kính Sưởi Ấm | Hồi Bình Tâm | Hong Khô Độ Ẩm | Sưởi Ấm Thân Nhiệt | Hiệu Ứng Ánh Sáng |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Cấp 1 (Le lói)** | $1\text{s} - 179\text{s}$ | **120 px** | **+0.5/s** | Nhanh (-8%/s) | Ấm (+6.0/s) | Ánh vàng cam le lói, an toàn cự ly gần |
| **Cấp 2 (Cháy đều)** | $180\text{s} - 359\text{s}$ | **180 px** | **+1.0/s** | Rất nhanh (-14%/s) | Nóng ấm (+10.0/s) | Quầng lửa vàng rực, bao trùm sân trại |
| **Cấp 3 (Rực rỡ)** | $360\text{s} - 600\text{s}$ | **250 px** | **+1.8/s** | Cực nhanh (-20%/s) | Tối đa (+15.0/s) | Đẩy lùi bóng tối và sương mù ra rìa làng |
| **Tàn tro** | $0\text{s}$ | 60 px | +0.2/s | Bình thường | Tàn nhiệt | Than hồng le lói, cần nạp củi để bùng cháy |

- Bán kính lửa trại được tự động đồng bộ sang `SurvivalSystem.campfireWarmthRadius` mỗi khung hình.

### 2.2. Rương Chứa Đồ 12 Ô ([StorageChestModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/StorageChestModal.ts))
- **Vị trí:** Tọa độ `(735, 255)`, đặt ngay cạnh lều trú ẩn và bãi củi của khu trại.
- **Quy tắc ngăn nắp & chống tràn dữ liệu:**
  - Giới hạn tối đa đúng **12 loại vật phẩm** (`maxChestSlots = 12`).
  - Cho phép người chơi cất bớt các nguyên liệu nặng (Gỗ, Đá lửa, Nhựa cây, Hạt giống) trước khi dấn thân vào vùng rừng nguy hiểm.
  - Phân tách độc lập hoàn toàn giữa `playerState.inventory` và `playerState.storageChest`.
  - Cơ chế cất/lấy 1 chạm trực quan, có âm thanh xác nhận và thông báo trạng thái.
  - Không bao giờ bị nhân đôi vật phẩm hay mất mát khi nạp/lưu game.

### 2.3. Nồi Thảo Dược Neris ([CauldronModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CauldronModal.ts))
- **Vị trí:** Tọa độ `(935, 140)`, đặt trên sân đá trước hiên Nhà Thảo Mộc của Neris.
- **3 Công thức chuyên biệt:**
  1. **Thuốc Đắp Thảo Dược (`item_healing_poultice`):** 2x Thảo Dược Bạc + 1x Nhựa Cây ➔ Hồi phục ngay **+35 HP**.
  2. **Tinh Dầu Đèn Lồng (`item_lantern_oil`):** 2x Nhựa Cây + 1x Gỗ Khô ➔ Bổ sung trực tiếp **+40 Dầu Đèn**.
  3. **Trà Thảo Mộc An Thần (`item_herbal_brew`):** 3x Thảo Dược Bạc ➔ Hồi phục tức thì **+40 Bình Tâm (Composure)**.
- Giao diện sắc thuốc kiểm tra thời gian thực số lượng nguyên liệu trong túi người chơi.

### 2.4. Lều Trú Ẩn Sanctuary ([CampSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/CampSystem.ts))
- **Vị trí:** Tọa độ `(715, 220)`, lều bạt khung gỗ chữ A có đệm rơm và chăn ấm.
- **Điều kiện nghỉ ngơi:**
  - Yêu cầu có 1 Gỗ Khô để giữ ấm lều hoặc ngọn Lửa Trại trung tâm đang cháy.
  - **Khóa ngủ tự động:** Nếu The Listener đang ở trạng thái săn đuổi (`CHASE`) hoặc đang có sự kiện khẩn cấp, hệ thống lập tức từ chối cho ngủ với lời cảnh báo: *"Không thể ngủ lúc này! Có hiểm nguy đang rình rập quanh làng."*
- **Tác dụng của giấc ngủ an toàn:**
  - Hồi phục trọn vẹn 100% Sinh Lực (`health = 100`), Thể Lực (`stamina = 100`) và Bình Tâm (`composure = 100`).
  - Hong khô hoàn toàn Độ Ẩm (`moisture = 0%`).
  - Hồi ấm Thân Nhiệt lên mức sảng khoái (`temperature = 90`).
  - Chuyển tiếp thời gian thế giới qua `timeSystem.advanceToNextPhase()`: Nghỉ qua đêm tới sáng sớm hôm sau (`DAY` lúc 0s, tăng `dayCount++`).

---

## 3. KIẾN TRÚC MÃ NGUỒN ĐÃ TẠO MỚI & NÂNG CẤP

| Tệp Tin | Phân Loại | Nhiệm Vụ & Thay Đổi |
| :--- | :--- | :--- |
| [src/systems/CampSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/CampSystem.ts) | **Mới** | Quản lý toàn bộ vòng đời Lửa Trại 3 Cấp, Rương 12 Ô, Nồi Thảo Dược và Lều Trú Ẩn |
| [src/ui/StorageChestModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/StorageChestModal.ts) | **Mới** | Giao diện HD Rương 12 ô (cất/lấy tài nguyên song song túi đồ người chơi) |
| [src/ui/CampfireModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CampfireModal.ts) | **Mới** | Giao diện nạp Gỗ Khô / Nhựa Cây, hiển thị cấp lửa, thời gian cháy và bán kính |
| [src/ui/CauldronModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CauldronModal.ts) | **Mới** | Giao diện sắc thuốc, nấu tinh dầu và trà an thần |
| [src/world/WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts) | Nâng cấp | Thêm hàm `createSanctuaryCampHub()`, dựng 4 công trình thực tế có hộp va chạm và hiệu ứng ánh sáng |
| [src/data/zones.json](file:///G:/HOLLOW%20WOODS/src/data/zones.json) | Nâng cấp | Khai báo 4 interactables mới trong phân khu `bellhollow` |
| [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) | Nâng cấp | Tích hợp `campSystem`, xử lý các action bản đồ và đồng bộ bán kính hơi ấm mỗi frame |
| [src/scenes/UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts) | Nâng cấp | Quản lý 3 Modal mới, bổ sung vào vòng đời `isAnyModalOpen` và dọn dẹp khi tắt |
| [src/state/PlayerState.ts](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts) | Nâng cấp | Bổ sung `campfireLevel: number = 1` và `campfireFuel: number = 180` |
| [src/systems/SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts) | Nâng cấp | Lưu và phục hồi toàn diện `campfireLevel`, `campfireFuel` và `storageChest` |
| [src/systems/TimeSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/TimeSystem.ts) | Nâng cấp | Bổ sung hàm `advanceToNextPhase()` phục vụ cơ chế ngủ chuyển pha |
| [src/data/items.json](file:///G:/HOLLOW%20WOODS/src/data/items.json) | Nâng cấp | Thêm 12 vật phẩm mới & 5 công thức sinh tồn bối cảnh Trung cổ |
| [src/data/content_registry.json](file:///G:/HOLLOW%20WOODS/src/data/content_registry.json) | Nâng cấp | Đăng ký đầy đủ Content ID 4 tầng cho toàn bộ vật phẩm, nông sản và hạt giống |
| [src/registry/registryData.ts](file:///G:/HOLLOW%20WOODS/src/registry/registryData.ts) | Nâng cấp | Khai báo hằng số Registry TS cho 12 vật phẩm mới |
| [src/ui/CraftingModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CraftingModal.ts) | Nâng cấp | Phân trang `PAGE_SIZE = 3` có nút Trang Trước / Trang Sau và chỉ số trang |
| [src/systems/FarmingSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/FarmingSystem.ts) | Nâng cấp | Quy trình 5 bước trực quan và đồ họa pixel art cho 3 nhóm cây trồng đặc trưng |
| [src/types/index.ts](file:///G:/HOLLOW%20WOODS/src/types/index.ts) | Nâng cấp | Thêm `CropType` ('herbs' \| 'roots' \| 'mushroom' \| 'fiber') và mở rộng `HerbPlotData` |

---

## 5. BƯỚC V14-P3-02: VÒNG LẶP VẬT PHẨM TRUNG CỔ & NÂNG CẤP SANCTUARY FARM

### 5.1. Danh Mục Vật Phẩm Có Giá Trị Vòng Lặp Bối Cảnh Bellhollow
Mọi vật phẩm bổ sung đều phục vụ trực tiếp vào vòng lặp sinh tồn 4 nhịp (Thám hiểm ➔ Thu thập ➔ Trở về Trại Hub ➔ Chế tạo & Chuẩn bị), kiên quyết loại bỏ thuật ngữ hiện đại:

1. **Dây Thừng Rừng (`mat_forest_rope` / `HW-ITM-MAT-000001`):**
   - Bện từ Cỏ Sợi (`res_tough_fiber`) tại Bàn Chế Tạo.
   - Nguyên liệu cốt lõi để bện giáo gỗ, mồi tạo tiếng động và túi đồ dã ngoại.
2. **Than Củi (`mat_charcoal` / `HW-ITM-MAT-000002`):**
   - Thu được từ Lửa Trại đã tàn hoặc Lò Rèn Bram (chế tạo từ Gỗ Khô).
   - Dùng để sắc trà an thần, làm thuốc giải và làm chất trợ dung rèn đúc.
3. **Phụ Kiện Sắt Rèn Cổ Ngữ (`mat_runed_iron` / `HW-ITM-MAT-000003`):**
   - Nhặt từ Tàn tích Xưởng Chuông hoặc nhận từ nhiệm vụ Thợ Rèn Bram (thay thế cho cụm từ "linh kiện cơ khí" hiện đại).
   - Dùng để nâng cấp Đèn Lồng, sửa cơ cấu Chuông Đồng và chế tạo bẫy.
4. **Trà Thảo Dược An Thần (`food_calming_tea` / `HW-ITM-FOOD-000001`):**
   - Nấu tại Nồi Thảo Dược: 2 Thảo Dược Bạc + 1 Than Củi.
   - Hồi ngay **+40 Bình Tâm** và tăng +15 Thân Nhiệt giúp ấm người trong đêm sương.
5. **Nấm Rừng Nướng (`food_roasted_mushroom` / `HW-ITM-FOOD-000002`):**
   - Nướng trên than Lửa Trại: 2 Nấm Rừng + 1 Than Củi.
   - Hồi phục **+25 Sinh Lực** và **+30 Thể Lực**.
6. **Súp Rễ Rừng (`food_forest_root_soup` / `HW-ITM-FOOD-000003`):**
   - Hầm tại Nồi Thảo Dược: 2 Rễ Rừng + 1 Gỗ Khô.
   - Hồi phục **+35 Sinh Lực**, **+40 Thể Lực** và làm ấm cơ thể.

### 5.2. Cơ Chế Bảo Vệ Tuyệt Đối Vật Phẩm Nhiệm Vụ & Nhật Ký
- Thêm phương thức `PlayerState.isProtectedItem(itemId: string): boolean`:
  - Nhận diện toàn bộ tiền tố `quest_*` và `lore_*`, cùng các item thuộc danh mục `category === 'quest'` hoặc `category === 'lore'`.
  - Phương thức `useItem()` tự động từ chối tiêu thụ nếu vật phẩm được bảo vệ.
  - Ngăn ngừa hoàn toàn nguy cơ người chơi vô tình sử dụng mất Lưỡi Chuông Đồng Cổ (`quest_bronze_clapper`) hay Sổ Nhật Ký Lữ Khách (`lore_satyr_journal`).

### 5.3. Phân Trang Giao Diện Bàn Chế Tạo (CraftingModal)
- Bổ sung hằng số `CraftingModal.PAGE_SIZE = 3`.
- Bổ sung 2 nút điều hướng `◀ Trang Trước` và `Trang Sau ▶` cùng nhãn hiển thị `Trang X / Y` ở chân bảng.
- Hàm `updatePageVisibility()` ẩn/hiện chính xác các hàng công thức theo trang hiện tại, tương thích mượt mà với số lượng công thức ngày càng phong phú mà không phá vỡ layout 840x520 chuẩn.

### 5.4. Nâng Cấp Chiều Sâu Nông Trại Sanctuary Farm (5 Bước & 3 Nhóm Cây Trồng)
- **Quy trình 5 bước sinh tồn:**
  1. `empty` (đất thô chưa xới): Prompt `[E] Làm Đất Chuẩn Bị Luống Trồng` ➔ Người chơi bấm [E] để xới tơi xốp luống đất (`isPrepared = true`).
  2. `prepared` (đất đã tơi xốp, bón lót ẩm): Prompt chuyển sang `[E] Gieo Hạt Giống...` tùy theo loại hạt người chơi đang sở hữu.
  3. `planted` (vừa gieo mầm / nảy mầm): Mầm cây non nhú lên khỏi mặt đất, hiển thị thời gian đếm ngược.
  4. `growing` (sinh trưởng): Thân cây vươn cao, tán lá mở rộng theo đặc trưng từng loại cây.
  5. `harvest_ready` (trưởng thành / sẵn sàng thu hoạch): Cây đơm hoa kết trái hoặc lộ củ nấm rực rỡ, kèm hiệu ứng thở lấp lánh (Sine tween). Khi thu hoạch, ô đất tự động chuyển về `empty` và `isPrepared = false` để bắt đầu chu kỳ canh tác mới.
- **3 nhóm cây trồng đặc trưng vùng Bellhollow:**
  - **Nhóm Dược tính (Medicinal):** Thảo Dược Bạc (`seed_herbs` hoặc `res_herbs`) ➔ Thu hoạch: +2 Thảo Dược Bạc (`res_herbs`), +1 Hạt Giống (`seed_herbs`).
  - **Nhóm Lương thực (Food):**
    + Rễ Rừng (`seed_roots` hoặc `res_forest_roots`) ➔ Thu hoạch: +2 Rễ Rừng (`res_forest_roots`), +1 Củ Giống (`seed_roots`).
    + Nấm Rừng (`seed_mushroom` hoặc `res_forest_mushroom`) ➔ Thu hoạch: +2 Nấm Rừng (`res_forest_mushroom`), +1 Bào Tử Nấm (`seed_mushroom`).
  - **Nhóm Nguyên liệu/Truyền thuyết (Material & Lore):** Cỏ Sợi Bện Dây (`seed_fiber`) ➔ Thu hoạch: +3 Cỏ Sợi Bện Dây (`res_tough_fiber`), +1 Hạt Giống Cỏ Sợi (`seed_fiber`).
- **Đồ họa Pixel Art chuyên biệt:** Mỗi loại cây có hình vẽ sprite đồ họa riêng biệt ở cả 3 giai đoạn mầm, cây non và trưởng thành (chồi cam rễ rừng, mũ nấm be đốm sáng, sợi kim cỏ dai, hoa vàng thảo dược bạc).
- **Cơ chế chống bug & cứu trợ hạt giống:**
  - Chống bấm [E] nhân đôi tài nguyên nhờ atomic state transition.
  - Cứu trợ hạt giống từ Neris nếu cả 4 ô đất đều trống và người chơi sạch túi không còn hạt.

---

## 6. KẾT QUẢ KIỂM THỬ TỔNG HỢP (765/765 PASS)

### 6.1. Bộ Kiểm Thử V14-P3-02 (`scripts/test_v14_p3_02.mjs`)
- **Kết quả:** **49/49 KIỂM TRA ĐẠT (100% PASS)**
  - `[PASS]` Đầy đủ 12 vật phẩm mới trong `items.json`.
  - `[PASS]` Đầy đủ 5 công thức sinh tồn mới trong `items.json`.
  - `[PASS]` Đầy đủ 12 mục đăng ký định danh 4 tầng trong `content_registry.json`.
  - `[PASS]` Cơ chế `isProtectedItem` bảo vệ tuyệt đối quest và lore items trong `PlayerState`.
  - `[PASS]` Phân trang `CraftingModal` hoạt động chính xác với hằng số `PAGE_SIZE`.
  - `[PASS]` Nông trại 5 bước trực quan và 3 nhóm cây trồng thu hoạch sản vật + hạt giống.
  - `[PASS]` Khả năng tương thích kiểu dữ liệu `CropType` và `HerbPlotData`.

### 6.2. Bộ Hồi Quy & Đa Hệ Thống Toàn Diện
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/test_save_migration_v14.mjs`: **41/41 PASS (100%)**.
- `node scripts/test_time_system_v14.mjs`: **19/19 PASS (100%)**.
- `node scripts/test_weather_and_status_v14.mjs`: **27/27 PASS (100%)**.
- `node scripts/test_camp_system_v14.mjs`: **58/58 PASS (100%)**.
- `node scripts/test_v14_p3_02.mjs`: **49/49 PASS (100%)**.
- `node scripts/verify_farming_c4_12_16.mjs`: **33/33 PASS (100%)**.
- **Tổng cộng: 765/765 bài kiểm thử tự động đạt 100% PASS.**
