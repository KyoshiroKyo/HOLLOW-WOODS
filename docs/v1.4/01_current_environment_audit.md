# HOLLOW WOODS V1.4 — BÁO CÁO KIỂM KÊ ASSET MÔI TRƯỜNG & KIẾN TRÚC HIỆN TẠI
## ENVIRONMENT ASSET AUDIT & TECHNICAL ARCHITECTURE BASELINE (BƯỚC 1)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 (Environment Asset Overhaul, Monster Expansion & World Map Development)  
**Nhánh Git đang thực hiện:** `feat/v1.4-expansion` (Độc lập 100%, bảo vệ tuyệt đối nhánh `main` và bản phát hành V1.3)  
**Ngày thực hiện kiểm kê:** 18/11/2026  
**Trạng thái kiểm kê:** **HOÀN TẤT TOÀN DIỆN (AUDITED)**  

---

## 1. TÌNH TRẠNG NHÁNH LÀM VIỆC & CƠ CHẾ BẢO VỆ PHIÊN BẢN

1. **Nhánh Git hiện tại:** `feat/v1.4-expansion`.
2. **Cơ chế cách ly an toàn:**
   - Nhánh `main` (chứa phiên bản nền tảng thi đấu P2Game.io V1.3.4 freeze) hoàn toàn không bị ảnh hưởng.
   - Nhánh `feat/v1.4-expansion` tách biệt độc lập, cho phép thử nghiệm, nâng cấp asset đồ họa độ phân giải cao và mở rộng bản đồ thế giới mà không gây nguy cơ xung đột mã nguồn.
   - Trạng thái working tree hiện tại sạch sẽ (`nothing to commit, working tree clean`).

---

## 2. RÀ SOÁT KIẾN TRÚC QUẢN LÝ MÃ NGUỒN HIỆN TẠI

### 2.1 Quản Lý Tilemap, Tileset, Texture Atlas & Animation
- **Kiến trúc Mặt Đất (Ground Rendering Architecture):**
  - Trò chơi **không sử dụng hệ thống Phaser Tilemap JSON truyền thống** (`scene.make.tilemap()`) vì kích thước thế giới trải dài qua 12 phân khu rộng lớn ($> 5000 \times 2000\text{ px}$) sẽ gây lãng phí bộ nhớ và phát sinh hàng ngàn Tile draw calls.
  - Thay vào đó, game sử dụng kiến trúc **Baked CanvasTexture kết hợp TileSprite procedurally**:
    + Mỗi phân khu (Zone) khởi tạo một CanvasTexture riêng lúc runtime (ví dụ `fog_crossing_ground_baked_v12`, `bellhollow_ground_baked_v14`, `deep_forest_ground_baked_v14`...).
    + Sử dụng lệnh `ctx.drawImage` để vẽ lặp mẫu các tile nền cơ sở (`tile_forest_grass`, `tile_dirt_trail`, `tile_swamp_mud`, `tile_cobble_road`, `tile_stone_floor`).
    + Vẽ đè các chi tiết mỹ thuật đặc thù (vệt mòn đất cát, thảm cỏ rìa đường, đốm than bùn, vũng nước suối cạn) trực tiếp lên canvas texture với thuộc tính `ctx.imageSmoothingEnabled = false` nhằm bảo toàn độ sắc nét của Pixel Art.
    + Tạo một đối tượng `Phaser.GameObjects.Image` duy nhất đại diện cho mặt đất toàn phân khu tại lớp sâu nhất `DEPTH_GROUND_BASE = -10000`, giúp GPU render toàn bộ mặt đất của một phân khu chỉ với **1 draw call duy nhất**.
- **Texture Atlas & Tileset Hiện Có (`public/assets/environment/tilesets/`):**
  - Gói Rừng (Forest): `forest_Tileset.png` ($128 \times 240$), `forest_Decorations.png` ($256 \times 256$), `forest_Tileset1xPadding.png` ($137 \times 256$).
  - Gói Thành Cổ (Castle Medieval): `castle_cobble_road.png`, `castle_stone_floor.png`, `castle_castle_wall.png`, `castle_timber_frame_wall.png`, `castle_roof_*.png` ($16 \times 16$ và $64 \times 64$).
  - Gói TX Đa Năng: `TX Tileset Grass.png` ($256 \times 256$), `TX Tileset Stone Ground.png` ($256 \times 256$), `TX Tileset Wall.png` ($512 \times 512$), `TX Plant.png` / `TX Plant with Shadow.png` ($512 \times 512$), `TX Props.png` ($512 \times 512$), `TX Struct.png` ($512 \times 512$).
- **Animation Môi Trường:**
  - Không dùng spritesheet animation cho tĩnh vật; các chuyển động môi trường được mô phỏng mượt mà thông qua:
    + Cột khói ống khói (`createChimneySmoke`): Hạt khói tro tàn xám trắng bay lên và giãn nở bằng Tweens.
    + Đom đóm đêm & Tàn lửa hổ phách (`updateFireflies`): 45 hạt ánh sáng dao động sóng sin (`Math.sin`).
    + Màn sương The Veil đa tầng (`VeilSystem.ts`): 3 lớp sương trôi dạt Parallax với tốc độ khác nhau.
    + Cây rung rinh khi có quạ bay tán loạn (`WildlifeSystem.ts`).

### 2.2 Quản Lý Collision, Depth Sorting, Occlusion & Vùng Tương Tác
- **Hệ Thống Va Chạm (Collision):**
  - Quản lý tập trung qua `this.colliderGroup = this.scene.physics.add.staticGroup()` trong `WorldBuilder.ts`.
  - Toàn bộ ranh giới cứng của thế giới (`type: 'boundary'`) được nạp từ `zones.json` thành các Arcade Physics Body tĩnh vô hình (`setVisible(false), setAlpha(0)`).
  - Cây cối, công trình, tảng đá: Áp dụng nguyên lý **Footprint Collider (Hộp va chạm chân gốc)**:
    + Ví dụ: Cây sồi cổ thụ có kích thước ảnh $113 \times 139\text{ px}$ nhưng hộp va chạm ở chân chỉ có kích thước $20 \times 12\text{ px}$ tại tọa độ $(x, y)$.
    + Điều này cho phép nhân vật chính có thể đi vòng ra sau thân cây hoặc luồn lách dưới tán lá mà không bị vướng tường vô hình.
- **Hệ Thống Trật Tự Chiều Sâu (Depth Sorting / Y-Sorting):**
  - Phân tầng độ sâu 2.5D chặt chẽ qua các hằng số trong `Constants.ts`:
    + `DEPTH_GROUND_BASE = -10000`: Mặt đất baked cơ sở.
    + `DEPTH_GROUND_FOOTING = -9500`: Chân móng, bờ đá kè suối.
    + `DEPTH_GROUND_TURF = -9200`: Đốm cỏ rêu phủ.
    + `DEPTH_GROUND_STONES = -9100`: Sỏi đá cuội sát mặt đất.
    + `DEPTH_GROUND_FLORA = -9000`: Hoa cỏ sát sàn.
    + `DEPTH_GROUND_WATER = -8900`: Vũng nước, dòng suối đầm lầy.
    + `DEPTH_GROUND_MIST = -8000`: Sương mù ranh giới mặt đất.
    + `DEPTH_VEIL_GROUND_FOG = -7000`: Sương mù lượn sát chân nhân vật.
  - Các thực thể nổi và di động (Player, NPC, Monsters, Cây cối, Tảng đá, Nhà cửa):
    + Gán thuộc tính `depth = Math.floor(y)`.
    + Chân thực thể nào có tọa độ Y lớn hơn (ở phía dưới màn hình) sẽ hiển thị đè lên thực thể có tọa độ Y nhỏ hơn (ở phía trên).
    + Bóng đổ mặt đất: `footShadowGfx.setDepth(this.depth - 1)`.
    + Đèn lồng hổ phách: `lanternOverlayGfx.setDepth(this.depth + 1)`.
- **Cơ Chế Che Khuất & Tán Cây Trong Suốt (Occlusion / Transparency):**
  - Quản lý qua `WorldBuilder.treeCanopyGroup` và hàm `updateCanopyTransparency(playerX, playerY)`.
  - Mỗi khung hình, hệ thống kiểm tra bounding box của tán lá cây:
    + $X \in [x - \text{halfW}, x + \text{halfW}]$, $Y \in [y - \text{height} \times \text{originY}, y + 8]$.
    + Khi người chơi đi bên dưới tán lá (`isUnderCanopy = true`), cây tự động làm mờ về `alpha = 0.35` bằng nội suy tuyến tính `Phaser.Math.Linear(tree.alpha, 0.35, 0.2)`. Khi bước ra ngoài, cây trả về `alpha = 1.0`.
- **Vùng Tương Tác (Interactables & Triggers):**
  - Định nghĩa tập trung trong `zones.json` (mảng `interactables`), nạp vào `WorldBuilder.interactables`.
  - Quản lý 7 nhóm tương tác: Điểm ẩn nấp (`hiding_spot`), Manh mối (`clue`), Đối thoại (`dialogue`), Rương (`chest`), Bàn chế tạo (`crafting`), Giếng làng (`well`), Bia cổ (`stele`).
  - Hệ thống Dirty-Checking trong `GameScene.ts` chỉ kích hoạt **Viền sáng tương tác duy nhất (Single Highlight Outline)** 1.5px trắng kem cho đúng 1 mục tiêu gần nhất trong phạm vi $36\text{ px} - 52\text{ px}$, không bật viền tràn lan.

### 2.3 Quản Lý ID Nội Dung, Runtime Key, Save/Load & Liên Kết Phân Khu
- **Hệ Thống Định Danh 4 Tầng (`content_registry.json`):**
  - `contentId`: Định danh chuẩn hóa First-party (ví dụ: `HW-ENV-TREE-000001`, `HW-NPC-ALLY-000001`, `HW-MON-SKULLWOLF-000001`).
  - `runtimeKey`: Khóa định danh mã nguồn chạy trong game (`tree_oak_1`, `npc_campfire_knight`, `mon_skull_wolf`).
  - `assetId`: Khóa tham chiếu tài nguyên (`HW-AST-ENV-OAK1`, `HW-AST-NPC-CAMPFIREKNIGHT`).
  - `category` & `mirrorMode`: Hỗ trợ mở rộng dữ liệu an toàn mà không làm gãy các liên kết cũ.
- **Save/Load & Non-Destructive Migrator (`SaveManager.ts`):**
  - Schema Version 3, tự động chuyển đổi file lưu V1.3 sang V1.4.
  - Lưu giữ tọa độ nhân vật `position: { x, y, currentZone }`, mốc hồi sinh `checkpointName`, túi đồ `inventory`, 4 ô trang bị `equippedSlots`, rương 12 ô `storageChestInventory`, tiến trình thức tỉnh ký ức `memoryAwakeningStage`, và bảo toàn 100% dữ liệu mod lạ qua `legacyExtraData`.
- **Vị Trí NPC, Quái Vật & Tài Nguyên:**
  - 6 NPC làng Bellhollow có vị trí và phạm vi tuần tra cố định: Garth (520, 265), Edda (710, 380), Neris (970, 215), Bram (1045, 365), Finn (760, 260), Hiệp Sĩ Canh Lửa (818, 270).
  - Quái vật và động vật hoang dã được quản lý qua `WildlifeSystem.ts` với các bảng tọa độ Habitat cho từng phân khu, cơ chế ngủ đông Culling Radius $560\text{ px}$ và hàm chuyển vùng `switchZone(zoneId)`.
  - Tài nguyên thu thập: Nạp từ `zones.json` và phân bổ dọc các lối mòn (Gỗ khô, Nhựa cây, Thảo dược, Đá lửa).
- **Liên Kết Giữa Các Phân Khu (Zone Transitions):**
  - Thế giới Hollow Woods hiện gồm **12 phân khu** liên kết liền mạch qua mảng `transitions` trong `zones.json`:
    1. `fog_crossing` (Lối Mòn Xuyên Sương): $0 \le x \le 480$
    2. `bellhollow` (Làng Chuông Gỗ Bellhollow): $480 \le x \le 1600$, $-200 \le y \le 760$
    3. `crooked_path` (Đường Mòn Quanh Co): $1600 \le x \le 2880$, $0 \le y \le 640$
    4. `silent_mire` (Đầm Lầy Tĩnh Lặng): $2880 \le x \le 4000$, $100 \le y \le 740$
    5. `broken_bell_shrine` (Miếu Chuông Phế Tích): $4000 \le x \le 4960$, $0 \le y \le 600$
    6. `sanctuary_farm` (Nông Trại Trú Ẩn): $480 \le x \le 1120$, $560 \le y \le 1040$
    7. `outer_woods` (Rừng Ngoài): $1120 \le x \le 1600$, $560 \le y \le 1040$
    8. `deep_forest` (Rừng Sâu Abyssal): $1600 \le x \le 2880$, $-640 \le y \le 0$
    9. `ancient_rune_puzzle` (Đài Cổ Ngữ): $3350 \le x \le 3700$, $150 \le y \le 430$
    10. `sub_bell_workshop` (Xưởng Chuông Bỏ Hoang): $1120 \le x \le 1600$, $1040 \le y \le 1440$
    11. `sub_root_cellar` (Hầm Rễ Cổ): $480 \le x \le 1120$, $1040 \le y \le 1440$
    12. `sub_whispering_clearing` (Khoảng Trống Thì Thầm): $1600 \le x \le 2080$, $-360 \le y \le 0$
  - Các dải tiếp giáp chuyển tiếp tự nhiên (Zone Boundary Transitions) dài $180\text{ px} - 220\text{ px}$ được vẽ phủ để hòa trộn màu sắc, xóa bỏ vệt cắt cứng giữa các phân khu liền kề.

---

## 3. BẢNG KIỂM KÊ TOÀN BỘ ASSET MÔI TRƯỜNG HIỆN ĐANG SỬ DỤNG TRONG GAME

### Nhóm 1: Nền Đất Rừng, Đất Khô, Đất Ẩm, Bùn Lầy
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| `tile_forest_grass.png` | $32 \times 32\text{ px}$ | PNG | `public/assets/environment/tiles/` | Nền cỏ rừng cơ bản sẫm màu, dùng cho Fog Crossing, Bellhollow, Outer Woods, Whispering Clearing. |
| `tile_dirt_trail.png` | $32 \times 32\text{ px}$ | PNG | `public/assets/environment/tiles/` | Đất mòn khô nén chặt, nền lối đi đất cát xuyên rừng và quanh các gốc cây. |
| `tile_swamp_mud.png` | $32 \times 32\text{ px}$ | PNG | `public/assets/environment/tiles/` | Đất than bùn sũng nước, sình lầy đục ngầu dùng cho Silent Mire. |
| *Tilled Soil (Procedural)* | Procedural | Canvas | Baked trực tiếp trong `WorldBuilder` | Đất mùn nâu ẩm cày xới (`#3a2817`) và rãnh dẫn nước (`#22180f`) cho Sanctuary Farm và Root Cellar. |
| *Abyssal Soil (Procedural)*| Procedural | Canvas | Baked trực tiếp trong `WorldBuilder` | Đất tím đen hoại mục ẩm lạnh (`#111613`, `#0d1210`) cho Rừng Sâu Deep Forest. |

### Nhóm 2: Đường Mòn, Lối Đi, Nền Đá, Nền Đất Quanh Làng (Bellhollow)
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| `tile_cobble_road.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/tiles/` | Đá cuội lát đường trục chính làng Bellhollow từ Cổng Tây tới Tháp Chuông. |
| `tile_stone_floor.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/tiles/` | Đá tảng phẳng lát nền nhà Edda, nhà Neris, thềm Lò Rèn Bram và sân tế. |
| `castle_cobble_road.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/tilesets/` | Gạch lát đường thành cổ thời trung cổ. |
| `castle_cobble_road_dark.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/tilesets/` | Gạch lát đường cổ tối màu, dùng chuyển tiếp ra bìa rừng. |
| `castle_stone_floor_checker.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/tilesets/` | Nền đá hoa caro cổ kính cho các công trình trang trọng. |
| `castle_wood_plank.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/tilesets/` | Ván gỗ lát sàn lầu, chòi gác và cầu cảng đầm lầy. |

### Nhóm 3: Đá, Tảng Đá, Vách Đá, Sỏi, Cấu Trúc Địa Hình
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| `rock_large.png` | $64 \times 48\text{ px}$ | PNG | `public/assets/environment/sprites/` | Tảng đá granit khối lớn phủ rêu, chắn lối và phân định biên giới phân khu. |
| `rock_medium.png` | $48 \times 40\text{ px}$ | PNG | `public/assets/environment/sprites/` | Khối đá vừa, bố trí quanh bờ suối cạn, bìa rừng và chân các sườn dốc. |
| *West Barrier Cliff* | Procedural | Canvas | Baked trong `createWestBarrierLandscape` | Dãy vách đá xám rêu cao $48\text{ px}$ chặn lối đi lùi về phía Tây đầu game. |
| *Collapsed Bridge Chasm* | Procedural | Arcade/Gfx | Dựng trong `createCollapsedStoneBridgeObstacle` | Vực sương sâu nứt toác tại $(1790, 280)$ chặn lối đi thẳng tới Tháp Chuông. |
| `TX Tileset Stone Ground.png`| $256 \times 256\text{ px}$| PNG | `public/assets/environment/tilesets/` | Atlas sỏi đá cuội và mảnh đá vỡ rải rác trên nền đất. |

### Nhóm 4: Rêu Phong, Cỏ Dại, Bụi Cây, Cây Non, Thực Vật
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| `bush_dense_1.png` | $50 \times 44\text{ px}$ | PNG | `public/assets/environment/sprites/` | Bụi rậm lá tròn rậm rạp, dùng làm điểm ẩn nấp (`hiding_spot`) và viền đường. |
| `bush_dense_2.png` | $41 \times 47\text{ px}$ | PNG | `public/assets/environment/sprites/` | Bụi cây gai rậm tối màu, dùng làm điểm ẩn nấp tại bìa đầm lầy và rừng ngoài. |
| `TX Tileset Grass.png` | $256 \times 256\text{ px}$ | PNG | `public/assets/environment/tilesets/` | Mảng cỏ dại, đốm cỏ dày và rêu xanh sẫm phủ bề mặt. |
| `TX Plant.png` / `with Shadow` | $512 \times 512\text{ px}$ | PNG | `public/assets/environment/tilesets/` | Atlas các bụi dương xỉ, hoa dại, cây bụi nhỏ và rêu phủ thân gỗ. |

### Nhóm 5: Cây Lớn, Cây Cổ Thụ, Gốc Cây, Rễ Cây, Thân Cây Đổ
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| `tree_oak_1.png` | $113 \times 139\text{ px}$ | PNG | `public/assets/environment/sprites/` | Cây sồi cổ thụ tán rộng rậm rạp, thân sần sùi bám rêu, hỗ trợ làm mờ khi đứng sau. |
| `tree_oak_2.png` | $95 \times 136\text{ px}$ | PNG | `public/assets/environment/sprites/` | Cây sồi tán nhọn vươn cao, độ che phủ lớn. |
| `tree_oak_3.png` | $83 \times 120\text{ px}$ | PNG | `public/assets/environment/sprites/` | Cây sồi kích thước trung bình bố trí xen kẽ. |
| `hollow_tree.png` | $40 \times 32\text{ px}$ | PNG | `public/assets/environment/sprites/` | Thân cây cổ thụ rỗng ruột bị sét đánh — điểm ẩn nấp sống còn khi quái vật săn lùng. |
| `tree_dead.png` | $24 \times 27\text{ px}$ | PNG | `public/assets/environment/sprites/` | Cây gỗ khô khẳng khiu, thân nứt nẻ không lá, tạo không khí tử khí u ám. |
| *Dead Titan Willow* | Procedural | Canvas/Gfx | Dựng trong `createDeadTitanWillow` | Cây liễu khổng lồ chết đứng giữa đầm lầy Silent Mire $(3400, 360)$. |
| *Fallen Logs* | Procedural | Canvas/Gfx | Dựng trong `createFallenLog` | Thân cổ thụ đổ ngang đường rêu phong dài $50\text{ px} - 70\text{ px}$. |
| *Tangled Roots* | Procedural | Canvas/Gfx | Dựng trong `createTangledRoots` | Chùm rễ cây đại ngàn trồi lên mặt đất gồ ghề tại Crooked Path và Hầm Rễ Cổ. |

### Nhóm 6: Thảm Thực Vật, Lá Rụng, Nấm, Hoa Dại, Chi Tiết Trang Trí
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| *Bioluminescent Mushrooms* | Procedural | Tweens/Gfx | Dựng trong `createBioluminescentMushrooms` | Cụm nấm phát quang lam ngọc & tím nhạt nhấp nháy trong Rừng Sâu. |
| *Cattails Cluster* | Procedural | Graphics | Dựng trong `createCattailsCluster` | Đám lau sậy nước mọc ven bờ sình lầy đầm Silent Mire. |
| `res_herbs.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/sprites/` | Cây thuốc thảo dược dại nở hoa vàng nhạt, điểm thu hái nguyên liệu chế thuốc. |
| `res_tree_resin.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/sprites/` | Giọt nhựa thông màu hổ phách chảy trên vỏ cây thông già. |
| `res_dry_wood.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/sprites/` | Cành củi khô gãy vụn rơi rụng dưới gốc sồi, nguyên liệu giữ lửa trại. |
| `res_flint.png` | $16 \times 16\text{ px}$ | PNG | `public/assets/environment/sprites/` | Mảnh đá lửa màu xám đen sắc nhọn nhặt ven sườn dốc đá. |
| `wooden_fence.png` | $47 \times 53\text{ px}$ | PNG | `public/assets/environment/sprites/` | Hàng rào gỗ mộc đơn sơ bảo vệ vườn tược và quây quanh làng Bellhollow. |
| `signpost.png` | $29 \times 32\text{ px}$ | PNG | `public/assets/environment/sprites/` | Biển chỉ đường bằng gỗ cắm cọc, đã Việt hóa nội dung cảnh báo. |

### Nhóm 7: Nền Đầm Lầy, Rừng Sâu, Khu Vực Cổ Ngữ, Công Trình Bỏ Hoang
| Tên File Asset | Kích Thước | Định Dạng | Vị Trí Lưu Trữ | Vai Trò & Phân Khu Sử Dụng |
| :--- | :---: | :---: | :--- | :--- |
| `bell_tower.png` | $80 \times 112\text{ px}$ | PNG | `public/assets/environment/sprites/` | Tháp Chuông Đồng làng Bellhollow, trung tâm ánh sáng và tín ngưỡng của làng. |
| `broken_shrine.png` | $96 \times 80\text{ px}$ | PNG | `public/assets/environment/sprites/` | Miếu Chuông Phế Tích linh thiêng đổ nát ở tận cùng phía Đông bản đồ. |
| `house_edda.png` | $112 \times 80\text{ px}$ | PNG | `public/assets/environment/sprites/` | Ngôi nhà gỗ mái rạ của Bà lão giữ chuông Edda. |
| `house_neris.png` | $112 \times 80\text{ px}$ | PNG | `public/assets/environment/sprites/` | Ngôi nhà thảo dược của Neris với vườn thuốc nhỏ phía trước. |
| `village_well.png` | $39 \times 46\text{ px}$ | PNG | `public/assets/environment/sprites/` | Giếng nước cổ bằng đá cuội viền rêu ở trung tâm làng Bellhollow. |
| `crafting_bench.png` | $67 \times 36\text{ px}$ | PNG | `public/assets/environment/sprites/` | Bàn chế tác công cụ sinh tồn cạnh đe rèn của thợ rèn Bram. |
| `stone_altar.png` | $60 \times 42\text{ px}$ | PNG | `public/assets/environment/sprites/` | Bệ thờ đá cổ ngữ tế lễ trong rừng. |
| `pillar_moon.png` | $32 \times 61\text{ px}$ | PNG | `public/assets/environment/sprites/` | Trụ Cổ Ngữ Mặt Trăng (Moon Rune Pillar) phát quang lam ngọc. |
| `pillar_root.png` | $31 \times 61\text{ px}$ | PNG | `public/assets/environment/sprites/` | Trụ Cổ Ngữ Cội Rễ (Root Rune Pillar) phát quang lục bảo. |
| `pillar_eye.png` | $32 \times 52\text{ px}$ | PNG | `public/assets/environment/sprites/` | Trụ Cổ Ngữ Con Mắt (Eye Rune Pillar) phát quang hổ phách. |
| *Boardwalk Pier* | Procedural | Canvas/Gfx | Dựng trong `createBoardwalkPier` | Cầu cảng gỗ mục bắc ra đầm lầy Silent Mire. |
| *Sunken Monolith Ruins* | Procedural | Canvas/Gfx | Dựng trong `createSunkenMonolithRuins` | Tàn tích khối đá chìm rêu phong nửa nổi nửa chìm trong đầm lầy. |
| `fog_smooth.png` | $512 \times 256\text{ px}$ | PNG | `public/assets/environment/sprites/` | Sprite sương mù mịn bán trong suốt dùng cho các lớp phủ sương của `VeilSystem`. |

---

## 4. KẾT LUẬN & ĐÁNH GIÁ ĐỊNH HƯỚNG BƯỚC TIẾP THEO

1. **Đánh giá hiện trạng:**
   - Hệ thống quản lý môi trường hiện tại được tối ưu hóa cực kỳ xuất sắc về mặt hiệu năng (dùng CanvasTexture baking kết hợp Footprint Collider và Y-sorting).
   - Tuy nhiên, phần lớn các chi tiết địa hình nâng cao (thân cây đổ, vách đá, vực sương, cầu gỗ phụ, nước đầm lầy, tàn tích chìm) hiện đang được dựng bằng mã lệnh đồ họa procedural (`Graphics`/`Canvas context`), dẫn đến sự chưa đồng bộ hoàn toàn về mặt phong cách nghệ thuật chi tiết (Pixel Art detail consistency) so với các sprite nhân vật và quái vật chất lượng cao.
2. **Kế hoạch cho các bước tiếp theo của V1.4:**
   - Tận dụng các gói tài nguyên Pixel Art chuyên biệt (như `TopDownFantasy_Forest_v1`, `Updated-Trees`, `The Fan-tasy Tileset`) để chuẩn hóa và thay thế các thành phần procedural bằng Sprite Pixel Art vẽ tay đồng bộ phong cách Dark Woodland.
   - Giữ nguyên 100% kiến trúc Footprint Collider và Y-Sorting depth đã hoạt động ổn định hoàn hảo.
   - Không phá vỡ bất kỳ tọa độ logic hay vùng chuyển tiếp phân khu nào trong `zones.json`.
