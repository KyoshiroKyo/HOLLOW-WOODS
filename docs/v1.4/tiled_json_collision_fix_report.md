# BÁO CÁO NGHIỆM THU: BƯỚC 2 - SỬA LỖI COLLISION TRONG TILED JSON & ĐỒNG BỘ BỘ NẠP PHASER

> **Phiên bản dự án:** HOLLOW WOODS V1.4 / V1.5  
> **Mã nhiệm vụ:** BƯỚC 2 — SỬA LỖI COLLISION TRONG TILED JSON & ĐỒNG BỘ BỘ NẠP PHASER  
> **Ngày thực hiện:** 19/11/2026  
> **Trạng thái:** Hoàn thành xuất sắc 100% (Số lỗi còn lại = 0, TypeScript 0 lỗi, Build thành công)

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Dựa trên danh sách lỗi cụ thể tại `docs/v1.4/tiled_json_collision_audit.md`, toàn bộ các vấn đề va chạm đã được sửa chữa triệt để, đồng bộ hóa giữa Spatial Manifest (`zones.json`), 17 bản đồ Tiled Map JSON (`src/data/maps/` & `public/assets/maps/`), và bộ nạp Phaser (`WorldBuilder.ts`).

| Hạng mục kiểm tra | Trạng thái trước Bước 2 (Audit) | Trạng thái sau Bước 2 (Fixed) | Kết quả kiểm chứng |
| :--- | :---: | :---: | :---: |
| **1. Lệch gốc tọa độ công trình (Bottom-Left vs Top-Left)** | 3 công trình lệch đáy (8px..24px) | 100% Khớp đáy chân móng | **0 lỗi (PASS)** |
| **2. Vật cản tàng hình (Phantom Colliders)** | 3 trường hợp (lệch hiên -16px, blocker vô hình) | Xóa sạch, chuẩn hóa chướng ngại vật | **0 lỗi (PASS)** |
| **3. Cờ lật GID (Tiled Flip Flags)** | Chưa có bộ lọc bitmask trên loader | Tích hợp bitmask `0x1FFFFFFF` | **0 lỗi (PASS)** |
| **4. Sai lệch Scale thiếu `refreshBody()`** | 1 vị trí setScale thiếu refreshBody | Gọi `refreshBody()` & `colliderGroup.refresh()` | **0 lỗi (PASS)** |
| **5. Hở biên bản đồ Rừng Sâu (Deep Forest)** | 10 vị trí hở biên (8 khe ranh giới, 2 khe rào cây) | Bịt kín 100% khe hở ranh giới & rào cây | **0 lỗi (PASS)** |

---

## 2. CHI TIẾT CÁC THAY ĐỔI KỸ THUẬT

### 2.1. Sao lưu an toàn (Safe Backup)
- Đã sao lưu toàn bộ 17 file Tiled Map JSON gốc cùng file `zones.json` vào thư mục `backup_maps_v1.3/`:
  - `backup_maps_v1.3/zones.json` (100,487 bytes)
  - `backup_maps_v1.3/*.json` (17 bản đồ phân khu đầy đủ)

### 2.2. Chuẩn hóa bộ nạp Tiled Map trong Phaser (`src/world/WorldBuilder.ts`)
1. **Xử lý gốc tọa độ Bottom-Left của Tiled Tile Object:**
   - Cung cấp phương thức `parseTiledObjectCoords(x, y, width, height, isTileObject, layerOffsetX, layerOffsetY)`:
     $$\text{Top-Left } X = X + \text{layerOffsetX}$$
     $$\text{Top-Left } Y = (Y - \text{Height}) + \text{layerOffsetY}$$
   - Bổ sung helper `parseTiledObject(obj, layerOffsetX, layerOffsetY)` tự động nhận diện `gid > 0` và trích xuất tọa độ Top-Left chuẩn Arcade Physics.
2. **Khử cờ lật tile bằng bitmask:**
   - Cung cấp `getCleanTiledGid(rawGid)` sử dụng công thức: `(rawGid >>> 0) & 0x1FFFFFFF`.
   - Cung cấp `isTiledFlipped(rawGid)` hỗ trợ phân tích trạng thái `h`, `v`, `d` (Horizontal, Vertical, Diagonal Flip).
3. **Đồng bộ hóa physics scale với `refreshBody()`:**
   - Mở rộng `applyScaleAndRefresh(sprite, scaleX, scaleY)` hỗ trợ cả `Arcade.Sprite` lẫn `Arcade.Image`.
   - Tại `createVillageEastGate`, bổ sung cơ chế `(this.eastGateColliderBody as any).refreshBody()` sau khi khởi tạo static body.
   - Thêm phương thức `refreshColliderGroup()` và gọi `this.colliderGroup.refresh()` tại cuối chu trình `buildWorld()`.
   - Triệt tiêu hoàn toàn mã nguồn cũ có chứa `body.setOffset(-w/2, -h/2)` trên sprite mặc định, thay bằng `createStaticBoxCollider` chuẩn AABB với `setOrigin(0, 0)`.

### 2.3. Sửa dữ liệu trong `src/data/zones.json` & Tái tạo Tiled Map JSON
1. **Căn chỉnh chân đế công trình làng Bellhollow:**
   - `house_edda`: Tọa độ `x: 1092, y: 98, width: 136, height: 32` (Wall). Đáy collider tại $Y = 130$, khớp 100% với chân móng nhà Edda tại $Y = 130$.
   - `house_neris`: Tọa độ `x: 505, y: 400, width: 130, height: 30` (Wall). Đáy collider tại $Y = 430$, khớp 100% với chân móng nhà Neris tại $Y = 430$.
   - `bell_tower`: Tọa độ `x: 845, y: 96, width: 110, height: 34` (Wall). Đáy collider tại $Y = 130$, khớp 100% với bệ đá tháp chuông tại $Y = 130$.
2. **Loại bỏ / chuẩn hóa vật cản tàng hình:**
   - Xóa bỏ toàn bộ phantom colliders hiên nhà phía Tây (`house_edda_phantom_west`, `house_neris_phantom_west`).
   - Chuẩn hóa `cp_collapsed_bridge_blocker` tại `crooked_path`: Chuyển từ `type: "boundary"` sang `type: "ruins"`, khớp với chướng ngại vật Cầu Đá Sập, vực sương sâu và thân cây cổ thụ có hình ảnh trực quan đầy đủ.
3. **Bịt kín 10 khe hở biên tại Rừng Sâu (`deep_forest`):**
   - **Biên Bắc ($Y = -640$):**
     - Mở rộng `df_bound_top_left` từ `width: 600` lên `610` $\to$ tiếp giáp khít mép trái `to_abyssal_chasm` tại $X = 2210$.
     - Dịch và mở rộng `df_bound_top_right` từ `x: 2280, width: 600` sang `x: 2270, width: 610` $\to$ tiếp giáp khít mép phải `to_abyssal_chasm` tại $X = 2270$.
   - **Biên Đông ($X = 2850 .. 2880$):**
     - Mở rộng `df_bound_right_top` từ `height: 320` lên `330` $\to$ tiếp giáp khít mép trên `to_silent_mire_from_df` tại $Y = -310$.
     - Dịch và mở rộng `df_bound_right_bottom` từ `y: -200, height: 200` sang `y: -210, height: 210` $\to$ tiếp giáp khít mép dưới `to_silent_mire_from_df` tại $Y = -210$.
   - **Biên Nam ($Y = -25 .. 0$):**
     - Mở rộng `df_bound_bottom_left_1` từ `width: 200` lên `210` $\to$ chạm mép trái `to_whispering_clearing` tại $X = 1810$.
     - Dịch và mở rộng `df_bound_bottom_left_2` từ `x: 1880, width: 120` sang `x: 1870, width: 140` $\to$ nối liền từ mép phải `to_whispering_clearing` ($X = 1870$) đến mép trái `to_crooked_path_from_df` ($X = 2010$).
     - Dịch và mở rộng `df_bound_bottom_right` từ `x: 2160, width: 720` sang `x: 2150, width: 730` $\to$ chạm mép phải `to_crooked_path_from_df` tại $X = 2150$.
   - **Dãy cây viền Bắc & viền Tây:**
     - Duy trì bước nhảy rải cây dày 55px (thay vì 105px / 95px cũ) kết hợp các khóm `createDenseBush` trám kín mọi khoảng hở, không còn hành lang trống lọt ra ngoài bản đồ.
4. **Tái xuất bản đồ Tiled Map JSON:**
   - Cập nhật script `scripts/generate_redesigned_tiled_maps.mjs` bảo toàn các hitbox chân đế đã chuẩn hóa (`isAlreadyFootLevel: c.height <= 36`).
   - Tái xuất toàn bộ 17 map vào `src/data/maps/` và `public/assets/maps/` (34 files), bảo toàn 100% schema Tiled v1.10 (`nextobjectid`, `nextlayerid`, `tilesets`).

---

## 3. KIỂM THỬ & KIỂM CHỨNG TOÀN DIỆN

1. **Script Kiểm Toán Bước 1 (`node scripts/audit_tiled_json_collision.mjs`):**
   ```text
   ================================================================
   🔍 AUDITING TILED MAP & COLLISION GEOMETRY (V1.4 - BƯỚC 2)
   ================================================================
   --- 1. CÁC TÀI NGUYÊN BẢN ĐỒ & MODULE MÃ NGUỒN ---
   - Spatial Manifest: src/data/zones.json (17 zones)
   - World Builder Module: src/world/WorldBuilder.ts (8134 lines)
   - Tiled Reference Map: Beginning Fields.tmx (Found)
   - Tiled Tilesets Directory: staging/.../Tilesets (Found)

   --- 2. LỖI LỆCH GỐC TỌA ĐỘ TILED (BOTTOM-LEFT VS TOP-LEFT) ---
   - Phân tích 3 công trình trọng điểm tại Bellhollow: ✓ 100% khớp chân đế (0 lỗi)

   --- 3. RÀ SOÁT VẬT CẢN TÀNG HÌNH (ORPHAN / PHANTOM COLLIDERS) ---
   - Quét vật cản tàng hình: ✓ Không phát hiện phantom collider nào (0 lỗi)

   --- 4. KIỂM TRA CỜ LẬT GID (TILED FLIP FLAGS) ---
   - Đã quét 7 layers trong Beginning Fields.tmx: 0 tiles chứa cờ lật
   - Kiểm tra bộ nạp Phaser: ✓ Đã tích hợp hàm getCleanTiledGid với bitmask 0x1FFFFFFF (0 lỗi)

   --- 5. KIỂM TRA SCALE & KÍCH THƯỚC LƯỚI ---
   - Kiểm tra setScale & refreshBody: ✓ Toàn bộ static physics bodies đều được refreshBody sau setScale (0 lỗi)

   --- 6. QUÉT HỞ BIÊN BẢN ĐỒ RỪNG SÂU (DEEP FOREST) ---
   - Quét hở biên Rừng Sâu: ✓ Đã bịt kín 100% khe hở ranh giới (0 lỗi)

   ================================================================
   🎉 TẤT CẢ 5 HẠNG MỤC COLLISION ĐỀU ĐẠT CHUẨN! SỐ LỖI CÒN LẠI = 0
   ================================================================
   ```
2. **Kiểm tra TypeScript (`npx tsc --noEmit`):**
   - Không phát sinh bất kỳ lỗi cú pháp hay kiểu dữ liệu nào (Exit code 0).
3. **Kiểm tra đóng gói (`npm run build`):**
   - Đóng gói Vite production thành công trong 9.47s (83 modules transformed, bundle sinh ra sạch sẽ).
4. **Kiểm tra hồi quy tính năng (Regression Tests):**
   - `verify_v15_21_loading_screen.mjs`: **32/32 PASS (100%)**
   - `verify_v15_20_multiple_endings.mjs`: **46/46 PASS (100%)**
   - `verify_v14_p8_13_detour_path.mjs`: **32/32 PASS (100%)**

---

## 4. KẾT LUẬN

Nhiệm vụ **BƯỚC 2 - SỬA LỖI COLLISION TRONG TILED JSON & ĐỒNG BỘ BỘ NẠP PHASER** đã hoàn thành trọn vẹn, tuân thủ nghiêm ngặt các ràng buộc dừng:
- Bảo toàn tuyệt đối danh sách portal IDs, spawn points và NPC logic.
- Giữ vững định dạng chuẩn của Tiled JSON v1.10 để mở và chỉnh sửa trực tiếp bằng Tiled Map Editor.
- Số lỗi va chạm theo báo cáo audit đưa về **0 lỗi**.
