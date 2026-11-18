# HOLLOW WOODS V1.4 — THIẾT KẾ MỞ RỘNG THẾ GIỚI & CỐT TRUYỆN VÙNG MỚI
## HYBRID OPEN WORLD EXPANSION & NARRATIVE TERRITORY ARCHITECTURE (BƯỚC 6)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 (Environment Asset Overhaul, Monster Expansion & World Map Development)  
**Nhánh Git đang thực hiện:** `feat/v1.4-expansion` (Bảo vệ độc lập tuyệt đối nhánh `main` và bản phát hành V1.3)  
**Tài liệu tham chiếu cơ sở:**
- `docs/v1.4/01_current_environment_audit.md` (Hiện trạng 12 phân khu nền tảng)
- `docs/v1.4/04_environment_replacement_plan.md` (Bảng Mapping 7 nhóm asset môi trường)
- `docs/v1.4/05_monster_ecology_and_encounters.md` (Hệ sinh thái quái vật & cơ chế chạm trán)
**Ngày hoàn thiện thiết kế:** 18/11/2026  
**Trạng thái thiết kế:** **HOÀN THÀNH — SẴN SÀNG TRIỂN KHAI TOPOLOGY & DỮ LIỆU (SPECIFIED & GATED)**  

---

## 1. TỔNG QUAN KIẾN TRÚC MỞ RỘNG THẾ GIỚI (WORLD TOPOLOGY OVERVIEW)

Thế giới HOLLOW WOODS V1.4 vận hành theo mô hình **Hybrid Open World phân tầng (Multi-tier World Topology)**, lấy **Làng Chuông Gỗ Bellhollow (`bellhollow`)** làm trung tâm sinh tồn, điểm tựa an toàn và ngọn hải đăng duy nhất xua tan bóng tối.

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                    SƠ ĐỒ MẠNG LƯỚI KHÔNG GIAN THẾ GIỚI HOLLOW WOODS V1.4                              |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|                                       [abyssal_chasm] (Vực Sâu Hư Không - Tier 5)                                     |
|                                                      ^                                                                |
|                                                      | (Cổng Cổ Ngữ Hư Không - Abyssal Gate)                           |
|                                                      v                                                                |
|   [whispering_grove] <--(Vòm Rễ Cổ)-- [deep_forest] <============ (Đường Mòn Bắc) ===========+                        |
|   (Thánh Địa Cây Sồi - Tier 2)        (Rừng Sâu Abyssal - Tier 4)                           |                        |
|            ^                                         ^                                      |                        |
|            |                                         |                                      |                        |
|            v                                         v                                      v                        |
|   [fog_crossing] <====== (Cổng Tây) =====> [BELLHOLLOW (CORE)] <=== (Đường Vòng V1.4) ===> [crooked_path]             |
|   (Lối Mòn Xuyên Sương)                    (Làng Chuông Gỗ)                                 (Đường Mòn Quanh Co)      |
|                                                      |                                              |                 |
|                                                      +--- (Lối Nông Trại)                           | (Cầu Sập)       |
|                                                      v                                              v                 |
|                                            [sanctuary_farm]                                  [silent_mire]            |
|                                            [outer_woods]                                     (Đầm Lầy Tĩnh Lặng)      |
|                                                      |                                              |                 |
|                                                      |                                              +--- (Cầu Cảng)   |
|                                                      v                                              v                 |
|                                            [sub_root_cellar]                                 [drowned_mire_depths]    |
|                                                      |                                       (Vực Nước Tử Khí - Mới)  |
|                                                      | (Khe Rễ Đá Ngầm)                             |                 |
|                                                      v                                              v                 |
|                                            [veil_origin_cavern] <== (Đường Nước Ngầm) ==> [sunken_crypt_ruins]        |
|                                            (Cội Nguồn Sương Mù)                           (Hầm Mộ Cổ Ngữ - Mới)       |
|                                                                                                                       |
+-----------------------------------------------------------------------------------------------------------------------+
```

### Danh Sách 5 Phân Khu Mở Rộng Được Lựa Chọn (Chất Lượng Hơn Số Lượng):
1. **`abyssal_chasm` (Vực Sâu Bóng Tối / The Abyssal Chasm):** Khe nứt địa chất khổng lồ phía Bắc Rừng Sâu — nơi bóng tối nguyên thủy trào dâng.
2. **`drowned_mire_depths` (Đầm Lầy Chìm / The Drowned Mire Depths):** Vực nước đen sâu thẳm rợp lau sậy phía Nam Đầm Lầy — lãnh địa của Đại Thú Đầm Lầy.
3. **`whispering_grove_sanctum` (Thánh Địa Cây Đại Ngàn / Sanctum of the Elder Grove):** Khu rừng cổ cây đại thụ phía Tây Bắc làng — vùng đất thanh tẩy linh thiêng.
4. **`sunken_crypt_ruins` (Hầm Mộ Cổ Ngữ Bị Chôn Vùi / The Sunken Crypt of Runes):** Điện thờ ngầm ngàn năm dưới lòng Miếu Chuông — cội nguồn Hội Hiệp Sĩ Đúc Chuông.
5. **`veil_origin_cavern` (Hang Cội Rễ Hư Vô / The Veil's Heart Cavern):** Trái tim lòng đất của hiện tượng sương mù — nơi cất giữ bí mật thân phận Hiệp Sĩ Đen.

---

## 2. THIẾT KẾ CHI TIẾT 5 BẢN ĐỒ MỚI THEO 7 TIÊU CHÍ CHUẨN MỰC

---

### 2.1 Bản Đồ 1: `abyssal_chasm` — Vực Sâu Bóng Tối (The Abyssal Chasm)

#### (1) Đặc điểm địa hình, ánh sáng & Phong cách môi trường
- **Tọa độ & Kích thước dự kiến:** $1600 \le x \le 2880$, $-1280 \le y \le -640$ (Diện tích: $1280 \times 640\text{ px}$).
- **Bầu không khí & Thị giác:** Địa hình hiểm trở với các vách đá hoa cương dựng đứng nứt nẻ (`#383630`), ở giữa là một khe nứt vực thẳm đen ngòm bốc lên làn khói lạnh hư vô. Toàn bộ cây cối là loài Phong Đỏ Huyết Mộc (`tree_maple_crimson_v14`) lá đỏ thẫm như máu khô xen lẫn cây khô trơ cành.
- **Hệ thống Chiếu sáng & Sương mù:**
  - `ambientLight = 0.15` (Vùng tối nhất trò chơi).
  - `fogColor = 0x14081c` (Sương mù ánh tím đen đặc quánh).
  - Tầm nhìn của Đèn Lồng Hổ Phách bị co hẹp lại chỉ còn $120\text{ px}$.

#### (2) Hệ thống Asset Môi trường sử dụng (từ Bảng Mapping Bước 4)
- **Mặt đất:** `tile_abyssal_soil_v14_a`, `tile_abyssal_soil_v14_b` (đất hoại mục tím đen lạnh).
- **Cây cối:** `tree_maple_crimson_v14` ($80 \times 95\text{ px}$ từ Pack 2), `tree_dead_withered_v14` ($32 \times 48\text{ px}$).
- **Đá & Địa hình:** `cliff_face_western_v14` (vách đá dốc dựng đứng từ Resurrected RPG), `rock_large_mossy_v14`.
- **Đạo cụ & Trang trí:** `prop_tangled_roots_v14` (chùm rễ cổ thụ đen như móng vuốt), nấm phát quang lam ngọc `prop_shroom_glow_teal_v14`.

#### (3) Quái vật & Kịch bản chạm trán (Liên kết Bước 5)
- **Hệ sinh thái:** Khu vực nguy hiểm Cấp 5 (Tier 5 Forbidden Zone).
- **Quái vật chính:** 2 Sói Xương Đêm tuần tra (`mon_skull_wolf`), 1 Kẻ Rình Mập Vô Diện (`mon_unseen_scout` — dao găm bóng tối lơ lửng gõ đá báo động).
- **Kịch bản phục kích:** Khi người chơi men theo mép vực đá hẹp, 3 Dơi Sương Mù (`mon_mist_bat`) sẽ bất ngờ sà xuống từ tán cây huyết mộc, giáng đòn trừ Composure và làm tắt đèn lồng, buộc người chơi phải giữ bình tĩnh thắp lại lửa giữa bầy thú săn.

#### (4) Tài nguyên, Vật phẩm & Bí mật đáng khám phá
- **Khoáng thạch quý:** `res_abyssal_obsidian` (Đá Thạch Anh Đen) dùng để nâng cấp Đèn Lồng lên Cấp 3 (xuyên thấu sương mù dày).
- **Rương cổ phế tích:** Chứa bùa hộ mệnh `charm_shadow_ward` (giảm $30\%$ hao hụt Composure khi gặp quái vật).

#### (5) Cốt truyện, Dấu vết & Nhật ký
- **Bia đá phế tích:** Bia đá khắc dòng chữ bằng cổ ngữ hiệp sĩ: *"Chớ nhìn quá lâu vào Khe Nứt Cội Nguồn... Nơi đây từng là nơi ngài Chỉ Huy dẫn quân tinh nhuệ chặn đứng đợt sương đầu tiên."*
- **Tàn tích cỗ xe:** Bộ giáp hiệp sĩ gãy nát nhuốm máu khô của một đồng đội cũ dưới trướng Hiệp Sĩ Đen.

#### (6) Lối kết nối & Điều kiện mở khóa
- **Lối vào:** Điểm tiếp giáp phía Bắc của `deep_forest` tại tọa độ $(2240, -640)$ qua Cổng Đá Cổ Ngữ `structure_abyssal_gate_v14`.
- **Điều kiện mở khóa:** Hoàn thành Nhiệm Vụ 2 của Hiệp Sĩ Canh Lửa ("Dấu Vết Đồng Đội Cũ") và sở hữu Chìa Khóa Hư Không (`key_abyssal_gate`).

#### (7) Động lực quay lại (Backtracking / Progression Loop)
- Nơi duy nhất tái sinh nguyên liệu quý Hắc Thạch Anh để chế tạo Dầu Đèn Tinh Khiết và Nồi Đun Thảo Dược Cấp Cao.

---

### 2.2 Bản Đồ 2: `drowned_mire_depths` — Đầm Lầy Chìm (The Drowned Mire Depths)

#### (1) Đặc điểm địa hình, ánh sáng & Phong cách môi trường
- **Tọa độ & Kích thước dự kiến:** $2880 \le x \le 4000$, $740 \le y \le 1380$ (Diện tích: $1120 \times 640\text{ px}$).
- **Bầu không khí & Thị giác:** Đầm lầy ngập nước sũng than bùn, cầu gỗ mục nứt nẻ bắc chập chùng qua các bãi lầy sủi bọt khí độc (`#12150e`). Cụm lau sậy rậm rạp cao lút đầu người.
- **Hệ thống Chiếu sáng & Sương mù:**
  - `ambientLight = 0.22` (Ánh sáng lục xỉn đục ngầu).
  - `fogColor = 0x18241b` (Sương mù sũng nước, hơi ẩm đọng giọt trên áo).
  - Tốc độ di chuyển dưới nước bùn giảm $-35\%$ nếu không đi trên cầu ván gỗ.

#### (2) Hệ thống Asset Môi trường sử dụng
- **Mặt đất:** `tile_swamp_mud_v14_a..d` (4 biến thể đất bùn ngậm nước), `tile_wood_plank_weathered_v14` (cầu gỗ mục nát).
- **Cây cối:** Thân liễu cổ thụ chết đứng bám đầy rêu nhớt, gốc sồi rỗng mục `tree_hollow_ancient_v14`.
- **Thực vật nước:** Cụm lau sậy nước `prop_swamp_cattails_v14` ($16 \times 30\text{ px}$ từ Forest Pack), thân cây đổ `prop_fallen_log_mossy_v14`.
- **Tàn tích ngập nước:** Khối đá cự thạch chìm phủ rêu xanh `sunken_monolith_ruins`.

#### (3) Quái vật & Kịch bản chạm trán
- **Đại Thú Đầm Lầy Hắc Ám (The Shadowed Wetlands Behemoth — Apex Encounter):** Ngự trị tại hồ nước sâu $(3440, 1060)$. Trồi lên từ làn bùn đen quật sóng nước than bùn và táp cắn vươn xa 250px.
- **Mắt Bóng Đêm Rình Rập:** 3 cụm `mon_shadow_eyes` ẩn giấu trong rặng lau sậy nước, liên tục thở khò khè dồn ép người chơi khi đang lội bùn.

#### (4) Tài nguyên, Vật phẩm & Bí mật đáng khám phá
- **Dược thảo đầm lầy:** `res_mire_lotus` (Sen Đầm Lầy Sương Đen) — nguyên liệu nấu Thuốc Giải Độc và Thuốc Giữ Nhiệt Lâu Dài tại Nồi Thảo Dược.
- **Bí mật lòng hồ:** Một chiếc rương sắt chìm nửa chìm nửa nổi dưới chân cầu cảng chứa bản thiết kế `blueprint_swamp_boots` (Ủng Lội Đầm Lầy — triệt tiêu hiệu ứng giảm tốc dưới bùn).

#### (5) Cốt truyện, Dấu vết & Nhật ký
- **Nhật ký của Ngư Phủ Vô Danh:** Một mẩu giấy dầu kẹp trong hốc cây mục: *"Màn sương không chỉ ăn mòn ký ức, nó làm biến dạng cả những con cá sấu đầm lầy... Đừng dại dột bơi qua vùng nước sâu khi không có đuốc sáng."*

#### (6) Lối kết nối & Điều kiện mở khóa
- **Lối vào:** Phía Nam của `silent_mire` qua Cầu Cảng Gỗ Mục (`boardwalk_pier`) tại tọa độ $(3380, 740)$.
- **Điều kiện mở khóa:** Hạ gục hoặc lẩn tránh thành công Mire Warden và kích hoạt cơ chế hạ đập nước cổ.

#### (7) Động lực quay lại (Backtracking)
- Vùng nước chứa nguồn Sen Đầm Lầy tái sinh duy nhất trong game; câu cá bóng đêm để lấy Mỡ Cá luyện Dầu Đèn Siêu Sáng.

---

### 2.3 Bản Đồ 3: `whispering_grove_sanctum` — Thánh Địa Cây Đại Ngàn (Sanctum of the Elder Grove)

#### (1) Đặc điểm địa hình, ánh sáng & Phong cách môi trường
- **Tọa độ & Kích thước dự kiến:** $1120 \le x \le 2080$, $-800 \le y \le -360$ (Diện tích: $960 \times 440\text{ px}$).
- **Bầu không khí & Thị giác:** Khu rừng cổ đại tuyệt đẹp và thanh bình hiếm hoi, nơi tán cây đan cài như mái vòm nhà thờ thiên nhiên. Ánh nắng rọi qua kẽ lá thành những luồng sáng vàng hổ phách dịu dàng xua tan sương mù độc.
- **Hệ thống Chiếu sáng & Sương mù:**
  - `ambientLight = 0.55` (Khu vực sáng sủa nhất bên ngoài làng Bellhollow).
  - `fogColor = 0x2e3d24` (Sương mù rừng ngọc bích loãng, không gây hao tổn Composure).
  - Người chơi bước vào vùng này được tự động phục hồi $+2\text{ Composure/giây}$.

#### (2) Hệ thống Asset Môi trường sử dụng
- **Mặt đất:** `tile_forest_grass_v14_a..d` điểm thảm hoa dại, thảm rêu xù xì `prop_moss_turf_v14`.
- **Cây cối đại thụ:** `tree_oak_ancient_titan_v14` ($113 \times 139\text{ px}$), `tree_birch_amber_v14` ($80 \times 95\text{ px}$) rực rỡ lá vàng kim.
- **Đạo cụ:** Bàn tế lễ bằng đá phủ rêu hoa `stone_altar`, ghế gỗ mộc `prop_bench_wood_v14`.

#### (3) Quái vật & Kịch bản chạm trán
- **Vùng An Toàn Tự Nhiên (Sanctuary Ecosystem):** Quái vật bóng tối và Sói Xương không thể xâm phạm vào vòng hào quang của Cây Đại Ngàn.
- **Thực thể Hộ Vệ:** Quạ Rừng và Bướm Đêm bay lượn hòa bình. Nếu người chơi dùng rìu chặt trộm cành cây thiêng, Tinh Linh Vỏ Cây (Elder Dryad Spirit) sẽ xuất hiện răn đe.

#### (4) Tài nguyên, Vật phẩm & Bí mật đáng khám phá
- **Nhựa Cây Thần Tinh Khiết:** `res_ancient_amber_sap` — nguyên liệu duy nhất để thăng cấp Lửa Trại Sanctuary làng Bellhollow lên Cấp 3 (Ngọn Lửa Trường Cửu).
- **Hạt giống quý hiếm:** `seed_spirit_bloom` để đem về gieo trồng tại Nông Trại Sanctuary Farm.

#### (5) Cốt truyện & Nhân vật liên quan
- **Bóng Ma Cụ Già Trồng Rừng (Spirit of the Old Forester):** Một hồn ma thiện lương không tấn công người chơi, trao lời chỉ dẫn về cách đánh thức ký ức bị lãng quên của chiếc Nhẫn Hiệp Sĩ.

#### (6) Lối kết nối & Điều kiện mở khóa
- **Lối vào:** Nối từ `sub_whispering_clearing` qua Vòm Rễ Cổ Thụ tại tọa độ $(1840, -360)$.
- **Điều kiện mở khóa:** Cần thắp sáng Đèn Lồng Hổ Phách Cấp 2 để giải tỏa đám sương gai rào chắn.

#### (7) Động lực quay lại
- Trạm nghỉ ngơi an toàn tuyệt đối ở phía Bắc bản đồ; nơi thanh tẩy hoàn toàn trạng thái điên loạn/rét buốt mà không cần chạy bộ ngược về làng Bellhollow.

---

### 2.4 Bản Đồ 4: `sunken_crypt_ruins` — Hầm Mộ Cổ Ngữ Bị Chôn Vùi (The Sunken Crypt of Runes)

#### (1) Đặc điểm địa hình, ánh sáng & Phong cách môi trường
- **Tọa độ & Kích thước dự kiến:** $3350 \le x \le 4480$, $-640 \le y \le 0$ (Diện tích: $1130 \times 640\text{ px}$).
- **Bầu không khí & Thị giác:** Công trình đền thờ ngầm ngàn năm bằng đá phiến nứt nẻ, các dãy cột đá cổ ngữ phát quang lam ngọc và hổ phách (`#3a4852`). Bụi tro và mạng nhện giăng mắc trên những cỗ quan tài đá hiệp sĩ.
- **Hệ thống Chiếu sáng:**
  - `ambientLight = 0.18`.
  - Ánh sáng phát ra từ 3 Trụ Cổ Ngữ (`pillar_moon`, `pillar_root`, `pillar_eye`).

#### (2) Hệ thống Asset Môi trường sử dụng
- **Mặt đất:** `tile_ancient_highway_v14`, `tile_stone_floor_v14` (đá lát hoa văn caro cổ kính).
- **Kiến trúc ngầm:** Tường đá vòm `cliff_face_western_v14`, quan tài đá cổ, bệ thờ cổ ngữ `stone_altar`.
- **Đạo cụ:** Đuốc gắn tường rỉ sét, thùng gỗ mục `prop_barrel_aged_v14`.

#### (3) Quái vật & Kịch bản chạm trán
- **Hồn Ma Hiệp Sĩ Canh Chuông (Ancient Bell Knights — Spectre Variant):** Mang hình hài giáp bạc mờ ảo, vung kiếm linh hồn chém sóng xung kích.
- **Câu đố Cổ Ngữ Sống Côn (Rune Puzzle Pressure):** Người chơi phải vừa giải câu đố xoay trụ cổ ngữ vừa né tránh sự truy lùng của các bóng ma.

#### (4) Tài nguyên, Vật phẩm & Bí mật đáng khám phá
- **Bảo vật Thức Tỉnh:** `item_black_knight_crest` (Huy Hiệu Hiệp Sĩ Đen Bị Vỡ) — kích hoạt Thức Tỉnh Ký Ức Giai Đoạn 2.
- **Trang bị:** `armor_shadow_mail` (Giáp Lưới Hiệp Sĩ Cổ — tăng $25\%$ giáp và kháng giá rét).

#### (5) Cốt truyện & Nhật ký
- **Bia Tưởng Niệm Hiệp Sĩ Đoàn:** Ghi danh các chiến binh đã hiến dâng thân xác để bảo vệ quả Chuông Lớn đầu tiên của làng Bellhollow.

#### (6) Lối kết nối & Điều kiện mở khóa
- **Lối vào:** Cầu thang ngầm mở ra từ tâm Đài Cổ Ngữ `ancient_rune_puzzle` sau khi người chơi giải thành công câu đố 3 cột trụ mặt đất.

#### (7) Động lực quay lại
- Trạm rèn đúc trang bị huyền thoại cổ đại; mở khóa đường tắt ngầm thông sang Miếu Chuông Phế Tích (`broken_bell_shrine`).

---

### 2.5 Bản Đồ 5: `veil_origin_cavern` — Hang Cội Rễ Hư Vô (The Veil's Heart Cavern)

#### (1) Đặc điểm địa hình, ánh sáng & Phong cách môi trường
- **Tọa độ & Kích thước dự kiến:** $480 \le x \le 1600$, $1440 \le y \le 2080$ (Diện tích: $1120 \times 640\text{ px}$).
- **Bầu không khí & Thị giác:** Hang động sâu nhất lòng đất, nơi rễ cây đại thụ khổng lồ cắm sâu vào mạch nước ngầm đen tuyền. Các khối tinh thể hắc ngọc rỉ ra dòng sương mù đen nguyên thủy.
- **Khí hậu Cực Hạn (Extreme Survival Hazard):**
  - Nhiệt độ hạ sâu xuống $-20^\circ\text{C}$ (người chơi liên tục bị tụt thân nhiệt nếu không có Lửa Đèn Lồng và Bùa Giữ Ất).
  - Composure giảm dần đều $-1\text{ Composure/3 giây}$ do áp lực tâm linh của cội nguồn The Veil.

#### (2) Hệ thống Asset Môi trường sử dụng
- **Mặt đất:** Nền đá ngầm sũng nước than bùn `tile_swamp_mud_v14`, vách đá thạch anh tím đen.
- **Cấu trúc:** Rễ cây cổ thụ khổng lồ đan xen `prop_tangled_roots_v14`, tinh thể hắc ngọc phát quang tím.
- **Công trình:** Cổng Vòm Hư Không `structure_abyssal_gate_v14` phong ấn lối đi vào lõi sương mù.

#### (3) Quái vật & Kịch bản chạm trán
- **Thực thể Bóng Đêm Cội Nguồn (The Shadow Prime):** Hiện thân bóng tối mạnh nhất, điều khiển sương mù xoáy lốc làm mù mắt người chơi.
- **Kẻ Rình Mập Vô Diện:** Xuất hiện dẫn dụ người chơi vào các hố sương sâu nguy hiểm.

#### (4) Tài nguyên & Phần thưởng đỉnh cao
- **Trái Tim Màn Sương:** `item_veil_heart_core` — vật phẩm nhiệm vụ tối thượng để sửa chữa Tháp Chuông Đồng và mở khóa Kết Thúc True Ending (Xua Tan Màn Sương Vĩnh Cửu).

#### (5) Cao trào Cốt Truyện — Đại Thức Tỉnh Ký Ức (Stage 3 Awakening)
- Tại đây, người chơi tìm thấy bức huyết thư và thanh đại kiếm bị phong ấn của chính mình:
  *"Ta — Chỉ Huy Hiệp Sĩ Đen — xin tự phong ấn ký ức và bản ngã của mình vào chiếc chuông cổ, để linh hồn ta mãi mãi làm mồi nhử giam cầm The Veil dưới lòng đất..."*
- Danh hiệu HUD chính thức đổi thành **"Chỉ Huy Hiệp Sĩ Đen (The Black Knight Commander)"**, toàn bộ bóng ma trong hang lập tức quỳ gối dạt lối cho người chơi bước qua.

#### (6) Lối kết nối & Điều kiện mở khóa
- **Lối vào:** Khe nứt đá ngầm dưới đáy `sub_root_cellar` (Hầm Rễ Cổ làng Bellhollow) và đường nước ngầm từ `sunken_crypt_ruins`.
- **Điều kiện mở khóa:** Đạt Thức Tỉnh Ký Ức Giai Đoạn 2 và chế tạo thành công Đèn Lồng Hổ Phách Cấp 3.

#### (7) Động lực quay lại
- Tâm điểm của vòng lặp kết thúc game (Endgame Loop); mở khóa đài dịch chuyển tức thời kết nối tất cả các phân khu.

---

## 3. BẢNG MA TRẬN TỔNG HỢP 5 BẢN ĐỒ MỚI (WORLD EXPANSION MATRIX)

| STT | Mã Bản Đồ (Zone ID) | Tên Tiếng Việt | Kích Thước | Cấp Độ Nguy Hiểm | Phong Cách Môi Trường & Ánh Sáng | Quái Vật Trọng Tâm | Bí Mật & Phần Thưởng Đỉnh Cao | Vai Trò Cốt Truyện |
|:---:|:---|:---|:---:|:---:|:---|:---|:---|:---|
| **1** | `abyssal_chasm` | Vực Sâu Bóng Tối | $1280 \times 640$ | **Tier 5** (Cấm địa) | Vách đá nứt nẻ, phong đỏ huyết mộc, sương tím đen kịt ($0.15$ lux) | Sói Xương Đêm, Dơi Sương, Dao Găm Bóng Tối | Đá Thạch Anh Đen, Bùa Hộ Mệnh Hư Không | Chiến trường chặn sương của Hiệp Sĩ Đoàn cũ |
| **2** | `drowned_mire_depths` | Đầm Lầy Chìm | $1120 \times 640$ | **Tier 4** (Rất cao) | Bùn ngập sâu, lau sậy rậm, cầu gỗ mục, nước độc ($0.22$ lux) | Đại Thú Đầm Lầy Behemoth, Mắt Bóng Đêm | Bản thiết kế Ủng Lội Đầm Lầy, Sen Đầm Lầy | Lãnh địa của quái thú cổ đại biến dị |
| **3** | `whispering_grove` | Thánh Địa Cây Đại Ngàn | $960 \times 440$ | **Tier 2** (An toàn cao) | Cây sồi đại ngàn, bạch dương hổ phách, nắng ấm thanh bình ($0.55$ lux) | Quạ hòa bình, Tinh Linh Vỏ Cây bảo vệ | Nhựa Cây Thần Cấp 3, Hạt Giống Hoa Tâm Linh | Trạm nghỉ ngơi thanh tẩy Composure phía Bắc |
| **4** | `sunken_crypt_ruins` | Hầm Mộ Cổ Ngữ | $1130 \times 640$ | **Tier 4** (Cao) | Đền thờ đá ngầm, quan tài cổ, cột đá phát quang ($0.18$ lux) | Hồn Ma Hiệp Sĩ Canh Chuông, Bẫy Cổ Ngữ | Huy Hiệu Hiệp Sĩ Đen Bị Vỡ, Giáp Lưới Cổ | Khởi nguồn Lễ Nghi Đúc Chuông Ngăn Sương |
| **5** | `veil_origin_cavern` | Hang Cội Rễ Hư Vô | $1120 \times 640$ | **Tier 5+** (Tử địa) | Rễ cây vĩ đại, rét buốt $-20^\circ\text{C}$, hắc thạch sương đen | Thực thể The Shadow Prime, Kẻ Rình Mập | Trái Tim Màn Sương (Veil Core), Đại Kiếm Đen | Cao trào Đại Thức Tỉnh thân phận Hiệp Sĩ Đen |

---

## 4. QUY TẮC BẢO TOÀN KIẾN TRÚC MÃ NGUỒN VÀ TIẾN TRÌNH LƯU TRÙNG (SAFE INTEGRATION)

1. **Bảo toàn Cấu trúc Mảng `zones.json`:**
   - 5 phân khu mới được định nghĩa với hệ tọa độ logic cách ly hoàn toàn, không đè lấn tọa độ của 12 phân khu cũ.
   - Sử dụng các cổng chuyển tiếp `transitions` có cờ kiểm tra điều kiện `requiredFlag` hoặc `requiredItem` thông qua `WorldGatingSystem.ts`.
2. **Tương thích hoàn toàn với SaveManager Schema v3:**
   - Khi người chơi tải lại file Save V1.3 cũ, hệ thống tự động gán giá trị mặc định cho 5 vùng mới vào `visitedZones = false` mà không làm hỏng tiến trình cũ.
3. **Cơ chế tải lười tài nguyên (Lazy Loading & Texture Caching):**
   - Các texture đặc thù của hang động và đầm lầy chìm chỉ được đưa vào VRAM khi người chơi tiếp cận phân khu kề cận trong bán kính 1 bước nhảy, giải phóng tức thì bộ nhớ khi quay về Làng Bellhollow.

---

## 5. XÁC NHẬN TUÂN THỦ RÀNG BUỘC DỪNG (STRICT VERIFICATION)

- [x] **Chỉ tạo tài liệu thiết kế kiến trúc và cốt truyện:** Hoàn thành trọn vẹn tại `docs/v1.4/06_world_map_expansion_plan.md`.
- [x] **Không chỉnh sửa dữ liệu code game:** File `src/data/zones.json` và `ZoneConnectionRegistry.ts` không bị thay đổi bất kỳ ký tự nào ở bước này.
- [x] **Định nghĩa đầy đủ 7 tiêu chí cho cả 5 bản đồ:** Đặc điểm địa hình/ánh sáng, asset sử dụng, kịch bản quái vật, tài nguyên, cốt truyện/nhật ký, cổng kết nối và lý do quay lại (backtracking loop).
- [x] **Đã dừng lại theo quy định:** Sẵn sàng chờ phê duyệt và hiệu lệnh bước tiếp theo từ bạn.

---
*Bản thiết kế được lập tự động và xác nhận kỹ thuật bởi Antigravity Engine Core.*
