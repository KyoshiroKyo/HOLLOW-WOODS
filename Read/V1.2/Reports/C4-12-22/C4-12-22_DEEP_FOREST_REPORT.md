# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-22
## XÂY DỰNG PHÂN KHU FRONTIER: RỪNG SÂU — DEEP FOREST VÀ TÍCH HỢP THỰC THỂ THE LISTENER

- **Mã hiệu:** `COMMAND C4-12-22`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Phân khu Rừng Sâu (`deep_forest`, Layer 2 — Frontier, $x = 1600..2880, y = -640..0$) & Tích hợp thực thể Kẻ Lắng Nghe (*The Listener*).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 2 — Frontier).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 79/79 TESTS, 0 ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-22

Theo thiết kế thế giới mở V1.2, **Deep Forest (Rừng Sâu)** là phân khu thứ hai của **Tầng 2 — Frontier (Vùng Tiền Tiêu)**, nằm ở phía Bắc của Đường Mòn Quanh Co (*The Crooked Path*). Đây là khu rừng nguyên sinh cổ xưa, rậm rạp, thâm u và tối tăm hơn hẳn Vùng Lõi (*Outer Woods*), đồng thời là lãnh địa săn mồi chính của thực thể thính giác đáng sợ **The Listener (Kẻ Lắng Nghe)**.

Command **C4-12-22** thực hiện xây dựng hoàn chỉnh phân khu này với các tiêu chí chất lượng cao:

1. **Không gian rừng thâm u, rậm rạp và phân tầng rõ rệt:** Thiết kế địa hình với độ sáng tối đặc trưng (`ambientLight: 0.22`, `fogAlpha: 0.82`), bóng cây dày đặc che khuất ánh trăng, tích hợp 5 khoảng rừng thưa và mạng lưới đường mòn đất nén uốn lượn tự nhiên.
2. **Điểm mốc định hướng (Landmarks) & Cột đèn lồng dẫn đường:** Sử dụng các mốc tự nhiên như *Cây Cổ Thụ Đổ Khổng Lồ (Colossal Fallen Titan Oak)*, *Khóm Nấm Rừng Phát Quang (Bioluminescent Fungus Glade)*, *Ổ Đá Kẻ Lắng Nghe (The Listener's Lair)* và *Trụ Đá Ranh Giới Đầm Lầy (Mire Obelisks)* để người chơi tự định hướng không bị lạc.
3. **Tích hợp thực thể The Listener với AI công bằng và rõ ràng:**
   - Cung cấp tín hiệu cảnh báo trực quan (*Telegraph Icon* [!], aura bóng đen, mắt đỏ) và âm thanh (*Sawtooth alert slider*, *Heartbeat* căng thẳng khi ở cự ly $<260\text{ px}$).
   - Cơ chế tấn công công bằng: mỗi đòn đánh gây $25\text{ HP}$ (người chơi có ít nhất 4 cơ hội sống sót), đẩy lùi $55\text{ px}$ và kích hoạt thời gian hồi chiêu tấn công $1.5\text{ giây}$ (`attackCooldown: 1500ms`) — tuyệt đối không trừ hết thanh sinh lực ngay lập tức.
4. **Tương tác sinh tồn với Đèn Lồng và Mồi Tạo Tiếng Động:**
   - Giữ đèn lồng sáng giúp bảo vệ chỉ số Bình Tâm (*Composure*) khỏi sự ăn mòn của bóng tối Rừng Sâu.
   - Đi bộ bình tĩnh không gây tiếng động lớn; chạy nhanh (*Sprint*) phát ra sóng âm thu hút The Listener.
   - Ném Mồi Tạo Tiếng Động (`item_noise_lure`, phím `[Q]`) phá vỡ trạng thái truy đuổi (*Chase*), lừa The Listener quay đầu chạy tới vị trí nổ mồi nhử.
5. **Cơ chế ẩn nấp sinh tồn hoàn hảo (Stealth Spots):**
   - Bố trí 3 Cổ thụ thân rỗng (*Hollow Trees*) và 3 Bụi rậm dày (*Dense Bushes*) phân bổ khoa học. Khi người chơi nấp vào thân cây, nhân vật ẩn hình, đèn lồng được che chắn và The Listener lập tức mất dấu (*Search* trong $4\text{s}$ rồi bỏ đi).
6. **Kết nối phân khu chuẩn xác:**
   - Lối thông 2 chiều không rào cản với Đường Mòn Quanh Co tại $x = 2000..2160, y = 0$.
   - Ranh giới chuyển tiếp sang Đầm Lầy Cổ Ngữ (*Silent Mire*) tại $x = 2840, y = -260$ với 2 cột đá cổ obelisk (sẵn sàng cho C4-12-23).

---

## 2. CHI TIẾT CÁC HẠNG MỤC THI CÔNG & TÍCH HỢP HỆ THỐNG

### 2.1. Cấu hình Sổ Đăng Ký Phân Khu (`ZoneConnectionRegistry.ts` & `zones.json`)
- **Kích hoạt trạng thái phân khu Deep Forest:**
  - Chuyển `deep_forest` sang `status: 'active'`, tọa độ bounds: $\{ x: 1600, y: -640, width: 1280, height: 640 \}$, spawn mặc định: $(2080, -80)$.
- **Kích hoạt kết nối 2 chiều giữa The Crooked Path và Deep Forest:**
  - `conn_crooked_path_to_deep_forest`: Chuyển sang `active`, rào cản `barrierType: 'open'`, trigger $(2000, 10, 160, 35)$, spawn $(2080, -80, \text{facing: 'up'})$, return $(2080, 60, \text{facing: 'down'})$.
  - `conn_deep_forest_to_crooked_path`: Chuyển sang `active`, rào cản `barrierType: 'open'`, trigger $(2000, -30, 160, 30)$, spawn $(2080, 60, \text{facing: 'down'})$, return $(2080, -80, \text{facing: 'up'})$.
- **Đăng ký kết nối ranh giới tiếp theo sang Silent Mire:**
  - `conn_deep_forest_to_silent_mire`: Đăng ký trạng thái `pending_construction`, rào cản `dense_thorns`, trigger $(2840, -320, 40, 120)$, spawn $(2920, 200)$, return $(2800, -260)$ chuẩn bị cho C4-12-23.
- **Bổ sung 10 đối tượng tương tác mới trong `zones.json`:**
  - `df_entry_sign` $(2040, -80)$: Biển chỉ dẫn tiền tiêu phía Nam.
  - `df_hiding_tree_1` $(1820, -240)$: Cổ thụ thân rỗng ven Khoảng Rừng Nấm Phát Quang.
  - `df_hiding_tree_2` $(2180, -300)$: Thân rỗng cây sồi đại thụ đổ trung tâm.
  - `df_hiding_tree_3` $(2450, -470)$: Cổ thụ thân rỗng vực thẳm phía Bắc.
  - `df_hide_bush_1` $(2020, -360)$, `df_hide_bush_2` $(2240, -520)$, `df_hide_bush_3` $(2600, -300)$: 3 cụm bụi rậm ẩn nấp sinh tồn.
  - `df_listener_nest` $(2340, -490)$: Ổ đá cào xé của Kẻ Lắng Nghe.
  - `df_bioluminescent_fungus` $(1760, -200)$: Khóm nấm rừng phát quang kỳ dị.
  - `df_mire_boundary_gate` $(2840, -260)$: Trụ đá cổ phong ấn ngưỡng cửa Đầm Lầy.

### 2.2. Địa Hình Mặt Đất & 5 Khoảng Rừng Thưa (`src/world/WorldBuilder.ts`)
Toàn bộ bề mặt Deep Forest ($1280 \times 640\text{ px}$, $x = 1600..2880, y = -640..0$) được nướng vào một `CanvasTexture` (`deep_forest_ground_baked_v12`) tại `depth = -98`:
- **Nền thảm lá mục & rêu rừng nguyên sinh:** Màu đất rừng sẫm `#101813`, rêu ẩm `#1a2b1f`, thảm cỏ râm mát pha alpha thấp, viền bóng tối tán cây dày đặc ở đỉnh Bắc và hai mép sườn.
- **5 Khoảng Rừng Thưa (Clearings):**
  1. *Bãi Cửa Rừng Phía Nam:* Quanh $(2080, -60, r: 48)$, nối liền mạch với ngã rẽ Bắc của Crooked Path $(2080, 0)$.
  2. *Khoảng Rừng Nấm Phát Quang Phía Tây (Bioluminescent Fungus Glade):* Quanh $(1780, -220, r: 60)$, nền rêu lam ngọc `#164336` và `#1f604e` phát ánh sáng mờ dịu.
  3. *Khoảng Rừng Cây Cổ Thụ Đổ Trung Tâm (Fallen Titan Oak Hollow):* Quanh $(2140, -320, r: 68)$, trung tâm rừng rậm với thân cây sồi ngàn năm đổ bắc qua suối cạn.
  4. *Khoảng Đá Ổ Kẻ Lắng Nghe Phía Bắc (The Listener's Lair):* Quanh $(2380, -480, r: 56)$, nền đất xám tro tăm tối và lạnh lẽo.
  5. *Bãi Ngưỡng Cửa Đầm Lầy Phía Đông (Eastern Overlook):* Quanh $(2720, -280, r: 52)$, tiếp giáp các cột đá phong rêu dẫn sang Silent Mire.
- **Mạng lưới đường mòn đất nén hữu cơ:** Tuyến đường uốn lượn mềm mại từ cửa Nam lên trung tâm, tỏa ra 3 nhánh rẽ (Tây — Bãi Nấm, Bắc — Ổ Quái Vật, Đông — Ngưỡng Cửa Đầm Lầy).

### 2.3. Đạo Cụ Rừng Cổ, Điểm Mốc & Hệ Thống Đèn Lồng
- **Thân Cây Cổ Thụ Đổ Khổng Lồ (Colossal Fallen Titan Oak — `(2120, -340)`):** Chiều dài $72\text{ px}$, thân sồi già phủ rêu nhung và nấm sò vàng cam, tạo nên mốc địa hình hùng vĩ ngay giữa lòng rừng sâu.
- **Thân Cây Mục & Búi Rễ Xoắn:** 3 thân cây mục $(1880, -200)$, $(2260, -280)$, $(2540, -360)$ và 3 búi rễ xoắn $(1960, -180)$, $(2320, -420)$, $(2680, -250)$ tạo thành rào chắn tự nhiên thay cho tường tàng hình.
- **Khóm Nấm Rừng Phát Quang (`createBioluminescentMushrooms`):** Các cụm nấm phát ra ánh sáng lam lục (`0x2ecc71`, `0x1abc9c`, `0x3498db`) với hiệu ứng tween thở êm ái ($1800\text{ ms}$).
- **Ổ Đá Kẻ Lắng Nghe (`createListenerNestClue`):** Khối đá granite với những vết cào rách sâu hoắm, rải rác xương thú và vết tích săn mồi.
- **Tuyến 4 Cột Đèn Lồng Dẫn Lối (Lantern Beacons):** Đặt tại Cửa Rừng $(2060, -90)$, Bãi Nấm $(1920, -210)$, Bãi Cây Đổ Trung Tâm $(2120, -290)$ và Đường Mòn Phía Đông $(2500, -320)$.
- **Sương Mù Khí Quyển Rừng Sâu (`createDeepForestAtmosphericFog`):** Dải sương mù u uất trôi lững lờ ($7200..8200\text{ ms}$) dọc vành đai phía Bắc, Tây và Đông.

### 2.4. Tích Hợp Toàn Diện Thực Thể The Listener & AI Cân Bằng Công Bằng
- **Nâng cấp `TheListener.ts` & `ListenerAI.ts`:**
  - `setWaypoints(waypoints)`: Cho phép cập nhật lộ trình tuần tra tự động khi người chơi di chuyển giữa các phân khu rừng (`deep_forest` $\leftrightarrow$ `crooked_path`).
  - `triggerAttackCooldown(1500)` & `canAttack()`: Sau mỗi đòn tấn công, quái vật phải trải qua thời gian hồi chiêu $1.5\text{ giây}$, ngăn chặn triệt để tình trạng quái vật gây sát thương liên tiếp nhiều lần trong tích tắc.
  - `onAlertTelegraph()`: Kích hoạt biểu tượng [!] và phát âm thanh cảnh báo slide tần số cưa nhọn (`playListenerAlert()`) ngay khi quái vật nghe thấy tiếng động.
  - `onChaseAlert()` & `onChaseEnded()`: Khi quái vật bắt đầu rượt đuổi, kích hoạt nhịp tim dồn dập (`setHeartbeatActive(true, 420)`). Khi người chơi nấp an toàn hoặc cắt đuôi thành công, nhịp tim lập tức dịu xuống (`setHeartbeatActive(false)`).
  - **Cơ chế Mồi Tạo Tiếng Động (`item_noise_lure`):** Nếu người chơi ném mồi nổ phát ra âm thanh lớn (`_volume >= 2.0`), The Listener lập tức bị phân tâm, ngắt bỏ cuộc rượt đuổi và quay đầu lao tới vị trí mồi nổ.
- **Cân bằng đòn đánh công bằng trong `GameScene.ts`:**
  - Sát thương mỗi đòn: $25\text{ HP}$ và $25\text{ Composure}$ (đảm bảo người chơi có 4 cơ hội sống).
  - Đẩy lùi: Đẩy nhân vật lùi xa $55\text{ px}$ ngược hướng quái vật để tạo khoảng cách phản xạ.
  - Kích hoạt trạng thái tổn thương bất tử tạm thời (`player.playHurt()`).
  - Âm thanh cảnh báo khoảng cách: Khi quái vật áp sát trong phạm vi $<260\text{ px}$, nhịp tim hồi hộp sẽ phát ra cảnh báo trước cho người chơi.

### 2.5. Phân Bổ 6 Điểm Khai Thác Tài Nguyên Rừng Sâu (`src/systems/InventorySystem.ts`)
Bổ sung 6 điểm thu hoạch tài nguyên phân bố khoa học, không bị va chạm đè lấn:

| Mã Node | Loại Tài Nguyên | Tọa độ $(x, y)$ | Số lượng | Vị trí Cảnh Quan & Ngữ Cảnh |
| :--- | :---: | :---: | :---: | :--- |
| `node_wood_df_1` | Gỗ Khô (`res_dry_wood`) | $(2030, -90)$ | 2 | Cành cây sồi gãy ven lối vào phía Nam |
| `node_herb_df_1` | Thảo Dược Bạc (`res_herbs`) | $(1780, -210)$ | 2 | Khóm thảo dược ven bãi nấm phát quang |
| `node_resin_df_1` | Nhựa Cây (`res_tree_resin`) | $(1860, -250)$ | 1 | Thân cây sồi đại thụ rỉ nhựa |
| `node_flint_df_1` | Đá Lửa (`res_flint`) | $(2140, -350)$ | 2 | Chân khối đá lớn ven cây cổ thụ đổ trung tâm |
| `node_wood_df_2` | Gỗ Khô (`res_dry_wood`) | $(2360, -360)$ | 2 | Khúc gỗ mục ven ngã rẽ lên ổ Kẻ Lắng Nghe |
| `node_herb_df_2` | Thảo Dược Bạc (`res_herbs`) | $(2720, -280)$ | 2 | Khóm thảo dược hoang dã ven ngưỡng cửa Silent Mire |

### 2.6. Tương Tác Môi Trường & Mở Rộng Giới Hạn Thế Giới (`src/scenes/GameScene.ts`)
- **Mở rộng giới hạn vật lý và Camera tự động:**
  - Khi người chơi bước vào `deep_forest`, giới hạn thế giới và camera được mở rộng tự động từ $y = -250$ lên $y = -700$ (tổng chiều cao $1850\text{ px}$), cho phép người chơi và camera di chuyển tự do lên tận đỉnh Bắc của Rừng Sâu.
  - Khi quay về Vùng Lõi, giới hạn tự động thu về khung chuẩn $(0, -250, 5000, 1400)$ bảo toàn kiểm thử các bước trước.
- **Tích hợp sương mù sâu (`inDeepFog`):**
  - Đưa `deep_forest` vào hệ thống sương mù sâu để kích hoạt tiếng thì thầm tâm lý The Veil và ảnh hưởng khí quyển rừng sâu.

---

## 3. KẾT QUẢ KIỂM THỬ VÀ XÁC NHẬN CHẤT LƯỢNG

Hệ thống đã vượt qua kiểm thử tự động toàn diện qua script `scripts/verify_deep_forest_c4_12_22.mjs` và các bộ test hồi quy của V1.2:

### 3.1. Kết quả kiểm tra C4-12-22 (`verify_deep_forest_c4_12_22.mjs`)
- **Nhóm 1 — Toàn vẹn Bản Lưu Dự Phòng (Pre-Backup):** 8/8 PASS (`Backups/C4-12-22_PRE_BACKUP/` lưu trữ đủ 8 tệp tin cốt lõi).
- **Nhóm 2 — Sổ Đăng Ký Vùng & Cổng Kết Nối:** 6/6 PASS (`deep_forest` kích hoạt `active`, kết nối 2 chiều với `crooked_path` thông suốt, kết nối `silent_mire` đăng ký chờ).
- **Nhóm 3 — Cấu Hình zones.json:** 18/18 PASS (Đầy đủ bounds, atmosphere, transitions mở, 10 interactables).
- **Nhóm 4 — WorldBuilder Địa Hình & Đạo Cụ:** 17/17 PASS (Bake canvas texture, 4 cột đèn lồng, cây đổ titan, 3 cây rỗng, 3 bụi trốn, nấm phát quang, sương mù khí quyển).
- **Nhóm 5 — The Listener AI & Cơ Chế:** 9/9 PASS (Đủ các hàm cảnh báo, hồi chiêu, đổi waypoints động, mồi nhử ngắt truy đuổi).
- **Nhóm 6 — Cân Bằng GameScene & Tính Công Bằng:** 11/11 PASS (Sát thương 25 HP, hồi chiêu 1.5s, đẩy lùi 55px, nhịp tim cảnh báo, 4 câu thoại tương tác).
- **Nhóm 7 — 6 Điểm Khai Thác Tài Nguyên:** 6/6 PASS (Đầy đủ 4 nhóm nguyên liệu cần thiết).
- **Nhóm 8 — Thông Thoáng Lối Đi & Hộp Va Chạm:** 4/4 PASS (Lối vào phía Nam thông thoáng $160\text{ px}$, không có collider chắn lối; 0 collider overlap trên 6 điểm tài nguyên).
- **TỔNG KẾT:** **79 / 79 BÀI TEST ĐẠT (100% PASS)**.

### 3.2. Kiểm tra Hồi Quy (Regression Test Suites)
- `verify_crooked_path_c4_12_21.mjs`: **76 / 76 PASS (100%)**.
- `verify_outer_woods_c4_12_20.mjs`: **59 / 59 PASS (100%)**.
- `verify_sanctuary_farm_c4_12_19.mjs`: **44 / 44 PASS (100%)**.
- `verify_core_world_blockout_c4_12_17.mjs`: **49 / 49 PASS (100%)**.
- **Biên dịch TypeScript:** `npx tsc --noEmit` đạt **0 ERRORS** (Sạch 100%).
- **Live Dev Server:** Đang chạy ổn định tại `http://localhost:3000/`, $60\text{ FPS}$, không có cảnh báo hay lỗi giật khung hình.

---

## 4. TỔNG KẾT CÁC TỆP TIN THAY ĐỔI TRONG COMMAND C4-12-22

1. [ZoneConnectionRegistry.ts](file:///g:/HOLLOW%20WOODS/src/world/ZoneConnectionRegistry.ts): Kích hoạt phân khu `deep_forest` và kết nối hai chiều với `crooked_path`, đăng ký cổng chờ sang `silent_mire`.
2. [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json): Khai báo phân khu Deep Forest hoàn chỉnh với khí quyển u ám, 10 interactables (3 thân cây rỗng, 3 bụi trốn, nấm, ổ quái vật, trụ đá) và collider ranh giới.
3. [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Triển khai `renderDeepForestTerrain`, `renderDeepForestDecorations`, nấm phát quang nhấp nháy, ổ đá cào xé, sương mù khí quyển và hệ thống cây viền.
4. [TheListener.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheListener.ts): Bổ sung các phương thức `canAttack`, `triggerAttackCooldown`, `onAlertTelegraph`, `onChaseAlert`, `onChaseEnded` kết nối trực tiếp với AudioManager.
5. [ListenerAI.ts](file:///g:/HOLLOW%20WOODS/src/systems/ListenerAI.ts): Bổ sung cập nhật lộ trình `setWaypoints`, hồi chiêu đòn đánh, cơ chế mồi ném nổ phá vỡ cuộc rượt đuổi (`_volume >= 2.0`).
6. [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts): Tích hợp đòn đánh công bằng (25 HP, knockback 55px, cooldown 1.5s), nhịp tim cảnh báo cự ly gần, mở rộng physics/camera bounds tự động khi vào Rừng Sâu và 4 action handlers.
7. [InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts): Bổ sung 6 điểm thu thập tài nguyên phân bố trong Deep Forest.
8. [verify_deep_forest_c4_12_22.mjs](file:///g:/HOLLOW%20WOODS/scripts/verify_deep_forest_c4_12_22.mjs): Kịch bản kiểm thử tự động 79 bài test xác nhận chất lượng toàn diện.
9. [C4-12-22_PRE_BACKUP](file:///g:/HOLLOW%20WOODS/Backups/C4-12-22_PRE_BACKUP/): Thư mục sao lưu toàn vẹn 8 tệp tin cốt lõi trước khi thực hiện command.
