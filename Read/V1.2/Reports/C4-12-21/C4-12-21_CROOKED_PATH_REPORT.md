# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-21
## XÂY DỰNG PHÂN KHU FRONTIER: LỐI MÒN QUANH CO — THE CROOKED PATH NỐI TỪ OUTER WOODS VÀO RỪNG SÂU

- **Mã hiệu:** `COMMAND C4-12-21`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Phân khu Lối Mòn Quanh Co (`crooked_path`, Layer 2 — Frontier, $x = 1600..2880, y = 0..640$) & Tuyến nối hai chiều với Rừng Ngoài (`outer_woods`).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 2 — Frontier).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 76/76 TESTS, 0 ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-21

Theo kiến trúc thế giới mở Hybrid Open World (C4-12-10) và sổ đăng ký kết nối vùng (C4-12-11), **The Crooked Path (Lối Mòn Quanh Co)** là phân khu đầu tiên thuộc **Tầng 2 — Frontier (Vùng Tiền Tiêu)**. Đây là hành lang chuyển tiếp sinh tử giữa Vùng Lõi an toàn (Làng Bellhollow, Nông trại Sanctuary Farm, Rừng Ngoài Outer Woods) với các vùng cấm địa nguy hiểm (Rừng Sâu Deep Forest, Đầm Lầy Cổ Ngữ Silent Mire và Miếu Chuông Broken Bell Shrine).

Command **C4-12-21** thực hiện thiết kế, xây dựng và kết nối hoàn chỉnh phân khu này với các tiêu chí chất lượng cao:

1. **Địa hình uốn lượn tự nhiên (Organic Winding Pathway):** Loại bỏ hoàn toàn cảm giác hành lang thẳng đuột, thay thế bằng tuyến đường mòn quanh co với 5 khúc uốn lượn, các khoảng đất trống (clearings) và ngách phụ khám phá.
2. **Định hướng bằng cảnh quan thiên nhiên (Natural Framing Landmarks):** Dùng các mốc tự nhiên như *Hòn Đá Canh Gác (Sentinel Rock)*, *Cụm Rễ Cây Chằng Chịt (Tangled Roots)*, *Thân Cây Đổ (Fallen Logs)*, *Trụ Đá Đầm Lầy (Stone Obelisks)* và vòm cây cổ thụ để dẫn hướng trực quan thay cho tường vô hình cứng nhắc.
3. **Cơ chế ẩn nấp sinh tồn (Stealth Hiding Spots vs. The Listener):** Bố trí chiến lược 2 Cây sồi cổ thụ rỗng ruột (*Hollow Trees*) và 3 Bụi rậm rừng dày (*Stealth Bushes*) phân bổ đều trên toàn tuyến, sẵn sàng hỗ trợ cơ chế trốn chạy thực thể *The Listener* trong các hồi sau.
4. **Phân bổ 7 Điểm Thu Thập Tài Nguyên Rừng Ven:** Bố trí 7 điểm tài nguyên thuộc 4 nhóm cơ bản (*Gỗ Khô*, *Đá Lửa*, *Nhựa Cây*, *Thảo Dược Bạc*) tại các vị trí tiếp cận an toàn, không bị vật cản che khuất hay đè va chạm.
5. **Kết nối hai chiều không khóa với Rừng Ngoài (Outer Woods):** Thiết lập lối đi dã ngoại tự do giữa góc Tây Nam của The Crooked Path và ranh giới phía Đông của Outer Woods, tạo thành tuyến đường vòng tự nhiên cho người chơi khám phá thế giới mở mà không cần đi xuyên qua Cổng Đông làng Bellhollow.

---

## 2. CHI TIẾT CÁC HẠNG MỤC THI CÔNG & TÍCH HỢP HỆ THỐNG

### 2.1. Cấu hình Sổ Đăng Ký Phân Khu (`ZoneConnectionRegistry.ts` & `zones.json`)
- **Kích hoạt kết nối 2 chiều giữa Outer Woods và The Crooked Path:**
  - `conn_outer_woods_to_crooked_path`: Chuyển từ trạng thái `pending` sang `active`, rào cản `barrierType: 'open'`, vùng kích hoạt `triggerRect: { x: 1560, y: 720, width: 40, height: 120 }`, điểm xuất hiện `entryPoint: { x: 1640, y: 500, direction: 'right' }`, điểm quay về `returnPoint: { x: 1540, y: 780, direction: 'left' }`.
  - `conn_crooked_path_to_outer_woods`: Kích hoạt `active`, `barrierType: 'open'`, vùng kích hoạt `triggerRect: { x: 1600, y: 440, width: 30, height: 120 }`, điểm xuất hiện `entryPoint: { x: 1540, y: 780, direction: 'left' }`, điểm quay về `returnPoint: { x: 1640, y: 500, direction: 'right' }`.
  - Cập nhật danh sách lân cận (`neighbors`) của `outer_woods` và `crooked_path` với trạng thái `active`.
- **Bổ sung các đối tượng tương tác mới trong `zones.json`:**
  - `cp_frontier_sign` $(1660, 320)$: Biển chỉ dẫn tiền tiêu phía Tây.
  - `cp_ancient_sentinel_rock` $(2100, 280)$: Hòn Đá Canh Gác cổ xưa.
  - `cp_hunter_cache` $(2650, 260)$: Hòm đồ bỏ quên của thợ săn tiền trạm.
  - Các điểm ẩn nấp: `hide_tree_1` $(1900, 180)$, `hide_tree_2` $(2350, 420)$, `hide_bush_1` $(1820, 260)$, `hide_bush_2` $(2180, 200)$, `hide_bush_3` $(2500, 380)$.

### 2.2. Địa Hình Mặt Đất & Đường Mòn Uốn Lượn (`src/world/WorldBuilder.ts`)
Toàn bộ bề mặt The Crooked Path ($1280 \times 640\text{ px}$, $x = 1600..2880, y = 0..640$) được nướng vào một `CanvasTexture` (`crooked_path_ground_baked_v12`) tại `depth = -98`:
- **Nền thảm lá mục & rêu sẫm:** Màu xanh lục sẫm (`#18231a`) điểm xuyết các mảng rêu rừng ẩm (`#263b27`) và hàng ngàn đốm lá kim mục nát.
- **5 Phân đoạn & Khoảng rừng thưa (Clearings):**
  1. *Ngã ba Tiền Tiêu phía Tây (Frontier Junction):* Quanh $(1680, 320, r: 42)$, nơi hội tụ giữa đường từ Cổng Đông Bellhollow $(1600, 282)$ và đường mòn dã ngoại từ Outer Woods $(1610, 500, r: 22)$.
  2. *Khoảng Rừng Đá Canh Gác (Sentinel Clearing):* Quanh $(2100, 260, r: 46)$, nơi con đường mở rộng quanh khối đá sừng sững trước ngã rẽ Bắc.
  3. *Ngã Rẽ Rừng Sâu (Deep Forest Fork):* Quanh $(2080, 110, r: 34)$, lối rẽ hiểm trở chạy ngược lên phương Bắc dẫn sang Deep Forest $(2080, 45)$.
  4. *Khúc Ngoặt Rễ Cây Chằng Chịt (Tangled Hollow):* Quanh $(2400, 340, r: 40)$, đoạn đường uốn lượn xuống phía Nam bao quanh các búi rễ cây sồi ngàn năm.
  5. *Ngưỡng Cửa Đầm Lầy & Hòm Thợ Săn (Mire Threshold & Lost Cache):* Quanh $(2650, 270, r: 38)$ và $(2820, 300, r: 35)$, tiếp giáp lối vào Silent Mire $(2880, 300)$.
- **Tuyến đường mòn uốn lượn liên tục:** Không có góc cua $90^\circ$ thô cứng; các đốm đất nện sỏi nhỏ rải đều hai bên lề đường tạo cảm giác bước chân mòn theo năm tháng.

### 2.3. Đạo Cụ Rừng Cổ, Điểm Mốc & Kể Chuyện Không Gian
- **Hòn Đá Canh Gác (Great Sentinel Rock — `(2100, 280)`):** Khối đá hoa cương cổ đại dài $58\text{ px}$, cao $36\text{ px}$, bề mặt nứt nẻ phủ rêu nhung xanh ngọc và các rãnh khắc cổ xưa phát ánh lân tinh mờ nhạt.
- **Cụm Rễ Cây Chằng Chịt (Tangled Roots):** Búi rễ cây đại thụ trồi lên khỏi mặt đất tại $(1980, 210)$ và $(2420, 330)$, vừa là mốc thị giác dẫn đường vừa ngăn người chơi lạc vào bụi rậm gai góc.
- **Thân Cây Cổ Thụ Đổ (Fallen Logs with Fungi):** 3 thân cây sồi mục phủ rêu và nấm vàng tại $(1740, 350)$, $(2280, 380)$ và $(2580, 260)$.
- **Hòm Đồ Thợ Săn Thất Lạc (Hunter's Lost Cache — `(2650, 260)`):** Chiếc rương gỗ bọc sắt rỉ sét, nắp phủ dây leo ẩm mốc, bên cạnh là một cuộn dây thừng và mảnh bản đồ da thú đã ố vàng.
- **Trụ Đá Đầm Lầy (Twin Stone Obelisks):** Hai cột đá cổ nguyên khối dựng đứng tại $(2760, 240)$ và $(2760, 360)$, đánh dấu ranh giới trang nghiêm tiến vào Đầm Lầy Cổ Ngữ (Silent Mire).
- **Biển Báo Cảnh Giới Rừng:**
  - `cp_frontier_sign` $(1660, 320)$: *"LỐI MÒN QUANH CO — Cẩn trọng khi màn sương buông xuống."*
  - `cp_deep_forest_sign` $(2100, 45)$: *"NGUY HIỂM: RỪNG SÂU — Tiếng bước chân không rõ nguồn gốc."*
- **Tuyến 6 Cột Đèn Lồng Dẫn Lối (Trail Lantern Posts):** Cung cấp ánh sáng hổ phách ấm áp tại các khúc ngoặt hiểm trở: $(1680, 310)$, $(1860, 250)$, $(2030, 230)$, $(2170, 260)$, $(2330, 360)$ và $(2680, 310)$.
- **Sương Mù Khí Quyển Biên Giới (`createCrookedPathAtmosphericFog`):** Sử dụng các dải mây sương trôi dạt nhẹ nhàng ($7500..8800\text{ ms}$, alpha $0.16..0.26$) dọc ranh giới phía Bắc, phía Nam và phía Đông, mang lại bầu không khí u tịch và huyền bí của Frontier.

### 2.4. Phân Bổ 7 Điểm Thu Thập Tài Nguyên Rừng Ven (`src/systems/InventorySystem.ts`)
Hệ thống tài nguyên thế giới được cập nhật với 7 điểm thu thập phân bố khoa học, không đè lấn lên các hộp va chạm:

| Mã Node | Loại Tài Nguyên | Tọa độ Thế Giới $(x, y)$ | Số lượng | Vị trí Cảnh Quan & Ngữ Cảnh |
| :--- | :---: | :---: | :---: | :--- |
| `node_wood_cp_1` | Gỗ Khô (`res_dry_wood`) | $(1690, 430)$ | 1 | Cành cây sồi gãy ven lối rẽ sang Outer Woods |
| `node_resin_2` | Nhựa Cây (`res_tree_resin`) | $(1950, 190)$ | 1 | Thân cây sồi già phía Bắc gần Hollow Tree #1 |
| `node_flint_cp_1` | Đá Lửa (`res_flint`) | $(2140, 320)$ | 1 | Chân Hòn Đá Canh Gác (Great Sentinel Rock) |
| `node_wood_4` | Gỗ Khô (`res_dry_wood`) | $(2260, 370)$ | 1 | Khúc gỗ mục ven khúc cua Tangled Hollow |
| `node_flint_2` | Đá Lửa (`res_flint`) | $(2420, 340)$ | 1 | Bãi đá sỏi bên cạnh búi rễ cây chằng chịt #2 |
| `node_herb_3` | Thảo Dược Bạc (`res_herbs`) | $(2540, 270)$ | 2 | Khóm thảo dược hoang dã dưới tán rậm phía Đông |
| `node_herb_cp_2` | Thảo Dược Bạc (`res_herbs`) | $(2700, 340)$ | 1 | Bãi rêu ẩm ven ngưỡng cửa Silent Mire |

### 2.5. Tương Tác Môi Trường & Xử Lý Sự Kiện (`src/scenes/GameScene.ts`)
Bổ sung các bộ xử lý tương tác bàn phím `[E]` cho 3 điểm quan sát môi trường đặc sắc:
1. `read_cp_frontier_sign`: Hiển thị cảnh báo người lữ khách về sự rình rập trong sương mù của vùng Frontier.
2. `inspect_cp_sentinel_rock`: Nhắc nhở người chơi về những dấu tích rune bí ẩn và khuyến cáo tắt đèn lồng khi nghe tiếng bước chân lạ.
3. `inspect_cp_hunter_cache`: Khắc họa câu chuyện thợ săn tiền trạm từng trú chân tại đây trước khi biến mất vào đầm lầy.

---

## 3. KẾT QUẢ KIỂM THỬ VÀ XÁC NHẬN CHẤT LƯỢNG

Hệ thống đã trải qua kiểm thử tự động toàn diện qua script chuyên biệt `scripts/verify_crooked_path_c4_12_21.mjs` và toàn bộ các bộ test hồi quy của V1.2:

### 3.1. Kết quả kiểm tra C4-12-21 (`verify_crooked_path_c4_12_21.mjs`)
- **Nhóm 1 — Toàn vẹn Bản Lưu Dự Phòng (Pre-Backup):** 6/6 PASS (`Backups/C4-12-21_PRE_BACKUP/` lưu trữ đầy đủ 5 file hệ thống then chốt).
- **Nhóm 2 — Sổ Đăng Ký Vùng & Căn Chỉnh Chuyển Vùng:** 8/8 PASS (`conn_outer_woods_to_crooked_path` và `conn_crooked_path_to_outer_woods` hoạt động 2 chiều, tọa độ spawn/return khớp tuyệt đối, `barrierType: open`).
- **Nhóm 3 — Địa Hình & Tuyến Đường Uốn Lượn:** 11/11 PASS (Đủ 5 khoảng rừng thưa, tuyến đường uốn lượn, nhánh nối Outer Woods bán kính 22px).
- **Nhóm 4 — Đạo Cụ, Điểm Mốc & Landmarks Rừng Cổ:** 14/14 PASS (Hòn Đá Canh Gác $58 \times 36$, 2 cụm rễ cây, 3 thân cây mục, 1 hòm thợ săn, 2 cột đá đầm lầy, 2 biển báo, 6 cột đèn lồng, sương mù khí quyển).
- **Nhóm 5 — Cơ Chế Ẩn Nấp Sinh Tồn (Stealth Spots):** 9/9 PASS (2 Hollow Trees $1900$ & $2350$, 3 Dense Bushes $1820$, $2180$, $2500$ giãn cách chuẩn $250..350\text{ px}$).
- **Nhóm 6 — 7 Điểm Thu Thập Tài Nguyên Rừng Ven:** 10/10 PASS (Đủ 4 nhóm tài nguyên `res_dry_wood`, `res_flint`, `res_tree_resin`, `res_herbs`).
- **Nhóm 7 — Tương Tác Môi Trường & Phản Hồi:** 11/11 PASS (Đầy đủ 3 interactables và logic sự kiện trong `GameScene.ts`).
- **Nhóm 8 — Luồng Di Chuyển & Va Chạm:** 7/7 PASS (Zero collider overlap trên toàn bộ 7 điểm tài nguyên; lối vào Outer Woods $120\text{ px}$ thông thoáng tuyệt đối, không có tường chắn chặn lối).
- **TỔNG KẾT:** **76 / 76 BÀI TEST ĐẠT (100% PASS)**.

### 3.2. Kiểm tra Hồi Quy (Regression Test Suites)
- `verify_outer_woods_c4_12_20.mjs`: **59 / 59 PASS (100%)**.
- `verify_sanctuary_farm_c4_12_19.mjs`: **44 / 44 PASS (100%)**.
- `verify_core_world_blockout_c4_12_17.mjs`: **49 / 49 PASS (100%)**.
- `verify_farming_c4_12_16.mjs`: **33 / 33 PASS (100%)**.
- **Biên dịch TypeScript:** `npx tsc --noEmit` đạt **0 ERRORS** (Sạch 100%).
- **Vite Dev Server:** Tiến trình nền phục vụ trơn tru trên `http://localhost:3000/`, FPS duy trì ổn định $60\text{ FPS}$, không có cảnh báo rò rỉ bộ nhớ hay sự cố giật khung hình.

---

## 4. TỔNG KẾT CÁC TỆP TIN THAY ĐỔI TRONG COMMAND C4-12-21

1. [ZoneConnectionRegistry.ts](file:///g:/HOLLOW%20WOODS/src/world/ZoneConnectionRegistry.ts): Kích hoạt kết nối hai chiều giữa Outer Woods và The Crooked Path (`active`, `open`).
2. [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json): Khai báo cổng kết nối, 5 điểm ẩn nấp (hốc cây, bụi rậm) và 3 đối tượng tương tác môi trường.
3. [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Triển khai `renderCrookedPathTerrain`, `renderCrookedPathDecorations`, các helpers tạo cột mốc đá, rễ cây, hòm thợ săn và sương mù khí quyển.
4. [InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts): Bổ sung 3 node tài nguyên mới, nâng tổng số lên 7 điểm thu thập tại The Crooked Path.
5. [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts): Tích hợp xử lý tương tác `read_cp_frontier_sign`, `inspect_cp_sentinel_rock`, `inspect_cp_hunter_cache`.
6. [SatyrPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts): Sửa lỗi gọi hàm hoạt ảnh idle trong `setFacing`.
7. [vite.config.ts](file:///g:/HOLLOW%20WOODS/vite.config.ts): Bổ sung `'**/Backups/**'` vào danh sách bỏ qua của file watcher để chống lỗi EBUSY khóa tệp.
8. [verify_crooked_path_c4_12_21.mjs](file:///g:/HOLLOW%20WOODS/scripts/verify_crooked_path_c4_12_21.mjs): Bộ kịch bản kiểm thử tự động 76 bài test xác nhận chất lượng phân khu.
9. [C4-12-21_PRE_BACKUP](file:///g:/HOLLOW%20WOODS/Backups/C4-12-21_PRE_BACKUP/): Thư mục sao lưu toàn vẹn 5 tệp tin cốt lõi trước khi chỉnh sửa.
