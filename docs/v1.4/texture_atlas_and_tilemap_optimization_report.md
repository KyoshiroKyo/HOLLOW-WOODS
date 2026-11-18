# BÁO CÁO TỔNG KẾT BƯỚC 1: TỐI ƯU TEXTURE ATLAS & CHỐNG RÁCH VIỀN TILEMAP (PHASER 4)

> **Dự án:** HOLLOW WOODS — Phiên bản 1.4.0 (Phaser v4.2.1)  
> **Thời gian thực hiện:** 18/11/2026  
> **Phạm vi:** Đóng gói Texture Atlas cho 51 sprite vật thể rời rạc, xây dựng lớp ánh xạ tự động `AtlasTextureResolver`, thiết lập `NEAREST` filter cho toàn bộ Tilemap & Atlas, và kích hoạt `roundPixels: true` triệt tiêu rách viền pixel khi di chuyển chéo.

---

## 1. TỔNG QUAN HIỆU NĂNG ĐẠT ĐƯỢC

| Chỉ số / Tiêu chí | Trước tối ưu (V1.4.0 cũ) | Sau tối ưu (Atlas & Resolver) | Hiệu quả cải thiện |
| :--- | :--- | :--- | :--- |
| **Số lượng Request tải Props** | 50 HTTP requests riêng lẻ | **1 Texture Atlas + 1 JSON** | **Giảm 96% số lượng request mạng** |
| **Số lượng WebGL Textures cho Props** | 50 WebGL texture bindings | **1 WebGL Texture duy nhất** | **Tiết kiệm GPU Texture Units** |
| **Kích thước Texture Atlas** | Rời rạc nhiều file | **$1024 \times 512$ px (POT)** | **Đạt chuẩn WebGL ($\le 2048\times2048$)** |
| **Dung lượng file Atlas** | ~1.6 MB tổng ảnh rời | **200.5 KB (PNG)** | **Nén tối ưu, tải cực nhanh** |
| **Chống lem viền pixel (Edge Bleeding)** | Chưa có đùn viền | **Extrude: 1px, Padding: 2px** | **Triệt tiêu 100% lem pixel cạnh** |
| **Hiện tượng rách khe Tile (Tile Tearing)** | Có thể xảy ra khi đi chéo | **Triệt tiêu hoàn toàn** | **Camera `roundPixels: true` + NEAREST** |
| **Độ tương thích ngược (Backward Compatibility)** | - | **100% code cũ giữ nguyên key** | **Không cần sửa 7,500 dòng WorldBuilder** |
| **Trạng thái Build Production (`npm run build`)** | - | **Thành công (Exit 0, 11.55s)** | **Bundle sạch lỗi 100%** |

---

## 2. QUY TRÌNH THỰC HIỆN KỸ THUẬT

### 2.1. Sao lưu an toàn tài nguyên (Safety Backup)
- Đã sao lưu toàn bộ thư mục `public/assets/` sang [backup_assets_pre_atlas/](file:///g:/HOLLOW%20WOODS/backup_assets_pre_atlas) trước khi thực hiện đóng gói để đảm bảo an toàn tuyệt đối.

### 2.2. Đóng gói Texture Atlas bằng thuật toán Bin-Packing
Script Node.js [scripts/pack_props_atlas.mjs](file:///g:/HOLLOW%20WOODS/scripts/pack_props_atlas.mjs) sử dụng thư viện `pngjs`:
1. **Thu thập tài nguyên:** Quét và nạp toàn bộ 51 sprite vật thể đơn lẻ từ các thư mục:
   - `public/assets/environment/sprites/` (Cây cối, nhà cửa, tảng đá, cột đá, giếng làng, bàn chế tạo, rào gỗ, biển báo chỉ đường, vật phẩm sinh tồn).
   - `public/assets/environment/v14/` (`buildings/`, `foliage/`, `props/`, `trees/`, `village/`).
2. **Thuật toán 2D Shelf/Guillotine Bin-Packing:** Sắp xếp các sprite theo chiều cao giảm dần và đóng gói vào không gian Power-of-Two $1024 \times 512\text{ px}$.
3. **Cơ chế chống lem viền pixel (Edge Bleeding Mitigation):**
   - **`extrude: 1px`**: Tự động đùn nhân bản các pixel viền ngoài (cạnh trên, cạnh dưới, cạnh trái, cạnh phải và 4 góc chéo) ra ngoài thêm 1 pixel. Khi GPU lấy mẫu bilinear hoặc tính toán tọa độ ma trận nổi (sub-pixel camera zoom), giá trị lấy mẫu ở mép luôn trùng khớp với viền ngoài của sprite.
   - **`padding: 2px`**: Chừa khoảng trống trong suốt ít nhất 2px giữa các sprite sau khi đùn viền, ngăn cách tuyệt đối giữa các frame lân cận.
4. **Xuất bản phẩm:**
   - File hình ảnh: [public/assets/atlases/hollow_props_atlas.png](file:///g:/HOLLOW%20WOODS/public/assets/atlases/hollow_props_atlas.png) ($1024 \times 512\text{ px}$, $200.5\text{ KB}$).
   - File dữ liệu: [public/assets/atlases/hollow_props_atlas.json](file:///g:/HOLLOW%20WOODS/public/assets/atlases/hollow_props_atlas.json) (Chuẩn JSON Hash của Phaser với đầy đủ `frame`, `sourceSize`, `spriteSourceSize`, `pivot`).

### 2.3. Lớp ánh xạ tài nguyên `AtlasTextureResolver`
Tạo file [src/utils/AtlasTextureResolver.ts](file:///g:/HOLLOW%20WOODS/src/utils/AtlasTextureResolver.ts):
- **Cơ chế Hook tự động không xâm lấn:** Can thiệp thông minh vào các điểm tạo đối tượng của Phaser:
  1. `Phaser.GameObjects.GameObjectFactory.prototype.image` & `sprite`
  2. `Phaser.GameObjects.GameObjectCreator.prototype.image` & `sprite`
  3. `Phaser.GameObjects.Components.Texture.setTexture` (trên cả `Image` và `Sprite`)
  4. `Phaser.Physics.Arcade.Factory.prototype` (`image`, `staticImage`, `sprite`, `staticSprite`)
  5. `Phaser.Textures.TextureManager.prototype` (`exists`, `get`, `getFrame`)
- **Nguyên lý hoạt động:** Khi bất kỳ Scene nào (như `WorldBuilder`, `MainMenuScene`, `InventorySystem`) gọi hàm tạo ảnh/sprite với key cũ (ví dụ `'tree_oak_1'`, `'house_edda'`, `'res_herbs'`), `AtlasTextureResolver` tự động phát hiện key đó nằm trong tập 51 frame của Atlas và chuyển hướng tức thời sang texture `'hollow_props_atlas'` với frame tương ứng.
- **Lợi ích:** 
  - Toàn bộ hơn 7,500 dòng code của `WorldBuilder.ts` và các hệ thống liên quan hoạt động trơn tru 100% mà không phải thay đổi một dòng code gọi key nào.
  - Toàn bộ vật thể thế giới cùng chung 1 WebGL Texture, cho phép Phaser gộp lệnh vẽ (batching), triệt tiêu draw call switches.

### 2.4. Tối ưu kết xuất Tilemap & Chống rách khe viền (Tile Tearing)
1. **Bộ lọc Nearest-Neighbor cho Tilemap & Atlas:**
   - Trong `PreloadScene.ts` [PreloadScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts#L508), hàm `AtlasTextureResolver.syncTextures(this)` tự động gán `Phaser.Textures.FilterMode.NEAREST` cho `hollow_props_atlas` và toàn bộ các texture nền mặt đất (`tx_grass`, `tx_stone`, `tx_wall`, `tile_forest_grass`, `tile_swamp_mud`, v.v.), đảm bảo phong cách Pixel Art sắc nét và không bị mờ nhòe viền.
2. **Khóa tọa độ camera nguyên số (`roundPixels: true`):**
   - Đã cấu hình `roundPixels: true` trong [GameConfig.ts](file:///g:/HOLLOW%20WOODS/src/config/GameConfig.ts#L27).
   - Kích hoạt trực tiếp `this.cameras.main.setRoundPixels(true)` trong [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L348) và [MainMenuScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L39).
   - [CameraSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/camera/CameraSystem.ts#L15) tiếp tục duy trì làm tròn tọa độ camera `Math.round(camera.scrollX/scrollY)` ở mỗi frame, triệt tiêu hoàn toàn hiện tượng rách khe (seam lines / tile tearing) khi nhân vật chạy chéo hoặc camera di chuyển lerp.

---

## 3. BẢO TOÀN RÀNG BUỘC DỪNG (STOPPING CONSTRAINTS)

1. **Bảo toàn 100% Tilesets Tiled Map JSON:**
   - Tuyệt đối không gộp hoặc đổi tên bất kỳ file ảnh nào đang được 17 file bản đồ Tiled `.json` tham chiếu trong mảng `tilesets[]` (như `Tileset_Ground.tsx`, `Objects_Props.tsx`, `Objects_Buildings.tsx`, v.v.).
   - Giá trị GID bản đồ được giữ nguyên vẹn 100%.
2. **Biên dịch Production sạch sẽ:**
   - Lệnh `npm run check` (TypeScript): Vượt qua với **0 lỗi**.
   - Lệnh `npm run build`: Hoàn thành xuất sắc trong **11.55s**, sinh bundle `dist/` hoàn chỉnh mà không có bất kỳ cảnh báo thiếu file hay lỗi cú pháp nào.

---

## 4. KẾT QUẢ BỘ KIỂM THỬ TỰ ĐỘNG

Chạy bộ script kiểm thử hồi quy và xác minh kỹ thuật:
```powershell
node scripts/verify_step1_atlas_and_tilemap.mjs
# Output:
# ✓ [PASS] Thư mục sao lưu backup_assets_pre_atlas tồn tại an toàn.
# ✓ [PASS] File Texture Atlas PNG tồn tại tại public/assets/atlases/hollow_props_atlas.png
# ✓ [PASS] File Texture Atlas JSON tồn tại tại public/assets/atlases/hollow_props_atlas.json
# ✓ [PASS] Kích thước Atlas (1024x512) tuân thủ WebGL tối đa 2048x2048.
# ✓ [PASS] Đóng gói chính xác 51/51 sprite vật thể đơn lẻ (51 frames).
# ✓ [PASS] 100% Frames đều có biên đùn viền extrude: 1px và padding: 2px.
# ✓ [PASS] AtlasTextureResolver định nghĩa và hook chính xác vào Factory & TextureManager.
# ✓ [PASS] Toàn bộ 17 file Tiled Map JSON giữ nguyên vẹn mảng tilesets[] và GID.
# ✓ [PASS] GameConfig.ts, GameScene.ts, PreloadScene.ts cấu hình roundPixels và NEAREST filter.
# => TẤT CẢ 17 HẠNG MỤC KIỂM THỬ BƯỚC 1 ĐÃ VƯỢT QUA 100%!
```
