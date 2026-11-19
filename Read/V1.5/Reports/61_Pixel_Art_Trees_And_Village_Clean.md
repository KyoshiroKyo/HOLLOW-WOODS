# BÁO CÁO HOÀN THIỆN BƯỚC V15-61: XÓA BỎ CÂY GRAPHICS & THAY THẾ 100% SPRITE PIXEL ART THẬT

**Dự án:** HOLLOW WOODS V1.5  
**Mã phân đoạn:** V15-61  
**Trạng thái:** HOÀN THÀNH (100% PASS, 0 LỖI BIÊN DỊCH)  
**Thời gian hoàn tất:** 19/11/2026  

---

## 1. MỤC TIÊU VÀ NGUYÊN NHÂN SỬA ĐỔI

Qua phản hồi kiểm tra thị giác trong game và 5 ảnh chụp thực tế:
- **Nguyên nhân gốc rễ:** Script `scripts/generate_v15_foliage_and_trees.mjs` trước đây đã dùng thuật toán canvas vẽ hình học (hình elip xếp tầng, dây leo dạng sợi chỉ và tam giác trơn) để sinh ra `tree_mist_pine.png`, `tree_mossy_oak_grand.png`, `tree_weeping_willow.png`, `tree_withered_gnarled.png`.
- **Hậu quả thị giác:**
  1. Cây có nét vẽ mượt, các khối elip chồng chéo (circular discs) và dây leo sợi chỉ lạc tông hoàn toàn với phong cách Dark Fantasy Pixel Art của nhân vật và nhà cửa.
  2. Tại Làng Bellhollow: Cây mọc dày đặc trong quảng trường, trước cửa lò rèn của Bram, trước cửa nhà Neris, che khuất dấu chấm than `!`, che khuất lối đi và các NPC.
  3. Tại Lối Mòn Xuyên Sương (Fog Crossing): Cây khô `(300, 240)` mọc sừng sững ngay giữa tim đường mòn, kèm theo thân cây gỗ đổ vẽ bằng Phaser.Graphics.

---

## 2. NỘI DUNG ĐÃ THỰC HIỆN

### 2.1. Gỡ bỏ 100% hàm vẽ cây và thân cây đổ bằng Phaser.Graphics
- **`src/world/WorldBuilder.ts`:**
  - `createWestBarrierLandscape()`: Thay thế 64 dòng code `trunkGfx` vẽ hình học bằng Sprite Pixel Art thật `prop_fallen_log_mossy_v14`.
  - `createFallenLog()`: Thay thế toàn bộ khối `this.scene.add.graphics()` bằng Sprite Pixel Art thật `prop_fallen_log_mossy_v14`, co giãn theo `length / 46`, góc xoay chuẩn xác.
  - `createCollapsedStoneBridgeObstacle()`: Thay thế `trunkGfx` chắn cầu đá sập bằng `prop_fallen_log_mossy_v14`.
  - `createFallenTitanTrunkShortcut()`: Thay thế `g = this.scene.add.graphics()` bằng `prop_fallen_log_mossy_v14`.

### 2.2. Thay thế 100% bằng Sprite Cây Pixel Art Thật
- Trích xuất và ánh xạ các sprite Pixel Art từ các asset pack chính thức trong thư mục `Pixel_Art/`:
  - `tree_mist_pine.png`: Thay thế bằng `tree_pine_tall_topdown.png` (70x98 px) chuẩn TopDown Fantasy Forest.
  - `tree_mossy_oak_grand.png`: Thay thế bằng `Oak.png` (80x95 px) từ Updated-Trees.
  - `tree_weeping_willow.png`: Thay thế bằng `Birch.png` (80x95 px) từ Updated-Trees.
  - `tree_withered_gnarled.png`: Thay thế bằng `tree_dead_withered_v14.png` (32x48 px).
- Nạp đầy đủ vào `src/scenes/PreloadScene.ts`:
  - `SPRITE_TREE_OAK_1..3`, `SPRITE_TREE_DEAD`, `SPRITE_HOLLOW_TREE`, `SPRITE_BUSH_DENSE_1..2`.
  - `tree_birch_amber_v14`, `tree_maple_crimson_v14`, `tree_oak_mossy_v14`, `tree_dead_withered_v14`.
  - `prop_fallen_log_mossy_v14`, `tree_hollow_ancient_v14`.
  - `tree_pine_tall_topdown`, `tree_pine_med_topdown`, `tree_pine_slender_topdown`.
- Cập nhật script `scripts/generate_v15_foliage_and_trees.mjs` để luôn đọc và sao chép trực tiếp từ các file Pixel Art thật, vĩnh viễn không tái sinh cây hình học.

### 2.3. Dọn sạch không gian Làng Bellhollow & Giải phóng Lối Mòn Xuyên Sương
- **Làng Bellhollow:**
  - Xóa bỏ hoàn toàn 15 cây bên trong khu dân cư (`villageInteriorTrees = []`), dọn thoáng 100% mặt tiền lò rèn Bram, nhà Neris, sân nhà Edda, tháp chuông, giếng nước, lửa trại và Finn.
  - Đẩy ranh giới `northRimTrees` lên `y <= 36` và bỏ collider (`c: false`) để làm hậu cảnh tự nhiên sau bờ tường đá phía Bắc.
  - Đẩy `southRimTrees` ra ngoài hàng rào phía Nam `y >= 540` (`c: false`).
  - Dọn sạch các bụi cây mọc đè vào lò rèn Bram (`1288, 356`) và nồi thảo dược Neris (`638, 444`).
- **Lối Mòn Xuyên Sương (Fog Crossing):**
  - Di dời cây tại `(300, 240)` (chắn giữa đường) xuống lề Nam `(300, 310)`.
  - Di dời cây tại `(160, 100)` lên lề Bắc `(160, 65)`.
  - Trục đường mòn `y = 190..250` hoàn toàn thông suốt, nhìn rõ tấm biển mục và mẩu nhật ký rách.

### 2.4. Chuẩn hóa Neo Gốc (0.5, 1.0) & Y-Sorting
- Neo chuẩn `tree.setOrigin(0.5, 1.0)` và `bush.setOrigin(0.5, 1.0)` tại điểm tiếp đất của gốc cây.
- Tính `depth = groundBaseY` chính xác:
  - Khi nhân vật đứng phía sau cây (`player.y < tree.y`): nhân vật lướt nhẹ dưới tán lá một cách tự nhiên.
  - Khi nhân vật đứng phía trước cây (`player.y > tree.y`): nhân vật đứng đè lên gốc cây.
- Collider nhỏ gọn chân đế: `createStaticBoxColliderCentered(x, y - 4, 18, 10, 'Gốc Cây Pixel Art')` giúp nhân vật không bị vấp kẹt khi di chuyển.

---

## 3. KẾT QUẢ KIỂM THỬ

- **Script kiểm thử tự động:** `node scripts/test_v15_61_pixel_art_trees_and_village_clean.mjs`
  - `✓ PASS: All 15 required pixel art tree and prop assets exist and are valid PNG images.`
  - `✓ PASS: PreloadScene loads all real pixel art tree sprites and props.`
  - `✓ PASS: All temporary graphics trees and fallen logs have been removed and replaced with real pixel art sprites.`
  - `✓ PASS: createTree has precise Y-sorting setOrigin(0.5, 1.0) and foot-level 18x10 collider.`
  - `✓ PASS: Fog Crossing road (y=190..250) is 100% unobstructed.`
  - `✓ PASS: Bellhollow interior living area has 0 obstructing trees; Bram, Neris, Edda, Finn, Garth, well, forge, and noticeboard are fully clear.`
- **Kiểm tra biên dịch:**
  - `npx tsc --noEmit`: 0 lỗi TypeScript.
  - `npm run build`: Thành công trong 10.93 giây (dist bundle sạch).
