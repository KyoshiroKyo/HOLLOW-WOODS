# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT C4-12-09
## TÍCH HỢP HỆ THỐNG NPC RUNTIME, CHUẨN HÓA VỊ TRÍ 5 NPC & KIỂM ĐỊNH PLAYTEST THỰC TẾ

- **Mã lệnh:** `COMMAND C4-12-09` (Hoàn thiện toàn diện Phần 1 & Phần 2)
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái thực thi:** **HOÀN TẤT THÀNH CÔNG (56/56 TIÊU CHÍ QA/QC ĐẠT 100% PASS)**
- **Kiểm tra TypeScript:** `npx tsc --noEmit` -> **0 lỗi (Clean Compilation, Mã thoát 0)**
- **Bản sao lưu trước khi sửa:**
  - `Backups/C4-12-09_PART1_PRE_BACKUP/` (`PreloadScene.ts`, `NPCEntity.ts`)
  - `Backups/C4-12-09_PART2_PRE_BACKUP/` (`GameScene.ts`, `zones.json`)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU CỦA BƯỚC C4-12-09

Bước C4-12-09 hoàn thiện việc đưa các tài nguyên pixel-art $64 \times 64\text{ px}$ và ảnh chân dung (từ bước C4-12-08) vào hoạt động runtime thực tế trong gameplay:
1. **Nâng cấp lớp thực thể `NPCEntity`:**
   - Chuyển đổi từ ảnh tĩnh `Phaser.GameObjects.Image` sang `Phaser.GameObjects.Sprite` có phát hoạt ảnh lặp đa hướng (`idle` và `walk`).
   - Căn chỉnh điểm neo chân (`origin`) chuẩn xác tại `(0.5, 58/64)` giúp chân nhân vật luôn bám đúng mặt đất và thứ tự lớp chiều sâu `depth` theo tọa độ $Y$ hoạt động chuẩn xác.
   - Nhãn tên NPC (`namePlate`) và bong bóng gợi ý `[E] Trò chuyện` (`promptBubble`) được chuyển thành container ở cấp Scene với độ sâu tuyệt đối `depth = 5000` và `depth = 5001`, nền mờ sẫm màu (`0x090d0b`, alpha 0.90) và viền đồng cổ kép, bảo đảm luôn hiển thị rõ ràng, không bao giờ bị mái nhà hay ngọn cây che khuất.
2. **Chuẩn hóa vị trí và không gian đi lại cho toàn bộ 5 NPC tại làng Bellhollow:**
   - **Garth (Người Canh Cổng):** Đứng tại cổng Tây làng Bellhollow (`x: 520, y: 265`), đi tuần ngắn trong khoảng $X \in [505, 535]$.
   - **Bà Lão Edda (Người Giữ Chuông):** Đứng tại khoảng sân thoáng bên trái Tháp Chuông (`x: 710, y: 380`).
   - **Neris (Người Chữa Thảo Mộc):** Đứng trên mặt đất thông thoáng trước cửa nhà Thảo Mộc (`x: 970, y: 215`).
   - **Bram (Thợ Thủ Công Làng):** Đứng gần khu vực Bàn Chế Tạo (`x: 1025, y: 370`).
   - **Finn (Cậu Bé Đưa Tin):** Đi lại nhẹ quanh rìa quảng trường Tháp Chuông (`x: 760, y: 260`), tuần tra trong khoảng $X \in [745, 775]$.
   - Cơ chế dọn dẹp sạch sẽ `spawnNPCs()`: Xóa bỏ an toàn các thực thể cũ trước khi khởi tạo, đảm bảo không bao giờ xuất hiện bóng mờ hay NPC trùng lặp.
3. **Bảo toàn 100% hội thoại, tiến độ nhiệm vụ và tương thích Save/Load:**
   - Khóa hội thoại `garth_warning`, `edda_intro`, `edda_reminder`, `neris_intro`, `neris_heal`, `bram_chat`, `finn_chat` đều khớp nối hoàn hảo.
   - Tương thích hoàn toàn với hệ thống lưu trữ `SaveManager.ts`.
4. **Khắc phục lỗi trực quan phát hiện từ phiên Playtest thực tế:**
   - Khắc phục hiển thị khung debug màu xanh lá `[X]` (missing texture placeholder) tại cổng kết giới Miếu Chuông Vỡ (`shrineWardColliderBody.setVisible(false)`).

---

## 2. BẢNG THÔNG SỐ VÀ VỊ TRÍ RUNTIME CỦA 5 NPC TẠI LÀNG BELLHOLLOW

| NPC | Mã định danh (`id`) | Vai trò / Danh hiệu | Tọa độ chuẩn $(X, Y)$ | Tọa độ tuần tra | Khóa hoạt ảnh | Khóa hội thoại |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Garth** | `npc_garth` | Người Canh Cổng | `(520, 265)` | $X \in [505, 535]$ (tốc độ 15) | `garth_walk_sheet` (4 hướng) | `garth_warning` |
| **Bà Lão Edda** | `npc_edda` | Bà Lão Giữ Chuông | `(710, 380)` | Đứng yên tại sân Tháp Chuông | `edda_idle_sheet` (9 frames) | `edda_intro` |
| **Neris** | `npc_neris` | Người Chữa Thảo Mộc | `(970, 215)` | Đứng trước hiên nhà Thảo Dược | `neris_idle_sheet` (6 frames) | `neris_intro` |
| **Bram** | `npc_bram` | Thợ Thủ Công Làng | `(1025, 370)` | Đứng gần Bàn Chế Tạo | `potter_walk_sheet` | `bram_chat` |
| **Finn** | `npc_finn` | Cậu Bé Đưa Tin | `(760, 260)` | $X \in [745, 775]$ (tốc độ 25) | `errand_boy_walk_sheet` | `finn_chat` |

---

## 3. KIỂM ĐỊNH KHÔNG GIAN THÔNG THOÁNG & VA CHẠM (COLLISION AUDIT)

Tất cả 5 NPC và các lộ trình tuần tra đã được kiểm tra va chạm hình học (AABB) tự động với toàn bộ các khối va chạm (`colliders`) của làng Bellhollow:

```
Testing colliders for 5 NPCs:
- Garth (520, 265): CLEAN (NO COLLISION) — Nằm trọn vẹn trên đài đá tròn cổng Tây
- Bà Lão Edda (710, 380): CLEAN (NO COLLISION) — Nằm tại khoảng sân thoáng bên trái Tháp Chuông
- Neris (970, 215): CLEAN (NO COLLISION) — Nằm trên mặt đất trước cửa nhà Thảo Mộc
- Bram (1025, 370): CLEAN (NO COLLISION) — Nằm cách bàn chế tạo 35px, thuận tiện tiếp cận
- Finn (760, 260): CLEAN (NO COLLISION) — Nằm tại rìa quảng trường Tháp Chuông

Patrol Path Clearance:
- Garth Patrol (x: 505..535, y: 265): CLEAN (100% thông suốt, không chạm tường trạm gác)
- Finn Patrol (x: 745..775, y: 260): CLEAN (100% thông suốt trên mặt đường quảng trường)
```

---

## 4. GHI NHẬN & PHÂN TÍCH TỪ HÌNH ẢNH PLAYTEST THỰC TẾ CỦA NGƯỜI CHƠI

Qua 11 ảnh chụp màn hình playtest thực tế mà người chơi vừa cung cấp:
1. **Hiển thị Garth & Nhân vật chính (Ảnh 1, Ảnh 10, Ảnh 11):**
   - Garth đứng trên bệ đá tròn tại cổng Tây, bảng tên `[Garth - Người gác cổng]` hiển thị sắc nét với huy hiệu khiên đỏ, độ sâu tách biệt rõ ràng với mặt đường.
   - Nhân vật The Mossbound Wayfarer cầm đèn lồng hổ phách, hiệu ứng ánh sáng quầng đèn lồng hòa trộn mượt mà với địa hình và sương mù.
   - Biển báo `EAST`, hàng rào gỗ và lối mòn chuyển vùng hiển thị đồng nhất.
2. **Khu vực Rừng Sâu Deep Forest & Lối Mòn Quanh Co (Ảnh 3, Ảnh 4, Ảnh 5, Ảnh 6, Ảnh 7, Ảnh 8, Ảnh 9):**
   - Lộ trình xuyên rừng rậm được nướng trên canvas kết cấu lớn, các ngã ba rẽ hiển thị rõ ràng.
   - Điểm ẩn nấp bụi rậm (`[E] Ẩn nấp trong bụi rậm`) và thân cây rỗng hoạt động đúng với logic lẩn trốn Kẻ Lắng Nghe (The Listener).
   - Kẻ Lắng Nghe (The Listener) với áo choàng đen và lưỡi hái tuần tra mượt mà trên tuyến đường rừng.
3. **Sửa lỗi hiển thị Bounding Box xanh lá tại Cổng Kết Giới (Ảnh 2):**
   - Trong Ảnh 2, tại kết giới Miếu Chuông Vỡ (`shrineGateX: 3960, shrineGateY: 280`), có một ô vuông màu xanh lá cây debug `[X]` đè lên kết giới tím.
   - **Nguyên nhân:** Khối va chạm `shrineWardColliderBody` được tạo bằng `this.colliderGroup.create(x, y, undefined)` nhưng chưa gọi `setVisible(false)`. Trong Phaser 3 Arcade Physics, sprite không có texture mặc định sẽ vẽ một texture placeholder màu xanh có gạch chéo.
   - **Xử lý triệt để:** Bổ sung `this.shrineWardColliderBody.setVisible(false);` trong [`src/world/WorldBuilder.ts`](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L5404-L5407). Sau khi sửa, khung màu xanh đã biến mất hoàn toàn, chỉ còn lại kết giới ánh tím lung linh với 3 biểu tượng Cổ Ngữ (Trăng, Rễ, Mắt).

---

## 5. KẾT QUẢ BỘ KIỂM THỬ TỰ ĐỘNG (`scripts/verify_npc_runtime_c4_12_09.mjs`)

```
================================================================
QA / QC VERIFICATION SUITE — COMMAND C4-12-09
TÍCH HỢP 3 NPC CHÍNH + 2 NPC PHỤ VÀO RUNTIME BELLHOLLOW (V1.2)
================================================================

--- 1. KIỂM TRA ĐĂNG KÝ TÀI NGUYÊN PRELOADSCENE & CONSTANTS ---
  [PASS] #1: PreloadScene nạp SPRITE_GARTH_IDLE
  [PASS] #2: PreloadScene nạp SPRITE_GARTH_WALK
  [PASS] #3: PreloadScene nạp SPRITE_EDDA_IDLE
  [PASS] #4: PreloadScene nạp SPRITE_EDDA_WALK
  [PASS] #5: PreloadScene nạp SPRITE_NERIS_IDLE
  [PASS] #6: PreloadScene nạp SPRITE_NERIS_WALK
  [PASS] #7: PreloadScene nạp SPRITE_POTTER_WALK_SHEET (Bram)
  [PASS] #8: PreloadScene nạp SPRITE_ERRAND_BOY_WALK_SHEET (Finn)
  [PASS] #9: PreloadScene trỏ PORTRAIT_GARTH tới file mới
  [PASS] #10: PreloadScene trỏ PORTRAIT_EDDA tới file mới
  [PASS] #11: PreloadScene trỏ PORTRAIT_NERIS tới file mới
  [PASS] #12: PreloadScene trỏ PORTRAIT_BRAM tới file mới
  [PASS] #13: PreloadScene trỏ PORTRAIT_FINN tới file mới

--- 2. KIỂM TRA CẤU TRÚC THỰC THỂ NPCENTITY ---
  [PASS] #14: NPCEntity có phương thức registerAnimations
  [PASS] #15: Sprite NPC có origin chuẩn chân thực tế (0.5, 58/64)
  [PASS] #16: NPCEntity có createNamePlate hiển thị tên và danh hiệu
  [PASS] #17: NPCEntity có createPromptBubble hiển thị gợi ý [E] Trò chuyện
  [PASS] #18: NPCEntity có setNearby hỗ trợ xoay hướng theo người chơi
  [PASS] #19: NPCEntity có playDirectionalAnim phát đúng 4 hướng
  [PASS] #20: Nhãn tên đặt tại y = y - 58 ở scene level
  [PASS] #21: Bong bóng [E] đặt tại y = y - 80 ở scene level
  [PASS] #22: Nhãn tên có depth 5000 (hiển thị nổi trên mái nhà/tháp)
  [PASS] #23: Bong bóng [E] có depth 5001 (hiển thị nổi trên nhãn tên)

--- 3. KIỂM TRA VỊ TRÍ, KHÔNG GIAN ĐI LẠI VÀ CHỐNG TRÙNG LẶP ---
  [PASS] #24: spawnNPCs() dọn dẹp các NPC cũ trước khi khởi tạo (chống trùng lặp)
  [PASS] #25: zones.json bellhollow định nghĩa đủ 5 NPC
  [PASS] #26: Garth (520, 265) nằm trong ranh giới đi lại hợp lệ của làng Bellhollow
  [PASS] #27: Garth (520, 265) không bị đè lên bất kỳ collider/vật thể cứng nào trong làng
  [PASS] #28: Bà Lão Edda (710, 380) nằm trong ranh giới đi lại hợp lệ của làng Bellhollow
  [PASS] #29: Bà Lão Edda (710, 380) không bị đè lên bất kỳ collider/vật thể cứng nào trong làng
  [PASS] #30: Neris (970, 215) nằm trong ranh giới đi lại hợp lệ của làng Bellhollow
  [PASS] #31: Neris (970, 215) không bị đè lên bất kỳ collider/vật thể cứng nào trong làng
  [PASS] #32: Bram (1025, 370) nằm trong ranh giới đi lại hợp lệ của làng Bellhollow
  [PASS] #33: Bram (1025, 370) không bị đè lên bất kỳ collider/vật thể cứng nào trong làng
  [PASS] #34: Finn (760, 260) nằm trong ranh giới đi lại hợp lệ của làng Bellhollow
  [PASS] #35: Finn (760, 260) không bị đè lên bất kỳ collider/vật thể cứng nào trong làng
  [PASS] #36: Lộ trình tuần tra của Garth (x: 505..535, y: 265) thông suốt 100%
  [PASS] #37: Lộ trình tuần tra của Finn (x: 745..775, y: 260) thông suốt 100%

--- 4. KIỂM TRA BẢO TOÀN HỘI THOẠI & NHIỆM VỤ (DIALOGUES.JSON) ---
  [PASS] #38: Hội thoại garth_warning tồn tại
  [PASS] #39: garth_warning đúng người nói Garth
  [PASS] #40: garth_warning kích hoạt Q01_MEET_EDDA
  [PASS] #41: Hội thoại edda_intro tồn tại
  [PASS] #42: edda_intro đúng người nói Edda
  [PASS] #43: edda_intro kích hoạt Q02_MEET_NERIS
  [PASS] #44: Hội thoại nhắc nhở edda_reminder tồn tại
  [PASS] #45: Hội thoại neris_intro tồn tại
  [PASS] #46: neris_intro đúng người nói Neris
  [PASS] #47: neris_intro kích hoạt Q03_PREPARE_RESOURCES
  [PASS] #48: neris_intro thưởng Thuốc đắp thảo mộc
  [PASS] #49: Hội thoại hồi máu neris_heal tồn tại
  [PASS] #50: Hội thoại bram_chat tồn tại cho thợ thủ công Bram
  [PASS] #51: Hội thoại finn_chat tồn tại cho cậu bé đưa tin Finn

--- 5. KIỂM TRA PHẠM VI TƯƠNG TÁC [E] VÀ KHÓA MODAL ---
  [PASS] #52: Phạm vi kích hoạt tương tác NPC được giới hạn chính xác (dist <= 42 px)
  [PASS] #53: GameScene truyền tọa độ người chơi (px, py) để NPC xoay mặt
  [PASS] #54: Bong bóng tương tác và nhãn NPC tự động ẩn khi mở bất kỳ giao diện nào

--- 6. KIỂM TRA AN TOÀN SAVE / LOAD ---
  [PASS] #55: GameScene gọi spawnNPCs() trong create() để khởi tạo NPC chuẩn xác
  [PASS] #56: SaveManager hỗ trợ đầy đủ luồng save/load cờ trạng thái nhiệm vụ

================================================================
KẾT QUẢ KIỂM TRA RUNTIME C4-12-09: 56/56 TIÊU CHÍ ĐẠT (100%)
STATUS: ALL NPC RUNTIME CHECKS PASSED (100% HOÀN TẤT C4-12-09)
================================================================
```

---

## 6. KẾT LUẬN & TRẠNG THÁI BÀN GIAO

- **Tiêu chuẩn hoàn thành:** **ĐẠT XUẤT SẮC (56/56 checks PASS, TypeScript 0 lỗi)**.
- Toàn bộ 5 NPC tại làng Bellhollow đã vận hành sống động, có hoạt ảnh cử động và tuần tra êm dịu, không gian tiếp cận hoàn toàn thông thoáng, nhãn tên sắc nét không bị che khuất và hệ thống nhiệm vụ được bảo toàn trọn vẹn.
- Lỗi hiển thị bounding box xanh tại kết giới Miếu Chuông Vỡ đã được triệt tiêu hoàn toàn.
