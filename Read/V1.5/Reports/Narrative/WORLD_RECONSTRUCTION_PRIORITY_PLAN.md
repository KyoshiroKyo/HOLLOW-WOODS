# HOLLOW WOODS — WORLD RECONSTRUCTION 2.0 PRIORITY PLAN (`17` ZONES)

- **Mission:** `HW-NARRATIVE-00C — WORLD BIBLE & MAP RECONSTRUCTION PLANNING`
- **Primary References:**
  - [WORLD_AND_MAP_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/WORLD_AND_MAP_REGISTRY.md)
  - [HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md) (`HW-WORLD-20B..20F`)
  - [HW_WORLD_20_MAP_BUG_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_MAP_BUG_REGISTRY.md) (`W20-BUG-001..012`, `HW-H4-03-AUDIT`, `MAP-BUG-001..012`)
  - [HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md) (Tham chiếu kỹ thuật `LAB-01`: `32×32`, `Tree_Trunks`/`Tree_Canopies`, `60.05 FPS`, `8` draw calls)
  - [HW_H4_06_PERFORMANCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_06_PERFORMANCE_REPORT.md) (`59.90 FPS` VSync / `173.45 FPS` uncapped trên `GTX 1070 Ti`)
  - [HW_TILESET_COMPATIBILITY_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TILESET_COMPATIBILITY_MATRIX.md)
- **Nguyên tắc khóa an toàn (§4):** Không sửa production source trong `00C`; không tạo zone mới; không di dời vị trí tương tác của NPC, quest objects hay trigger chính phá hỏng quest `A→E→B→D→F→E→C→A` và Save Schema `3`; sử dụng `LAB-01` làm chuẩn kiến trúc layer chứ không coi FPS prototype là FPS toàn map.

---

## 1. Thứ Tự Ưu Tiên Toàn Cục (Sửa Bug Trước, Đẹp Hóa Đồng Bộ Sau)

1. **P0 — Triệt tiêu Tường Vô Hình, Kẹt Portal & Chồng Chéo Bounds:**
   - Gỡ `20` instance `prop_fallen_log_mossy_v14` (`W20-BUG-001`).
   - Sửa `6` cặp `bounds` chồng nhau, `1` spawn trong tường (`whispering_grove_sanctum`), `3` OOB triggers, `14` collider-transition overlaps, `HW-H4-03-AUDIT` (`physics.world.bounds`), `MAP-BUG-001`, `MAP-BUG-002`.
2. **P1 — Khơi Thông Giao Thông, Tách Cụm Vật Thể & Thay Vector Placeholder:**
   - Mở thông trục Tây–Đông `bellhollow` (`W20-BUG-002`), gỡ `Triple Stack` tại `outer_woods` (`W20-BUG-006`) và cụm `5` lớp tại `deep_forest` (`W20-BUG-004`).
   - Chuẩn hóa đường đi rộng `72–96 px`, khoảng cách giữa collider >= `36 px` (gấp đôi foot hitbox `18×12`), vùng đệm `48 px` quanh toàn bộ `triggerRect`.
   - Thay 100% `Phaser.Graphics` placeholder (`sub_root_cellar`, cột `sub_whispering_clearing`, vũng nước `silent_mire`) bằng TMJ `32×32` + tách `Tree_Trunks` (`depth = y`) / `Tree_Canopies` (`depth = y + 0.5`).
3. **P2 — Hoàn Thiện `5` Phân Khu Trống & Đồng Bộ World Map `[M]` + `ZoneConnectionRegistry`:**
   - Lấp kiến trúc cho `abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`.
   - Mở rộng `ZoneConnectionRegistry.ts` (`10 → 17` nodes, `24 → 41` connections) và `ParchmentWorldMapModal.ts` (`10 → 17` zones bằng `Pocket Inventory Series #2`).

---

## 2. Kế Hoạch Tái Thiết Chi Tiết Cho Từng Phân Khu (`17/17` Zones)

### Batch 1 (`HW-WORLD-20B` — Starter Corridor & Village)

#### 1. `outer_woods` *(Pilot Ưu Tiên #1 — Áp Dụng Trực Tiếp Kiến Trúc `LAB-01`)*
- **Giữ nguyên:** Vị trí tương tác cốt lõi của `Sir Vaelen` & bếp lửa `(1435..1470, 710)`, trạm kiểm lâm, rương & bia tưởng niệm (`env_knights_memorial_stele`), lối tắt `shortcut_titan_trunk_outer`, `5` cổng chuyển vùng.
- **Cần sửa:** Gỡ Triple Stack `(1445..1450, 650..662)` giữa cây sồi/rương/nhà kiểm lâm (`W20-BUG-006`); dời gốc cây `(1161, 576)` khỏi `triggerRect` `to_bellhollow_from_ow`; sửa `W20-BUG-001` tại `(1135, 670)`; tách `bounds` khỏi `bellhollow` (`y=560..760`).
- **Asset sử dụng:** `Resurrected RPG 1.1` (`Grass.png`, `Plants.png`, `Props.png`, `Wall.png`) + `EPIC RPG Grass Land 2.0`.
- **Bố cục & Lối đi bảo vệ:** Đường mòn đất `96px` từ Cổng Bellhollow xuống Xưởng Chuông & sang Crooked Path; khoảng sân quang quanh lửa trại Vaelen.
- **Collider & Lore:** Chuyển `34+` cây sang `Tree_Trunks` chân gốc `22–38 × 12–14px`; bảo vệ `env_knights_memorial_stele` & `env_echo_ruins_prayer`.
- **Kiểm thử:** `W03` walkthrough Nam-Bắc + check collider trạm lửa + GPU draw calls `<= 70`.

#### 2. `fog_crossing` *(Pilot #2 — Ấn Tượng 10 Giây Đầu Game)*
- **Giữ nguyên:** `defaultSpawn (120, 195)`, checkpoint Act 0 (`x ≥ 175` & `x ≥ 280`), `The Echo` & `fog_journal_scrap_1`, `fog_sign`, `to_bellhollow`.
- **Cần sửa:** Xóa `fog_tree_1/2` collider rác trong `zones.json` (`W20-BUG-003`); xóa cây xoay `90°` lỗi `W20-BUG-001` ở rào Tây & `(220, 130)`; gộp tường biên `2–3` lớp thành `1` nguồn duy nhất và gỡ chồng `16×60px` trên `to_fog_crossing`; đồng bộ `ZCR` triggerRect với `zones.json`.
- **Asset sử dụng:** `Resurrected RPG 1.1` + lớp sương `fog_smooth` trôi nhẹ kiểu `LAB-01` (giữ `Reduced Motion`).
- **Bố cục & Lối đi bảo vệ:** Lối mòn dẫn thẳng Đông từ `(80, 180)` tới cổng Bellhollow rộng `96px`, hai bên viền cây rêu phân tầng tán.
- **Kiểm thử:** Act 0 `Q00 → Q01`, bypass `W04` (va đúng gốc cây thật thay vì ô trống `(160,100)`).

#### 3. `bellhollow` *(Khu Trung Tâm & Safe Zone)*
- **Giữ nguyên:** `5` NPC (`Garth`, `Edda`, `Neris`, `Bram`, `Finn`), `bell_tower_altar`, `east_gate_barrier`, `camp_central_campfire`, `village_well`, giàn crafting/chế thuốc, `env_ancient_oak_hollow`, `4` cổng chuyển vùng.
- **Cần sửa:** Giải tỏa nút thắt trục chính `y=260` (`W20-BUG-002`): dời `camp_shelter_tent (778,261)` / `camp_storage_chest (775,295)` / đèn lồng về sân trú ẩn phụ phía Nam-Tây; bỏ nấm mọc trên gạch quảng trường; tách seam chồng `bounds` lên `sanctuary_farm` & `outer_woods`; giảm `92` colliders dư.
- **Asset sử dụng:** `Serene Village Revamped v1.9` + `Houses Pack` + `EPIC Grass Land 2.0`.
- **Bố cục & Lối đi bảo vệ:** Trục Tây–Đông (`y=240..300`, rộng `96px`) từ Cổng Tây đến Cổng Đông Garth thông thoáng tuyệt đối; các đường nhánh tới nhà Edda, Bram, Neris, Tháp Chuông rõ ràng.
- **Kiểm thử:** Re-run **`W01_bellhollow_main_road_east` phải PASS**; xóa spike `30.12 FPS` về `1% Low >= 58 FPS`.

#### 4. `sanctuary_farm`
- **Giữ nguyên:** Bàn sơ chế thảo mộc, rương nông trại, giếng nước, biển vườn dược, `to_bellhollow_from_farm`, `to_outer_woods_from_farm`, `to_root_cellar`.
- **Cần sửa:** Dời hàng rào không cắt ngang cây `(505, 840)` (`W20-BUG-005`); giãn cách `>= 40px` cho `3` điểm tương tác `[E]` quanh `(650..702, 625..640)`; thay ao tròn `Graphics` bằng tile nước + collider bờ; đăng ký `to_root_cellar` vào `ZCR`.
- **Asset sử dụng:** `Serene Village Revamped v1.9` + `EPIC Grass Land 2.0`.
- **Kiểm thử:** Kiểm tra từng vùng trigger `[E]` độc lập không đè lên nhau, lối xuống `sub_root_cellar` mượt.

---

### Batch 2 (`HW-WORLD-20C` — Navigation Crisis: Frontier & Ruins)

#### 5. `crooked_path`
- **Giữ nguyên:** Trục lộ chữ S, các điểm ẩn nấp `hiding_spot`, `TheListener` patrol, `FallenKnight` / `DreadHorseman` spawns, `env_elian_unsent_letter`, `env_stone_chessboard`, `4` transitions + nhánh về từ `sub_whispering_clearing`.
- **Cần sửa:** Sửa đôi tường vô hình mép Nam (`W20-BUG-007`) & bật collider chân cho hàng cây biên Nam (`y~570`); dời biển báo `(2093, 38)` khỏi mép `to_deep_forest`; bỏ `bell_bound_east_bottom` đè `to_outer_woods_from_cp`; sửa `3` cây `W20-BUG-001`; mở lối 2 chiều tới `sub_whispering_clearing`.
- **Asset sử dụng:** `Resurrected RPG 1.1` + `EPIC RPG World - Grass Land 2.0` + `Ancient Ruins`.
- **Kiểm thử:** Traverse 4 hướng (`bellhollow ↔ cp ↔ outer_woods / deep_forest / silent_mire / clearing`).

#### 6. `deep_forest` *(Ưu Tiên Khắc Phục P0)*
- **Giữ nguyên:** Khu vực `HoodedKnightBoss (2340, -190)`, `GoblinScout` ambush, `df_listener_nest`, `whispering_totem_pillar`, `4` transitions.
- **Cần sửa:** Mở khóa **`HW-H4-03-AUDIT` (`W02`)** bằng cách nới `physics.world.bounds.y` & kiểm `WorldGatingSystem` lên `abyssal_chasm`; tách sạch toàn bộ cụm stacking (`1974,-70`, `2340,-490` 3 lớp, `2100,-340` 5 lớp, `1880,-200`) tối thiểu `>= 48px`; bỏ `4` cây `W20-BUG-001`; gỡ chồng `bounds` của `sub_whispering_clearing` & `sanctum`.
- **Asset sử dụng:** `Resurrected RPG 1.1` (cây tầng cao + tàn tích đá) + `EPIC Ancient Ruins` + sương slate-teal.
- **Kiểm thử:** **`W02_deep_forest_to_abyssal_chasm` PASS**; không kẹt góc quanh totem/nest.

#### 7. `sub_whispering_clearing` *(Ưu Tiên Khắc Phục P0)*
- **Giữ nguyên:** Trận địa `3` cột vọng âm (`inspect_echo_pillar_1..3`), tuyến `SQ04`.
- **Cần sửa:** Sửa dứt điểm **`MAP-BUG-001`** (tắt tường tự động `auto_south_whispering_grove_sanctum` chặn 2 cổng Bắc); dời cây bạch dương chặn cổng; sửa tọa độ `wc_curved_tree_ne/se` (`x=2000 > bounds.maxX=1970`); bỏ mảng nền tím chữ nhật bằng viền chuyển sương mượt; thêm cổng 2 chiều về từ `crooked_path`; đăng ký vào `ZCR` & `ParchmentWorldMapModal`.
- **Asset sử dụng:** `EPIC Ancient Ruins` + `DarkFantasy FREE Starter` (thay 3 cột vector tím).
- **Kiểm thử:** Đi thông `deep_forest ↔ clearing ↔ sanctum` và `clearing ↔ crooked_path`.

#### 8. `whispering_grove_sanctum` *(Ưu Tiên Khắc Phục P0)*
- **Giữ nguyên:** `elder_grove_altar`, `elder_tree_sap_node`, ánh nắng hổ phách dịu.
- **Cần sửa:** Sửa dứt điểm **`MAP-BUG-002`**: tách `bounds` không chồng lên `deep_forest` (`480×280`) hay `abyssal_chasm` (`480×160`); dời `defaultSpawn` ra khỏi tường `df_bound_left (1600)` ít nhất `64px`; tắt `AutoPerimeterWallsModule` dư thừa; bổ sung `render*Decorations()` đầy đủ.
- **Asset sử dụng:** `Resurrected RPG 1.1` (bậc thang, đài tế ánh vàng, cây đại thụ cổ).
- **Kiểm thử:** Spawn tại `whispering_grove_sanctum` cách collider gần nhất `>= 48px`, đi về Nam mượt.

---

### Batch 3 (`HW-WORLD-20D` — Mire & Broken Bell Shrine)

#### 9. `silent_mire`
- **Giữ nguyên:** `rune_pillar_1..3`, `sunken_mire_shrine`, `ShadowBehemothBoss`, `env_broken_sword_mire`, `env_echo_mire_path`, `mat_runed_iron`, `6` transitions.
- **Cần sửa:** Băm collider vũng nước `sm_water_*` theo lưới `32×32` bám sát bờ lầy thay cho hộp AABB chữ nhật (`W20-BUG-008`); sửa **OOB `+4px` & lỗi `W05`** xuống `drowned_mire_depths` (thêm cổng/rào thị giác khi bị khóa); tách rặng tường ẩn `535–575px` & `18` detached props; bỏ cây `W20-BUG-001`.
- **Asset sử dụng:** `Dead Swamp` + `Mangrove Swamp Sampler` + `Resurrected RPG` (`Wall.png` / `Props.png`).
- **Kiểm thử:** **`W05_silent_mire_to_drowned_depths` PASS** (hoặc hiển thị barrier rõ ràng khi khóa); không vướng góc vuông khô quanh hồ.

#### 10. `ancient_rune_puzzle`
- **Giữ nguyên:** `rune_pedestal_center`, `rune_clue_stele`, `to_silent_mire_from_puzzle`, `to_sunken_crypt_ruins`.
- **Cần sửa:** Sửa **`MAP-BUG-003`**: kéo `to_silent_mire_from_puzzle` (`3310`) vào trong `bounds.x >= 3350`; dời `Đèn Đá (3362, 247)` khỏi trigger `to_rune_puzzle`; thay đèn/bia/bệ thờ vector bằng sprite đá cổ thật; bỏ chồng `bounds` nhân tạo trên `silent_mire`.
- **Asset sử dụng:** `EPIC Ancient Ruins` + `Dead Swamp`.
- **Kiểm thử:** Vào/ra đền cổ ngữ từ mọi phía và bước xuống cầu thang `sunken_crypt_ruins` mượt.

#### 11. `broken_bell_shrine`
- **Giữ nguyên:** `BossMireWarden (4500, 240)` & 3 trụ phase, `bell_tongue_item (4548, 280)`, `shrine_cracked_bell`, `env_shrine_parchment_map`, `4` resourceNodes.
- **Cần sửa:** Gỡ tường cấn mép cổng Tây (`W20-BUG-009`: `shrine_bound_left_bottom` & `auto_east_silent_mire_seg_0`); bỏ thanh tường ẩn Bắc `900px` thay bằng hàng cây/vách đá thật; gỡ `2` cây `W20-BUG-001`.
- **Asset sử dụng:** `Resurrected RPG 1.1` + `EPIC Ancient Ruins` + `Dead Swamp` (chuyển tiếp nền rêu-đá tự nhiên).
- **Kiểm thử:** Arena Mire Warden đủ rộng cho 3 trụ & né đòn, không có hitbox cây đổ lơ lửng làm kẹt player trong combat.

---

### Batch 4 (`HW-WORLD-20E` — Underground & `5` Expansion Zones)

#### 12. `sub_root_cellar`
- **Giữ nguyên:** `6` điểm điều tra (`inspect_fog_origin_mural`, `inspect_rare_roots`, `env_root_cellar_alchemy`,...), `ShadowEyes`, `2` transitions.
- **Cần sửa:** Xóa 100% vector placeholder (`W20-BUG-010`), thêm collider chân cột giữa phòng, kéo `to_veil_origin_cavern` vào trong `bounds.maxY <= 1440` (hết OOB `4px`).
- **Asset sử dụng:** `Kauzz Cave Tiles & RPGW Caves` + `Resurrected RPG` (rễ đại thụ & nấm phát sáng).

#### 13. `abyssal_chasm`
- **Giữ nguyên:** `monolith_abyssal_warning`, `knight_corpse_cache`, `4` resource spawns, cổng về `deep_forest`.
- **Cần sửa:** Gỡ khối hộp đỏ khổng lồ giữa sân `(2240, -960)` (`W20-BUG-011`); tách `bounds` không bị `whispering_grove_sanctum` chồng `480×160`; dựng bờ vực, cầu đá gãy & Cổng Hư Không thật.
- **Asset sử dụng:** `TF DarkDimension` + `Kauzz Cave Tiles` + `Resurrected portal-Sheet.png` (29f).

#### 14. `drowned_mire_depths`
- **Giữ nguyên:** `lore_fisherman_diary`, `chest_drowned_mire`, `4` resource spawns, lối về `silent_mire`.
- **Cần sửa:** Dựng địa hình bùn ngập mặn, cầu gỗ gãy nối thông cổng Bắc không đứt quãng (`W20-BUG-011`).
- **Asset sử dụng:** `Dead Swamp` + `Mangrove Swamp Sampler`.

#### 15. `sunken_crypt_ruins`
- **Giữ nguyên:** `monolith_crypt_memorial`, `sarcophagus_black_knight`, `3` resource spawns, lối lên `ancient_rune_puzzle`.
- **Cần sửa:** Dựng kiến trúc tường gạch hầm mộ, đuốc, bậc thang đá và hành lang dẫn tới quách Hiệp Sĩ (`W20-BUG-011`).
- **Asset sử dụng:** `RF Catacombs v1.0` + `DarkFantasy FREE Starter`.

#### 16. `veil_origin_cavern`
- **Giữ nguyên:** `veil_commander_epistle (1040,1760)`, `veil_heart_altar (1040,1860)`, `3` resource spawns, lối lên `sub_root_cellar`. *(Giữ trống vai trò Dark Knight cho tới khi chốt `OQ-15`).*
- **Cần sửa:** Dựng hang ngầm thạch nhũ, ánh sáng tím thẫm tiết chế (không nhấp nháy gây nhiễu Classic Sanity 2.1) & vòm nối `sub_root_cellar`.
- **Asset sử dụng:** `Kauzz Cave Tiles & RPGW Caves` + `TF DarkDimension`.

#### 17. `sub_bell_workshop`
- **Giữ nguyên:** Lò rèn `bw_forge_table`, `inspect_bell_mold`, `inspect_black_knight_stele`, `env_bellmaker_dew_journal`, lối lên `outer_woods`.
- **Cần sửa:** Thay vòng sàn đá đặt lạc lõng trên cỏ xanh bằng phế tích tường gạch nứt nối hòa hợp vào rừng ngoại vi.
- **Asset sử dụng:** `Serene Village Revamped v1.9` + `Resurrected RPG 1.1`.

---

### Batch 5 (`HW-WORLD-20F` — World Map UI `[M]`, Registry Sync & Final Performance Gate)
- **Đồng bộ hệ thống:** Bổ sung `7` zone còn thiếu vào `ZoneConnectionRegistry.ts` (`10 → 17` nodes, `24 → 41` transitions) và `ParchmentWorldMapModal.ts` (`10 → 17` điểm địa danh dùng `Pocket Inventory Series #2 Pixel Map`).
- **Ngưỡng nghiệm thu cuối (theo `HW-H4-06` & `HW-WORLD-20A`):** `Avg >= 59.5 FPS` trên `GTX 1070 Ti` (60Hz VSync), `1% Low >= 58.0 FPS`, Draw Calls `<= 120` (làng) / `<= 80` (rừng), `17/17` zone WASD traversal PASS, `0` OOB / `0` collider-transition overlap / `0` missing textures.
