# HW-WORLD-20 — DANH MỤC LỖI BẢN ĐỒ, ĐIỀU HƯỚNG & TƯỜNG VÔ HÌNH (`HW-WORLD-20A`)

- **Dự án:** `HOLLOW WOODS` — *World Reconstruction 2.0*
- **Studio:** `KYOSHIRO STUDIO`
- **Đặc phái viên:** `AG 4 Hydro High`
- **Nhánh Git:** `feat/v1.5.3-ag-world-polish` (`HEAD`: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`)
- **Phạm vi:** Read-Only Runtime + Static Audit (`17` phân khu, `329` static physics colliders, `5` WASD keyboard traversal probes, `13` cặp ảnh `BEFORE_OVERVIEW` & `BEFORE_COLLISION_OVERLAY` qua phím `F9`).
- **Dữ liệu JSON:** [HW_COLLISION_AUDIT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-WORLD-20/HW_COLLISION_AUDIT.json)

---

## 1. Tham Chiếu Bug Cũ Liên Quan (Tồn Đọng Cần Xử Lý Trong `HW-WORLD-20`)

Để tuân thủ nguyên tắc không nhân bản trùng lặp ID, các bug từ Phase 1 / Phase 2 / `HW-MAP-00` đã được xác minh lại trên build hiện tại và liên kết chéo trực tiếp như sau:

| ID Cũ | Mức ưu tiên | Trạng thái xác minh `HW-WORLD-20A` | Bằng chứng mới |
| :--- | :---: | :--- | :--- |
| **`HW-H4-03-AUDIT`** | **P0** | **CONFIRMED OPEN.** `W02_deep_forest_to_abyssal_chasm_unlocked` đi `[W]` thật (`1.2s`) bị kẹt tại `y = -600` (`bodyY = -618`), chưa vào được `abyssal_chasm` (`WorldGatingSystem` yêu cầu mở cả `deep_forest` lẫn `abyssal_gate_unlocked`, và `GameScene.ts:4066` kẹp `physics.world.bounds.y = -640` khiến chân `footPos` không vượt quá `-622` để chạm `triggerRect.y = -640..-624`). | [HW_COLLISION_AUDIT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-WORLD-20/HW_COLLISION_AUDIT.json), [deep_forest_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/deep_forest_BEFORE_COLLISION_OVERLAY.png) |
| **`MAP-BUG-001`** | **P0** | **CONFIRMED OPEN.** `sub_whispering_clearing`: `auto_south_whispering_grove_sanctum_seg_end` (`1640..-376, 440x32`) cắt chồng qua `to_deep_forest_from_wc` (`80x6px`) và `to_whispering_grove_sanctum` (`80x16px`); lối Nam `-> crooked_path` vẫn là đường 1 chiều duy nhất (`oneWayTransitions = 1`). | [sub_whispering_clearing_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sub_whispering_clearing_BEFORE_COLLISION_OVERLAY.png) |
| **`MAP-BUG-002`** | **P0** | **CONFIRMED OPEN.** `whispering_grove_sanctum` chồng `480x280` lên `deep_forest` và `480x160` lên `abyssal_chasm`; `defaultSpawn (1600, -420)` nằm ngay bên trong tường `df_bound_left` (`1600..-640, 30x640`); `to_whispering_clearing_from_wgs` đè chồng `df_bound_left` (`30x30px`) và `Rặng Cây Viền Tây Deep Forest` (`20x30px`). | [HW_COLLISION_AUDIT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-WORLD-20/HW_COLLISION_AUDIT.json) |
| **`MAP-BUG-003`** | **P1** | **CONFIRMED OPEN.** `ancient_rune_puzzle` chồng `350x280` trong `silent_mire`; `to_silent_mire_from_puzzle` (`3310..3335`) nằm ngoài `bounds.x = 3350`; `Đèn Đá Nghi Thức` (`3362, 247, 12x10`) chồng `9x10px` lên `to_rune_puzzle`. | [ancient_rune_puzzle_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/ancient_rune_puzzle_BEFORE_COLLISION_OVERLAY.png) |
| **`MAP-BUG-004`** | **P1** | **CONFIRMED & ROOT-CAUSE SOLVED -> Chi tiết ở `W20-BUG-001`.** Xác định chính xác nguyên nhân kỹ thuật là atlas `prop_fallen_log_mossy_v14` đóng nhầm sprite cây lá đỏ/tím `46x61` với `origin(0.5, 0.5)`. | [fog_crossing_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/fog_crossing_BEFORE_COLLISION_OVERLAY.png) |
| **`MAP-BUG-009`** | **P2** | **CONFIRMED OPEN (`14` collider-transition overlaps + `3` OOB triggers).** Bao gồm `to_drowned_mire_depths` và `to_veil_origin_cavern` lố biên Nam `4px`, cùng các tường biên giao cắt trigger. | [silent_mire_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/silent_mire_BEFORE_COLLISION_OVERLAY.png) |
| **`MAP-BUG-010`** | **P1** | **CONFIRMED OPEN -> Chi tiết ở `W20-BUG-011`.** 5 phân khu mở rộng thiếu hoàn toàn nền thiết kế và `render*Decorations()`. | [abyssal_chasm_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/abyssal_chasm_BEFORE_COLLISION_OVERLAY.png), [sunken_crypt_ruins_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sunken_crypt_ruins_BEFORE_COLLISION_OVERLAY.png) |
| **`MAP-BUG-011` / `012`** | **P2** | **CONFIRMED OPEN.** Đường cắt chữ nhật tím của `sub_whispering_clearing` trên cỏ xanh `deep_forest`; `sub_root_cellar` dùng 100% `Phaser.Graphics` placeholder. | [sub_whispering_clearing_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sub_whispering_clearing_BEFORE_COLLISION_OVERLAY.png), [sub_root_cellar_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sub_root_cellar_BEFORE_COLLISION_OVERLAY.png) |

---

## 2. Danh Sách Lỗi Bản Đồ Mới / Phân Tích Chuyên Sâu (`W20-BUG-001` .. `W20-BUG-012`)

### `W20-BUG-001` — Atlas `prop_fallen_log_mossy_v14` Đóng Nhầm Sprite Cây Lá Tím & Hitbox Lơ Lửng Giữa Tán Cây
- **Bug ID:** `W20-BUG-001`
- **Zone ID:** `fog_crossing`, `outer_woods`, `crooked_path`, `deep_forest`, `silent_mire`, `broken_bell_shrine` (`20` instances toàn thế giới)
- **Tọa độ:** Điển hình `(220, 130)` (`fog_crossing`), `(48, 184)` rào Tây (xoay `90°`), `(1135, 670)` (`outer_woods`), `(2120, -340)` (`deep_forest`), `(3040, 240)` (`silent_mire`), `(4220, 330)` (`broken_bell_shrine`)
- **Hiện tượng:** Tại các vị trí gọi là "Thân cây đổ", trò chơi hiển thị **cây lá đỏ/tím đứng thẳng** (hoặc xoay ngang `90°` ở rào Tây), còn hộp va chạm đỏ trên `F9` nằm **lơ lửng ngay giữa tán lá phía trên** (`origin 0.5, 0.5`) trong khi phần gốc cây bên dưới bị đi xuyên qua. Riêng `tree_withered_gnarled.png` có khoảng trống rỗng dưới gốc ~40%.
- **Nguyên nhân:** `public/assets/atlases/hollow_props_atlas.json` đóng frame `prop_fallen_log_mossy_v14` tại `{x: 49, y: 387, w: 46, h: 61}` là sprite cây lá đỏ/tím (chính comment `WorldBuilder.ts:5675` ghi nhận: *"Xóa cây lá đỏ/tím prop_fallen_log_mossy_v14"*). Hàm `createFallenLog()` (`WorldBuilder.ts:5770`) đặt `origin(0.5, 0.5)` và `createStaticBoxColliderCentered(x, y, ...)`, ép hitbox vào tâm ảnh cây thay vì gốc.
- **File liên quan:** `public/assets/atlases/hollow_props_atlas.json`, `src/world/WorldBuilder.ts:2777, 5769-5780, 8297`
- **Mức ưu tiên:** **P0**
- **Ảnh bằng chứng:** [fog_crossing_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/fog_crossing_BEFORE_COLLISION_OVERLAY.png), [deep_forest_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/deep_forest_BEFORE_COLLISION_OVERLAY.png), [broken_bell_shrine_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/broken_bell_shrine_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Tách sạch sprite thân cây đổ ngang thật (`Resurrected RPG` / atlas prop chuẩn) và tách toàn bộ cây đứng theo kiến trúc `Tree_Trunks` + `Tree_Canopies` với hitbox chân gốc duy nhất (`LAB-01` pattern).
- **Ảnh hưởng gameplay:** Người chơi vướng tường vô hình ngang tán cây và gặp cảm giác "cây đỏ xoay ngang" thiếu tự nhiên ngay 5 giây đầu game tại `fog_crossing`.

---

### `W20-BUG-002` — Trục Đường Chính `Bellhollow` (`y=260`) Bị `Lều Trú Ẩn`, `Cột Đèn` & `Rương` Chặn Thẳng Lối Đi
- **Bug ID:** `W20-BUG-002`
- **Zone ID:** `bellhollow`
- **Tọa độ:** `(759..797, 245..304)` (trục giữa quảng trường làng `y = 260`)
- **Hiện tượng:** Kiểm thử phím thật `W01_bellhollow_main_road_east` cho Black Knight đi thẳng sang Đông `[D]` từ `(620, 260)` bị chặn cứng tại `x = 791.5, y = 250` do vướng cụm `Lều Trú Ẩn` (`759, 255, 38x16`), `Cột Đèn Lồng` (`775, 245, 10x8`), `Rương Gỗ Đai Đồng` (`762, 290, 26x14`) đặt giữa mặt đá quảng trường thẳng trục cổng Tây `(560, 260)`. Đống nấm dạ quang còn mọc trên mặt lát đá quảng trường.
- **Nguyên nhân:** Cụm `createSanctuaryCampHub()` và các prop trung tâm đặt cắt ngang trực tiếp tuyến đường đi bộ Tây-Đông của người chơi mới, các hộp tương tác vàng chồng lấn nhau quanh lửa trại và lều.
- **File liên quan:** `src/world/WorldBuilder.ts:2694-2722`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [bellhollow_BEFORE_OVERVIEW.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/bellhollow_BEFORE_OVERVIEW.png), [bellhollow_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/bellhollow_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Tổ chức lại quảng trường `bellhollow` bằng `Serene Village Revamped v1.9` + `Houses Pack`, dời cụm trại trú ẩn/rương về sân phụ phía Nam-Tây quảng trường để giữ hành lang chính Tây -> Đông thông suốt tối thiểu `72–96px`.
- **Ảnh hưởng gameplay:** Làm gãy nhịp di chuyển tự nhiên khi mới vào làng, buộc người chơi phải đi vòng né từng hộp collider giữa khu an toàn.

---

### `W20-BUG-003` — Tường Chu Vi Xếp Chồng 3 Lớp & Collider Cây Rác Lệch Pha Tại `Fog Crossing`
- **Bug ID:** `W20-BUG-003`
- **Zone ID:** `fog_crossing`
- **Tọa độ:** Biên `(0..480, 0..360)`; `fog_tree_1 (160, 100)` vs cây thật `(160, 65)`; `fog_tree_2 (300, 240)` vs `(300, 310)`; mép Đông `x = 448..480`
- **Hiện tượng:** Trên overlay `F9` dọc mép Tây, Bắc, Nam và Đông của `fog_crossing`, xuất hiện **2 đến 3 lớp tường đỏ chồng nhau** (`bound_top` + `auto_north_fog_crossing_seg_end`, `bound_bottom` + `auto_south_*`, `fog_bound_right_*` + `auto_east_*` + `bell_bound_west_*`). Đồng thời `auto_east_fog_crossing_seg_end` (`464, 260, 32x100`) đè chồng `16x60px` lên trigger `to_fog_crossing`. `zones.json` vẫn chứa `fog_tree_1` (`160, 100`) và `fog_tree_2` (`300, 240`) lệch `35–70px` so với sprite cây thật.
- **Nguyên nhân:** Bật `AutoPerimeterWallsModule` cho `fog_crossing` khi `zones.json` đã định nghĩa thủ công toàn bộ `bound_*`, đồng thời dữ liệu cây trong `zones.json` không được dọn đồng bộ khi dời cây trong `WorldBuilder.ts:2684-2685`.
- **File liên quan:** `src/data/zones.json:36-100`, `src/world/WorldBuilder.ts:2674-2686, 4888-4910`, `src/world/modules/AutoPerimeterWallsModule.ts`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [fog_crossing_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/fog_crossing_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Chọn 1 nguồn chân lý duy nhất cho tường rìa/cổng, xóa collider rác `fog_tree_1/2`, chuyển `fog_crossing` sang thiết kế thảm rừng sương mù `Resurrected RPG` dẫn mượt vào cổng làng `Bellhollow`.
- **Ảnh hưởng gameplay:** Thu hẹp cửa thông vào làng, gây rác overlay `F9` và dư thừa kiểm tra vật lý mỗi khung hình.

---

### `W20-BUG-004` — Chồng Chéo Dữ Dội Vật Thể & Tường Chặn Cổng Tại `Deep Forest`, `Whispering Clearing` & `Sanctum`
- **Bug ID:** `W20-BUG-004`
- **Zone ID:** `deep_forest`, `sub_whispering_clearing`, `whispering_grove_sanctum`
- **Tọa độ:**
  - Biển báo + Rương xếp chồng: `(1974, -70)` vs `(1984, -74)` (`deep_forest` cửa rừng)
  - Chồng 3 lớp: `(2340, -490)` = `createStoneSign` + `createRock (54x34)` + `createListenerNestClue`
  - Chồng 5 vật thể quanh `(2100, -340)`: `Totem` + `FallenLog (2120, -340)` + `Rock (2080, -360)` + `Iron (2110, -330)` + `Mushroom (2130, -350)`
  - Cây đổ đè Node gỗ: `(1880, -200)` vs `(1880, -195)`
  - Rừng thì thầm: `(1600..1970, -360..0)` và cây bạch dương đè lên cổng Bắc `1800..-360`
- **Hiện tượng:** Vật thể trồng khít vào nhau tạo khối kẹt góc và rối mắt nghiêm trọng: biển báo dính liền rương gỗ; biển cảnh báo mọc xuyên qua tảng đá lớn; cây xanh/bạch dương mọc ngay trước cổng thoát Bắc của `sub_whispering_clearing`; `3 Cột đá vọng âm` chỉ là hình chữ nhật vector tím không có collider; mảng nền tím hình chữ nhật của `sub_whispering_clearing` cắt đứt đột ngột sang nền cỏ xanh `deep_forest`. Ngoài ra `MAP-BUG-001`, `MAP-BUG-002` và `HW-H4-03-AUDIT` khóa cứng nhiều lối chuyển vùng.
- **Nguyên nhân:** Đặt prop thủ công theo nhiều đợt vá liên tiếp không kiểm khoảng cách tối thiểu (`< 16px`), vùng `sub_whispering_clearing` và `whispering_grove_sanctum` lồng tọa độ lên `deep_forest` mà vẫn bật `AutoPerimeterWallsModule` cho `whispering_grove_sanctum`.
- **File liên quan:** `src/world/WorldBuilder.ts:6268-6365, 7912-7962`, `src/data/zones.json`, `src/scenes/GameScene.ts:4066`
- **Mức ưu tiên:** **P0**
- **Ảnh bằng chứng:** [deep_forest_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/deep_forest_BEFORE_COLLISION_OVERLAY.png), [sub_whispering_clearing_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sub_whispering_clearing_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Tái quy hoạch toàn bộ cụm `Deep Forest` + `Whispering Clearing` + `Sanctum` bằng lưới Tiled `Resurrected RPG` / `EPIC Ruins`; giãn các cụm vật thể tối thiểu `48–72px`; xóa ranh chữ nhật nhân tạo; mở thông hoàn toàn cổng Bắc & cầu nối 2 chiều về `crooked_path`.
- **Ảnh hưởng gameplay:** Đây là khu vực tệ nhất về va chạm kẹt góc, đứt gãy thị giác và chặn tiến trình khám phá (`P0`).

---

### `W20-BUG-005` — Trùng Lặp Hàng Rào / Cây & Chồng Hộp Tương Tác Tại `Sanctuary Farm`
- **Bug ID:** `W20-BUG-005`
- **Zone ID:** `sanctuary_farm`
- **Tọa độ:** `(505, 840)` (hàng rào Tây đè cây), `(650..685, 625..640)` (sân sơ chế + rương + hòm gỗ), biên Tây `x=480` (2 lớp tường)
- **Hiện tượng:** Hàng rào gỗ chu vi cắt ngang xuyên thân `Cây Bìa Nông Trại` (`505, 840`) và bụi cây; 3 hộp tương tác vàng chồng lên nhau ở sân Bắc; hòm gỗ + rương + bàn sơ chế đặt quá sát tạo góc nhọn dễ mắc kẹt; ao nước góc Đông-Nam chỉ là hình tròn `Graphics` phẳng không có bờ đá/collider. Biên Bắc `sanctuary_farm` chồng `640x200px` lên `bellhollow`.
- **Nguyên nhân:** `createFarmPerimeterFences()` chạy cứng theo tọa độ không trừ cây trồng biên; vùng giao `bellhollow` (`y: -200..760`) chồng `sanctuary_farm` (`y: 560..1040`).
- **File liên quan:** `src/world/WorldBuilder.ts:5206-5249`, `src/data/zones.json`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [sanctuary_farm_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sanctuary_farm_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Tái cấu trúc `sanctuary_farm` bằng `Serene Village Revamped v1.9` + `Grass Land 2.0`, chỉnh hàng rào tách khỏi thân cây >= `24px`, thay ao nước bằng tile nước thật có collider chân bờ.
- **Ảnh hưởng gameplay:** Gây rối tương tác `[E]` do 3 vùng vàng chồng lên nhau và mất tính chân thực thị giác.

---

### `W20-BUG-006` — Rừng Ngoại Vi (`Outer Woods`): Cây, Rương & Nhà Kiểm Lâm Chồng Khít Tại `(1445..1450, 650)`
- **Bug ID:** `W20-BUG-006`
- **Zone ID:** `outer_woods`
- **Tọa độ:** `(1445..1450, 650..662)` (triple stack), `(1135..1165, 576..670)` (góc Tây Bắc chồng trigger & cây), `(1490..1540, 845..980)` (cụm đá/cây chồng mép)
- **Hiện tượng:** Dữ liệu runtime `HW_COLLISION_AUDIT.json` bắt trúng **chồng chéo 3 đối tượng** giữa `tree_mossy_oak_grand (1450, 650)`, `prop_chest_bronze (1445, 651)` và `building_ranger_outpost (1448, 662)`. Góc Tây Bắc có `Gốc Cây Pixel Art (1161, 576, 18x10)` nằm đè thẳng trong `triggerRect` của `to_bellhollow_from_ow`; góc Tây-Nam có tường dọc cắt xuyên cây sồi xanh và 2 cây bạch dương đè collider vào nhau.
- **Nguyên nhân:** Quá nhiều cụm `createOrganicTreeCluster` + `createTree` + prop bổ sung được nhồi trong không gian `480x480 px`, khiến mật độ tán và collider quá ngột ngạt.
- **File liên quan:** `src/world/WorldBuilder.ts:5260-5365`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [outer_woods_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/outer_woods_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Chọn `outer_woods` làm **đợt tái thiết đầu tiên (`HW-WORLD-20B`)** áp dụng trọn vẹn chuẩn `LAB-01` (`Resurrected RPG 1.1` + `Grass Land 2.0`), mở rộng lối đi tối thiểu `96px`, tách `Tree_Trunks` / `Tree_Canopies`, gỡ sạch triple-overlap quanh Trạm Kiểm Lâm.
- **Ảnh hưởng gameplay:** Cây cối um tùm gây khuất tầm nhìn và vướng collider khi né Dark Horseman hoặc di chuyển xuống Xưởng Chuông.

---

### `W20-BUG-007` — Rìa Nam `Crooked Path` Xếp Đôi Tường Chặn Ngang Thảo Nguyên & Mất Cổng Về Từ Rừng Thì Thầm
- **Bug ID:** `W20-BUG-007`
- **Zone ID:** `crooked_path`
- **Tọa độ:** `(1600..2880, 560..640)` (mép Nam), `(1598, 360)` (mép Tây chồng `to_outer_woods_from_cp`), `(2093, 38)` (Biển Chỉ Dẫn giữa trigger `to_deep_forest`)
- **Hiện tượng:** Dọc hết biên Nam `crooked_path`, hai vệt tường đỏ song song chạy dài xuyên ngang bãi cỏ khiến phần nền bên dưới tưởng đi được nhưng bị tường vô hình chặn lại (`2020, 620`). Hàng cây phía trên tường (`y ~ 570`) không có collider (`withCollider=false`) nên người chơi đi xuyên gốc cây rồi mới đụng tường giữa bãi cỏ trống! Ngoài ra `bell_bound_east_bottom` đè `30x120px` lên `to_outer_woods_from_cp`, và `to_crooked_path_from_wc` không có lối đi ngược lại.
- **Nguyên nhân:** Cây viền Nam đặt trên nền cỏ trong vùng đệm, còn `auto_south_crooked_path` + `bound_bottom` dựng thành 2 bức tường ngang trống phía dưới tán cây.
- **File liên quan:** `src/world/WorldBuilder.ts:5840-6220`, `src/data/zones.json`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [crooked_path_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/crooked_path_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Dựng hàng rào rừng tự nhiên `Resurrected RPG` / `EPIC Ruins` trùng khớp hoàn toàn với đường biên collider, bật collider gốc cây chuẩn và bổ sung lối thông 2 chiều `crooked_path <-> sub_whispering_clearing`.
- **Ảnh hưởng gameplay:** Người chơi đi xuyên cây xanh rồi đụng phải tường vô hình trên mặt cỏ trống phía Nam.

---

### `W20-BUG-008` — Vũng Lầy Hình Hộp Chữ Nhật Quá Cỡ & Cổng Nam Chặn Im Lặng Tại `Silent Mire` / `Ancient Rune Puzzle`
- **Bug ID:** `W20-BUG-008`
- **Zone ID:** `silent_mire`, `ancient_rune_puzzle`
- **Tọa độ:** Vũng nước `(3020, 380)` (`220x110`), `(3180, 140)` (`200x85`), `(3600, 430)` (`240x120`); Cổng Nam `(3340..3420, 720..744)`; Đền đá `(3350..3700, 150..430)`
- **Hiện tượng:**
  1. `createMireWater()` dựng khối hộp chữ nhật đỏ lớn (`220x110px`) chụp lên vũng bùn hình bầu dục phẳng `Graphics`, tạo **tường vô hình ở 4 góc rìa khô** quanh vũng nước.
  2. Test `W05_silent_mire_to_drowned_depths` (`3380, 690` đi `[S]` `1.2s`) dừng chết tại `y = 734.4` ngay trong khe cầu mà không có vách đá hay rào cản trực quan nào ở `y = 720..744` (`triggerRect` lố biên Nam `4px` và `WorldGatingSystem` ép `setVelocity(0,0)`).
  3. Toàn bộ `18` collider được gắn nhãn `detached` (cự thạch `Cột Vật Tổ`, `Đèn Đá Nghi Thức`, `Bia Đá Cổ Thư`, `Rặng Cây Khô Viền *` dài `535–900px`) là vật thể `Graphics` hoặc tường ẩn nằm cách sprite gần nhất `46–120px`.
- **Nguyên nhân:** Đầm lầy dùng khối chữ nhật thô cho hình bầu dục + rặng cây biên đóng gộp thành thanh dài `535–900px` không tương xứng mật độ cây thật; `ancient_rune_puzzle` chồng tọa độ trực tiếp lên giữa quảng trường đá `silent_mire`.
- **File liên quan:** `src/world/WorldBuilder.ts:6740-6945`, `src/data/zones.json:1180-1520`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [silent_mire_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/silent_mire_BEFORE_COLLISION_OVERLAY.png), [ancient_rune_puzzle_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/ancient_rune_puzzle_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Tái thiết bằng tileset `Dead Swamp` + `Mangrove Swamp Sampler`, băm collider viền nước theo lưới `32x32` sát mép bờ, thay toàn bộ trụ/đèn/bia vector bằng pixel art thật, đồng bộ cổng `to_drowned_mire_depths` với rào chắn thị giác rõ ràng.
- **Ảnh hưởng gameplay:** Tạo cảm giác vấp góc vuông vô hình quanh hồ bùn và bị khóa bước bí ẩn ở mép Nam dù mặt đường nhìn mở toang.

---

### `W20-BUG-009` — Khe Cổng Miếu Chuông Bị Chạm Biên & Mặt Sân Gạch Tương Phản Gắt (`Broken Bell Shrine`)
- **Bug ID:** `W20-BUG-009`
- **Zone ID:** `broken_bell_shrine`
- **Tọa độ:** Cổng Tây `x = 3980..4016, y = 100..400`; rặng Bắc `(4030, 35, 900x35)`; cây đổ lỗi `(4220, 330)`
- **Hiện tượng:** `shrine_bound_left_bottom` (`3980, 360`) và `auto_east_silent_mire_seg_0` (`3984, 100`) cấn mép 2 trigger chuyển vùng (`20x40px` và `16x20px`). Rặng cây Bắc là một thanh tường ẩn dài `900px` nằm trên vùng trống, còn mặt sân đá hình bán nguyệt cắt gắt vào thảm tối trơn có nhiều chấm vuông pixel rời rạc.
- **Nguyên nhân:** Thiếu lớp chuyển tiếp bờ đá/rêu tự nhiên giữa khu rừng ẩm và thềm đá cổ Miếu Chuông; vẫn gọi `prop_fallen_log_mossy_v14` lỗi ở 2 vị trí.
- **File liên quan:** `src/world/WorldBuilder.ts:6953-7080`, `src/data/zones.json`
- **Mức ưu tiên:** **P2**
- **Ảnh bằng chứng:** [broken_bell_shrine_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/broken_bell_shrine_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Áp dụng bộ `Resurrected RPG` (`Wall.png`, `Props.png`, `portal-Sheet` nếu cần) + `EPIC Ruins` để dựng bậc đá cổ chuyển tiếp mềm mại, gỡ sạch các tường biên đè cổng.
- **Ảnh hưởng gameplay:** Giảm chất lượng thẩm mỹ khu đấu trùm trọng tâm của hồi giữa game và làm hẹp cửa ra vào.

---

### `W20-BUG-010` — `Sub Root Cellar` Dùng 100% Đồ Họa Vector Placeholder (`Phaser.Graphics`) & Portal Lố Biên
- **Bug ID:** `W20-BUG-010`
- **Zone ID:** `sub_root_cellar`
- **Tọa độ:** Toàn vùng `(480..1120, 1040..1440)`; cổng Nam `to_veil_origin_cavern` tại `(760, 1420, 80x24)`
- **Hiện tượng:** Khi vào `sub_root_cellar`, toàn cảnh chỉ là nền xanh tối trơn, một hình chữ nhật xám kèm `2` gạch chéo chữ `X` nâu tượng trưng cột rễ (lại **không có collider** nên đi xuyên thẳng qua!), `3` hình tròn xanh lơ phẳng làm nấm, và `1` hình bầu dục rỗng làm suối ngầm. Cổng `to_veil_origin_cavern` lòi xuống `y = 1444 > bounds.maxY (1440)`.
- **Nguyên nhân:** `renderSubRootCellarDecorations()` (`WorldBuilder.ts:7866-7910`) chưa từng được nâng cấp từ bản phác thảo `Graphics` ban đầu, vi phạm nghiêm trọng tiêu chuẩn Pixel Art thật của `AI_IRON_RULES.md`.
- **File liên quan:** `src/world/WorldBuilder.ts:7866-7910`, `src/data/zones.json:3254-3275`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [sub_root_cellar_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sub_root_cellar_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Dựng lại hoàn toàn hầm rễ bằng `Kauzz Cave Tiles & RPGW Caves` + `Resurrected RPG` rễ cổ thụ + nấm phát quang thật, kèm collider chân cột đá chính xác.
- **Ảnh hưởng gameplay:** Đứt gãy hoàn toàn chất lượng mỹ thuật so với Trailer V12.2 và `Bellhollow`/`LAB-01`.

---

### `W20-BUG-011` — 5 Phân Khu Mở Rộng Trống Rỗng, Thiếu Đạo Cụ & Tường Đỏ Án Ngữ Giữa Sân (`Abyssal Chasm`, `Sunken Crypt`...)
- **Bug ID:** `W20-BUG-011`
- **Zone ID:** `abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`
- **Tọa độ:** Điển hình `abyssal_chasm (2240, -960)` và `sunken_crypt_ruins (3750, -220)`
- **Hiện tượng:** Cả 5 phân khu mở rộng chỉ lặp đi lặp lại một mặt sàn gạch xám/bùn đơn điệu, **0 cây cối, 0 tượng đài, 0 đạo cụ, 0 ánh sáng** (`drawCalls = 39`, thấp bất thường do trống trơn). Riêng tại tâm `abyssal_chasm (2240, -960)` còn đặt một khối hộp đỏ khổng lồ nằm giữa mặt gạch trống trơn làm người chơi mới vào dễ va ngay giữa sân.
- **Nguyên nhân:** `WorldBuilder.ts:2734-2755` chỉ có nhánh `render*Decorations()` cho 11/17 zone (+ `fog_crossing`), bỏ trống hoàn toàn 5 vùng Layer 2/3 mở rộng cuối game.
- **File liên quan:** `src/world/WorldBuilder.ts:346-355, 2734-2755`, `src/data/zones.json`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [abyssal_chasm_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/abyssal_chasm_BEFORE_COLLISION_OVERLAY.png), [sunken_crypt_ruins_BEFORE_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/sunken_crypt_ruins_BEFORE_COLLISION_OVERLAY.png)
- **Kế hoạch sửa:** Triển khai trong `HW-WORLD-20E` bằng đúng bộ tài nguyên chuyên biệt (`RF Catacombs v1.0`, `DarkFantasy Starter`, `TF DarkDimension`, `portal-Sheet.png`, `Dead Swamp`, `RPGW Caves`).
- **Ảnh hưởng gameplay:** Làm người chơi bước vào các khu vực cốt lõi cuối game nhưng thấy bản đồ chưa hoàn thiện (placeholder).

---

### `W20-BUG-012` — Chưa Tách Tầng `Tree_Trunks` / `Tree_Canopies` & Chưa Khai Thác Bộ Tài Nguyên Studio Mới
- **Bug ID:** `W20-BUG-012`
- **Zone ID:** Toàn hệ thống bản đồ hiện tại (`fog_crossing` .. `broken_bell_shrine`)
- **Tọa độ:** Toàn cục `WorldBuilder.ts` (`createTree`, `createOrganicTreeCluster`, mặt đất `CanvasTexture`)
- **Hiện tượng:** Toàn bộ cây cũ vẽ nguyên khối 1 sprite kết hợp mặt đất vẽ thủ công bằng `ctx.fillRect` / `CanvasTexture`, chưa sử dụng bộ `Resurrected RPG 1.1` (cây tầng tán khổng lồ, tường đá cổ, đài tế, cổng dịch chuyển 29 frame), `Serene Village Revamped v1.9` hay `EPIC RPG World - Ancient Ruins / Grass Land 2.0`. Chưa áp dụng tách lớp `Tree_Trunks` vs `Tree_Canopies` như đã chứng minh thành công ở `LAB-01` (`60.05 FPS`, `8 draw calls`).
- **Nguyên nhân:** Hệ thống `WorldBuilder` cũ phát triển theo hướng code-first trước khi có bộ tài nguyên `HW-ASSET-03`.
- **File liên quan:** `src/world/WorldBuilder.ts`, `HOLLOW_WOODS_EXPORT/Pixel_Art/13_Tileset_Packs/Resurrected_RPG/`
- **Mức ưu tiên:** **P1**
- **Ảnh bằng chứng:** [bellhollow_BEFORE_OVERVIEW.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/bellhollow_BEFORE_OVERVIEW.png), [LAB_01_RESURRECTED_FOREST.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/../../Visuals/HW-ASSET-03/LAB_01_RESURRECTED_FOREST.png)
- **Kế hoạch sửa:** Chuẩn hóa pipeline Tilemap (`32x32 px`) + lớp `Tree_Trunks` / `Tree_Canopies` xuyên suốt `HW-WORLD-20B` đến `20E`, đồng thời giữ nguyên hệ thống Sanity 2.1, Lantern `[F]`, quests, NPC, boss và Black Knight.
- **Ảnh hưởng gameplay:** Nâng tầm trực tiếp thẩm mỹ tiệm cận Trailer V12.2 và triệt tiêu tận gốc cảm giác rừng rậm chật chội, chồng lấn.
