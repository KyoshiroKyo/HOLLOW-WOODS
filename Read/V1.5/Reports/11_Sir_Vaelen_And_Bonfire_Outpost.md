# BÁO CÁO KỸ THUẬT V15-31: SỬA LỖI ASSET SIR VAELEN, GẮN ĐÚNG SPRITE 2D_SL_KNIGHT VÀ THIẾT LẬP TRẠM LỬA RỪNG TĨNH LẶNG (QUIET FOREST BONFIRE OUTPOST)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã phân đoạn:** `V15-31`  
**Ngày thực hiện:** 19/11/2026  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Tập tin ảnh hưởng:**
- `src/entities/NPCEntity.ts`
- `src/scenes/PreloadScene.ts`
- `src/scenes/GameScene.ts`
- `src/world/WorldBuilder.ts`
- `src/systems/CampSanctuarySystem.ts`
- `src/systems/SurvivalSystem.ts`
- `src/systems/DialogueSystem.ts`
- `src/data/zones.json`
- `src/data/dialogues.json`
- `src/data/content_registry.json`
- `src/registry/registryData.ts`

---

## 1. NGUYÊN NHÂN GỐC RỄ & VẤN ĐỀ TRƯỚC SỬA ĐỔI

1. **Lỗi gán nhầm Asset giữa Người Giữ Làng và Kỵ Sĩ:**
   - Trong `src/entities/NPCEntity.ts`, hàm phân loại `baseId` chỉ kiểm tra theo chuỗi `edda`, `neris`, `bram`, `finn` và nhánh `else` mặc định gán `this.baseId = 'garth'`.
   - Vì thực thể Kỵ Sĩ có ID `npc_campfire_knight`, nó rơi thẳng vào nhánh `else`, dẫn đến việc bị gán nhầm sprite áo choàng tím/xám cầm giáo (`garth_walk_sheet`) của Garth.
   - Cả Người Giữ Làng Garth và Hiệp Sĩ Canh Lửa đều dùng chung hình ảnh gác cổng của Garth, làm mất đi dáng vẻ giáp bạc oai phong của một thành viên Đoàn Kỵ Sĩ Canh Lửa.

2. **Chồng chéo vị trí trong Làng Bellhollow:**
   - Vị trí cũ của Kỵ Sĩ và đống lửa trại trong làng Bellhollow nằm sát cạnh Bà Lão Edda và Tháp Chuông Cổ, làm cho quảng trường trung tâm trở nên chật chội, chồng lấn tầm nhìn và không hợp lý với vai trò kỵ sĩ bảo hộ ven rừng.

---

## 2. CÁC CẢI TIẾN & TRIỂN KHAI CHI TIẾT

### 2.1. Khôi phục Asset cho Garth và Gắn Đúng Sprite 2D_SL_Knight cho Sir Vaelen
1. **Trả lại Sprite độc quyền cho Người Giữ Làng Garth:**
   - Sprite áo choàng xám/tím cầm giáo (`garth_walk_sheet.png`, `garth.png`, `portrait_garth.png`) được trả về cho duy nhất Garth tại cổng làng Bellhollow (`x: 490, y: 210`).

2. **Gắn Bộ Sprite Hiệp Sĩ Giáp Bạc Chuẩn Hóa (`2D_SL_Knight_v1.0_3`):**
   - **Tư thế Quỳ Cầu Nguyện Canh Lửa:** `campfire_knight_pray_sheet.png` (Kích thước $768 \times 64\text{px}$, gồm 12 frame chuẩn $64 \times 64\text{px}$, animation `anim_campfire_knight_pray`, frameRate: 4 FPS, lặp vô tận).
   - **Tư thế Đứng Đối Thoại Trang Nghiêm:** `campfire_knight_idle_sheet.png` (Kích thước $512 \times 64\text{px}$, gồm 8 frame chuẩn $64 \times 64\text{px}$, animation `anim_campfire_knight_idle`, frameRate: 6 FPS, lặp vô tận).
   - **Chân dung Hội thoại:** `portrait_campfire_knight.png` ($64 \times 64\text{px}$).
   - **Cơ chế chuyển đổi hoạt ảnh mượt mà (`setInteracting`):**
     * Khi người chơi đứng từ xa hoặc chưa nhấn `[E]`: Kỵ sĩ duy trì tư thế quỳ chống kiếm hướng về ngọn lửa hồng (`setFlipX(true)`).
     * Khi người chơi nhấn `[E]` bắt đầu đối thoại: Kỵ sĩ đứng dậy trang nghiêm (`anim_campfire_knight_idle`), quay mặt về phía người chơi.
     * Khi kết thúc đối thoại: Kỵ sĩ cúi chào và quỳ trở lại vị trí canh giữ ngọn lửa.

3. **Chuẩn hóa Danh xưng và Bảng tên Thông minh:**
   - **Tên chính:** `"Sir Vaelen — Kỵ Sĩ Trầm Mặc"`
   - **Danh xưng phụ:** `"Lưỡi gươm chọn sự bình yên"`
   - **Gợi ý tương tác khi lại gần ($\le 52\text{px}$):** `"[E] Trò chuyện với Kỵ Sĩ Vaelen"`
   - Chiều rộng Badge tên được tính động theo độ dài ký tự (`Math.max(100, Math.round(cleanName.length * 6.8 + 24))`), đảm bảo dòng tên dài không bị tràn viền hay che khuất icon nhiệm vụ.

---

### 2.2. Thiết Lập "Trạm Lửa Rừng Tĩnh Lặng" (Quiet Forest Bonfire Outpost)
1. **Di dời ra khỏi Làng Bellhollow:**
   - Xóa bỏ hoàn toàn thực thể Kỵ Sĩ khỏi phân khu `bellhollow` trong `zones.json` và `GameScene.ts`.
   - Thiết lập trạm dừng chân mới tại khoảng đất trống yên tĩnh ven đường mòn sang The Crooked Path:
     * **Tọa độ Bếp Lửa Hồng Đá Cổ:** `x: 1470, y: 710` (Outer Woods).
     * **Tọa độ Sir Vaelen quỳ canh gác:** `x: 1435, y: 710` (Outer Woods, bên trái bếp lửa).

2. **Dựng Cảnh Nghệ Thuật & Chi Tiết Môi Trường:**
   - Quầng sáng ấm áp 3 lớp phát quang mịn (bán kính $180\text{px}$, tông màu cam vàng ấm dịu).
   - Vòng đá cổ rêu phong và củi gỗ xếp gọn gàng.
   - Khúc gỗ ngồi nghỉ chân cho lữ khách bên cạnh đốm lửa.
   - Điểm va chạm tĩnh chống bước đè lên tâm lửa (`createStaticBoxColliderCentered(1470, 710, 24, 16)`).

---

### 2.3. Cơ Chế Điểm Nghỉ Ngơi Giữa Đường (Mid-Journey Safe Rest Zone)
1. **Rào Chắn Ánh Sáng Xua Đuổi Quái Vật (Sanctuary Guarding Radius $180\text{px}$):**
   - Tích hợp vào `CampSanctuarySystem.ts`: Quái vật không thể xâm nhập vào phạm vi $180\text{px}$ quanh tâm bếp lửa `(1470, 710)` hoặc Kỵ Sĩ `(1435, 710)`.

2. **Buff Sinh Tồn & Hồi Phục Bình Tâm:**
   - **Hồi máu tự nhiên:** $+4\text{ HP/s}$ khi đứng trong vòng hơi ấm.
   - **Gia tốc hồi Bình Tâm:** $+20\%$ (hệ số $\times 1.20$, hồi $+4.8$ Bình Tâm/giây).
   - **Gia tốc hong khô Độ Ẩm:** $+20\%$ (hệ số $\times 1.20$).
   - Đăng ký chính thức vào `warmSources` của `SurvivalSystem.ts`.

3. **Tương Tác Sưởi Ấm Nhanh (`warm_quiet_bonfire`):**
   - Khi đứng cạnh bếp lửa và nhấn `[E] Sưởi Ấm Bên Lửa Cổ`:
     * Hồi ngay $+15$ Bình Tâm (Composure).
     * Giảm $-20$ Độ Ẩm (Moisture), hong khô quần áo.
     * Tăng $+15$ Thân Nhiệt (Temperature), xua tan khí lạnh rùng mình.
     * Phát âm thanh sưởi ấm dịu êm và hiển thị thông báo popup vàng hổ phách.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BIÊN DỊCH

### 3.1. Biên dịch TypeScript (`npx tsc --noEmit`)
- **Kết quả:** `0 errors` (Hoàn thành hoàn hảo).

### 3.2. Kiểm thử Tự động (`scripts/test_v15_31_vaelen_bonfire_outpost.mjs`)
- **24/24 Bài Kiểm Thử Đạt (PASS 100%):**
  1. `[PASS]` Tập tin `campfire_knight_pray_sheet.png` tồn tại trong `public/assets/characters/npcs`.
  2. `[PASS]` Tập tin `campfire_knight_idle_sheet.png` tồn tại trong `public/assets/characters/npcs`.
  3. `[PASS]` Tập tin `portrait_campfire_knight.png` tồn tại trong `public/assets/characters/npcs`.
  4. `[PASS]` Tập tin `garth_walk_sheet.png` của Garth tồn tại độc lập riêng biệt.
  5. `[PASS]` `NPCEntity` nhận diện chính xác `baseId = campfire_knight`.
  6. `[PASS]` `NPCEntity` căn chuẩn độ cao nhãn tên `headOffsetY = 46` cho dáng quỳ.
  7. `[PASS]` `NPCEntity` nạp đúng spritesheet riêng biệt từ gói `2D_SL_Knight`.
  8. `[PASS]` `NPCEntity` hỗ trợ chuyển đổi mượt mà giữa tư thế quỳ canh lửa (pray) và đứng đối thoại (idle).
  9. `[PASS]` `PreloadScene` định nghĩa đầy đủ hằng số asset cho Sir Vaelen.
  10. `[PASS]` `PreloadScene` nạp đủ các alias khóa sprite.
  11. `[PASS]` `PreloadScene` khởi tạo cả 2 animation `anim_campfire_knight_pray` và `anim_campfire_knight_idle`.
  12. `[PASS]` `GameScene` khởi tạo Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng `(1435, 710)`.
  13. `[PASS]` `GameScene` hiển thị đúng gợi ý tương tác `[E] Trò chuyện với Kỵ Sĩ Vaelen`.
  14. `[PASS]` `GameScene` xử lý tương tác sưởi ấm tại Bếp Lửa Hồng (+15 Bình Tâm, -20 Độ Ẩm, +15 Thân Nhiệt).
  15. `[PASS]` `WorldBuilder` gọi dựng Trạm Lửa Rừng Tĩnh Lặng tại `(1470, 710)`.
  16. `[PASS]` `WorldBuilder` tạo điểm tương tác `quiet_forest_bonfire` gắn với `warm_quiet_bonfire`.
  17. `[PASS]` `CampSanctuarySystem` cấu hình tọa độ tâm `(1470, 710)`, kỵ sĩ `(1435, 710)` và bán kính `180px`.
  18. `[PASS]` `CampSanctuarySystem` kiểm tra vùng bảo hộ tại Outer Woods và Crooked Path.
  19. `[PASS]` `SurvivalSystem` đăng ký Trạm Lửa Rừng Tĩnh Lặng vào `warmSources`.
  20. `[PASS]` `SurvivalSystem` tích hợp `CampSanctuarySystem` để kích hoạt hồi phục khi đứng trong vòng an toàn.
  21. `[PASS]` Vùng Bellhollow không còn chứa `npc_campfire_knight`.
  22. `[PASS]` Vùng Outer Woods chứa `npc_campfire_knight` tại đúng tọa độ `(1435, 710)`.
  23. `[PASS]` Vùng Outer Woods chứa interactable `quiet_forest_bonfire`.
  24. `[PASS]` Hội thoại `campfire_knight_intro` mang đúng tên người nói Sir Vaelen và chân dung kỵ sĩ.

### 3.3. Đóng gói Production Build (`npm run build`)
- **Kết quả:** Build thành công 100% trong 10.70s (`dist/index.html` và `dist/assets/`).
