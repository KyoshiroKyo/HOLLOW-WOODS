# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-25
## XÂY DỰNG ĐIỂM MỐC QUAN TRỌNG CỦA VÙNG FORBIDDEN: MIẾU CHUÔNG VỠ — BROKEN BELL SHRINE

- **Mã hiệu:** `COMMAND C4-12-25`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Phân khu Miếu Chuông Phế Tích (`broken_bell_shrine`, Layer 3 — Forbidden, $x = 4000..4960, y = 0..600$).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 3 — Forbidden Regions).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 65/65 TESTS C4-12-25, 10/10 TEST SUITES HỒI QUY ĐẠT 100%, 0 COMPILER ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-25

Theo kiến trúc phân tầng thế giới V1.2, **The Broken Bell Shrine (Miếu Chuông Phế Tích)** là điểm mốc then chốt và cao trào cốt truyện của **Tầng 3 — Forbidden Regions (Vùng Cấm Khóa Theo Cốt Truyện)**, tọa lạc tại cực Đông của bản đồ thế giới ($x = 4000..4960, y = 0..600$). Đây là thánh địa đổ nát mang đậm dấu ấn lịch sử, nơi từng lưu giữ quả chuông đồng trấn yểm màn sương bảo vệ làng Bellhollow trước khi bị thời gian và thảm kịch cổ xưa phá hủy.

Sau khi giải mã thành công câu đố Ba Cột Đá Cổ Ngữ tại Đầm Lầy Tĩnh Lặng (*Command C4-12-24*), phong ấn kết giới cổng miếu được gỡ bỏ, cho phép người chơi tiến vào khu vực này để thực hiện nhiệm vụ trọng đại **HỒI 5: MIẾU CHUÔNG PHẾ TÍCH (`Q06_RETRIEVE_CLAPPER`)**:
1. **Thu hồi Lưỡi Chuông Đồng Cổ (`quest_bronze_clapper`):** Báu vật nguyên sơ ngự trên bệ đá cổ trước miếu thờ, phát ra quầng sáng vàng óng ánh ấm áp.
2. **Kích hoạt cuộc đào thoát sinh tử (Act 5 Escape Chase):** Khoảnh khắc người chơi nhấc Lưỡi Chuông Đồng lên, tiếng chuông cổ ngân vang rúng động bầu trời, đánh động thực thể *The Listener (Kẻ Lắng Nghe)* lao tới truy đuổi điên cuồng. Người chơi phải vận dụng kỹ năng né tránh, ẩn nấp và tháo chạy ngược qua Đầm Lầy, Đường Mòn Quanh Co về tới Cổng Đông làng Bellhollow an toàn.

Command **C4-12-25** đã hoàn thành trọn vẹn việc thiết kế cảnh quan môi trường, kiến trúc phế tích và tích hợp hệ thống cho phân khu này:
- **Kiến trúc miếu cổ uy nghiêm:** Tận dụng bộ tài nguyên đồ họa pixel art chuẩn xác `broken_shrine.png` ($96 \times 80\text{ px}$), `stone_altar.png` ($60 \times 42\text{ px}$), gạch đá lát sàn `tile_stone_floor.png`, đường đá cuội `tile_cobble_road.png` và các cột đá phế tích phong hóa rêu phong.
- **Kể chuyện qua môi trường (Environmental Storytelling):**
  - Quả Chuông Cổ Khổng Lồ vỡ rạn nứt (`inspect_cracked_bell`) nằm nghiêng trên đỉnh miếu thờ, lưu lại dấu vết tàn phá của búa tạ cổ đại.
  - Bia Đá Cổ Miếu Chuông (`read_shrine_stele`) tại $(4280, 270)$, giải thích nguồn gốc lời nguyền Màn Sương và mở khóa tri thức `lore_clapper_curse`.
  - Bệ thờ đổ nát ẩn nấp (`shrine_hiding_spot`) tại $(4360, 380)$, hốc cây cổ miếu $(4140, 190)$ và bụi rậm hỗ trợ cơ chế ẩn náu âm thầm trước thính giác của quái vật.
- **Đảm bảo lối thoát hiểm thông suốt (Fluid Escape Routes):** Thiết kế mạng lưới đường đi đa nhánh (trục chính trung tâm, nhánh thềm đá phía Bắc và hành lang né tránh phía Nam) giúp người chơi không bị dồn vào chân tường khi quái vật xuất hiện.
- **Khí quyển ánh sáng, âm thanh & sương mù có chọn lọc:** Sương mù tím xám lạnh trôi dạt nhẹ nhàng (`#403d52`), quầng sáng đồng vàng mời gọi của Lưỡi Chuông, tiếng ngân vang chuông đồng cổ uy lực (`playBronzeBellToll`) và nhịp tim dồn dập (`setHeartbeatActive`) khi kích hoạt truy đuổi.

---

## 2. CHI TIẾT CÁC HẠNG MỤC THI CÔNG & KIẾN TRÚC HỆ THỐNG

### 2.1. Quản lý Tài nguyên Đồ họa (Architecture Sprite Integrity)
Đã kiểm toán và xác nhận toàn bộ sprite kiến trúc miếu phế tích đều tồn tại hợp lệ và đạt tỷ lệ hiển thị chuẩn:
- `broken_shrine.png`: $96 \times 80\text{ px}$ — Kiến trúc miếu thờ cổ mái gỗ mục và vách đá rêu phong.
- `stone_altar.png`: $60 \times 42\text{ px}$ — Bệ thờ đá nguyên khối nâng đỡ Lưỡi Chuông Đồng.
- `tile_stone_floor.png`: $16 \times 16\text{ px}$ — Gạch đá phiến lát sân nghi thức.
- `tile_cobble_road.png`: $16 \times 16\text{ px}$ — Đường đá cuội cổ kính kết nối với Đầm Lầy.
- `pillar_root.png`: $31 \times 61\text{ px}$ — Cột đá chạm khắc rễ rừng phong hóa.

### 2.2. Cấu hình Sổ Đăng Ký Phân Khu (`src/data/zones.json`)
- **Kích hoạt trạng thái phân khu:** Cập nhật `broken_bell_shrine` sang `"status": "active"`, bounds $\{ x: 4000, y: 0, width: 960, height: 600 \}$, spawn mặc định $(4080, 280)$.
- **Thiết lập hệ thống vách ngăn biên giới (Boundary Colliders):**
  - `shrine_bound_top` $(4000, 0, 960, 30)$ và `shrine_bound_bottom` $(4000, 570, 960, 30)$.
  - `shrine_bound_right` $(4930, 0, 30, 600)$ chặn bờ vực Đông.
  - `shrine_bound_left_top` $(3980, 0, 30, 220)$ và `shrine_bound_left_bottom` $(3980, 360, 30, 240)$ bao bọc ranh giới phía Tây, chừa chuẩn xác cổng thông hành $y = 220..360$ sang Đầm Lầy Tĩnh Lặng.
- **Đăng ký các điểm tương tác cốt truyện (Interactables):**
  1. `bell_tongue_item` $(4548, 280)$: Lưỡi Chuông Đồng Cổ, hành động `collect_bell_tongue`.
  2. `shrine_hiding_spot` $(4360, 380)$: Bệ Thờ Đổ Sụp (chỗ trốn an toàn), hành động `hide_player`.
  3. `shrine_inscribed_stele` $(4280, 270)$: Bia Đá Cổ Miếu Chuông, hành động `read_shrine_stele`.
  4. `shrine_cracked_bell` $(4500, 215)$: Quả Chuông Cổ Khổng Lồ Vỡ, hành động `inspect_cracked_bell`.
- **Bổ sung 4 điểm thu thập tài nguyên hợp lý (Resource Nodes):**
  - `node_herb_shrine_1` $(4240, 220)$ — Thảo dược kẽ đá (`res_herbs`).
  - `node_flint_shrine_1` $(4720, 220)$ — Đá lửa cổ kính (`res_flint`).
  - `node_wood_shrine_1` $(4420, 360)$ — Gỗ xà gồ miếu mục (`res_dry_wood`).
  - `node_resin_shrine_1` $(4720, 320)$ — Nhựa cây cổ miếu (`res_tree_resin`).
  *(Tất cả 4 điểm tài nguyên đều nằm trên nền đá thông thoáng, **0 va chạm chồng lấp** với vật cản).*

### 2.3. Nướng Bề Mặt Địa Hình Sân Đá Miếu (`broken_bell_shrine_ground_baked_v12`)
Toàn bộ bề mặt $960 \times 600\text{ px}$ được nướng tự động vào `CanvasTexture` độc lập tại `depth = -98`:
1. **Nền rừng xám lạnh rêu phong:** Nền tối `#22232b` phủ lớp cỏ mờ `TILE_FOREST_GRASS` ($0.20$ alpha) cùng quầng sáng quang phổ uy nghiêm tỏa tròn từ tâm miếu thờ $(4500, 250)$ ra bán kính $420\text{ px}$.
2. **Sân đá đại lễ miếu chuông (Grand Ceremonial Courtyard):**
   - Bán kính elip $240 \times 130\text{ px}$ tại tâm $(4500, 260)$.
   - Viền rêu ẩm `#2b3137` bao quanh nền đá slate xám xanh `#3c434b`.
   - Lát gạch đá phiến cổ `TILE_STONE_FLOOR` với độ trong suốt $0.45$.
   - Bậc đá tam cấp giật cấp tôn cao bệ thờ trung tâm và chân các cột đá.
3. **Lối tiếp cận nối liền mạch từ Silent Mire:**
   - Tuyến đường đá cuội uốn lượn tự nhiên từ ranh giới $(4000, 280)$ vào thẳng trung tâm sân miếu $(4280, 262)$ với độ rộng an toàn $40..48\text{ px}$, không đứt đoạn hay lệch tọa độ.

### 2.4. Kiến Trúc & Đạo Cụ Chi Tiết (`WorldBuilder.ts`)
1. **Miếu Thờ & Bệ Đá Đặt Chuông (`createShrineAltar`):**
   - Đặt tại $(4500, 250)$ với kích thước $96 \times 64\text{ px}$.
   - Bóng kiến trúc miếu phế tích đổ dài tự nhiên.
   - Bệ thờ đá nguyên khối phía trước $(4548, 275)$ đặt báu vật Lưỡi Chuông Đồng.
   - Quầng sáng đồng vàng óng ả nhấp nháy đa tầng (`0xd4ac0d`, `0xf39c12`, `0xfff3a8`) mời gọi người chơi khi Lưỡi Chuông chưa được thu hồi.
2. **Quả Chuông Cổ Vỡ Rạn Nứt (`createCrackedBellRuins`):**
   - Dựng tại đỉnh miếu thờ $(4500, 205)$ với thân chuông đồng đen sứt mẻ và các vết nứt sâu tối màu.
3. **Bộ Tứ Cột Đá Phế Tích Phong Hóa (`createShrinePillar`):**
   - 4 cột đá cổ đặt tại 4 góc sân: Tây Bắc $(4350, 180)$, Đông Bắc $(4650, 180)$, Đông Nam $(4680, 380)$, Tây Nam $(4320, 380)$.
4. **Hệ Thống Điểm Nấp Chiến Thuật:**
   - Khối đá đổ nát `createHidingRubble` tại $(4360, 380)$.
   - Hốc cây đại thụ cổ miếu `createHollowTree` tại $(4140, 190)$.
   - Hai cụm bụi rậm rậm rạp tại $(4180, 360)$ và $(4700, 340)$.
5. **Đạo Cụ Kể Chuyện & Hệ Thống Đèn Dẫn Hướng:**
   - Bia Đá Cổ Miếu Chuông `createShrineInscribedStele` tại $(4280, 270)$.
   - 3 Cột Đèn Lồng Gỗ dẫn hướng: Cửa ngõ phía Tây $(4060, 270)$, Thềm đá Bắc $(4380, 230)$, Thềm đá Nam $(4620, 290)$.
6. **Lớp Sương Mù Khí Quyển Miếu (`createBrokenBellShrineAtmosphericFog`):**
   - 4 quầng sương mù tím xám lạnh trôi dạt nhấp nhô nhẹ nhàng tại các góc sân ngoài, không che khuất tầm nhìn người chơi trên sân miếu chính.

### 2.5. Xử Lý Sự Kiện Gameplay & Cuộc Đào Thoát Act 5 (`GameScene.ts`)
- **Tương tác Bia Cổ & Chuông Vỡ:**
  - `read_shrine_stele`: Mở khóa `lore_clapper_curse` và hiển thị lời răn của người xưa về âm vang Lưỡi Chuông Đồng.
  - `inspect_cracked_bell`: Hiển thị mô tả trực quan về quả chuông cổ bị thời gian tàn phá.
- **Thu hồi Lưỡi Chuông Đồng (`collect_bell_tongue`):**
  - Kiểm tra cờ `clapper_collected` chống nhận trùng lặp.
  - Phát âm thanh chuông đồng ngân vang hùng tráng `audioManager.playBronzeBellToll()`.
  - Cộng vật phẩm `quest_bronze_clapper` vào túi đồ, bật cờ `clapper_collected` (tự động hoàn thành `Q06_RETRIEVE_CLAPPER:t1`).
  - Kích hoạt sự kiện truy đuổi nghẹt thở `startAct5EscapeChase()`:
    * Màn hình rung lắc dữ dội (`cameraSystem.shake(900, 0.02)`), chớp đỏ (`cameraSystem.flash`).
    * Bật âm thanh cảnh báo quái vật và tiếng tim đập hoảng loạn (`setHeartbeatActive(true, 420)`).
    * Thực thể *The Listener* lập tức xuất hiện truy đuổi từ vị trí phục kích $(4200, 260)$.
- **Hoàn thành cuộc đào thoát (`updateAct5ChaseLogic`):**
  - Khi người chơi chạy trốn thành công về làng Bellhollow ($x \le 1400$ hoặc `currentZoneId === 'bellhollow'`), quái vật bị chặn lại ở bìa rừng ngoài Cổng Đông làng.
  - Tắt nhịp tim hoảng loạn, hoàn thành nhiệm vụ `Q06_RETRIEVE_CLAPPER:t2`, tự động lưu game an toàn qua `SaveManager.saveGame()`.

---

## 3. KẾT QUẢ KIỂM TOÁN VÀ XÁC MINH KỸ THUẬT

### 3.1. Biên dịch TypeScript
- **Lệnh thực thi:** `npx tsc --noEmit`
- **Kết quả:** **0 lỗi biên dịch (Exit code 0)**.

### 3.2. Bộ Kiểm Tra Tự Động Toàn Diện C4-12-25 (`scripts/verify_broken_bell_shrine_c4_12_25.mjs`)
Bộ kiểm tra tự động đánh giá 65 tiêu chí nghiêm ngặt:
1. **Pre-Backup Integrity:** 8/8 mục kiểm tra đạt (Thư mục và 7 tệp backup tồn tại đầy đủ).
2. **Architecture Sprite Assets:** 10/10 mục kiểm tra đạt (Cả 5 tệp PNG tồn tại và kích thước pixel hoàn toàn chính xác).
3. **Zones Registry & Configuration:** 17/17 mục kiểm tra đạt (Bounds $[4000, 0, 960, 600]$, colliders 5 vách, interactables, transition).
4. **Zone Connections & Gating Rules:** 5/5 mục kiểm tra đạt (2 kết nối hai chiều, gating `mire_puzzle_solved`, luật mở khóa phân khu).
5. **Resource Nodes Walkway Clearance:** 9/9 mục kiểm tra đạt (Đầy đủ 4 điểm tài nguyên trong ranh giới, 0 va chạm chồng lấp).
6. **WorldBuilder Rendering & Architecture:** 9/9 mục kiểm tra đạt (Địa hình nướng, bệ thờ, chuông vỡ, cột đá, khối đá nấp, bia cổ, sương mù).
7. **GameScene Handlers & Act 5 Climax Logic:** 7/7 mục kiểm tra đạt (Tương tác bia, khảo sát chuông, thu hồi lưỡi chuông, chuông ngân, kích hoạt đào thoát, hoàn thành Act 5).
- **Tổng kết:** **65/65 PASSED (100% SUCCESS)**.

### 3.3. Kiểm Tra Hồi Quy Toàn Bộ Hệ Thống Đã Xây Dựng
Tất cả 10 bộ test kiểm tra hồi quy của các phân khu trước đó đều đạt 100%:
- `verify_broken_bell_shrine_c4_12_25.mjs`: **65/65 PASSED**
- `verify_rune_puzzle_c4_12_24.mjs`: **53/53 PASSED**
- `verify_silent_mire_c4_12_23.mjs`: **78/78 PASSED**
- `verify_deep_forest_c4_12_22.mjs`: **PASSED**
- `verify_crooked_path_c4_12_21.mjs`: **PASSED**
- `verify_outer_woods_c4_12_20.mjs`: **PASSED**
- `verify_sanctuary_farm_c4_12_19.mjs`: **PASSED**
- `verify_core_world_blockout_c4_12_17.mjs`: **PASSED**
- `verify_farming_c4_12_16.mjs`: **33/33 ĐẠT (100%)**
- `verify_audio_c4_12_15.mjs`: **42/42 ĐẠT (100%)**
- `verify_gameplay_quest_c4_12_14.mjs`: **40/40 ĐẠT (100%)**

---

## 4. TỔNG KẾT VÀ SẴN SÀNG CHO BƯỚC TIẾP THEO

Command **C4-12-25** đã hoàn thành xuất sắc toàn bộ yêu cầu đề ra. Miếu Chuông Phế Tích đã được tích hợp hoàn chỉnh thành một thánh địa phế tích uy nghiêm, đóng vai trò cao trào hồi hộp bậc nhất trong hành trình sinh tồn của Lữ Khách Rêu Phong tại HOLLOW WOODS V1.2.

Sẵn sàng chuyển sang các bước hoàn thiện tiếp theo:
- **Command kế tiếp:** `C4-12-26 — TÍCH HỢP TOÀN BỘ THẾ GIỚI MỞ V1.2 (WORLD MAP INTEGRATION & ZONE TRANSITIONS POLISH)`.
