# HOLLOW WOODS V1.4 — PHƯƠNG ÁN ĐẠI TU & BẢNG ĐỐI CHIẾU MÔI TRƯỜNG NỀN
## COMPREHENSIVE ENVIRONMENT ASSET REPLACEMENT & MAPPING PLAN (BƯỚC 4)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 (Environment Asset Overhaul, Monster Expansion & World Map Development)  
**Nhánh Git đang thực hiện:** `feat/v1.4-expansion` (Bảo vệ độc lập tuyệt đối nhánh `main` và bản phát hành V1.3)  
**Tài liệu tham chiếu cơ sở:**
- `docs/v1.4/01_current_environment_audit.md` (Kiểm kê 12 phân khu & 7 nhóm tài nguyên V1.3)
- `docs/v1.4/02_new_environment_packs_audit.md` (Kiểm định kỹ thuật 6 bộ asset mới tại `staging/env_audit/`)
**Ngày lập phương án:** 18/11/2026  
**Trạng thái thiết kế:** **HOÀN THÀNH — SẴN SÀNG TRIỂN KHAI KỸ THUẬT (READY FOR BATCH PROCESSING)**  

---

## 1. HỆ THỐNG ASSET ĐƯỢC LỰA CHỌN & CHIẾN LƯỢC HỢP NHẤT MÔI TRƯỜNG

Để bảo đảm tính thống nhất tuyệt đối về **Pixel Density (1:1 Nearest-Neighbor)**, **Kích thước Tile bội số lũy thừa 2 ($16 \times 16\text{ px}, 32 \times 32\text{ px}$)**, **Góc nhìn không gian (3/4 Top-down Oblique 2.5D)** và **Bầu không khí Dark Woodland sinh tồn kinh dị dân gian**, hệ thống môi trường nền V1.4 được xây dựng dựa trên sự hợp nhất của 5 bộ tài nguyên:

```
+----------------------------------------------------------------------------------------------------+
|                                HỆ SINH THÁI MÔI TRƯỜNG NỀN V1.4                                    |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [1. BỘ TIÊU CHUẨN CỐT LÕI (Core Master Baseline)]                                                 |
|  Pixel Art Top Down - Basic v1.2.3 (TX Series Master Lossless)                                     |
|  -> Nền đất cỏ, đất cát, nền đá cuội, tường đá, bóng đổ mặt đất (TX Shadow 45 độ hướng Tây Nam)    |
|                                                                                                    |
|  [2. BỘ CÂY ĐẠI THỤ ĐỒNG BỘ (Arboreal Canopy & Trunk System)]                                      |
|  Updated-Trees (Oak.png, Birch.png, Maple.png - 80x95 px)                                          |
|  -> Cây Sồi rêu xanh thẫm, Cây Bạch Dương hổ phách, Cây Phong Huyết Mộc với bóng đổ chân mềm       |
|                                                                                                    |
|  [3. BỘ CHƯỚNG NGẠI VẬT & CHI TIẾT TỰ NHIÊN (Deadwood & Woodland Props)]                          |
|  Forest-Asset-Pack (28 Sprite bóc tách từ Sheet 321x129)                                           |
|  -> Gốc sồi mục sét đánh, Thân cây cổ thụ đổ chắn đường, Đụn rễ cây trồi, Cụm nấm & Lau sậy sình   |
|                                                                                                    |
|  [4. BỘ KIẾN TRÚC THÔN DÃ LÀNG CỔ & ĐẠO CỤ DÂN SINH (Rural Village Architecture)]                |
|  The Fan-tasy Tileset 1.5.9 (Đã qua xử lý hạ sáng -35%, chuyển màu rơm mục & rêu phong ẩm)        |
|  -> 4 Ngôi nhà mái rạ cổ, Giếng làng mái che, Hàng rào gỗ mục, Củi chẻ, Đụn rơm khô               |
|                                                                                                    |
|  [5. BỘ VÁCH ĐÁ & CÔNG TRÌNH PHẾ TÍCH CỔ NGỮ (Ancient Ruins & Monolith Portals)]                  |
|  Resurrected RPG 1.1 (Cliffs & Walls) + SHADOW Series (Abyssal Gate 160x59 px)                     |
|  -> Vách đá sừng sững biên giới, Mố cầu đá sập, Cổng đá kết giới Hư Không Rừng Sâu                |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### Bảng màu quy chuẩn hợp nhất (Dark Woodland Master Palette):
- **Sắc lục rêu sương mù (Veil Moss Greens):** `#1a2416` (bóng tối tán cây), `#2d3d24` (rêu phong ẩm), `#3b4d2c` (thảm cỏ rừng sẫm).
- **Sắc nâu đất than bùn (Peat & Mire Earth):** `#12150e` (bùn đầm lầy sâu), `#261f18` (đất mùn mục rữa), `#3d2d1d` (vỏ cây phong hóa).
- **Sắc đá xám phong sương (Weathered Granite):** `#383630` (đá cuội cổ), `#555148` (khối đá hoa cương), `#6e695d` (mạch đá nứt bám rêu).
- **Sắc rơm mục & ván gỗ phong hóa (Weathered Thatch & Timber):** `#4a4332` (mái rơm mốc sau mưa), `#5e4830` (dầm gỗ sồi cháy), `#7d6945` (thớ gỗ già).
- **Sắc vàng hổ phách ấm (Amber Glow Accent):** `#ffc048` (ngọn lửa trại / ô cửa sổ đêm), `#e58e26` (nhựa thông hổ phách).

---

## 2. BẢNG ĐỐI CHIẾU CHI TIẾT 7 NHÓM MÔI TRƯỜNG (ASSET MAPPING TABLE)

### Nhóm 1: Nền Đất Rừng, Đất Khô, Đất Ẩm, Bùn Lầy (Biến thể chống lặp)
*Mục tiêu:* Xóa bỏ hoàn toàn cảm giác lặp ô cờ (tiling pattern repetition) trên diện tích các phân khu rộng lớn bằng cách cung cấp tối thiểu 4 biến thể hạt ngẫu nhiên cho mỗi loại địa hình.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 1.1 | `tile_forest_grass.png` (1 mẫu $32\times32$) | `tile_forest_grass_v14_a.png`<br>`tile_forest_grass_v14_b.png`<br>`tile_forest_grass_v14_c.png`<br>`tile_forest_grass_v14_d.png` | `TX Tileset Grass.png` (Master lossless) | $32 \times 32\text{ px}$ | Cắt 4 ô cỏ khác nhau (cỏ nhẵn, cỏ điểm lá rụng, cỏ rêu thẫm, cỏ đốm đất). Ghép thành 4 tile liền mạch (seamless 32x32). | `fog_crossing`<br>`bellhollow`<br>`outer_woods`<br>`sub_whispering_clearing` |
| 1.2 | `tile_dirt_trail.png` (1 mẫu $32\times32$) | `tile_dirt_trail_v14_a.png`<br>`tile_dirt_trail_v14_b.png`<br>`tile_dirt_trail_v14_c.png`<br>`tile_dirt_trail_v14_d.png` | `TX Tileset Grass.png` (Lớp Dirt) | $32 \times 32\text{ px}$ | Trích xuất 4 mẫu đất nén mòn: đất khô, đất sỏi mịn, đất rễ bám, đất lún gót chân. Cân bằng độ tương phản để lối mòn nổi rõ giữa nền cỏ. | Toàn bộ 12 phân khu (dọc các trục đường mòn) |
| 1.3 | `tile_swamp_mud.png` (1 mẫu $32\times32$) | `tile_swamp_mud_v14_a.png`<br>`tile_swamp_mud_v14_b.png`<br>`tile_swamp_mud_v14_c.png`<br>`tile_swamp_mud_v14_d.png` | `Forest-Asset-Pack` + `Resurrected RPG` | $32 \times 32\text{ px}$ | Hòa trộn màu đất bùn ngậm nước sẫm màu (`#181f16`), thêm bọt khí than bùn và vệt bùn nhớt mục rữa. | `silent_mire`<br>`sub_root_cellar` |
| 1.4 | *Tilled Soil* (Procedural Canvas fill) | `tile_tilled_soil_v14.png`<br>`tile_tilled_ridge_v14.png` | `The Fan-tasy Tileset/Tileset_Ground` | $16 \times 16\text{ px}$ & $32 \times 32\text{ px}$ | Xử lý màu: Giảm sáng $-30\%$, chuyển màu cát vàng sang đất đen mùn tơi xốp (`#2a1e14`), tạo rãnh luống sắc nét. | `sanctuary_farm`<br>`sub_root_cellar` |
| 1.5 | *Abyssal Soil* (Procedural Canvas fill) | `tile_abyssal_soil_v14_a.png`<br>`tile_abyssal_soil_v14_b.png` | `Resurrected RPG/Grass 2 layer` | $32 \times 32\text{ px}$ | Bộ lọc màu: Hạ sáng sâu, đẩy ánh tím than lạnh hoại mục (`#0e1311`, `#14181a`), thêm đốm bào tử rêu đen. | `deep_forest`<br>`ancient_rune_puzzle` |

---

### Nhóm 2: Đường Mòn, Lối Đi, Nền Đá, Nền Đất Quanh Làng Bellhollow
*Mục tiêu:* Đảm bảo độ tương phản thị giác rõ rệt để người chơi không bao giờ bị lạc, nhận biết ngay lối đi chính dẫn qua các công trình then chốt của làng và dẫn tới Tháp Chuông.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 2.1 | `tile_cobble_road.png` ($16\times16$ cũ) | `tile_cobble_road_v14.png`<br>`tile_cobble_edge_v14.png` | `TX Tileset Stone Ground.png` (Master) | $16 \times 16\text{ px}$ | Cắt viên đá cuội cổ kính có viền rêu đen; tạo thêm các tile rìa đường (edge transitions) có cỏ rêu tràn mép giúp đường cong mềm mại. | `bellhollow` (Trục chính Cổng Tây -> Quảng Trường Làng) |
| 2.2 | `tile_stone_floor.png` ($16\times16$ cũ) | `tile_stone_floor_v14.png` | `TX Struct.png` (Masonry floor) | $16 \times 16\text{ px}$ | Đá phiến chữ nhật mài phẳng dùng cho thềm nhà dân, đe rèn Bram và bậc tam cấp sân tế. | `bellhollow` (Sân nhà Edda, Neris, Lò rèn) |
| 2.3 | `castle_cobble_road.png` / `_dark.png` | `tile_ancient_highway_v14.png`<br>`tile_ancient_highway_dark_v14.png` | `TX Tileset Stone Ground` + Gói Castle | $16 \times 16\text{ px}$ | Nâng cấp độ phân giải pixel sắc nét, thêm vết nứt địa chấn và bụi sỏi vụn. | `crooked_path`<br>`broken_bell_shrine` |
| 2.4 | `castle_wood_plank.png` ($16\times16$) | `tile_wood_plank_weathered_v14.png` | `The Fan-tasy Tileset/Props` (Ván gỗ) | $16 \times 16\text{ px}$ | Xử lý màu: Giảm màu vàng sáng sang xám gỗ sồi phong hóa mốc ẩm; viền đinh sắt hoen rỉ. Dùng cho sàn chòi canh và cầu gỗ đầm lầy. | `silent_mire`<br>`sub_bell_workshop` |

---

### Nhóm 3: Đá, Tảng Đá, Vách Đá, Sỏi và Cấu Trúc Địa Hình
*Mục tiêu:* Thay thế các khối vách ngăn procedural bằng Sprite Pixel Art địa chất tự nhiên, tạo ranh giới tự nhiên vững chắc và răn đe.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 3.1 | `rock_large.png` ($64\times48$) | `rock_large_mossy_v14.png` | `TX Props with Shadow` + `Forest-Asset-Pack` | $64 \times 48\text{ px}$ | Tảng đá hoa cương khối lớn phủ thảm rêu xanh dày trên đỉnh, chân bám rễ cỏ, có bóng đổ 45 độ chuẩn xác. | Ranh giới phân khu các vùng rừng |
| 3.2 | `rock_medium.png` ($48\times40$) | `rock_medium_granite_v14.png`<br>`rock_small_cluster_v14.png` | `Forest-Asset-Pack` (Bounding box 25, 26, 27) | $32 \times 32\text{ px}$ & $22 \times 22\text{ px}$ | Cắt tách 3 biến thể tảng đá vừa và cụm sỏi bờ suối từ tệp sheet 321x129. Tông màu xám rêu giữ nguyên 100%. | Ven đường mòn, bờ suối đầm lầy |
| 3.3 | *West Barrier Cliff* (Vách đá chặn Tây Procedural) | `cliff_face_western_v14.png` (Tile ngang & góc vách) | `Resurrected RPG/Wall.png` | $32 \times 48\text{ px}$ (Tile ghép) | Cắt các khối vách đá dựng đứng (cliff facade) có mặt đỉnh phủ cỏ và mặt đứng lộ thớ địa chất nứt nẻ. Hạ sáng $-25\%$. | Phía Tây `fog_crossing` ($x \le 80$) |
| 3.4 | *Collapsed Bridge Chasm* (Vực cầu sập Tháp Chuông) | `obstacle_bridge_ruins_v14.png`<br>`chasm_fog_abyss_v14.png` | `Resurrected RPG/Wall` + `TX Struct` | $96 \times 64\text{ px}$ | Tạo mố cầu đá cổ bị nứt gãy đôi, trụ cầu rêu phong nghiêng ngả cắm xuống vực sương mù dày đặc. | Điểm chặn $(1790, 280)$ giữa `crooked_path` |

---

### Nhóm 4: Rêu Phong, Cỏ Dại, Bụi Cây, Cây Non
*Mục tiêu:* Đa dạng hóa thảm thực vật tầm thấp và tầm trung, tạo nhiều điểm ẩn nấp (`hiding_spot`) tự nhiên cho người chơi lẩn tránh quái vật.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 4.1 | `bush_dense_1.png` ($50\times44$) | `bush_dense_round_v14.png` | `TX Plant with Shadow` (Master) | $50 \times 44\text{ px}$ | Bụi rậm lá tròn rậm rạp xanh sẫm, viền lá tỉa hạt pixel sắc nét, bóng đổ mềm. Dùng làm điểm ẩn nấp cốt lõi. | Toàn bộ 12 phân khu |
| 4.2 | `bush_dense_2.png` ($41\times47$) | `bush_bramble_thorn_v14.png` | `TX Plant` + `Forest-Asset-Pack` | $48 \times 48\text{ px}$ | Bụi gai rừng đen ngả tím sẫm, thân cành chằng chịt, tạo cảm giác hiểm trở và hoang vu. | `outer_woods`<br>`silent_mire`<br>`deep_forest` |
| 4.3 | Cỏ dại & Dương xỉ (Procedural) | `prop_fern_cluster_v14.png`<br>`prop_moss_turf_v14.png` | `Forest-Asset-Pack` (Box 17, 18, 19) | $24 \times 24\text{ px}$ & $16 \times 16\text{ px}$ | Bóc tách cụm dương xỉ rừng già và thảm rêu xù xì sát mặt đất để rải trang trí tại lớp `DEPTH_GROUND_FLORA = -9000`. | Dọc lối mòn và quanh gốc sồi cổ |

---

### Nhóm 5: Cây Lớn, Cây Cổ Thụ, Gốc Cây, Rễ Cây, Thân Cây Đổ
*Mục tiêu:* Nâng cấp toàn diện "linh hồn" của HOLLOW WOODS — hệ thống đại thụ rừng già. Đảm bảo hỗ trợ hoàn hảo cơ chế **Tán cây mờ trong suốt (Canopy Transparency)** khi người chơi di chuyển phía sau.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 5.1 | `tree_oak_1.png` ($113\times139$) | `tree_oak_ancient_titan_v14.png` | `TX Plant with Shadow` (Master) | $113 \times 139\text{ px}$ | Làm sạch viền alpha, tăng cường độ nổi khối vỏ cây nứt nẻ, chuẩn hóa hộp va chạm chân gốc $24 \times 12\text{ px}$. | Rừng sồi đại ngàn toàn bản đồ |
| 5.2 | `tree_oak_2.png` ($95\times136$) | `tree_oak_mossy_v14.png` | `Updated-Trees/Oak.png` | $80 \times 95\text{ px}$ | Dùng trực tiếp không cần sửa đổi. Sắc xanh lục thẫm (`#335e2d`), bóng đổ elip mềm tích hợp sẵn dưới gốc rễ. | `fog_crossing`<br>`bellhollow`<br>`sanctuary_farm` |
| 5.3 | `tree_oak_3.png` ($83\times120$) | `tree_birch_amber_v14.png` | `Updated-Trees/Birch.png` | $80 \times 95\text{ px}$ | Dùng trực tiếp. Cây Bạch Dương lá vàng hổ phách (`#e0a040`), thân vỏ trắng xám nứt nẻ, tạo điểm sáng ấm áp bên lều trại. | `bellhollow`<br>`sanctuary_farm` |
| 5.4 | (Mới bổ sung V1.4) | `tree_maple_crimson_v14.png` | `Updated-Trees/Maple.png` | $80 \times 95\text{ px}$ | Dùng trực tiếp. Cây Phong lá đỏ huyết mộc u tối (`#732530`), phản ánh sự nguyền rủa và tử khí sương mù. | `broken_bell_shrine`<br>`deep_forest` |
| 5.5 | `hollow_tree.png` ($40\times32$) | `tree_hollow_ancient_v14.png` | `Forest-Asset-Pack` (Box 1 & 2) | $46 \times 61\text{ px}$ | Bóc tách gốc sồi cổ thụ mục ruỗng, lòng thân rỗng đen tuyền, cửa vào rộng cho nhân vật chui vào ẩn nấp `hiding_spot`. | `fog_crossing`<br>`crooked_path`<br>`outer_woods` |
| 5.6 | `tree_dead.png` ($24\times27$) | `tree_dead_withered_v14.png` | `TX Plant` | $32 \times 48\text{ px}$ | Cây gỗ khô khẳng khiu trơ cành, thân xám tro nứt toác, dùng xen kẽ trong đầm lầy. | `silent_mire`<br>`broken_bell_shrine` |
| 5.7 | *Fallen Logs* (Thân cây đổ Procedural) | `prop_fallen_log_mossy_v14.png` | `Forest-Asset-Pack` (Box 3 & 4) | $46 \times 61\text{ px}$ (Nằm ngang) | Bóc tách thân gỗ sồi mục phủ rêu nằm ngang, có hộp va chạm chữ nhật nằm ngang chắn đường đi thẳng cũ Tháp Chuông. | Điểm chặn `crooked_path`<br>`silent_mire` |
| 5.8 | *Tangled Roots* (Chùm rễ cổ Procedural) | `prop_tangled_roots_v14.png` | `Forest-Asset-Pack` + `Resurrected RPG` | $48 \times 32\text{ px}$ | Rễ cây đại thụ trồi lên mặt đất uốn lượn gồ ghề như những chiếc móng vuốt bám sâu vào bùn đất. | `sub_root_cellar`<br>`crooked_path` |

---

### Nhóm 6: Thảm Thực Vật, Lá Rụng, Nấm, Hoa Dại, Chi Tiết Trang Trí
*Mục tiêu:* Chi tiết hóa môi trường mặt đất, nâng cao cảm giác thế giới sống động và chân thực.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 6.1 | `res_herbs.png`, `res_tree_resin.png`, `res_dry_wood.png`, `res_flint.png` | (Giữ nguyên tệp gốc, tinh chỉnh viền 1.5px amber outline) | First-party Production | $16 \times 16\text{ px}$ | Giữ nguyên 100% hình ảnh nhận diện đã quen thuộc của 4 tài nguyên sinh tồn, chỉ chuẩn hóa độ tương phản để nổi bật trên nền cỏ mới. | Toàn bản đồ (Spawn tài nguyên) |
| 6.2 | *Bioluminescent Mushrooms* (Nấm phát quang Procedural) | `prop_shroom_cluster_amber_v14.png`<br>`prop_shroom_glow_teal_v14.png` | `Forest-Asset-Pack` (Box 7..12, 17..24) | $16 \times 16\text{ px}$ & $24 \times 24\text{ px}$ | Bóc tách các cụm nấm từ sheet; chia 2 tông: nấm nâu hổ phách ấm cho làng và nấm phát quang lam ngọc cho Rừng Sâu. | `deep_forest`<br>`sub_root_cellar`<br>`bellhollow` |
| 6.3 | *Cattails Cluster* (Lau sậy nước Procedural) | `prop_swamp_cattails_v14.png` | `Forest-Asset-Pack` (Box 6) | $16 \times 30\text{ px}$ | Bóc tách khóm lau sậy nước thân cao ngả bùn vàng, cắm rải rác ven các vũng nước đầm lầy. | `silent_mire` |
| 6.4 | `wooden_fence.png` ($47\times53$) | `prop_fence_timber_v14.png`<br>`prop_fence_gate_v14.png` | `The Fan-tasy Tileset/Fence_Hay_*` | $26 \times 16\text{ px}$ & $16 \times 26\text{ px}$ | Xử lý màu: Chuyển sắc vàng tươi sang gỗ mốc rêu phong sương gió, khớp góc nối ngang và dọc. | `bellhollow`<br>`sanctuary_farm` |
| 6.5 | (Đạo cụ dân sinh bổ sung mới) | `prop_wood_pile_v14.png`<br>`prop_hay_bale_v14.png`<br>`prop_barrel_aged_v14.png`<br>`prop_crate_weathered_v14.png` | `The Fan-tasy Tileset/Props` | $32 \times 21\text{ px}$ đến $24 \times 29\text{ px}$ | Hạ sáng $-30\%$, desaturate sang tông màu đất xỉn. Bố trí quanh xưởng rèn Bram, chuồng trại và hiên nhà dân. | `bellhollow`<br>`sanctuary_farm`<br>`sub_bell_workshop` |

---

### Nhóm 7: Nền Đầm Lầy, Rừng Sâu, Khu Vực Cổ Ngữ, Công Trình Bỏ Hoang
*Mục tiêu:* Nâng cấp kiến trúc làng Bellhollow từ các sprite hình hộp cơ bản lên các công trình mái rạ chân thực có hồn, biến các tàn tích thành những phế tích cổ kính đầy ma mị.

| STT | Asset Hiện Tại (V1.3) | Asset Mới Chuẩn Hóa (V1.4) | Gói Nguồn | Kích Thước | Thao Tác Xử Lý Cần Thiết | Phân Khu Áp Dụng |
|:---:|:---|:---|:---|:---:|:---|:---|
| 7.1 | `house_edda.png` ($112\times80$) | `building_house_edda_v14.png` | `The Fan-tasy Tileset/House_Hay_2` | $157 \times 112\text{ px}$ | Ngôi nhà mái rạ đôi kèm tháp chuông nhỏ. Tiền xử lý: Giảm sáng rơm vàng sang xám mốc rêu, thắp sáng ánh hổ phách ấm ở 2 ô cửa sổ nhỏ. | `bellhollow` (Nhà Edda - Tọa độ 710, 380) |
| 7.2 | `house_neris.png` ($112\times80$) | `building_house_neris_v14.png` | `The Fan-tasy Tileset/House_Hay_4_Purple` | $128 \times 128\text{ px}$ | Ngôi nhà gỗ thảo dược mái rạ ngả tím thẫm ma mị. Giảm sáng, bổ sung giỏ thuốc treo hiên nhà. | `bellhollow` (Nhà Neris - Tọa độ 970, 215) |
| 7.3 | `village_well.png` ($39\times46$) | `building_village_well_v14.png` | `The Fan-tasy Tileset/Well_Hay_1` | $56 \times 75\text{ px}$ | Giếng làng xây đá cuội viền rêu có trụ gỗ và mái che rơm cổ kính. Xử lý màu ăn khớp với nhà dân. | `bellhollow` (Trung tâm làng) |
| 7.4 | `bell_tower.png` ($80\times112$) | `building_bell_tower_v14.png` | First-party Master | $80 \times 112\text{ px}$ | Giữ nguyên dáng tháp chuông đồng biểu tượng của game; làm mịn chân móng tiếp giáp nền đá mới bằng đốm cỏ rêu. | `bellhollow` (Đông Bắc làng) |
| 7.5 | `broken_shrine.png` ($96\times80$) | `building_broken_shrine_v14.png`| First-party Master | $96 \times 80\text{ px}$ | Giữ nguyên kiến trúc miếu phế tích linh thiêng; bổ sung các mảnh ngói đá vỡ rải rác quanh bậc thềm. | `broken_bell_shrine` |
| 7.6 | (Cổng kết giới phế tích mới) | `structure_abyssal_gate_v14.png`| `SHADOW Series - Void Gate` | $160 \times 59\text{ px}$ | Trích xuất Cổng Hư Không đứng bằng đá đen ma thuật (`#11190e`), đặt tại ranh giới phong ấn chuyển sang Rừng Sâu. | `silent_mire` -> `deep_forest` (Chuyển cảnh) |

---

## 3. NGUYÊN TẮC BẢO TOÀN KỸ THUẬT & AN TOÀN HỆ THỐNG

### 3.1 Bảo Toàn Định Danh & Cơ Chế Mirror Aliasing (Safe Mapping)
1. **Kiến trúc Registry 4 tầng không bị phá vỡ:**
   - Trong `content_registry.json`, mọi tài nguyên mới đều được cấp Content ID chuẩn hóa V1.4:
     + Định dạng Cây cối: `HW-ENV-TREE-OAK-000001`, `HW-ENV-TREE-BIRCH-000001`, `HW-ENV-TREE-MAPLE-000001`
     + Định dạng Đạo cụ: `HW-ENV-PROP-STUMP-000001`, `HW-ENV-PROP-LOG-000001`, `HW-ENV-PROP-MUSHROOM-000001`
     + Định dạng Công trình: `HW-ENV-BLD-EDDA-000001`, `HW-ENV-BLD-WELL-000001`
2. **Cơ chế Mirror Key an toàn cho Mã Nguồn Cũ:**
   - Các khóa định danh runtime cũ (`runtimeKey`) như `tree_oak_1`, `rock_large`, `village_well`, `tile_forest_grass` vẫn được duy trì làm khóa nạp trong `PreloadScene.ts` hoặc được ánh xạ qua từ điển Aliasing:
   ```typescript
   export const ASSET_MAPPING_V14: Record<string, string> = {
     'tree_oak_1': 'tree_oak_ancient_titan_v14',
     'tree_oak_2': 'tree_oak_mossy_v14',
     'village_well': 'building_village_well_v14',
     'house_edda': 'building_house_edda_v14'
   };
   ```
   - Cơ chế này đảm bảo dữ liệu trong `zones.json`, vị trí 6 NPC làng Bellhollow, tọa độ điểm hồi sinh và hệ thống Save/Load (`SaveManager.ts` Schema v3) hoạt động trơn tru 100%, không bị văng lỗi thiếu texture (`Texture key not found`).

---

### 3.2 Quy Chuẩn Hộp Va Chạm (Footprint Collider Standards)
Tuyệt đối không sử dụng bounding box hình chữ nhật của toàn bộ bức ảnh làm vật cản vật lý. Bắt buộc áp dụng nguyên lý **Footprint Collider** chuẩn hóa ở chân gốc:

```
+-------------------------------------------------------+
|  Ảnh Cây Sồi Cổ Thụ (80 x 95 px)                      |
|                                                       |
|             [ Tán Lá Rộng Trong Suốt ]                |
|             (Nhân vật có thể đi sau tán)              |
|                                                       |
|                        ||                             |
|                        || (Thân cây)                  |
|                        ||                             |
|                 +---------------+                     |
|                 | Hộp va chạm   |  <- Kích thước:     |
|                 | 24 x 12 px    |     24 x 12 px      |
|                 +---------------+                     |
|                      (Gốc rễ)                         |
+-------------------------------------------------------+
                originX = 0.5, originY = 0.92
```

- **Quy chuẩn kích thước Collider:**
  - Cây đại thụ ($80 \times 95\text{ px}$ đến $113 \times 139\text{ px}$): Hộp va chạm chân $24 \times 12\text{ px}$ tại đáy thân.
  - Tảng đá lớn ($64 \times 48\text{ px}$): Hộp va chạm $48 \times 20\text{ px}$ tại nửa dưới tảng đá.
  - Thân cây đổ ($46 \times 61\text{ px}$ nằm ngang): Hộp va chạm thanh dài $50 \times 16\text{ px}$.
  - Nhà cửa thôn dã ($157 \times 112\text{ px}$): Hộp va chạm chỉ bao quanh móng tường sau và tường trước ($140 \times 40\text{ px}$), chừa lối đi hiên nhà thoáng đãng.

---

### 3.3 Quy Chuẩn Độ Sâu Chiều Sáu (Depth Sorting / Y-Sorting)
Tất cả các thành phần môi trường mới đều phải tuân thủ nghiêm ngặt bảng hằng số độ sâu trong `Constants.ts`:

$$\text{Depth} = \begin{cases}
-10000 & \text{Mặt đất nướng nguyên khối (Baked Ground CanvasTexture)} \\
-9500 & \text{Chân móng vách đá, kè đá bờ suối (Ground Footing)} \\
-9200 & \text{Thảm rêu, đốm cỏ mọc tràn mép đường (Ground Turf)} \\
-9000 & \text{Dương xỉ, hoa dại, lá rụng sát sàn (Ground Flora)} \\
-8900 & \text{Mặt nước sình lầy đục (Ground Swamp Water)} \\
-1 & \text{Bóng đổ chân thực thể } (\text{Depth}_{\text{Entity}} - 1) \\
\lfloor y \rfloor & \text{Player, NPC, Quái vật, Cây cối, Tảng đá, Nhà cửa} \\
+1 & \text{Viền sáng tương tác, Quầng sáng đèn lồng hổ phách} \\
+7000 & \text{Lớp sương mù trôi sát chân (Veil Ground Fog)} \\
+10000 & \text{Lớp sương mù dày thượng tầng (Veil Canopy Fog)}
\end{cases}$$

---

### 3.4 Quy Chuẩn Che Khuất Tán Cây & Mái Nhà (Occlusion Transparency)
Mọi Sprite cây cối đại thụ (`tree_*_v14`) và công trình nhà cửa (`building_*_v14`) khi khởi tạo trong `WorldBuilder.ts` đều phải được tự động đăng ký vào mảng `treeCanopyGroup` hoặc `occlusionGroup`.
- Mỗi khung hình, hệ thống kiểm tra bounding box của tán lá / mái nhà:
  $$X \in [x_{\text{bld}} - \text{halfW}, x_{\text{bld}} + \text{halfW}], \quad Y \in [y_{\text{bld}} - \text{height} \times \text{originY}, y_{\text{bld}}]$$
- Khi nhân vật chính đi vào vùng che khuất:
  $$\text{alpha} = \text{Phaser.Math.Linear}(\text{currentAlpha}, 0.35, 0.2)$$
- Khi nhân vật bước ra ngoài:
  $$\text{alpha} = \text{Phaser.Math.Linear}(\text{currentAlpha}, 1.0, 0.2)$$
Đảm bảo người chơi không bao giờ bị khuất tầm nhìn, không bị quái vật "cắn lén" khi đang nấp sau thân cây.

---

### 3.5 Cơ Chế Sao Lưu & Khôi Phục Nhanh (Non-Destructive Rollback Mechanism)
1. **Lưu trữ cách ly tuyệt đối:**
   - Toàn bộ tệp đồ họa đã xử lý mới sẽ được xuất khẩu vào thư mục chuyên biệt: `public/assets/environment/v14/`.
   - Toàn bộ tệp đồ họa V1.3 cũ trong `public/assets/environment/sprites/` và `tiles/` được bảo tồn nguyên vẹn 100%, không bị xóa hay ghi đè.
2. **Cờ cấu hình chuyển đổi một chạm (One-touch Feature Flag):**
   - Trong `src/core/Constants.ts`, bổ sung biến cờ:
     ```typescript
     export const CONFIG_USE_V14_ENVIRONMENT_ASSETS = true; // Chuyển về false để Rollback tức thì về V1.3
     ```
   - Khi cờ là `false`, hệ thống tự động tải đường dẫn asset V1.3 cũ mà không cần can thiệp Git, đảm bảo an toàn tuyệt đối cho quá trình phát triển.

---

## 4. LỘ TRÌNH THỰC THI CHO BƯỚC TIẾP THEO (STEP 5 EXECUTION ROADMAP)

Khi có lệnh thực hiện Bước 5, tiến trình xử lý hàng loạt (Batch Processing) sẽ diễn ra theo 4 công đoạn tự động:

1. **Công đoạn 1 — Chạy Script Cắt Tách Sprite Độc Lập (Slicing Pipeline):**
   - Chạy `scripts/slice_forest_pack.mjs` để tự động bóc tách 28 sprite từ `Forest-Asset-Pack-Sheet.png` (gốc sồi mục, thân cây đổ, đá sỏi, cụm nấm, lau sậy).
   - Xuất khẩu sang `public/assets/environment/v14/foliage/` và `props/`.
2. **Công đoạn 2 — Chạy Script Tiền Xử Lý Màu & Ánh Sáng (Color Grading & Desaturation Pipeline):**
   - Chạy `scripts/process_fantasy_village.mjs` để hạ sáng $-35\%$, khử vàng rơm, chuyển sang rơm xám mốc và gỗ ẩm cho 4 ngôi nhà `House_Hay_1..4` và giếng làng.
   - Thêm ánh sáng hổ phách ấm `#ffc048` tại các khung cửa sổ.
3. **Công đoạn 3 — Di Chuyển Asset Nhóm A (Direct Asset Copy):**
   - Sao chép 3 tệp cây đại thụ `Oak.png`, `Birch.png`, `Maple.png` từ `staging/env_audit/02_updated_trees/` sang `public/assets/environment/v14/trees/`.
   - Sao chép các tệp TX lossless master sang `public/assets/environment/v14/tilesets/`.
4. **Công đoạn 4 — Cập Nhật Registry & Preload (Registration & Preload Integration):**
   - Đăng ký toàn bộ Content ID mới vào `content_registry.json`.
   - Nạp các khóa texture mới vào `PreloadScene.ts` có gắn cờ an toàn `CONFIG_USE_V14_ENVIRONMENT_ASSETS`.

---

## 5. XÁC NHẬN TUÂN THỦ RÀNG BUỘC DỪNG (STRICT VERIFICATION)

- [x] **Chỉ xuất bản thiết kế và bảng Mapping:** Không ghi đè bất kỳ file hình ảnh nào trong `public/assets/`.
- [x] **Không sửa map thực tế:** Không thay đổi dữ liệu trong `zones.json` hay logic trong `WorldBuilder.ts`.
- [x] **Bảo vệ toàn vẹn mã nguồn:** Không chỉnh sửa mã nguồn game runtime.
- [x] **Kế hoạch hoàn chỉnh:** Đã đối chiếu đầy đủ 7 nhóm môi trường nền, định nghĩa rõ ràng quy chuẩn kỹ thuật và phương án rollback an toàn.

---
*Bản thiết kế được lập tự động và xác nhận kỹ thuật bởi Antigravity Engine Core.*
