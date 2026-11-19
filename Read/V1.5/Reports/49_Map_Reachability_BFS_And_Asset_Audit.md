# BÁO CÁO KỸ THUẬT BƯỚC V15-49: KIỂM TOÁN TỰ ĐỘNG KHẢ NĂNG DI CHUYỂN BẢN ĐỒ (BFS NAVIGATION GRID) & RÀ SOÁT 100% ASSET, SPRITE, NPC

> **Mã công việc:** V15-49  
> **Dự án:** HOLLOW WOODS V1.5 (Visual & Gameplay Overhaul)  
> **Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
> **Trạng thái:** HOÀN TẤT XUẤT SẮC (73/73 TEST PASS 100%, 0 LỖI TSC, BUILD VITE THÀNH CÔNG)

---

## 1. TỔNG QUAN & BỐI CẢNH NÂNG CẤP

Trong quá trình mở rộng thế giới Hollow Woods V1.5 với 17 phân khu địa hình, nhiều cơ chế ranh giới cũ, collider tự động từ `AutoPerimeterWallsModule` và vị trí đặt NPC cốt truyện tiềm ẩn các rủi ro:
1. **Collider thừa & Bẫy kẹt biên giới:**
   - Phân khu Làng Bellhollow bị `AutoPerimeterWallsModule` tạo một bức tường chu vi phía Nam tự động dài 1120px tại $Y = 744$, cắt ngang lối thông sang Rừng Ngoại Vi (Outer Woods) và chắn trước mặt Trạm Lửa của Sir Vaelen.
   - Các phân khu liền kề sinh ra các cặp tường chu vi trùng lặp (duplicate perimeter colliders) tại cùng tọa độ tiếp giáp.
2. **NPC bị đè collider cứng & kẹt khoảng trống tương tác:**
   - Cậu bé đưa tin Finn tại $(660, 265)$ đứng lấn trực tiếp vào hitbox của Bảng Tin Dị Thường $(657, 258, 14\times 8\,\text{px})$.
   - Thợ rèn Bram tại $(1230, 390)$ đứng quá sát Bàn Chế Tạo $(1214, 373, 48\times 14\,\text{px})$ và có đoạn mã override `bramBody.setOffset(-10, -6)` chứa offset âm.
   - Sir Vaelen tại $(1435, 710)$ bị cản trước mặt bởi bức tường biên tự động $Y = 744$.
3. **Yêu cầu kiểm toán tự động toàn diện:**
   - Dựng lưới đi bộ Navigation Grid $16\times 16\,\text{px}$ và chạy thuật toán tìm đường BFS từ điểm xuất phát để chứng minh 100% các phân khu và mốc cốt truyện đều liên thông thông suốt.
   - Rà soát toàn bộ danh mục tài nguyên thực thể trong `public/assets/`, đảm bảo 100% là tệp ảnh thật, không còn sprite vẽ tạm bằng code.

---

## 2. NỘI DUNG KỸ THUẬT ĐÃ TRIỂN KHAI

### 2.1. Rà soát & Xác minh 100% Asset Spritesheet Thật (`scripts/audit_map_reachability_and_assets.mjs`)
- Đã kiểm tra 31 tệp tài nguyên thực thể cốt lõi trong `public/assets/`:
  - **Nhân vật chính The Mossbound Wayfarer (Black Knight 4 hướng):** Đủ 7 tệp (`idle` 256×256, `walk` 384×256, `run` 384×256, `attack` 384×256, `hurt` 192×256, `death` 384×256, `portrait` 64×64).
  - **Sir Vaelen — Kỵ Sĩ Trầm Mặc (2D_SL_Knight):** Đủ 3 tệp (`pray_sheet` 768×64 12 frames, `idle_sheet` 512×64 8 frames, `portrait` 64×64).
  - **Dân làng Bellhollow (Garth, Edda, Neris, Bram, Finn):** Đủ 15 tệp (spritesheet 4 hướng / idle, sprite tĩnh 64×64 và portrait đối thoại 64×64).
  - **Boss Kẻ Nuốt Tiếng Chuông (SHADOW Series):** Đủ 6 tệp spritesheet thật (`idle` 3458×87, `walk` 3458×87, `attack1` 2470×87, `attack2` 2223×87, `hit` 247×87, `death` 8151×87).
- Xác minh `SatyrPlayer.ts`, `NPCEntity.ts`, và `MireWardenBoss.ts` không còn bất kỳ khối hộp hay đa giác vẽ tạm nào bằng mã Graphics thay thế cho sprite.

### 2.2. Vá tọa độ đứng & Đảm bảo khoảng trống tương tác [E] $\ge 48\,\text{px}$ cho NPC
1. **Finn — Cậu Bé Đưa Tin:**
   - Dời từ $(660, 265)$ xuống $(660, 280)$ trong cả `src/scenes/GameScene.ts` và `src/data/zones.json`.
   - Vị trí mới đứng đàng hoàng trên sân đá thoáng trước Bảng Tin Dị Thường, hoàn toàn thoát khỏi hitbox bảng tin và có khoảng trống mặt trước $> 48\,\text{px}$.
2. **Bram — Thợ Rèn Làng:**
   - Dời từ $(1230, 390)$ xuống $(1230, 405)$ trong cả `src/scenes/GameScene.ts` và `src/data/zones.json`.
   - Xóa bỏ đoạn override `bramBody.setSize(20, 12); bramBody.setOffset(-10, -6);` trong `GameScene.ts`, giúp Bram dùng chung hitbox chuẩn bàn chân NPC (`setSize(22, 14)`, `setOffset(21, 50)`).
   - Khoảng trống phía trước mặt Bram đạt $> 55\,\text{px}$ hướng ra đường làng.
3. **Sir Vaelen — Kỵ Sĩ Trầm Mặc:**
   - Tọa độ chuẩn hóa $(1435, 705)$ quỳ cạnh Bếp Lửa Hồng Đá Cổ $(1476, 717)$.
   - Đồng bộ bán kính nghe nhạc campfire trong `GameScene.ts` sang $Y = 705$.

### 2.3. Tối ưu hóa & Deduplication Tường Chu Vi (`src/world/modules/AutoPerimeterWallsModule.ts`)
1. **Loại trừ Bellhollow khỏi Auto Perimeter Walls:**
   - Thêm `zoneId === 'bellhollow'` vào danh sách phân khu mở cùng `ancient_rune_puzzle`, `deep_forest`, `sub_whispering_clearing`, và `crooked_path`.
   - Xóa bỏ triệt để dải tường vô hình $1120\times 32\,\text{px}$ tại $Y = 744$, khai thông hoàn toàn lối đi từ Làng sang Rừng Ngoại Vi và Trạm Lửa của Sir Vaelen.
2. **Cơ chế Deduplication cho `createWallSegment`:**
   - Tích hợp kiểm tra quét các collider hiện có trước khi sinh đoạn tường mới. Nếu đã có tường tại cùng tọa độ $(\pm 6\,\text{px})$ và kích thước $(\pm 12\,\text{px})$, tái sử dụng collider cũ và gộp tên nhận diện.
   - Triệt tiêu hoàn toàn 9 cặp tường chu vi trùng lặp giữa các phân khu tiếp giáp, giảm tổng số collider môi trường từ 402 xuống 378 sạch sẽ.

### 2.4. Thuật toán BFS kiểm toán khả năng di chuyển trên Navigation Grid $16\times 16\,\text{px}$
- Xây dựng lưới đi bộ toàn cầu: $313 \text{ cột} \times 180 \text{ dòng} = 56,340 \text{ ô}$ (kích thước mỗi ô $16\times 16\,\text{px}$, phạm vi $X: 0..5000, Y: -1280..1600$).
- Thuật toán BFS xuất phát từ Quảng trường Làng Bellhollow $(750, 260)$:
  - Quét liên thông thành công **35,265 ô tự do**.
  - Xác nhận **100% mục tiêu cốt truyện đều đạt BFS Reachable = true và Blocked = false**:
    * **Bellhollow:** Cổng Tây (Garth), Nhà Edda, Nhà Neris, Xưởng Rèn Bram, Bảng Tin Finn, Sân Tháp Chuông.
    * **Nông Trại Trú Ẩn (Sanctuary Farm):** Lửa trại nông trại trú ẩn $(800, 750)$.
    * **Rừng Ngoại Vi (Outer Woods):** Lối vào $(1300, 650)$ và Trạm Lửa Sir Vaelen $(1435, 705)$.
    * **Đường Mòn Quanh Co (Crooked Path):** Lộ trình uốn lượn $(2140, 150)$ và Cầu Gỗ Phụ Xuyên Sương $(2740, 390)$.
    * **Rừng Sâu (Deep Forest):** Ngõ nối Nam giải phóng hốc kẹt $(2080, -80)$ và Vùng mở rộng phía Bắc $(2240, -300)$.
    * **Đầm Lầy Tĩnh Lặng (Silent Mire):** Mép tiếp giáp $(2880, 380)$ và Cầu ván gỗ trung tâm $(3100, 380)$.
    * **Miếu Chuông Phế Tích:** Quảng trường giải đố cổ ngữ $(3450, 280)$, đường dẫn phía Đông $(3800, 270)$ và Phòng Boss Kẻ Nuốt Tiếng Chuông $(4400, 300)$.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG

| Script Kiểm Thử | Mục Tiêu Kiểm Tra | Kết Quả |
| :--- | :--- | :---: |
| `scripts/audit_map_reachability_and_assets.mjs` | Kiểm toán toàn diện: 100% Asset thật, vị trí NPC, Deduplication, BFS Grid | **73/73 PASS (100%)** |
| `scripts/verify_v15_03_corner_sliding_and_colliders.mjs` | Kiểm tra Corner Sliding, Hitbox chân nhân vật & NPC | **25/25 PASS (100%)** |
| `scripts/test_v15_03_pixel_scale_and_village_overhaul.mjs` | Kiểm tra tỷ lệ kiến trúc nhà dân Bellhollow & hàng rào composite | **24/24 PASS (100%)** |
| `scripts/test_v15_40_rune_puzzle_colliders.mjs` | Kiểm tra dọn dẹp collider khu Ancient Rune Puzzle | **12/12 PASS (100%)** |
| `scripts/test_v15_41_rune_seam_and_walkway.mjs` | Kiểm tra chống snapback và thông suốt lối đi Tây Ancient Rune | **12/12 PASS (100%)** |
| `scripts/test_v15_46_boss_pillar_damage_and_free_break.mjs` | Kiểm tra hitbox trụ phong ấn Boss Miếu Chuông | **22/22 PASS (100%)** |
| `scripts/test_v15_47_boss_composure_assault_and_zero_mechanics.mjs` | Kiểm tra cơ chế tấn công tinh thần của Boss Miếu Chuông | **28/28 PASS (100%)** |
| `scripts/test_v15_48_iframe_focus_and_hud_layout.mjs` | Kiểm tra focus iframe, spawn an toàn và bố cục HUD đồng hồ | **28/28 PASS (100%)** |
| `npx tsc --noEmit` | Kiểm tra kiểu TypeScript trên toàn bộ codebase | **0 Lỗi** |
| `npm run build` | Đóng gói phát hành Vite Production Bundle | **Thành công (10.44s)** |
