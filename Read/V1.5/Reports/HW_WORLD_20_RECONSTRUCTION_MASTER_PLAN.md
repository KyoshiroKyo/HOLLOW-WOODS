# HW-WORLD-20 — KẾ HOẠCH TỔNG THỂ TÁI THIẾT BẢN ĐỒ, ĐIỀU HƯỚNG & COLLISION 2.0 (`HW-WORLD-20A`)

- **Dự án:** `HOLLOW WOODS` — *World Reconstruction 2.0*
- **Studio:** `KYOSHIRO STUDIO`
- **Đặc phái viên:** `AG 4 Hydro High`
- **Nhánh Git:** `feat/v1.5.3-ag-world-polish` (`HEAD`: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`)
- **Tham chiếu phong cách:** `HOLLOW WOODS TRAILER V12.2` & Prototype thành công [LAB-01](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md)
- **Chế độ hiện tại:** `HW-WORLD-20A (AUDIT & DIAGNOSTIC ONLY)` — **0** sửa đổi mã nguồn sản xuất (`src/`, `public/assets/`).

---

## 1. Tóm Tắt Điều Hành & Số Liệu Kiểm Toán Tổng Hợp

Qua kiểm toán tĩnh mã nguồn kết hợp chạy trực tiếp **Playwright Headless WebGL (`ANGLE D3D11`, GPU thực `NVIDIA GeForce GTX 1070 Ti`)** trên Vite dev build (`?dev=1`, bật/tắt phím `F9` thật), trạng thái bản đồ HOLLOW WOODS trước tái thiết được định lượng đầy đủ trong [HW_COLLISION_AUDIT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-WORLD-20/HW_COLLISION_AUDIT.json):

| Chỉ số kiểm toán (`HW-WORLD-20A`) | Kết quả đo thực tế | Ghi chú kỹ thuật |
| :--- | :---: | :--- |
| Tổng số phân khu (`zones.json`) | **17** | 12 phân khu có trang trí/nền riêng, 5 phân khu mở rộng trống rỗng |
| Tổng `StaticBoxCollider` đang bật (`colliders`) | **329** | Trùng lặp chính xác: `0`; nhưng tồn tại tường biên 2-3 lớp sát nhau |
| Tổng Display Objects (`children.length`) | **1.200 – 1.202** | Đã gồm cả canvas ground, decals, cây, sương mù và UI world |
| Cặp `bounds` chồng lên nhau | **6 cặp** | Gây kẹt spawn (`whispering_grove_sanctum`) & vết khâu màu cắt ngang (`deep_forest`) |
| Trigger chuyển vùng nằm ngoài `bounds` (OOB) | **3 cổng** | `to_drowned_mire_depths` (+4px Y), `to_silent_mire_from_puzzle` (-40px X), `to_veil_origin_cavern` (+4px Y) |
| Xung đột Collider đè lên Transition (`triggerRect`) | **14 vị trí** | Bao gồm tường tự động cắt ngang cổng Bắc `sub_whispering_clearing` & `df_bound_left` |
| Tuyến 1 chiều (`oneWayTransitions`) | **1 tuyến** | `sub_whispering_clearing -> crooked_path` (không có chiều ngược lại) |
| Sprite `prop_fallen_log_mossy_v14` bị đóng nhầm trong atlas | **20 đối tượng** | Frame `{49, 387, 46x61}` là cây lá đỏ/tím -> hitbox nằm lơ lửng giữa tán cây |
| Cụm sprite tĩnh xếp chồng bất hợp lý | **4 cụm** | Nổi bật: `tree_mossy_oak_grand` + `prop_chest_bronze` + `building_ranger_outpost` đè nhau tại `(1445..1450, 650)` |
| Collider tường ẩn / đạo cụ vector (`detached`) | **18 mục** | Gồm `Cột Vật Tổ`, `Bia Đá`, `Đèn Nghi Thức` và các rặng tường ẩn dài `535–900px` |
| Kiểm tra đi bộ bằng phím thật `WASD` | **2/5 PASS, 3/5 FAIL** | `W01` kẹt lều giữa phố `bellhollow`; `W02` kẹt cửa Bắc `deep_forest`; `W05` dừng ở cửa Nam `silent_mire` |
| Lỗi runtime (`console` / `page` / `http >= 400`) | **0 / 0 / 0** | Ổn định runtime tốt, `F9` hoạt động 100% |

---

## 2. Kiểm Toán Chi Tiết Toàn Bộ 17 Phân Khu (§4)

| # | Zone ID & Tên | Tier | Bounds `(x, y, w×h)` | Colliders | Hiện trạng đồ họa & Mật độ | Vấn đề Navigation / Collision trọng tâm | Xếp loại |
| :-: | :--- | :---: | :--- | :---: | :--- | :--- | :---: |
| 1 | `fog_crossing` *(Lối Mòn Xuyên Sương)* | L1 | `(0, 0, 480×360)` | 18 | Đường đất `CanvasTexture`, rào Tây dùng cây đổ xoay `90°` lỗi (`2777`) | `W20-BUG-001` tại `(220, 130)`; tường biên chồng 2–3 lớp; `to_fog_crossing` bị đè `16×60px`; `fog_tree_1/2` rác trong `zones.json` | **Kém** |
| 2 | `bellhollow` *(Làng Chuông Cổ)* | L1 | `(480, -200, 1120×960)` | 92 | Nền cỏ vẽ code + quảng trường gạch xám; nấm mọc trên gạch | **FAIL `W01`**: `Lều Trú Ẩn (759,255)` + `Đèn` + `Rương` chặn thẳng trục `y=260`; chồng `bounds` lên Farm (`640×200`) & Outer Woods (`480×200`) | **Trung bình - Yếu** |
| 3 | `sanctuary_farm` *(Nông Trại Trú Ẩn)* | L1 | `(480, 560, 640×480)` | 42 | Bố cục luống rau ổn nhưng ao góc Nam là hình tròn `Graphics` phẳng | Hàng rào đâm xuyên thân cây `(505, 840)`; `3` vùng vàng `[E]` chồng nhau quanh bếp/rương; tường Tây chồng 2 lớp | **Trung bình - Yếu** |
| 4 | `outer_woods` *(Rừng Ngoại Vi)* | L1 | `(1120, 560, 480×480)` | 51 | Rừng chật hẹp trong `480×480`, cây & đá dày đặc | **Triple stack** Cây Sồi + Rương + Nhà Kiểm Lâm `(1445..1450, 650)`; cây đè `to_bellhollow_from_ow` (`1161, 576`); `W20-BUG-001` tại `(1135, 670)` | **Kém** |
| 5 | `crooked_path` *(Đường Mòn Quanh Co)* | L2 | `(1600, 0, 1280×640)` | 40 | Đường chữ S thưa thớt, cỏ đơn điệu; `3` cây đổ dính `W20-BUG-001` | Đôi tường đỏ chạy dọc hết biên Nam trên mặt cỏ; cây hàng dưới không collider (`y~570`); `to_deep_forest` bị `Biển Chỉ Dẫn (2093, 38)` chặn mép; `to_outer_woods` cấn `bell_bound_east_bottom` | **Kém** |
| 6 | `deep_forest` *(Rừng Sâu)* | L2 | `(1600, -640, 1280×640)` | 48 | Khá tối, thiếu phân tầng tán; `4` cây đổ dính `W20-BUG-001` | **Stacking nặng nhất map**: Biển+Rương `(1974,-70)`, Triple `(2340,-490)`, Cụm 5 `(2100,-340)`; `W02` kẹt cửa Bắc (`HW-H4-03-AUDIT`); bị `sub_whispering_clearing` và `sanctum` cắt chéo | **Rất Kém (P0)** |
| 7 | `sub_whispering_clearing` *(Khoảng Trống Thì Thầm)* | L2 | `(1600, -360, 370×360)` | 14 | Mảng nền tím hình chữ nhật cắt gắt sang cỏ xanh; `3` cột đá vẽ vector `fillRoundedRect` | **`MAP-BUG-001` (P0)**: tường tự động `auto_south_whispering_grove_sanctum_seg_end` chặn 2 cổng Bắc; cây bạch dương đè cửa thoát; đi thẳng Nam xuống `crooked_path` bị mất đường về | **Rất Kém (P0)** |
| 8 | `whispering_grove_sanctum` *(Thánh Địa Đại Ngàn)* | L2 | `(1120, -800, 960×440)` | 22 | Thiếu `render*Decorations()` hoàn toàn (nền cỏ phẳng) | **`MAP-BUG-002` (P0)**: Chồng `480×280` lên `deep_forest` & `480×160` lên `abyssal_chasm`; `defaultSpawn (1600,-420)` nằm giữa tường `df_bound_left` | **Rất Kém (P0)** |
| 9 | `silent_mire` *(Đầm Lầy Tĩnh Lặng)* | L3 | `(2880, 100, 1120×640)` | 58 | Sàn bùn tối + decal ổn hơn nhưng hồ lầy chỉ là elip `Graphics` nâu | Hộp AABB hồ lầy (`220×110`, `200×85`, `240×120`) gây tường vô hình góc vuông; rặng cây tường ẩn `535–575px`; `W05` bị kẹt im lặng tại `y=734.4` | **Trung bình - Yếu** |
| 10 | `ancient_rune_puzzle` *(Khu Câu Đố Cổ Ngữ)* | L3 | `(3350, 150, 350×280)` | 13 | Quảng trường đá giữa `silent_mire`; đèn/bia vẽ `Graphics` | Chồng `350×280` lên `silent_mire`; `to_silent_mire_from_puzzle (3310..3335)` ngoài biên; `Đèn Đá` đè `to_rune_puzzle` | **Trung bình - Yếu** |
| 11 | `broken_bell_shrine` *(Miếu Chuông Phế Tích)* | L3 | `(4000, 0, 960×600)` | 33 | Bán nguyệt gạch lớn giữa nền cỏ đen chấm pixel; `2` cây đổ lỗi | 2 mép cổng Tây cấn `shrine_bound_left_bottom` & `auto_east_silent_mire_seg_0`; rặng Bắc tường ẩn `900px` | **Trung bình** |
| 12 | `sub_bell_workshop` *(Xưởng Chuông Bỏ Hoang)* | L1 | `(1120, 1040, 480×400)` | 13 | Ít vật thể (bàn chế tạo, 1 đá, quầng sáng cam), tường bao kín | Vòng sàn đá đặt lạc lõng trên nền cỏ xanh | **Trung bình** |
| 13 | `sub_root_cellar` *(Hầm Rễ Cổ)* | L1 | `(480, 1040, 640×400)` | 11 | **100% vector placeholder (`Graphics`)**: nấm chấm tròn, X rễ nâu, suối hình elip | Trụ giữa phòng không có collider; cổng `to_veil_origin_cavern` lố biên Nam `4px` | **Kém** |
| 14 | `abyssal_chasm` *(Vực Sâu Bóng Tối)* | L3 | `(1600, -1280, 1280×640)` | 18 | **Trống rỗng**: sàn gạch xám lặp + 1 hộp collider đỏ khổng lồ giữa tâm `(2240,-960)` | Chưa có thiết kế môi trường, thiếu lối đi/bờ vực/cổng Abyssal thật | **Chưa hoàn thiện** |
| 15 | `drowned_mire_depths` *(Đầm Lầy Chìm)* | L3 | `(2880, 740, 1120×640)` | 12 | **Trống rỗng**: sàn bùn lặp, `0` cây/props | Cửa thông `to_drowned_mire_depths` từ Bắc bị lỗi `W05` (`4px` OOB + gating im lặng) | **Chưa hoàn thiện** |
| 16 | `sunken_crypt_ruins` *(Hầm Mộ Cổ Ngữ)* | L3 | `(3350, -640, 1130×640)` | 11 | **Trống rỗng**: sàn gạch xám trơn lặp lại, `0` props/tường hầm mộ | Chưa có kiến trúc crypt; cửa nối về `ancient_rune_puzzle` thiếu cổng cảnh quan | **Chưa hoàn thiện** |
| 17 | `veil_origin_cavern` *(Hang Cội Rễ Hư Vô)* | L3 | `(480, 1440, 1120×640)` | 13 | **Trống rỗng**: chỉ có nền tối cơ bản, `0` thạch nhũ/rễ/ánh sáng | Cổng vào từ `sub_root_cellar` lố biên `4px` | **Chưa hoàn thiện** |

---

## 3. Phân Loại 15 Nguyên Nhân Gây Tường Vô Hình & Kẹt Collider (§5)

| # | Phân loại nguyên nhân | Cơ chế kỹ thuật đã xác minh trong `HOLLOW WOODS` | Vị trí điển hình thực tế | Hướng khắc phục chuẩn `2.0` |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Atlas Mispack + Origin Tâm (`0.5, 0.5`)** | `prop_fallen_log_mossy_v14` là cây tím `46×61`, dùng `origin(0.5,0.5)` khiến hộp đỏ nằm trên ngọn lá | `20` điểm từ `fog_crossing` tới `broken_bell_shrine` (`W20-BUG-001`) | Loại bỏ frame mispack; tách riêng `Tree_Trunks` (collider chân) và `Tree_Canopies` (`depth > player`) |
| 2 | **Tường tự động chồng chéo ranh giới vùng** | `AutoPerimeterWallsModule` sinh tường `32px` cho zone cha bất chấp zone con lồng vào trong | `sub_whispering_clearing` bị `auto_south_whispering_grove_sanctum` chặn (`MAP-BUG-001`) | Không bao giờ lồng 2 zone `bounds` có cùng auto-perimeter; tách tọa độ độc lập hoặc tắt auto-wall |
| 3 | **Collider `zones.json` lệch khỏi Sprite Render** | `zones.json` định nghĩa tọa độ cây cũ, `WorldBuilder` dời sprite đi nơi khác | `fog_tree_1 (160, 100)` vs `(160, 65)`; `fog_tree_2 (300, 240)` vs `(300, 310)` | Chỉ sinh collider tự động từ chính Tiled Object Layer / Tree Trunk registry (1 nguồn chân lý) |
| 4 | **Physics World Bounds kẹp chân ở mép trên** | `physics.world.bounds.y = -640` + `footOffset 18px` giữ `footPos >= -622` | `deep_forest -> abyssal_chasm` (`HW-H4-03-AUDIT`, `W02`) | Mở rộng đệm `physics.world.bounds` tối thiểu `±64px` ngoài `zoneBounds` & chỉnh `triggerRect` |
| 5 | **Hộp chữ nhật lớn bao vùng nước elip/cong** | Dùng `fillEllipse` thị giác nhưng đặt `StaticBoxCollider` `0.75w × 0.65h` vuông góc | `createMireWater` `(3020, 380)`, `(3180, 140)`, `(3600, 430)` | Chia lưới bờ nước `32×32 px` hoặc polygon/tổ hợp tile bám sát đường cong bờ |
| 6 | **Thanh tường biên dài ẩn (`535–900px`) thưa cây** | Gom toàn bộ viền rừng thành 1 hộp chữ nhật dài `900px` đặt trước hàng cây thưa | `Rặng Cây Khô Viền * Silent Mire / Miếu Chuông` (`detached` `46–120px`) | Dựng hàng cây/vách đá khép kín liên hoàn dọc tường, hoặc khớp 1:1 theo cụm tile `32×32` |
| 7 | **Tường biên lồng 2–3 lớp tại đường nối zone** | Cả `zones.json` và `AutoPerimeterWallsModule` cùng sinh tường ở hai phía seam `±16px` | `fog_crossing <-> bellhollow`, `crooked_path <-> outer_woods`, `silent_mire <-> shrine` | Xóa `bound_*` thủ công dư thừa; để 1 đường ranh chuẩn có khe cổng rộng hơn trigger `+16px` mỗi bên |
| 8 | **Đặt Spawn ngay trên tường biên** | `defaultSpawn.x` trùng đúng `x` của tường ranh zone kế cận | `whispering_grove_sanctum` spawn `(1600, -420)` trúng `df_bound_left` (`1600`) | Mọi `defaultSpawn` và `targetSpawn` phải cách collider gần nhất `>= 48px` (kiểm tự động) |
| 9 | **Đạo cụ & Biển báo chặn ngang Trigger Portal** | `createStoneSign` / `createAncientBrazier` / `createTree` đặt lọt vào lòng `triggerRect` | `Đèn Đá (3362, 247)`, `Gốc Cây (1161, 576)`, `Biển (2093, 38)`, `Cột (1801/1867, -47)` | Thiết lập **Vùng Cấm Vật Thể (`48px` bán kính)** quanh toàn bộ `triggerRect` cổng |
| 10 | **Vật thể xếp chồng (`Stacking < 16px`) tạo góc kẹt** | Nhiều lệnh đặt prop/cây/rương trùng hoặc cách `< 12px` sinh góc nhọn AABB | `outer_woods (1445..1450, 650)`, `deep_forest (2340,-490)`, `(1974,-70)`, `(2100,-340)` | Kiểm tra khoảng cách tối thiểu giữa các collider `>= 36px` (cho thân Player `18px` lách thoải mái) |
| 11 | **Prop đặt giữa trục đường chính khu an toàn** | Đặt Lều + Đèn + Rương chắn giữa đường thẳng Tây-Đông của làng | `bellhollow (759, 255)` làm fail kiểm thử đi thẳng `W01` | Quy hoạch trục giao thông chính (`Road Spine`) rộng `72–96px` không vật cản |
| 12 | **Hàng rào đâm xuyên thân cây / bụi rậm** | Hàng rào dựng theo tọa độ cứng cắt ngang qua tọa độ gốc cây biên | `sanctuary_farm (505, 840)` | Sinh cây và hàng rào trên cùng lưới quy hoạch `32×32`, tách cách nhau tối thiểu `1 tile` |
| 13 | **Cổng chặn khóa tiến trình im lặng (`Velocity 0`)** | Khi vùng đích khóa, `executeTransition` triệt tiêu vận tốc ngay trong khe mở trống | `silent_mire -> drowned_mire_depths` (`y=734.4`, `W05`) | Vùng khóa luôn phải có **cổng/phong ấn thị giác + collider chặn rõ ràng**, không chặn im lặng trên mặt đường trống |
| 14 | **Vật thể `Graphics` không có collider hoặc lệch chân** | Hình vẽ trực tiếp bằng `Phaser.Graphics` không chia frame sprite nên dễ quên collider hoặc đặt sai | `sub_root_cellar` trụ giữa phòng, `sub_whispering_clearing` 3 cột tím | Cấm hoàn toàn dựng cây/cột/nhà bằng `Phaser.Graphics`; chuyển 100% sang Tile/Sprite thật |
| 15 | **Hàng cây sát tường biên không collider (nhưng dưới cỏ có tường ẩn)** | Đặt cây trang trí `withCollider=false` phía trước tường biên vô hình `y=620` | `crooked_path` viền Nam (`(2020, 620)`) | Thống nhất cây viền là tường tự nhiên (bật collider gốc `24×12`), đặt sát mép `bounds` |

---

## 4. Định Hướng Mỹ Thuật & Kế Hoạch Tích Hợp Bộ Tài Nguyên Mới (§6 & §7)

Áp dụng nguyên tắc **không trộn phong cách xung đột**, kế thừa thành công từ **[LAB_01_RESURRECTED_FOREST](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md)** (`60.05 FPS`, `8 draw calls`, `58` collider gọn thân gốc, tách `Tree_Trunks` & `Tree_Canopies`), toàn bộ `17` phân khu sẽ chuyển sang pipeline bản đồ lưới **`32×32 px`** (TMJ/TMX có thể chỉnh trực tiếp bằng Tiled Map Editor):

| Nhóm Khu Vực | Bộ Tài Nguyên Chính (`HOLLOW_WOODS_EXPORT`) | Vai Trò & Dấu Ấn Thẩm Mỹ (Khớp Trailer V12.2) |
| :--- | :--- | :--- |
| **Làng & Nông Trại (`bellhollow`, `sanctuary_farm`, `sub_bell_workshop`)** | **`Serene Village Revamped v1.9`** + **`Houses Pack`** + **`Grass Land 2.0`** | Làng trung cổ ấm áp, đường lát đá cuội tự nhiên dẫn thông 4 hướng, nhà ngói gỗ có hàng rào thoáng, giếng đá cổ, ánh đèn hổ phách tương phản với rừng tối bên ngoài. |
| **Rừng Sương Mù & Rừng Ngoại Vi (`fog_crossing`, `outer_woods`, `crooked_path`)** | **`Resurrected RPG 1.1` (Immunity)** (`Plants.png`, `Grass.png`, `Wall.png`, `Props.png`) + **`EPIC RPG World - Grass Land 2.0`** | Rừng rêu cổ thụ nhiều tầng tán (che thân khi nhân vật đi sau), lối mòn đất uốn lượn rộng rãi (`96px`), tàn tích cổng đá rêu phong, khoảng rừng thưa rõ rệt để chạy & chiến đấu. |
| **Rừng Sâu & Thánh Địa (`deep_forest`, `sub_whispering_clearing`, `whispering_grove_sanctum`)** | **`Resurrected RPG 1.1` (Ruined Walls)** + **`EPIC RPG World - Ancient Ruins`** + **`DarkFantasy FREE Starter`** | Phế tích cột đá vỡ, tượng hiệp sĩ rêu, trận địa đá thì thầm chuyển màu sương lam-tím êm mượt (không cắt mảng chữ nhật), lối rẽ 2 chiều rõ ràng. |
| **Đầm Lầy & Miếu Chuông (`silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`, `drowned_mire_depths`)** | **`Dead Swamp`** + **`Mangrove Swamp Sampler`** + **`Resurrected RPG` (`Wall.png`/`Props.png`)** | Vùng bùn ngập mặn, cầu gỗ mục bắc qua bờ lầy (collider bám sát bờ nước), cột cổ ngữ đá thật, Miếu Chuông Phế Tích hoành tráng nối mượt xuống Đầm Lầy Chìm. |
| **Hầm Mộ, Hang Ngầm & Vực Thẳm (`sub_root_cellar`, `sunken_crypt_ruins`, `veil_origin_cavern`, `abyssal_chasm`)** | **`RF Catacombs v1.0`** + **`Kauzz Cave Tiles & RPGW Caves`** + **`TF DarkDimension`** + **`Resurrected portal-Sheet.png` (29f)** | Hầm rễ đá thật thay thế 100% vector placeholder, hầm mộ có đuốc/bậc thang đá, Cổng Hư Không `portal-Sheet` phát sáng dẫn vào Vực Sâu Bóng Tối. |
| **World Map UI `[M]` (`ParchmentWorldMapModal`)** | **`Pocket Inventory Series #2 Pixel Map`** | Đồng bộ đầy đủ `17/17` phân khu, vị trí địa lý chính xác và kết nối `ZoneConnectionRegistry` theo kiến trúc World 2.0. |

**Cam kết bảo tồn P0:**
- Tuyệt đối không động chạm tới Black Knight (`public/assets/characters/black_knight/`, scale `1.50` / `1.20`, hitbox `18×12`), NPC, quest, thoại, Sanity 2.1, Lantern `[F]`, boss logic và **89/89 archive gốc**.

---

## 5. Lộ Trình Triển Khai Tái Thiết Theo Đợt (`HW-WORLD-20B` .. `20F`) (§8)

Mỗi đợt là một checkpoint độc lập, giữ nguyên gameplay và đều kết thúc bằng kiểm thử bàn phím thật `WASD` + đo GPU thực `GTX 1070 Ti` + đối chiếu ảnh `BEFORE/AFTER`:

1. **`HW-WORLD-20B` — Đợt 1 (P0 Foundation + Starter Corridor):**
   - Tích hợp loader đọc trực tiếp TMJ/TMX `32×32` + tách layer `Tree_Trunks` / `Tree_Canopies` vào hệ thống World Pipeline.
   - Triệt tiêu `W20-BUG-001` (`prop_fallen_log` mispack), sửa toàn bộ `bounds` chồng chéo & `3` OOB triggers trong `zones.json`.
   - Tái thiết hoàn chỉnh **`fog_crossing`**, **`bellhollow`**, **`sanctuary_farm`**, **`outer_woods`** (đảm bảo `W01` và `W03` thông suốt 100%, không còn triple-overlap Trạm Kiểm Lâm).
2. **`HW-WORLD-20C` — Đợt 2 (P0 Navigation Crisis: Frontier & Ruins):**
   - Tái thiết **`crooked_path`**, **`deep_forest`**, **`sub_whispering_clearing`**, **`whispering_grove_sanctum`**.
   - Sửa dứt điểm **`MAP-BUG-001`**, **`MAP-BUG-002`**, **`HW-H4-03-AUDIT`** (`W02`), tách các cụm stacked props, mở đường 2 chiều `sub_whispering_clearing <-> crooked_path`.
3. **`HW-WORLD-20D` — Đợt 3 (Mire & Ancient Shrine):**
   - Tái thiết **`silent_mire`**, **`ancient_rune_puzzle`**, **`broken_bell_shrine`** bằng `Dead Swamp` + `Mangrove` + `Resurrected Ruins`.
   - Sửa triệt để vũng lầy hộp vuông, thay toàn bộ trụ/đèn/bia vector, khắc phục **`W05`** có rào cổng trực quan.
4. **`HW-WORLD-20E` — Đợt 4 (Underground & 5 Expansion Zones):**
   - Thay thế 100% vector placeholder ở **`sub_root_cellar`** và dựng hoàn thiện **`sub_bell_workshop`**, **`abyssal_chasm`**, **`drowned_mire_depths`**, **`sunken_crypt_ruins`**, **`veil_origin_cavern`**.
5. **`HW-WORLD-20F` — Đợt 5 (World Map `[M]` Sync & Final QA Gate):**
   - Cập nhật `ZoneConnectionRegistry` & `ParchmentWorldMapModal` đủ `17/17` vùng (`MAP-BUG-005..008`, `H4-NEW-05`).
   - Chạy toàn bộ regression suite (Phaser gameplay, save schema v3, audio/timer lifecycle, full 17-zone WASD walkability & GTX 1070 Ti benchmark).

---

## 6. Mốc Đối Chiếu Hiệu Năng GPU Thực (`GTX 1070 Ti` Baseline — §9)

Đo trực tiếp trên `ANGLE (NVIDIA GeForce GTX 1070 Ti Direct3D11 vs_5_0 ps_5_0)`, cửa sổ `1280×720`, VSync bật, `camera.zoom = 2.2`, thời lượng đo liên tục `3.0 giây`/khu vực:

| Phân khu đo (`BEFORE`) | Avg FPS | Min FPS | 1% Low FPS | P95 Frame Time | Avg Draw Calls | Display Objects | JS Heap (MB) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`bellhollow`** | `59.76` | `30.12` *(spike)* | `58.48` | `16.9 ms` | `90.1` | `1201` | `263.75` |
| **`outer_woods`** | `60.06` | `58.48` | `58.82` | `16.9 ms` | `78.0` | `1201` | `258.41` |
| **`silent_mire`** | `60.06` | `59.17` | `59.17` | `16.8 ms` | `67.0` | `1202` | `258.56` |
| **`deep_forest`** | `60.28` | `58.82` | `59.17` | `16.8 ms` | `72.0` | `1201` | `264.29` |
| **`sunken_crypt_ruins`** | `60.19` | `58.82` | `59.17` | `16.8 ms` | `39.0` | `1201` | `259.13` |

### Ngưỡng Ngân Sách Bắt Buộc Khi Tái Thiết 2.0:
- **Avg FPS:** `>= 59.5 FPS` trên GTX 1070 Ti (khóa VSync 60 Hz); **1% Low FPS:** `>= 58.0 FPS` (triệt tiêu spike `30.12 FPS` ở `bellhollow` bằng atlas batching chuẩn `LAB-01`).
- **Draw Calls:** Giữ `<= 120` draw calls/frame ở khu làng phức tạp nhất và `<= 60–80` ở các phân khu rừng (nhờ gom spritesheet/atlas theo từng zone theme).
- **Camera Culling & Zone Hibernation:** Tiếp tục dùng cơ chế ẩn thực thể xa ngoài viewport để tổng đối tượng vẽ đồng thời luôn ổn định.

---

## 7. Hồ Sơ Bằng Chứng Kèm Theo (`HW-WORLD-20A`)

1. 📄 [HW_COLLISION_AUDIT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-WORLD-20/HW_COLLISION_AUDIT.json)
2. 📄 [HW_WORLD_20_MAP_BUG_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_MAP_BUG_REGISTRY.md)
3. 🖼️ Bộ ảnh `13` phân khu `BEFORE_OVERVIEW` & `BEFORE_COLLISION_OVERLAY` (`F9` thật) tại [Visuals/HW-WORLD-20/](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-WORLD-20/):
   - `fog_crossing`, `bellhollow`, `sanctuary_farm`, `outer_woods`, `crooked_path`, `silent_mire`, `ancient_rune_puzzle`, `deep_forest`, `sub_whispering_clearing`, `sunken_crypt_ruins`, `broken_bell_shrine`, `abyssal_chasm`, `sub_root_cellar`.
