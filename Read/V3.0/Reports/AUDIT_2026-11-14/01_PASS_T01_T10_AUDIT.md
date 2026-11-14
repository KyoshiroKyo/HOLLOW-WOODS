# 🔍 BÁO CÁO KIỂM TOÁN ĐỘC LẬP: CHU KỲ 1 (PASS T01 – T10)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Tài liệu đối chiếu:** Toàn bộ báo cáo trong `Read/V3.0/Reports/`, mã nguồn `src/`, asset `public/assets/`, và script `scripts/`
> **Ngày thực hiện:** 2026-11-14
> **Nguyên tắc làm việc:** Trung thực kỹ thuật, bằng chứng nhị phân thực tế, không hợp thức hóa các báo cáo PASS trước đây

---

## 1. BẢNG TỔNG HỢP KẾT QUẢ KIỂM TOÁN 10 PASS ĐẦU TIÊN (T01 – T10)

| Hạng mục kiểm toán | PASS đối chiếu | Tuyên bố trước đây | Hiện trạng thực tế trên đĩa & mã nguồn | Trạng thái kiểm toán |
|---|---|---|---|:---:|
| **1. Nhân vật & Chuyển động** | **T01 – T03** | Spritesheet Satyr Dark Rogue từ AnimationSheet, 35 frame, collider 14×8 | File ảnh thực tế là 1408×256 px (88 frame) từ nguồn Midjourney; animation lẫn hành động; giật hướng đi chéo | ⚠️ **PARTIAL** |
| **2. Cây cối & Bụi rậm** | **T04** | Trích xuất 7 sprite môi trường pixel art (.png) thật | Đúng 7 file PNG tồn tại, kích thước chuẩn, nạp và render chính xác trong WorldBuilder | ✅ **VERIFIED** |
| **3. Nhà cửa & Kiến trúc** | **T05** | Ghép 4 công trình kiến trúc pixel art từ tileset lâu đài | Đầy đủ 4 công trình (2 nhà dân, tháp chuông, miếu phế tích), collider chân tường chuẩn | ✅ **VERIFIED** |
| **4. Props & Cột đá Rune** | **T06** | Trích xuất 8 props và cột đá giải đố Act 4 | Đầy đủ 8 sprite PNG, collider chính xác, kết nối logic câu đố Act 4 trơn tru | ✅ **VERIFIED** |
| **5. Terrain & Tilemap** | **T07** | Bóc tách 5 tile địa hình mặt đất (cỏ, đường mòn, bùn, đá) | **Tile cỏ bị cắt nhầm vào bụi cây bóng đổ: có 202 pixel trong suốt & 202 pixel đen**, mặt đất bị biến thành bàn cờ loang lổ | ❌ **FAILED** |
| **6. WorldBuilder & Môi trường** | **T08** | Thay thế 100% hình vẽ hình học bằng Sprite .png thật | Cây và nhà dùng sprite thật, nhưng **tảng đá và vũng nước đầm lầy VẪN DÙNG hình vẽ hình học (fillEllipse)** | ⚠️ **PARTIAL** |
| **7. NPC & Portrait** | **T09** | Tích hợp 3 NPC kèm chân dung thoại 64×64 px | Asset NPC và chân dung có thật, nhưng **Hộp thoại bị Camera Zoom 2.2× đẩy văng xuống Y=866 px (ngoài màn hình)** | ⚠️ **PARTIAL** |
| **8. Quái vật & Sương mù** | **T10** | Trích xuất The Listener, The Echo & Sương mù mềm mại | Asset có thật, Listener hoạt động; nhưng **hàm updateFogOfWar liên tục tạo/hủy Graphics ở 60 FPS gây áp lực rác GC** | ⚠️ **PARTIAL** |

---

## 2. CHI TIẾT KIỂM TOÁN TỪNG HẠNG MỤC

### 📌 HẠNG MỤC 1: T01 – T03 (SATYR, SPRITE SHEET, ANIMATION, COLLIDER)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- **T01:** Bóc tách và định vị Spritesheet Dark Rogue từ file gốc `Pixel_Art/AnimationSheet_Character.png`, xác định ma trận 5 hàng × 8 cột, ô `64×64` px, opaque bounds thực `36×58` px.
- **T02:** Trích xuất 35 frames sprite nhân vật và ghép vào `public/assets/characters/satyr/satyr_sheet.png` kích thước `320×352` px (5 cột × 11 hàng trong Pass G1 hoặc 5 chuỗi hoạt ảnh: Idle 4f, Run 8f, Jump 8f, Crouch 3f, Hurt 7f).
- **T03:** Đăng ký hoạt ảnh trong `SatyrAnimations.ts` và tích hợp `SatyrPlayer.ts`: Gán Origin `(0.50, 0.90)`, Foot Collider `14×8` px tại offset `(25, 50)`, chuyển động 4 hướng mượt mà, triệt tiêu hiện tượng nổi lơ lửng.

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step1_clean_dark_rogue.mjs`
- `scripts/step2_pack_dark_rogue_grid.mjs`
- `public/assets/characters/satyr/satyr_sheet.png`
- `src/animation/SatyrAnimations.ts` (lưu ý: thư mục tên là `animation` số ít, không phải `animations`)
- `src/data/satyr_animations.json`
- `src/entities/SatyrPlayer.ts`
- `src/config/Constants.ts`

#### 3. Tính năng có thực sự tồn tại không?
- **Tồn tại một phần.** File spritesheet `satyr_sheet.png` có tồn tại trên đĩa cứng; mã nguồn đăng ký hoạt ảnh và điều khiển người chơi `SatyrPlayer` có hoạt động trong game.

#### 4. Có bằng chứng chạy thực tế không?
- Đã đọc cấu trúc nhị phân của file `public/assets/characters/satyr/satyr_sheet.png`.
- Phaser nạp thành công spritesheet và khởi tạo các hoạt ảnh `satyr_idle_down`, `satyr_walk_down`, `satyr_run_down`, `satyr_idle_left`, v.v.
- Lệnh `npx tsc --noEmit` hoàn thành với 0 lỗi biên dịch.

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được:
- **Mâu thuẫn thông số nghiêm trọng giữa Báo cáo và Nhị phân thực tế:**
  * Báo cáo ghi: Spritesheet kích thước `320×352` px gồm 35 frames (5 hàng × 8 cột hoặc 5 cột × 11 hàng).
  * Thực tế trên đĩa: File `satyr_sheet.png` có kích thước **1408 × 256 px** (22 cột × 4 hàng = 88 frames kích thước 64×64 px)!
  * Nguồn ảnh thực tế không phải là `AnimationSheet_Character.png` như báo cáo ghi, mà là `Pixel_Art/Dark Rogue/a_detailed_game_asset_reference_sprite_sheet_in_a.png` và `DarkRogue_Transparent_SpriteSheet.png` (ảnh sinh từ AI Midjourney).
- **Lỗi chu kỳ hoạt ảnh (Animation Frame Contamination):**
  * Trong `step2_pack_dark_rogue_grid.mjs`, script chia đều chiều ngang thành 22 cột cố định. Tuy nhiên, dải sprite AI không phải là chuỗi bước đi đều đặn 22 bước; các frame 4..9 (được gán cho `satyr_walk_down`) chứa lẫn lộn các tư thế vung kiếm, chuẩn bị tấn công và ngồi xổm, khiến dáng đi của nhân vật bị giật và biến dạng động tác.
- **Lỗi giật hướng khi đi chéo (Diagonal Stutter):**
  * Trong `SatyrPlayer.ts` (hàm `updateFacingDirection`), khi người chơi ấn 2 phím cùng lúc (ví dụ W + D hoặc S + A), `Math.abs(moveX) === Math.abs(moveY)`. Thuật toán rơi vào nhánh `else` (ưu tiên trục Y), khiến nhân vật liên tục đổi hướng nhìn giữa ngang và dọc khi nhấn nhả phím, gây hiện tượng rung lắc hướng nhìn.
- **Trạng thái đánh giá:** ⚠️ **PARTIAL**

---

### 📌 HẠNG MỤC 2: T04 (CÂY CỐI VÀ BỤI RẬM)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Bóc tách 7 sprite môi trường pixel art độc lập từ `TX Plant with Shadow.png` (512×512 px) và `forest_Decorations.png` (256×256 px).
- Tạo ra 3 cây cổ thụ sồi (`tree_oak_1..3`), 2 bụi rậm rậm rạp (`bush_dense_1..2`), 1 gốc cây rỗng (`hollow_tree`), và 1 cây khô sương mù (`tree_dead`).
- Nạp vào `PreloadScene.ts` và thay thế các vòng tròn xanh lá trong thế giới.

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step4_extract_trees.mjs`
- `public/assets/environment/sprites/tree_oak_1.png` (113×139 px)
- `public/assets/environment/sprites/tree_oak_2.png` (95×136 px)
- `public/assets/environment/sprites/tree_oak_3.png` (83×120 px)
- `public/assets/environment/sprites/bush_dense_1.png` (50×44 px)
- `public/assets/environment/sprites/bush_dense_2.png` (41×47 px)
- `public/assets/environment/sprites/hollow_tree.png` (40×32 px)
- `public/assets/environment/sprites/tree_dead.png` (24×27 px)
- `src/scenes/PreloadScene.ts` (dòng 99–105)
- `src/world/WorldBuilder.ts` (hàm `createTree`, `createHollowTree`, `createDenseBush`)

#### 3. Tính năng có thực sự tồn tại không?
- **Tồn tại 100%.** Toàn bộ 7 file ảnh PNG đều có mặt trên đĩa, kích thước pixel hoàn toàn khớp với tọa độ cắt trong script.

#### 4. Có bằng chứng chạy thực tế không?
- `PreloadScene.ts` nạp đầy đủ cả 7 ảnh vào cache texture của Phaser.
- `WorldBuilder.ts` sử dụng `this.scene.add.image(...)` với các hằng số texture tương ứng để dựng cây cối trên toàn bộ 5 phân khu thế giới.
- Nhân vật có thể ẩn nấp bên trong `hollow_tree` thông qua phím `[E]` (liên kết với cơ chế stealth tránh The Listener).

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được:
- Không có mâu thuẫn kỹ thuật. Tọa độ crop chính xác, nền trong suốt sạch sẽ, điểm neo chân cây `setOrigin(0.5, 0.88)` kết hợp với collider `20×12` px giúp người chơi đi xuyên qua tán cây và cọ sát đúng gốc cây theo trục Y.
- **Trạng thái đánh giá:** ✅ **VERIFIED**

---

### 📌 HẠNG MỤC 3: T05 (NHÀ CỬA, THÁP CHUÔNG, KIẾN TRÚC)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Ghép các tile thành phần từ bộ tileset lâu đài (`castle_timber_frame_wall.png`, `castle_roof_thatch.png`, `castle_tower_red_roof.png`, v.v.) để tạo ra 4 công trình kiến trúc pixel art hoàn chỉnh:
  * `house_edda.png` (112×80 px)
  * `house_neris.png` (112×80 px)
  * `bell_tower.png` (80×112 px)
  * `broken_shrine.png` (96×80 px)
- Nạp vào game và thiết lập vùng va chạm chân tường.

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step5_build_buildings.mjs`
- `public/assets/environment/sprites/house_edda.png`
- `public/assets/environment/sprites/house_neris.png`
- `public/assets/environment/sprites/bell_tower.png`
- `public/assets/environment/sprites/broken_shrine.png`
- `src/scenes/PreloadScene.ts` (dòng 108–111)
- `src/world/WorldBuilder.ts` (hàm `createBuilding`, `createBellTower`, `createShrineAltar`)

#### 3. Tính năng có thực sự tồn tại không?
- **Tồn tại 100%.** Cả 4 file PNG tồn tại trên đĩa cứng, được ghép từ các tile 16×16 một cách logic và mỹ thuật.

#### 4. Có bằng chứng chạy thực tế không?
- `PreloadScene.ts` nạp cả 4 công trình.
- `WorldBuilder.ts` tạo đối tượng nhà Edda, nhà Neris, Tháp Chuông tại làng Bellhollow và Miếu Đổ tại phân khu `broken_bell_shrine`.
- Tháp chuông được liên kết với sự kiện rung chuông hoàn thành Act 6 (`EndingSystem.ts`).

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được:
- Không có mâu thuẫn. Chiều cao và chiều rộng thực tế khớp với thiết kế. Vùng va chạm vật lý đặt ở chân tường (`body.setSize(w, 24)` hoặc `body.setSize(w, 32)`), cho phép người chơi đứng sát cửa nhà mà không bị kẹt lơ lửng trên mái.
- **Trạng thái đánh giá:** ✅ **VERIFIED**

---

### 📌 HẠNG MỤC 4: T06 (PROPS, CỘT ĐÁ, ĐẠO CỤ)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Bóc tách 8 vật thể môi trường và đạo cụ tương tác từ `TX Props with Shadow.png` (512×512 px):
  1. `pillar_moon.png` (32×64 px) – Cột Đá Cổ Ngữ Mặt Trăng
  2. `pillar_root.png` (32×64 px) – Cột Đá Cổ Ngữ Rễ Cây
  3. `pillar_eye.png` (32×64 px) – Cột Đá Cổ Ngữ Con Mắt
  4. `village_well.png` (48×48 px) – Giếng nước làng Bellhollow
  5. `crafting_bench.png` (48×32 px) – Bàn chế tạo
  6. `stone_altar.png` (48×32 px) – Bệ thờ đá Miếu Chuông
  7. `wooden_fence.png` (48×24 px) – Hàng rào gỗ
  8. `signpost.png` (24×32 px) – Biển gỗ sương mù

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step6_extract_props.mjs`
- `public/assets/environment/sprites/pillar_moon.png`, `pillar_root.png`, `pillar_eye.png`
- `public/assets/environment/sprites/village_well.png`, `crafting_bench.png`, `stone_altar.png`
- `public/assets/environment/sprites/wooden_fence.png`, `signpost.png`
- `src/scenes/PreloadScene.ts` (dòng 114–121)
- `src/world/WorldBuilder.ts` (hàm `createRunestonePillar`, `createVillageWell`, `createCraftingBench`, `createVillageFence`, `createStoneSign`)
- `src/systems/PuzzleSystem.ts`

#### 3. Tính năng có thực sự tồn tại không?
- **Tồn tại 100%.** Cả 8 file sprite PNG đều có mặt trên đĩa đúng kích thước mô tả.

#### 4. Có bằng chứng chạy thực tế không?
- Đầy đủ trong cấu trúc scene và bộ nạp texture.
- 3 Cột đá cổ ngữ được tích hợp trực tiếp vào câu đố Act 4 (`PuzzleSystem.ts`): người chơi phải kích hoạt đúng thứ tự Mặt Trăng -> Rễ Cây -> Con Mắt để mở đường đến Miếu Chuông. Bàn chế tạo mở ra giao diện `CraftingModal`.

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được:
- Không có mâu thuẫn kỹ thuật. Asset sạch, bounding box khớp thực tế, va chạm vật lý hoạt động đúng kịch bản game.
- **Trạng thái đánh giá:** ✅ **VERIFIED**

---

### 📌 HẠNG MỤC 5: T07 (TERRAIN VÀ TILEMAP)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Bóc tách 5 tile địa hình mặt đất từ `forest_Tileset.png` (128×240 px) và các tileset phụ:
  * `tile_forest_grass.png` (32×32 px) – Nền cỏ rừng sương mù
  * `tile_dirt_trail.png` (32×32 px) – Đường mòn đất
  * `tile_swamp_mud.png` (32×32 px) – Bùn rêu đầm lầy
  * `tile_cobble_road.png` (16×16 px) – Đường đá cuội làng Bellhollow
  * `tile_stone_floor.png` (16×16 px) – Sân đá Miếu Chuông

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step7_extract_terrain_tiles.mjs`
- `public/assets/environment/tiles/tile_forest_grass.png`
- `public/assets/environment/tiles/tile_dirt_trail.png`
- `public/assets/environment/tiles/tile_swamp_mud.png`
- `public/assets/environment/tiles/tile_cobble_road.png`
- `public/assets/environment/tiles/tile_stone_floor.png`
- `src/world/WorldBuilder.ts` (hàm `renderZoneTerrain`)
- `FULL_DIAGNOSTIC_REPORT.md` (Mục 2 & Mục 4)

#### 3. Tính năng có thực sự tồn tại không?
- Các file tile có được tạo ra trong thư mục `public/assets/environment/tiles/`.

#### 4. Có bằng chứng chạy thực tế không?
- `PreloadScene.ts` nạp các tile này, và `WorldBuilder.ts` sử dụng `this.scene.add.tileSprite(...)` để lặp lại các tile này phủ kín bề mặt 5 phân khu thế giới.

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được (LỖI TỬ HUYỆT NGHIÊM TRỌNG):
- **Cắt sai vị trí tile cỏ (`tile_forest_grass.png`):**
  * Script `step7_extract_terrain_tiles.mjs` cắt vùng `{ x: 0, y: 0, w: 32, h: 32 }` từ `forest_Tileset.png`.
  * Tại tọa độ (0, 0) của `forest_Tileset.png`, đây KHÔNG PHẢI là một ô kết cấu cỏ lặp lại liền mạch (seamless grass tile), mà là **ngọn của một bụi rậm có đổ bóng viền ngoài**.
  * Kết quả phân tích nhị phân pixel: Trong tổng số 1024 pixel của ô 32×32, có tới **202 pixel hoàn toàn trong suốt (Alpha = 0)** và **202 pixel màu gần đen (RGB < 30)**.
- **Hậu quả thị giác nghiêm trọng trong game:**
  * Khi Phaser lặp lại tile 32×32 này bằng `TileSprite` trên một khu vực rộng hàng nghìn pixel của thế giới, toàn bộ mặt đất bị biến thành **mạng lưới bàn cờ đen loang lổ, thủng lỗ chỗ như lưới rách**.
- **Sự lãng phí tài nguyên sẵn có:**
  * Trong thư mục `public/assets/environment/tilesets/` có sẵn một file tileset thảm cỏ chuẩn chất lượng cao là `TX Tileset Grass.png` (kích thước 256×256 px), nhưng script cắt tile đã hoàn toàn bỏ qua file này và cắt nhầm vào ô trang trí của `forest_Tileset.png`.
- **Trạng thái đánh giá:** ❌ **FAILED**

---

### 📌 HẠNG MỤC 6: T08 (WORLDBUILDER VÀ MÔI TRƯỜNG)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Thay thế 100% hình vẽ hình học prototype trong `WorldBuilder.ts` bằng Sprite `.png` thật.
- Xóa sạch toàn bộ các lệnh `fillCircle`, `fillRect`.
- Chuẩn hóa collider gốc cây `20×12` px và Y-sorting theo trục Y cho toàn bộ cây cối và nhà cửa.

#### 2. File nguồn đối chiếu thực tế:
- `src/world/WorldBuilder.ts`
- `src/scenes/GameScene.ts`

#### 3. Tính năng có thực sự tồn tại không?
- Tồn tại phần lớn. Cây cối, nhà cửa, bụi rậm, cột đá, tháp chuông đã được thay thế bằng sprite `.png` thật và có Y-sorting theo `setDepth(y)`.

#### 4. Có bằng chứng chạy thực tế không?
- Nhân vật di chuyển trong thế giới có thể đi xuyên qua tán cây, bị cản bởi gốc cây và chân nhà đúng quy chuẩn.

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được:
- **Tuyên bố "Xóa sạch 100% hình vẽ hình học" là SAI SỰ THẬT:**
  * Kiểm tra trực tiếp mã nguồn `src/world/WorldBuilder.ts`:
    * Dòng 345 (hàm `createRock`):
      ```typescript
      private createRock(x: number, y: number, w: number, h: number): void {
        const rock = this.scene.add.graphics();
        rock.fillStyle(0x424949, 1);
        rock.fillEllipse(x + w / 2, y + h / 2, w, h);
        ...
      ```
    * Dòng 357 (hàm `createMireWater`):
      ```typescript
      private createMireWater(x: number, y: number, w: number, h: number): void {
        const water = this.scene.add.graphics();
        water.fillStyle(0x0e1716, 0.95);
        water.fillEllipse(x + w / 2, y + h / 2, w, h);
        water.lineStyle(2, 0x192e27, 0.8);
        water.strokeEllipse(x + w / 2, y + h / 2, w, h);
        ...
      ```
  * Tảng đá và vũng nước đầm lầy VẪN ĐANG ĐƯỢC VẼ BẰNG HÌNH ELIP HÌNH HỌC NGUYÊN BẢN (`fillEllipse`) chứ chưa hề được thay bằng Sprite pixel art thật!
- Ngoài ra, nền mặt đất của WorldBuilder chịu trực tiếp lỗi bàn cờ thủng lỗ chỗ từ Pass T07.
- **Trạng thái đánh giá:** ⚠️ **PARTIAL**

---

### 📌 HẠNG MỤC 7: T09 (NPC VÀ PORTRAIT)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Bóc tách và tích hợp 3 NPC độc bản thời trung cổ (`npc_garth.png`, `npc_edda.png`, `npc_neris.png`) kèm 3 ảnh chân dung hội thoại `64×64` px (`portrait_garth.png`, `portrait_edda.png`, `portrait_neris.png`).
- Xóa bỏ các hình tròn màu xám thô của prototype, hiển thị chân dung sắc nét và hộp thoại chuẩn thời trung cổ.

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step9_extract_npcs.mjs`
- `public/assets/characters/npcs/npc_garth.png`, `npc_edda.png`, `npc_neris.png`
- `public/assets/characters/portrait_garth.png`, `portrait_edda.png`, `portrait_neris.png`
- `src/entities/NPCEntity.ts`
- `src/systems/DialogueSystem.ts`
- `src/scenes/GameScene.ts` (dòng 155)

#### 3. Tính năng có thực sự tồn tại không?
- Các file sprite NPC và ảnh chân dung có tồn tại thực tế trên đĩa cứng.
- Lớp `NPCEntity` hiển thị đúng sprite nhân vật, nhãn tên và icon gợi ý `[E] Nói`.

#### 4. Có bằng chứng chạy thực tế không?
- 3 NPC xuất hiện tại các vị trí quy định trong làng Bellhollow; tương tác phím `[E]` phát tín hiệu kích hoạt hội thoại.

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được (LỖI TỬ HUYỆT GIAO DIỆN HỘI THOẠI):
- **Hộp thoại bị đẩy văng ra ngoài màn hình do Camera Zoom 2.2×:**
  * Trong `src/systems/DialogueSystem.ts`, hộp thoại được tạo với tọa độ `(640, 590)` kèm `setScrollFactor(0)`:
    ```typescript
    this.container = scene.add.container(640, 590);
    this.container.setScrollFactor(0);
    ```
  * Tuy nhiên, `DialogueSystem` lại được khởi tạo trực tiếp bên trong `GameScene` (dòng 155: `this.dialogueSystem = new DialogueSystem(this);`) thay vì `UIScene`!
  * Trong khi đó, Camera chính của `GameScene` được cấu hình độ phân giải `1280×720` và phóng to `2.2×` (`this.cameras.main.setZoom(2.2)`).
  * Tâm phóng đại của camera là tâm màn hình `(640, 360)`. Điểm Y = 590 cách tâm 230 px. Khi bị nhân với zoom 2.2×, tọa độ hiển thị thực tế trên màn hình là:
    $$\text{Screen Y} = 360 + (590 - 360) \times 2.2 = 360 + 506 = \mathbf{866\text{ px}}$$
  * Màn hình chuẩn HD chỉ có chiều cao **720 px**. Do đó, hộp thoại hội thoại bị **văng xuống dưới đáy màn hình 146 px**!
  * **Hậu quả:** Người chơi nhấn `[E]` nói chuyện với NPC nhưng **hoàn toàn không nhìn thấy hộp thoại, không đọc được lời thoại và không thấy ảnh chân dung**! Báo cáo cũ tuyên bố tính năng này hoạt động hoàn hảo là không đúng với trải nghiệm thực tế trên màn hình.
- **Trạng thái đánh giá:** ⚠️ **PARTIAL**

---

### 📌 HẠNG MỤC 8: T10 (MONSTER VÀ HỆ THỐNG SƯƠNG)

#### 1. Báo cáo trước đây đã tuyên bố gì?
- Bóc tách sprite quái vật bóng đêm: `the_listener.png` (64×64 px) và `the_echo.png` (32×64 px) từ gói `Undead executioner.zip`.
- Trích xuất lớp sương mềm mại `fog_smooth.png` (512×256 px) và tích hợp `VeilSystem`, xóa bỏ hoàn toàn 24 vòng tròn sương đục của prototype.

#### 2. File nguồn đối chiếu thực tế:
- `scripts/step10_extract_monsters.mjs`
- `public/assets/monsters/the_listener.png`
- `public/assets/monsters/the_echo.png`
- `public/assets/environment/sprites/fog_smooth.png`
- `src/entities/TheListener.ts`
- `src/systems/VeilSystem.ts`
- `src/scenes/GameScene.ts` (hàm `updateFogOfWar`)

#### 3. Tính năng có thực sự tồn tại không?
- Cả 3 file asset đều có mặt trên đĩa cứng với đúng kích thước pixel.
- Thực thể quái vật `TheListener` và hệ thống màn sương `VeilSystem` có hoạt động trong scene.

#### 4. Có bằng chứng chạy thực tế không?
- The Listener có AI tuần tra và phản ứng với tiếng động chạy nhanh (`ListenerAI.ts`).
- VeilSystem cuộn 2 tầng sương mềm mại với alpha khác nhau và hiển thị chữ thì thầm tâm lý ma quái.

#### 5. Vấn đề và mâu thuẫn kỹ thuật phát hiện được:
- **Áp lực rác bộ nhớ tại 60 FPS (Memory GC Spikes & Micro-stuttering):**
  * Trong `src/scenes/GameScene.ts`, hàm `updateFogOfWar()` được gọi mỗi frame (60 lần/giây):
    ```typescript
    private updateFogOfWar(): void {
      ...
      const lightG = this.make.graphics();
      // Vẽ 4 hình tròn ánh sáng
      this.fogOfWarLayer.erase(lightG);
      lightG.destroy();
      ...
    }
    ```
  * Việc liên tục khởi tạo một đối tượng `Phaser.GameObjects.Graphics` mới bằng `this.make.graphics()` rồi gọi `destroy()` trong vòng lặp game loop 60 FPS tạo ra hàng trăm đối tượng tạm mỗi giây. Điều này kích hoạt Garbage Collector của trình duyệt dọn rác định kỳ, gây ra các đợt sụt khung hình (micro-stuttering) làm gián đoạn trải nghiệm chơi game.
- **Trạng thái đánh giá:** ⚠️ **PARTIAL**

---

## 3. TỔNG KẾT VÀ BÀN GIAO KIỂM TOÁN CHU KỲ 1

### 📊 Thống kê trạng thái 10 PASS đầu tiên:
- **VERIFIED (Đạt chuẩn kỹ thuật & khớp thực tế):** **3 / 8 hạng mục** (T04, T05, T06)
- **PARTIAL (Có tính năng nhưng sai lệch tài liệu hoặc vướng lỗi kỹ thuật):** **4 / 8 hạng mục** (T01–T03, T08, T09, T10)
- **FAILED (Lỗi nghiêm trọng, hỏng hiển thị hoặc sai hoàn toàn):** **1 / 8 hạng mục** (T07 - Tile cỏ loang lổ)
- **NOT VERIFIED:** 0

### ⚠️ 3 Tử huyệt kỹ thuật cần ưu tiên xử lý:
1. **Lỗi Tile cỏ T07:** Cần thay thế ngay `tile_forest_grass.png` bằng cách cắt chuẩn từ `TX Tileset Grass.png` (256×256 px) để xóa bỏ mặt đất bàn cờ loang lổ.
2. **Lỗi Hộp thoại T09:** Cần chuyển `DialogueSystem` sang chạy trên `UIScene` (Camera Zoom 1.0) hoặc điều chỉnh lại offset Y bù trừ theo Camera Zoom 2.2× để hộp thoại hiển thị trọn vẹn trong màn hình 720p.
3. **Lỗi GC Spikes T10:** Tái sử dụng (pool/cache) một đối tượng `Graphics` cố định cho mặt nạ ánh sáng thay vì `this.make.graphics()` và `destroy()` 60 lần mỗi giây.

---
*Báo cáo được lập độc lập bởi Senior Game QA Engineer – Dự án HOLLOW WOODS V3.0.*
