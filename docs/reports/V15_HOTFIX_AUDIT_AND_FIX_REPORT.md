# BÁO CÁO KIỂM TOÁN & TỔNG KẾT VÁ LỖI TOÀN DIỆN V1.5 (V15-FIX-01 ĐẾN V15-FIX-09)
## DỰ ÁN: HOLLOW WOODS V1.5.1 — THE FOG THAT REMEMBERS

---

### I. NGUYÊN NHÂN GỐC RỄ CỦA LỖI P2GAME (TEXTURE KEY ALREADY IN USE)

Trong bản build cũ (gói 355 tệp, 72.8 MB tải lên lúc 19:51), hệ thống kiểm duyệt p2game.io đã báo chặn với **17 lỗi JavaScript**:
> `Texture key already in use: tree_oak_1 | Texture key already in use: tree_oak_2 | Texture key already in use: tree_oak_3 ...`

#### Phân tích nguyên nhân:
1. **Xung đột nạp kép giữa Atlas Props và Direct Image Load:**
   - 51 sprite vật thể (gồm `tree_oak_1..3`, `tree_dead`, `hollow_tree`, `bush_dense_1..2`, v.v.) đã được đóng gói vào Texture Atlas `hollow_props_atlas.png/.json` và đăng ký trong `AtlasTextureResolver.ts`.
   - Trong `PreloadScene.ts` của bản build cũ trước hotfix, ngoài việc nạp Atlas, mã nguồn vẫn gọi thêm các lệnh `this.load.image('tree_oak_1', ...)` đơn lẻ.
   - Khi Phaser `TextureManager` nạp Atlas, các frame ảo đã được đăng ký; khi tiếp tục nạp các file ảnh đơn lẻ trùng key, Phaser bắn lỗi `console.error("Texture key already in use: " + key)`. Do có 17 đối tượng trùng lặp nên sinh ra đúng 17 lỗi JS làm hỏng kết quả kiểm duyệt.

2. **Cách khắc phục triệt để trong chuỗi V15-FIX:**
   - Trong `PreloadScene.ts`: Xóa bỏ 100% các lệnh `this.load.image` trùng lặp đối với các sprite đã nằm trong `hollow_props_atlas`.
   - Trong `AtlasTextureResolver.ts`: Tối ưu hook `checkKey` và `exists` để phân giải mượt mà giữa Texture Manager và virtual frames.
   - Trong `WorldBuilder.ts`: Loại bỏ hoàn toàn các hàm vẽ cây bằng `Graphics.fillEllipse`, chuyển 100% sang Pixel Art Sprite qua `createTree`.
   - Khử trùng lặp tài nguyên: Tinh gọn từ 355 tệp xuống còn đúng **235 tệp**, giảm kích thước gói ZIP từ ~72.8 MB xuống **50.49 MB** (69.1 MB giải nén).

3. **Kết quả kiểm tra tự động với `p2game-validate`:**
   ```
   Đang kiểm tra release/p2game/hollow-woods-p2game-v1.5.1.zip…
     [  5%] Đang lấy mã nguồn
     [ 20%] Đang phân tích cấu trúc gói
     [ 32%] Đang kiểm tra p2game.json
     [ 45%] Đang kiểm tra cấu trúc và mã nguồn
     [ 60%] Đang kiểm tra ảnh bìa và biểu tượng
     [ 72%] Đang chạy thử trong trình duyệt
     [ 90%] Đang lập bản kê nội dung
     [100%] Bản build đạt yêu cầu
   ────────────────────────────────────────────────────────────────
   235 tệp · 69.1 MB · tải trọng khởi động 2.8 MB
   ✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)
   ```

---

### II. BẢNG TỔNG KẾT TIẾN ĐỘ 9 BƯỚC HOTFIX (V15-FIX-01 -> V15-FIX-09)

| Mã Bước | Hạng Mục Công Việc | Trạng Thái Trước Sửa | Trạng Thái Sau Sửa | Kết Quả |
| :--- | :--- | :--- | :--- | :---: |
| **V15-FIX-01** | Vá lỗi ID vật phẩm, gộp Huy Hiệu, sửa cú pháp JSON | 3 công thức chế tạo hỏng `resultItemId`, trùng ID crest, lỗi cú pháp | Đã chuẩn hóa ID `eqp_bell_ward_charm`, gộp crest, script kiểm tra 15/15 PASS | **100% PASS** |
| **V15-FIX-02** | Khắc phục rò rỉ âm thanh trong `AudioManager.ts` | Reset nhịp tim sai vị trí, rò rỉ loop mưa, loop gió không dừng | Lưu `rainSource`, dừng sạch interval nhịp tim, fade gió an toàn | **100% PASS** |
| **V15-FIX-03** | Đồng bộ hội thoại, cổ thư và cơ chế Đèn/Dầu V1.5 | Còn nhắc phím F cũ, cạn dầu đèn, "Bình Tâm" tàn dư | 100% dialogues & lore đồng bộ sang Hương Trầm Tinh Thần & Chuột trái/Space | **100% PASS** |
| **V15-FIX-04** | Streaming BGM & SFX theo nhu cầu | 5 bài BGM ngốn ~500 MB RAM PCM decode | Chuyển BGM sang phát Streaming qua `HTMLAudioElement`, SFX lazy loading | **100% PASS** |
| **V15-FIX-05** | Khử trùng lặp tài nguyên & chuẩn hóa đường dẫn | Nhiều file audio/sprites nằm rời rạc gây tải thừa | Gom NPC về `characters/npcs/`, dọn audio rời, ASSETS_MANIFEST 0 lỗi 404 | **100% PASS** |
| **V15-FIX-06** | Loại bỏ đóng gói kép 17 Map JSON | 17 map JSON nạp cả static import lẫn runtime HTTP | Loại bỏ static bundle, nạp thuần qua HTTP Cache, giảm bundle JS | **100% PASS** |
| **V15-FIX-07** | Dọn dẹp codebase & tinh gọn scripts | Các file .js thừa song song .ts, hơn 240 script phân mảnh | Chuyển file thừa vào archive, gom gọn cấu trúc dự án | **100% PASS** |
| **V15-FIX-08** | Nâng cấp UX định hướng tuyến 7 chặng & Map/Compass | Người chơi khó nhận biết khi nào cần quay về Trạm Lửa | Nhãn chặng rõ ràng, nhấp nháy khu vực mục tiêu, tối ưu vẽ Canvas | **100% PASS** |
| **V15-FIX-09** | Kiểm toán sâu runtime 5 file lõi & đóng gói Release | Cần xác nhận dọn dẹp collider, ending scene, lifecycle | Khử triệt để graphics ellipse, reset ẩn nấp, toàn bộ 7 test V1.5 PASS | **100% PASS** |

---

### III. KẾT QUẢ KIỂM THỬ HỒI QUY TOÀN DIỆN

1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - Kết quả: **0 lỗi**. Mã nguồn hoàn toàn tuân thủ TypeScript nghiêm ngặt.
2. **Kiểm tra tính toàn vẹn dữ liệu (`verify_data_integrity.mjs`):**
   - 15/15 hạng mục đạt chuẩn (Recipes, Items, Dialogue links, Lore, Quest registry).
3. **Kiểm toán tiếp cận bản đồ & tài nguyên (`audit_map_reachability_and_assets.mjs`):**
   - 73/73 hạng mục đạt chuẩn (100% Maps, Portals, NPC Sprites, Audio files).
4. **Bộ kiểm thử tính năng V1.5:**
   - `test_v15_54_light_aura_and_sanity_overhaul.mjs`: **23/23 PASS**
   - `test_v15_58a_hallucinations_and_apparitions.mjs`: **4/4 PASS**
   - `test_v15_58b_whisper_trap_and_light_dilemma.mjs`: **4/4 PASS**
   - `test_v15_58c_heartbeat_vignette_panic.mjs`: **4/4 PASS**
   - `test_v15_59_ending_screen_and_branching.mjs`: **100% PASS**
   - `test_v15_60_quest_chain_restructuring.mjs`: **72/72 PASS**
   - `test_v15_61_pixel_art_trees_and_village_clean.mjs`: **100% PASS**
5. **Kiểm duyệt nền tảng p2game.io (`npx p2game-validate`):**
   - File kiểm tra: `release/p2game/hollow-woods-p2game-v1.5.1.zip`
   - Kết quả: **✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 lỗi chặn, 0 cảnh báo)**.

---

### IV. HƯỚNG DẪN CẬP NHẬT LÊN P2GAME.IO CHO NGƯỜI DÙNG

Người dùng chỉ cần lấy file bản build mới nhất đã được đóng gói và xác thực thành công:
- **Đường dẫn tệp ZIP:** `G:\HOLLOW WOODS\release\p2game\hollow-woods-p2game-v1.5.1.zip` (hoặc bản alias `hollow-woods-p2game-v1.5.0.zip`).
- **Dung lượng tệp:** `50.49 MB` (gói 235 tệp sạch).
- Tải tệp này lên trang quản trị p2game.io để thay thế cho bản build cũ (19:51) đã bị lỗi. Bản build mới sẽ vượt qua 100% các bài kiểm tra tự động mà không gặp bất kỳ lỗi chặn nào.
