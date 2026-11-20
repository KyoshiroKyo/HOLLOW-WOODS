# HOLLOW WOODS V1.5.3 — 04B2 · Đồ họa môi trường và bố trí thế giới

**21/11/2026 · PARTIAL · PRODUCTION LOCAL PASS cho các ca đã liệt kê · HOSTED BLOCKED**

Nhánh bàn giao `feat/v1.5.3-batch04`. Checkpoint đầu `666ee8dfc16852c3bea8eb42cb2385b50caf2c0b`. Mã runtime được build và thử tại `d1e1adf4e4bbc4572285fa52b4eb758c46ce595c`. Các commit tài liệu và bằng chứng nối tiếp mã runtime trên cùng nhánh. Worktree dùng cho batch là `/workspace/work/v153-b04/checkout`. Chromium 156.0.8078.79 trên Linux chạy bản build Vite cục bộ với profile riêng và SDK dự phòng. F9 chạy trên build QA riêng. [Checkpoint](V153_BATCH_04_CHECKPOINT.md) · [Registry](V153_TESTER_BUG_REGISTRY.md) · [Ảnh và log](Visuals/V153_B04B2)

## 1. Trạng thái trước và sau

| Mã | Trước → sau | Tái hiện, nguyên nhân và sửa |
|---|---|---|
| TASK 01 / B04-05 | OPEN → PARTIAL | Phủ texture đường Nam–Farm theo cùng lưới thế giới. Thay luống trang trí đè lên đường, kho và đạo cụ Farm, tàn tích tại Workshop và các đồ gỗ/đá tại Outer Woods bằng tile hoặc sprite có sẵn. Đã thử khu demo. Còn rà từng cây, đá, mép đường và culling ở các vùng chưa đi thực địa. |
| B04-05A | OPEN → PARTIAL | Xác nhận nguồn TX Wall trong archive khớp SHA với bản runtime và có giấy phép đã duyệt trong registry dự án. Đã kiểm kê nhóm nguồn được chỉ định. Chưa tìm được bản `Resurrected RPG 1.1.rar` trong Git và chưa sử dụng gói đó. |
| B04-06 / CLOUD-FIX-03 | OPEN → PARTIAL | Đã thử chân nhà, bàn rèn, biển Nam và hai trại ưu tiên. Chưa nghiệm thu từng cầu, hàng rào, giếng, cửa đền và công trình bỏ hoang ở toàn bản đồ. |
| B04-06 / Outer Woods | OPEN → CLOSED-VERIFIED local cho phân biệt và tương tác hai bếp | Bếp Thợ Săn vẽ lửa cháy dù mô tả là tro nguội, sprite và collider lệch (18,15). Bếp Vaelen có hai điểm tương tác cùng ID do vừa đọc JSON vừa push từ renderer. Thợ Săn dùng sprite bếp tắt và khớp tâm logic. Vaelen giữ bếp cháy, một trigger từ zones, và tác dụng +15 Tinh Thần/lần kích hoạt. Đã đi nối hai trại. |
| B04-06A / BUG-034 | OPEN → CLOSED-VERIFIED local cho nhà rèn và luồng E | Hai mảng xám nằm trong PNG gốc. Atlas bàn rèn đã có nhưng sprite/body/action dùng các tâm khác nhau. Ghép tường đá và ô thông gió từ TX Wall vào bản phái sinh, giảm tỉ lệ sprite Bram còn 0,82, tách bàn khỏi Bram và dùng một nét khối chân. Hiệu ứng lò dùng đúng vị trí miệng lò và tween alpha tại chỗ. |
| B04-06B-01 / BUG-044 | OPEN → CLOSED-VERIFIED local cho hành lang Nam và biển | Điểm đọc biển ở (650,520) từng đứng giữa đường mà thiếu sprite. Hai mảng nâu là luống trang trí của Neris vẽ bằng Graphics. Dời luống ra ngoài hành lang, đặt biển gỗ tại lề và đồng bộ tâm tương tác. Dải tile đất nối cùng pha ở y=560. Đã đọc biển bằng E từ phía làng và phía Farm, chạy xuống Farm và đi ngược lại. |
| B04-06B-02 / BUG-045 | OPEN → CLOSED-VERIFIED local cho bố trí Garth/trạm | Nhà cũ và cụm dấu mốc sát đầu trục Tây. Lùi trạm về phía Bắc, dời biển, đèn, sân và quầng sáng tương ứng. NPC lấy tọa độ từ zones. Đã đến từ cả hai phía, mở hội thoại và chạy qua cổng Tây cả hai chiều với camera rotation 0. |
| B04-06B-03 / BUG-046 | OPEN → CLOSED-VERIFIED local | GameScene và zones từng khai báo Finn riêng, cùng vị trí gameplay (660,280); biên tuần tra và đích BFS cũng cố định. Dùng zones làm nguồn spawn. New Game và Continue đều có chân Finn (909,231), tuần tra [901,914], Tiled y=216 theo offset -15. E mở `finn_rumors` theo trạng thái phiên thử. |
| B04-06B-04 / BUG-047 | OPEN → CLOSED-VERIFIED local | F9 nhận diện cột đèn trang trí (900,335), cách tâm sprite bếp cũ khoảng 24 px. Gỡ đúng lời gọi tạo cột nên cùng mất sprite, quầng sáng, hai tween và body. Giữ cột (780,250), lều, rương, giếng và bếp gameplay. Bếp/lều/rương có điểm tiếp cận riêng. Nạp củi ban đêm giảm 2 → 1 và tăng đúng 90 giây sau một click. |
| B04-06B-05 / BUG-048 | OPEN → BLOCKED | Các bụi gần nhà Edda dùng cùng texture, không có ID sản xuất riêng. Thấy (1048,94), (1084,162), (1204,204) và còn bụi xa hơn. Cần Owner chỉ đúng hai tọa độ trong ảnh đối chiếu. Giữ toàn bộ bụi, trigger và collider. Đã đi tới và nói chuyện với Edda. |
| B04-06B-06 / BUG-049 | OPEN → PARTIAL | Logic đo khoảng cách từ tâm đã đăng ký, còn outline cộng nửa kích thước hai lần qua bước chọn tâm và vẽ ellipse. Đã thống nhất điểm neo cho world prop và resource, khớp biển Nam, bếp, lều, rương, sồi và bàn. E đã kích hoạt đúng action ở các điểm đo. Chưa đi qua từng interactable/biến thể despawn toàn bản đồ. |
| B04-06B-06 / BUG-050 | OPEN → CLOSED-VERIFIED local | `env_ancient_oak_hollow` hoạt động nhưng renderer đặt nấm phát sáng ở tọa độ đó. Dùng frame `tree_hollow_ancient_v14` nguyên bản, body chỉ ở gốc. E vẫn mở manh mối và cờ khám phá còn sau Continue. |

Đã dùng kết quả 04B1 cho camera Tây, an toàn Farm, ba TSX và nền Workshop. Giữ bằng chứng K1 cho Armed Idle 24 frame và các ca 04A đã đóng. Chỉ thử hồi quy trên các tuyến bị ảnh hưởng. Các lỗi Cổng Đông/nhiệm vụ BUG-051–054 ở 04C-G, animation K2/K3, âm thanh 04D, UI 04E1, hiệu năng 04E2 và gate phát hành 04F vẫn trong hàng chờ R10.

## 2. Tọa độ, footprint và tác động

| Vùng / ID | Tọa độ cũ → mới | Sprite, body hoặc logic |
|---|---|---|
| Bellhollow / trạm Garth | (510,175) → (562,160) | `gatehouse_garth`. Body (462,143,96,32) → (514,128,96,32). Biển (560,194) → (600,205), đèn (482,195) → (514,183). |
| Bellhollow / `npc_garth` | chân (490,210) → (540,205) | Patrol 482–498 → 532–548. Tiled object 21 (540,190). `garth_warning` và luật Cổng Đông giữ nguyên. |
| Bellhollow / `npc_finn` | chân (660,280) → (909,231) | Tiled object 25 (909,216), body runtime 22×14. Anchor local (0,0), origin sprite (0.5,1). Bảng tin độc lập giữ tại (650,240). |
| Bellhollow / `npc_bram`, `village_crafting_bench` | Bram (1230,405). Action bàn (1220,370) → (1292,383) | Bàn gốc đã vẽ tại (1238,379). Body runtime cũ (1214,373,48,14) → (1272,377,40,12), Tiled đồng bộ. Body nhà (1193,328,154,32). Recipe, thưởng và dialogue key giữ nguyên. |
| Bellhollow / `bellhollow_farm_gate_sign` | (650,520) → (695,511) | `prop_signpost_wood`, body (688,504,14,10), action `inspect_farm_gate`. Trục đường xuống Farm giữ x=650. Luống trang trí đổi từ (655,480) sang (765,477). |
| Bellhollow / trung tâm, lều, rương, nồi | Lửa thân (878,325) → (860,310). Lều giữ thân (778,261), action (760,255) → (778,261). Rương (789,305) → (775,295). Nồi (642,451) → (630,445). | Giữ CampSystem, nhiên liệu, Safe Zone và Save ID. Bỏ đèn (900,335) cùng body (895,330,10,8). |
| Bellhollow / `env_ancient_oak_hollow` | (760,120) | Collider (751,111,18,10), giữ ID và `inspect_ancient_oak_hollow`. |
| Outer Woods / `ow_hunter_camp`, `quiet_forest_bonfire` | Thợ Săn body (1338,735) → (1320,720). Vaelen (1470,710) | Hai body 24×16. Tâm trigger đã khác nhau. Vòng 180 px của Vaelen giữ nguyên và phủ một phần đường nối trại. Lều (1365,694), rương và bụi ẩn nấp giữ chức năng hiện hữu. |
| Farm / kho, bàn sơ chế và vườn dược | Kho chân (590,730), bàn (702,629) | Dùng sprite/tile đã có. Giữ footprint kho (544,708,92,22) và bàn (686,624,32,10). Các ô do FarmingSystem quản lý giữ nguyên. |
| Xưởng Chuông / góc bàn và phế liệu | Bàn (1340,1217), đá (1440,1233) | Prop trang trí dùng lại atlas và Y-sort theo chân. Nhật ký giữ (1420,1200). Giữ nền và camera của 04B1. |

## 3. Tệp và nguồn artwork

- `src/world/WorldBuilder.ts` cập nhật đường, sprite, điểm neo, culling/footprint và hai trại. `src/scenes/GameScene.ts` hợp nhất nguồn NPC làng và sửa cách vẽ outline. `src/types/index.ts` chứa hợp đồng `NPCSpec`; `src/entities/NPCEntity.ts` chỉnh tỉ lệ hiển thị Bram.
- `src/data/zones.json` và `src/data/maps/bellhollow.json` đồng bộ tọa độ. `scripts/audit_map_reachability_and_assets.mjs` lấy đích NPC từ zones và mô phỏng kích thước/origin sau `refreshBody` đúng API Arcade. Giữ assertion về vị trí, route và collider. Kết quả mock cũ 66/73 phụ thuộc body mặc định 32×32; dùng runtime để đánh giá va chạm thực.
- Asset mới duy nhất là `public/assets/buildings/smithy_workshop_bram_stone.png`, RGBA 176×148, 7.318 byte. Giữ PNG gốc và texture key `smithy_workshop_bram`. `src/scenes/PreloadScene.ts` đổi file đích và `ASSETS_MANIFEST.json` ghi đủ hai bản. Ghép vân đá từ `TX Tileset Wall.png` crop (48,209)–(80,246), ô thông gió từ (196,215)–(219,240). Chỉ thay điểm màu xám bên trong hai panel và giữ mái, lò, đe, giá đỡ, biển, alpha. TX Wall của **Cainos** khớp SHA-256 `9c32a07a940e23352dd43a92f724480fedf0cd43edd530219d6e29801e9cc2bb` giữa archive và runtime. [Giấy phép đã duyệt](../../V1.0/Asset_Registry/ASSET_LICENSES.md)
- Tile đường `public/assets/environment/tiles/tile_dirt_trail.png`, tile luống `environment/v14/tiles/tile_tilled_soil_v14.png`, cùng atlas `hollow_props_atlas` có frame `crafting_bench`, `tree_hollow_ancient_v14`, `prop_crate_weathered_v14`, `rock_large_mossy_v14`, `prop_barrel_aged_v14` và `prop_fallen_log_mossy_v14`. Dùng lại `ranger_cabin_wood.png`, `prop_wayfarer_tent.png`, `prop_signpost_wood.png`, `campfire_unlit.png` và `campfire_tier2.png`.
- Nguồn kho xác nhận bằng file Git và registry. Updated-Trees và Forest-Asset-Pack có archive và nguồn đã trích. Fan-tasy có archive nguồn. Không thêm frame từ ba gói đó trong 04B2. Có N3XUS, Goblin Scout, Shadow, UI Pack, Black Knight và thư mục âm thanh theo nhóm sở hữu. Chỉ dùng artwork môi trường cho cảnh; không nhập nhân vật, quái, UI hoặc âm thanh mới trong batch.
- Hồ sơ thay đổi gồm báo cáo này, checkpoint, bug registry, báo cáo triển khai tổng hợp, README_INDEX và thư mục ảnh/log. Hai bản P2Game manifest, mã SDK, Save schema 3, ID gameplay và atlas K1 giữ nguyên. Không có file đã theo dõi nào bị xóa khỏi Git.

## 4. Kiểm thử và bằng chứng

| Phép thử | Kết quả |
|---|---|
| `npx tsc --noEmit`, `git diff --check` | Exit 0. |
| `npx vite build --outDir /workspace/work/v153-b04/b2/site-handoff --emptyOutDir` | Exit 0. Build Vite local, không đóng gói release. |
| `node scripts/audit_map_reachability_and_assets.mjs` | 73/73 trên mock đã đồng bộ kích thước. |
| `node scripts/verify_data_integrity.mjs` | 15/15. |
| `node scripts/verify_zero_404_assets.mjs` | 212 tham chiếu hợp lệ, 0 thiếu. |
| `node scripts/test_v153_save_schema3.mjs` | Hai nhóm PASS, gồm tương thích ID, farming, local round-trip và cách ly Dev khỏi Save/SDK. |
| Chromium production local | 6/6 lượt chuyển vùng, 10/10 lượt action map, 5/5 lượt hội thoại, thêm củi và hai ca Continue. `W/A/S/D`, Shift và E bằng input bàn phím. Fixture đặt điểm bắt đầu cho từng ca, sau đó dùng phím thật với Noclip OFF. Camera và trigger được đọc từng frame. Developer Mode dùng riêng để kiểm tra hiển thị. |
| Chromium Save/Continue | Dùng Pause → Save, reload và Continue. Schema 3, Bellhollow (953,247), cờ sồi còn, Finn có một instance tại home sau tải, Cổng Đông vẫn khóa. Save schema 3 từ build 04B1 tại (750,260) tải tại đúng điểm và đi được bằng phím. |
| Console / network | Số liệu ở log runtime. 0 lỗi JS hoặc HTTP. Bản chốt chỉ có cảnh báo SDK dự phòng. Bản thử song song trước đó có cảnh báo tự hạ chất lượng trong headless. Chưa đo hiệu năng thiết bị thật. |

### Bàn phím và camera

- Fog Crossing → Bellhollow `to_bellhollow`, Bellhollow → Fog Crossing `to_fog_crossing`.
- Bellhollow → Sanctuary Farm `to_sanctuary_farm` chạy Shift+S; chiều ngược `to_bellhollow_from_farm`.
- Outer Woods → Workshop `to_bell_workshop`, Workshop → Outer Woods `to_outer_woods_from_bw`.
- Hai lối bên nhà rèn đi bộ từ y≈398 lên y≈303. Cả hai hướng đến Garth đều mở đúng hội thoại. Lượt thử đi ngang vào thân trạm dừng ở collider như dự kiến; đi vòng từ (493,186) qua (493,94), (681,94) tới (681,216). Đường nối hai trại đi từ (1349,773) đến (1430,748).
- Mỗi tuyến chuyển vùng qua đúng một transition, rotation 0. F9 kiểm tra hitbox, sprite và tọa độ, sau đó tắt. Bằng chứng QA trước dùng build QA đã lưu từ 04B1; cặp ảnh thường dùng build production baseline.

### Ảnh và log

- [Bảng ảnh trước/sau và ảnh F9](Visuals/V153_B04B2/README.md)
- [Từng ca bàn phím, camera, action, Save và console](Visuals/V153_B04B2/runtime.json)
- [Log Object Picker](Visuals/V153_B04B2/object-picker.json) · [Save từ 04B1](Visuals/V153_B04B2/legacy-continue.json) · [Lượt thêm củi](Visuals/V153_B04B2/camp-fuel.json)

## 5. Phần còn mở và bàn giao

Tiếp tục 04B2 khi Owner xác nhận hai bụi bằng tọa độ/ảnh, hoặc khi có ca tái hiện mới. Giữ B04-05/06 và BUG-049 PARTIAL cho culling, depth, footprint và interactable toàn bản đồ. Cần đi thực địa qua tuyến khóa bằng tiến trình hợp lệ. 04B1 đã ghi 25 đích khóa và các rủi ro bản đồ. Không thay điều kiện Cổng Đông để truy cập tuyến khóa.

Bản trình diễn cục bộ chưa qua gate phát hành. Hosted P2Game chưa thử. `main` đối chiếu `b5eaa612f7011b7d9fdc657d31310082d08f281b`, QA cũ `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`. Bàn giao trên nhánh phát triển riêng. Sau nghiệm thu riêng của Owner, command kế tiếp theo INDEX là `V153-BATCH-04C-K2 EXECUTE REMAINING ONLY`.
