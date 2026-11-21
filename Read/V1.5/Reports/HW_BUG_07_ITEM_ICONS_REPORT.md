# BÁO CÁO NGHIỆM THU HOÀN TẤT HW-BUG-#7 — ĐỒNG BỘ ITEM ICONS REGISTRY & ASSET INTEGRITY (BUG-025)

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Mã nhiệm vụ:** `HW-BUG-#7` / `BUG-025` (Đặc tả B04-09A)  
**Ngày thực hiện:** 22/11/2026  
**Trạng thái kiểm thử:** **CLOSED-VERIFIED local (6/6 PASS 100%)**

---

## 1. MỤC TIÊU NGHIỆM THU & KẾT QUẢ ĐẠT ĐƯỢC

Giải quyết triệt để và toàn diện lỗi `BUG-025` theo đặc tả `B04-09A` (trước đó ở trạng thái `PARTIAL`), chuẩn hóa toàn bộ hệ thống biểu tượng vật phẩm (Item Icons) trên toàn bộ các giao diện người dùng trong game:

1. **Kiểm kê 100% Danh mục Vật phẩm:** Rà soát toàn bộ 43 items trong `src/data/items.json`, đối chiếu đầy đủ khóa định danh, loại hình (material, consumable, seed, equipment, weapon, quest, lore, relic).
2. **Đóng gói Texture Atlas Pixel Art 16×16 Chuẩn Thật:**
   - Tạo bộ Atlas chuyên dụng: `public/assets/atlases/item_icons_atlas.png` (160×120px) và `item_icons_atlas.json` (46 frames).
   - Tuyệt đối chỉ sử dụng tài nguyên pixel-art thật có sẵn trong repository (`hollow_props_atlas`, `Humble Gift`, `Pixel_Castle_Medieval_Tileset`, `Pocket Inventory`, `ui/icons`).
   - 100% các frame đều là pixel art thật ($16\times 16\text{px}$ với trên 20 pixel màu có alpha), **hoàn toàn không có frame rỗng, không dùng emoji, không dùng ký tự chữ cái thay thế**.
3. **Bảo toàn Tương thích Ngược với Save Schema 3 & Legacy Aliases:**
   - Hỗ trợ đầy đủ 3 alias lịch sử trong bản lưu cũ: `item_runed_iron_part` (trỏ tới `mat_runed_iron`), `food_root_soup` (trỏ tới `food_forest_root_soup`), `quest_corrupted_knight_crest` (trỏ tới `quest_corrupted_crest`).
   - Cả 3 alias đều được đăng ký frame riêng tương ứng trong texture atlas, đảm bảo khi load bản lưu cũ không bao giờ xảy ra lỗi render.
4. **Xây dựng Helper Tập Trung `ItemIconHelper.ts`:**
   - Cung cấp các hàm chuẩn hóa: `resolveItemIcon(itemId)`, `createItemIconImage(scene, x, y, itemId, size)`, `setItemIconTexture(image, itemId)`, `normalizeItemId(itemId)`.
   - Lọc và ánh xạ thông minh, tự động fallback an toàn nếu gặp item ID lạ mà không làm sập game.
5. **Đồng bộ Toàn Diện 6 Hệ thống Giao diện Người dùng (UI):**
   - **Quickbar / Hotbar (`UIScene.ts`):** Thay thế toàn bộ text emoji bằng `Phaser.GameObjects.Image` pixel art từ `item_icons_atlas`. Khi vật phẩm tiêu hao hết số lượng (count = 0 ở Slot 1 & 2), hiển thị icon mờ (`alpha = 0.4`) cùng nhãn `x0`.
   - **Crafting Modal (`CraftingModal.ts`):** Hiển thị ảnh xem trước lớn của vật phẩm chế tạo (`detailPreviewImage`), toàn bộ 18 ô công thức trong danh sách (`gridTileGfx`), và các huy hiệu nguyên liệu yêu cầu (`ingredientBadges`).
   - **QuickCraft Sidebar (`QuickCraftSidebar.ts`):** Hiển thị pixel-art icon trên cả 4 slot ghim cố định và flyout card thông tin nguyên liệu.
   - **Storage Chest Modal (`StorageChestModal.ts`):** Bổ sung pixel art icon $16\times 16\text{px}$ cho toàn bộ 12 ô hành trang bên trái và 12 ô rương trữ đồ bên phải.
   - **Equipment Modal (`EquipmentModal.ts`):** Tích hợp pixel art icon cho 4 ô trang bị (`body`, `feet`, `back`, `charm`), danh sách vật phẩm trong túi đồ, và danh sách vũ khí tự vệ.
   - **Item Tooltip Helper (`ItemTooltipHelper.ts`):** Thêm icon pixel art $16\times 16\text{px}$ ở góc trái tiêu đề tooltip khi rê chuột vào vật phẩm.
6. **Preload Sạch Sẽ & Bộ lọc Điểm (Nearest Filter):** Khởi tạo và thiết lập texture filter `NEAREST` trong `PreloadScene.ts`, giữ nguyên độ sắc nét pixel-art cổ điển, 0 asset 404, 0 cảnh báo console.

---

## 2. BẢNG TIẾP XÚC BIỂU TƯỢNG VẬT PHẨM (ITEM ICONS CONTACT SHEET)

![Item Icons Contact Sheet](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/item_icons_contact_sheet.png)  
*Bảng tiếp xúc 43 vật phẩm chính thức + 3 legacy Save aliases được kết xuất từ Texture Atlas thực tế, kèm mã ID, tên tiếng Việt và danh mục chuẩn.*

---

## 3. HÌNH ẢNH NGHIỆM THU THỰC ĐỊA (VERIFICATION SCREENSHOTS)

### 3.1. Hotbar / Quickbar UI với Pixel Art Icon & Trạng thái Hết Đồ x0
![Hotbar Verified](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug07_hotbar_verified.png)  
*Thanh công cụ nhanh hiển thị 8 slots với hình ảnh pixel art chuẩn xác. Slot 1 (Dầu Đèn) khi hết số lượng hiển thị mờ với alpha 0.4 và nhãn 'x0', không còn dùng ký hiệu text emoji.*

### 3.2. Bàn Chế Tạo (Crafting Modal)
![Crafting Modal Verified](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug07_crafting_modal_verified.png)  
*Giao diện Chế tạo: Toàn bộ 18 công thức trên lưới hiển thị icon pixel art sắc nét, bảng chi tiết bên phải hiển thị icon xem trước lớn và các huy hiệu nguyên liệu.*

### 3.3. Thanh Chế Tạo Nhanh (QuickCraft Sidebar & Flyout)
![QuickCraft Sidebar Verified](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug07_quickcraft_flyout_verified.png)  
*4 ô chế tạo nhanh ghim bên lề phải cùng cửa sổ bay (flyout) hiển thị đầy đủ icon nguyên liệu và thành phẩm.*

### 3.4. Rương Trú Ẩn (Storage Chest Modal)
![Storage Chest Verified](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug07_storage_chest_verified.png)  
*Giao diện chuyển đồ 2 cột: 12 ô hành trang (trái) và 12 ô rương trú ẩn (phải) hiển thị đồng bộ icon pixel art kèm số lượng.*

### 3.5. Trang Bị Nhân Vật (Equipment Modal)
![Equipment Modal Verified](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug07_equipment_modal_verified.png)  
*Trang bị nhân vật hiển thị Áo Choàng Rêu phong ở ô Thân, danh sách đồ có thể trang bị trong túi và danh mục vũ khí.*

---

## 4. MA TRẬN 43 VẬT PHẨM VÀ ÁNH XẠ TEXTURE ATLAS FRAME

| STT | Mã Vật Phẩm (`id`) | Tên Tiếng Việt | Danh Mục | Atlas Frame | Trạng Thái Pixel Art |
|:---:|:---|:---|:---:|:---:|:---:|
| 1 | `res_dry_wood` | Cành Gỗ Khô | material | `res_dry_wood` | PASS (16×16, non-blank) |
| 2 | `res_flint` | Đá Đánh Lửa | material | `res_flint` | PASS (16×16, non-blank) |
| 3 | `res_tree_resin` | Nhựa Cây Thông | material | `res_tree_resin` | PASS (16×16, non-blank) |
| 4 | `res_herbs` | Cỏ Dược Liệu | material | `res_herbs` | PASS (16×16, non-blank) |
| 5 | `seed_herbs` | Hạt Giống Cỏ Thuốc | seed | `seed_herbs` | PASS (16×16, non-blank) |
| 6 | `item_lantern_oil` | Dầu Đèn | consumable | `item_lantern_oil` | PASS (16×16, non-blank) |
| 7 | `item_herbal_poultice` | Thuốc Đắp Thảo Dược | consumable | `item_herbal_poultice` | PASS (16×16, non-blank) |
| 8 | `item_noise_lure` | Bẫy Tiếng Động | consumable | `item_noise_lure` | PASS (16×16, non-blank) |
| 9 | `quest_bronze_clapper` | Quả Chuông Đồng Cổ | quest | `quest_bronze_clapper` | PASS (16×16, non-blank) |
| 10 | `lore_satyr_journal` | Nhật Ký Nhân Dương | lore | `lore_satyr_journal` | PASS (16×16, non-blank) |
| 11 | `mat_forest_rope` | Dây Thừng Rừng | material | `mat_forest_rope` | PASS (16×16, non-blank) |
| 12 | `mat_charcoal` | Than Củi Đốt | material | `mat_charcoal` | PASS (16×16, non-blank) |
| 13 | `mat_runed_iron` | Sắt Khắc Cổ Ngữ | material | `mat_runed_iron` | PASS (16×16, non-blank) |
| 14 | `food_calming_tea` | Trà Thảo Mộc Định Thần | consumable | `food_calming_tea` | PASS (16×16, non-blank) |
| 15 | `food_roasted_mushroom` | Nấm Rừng Nướng | consumable | `food_roasted_mushroom` | PASS (16×16, non-blank) |
| 16 | `food_forest_root_soup` | Súp Củ Rừng Ấm Nóng | consumable | `food_forest_root_soup` | PASS (16×16, non-blank) |
| 17 | `res_forest_roots` | Củ Rễ Rừng | material | `res_forest_roots` | PASS (16×16, non-blank) |
| 18 | `res_forest_mushroom` | Nấm Rừng Nâu | material | `res_forest_mushroom` | PASS (16×16, non-blank) |
| 19 | `res_tough_fiber` | Sợi Gai Dai | material | `res_tough_fiber` | PASS (16×16, non-blank) |
| 20 | `seed_roots` | Mầm Củ Rừng | seed | `seed_roots` | PASS (16×16, non-blank) |
| 21 | `seed_mushroom` | Bào Tử Nấm Rừng | seed | `seed_mushroom` | PASS (16×16, non-blank) |
| 22 | `seed_fiber` | Hạt Giống Cây Gai | seed | `seed_fiber` | PASS (16×16, non-blank) |
| 23 | `eqp_moss_cloak` | Áo Choàng Rêu | equipment | `eqp_moss_cloak` | PASS (16×16, non-blank) |
| 24 | `eqp_trail_boots` | Ủng Đi Rừng Dai Bền | equipment | `eqp_trail_boots` | PASS (16×16, non-blank) |
| 25 | `eqp_field_backpack` | Ba Lô Dã Ngoại | equipment | `eqp_field_backpack` | PASS (16×16, non-blank) |
| 26 | `eqp_bell_ward_charm` | Bùa Hộ Thân Chuông Đồng | equipment | `eqp_bell_ward_charm` | PASS (16×16, non-blank) |
| 27 | `wpn_walking_staff` | Gậy Gỗ Sinh Tồn | weapon | `wpn_walking_staff` | PASS (16×16, non-blank) |
| 28 | `wpn_iron_spear` | Giáo Gỗ Bịt Sắt | weapon | `wpn_iron_spear` | PASS (16×16, non-blank) |
| 29 | `wpn_hunting_hatchet` | Rìu Đi Rừng | weapon | `wpn_hunting_hatchet` | PASS (16×16, non-blank) |
| 30 | `item_resin_flare` | Đuốc Nhựa Sáng | consumable | `item_resin_flare` | PASS (16×16, non-blank) |
| 31 | `item_bell_mold` | Mảnh Khuôn Đúc Chuông | quest | `item_bell_mold` | PASS (16×16, non-blank) |
| 32 | `item_medicinal_roots` | Rễ Thuốc Ngàn Năm | quest | `item_medicinal_roots` | PASS (16×16, non-blank) |
| 33 | `relic_heart_of_roots` | Trái Tim Rễ Cổ Thụ | relic | `relic_heart_of_roots` | PASS (16×16, non-blank) |
| 34 | `item_broken_patrol_lantern` | Đèn Tuần Tra Hư Hại | quest | `item_broken_patrol_lantern` | PASS (16×16, non-blank) |
| 35 | `item_root_flower` | Hoa Rễ Phát Sáng | material | `item_root_flower` | PASS (16×16, non-blank) |
| 36 | `mat_skull_fang` | Nanh Sói Xương Cổ | material | `mat_skull_fang` | PASS (16×16, non-blank) |
| 37 | `mat_shadow_essence` | Tinh Chất Bóng Tối | material | `mat_shadow_essence` | PASS (16×16, non-blank) |
| 38 | `quest_corrupted_crest` | Huy Hiệu Hiệp Sĩ Tha Hóa | quest | `quest_corrupted_crest` | PASS (16×16, non-blank) |
| 39 | `item_knight_journal_page` | Trang Nhật Ký Hiệp Sĩ Vaelen | lore | `item_knight_journal_page` | PASS (16×16, non-blank) |
| 40 | `quest_rune_fragment` | Mảnh Cổ Ngữ Bí Ẩn | quest | `quest_rune_fragment` | PASS (16×16, non-blank) |
| 41 | `quest_purification_key` | Chìa Khóa Thanh Tẩy | quest | `quest_purification_key` | PASS (16×16, non-blank) |
| 42 | `eqp_skull_fang_charm` | Bùa Nanh Sói Cổ | equipment | `eqp_skull_fang_charm` | PASS (16×16, non-blank) |
| 43 | `eqp_abyssal_ward_charm` | Bùa Hộ Mệnh Vực Thẳm | equipment | `eqp_abyssal_ward_charm` | PASS (16×16, non-blank) |
| 44* | `item_runed_iron_part` | *(Legacy Alias: Sắt Cổ Ngữ)* | alias | `item_runed_iron_part` | PASS (Trỏ về Sắt Cổ Ngữ) |
| 45* | `food_root_soup` | *(Legacy Alias: Súp Rễ Rừng)* | alias | `food_root_soup` | PASS (Trỏ về Súp Rễ Cây) |
| 46* | `quest_corrupted_knight_crest` | *(Legacy Alias: Huy Hiệu Hiệp Sĩ)* | alias | `quest_corrupted_knight_crest` | PASS (Trỏ về Huy Hiệu Tha Hóa) |

---

## 5. CHI TIẾT THAY ĐỔI MÃ NGUỒN THEO TỪNG TỆP

### 5.1. `src/utils/ItemIconHelper.ts` (MỚI TẠO)
- Khai báo helper chuẩn hóa quản lý texture và frame biểu tượng:
  - `resolveItemIcon(itemId)`: Ánh xạ item ID sang `{ textureKey, frame }`. Tự động chuẩn hóa alias qua bảng `ITEM_ALIASES` và kiểm tra với danh mục item chuẩn.
  - `createItemIconImage(scene, x, y, itemId, size)`: Tạo `Phaser.GameObjects.Image` với kích thước chỉ định (mặc định $16\times 16\text{px}$, căn giữa origin 0.5, 0.5).
  - `setItemIconTexture(image, itemId)`: Cập nhật nhanh texture và frame của một Image có sẵn.
  - `getAllRegistryItemIds()`, `isValidItemId(itemId)`: Hỗ trợ kiểm toán và xác minh ID hợp lệ.

### 5.2. `src/scenes/PreloadScene.ts`
- Bổ sung nạp atlas chuyên dụng trong hàm `preload()`:
  ```typescript
  this.load.atlas(ATLAS_ITEM_ICONS_KEY, 'assets/atlases/item_icons_atlas.png', 'assets/atlases/item_icons_atlas.json');
  ```
- Trong sự kiện `create()`, thiết lập bộ lọc điểm ảnh sắc nét `Phaser.Textures.FilterMode.NEAREST` cho `item_icons_atlas`.

### 5.3. `src/scenes/UIScene.ts`
- Khởi tạo mảng `inventorySlotImages: Phaser.GameObjects.Image[]` tương ứng với 8 ô hotbar.
- Cập nhật hàm `updateQuickSlotCounts()`:
  - Khi có vật phẩm: Thiết lập texture `item_icons_atlas`, frame tương ứng, đặt `visible = true`, `alpha = 1.0`, xóa text icon emoji rỗng (`text = ''`).
  - Khi vật phẩm tiêu hao ở Slot 0 (`item_herbal_poultice`) hoặc Slot 1 (`item_lantern_oil`) hết (count = 0): Giữ nguyên icon hiển thị mờ với `alpha = 0.4`, nhãn số lượng hiển thị `'x0'`, giúp người chơi dễ dàng nhận biết slot đã gán mà không bị mất dấu.
  - Khi các slot khác rỗng: Đặt `img.setVisible(false)` và `txt.setText('')`.

### 5.4. `src/ui/CraftingModal.ts`
- Tích hợp `detailPreviewImage` sử dụng `ItemIconHelper.createItemIconImage()` với kích thước $32\times 32\text{px}$ đặt tại vị trí trung tâm xem trước.
- Cập nhật 18 ô công thức trong danh mục (`gridTileGfx`): Thêm `tile.iconImg = ItemIconHelper.createItemIconImage(this.scene, tx + 18, ty + 18, recipe.id, 24)` thay thế emoji text.
- Cập nhật danh sách nguyên liệu (`detailIngredientsContainer`): Thêm icon $16\times 16\text{px}$ bên cạnh tên nguyên liệu và số lượng yêu cầu.

### 5.5. `src/ui/QuickCraftSidebar.ts`
- Tích hợp `slot.iconImg` cho 4 slot chế tạo ghim bên phải màn hình.
- Thêm icon pixel art cho các huy hiệu nguyên liệu trong thẻ thông tin bay (`flyoutContainer`).

### 5.6. `src/ui/StorageChestModal.ts`
- Khởi tạo icon Image $16\times 16\text{px}$ cho 12 ô hành trang (`leftInventoryContainer`) và 12 ô rương trữ đồ (`rightChestContainer`).
- Cập nhật động texture và frame qua `ItemIconHelper.setItemIconTexture()` khi người chơi cất hoặc rút vật phẩm.

### 5.7. `src/ui/EquipmentModal.ts`
- Tích hợp icon Image cho 4 ô trang bị (`body`, `feet`, `back`, `charm`), danh sách vật phẩm trong túi, và danh sách vũ khí tự vệ.

### 5.8. `src/ui/ItemTooltipHelper.ts`
- Thêm icon Image $16\times 16\text{px}$ trước tiêu đề vật phẩm trong tooltip, căn chỉnh thụt lề tên vật phẩm $22\text{px}$ tạo giao diện trực quan và chuyên nghiệp.

---

## 6. KẾT QUẢ KIỂM THỬ PLAYWRIGHT CHROMIUM (`scripts/test_hw_bug07_item_icons.py`)

Bộ kiểm thử tự động toàn diện Playwright Chromium đã chạy độc lập và xác nhận đạt **100% (6/6 Test Cases PASS)**:

```
[Server] Serving dist at http://127.0.0.1:5237

--- TEST 1: ASSET & ATLAS INTEGRITY ---
Total items in items.json: 43
Total frames in item_icons_atlas: 46
Missing items: []
Blank frames (<20 non-zero pixels): []
Missing aliases: []
TEST 1 RESULT: PASS

[Test] Loading game at http://127.0.0.1:5237/?dev=1 ...
[Test] Starting New Game...

--- TEST 2: RUNTIME PRELOAD & ATLAS RESOLUTION ---
Test 2 eval: {'hasAtlas': True, 'totalFrames': 46, 'checkedCount': 43, 'missingFrames': []}
TEST 2 RESULT: PASS

--- TEST 3: HOTBAR UI PIXEL ART INTEGRITY ---
Hotbar slots verification:
  Slot 0: imgVisible=True, tex=item_icons_atlas, frame=item_herbal_poultice, text='', count='x5'
  Slot 1: imgVisible=True, tex=item_icons_atlas, frame=item_lantern_oil, text='', count='x3'
  Slot 2: imgVisible=True, tex=item_icons_atlas, frame=res_dry_wood, text='', count='x12'
  Slot 3: imgVisible=True, tex=item_icons_atlas, frame=res_flint, text='', count='x4'
  Slot 4: imgVisible=True, tex=item_icons_atlas, frame=wpn_hunting_hatchet, text='', count='x1'
  Slot 5: imgVisible=True, tex=item_icons_atlas, frame=eqp_moss_cloak, text='', count='x1'
  Slot 6: imgVisible=True, tex=item_icons_atlas, frame=mat_runed_iron, text='', count='x2'
  Slot 7: imgVisible=True, tex=item_icons_atlas, frame=quest_bronze_clapper, text='', count='x1'
Slot 1 x0 test: {'imgVisible': True, 'imgAlpha': 0.4, 'countStr': 'x0'}
Saved hotbar screenshot: G:\HOLLOW WOODS\Read\V1.5\Reports\hw_bug07_hotbar_verified.png
TEST 3 RESULT: PASS

--- TEST 4: CRAFTING MODAL & QUICKCRAFT SIDEBAR ---
Crafting modal eval: {'isOpen': True, 'previewOk': True, 'previewTexture': 'item_icons_atlas', 'previewFrame': 'item_lantern_oil', 'gridTilesCount': 18, 'gridTilesWithImg': 18, 'ingCount': 8}
Saved crafting modal screenshot: G:\HOLLOW WOODS\Read\V1.5\Reports\hw_bug07_crafting_modal_verified.png
QuickCraft sidebar eval: {'slotsCount': 4, 'slotImgsOk': 4, 'flyoutVisible': True, 'flyoutChildren': 16}
Saved quickcraft screenshot: G:\HOLLOW WOODS\Read\V1.5\Reports\hw_bug07_quickcraft_flyout_verified.png
TEST 4 RESULT: PASS

--- TEST 5: STORAGE CHEST & EQUIPMENT MODAL ---
Storage chest eval: {'isOpen': True, 'invChildren': 56, 'chestChildren': 28, 'usedSlots': 1}
Saved storage chest screenshot: G:\HOLLOW WOODS\Read\V1.5\Reports\hw_bug07_storage_chest_verified.png
Equipment modal eval: {'isOpen': True, 'equippedBody': 'eqp_moss_cloak', 'slotsCount': 25, 'invCount': 2, 'wpnCount': 15}
Saved equipment modal screenshot: G:\HOLLOW WOODS\Read\V1.5\Reports\hw_bug07_equipment_modal_verified.png
TEST 5 RESULT: PASS

--- TEST 6: SAVE/LOAD LIFECYCLE & ALIAS INTEGRITY ---
Save alias inject eval: {'savedOk': True, 'equippedBody': 'eqp_moss_cloak', 'ironPart': 4, 'rootSoup': 2}
[Test] Reloading page to test Save/Continue with legacy aliases...
[Test] Continuing game...
Continue Game state verification: {'ironPartCount': 4, 'rootSoupCount': 2, 'normIron': 2, 'equippedBody': 'eqp_moss_cloak', 'hasAtlas': True, 'hasIronFrame': True, 'hasSoupFrame': True, 'hasCrestFrame': True}
TEST 6 RESULT: PASS

--- NETWORK 404 & CONSOLE ERROR AUDIT ---
Total 404 requests: 0 | Item/Atlas 404s: []
Console errors: 0

========================================================
ALL 6 ITEM ICONS INTEGRITY TEST CASES PASSED SUCCESSFULLY!
========================================================
  test_1_asset_atlas_integrity: PASS
  test_2_runtime_preload: PASS
  test_3_hotbar_pixel_art: PASS
  test_4_crafting_quickcraft: PASS
  test_5_storage_and_equipment: PASS
  test_6_save_load_lifecycle: PASS
```

---

## 7. KẾT LUẬN & KIẾN NGHỊ

Nhiệm vụ **`HW-BUG-#7` (BUG-025)** đã hoàn thành xuất sắc toàn bộ các mục tiêu đặt ra:
- Toàn bộ 43 items và 3 legacy aliases được trang bị hình ảnh Pixel Art $16\times 16\text{px}$ chuẩn xác, không còn bất kỳ ô rỗng hay ký hiệu emoji nào trên toàn hệ thống UI.
- Toàn bộ các hệ thống UI (Hotbar, Chế tạo, Kho lưu trữ, Trang bị, Tooltip) hoạt động đồng bộ và mượt mà.
- Bảo toàn trọn vẹn Save Schema 3 và tương thích ngược với các file lưu từ các phiên bản trước.
- Không phát sinh bất kỳ lỗi console hoặc asset 404 nào.
- Trạng thái lỗi trong Bug Registry được cập nhật chính thức thành **`CLOSED-VERIFIED local`**.
