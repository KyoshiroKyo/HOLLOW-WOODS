# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-23
## XÂY DỰNG PHÂN KHU FORBIDDEN: ĐẦM LẦY TĨNH LẶNG — SILENT MIRE

- **Mã hiệu:** `COMMAND C4-12-23`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Phân khu Đầm Lầy Tĩnh Lặng (`silent_mire`, Layer 3 — Forbidden, $x = 2880..4000, y = 100..740$).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 3 — Forbidden Regions).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 78/78 TESTS, 0 COMPILER ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-23

Theo kiến trúc phân tầng thế giới V1.2, **Silent Mire (Đầm Lầy Tĩnh Lặng)** là phân khu đầu tiên thuộc **Tầng 3 — Forbidden Regions (Vùng Cấm Khóa Theo Cốt Truyện)**, nằm ở phía Đông của Đường Mòn Quanh Co (*The Crooked Path*) và phía Đông Nam của Rừng Sâu (*Deep Forest*). Đây là vùng đất ngập nước sương độc ăn mòn tâm trí, nơi lưu giữ trận địa phong ấn cổ xưa với **3 Cột Đá Cổ Ngữ (Mặt Trăng, Rễ Cây, Con Mắt)** trước ngưỡng cửa của Miếu Chuông Phế Tích (*The Broken Bell Shrine*).

Command **C4-12-23** thực hiện xây dựng hoàn chỉnh phân khu này với các tiêu chí thiết kế đặc thù:

1. **Địa hình đầm lầy đặc trưng với độ tương phản trực quan rõ rệt:**
   - Thể hiện mặt bùn lầy sẫm màu (`#1c2822`), các vũng nước nông, bèo tây, rêu nước và các vũng nước sâu/hố sụt nguy hiểm.
   - Làm nổi bật sự khác biệt trực quan hoàn toàn giữa bề mặt đi lại được (gờ đất nổi nén chặt, cầu ván gỗ mục, bệ đá lát cổ) và vùng nước sâu/vật cản không đi qua được (trang bị colliders vật lý chống rơi xuống nước hoặc đi xuyên qua chướng ngại vật).
2. **Điểm mốc định hướng (Landmarks) & Hệ thống chiếu sáng dẫn đường:**
   - *Trận Địa Cổ Ngữ (Ancient Rune Dais):* Gò đất nổi linh thiêng hình elip $(3520, 290)$ nơi đặt 3 Cột Đá Cổ Ngữ (*Pillar Moon*, *Pillar Root*, *Pillar Eye*).
   - *Cầu Ván Gỗ Mục (Wooden Boardwalk Pier):* Cầu gỗ cắm cọc qua vũng nước đen thẳm $(3150, 320)$.
   - *Khối Cự Thạch Chìm Phế Tích (Sunken Monolith Ruins):* Hai khối đá lập phương khắc hoa văn cổ chìm một phần dưới bùn lầy tại $(3220, 200)$ và $(3720, 390)$.
   - *Gốc Cổ Thụ Liễu Héo Tàn (The Dead Titan Willow):* Cây liễu khổng lồ khẳng khiu trơ trụi cành tại $(3560, 160)$.
   - *Kết Giới Cổng Miếu Phế Tích (Shrine Gate Ward):* Hai trụ đá phong hóa và màn chắn ma pháp tím lập lòe tại $(3960, 280)$.
   - *4 Cột Đèn Lồng Dẫn Hướng Gỗ:* Đặt tại các vị trí mấu chốt: Cửa ngõ phía Tây $(2940, 290)$, Đầu cầu gỗ $(3120, 310)$, Tâm bệ đá $(3520, 260)$, Cửa ngõ Miếu Chuông $(3920, 290)$.
3. **Quy tắc mở khóa phân khu nghiêm ngặt (Quest Gating):**
   - Phân khu được bảo vệ bởi luật `WorldGatingSystem` và `ZoneConnectionRegistry`: chỉ cho phép tiến vào khi người chơi đã hoàn thành bước `Q04_ANCIENT_RUNES:t1` (hoặc đã mở cờ `entered_silent_mire`).
   - Nếu chưa đủ điều kiện, hệ thống ngăn chặn người chơi vượt ranh giới với thông báo Tiếng Việt rõ ràng và dịch chuyển an toàn về điểm `returnPoint`.
4. **Cơ chế Câu Đố 3 Cột Đá & Đồng bộ Cờ trạng thái:**
   - Kích hoạt chuẩn xác chuỗi 3 Cột Đá Cổ Ngữ (*Trăng Khuyết $\rightarrow$ Rễ Rừng $\rightarrow$ Con Mắt*).
   - Âm thanh cộng hưởng riêng biệt cho từng cột đá qua `AudioManager.playRunestoneResonance()`.
   - Nếu chạm sai thứ tự: đặt lại chuỗi, rung lắc màn hình và phát tín hiệu đánh động thực thể *The Listener* lao tới kiểm tra.
   - Khi giải thành công: chớp sáng màn hình, hoàn thành chuỗi nhiệm vụ `Q05_SOLVE_MIRE`, mở khóa nhiệm vụ `Q06_RETRIEVE_CLAPPER`, đồng bộ cờ `mire_pillars_solved` và `mire_puzzle_solved`, đồng thời kích hoạt tự động lưu game an toàn qua `SaveManager`.
5. **Nơi ẩn nấp sinh tồn (Stealth Spots) & Tài nguyên đầm lầy:**
   - 1 Hốc cây liễu mục (`sm_hiding_tree_1` tại $3080, 260$) và 2 cụm lau sậy rậm rạp (`sm_hide_bush_1` tại $3320, 340$, `sm_hide_bush_2` tại $3760, 320$).
   - 5 điểm thu thập tài nguyên (`node_herb_4`, `node_wood_sm_1`, `node_herb_5`, `node_resin_3`, `node_flint_sm_1`) được bố trí trên đất khô an toàn với **0 va chạm chồng lấp**.
6. **Màn sương mù khí quyển đặc trưng (Atmospheric Fog):**
   - Lớp sương mù tím/lục ma mị trôi dạt nhẹ nhàng bao bọc các vùng ngập nước viền đầm lầy, trong khi các lối đi chính và bệ đá vẫn giữ được tầm nhìn thông thoáng.

---

## 2. CHI TIẾT CÁC HẠNG MỤC THI CÔNG & TÍCH HỢP HỆ THỐNG

### 2.1. Cấu hình Sổ Đăng Ký Phân Khu (`ZoneConnectionRegistry.ts` & `zones.json`)
- **Kích hoạt trạng thái phân khu Silent Mire:**
  - Chuyển `silent_mire` sang `"status": "active"`, tọa độ bounds: $\{ x: 2880, y: 100, width: 1120, height: 640 \}$, spawn mặc định: $(2960, 320)$.
- **Cấu hình liên kết vùng 2 chiều & kết nối liên tầng:**
  1. `conn_crooked_path_to_silent_mire`: Rào cản `dense_thorns`, điều kiện `Q04_ANCIENT_RUNES:t1`, trigger $(2860, 240, 20, 160)$, target $(2940, 320)$, return $(2820, 280)$.
  2. `conn_silent_mire_to_crooked_path`: Rào cản `open`, trigger $(2880, 260, 20, 140)$, target $(2820, 280)$, return $(2940, 320)$.
  3. `conn_deep_forest_to_silent_mire`: Chuyển sang `active`, rào cản `dense_thorns`, điều kiện `Q04_ANCIENT_RUNES`, trigger $(2840, -320, 40, 120)$, target $(2920, 200)$, return $(2800, -260)$.
  4. `conn_silent_mire_to_deep_forest`: Mới bổ sung, rào cản `open`, trigger $(2880, 160, 20, 80)$, target $(2800, -260)$, return $(2920, 200)$.
  5. `conn_silent_mire_to_shrine`: Rào cản `rune_ward`, điều kiện `mire_puzzle_solved`, trigger $(3980, 240, 20, 160)$, target $(4050, 280)$, return $(3940, 320)$.
- **Bổ sung Colliders chống tràn và chướng ngại vật trong `zones.json`:**
  - 4 vách ngăn biên giới (`sm_bound_top`, `sm_bound_bottom`, `sm_bound_left_top`, `sm_bound_left_bottom`, `sm_bound_right_top`, `sm_bound_right_bottom`) chừa đúng các cổng di chuyển.
  - 4 vùng nước sâu nguy hiểm (`mire_water_pool`, `sm_water_west`, `sm_water_north`, `sm_water_south`).
  - 2 khối cự thạch chìm (`sm_monolith_1`, `sm_monolith_2`) và gốc liễu khổng lồ (`sm_dead_titan_willow_col`).
  - 3 bệ cột đá cổ ngữ (`pillar_1`, `pillar_2`, `pillar_3`).
- **Đăng ký 11 đối tượng tương tác mới trong `zones.json`:**
  - `sm_entry_sign` $(2940, 300)$: Biển gỗ chỉ dẫn đầm lầy.
  - `sm_boardwalk_pier` $(3150, 320)$: Cầu ván gỗ mục lối mòn phế tích.
  - `sm_sunken_ruins` $(3220, 200)$: Khối đá chìm cổ xưa.
  - `sm_dead_titan_willow` $(3560, 160)$: Gốc cổ thụ liễu héo tàn.
  - `sm_shrine_gate_ward` $(3960, 280)$: Kết giới cổng miếu phế tích.
  - `sm_hiding_tree_1` $(3080, 260)$: Hốc cây liễu mục ẩn nấp.
  - `sm_hide_bush_1` $(3320, 340)$: Cụm lau sậy dày đầm lầy.
  - `sm_hide_bush_2` $(3760, 320)$: Bụi cỏ lác rậm rạp phía Đông.
  - `rune_pillar_1` $(3400, 220)$: Cột Đá Ký Hiệu Mặt Trăng.
  - `rune_pillar_2` $(3520, 360)$: Cột Đá Ký Hiệu Rễ Cây.
  - `rune_pillar_3` $(3640, 220)$: Cột Đá Ký Hiệu Mắt Kẻ Săn.

### 2.2. Nướng Bề Mặt Địa Hình Đầm Lầy (`src/world/WorldBuilder.ts`)
Toàn bộ bề mặt Silent Mire ($1120 \times 640\text{ px}$, $x = 2880..4000, y = 100..740$) được nướng tự động vào `CanvasTexture` (`silent_mire_ground_baked_v12`) tại `depth = -98`:
1. **Nền bùn nước đen kịt:**
   - Lớp bùn nền `#1c2822` kết hợp `TILE_SWAMP_MUD` với độ trong suốt $0.28$.
   - Gradient tỏa tròn tâm $(3400, 300)$ sẫm màu dần ra biên viền (từ `rgba(26, 44, 34, 0.45)` đến `rgba(10, 18, 14, 0.90)`).
   - Hơn $1600$ vệt rêu nước, bèo tây và bùn lầy rải rác (`#15241b`, `#1f3427`, `#2a4435`, `#334f3e`, `#232b21`).
2. **Gờ đất nổi & Cầu ván gỗ mục (Boardwalks):**
   - Tuyến đường gờ bùn sẫm `#222d25`, lòng đất nâu rêu `#413a2c` và vệt đất nén `#564d3b`.
   - Các đoạn bắc qua vũng nước được vẽ các thanh ván gỗ mục xếp lớp (`#2c271f`, `#4a4133`, `#635845`).
   - Khớp nối chính xác $100\%$ với Đường Mòn Quanh Co tại $(2880, 300)$ và Miếu Chuông tại $(4000, 280)$.
3. **Gò Đất Trận Địa Cổ Ngữ (Ancient Rune Dais):**
   - Gò đất elip cổ kính tại tâm $(3520, 290)$ bán kính $(195 \times 115\text{ px})$.
   - Vòng đá lát cổ hình tròn bán kính $135\text{ px}$ kết nối ba Cột Đá Cổ Ngữ.
   - Bệ đá đa giác bậc thang riêng biệt quanh từng cột đá tại $(3400, 220)$, $(3520, 360)$ và $(3640, 220)$.

### 2.3. Đạo Cụ Kiến Trúc & Cảnh Quan Pixel Art (`renderSilentMireDecorations`)
Triển khai hệ thống phương thức tạo pixel art chuẩn mực:
- **`createBoardwalkPier(x, y)`:** Cầu ván gỗ mục với cọc gỗ cắm sâu dưới nước, rêu bám chân cọc tại ngấn nước, dầm ngang, ván sàn xơ xác và kẽ ghép thanh ván.
- **`createSunkenMonolithRuins(x, y, w, h)`:** Khối cự thạch lập phương cổ kính chìm nửa thân dưới bùn lầy, vết nứt khắc cổ ngữ xanh ngọc bích tỏa sáng dịu, viền rêu bám ngấn nước và trang bị collider vật lý vững chắc.
- **`createDeadTitanWillow(x, y)`:** Gốc cây liễu cổ thụ khổng lồ xoắn ốc vươn rễ vào bùn nước, thân có hốc rỗng, các cành liễu trơ trụi rủ xuống và các dải địa y xám đung đưa lơ lửng.
- **`createCattailsCluster(x, y)`:** Cụm lau sậy và cỏ lác với bèo tây nhỏ ven chân, thân mảnh mai, bông cỏ lác hình trụ màu nâu nhung và đầu nhọn vươn lên đón sương ẩm.
- **`createShrineGateWard(x, y)`:** Hai trụ đá phong hóa và màn chắn ma pháp tím dao động bằng tween mượt mà tại cửa ngõ Miếu Chuông.
- **`createSilentMireAtmosphericFog()`:** 8 cụm sương mù mượt mà (`SPRITE_FOG_SMOOTH`) với sắc thái tím đen (`0x161222`) và lục rêu (`0x101a14`), trôi dạt theo hàm Sine bao bọc viền Bắc/Nam mà không che lấp tầm nhìn đường mòn.
- **Quần thể cây liễu khô viền phân khu:** Hơn 40 cây khô khẳng khiu (`SPRITE_TREE_DEAD`, scale $1.5$) bao bọc viền tự nhiên, chừa lối thông thoáng tuyệt đối cho các cửa ngõ sang Crooked Path, Deep Forest và Broken Bell Shrine.

### 2.4. Đồng Bộ Cơ Chế Câu Đố & Cờ Trạng Thái (`PuzzleSystem.ts` & `GameScene.ts`)
- `PuzzleSystem.ts` kiểm tra chuỗi cột đá:
  ```typescript
  if (this.currentSequence.length === puzzleMeta.correctSequence.length) {
    this.isMirePuzzleSolved = true;
    this.playerState.setFlag('mire_pillars_solved');
    this.playerState.setFlag('mire_puzzle_solved'); // Đồng bộ tức thì với WorldGatingSystem
    return { solved: true, failed: false, msg: '...' };
  }
  ```
- `GameScene.ts`:
  - Kích hoạt âm thanh cộng hưởng theo cột qua `this.audioManager.playRunestoneResonance(noteIdx)`.
  - Khi hoàn thành câu đố: chớp màn hình xanh ngọc `this.cameraSystem.flash(400, 93, 173, 226)`, hoàn thành 3 task của `Q05_SOLVE_MIRE`, chuyển tiếp `Q06_RETRIEVE_CLAPPER` và gọi `SaveManager.saveGame()`.
  - Bổ sung 5 action handlers thông báo môi trường giàu tính văn học cho các điểm tương tác: `read_sm_entry_sign`, `inspect_sm_boardwalk_pier`, `inspect_sm_sunken_ruins`, `inspect_sm_dead_willow`, `inspect_sm_shrine_gate_ward`.

### 2.5. Phân Bổ Nút Tài Nguyên Mới (`InventorySystem.ts`)
Đăng ký 5 nút tài nguyên đặc thù của Silent Mire:
1. `node_herb_4` $(3050, 280)$: 2 Thảo mộc đầm lầy ven bờ đất Tây.
2. `node_wood_sm_1` $(3180, 310)$: 2 Gỗ khô trôi dạt mục nát trên mép cầu ván gỗ.
3. `node_herb_5` $(3350, 380)$: 2 Thảo mộc ven gò đá cổ.
4. `node_resin_3` $(3700, 180)$: 1 Nhựa cây liễu khô trên bờ đá phía Bắc.
5. `node_flint_sm_1` $(3780, 320)$: 1 Đá lửa ngập nước ven lối đi phía Đông.

Tất cả 5 vị trí đều nằm hoàn toàn trên nền đất đi lại được, cách xa mép nước sâu và có **0 điểm va chạm** với bất kỳ collider nào.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & REGRESSION GATE

### 3.1. Kiểm tra Biên Dịch TypeScript
- **Lệnh thực hiện:** `npx tsc --noEmit`
- **Kết quả:** `Command exited with code 0` — **0 lỗi biên dịch**.

### 3.2. Bộ Kiểm Thử Silent Mire Toàn Diện (`verify_silent_mire_c4_12_23.mjs`)
- **Lệnh thực hiện:** `node scripts/verify_silent_mire_c4_12_23.mjs`
- **Kết quả:** **78/78 TESTS PASSED (100% THÀNH CÔNG)**:
  - *Group 1 (Pre-Backup):* 7/7 tests passed.
  - *Group 2 (Registry & Gating):* 11/11 tests passed.
  - *Group 3 (zones.json Config):* 18/18 tests passed.
  - *Group 4 (WorldBuilder Terrain & Props):* 20/20 tests passed.
  - *Group 5 (Puzzle Synchronization):* 3/3 tests passed.
  - *Group 6 (GameScene Handlers):* 6/6 tests passed.
  - *Group 7 (Resource Nodes):* 5/5 tests passed.
  - *Group 8 (Walkway Clearance & 0 Overlaps):* 8/8 tests passed.

### 3.3. Bộ Kiểm Thử Hồi Quy (Regression Tests Suite)
Chạy toàn bộ các bộ test của các phân khu và tính năng trước đó để đảm bảo tính toàn vẹn hệ thống:
- `verify_deep_forest_c4_12_22.mjs`: **79/79 TESTS PASSED**.
- `verify_crooked_path_c4_12_21.mjs`: **66/66 TESTS PASSED**.
- `verify_outer_woods_c4_12_20.mjs`: **59/59 TESTS PASSED**.
- `verify_sanctuary_farm_c4_12_19.mjs`: **44/44 TESTS PASSED**.

---

## 4. TỔNG KẾT VÀ BÀN GIAO TIẾP THEO

Phân khu **Đầm Lầy Tĩnh Lặng (Silent Mire)** đã được xây dựng hoàn thiện xuất sắc, đáp ứng đầy đủ và vượt trội các tiêu chí kỹ thuật, thẩm mỹ Dark Woodland Pixel Art và chuẩn mực kiến trúc Hybrid Open World V1.2.

Hệ thống đã sẵn sàng cho bước triển khai tiếp theo:
- **COMMAND C4-12-24:** Tinh chỉnh chuyên sâu khu vực Trận Địa Câu Đố Cổ Ngữ (*Ancient Rune Puzzle Area*), bổ sung hiệu ứng hạt ma thuật, phản hồi xúc giác và chuỗi biến đổi cảnh quan khi rút nước đầm lầy.
- **COMMAND C4-12-25:** Xây dựng phân khu đích đến cuối cùng: Miếu Chuông Phế Tích (*The Broken Bell Shrine*).
