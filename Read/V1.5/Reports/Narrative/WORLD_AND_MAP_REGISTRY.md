# HOLLOW WOODS — WORLD AND MAP REGISTRY (`17` ZONES VERIFIED)

- **Mission:** `HW-NARRATIVE-00C — WORLD BIBLE & MAP RECONSTRUCTION PLANNING`
- **Primary Sources Verified:**
  - [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md) (Mục `5`)
  - Runtime Production Sources (Read-Only): `src/data/zones.json` (`17` zones, `41` transitions), `src/world/ZoneConnectionRegistry.ts` (`10` nodes, `24` descriptors), `src/world/WorldBuilder.ts`, `src/systems/WildlifeSystem.ts`, `src/systems/InventorySystem.ts`, `src/scenes/GameScene.ts`, `src/ui/ParchmentWorldMapModal.ts` (`10` UI zones)
  - Audit & Performance Reports: [HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md), [HW_WORLD_20_MAP_BUG_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_MAP_BUG_REGISTRY.md), [HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md), [HW_H4_06_PERFORMANCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_06_PERFORMANCE_REPORT.md), [HW_COLLISION_AUDIT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-WORLD-20/HW_COLLISION_AUDIT.json)

---

## 1. Tổng Hợp Kiểm Kê Kiến Trúc Thế Giới Runtime

| Chỉ số | Master Bible (`Ch. 07`) | Source Runtime Thực Tế (`HEAD 11d91dd5...`) | Sai lệch / Vấn đề ghi nhận |
| :--- | :---: | :---: | :--- |
| **Tổng số phân khu (`zones.json`)** | `17` zones | **`17` zones** (`status: active`) | Khớp 100% về số lượng & tọa độ bounds |
| **`ZoneConnectionRegistry` Nodes** | Chưa liệt kê đủ sub-zones | **`10` zoneNodes** (chỉ 24 connection descriptors) | Thiếu **`7` zones** (`sub_root_cellar`, `sub_whispering_clearing`, `abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`); `getRuntimeExits()` đọc fallback từ `zones.json` |
| **Cổng chuyển vùng (`zones.json` `transitions`)** | — | **`41` transitions** | `3` OOB (`4–40px`), `14` collider overlaps, `1` đường 1 chiều (`sub_whispering_clearing → crooked_path`) |
| **World Map UI (`ParchmentWorldMapModal.ts`)** | — | **`10` zones** | Thiếu toàn bộ `7` khu vực phụ/mở rộng (`MAP-BUG-005..008`, `H4-NEW-05`) |
| **Tổng Static Physics Colliders (`HW-WORLD-20A`)** | — | **`329` colliders** (`1,200–1,202` Display Objects) | `6` cặp `bounds` chồng nhau, `1` spawn nằm giữa tường (`whispering_grove_sanctum`), `20` cây đổ mispack `W20-BUG-001`, `18` detached colliders |
| **Hiệu năng GPU chuẩn (`HW-H4-06` + `HW-WORLD-20A`)** | Mục tiêu `~60 FPS` | `HW-H4-06`: **`59.90 FPS`** VSync (`173.45 FPS` uncapped), `92.6` draws; `HW-WORLD-20A`: `59.76–60.28 FPS` (spike `30.12` tại `bellhollow`) | `LAB-01` prototype đạt `60.05 FPS`, `8` draws (`Tree_Trunks`/`Tree_Canopies`), nhưng là vùng thử nghiệm độc lập không đại diện toàn map |

---

## 2. Hồ Sơ Chi Tiết Toàn Bộ `17` Phân Khu (Theo Source Thực Tế)

*(Toàn bộ đường nối ghi nhận dưới đây trích xuất trực tiếp từ `zones.json` `transitions` & `ZoneConnectionRegistry.ts` — KHÔNG suy diễn từ tọa độ).*

### 2.1 Tầng 1 — Core World (`6` phân khu)

#### 1. `fog_crossing` — *Fog Crossing / Lối Mòn Xuyên Sương*
- **World Bounds:** `x: 0, y: 0, w: 480, h: 360` | **Default Spawn:** `(120, 195)`
- **Entry / Exit & Đường nối:**
  - *Ra (`zones.json` + `ZCR`):* `to_bellhollow` / `conn_fog_to_bellhollow` (`open`, `460,200,20×60` trong `zones.json`; `460,100,20×160` trong `ZCR` — lệch `y/h`!) → `bellhollow` `(520, 260)`.
  - *Vào:* Từ `bellhollow` (`to_fog_crossing` → `(440, 180)`).
- **NPC:** `0` | **Boss / Quái (`WildlifeSystem`):** Ambient `crow_fc_01`, `moth_fc_01..02`; `ShadowEyes (380, 220)`; Act 0 `The Echo` (`GameScene.startAct0Intro`).
- **Quest Objects / Landmarks:** `fog_west_barrier (40,160)`, `fog_journal_scrap_1 (150,195)`, `fog_sign (228,142)` (`read_fog_sign`).
- **Resource Nodes (`InventorySystem`):** `node_wood_1 (220,130)`, `node_wood_2 (380,250)`.
- **Collision:** `8` JSON colliders (`18` live colliders trong `HW-WORLD-20A`). **Lỗi:** `W20-BUG-001` tại `(220,130)` & rào Tây xoay `90°`; `W20-BUG-003` tường biên `2–3` lớp; `fog_tree_1 (160,100)` / `fog_tree_2 (300,240)` lệch sprite `(160,65)` / `(300,310)` (`W04`); `to_fog_crossing` bị tường `16×60px` đè.
- **Lighting & Fog:** `fogColor: 1184274`, `fogAlpha: 0.75`, `ambientLight: 0.40`, `ambientColor: 1118481`.

#### 2. `bellhollow` — *Bellhollow / Làng Chuông Cổ*
- **World Bounds:** `x: 480, y: -200, w: 1120, h: 960` | **Default Spawn:** `(560, 260)`
- **Entry / Exit & Đường nối (`4` outgoing `zones.json` & `ZCR`):**
  - `to_fog_crossing` (`open`, `480,200,20×120`) → `fog_crossing` `(440,180)`
  - `to_sanctuary_farm` (`open`, `610,535,100×25`) → `sanctuary_farm` `(650,580)`
  - `to_outer_woods` (`open`, `1150,535,120×25`) → `outer_woods` `(1210,580)`
  - `to_crooked_path` (`gate` Cổng Đông / Garth + `Q03`, `1580,200,20×160`) → `crooked_path` `(1640,280)`
- **NPC (`5`):** `npc_garth (540,205)`, `npc_edda (1160,160)`, `npc_neris (570,460)`, `npc_bram (1333,477)`, `npc_finn (909,231)`.
- **Boss / Quái:** Khu an toàn; chỉ có ambient `crow_bell_01..02`, `moth_bell_01..03`.
- **Quest Objects & Lore Landmarks:** `bell_tower_altar (900,145)` (`The First Toll`), `east_gate_barrier (1475,280)`, `camp_central_campfire (860,310)`, `camp_shelter_tent (778,261)`, `camp_storage_chest (775,295)`, `village_crafting_bench (1395,455)`, `camp_herbal_cauldron (630,445)`, `bellhollow_notice_board (650,240)`, `env_ancient_oak_hollow (760,120)` (`lore_ancient_oak_hollow`), 2 biển chỉ dẫn cổng (`695,511`, `1200,510`).
- **Resource Nodes:** `node_wood_bellhollow_1 (610,145)`, `node_resin_bellhollow_2 (730,80)`, `node_flint_1 (510,490)`, `node_resin_1 (970,75)`, `node_herb_1 (1190,85)`, `node_herb_2 (620,470)`, `node_wood_3 (1240,360)`.
- **Collision:** `12` JSON colliders (`house_edda`, `house_neris`, `bell_tower`, `village_well`, bounds); **`92` live colliders**. **Lỗi:** `W20-BUG-002` (Lều+Đèn+Rương chặn thẳng trục `y=260` làm **FAIL `W01`**); chồng bounds `640×200` lên `sanctuary_farm` và `480×200` lên `outer_woods`; spike `30.12 FPS`.
- **Lighting & Fog:** `fogColor: 2236962`, `fogAlpha: 0.22`, `ambientLight: 0.80`, `ambientColor: 1315860`.

#### 3. `sanctuary_farm` — *Sanctuary Farm / Nông Trại Trú Ẩn*
- **World Bounds:** `x: 480, y: 560, w: 640, h: 480` | **Default Spawn:** `(650, 620)`
- **Entry / Exit & Đường nối (`3` outgoing):**
  - `to_bellhollow_from_farm` (`open`, `610,560,100×20`) → `bellhollow` `(650,510)`
  - `to_outer_woods_from_farm` (`open`, `1100,680,20×140`) → `outer_woods` `(1140,750)`
  - `to_root_cellar` (`open`, `780,1000,60×40`, **chỉ có ở `zones.json`, chưa có trong `ZCR`**) → `sub_root_cellar` `(800,1100)`
- **NPC:** `0` | **Boss / Quái:** Ambient `crow_farm`, `moth_farm_01..04`.
- **Quest Objects & Lore Landmarks:** `farm_storage_chest (680,640)`, `farm_processing_bench (702,629)`, `farm_water_well (920,700)`, `farm_welcome_sign (615,590)` (`read_farm_sign`), `farm_herb_terrace_sign (730,625)` (`read_herb_terrace_sign`).
- **Resource Nodes:** Nằm trong thiết kế vườn dược nông trại (`0` node riêng trong `InventorySystem`).
- **Collision:** `7` JSON colliders (`farm_barn_wall`, `farm_well`); **`42` live colliders**. **Lỗi:** `W20-BUG-005` hàng rào đâm xuyên thân cây `(505,840)`; `3` vùng `[E]` chồng nhau `(650..702, 625..640)`; ao nước `Graphics`; chồng bounds `bellhollow`; tường Tây 2 lớp.
- **Lighting & Fog:** `fogColor: 2236962`, `fogAlpha: 0.18`, `ambientLight: 0.86`, `ambientColor: 1315860`.

#### 4. `outer_woods` — *Outer Woods / Rừng Ngoại Vi*
- **World Bounds:** `x: 1120, y: 560, w: 480, h: 480` | **Default Spawn:** `(1210, 620)`
- **Entry / Exit & Đường nối (`5` outgoing trong `zones.json`; `ZCR` có `3` — thiếu `to_silent_mire_via_shortcut`, có `to_bell_workshop`):**
  - `to_bellhollow_from_ow` (`1150,560,120×20`) → `bellhollow` `(1210,510)`
  - `to_farm_from_ow` (`1120,680,20×140`) → `sanctuary_farm` `(1080,750)`
  - `to_crooked_path_from_ow` (`1560,720,40×120`) → `crooked_path` `(1640,500)`
  - `to_bell_workshop` (`1320,1000,80×40`) → `sub_bell_workshop` `(1360,1100)`
  - `to_silent_mire_via_shortcut` (`shortcut`, `1560,670,36×40`) → `silent_mire` `(2920,420)`
- **NPC (`1`):** `npc_campfire_knight` (`Sir Vaelen`, `(1435, 710)`, bếp lửa `(1470, 710)`).
- **Boss / Quái (`WildlifeSystem`):** `SkullWolf (920, 280)` (theo tọa độ local/wildlife), `ShadowCrow (1350, 220)`, `DreadHorseman (1100, 290, patrolRange 180)`, ambient `crow_ow_01..04`, `moth_ow_01..05`.
- **Quest Objects & Lore Landmarks:** `quiet_forest_bonfire (1470,710)`, `abandoned_ranger_outpost (1420,620)`, `ranger_outpost_chest (1445,645)`, `shortcut_titan_trunk_outer (1540,680)`, `env_knights_memorial_stele (1260,645)` (`lore_knights_memorial_stele`), `env_echo_ruins_prayer (1480,840)` (`lore_echo_ruins_prayer`), `ow_signpost (1220,640)` (`read_ow_sign`), `sign_sub_bell_workshop (1300,985)`.
- **Resource Nodes:** `9` nodes trong `InventorySystem` (`node_wood_ow_1..3`, `node_resin_ow_1..2`, `node_flint_ow_1..2`, `node_herb_ow_1..2`) + `5` interactable `gather_*` trong `zones.json`.
- **Collision:** `10` JSON colliders; **`51` live colliders**. **Lỗi:** `W20-BUG-006` **Triple Stack** `(1445..1450, 650..662)` giữa sồi lớn + rương + trạm kiểm lâm; cây đè cổng `to_bellhollow_from_ow (1161,576)`; `W20-BUG-001` tại `(1135,670)`. (`W03` PASS đi thẳng Nam).
- **Lighting & Fog:** `fogColor: 1644830`, `fogAlpha: 0.35`, `ambientLight: 0.65`, `ambientColor: 986895`.

#### 5. `sub_bell_workshop` — *Abandoned Bell Workshop / Xưởng Chuông Bỏ Hoang*
- **World Bounds:** `x: 1120, y: 1040, w: 480, h: 400` | **Default Spawn:** `(1360, 1100)`
- **Entry / Exit & Đường nối:** `to_outer_woods_from_bw` (`1320,1040,80×30`, có cả `ZCR`) → `outer_woods` `(1360,980)`.
- **NPC:** `0` | **Boss / Quái:** Ambient `moth_bw_01..02`.
- **Quest Objects & Lore Landmarks:** `inspect_bell_mold (1310,1160)` (`item_bell_mold`), `inspect_runed_iron_part (1330,1240)` (`SQ01`), `inspect_ancient_workbench (1300,1180)`, `inspect_blacksmith_journal (1360,1160)` (`lore_blacksmith_journal`), `inspect_black_knight_stele (1400,1180)` (`lore_black_knight_chronicle`), `env_bellmaker_dew_journal (1420,1200)` (`lore_bellmaker_dew_journal`).
- **Resource Nodes:** `0` | **Collision:** `7` JSON colliders (`bw_forge_table`, `bw_scrap_pile`); `13` live colliders. Sàn đá lạc lõng trên nền cỏ xanh.
- **Lighting & Fog:** `fogColor: 2039064`, `fogAlpha: 0.65`, `ambientLight: 0.45`, `ambientColor: 13408580`.

#### 6. `sub_root_cellar` — *Root Cellar / Hầm Rễ Cổ*
- **World Bounds:** `x: 480, y: 1040, w: 640, h: 400` | **Default Spawn:** `(800, 1100)`
- **Entry / Exit & Đường nối (`2` outgoing `zones.json`, chưa có trong `ZCR`):**
  - `to_farm_from_cellar` (`780,1040,60×30`) → `sanctuary_farm` `(800,980)`
  - `to_veil_origin_cavern` (`760,1420,80×24` — **OOB `+4px` Y!**) → `veil_origin_cavern` `(800,1500)`
- **NPC:** `0` | **Boss / Quái:** `ShadowEyes (320, 240)`, ambient `moth_rc_01..02`.
- **Quest Objects & Lore Landmarks:** `inspect_rare_roots (680,1220)` (`SQ03`), `inspect_rare_mushrooms (600,1180)`, `inspect_pure_spring (920,1280)`, `inspect_cellar_lock (880,1220)`, `inspect_fog_origin_mural (780,1150)` (`lore_fog_origin`), `env_root_cellar_alchemy (780,1220)` (`lore_root_cellar_alchemy`).
- **Resource Nodes:** `0` | **Collision:** `9` JSON colliders (`11` live). **Lỗi:** `W20-BUG-010` **100% vector `Graphics` placeholder**, trụ giữa quên collider, portal Nam OOB `4px`.
- **Lighting & Fog:** `fogColor: 1186324`, `fogAlpha: 0.70`, `ambientLight: 0.35`, `ambientColor: 4482645`.

---

### 2.2 Tầng 2 — Frontier (`4` phân khu)

#### 7. `crooked_path` — *The Crooked Path / Đường Mòn Quanh Co*
- **World Bounds:** `x: 1600, y: 0, w: 1280, h: 640` | **Default Spawn:** `(1660, 280)`
- **Entry / Exit & Đường nối (`4` outgoing `zones.json` & `ZCR`, nhận 1 chiều từ `sub_whispering_clearing`):**
  - `to_bellhollow_from_cp` (`gate`, `1600,220,20×140`) → `bellhollow` `(1540,280)`
  - `to_outer_woods_from_cp` (`open`, `1600,440,40×120`) → `outer_woods` `(1540,780)`
  - `to_deep_forest` (`open`, `2000,10,160×35`) → `deep_forest` `(2080,-80)`
  - `to_silent_mire` (`dense_thorns` / `Q04:t1`, `2860,240,20×160`) → `silent_mire` `(2940,320)`
- **NPC:** `0` | **Boss / Quái (`WildlifeSystem`):** `TheListener (2300, 240)` (chính trong `GameScene.ts:1574`), `FallenKnight (2360, 240)`, `DreadHorseman (1200, 300, patrol 220)`, `SkullWolf` ×2, `ShadowCrow`, `ShadowEyes` ×2, ambient crows/moths.
- **Quest Objects & Lore Landmarks:** `hide_bush_1..3`, `hide_bush_cp_*`, `hide_tree_1..2`, `hide_tree_detour_bridge`, `crooked_path_deep_forest_sign (2100,35)`, `cp_frontier_sign (1660,320)`, `cp_ancient_sentinel_rock (2100,280)`, `cp_hunter_cache (2650,260)`, `sign_detour_winding (2060,170)`, `env_elian_unsent_letter (1980,240)` (`lore_elian_unsent_letter`), `env_stone_chessboard (2340,310)` (`lore_stone_chessboard`).
- **Resource Nodes:** `7` `InventorySystem` nodes + `4` `gather_*_cp_1` interactables.
- **Collision:** `4` JSON colliders (`40` live colliders). **Lỗi:** `W20-BUG-007` đôi tường đỏ mép Nam, hàng cây Nam `withCollider=false` (`2020,620`), biển chỉ dẫn `(2093,38)` cấn cổng `to_deep_forest`, `bell_bound_east_bottom` đè `to_outer_woods_from_cp`, thiếu cổng quay lại `sub_whispering_clearing`, `3` cây `W20-BUG-001`.
- **Lighting & Fog:** `fogColor: 1119504`, `fogAlpha: 0.58`, `ambientLight: 0.38`, `ambientColor: 789516`.

#### 8. `deep_forest` — *Deep Forest / Rừng Sâu*
- **World Bounds:** `x: 1600, y: -640, w: 1280, h: 640` | **Default Spawn:** `(2080, -80)`
- **Entry / Exit & Đường nối (`4` outgoing `zones.json`; `ZCR` có `2` là `crooked_path` & `silent_mire`, thiếu `whispering_clearing` & `abyssal_chasm`):**
  - `to_crooked_path_from_df` (`open`, `2010,-25,140×25`) → `crooked_path` `(2080,60)`
  - `to_silent_mire_from_df` (`dense_thorns`, `2855,-310,25×100`) → `silent_mire` `(2920,200)`
  - `to_whispering_clearing` (`open`, `1810,-45,60×25`) → `sub_whispering_clearing` `(1840,-180)`
  - `to_abyssal_chasm` (`rune_void_gate`, `2210,-640,60×16`) → `abyssal_chasm` `(2240,-700)`
- **NPC:** `0` | **Boss / Quái:** **`HoodedKnightBoss (2340, -190)`** (+ `2` `FallenKnight` escorts; và khi test qua `GameScene` có `WildlifeSystem`), `FallenKnight (2040, -200)`, `SkullWolf` ×2, `ShadowCrow`, `ShadowEyes` ×2, `GoblinScout` ambush `(1950,-250)`.
- **Quest Objects & Lore Landmarks:** Mảnh Cổ Ngữ Khai Mở (`Main Route Chặng 4`), `df_entry_sign (1974,-70)`, `df_chest_entry (1984,-80)`, `df_listener_nest (2340,-490)`, `whispering_totem_pillar (2100,-320)`, `df_mire_boundary_gate (2840,-260)`, `3` hiding trees + `3` hiding bushes.
- **Resource Nodes:** `6` `InventorySystem` nodes + `5` `gather_*_df_1`.
- **Collision:** `5` JSON (`48` live). **Lỗi P0:** **`HW-H4-03-AUDIT` (`W02` FAIL tại `y=-600/-618`, `GameScene:4066` `bounds.y = -640`)**; **`W20-BUG-004` stacking nặng nhất map** (`1974,-70`, `2340,-490` 3 lớp, `2100,-340` 5 lớp, `1880,-200`); `4` cây `W20-BUG-001`; chồng bounds với `sub_whispering_clearing` & `whispering_grove_sanctum`.
- **Lighting & Fog:** `fogColor: 594960`, `fogAlpha: 0.78`, `ambientLight: 0.25`, `ambientColor: 463117`.

#### 9. `sub_whispering_clearing` — *Whispering Clearing / Khoảng Trống Thì Thầm*
- **World Bounds:** `x: 1600, y: -360, w: 370, h: 360` | **Default Spawn:** `(1840, -180)`
- **Entry / Exit & Đường nối (`3` outgoing `zones.json`, chưa có trong `ZCR`):**
  - `to_deep_forest_from_wc` (`1800,-350,80×30`) → `deep_forest` `(1840,-80)`
  - `to_crooked_path_from_wc` (`1800,-30,80×30`, **1 chiều**) → `crooked_path` `(1840,60)`
  - `to_whispering_grove_sanctum` (`1800,-360,80×24`) → `whispering_grove_sanctum` `(1600,-420)`
- **NPC:** `0` | **Boss / Quái:** Không có habitat riêng trong `WildlifeSystem`.
- **Quest Objects & Lore Landmarks:** `inspect_echo_pillar_1..3` (`1740,-210`, `1840,-110`, `1940,-210`), tuyến `SQ04_CLEARING_PATROL`.
- **Resource Nodes:** `0` | **Collision:** `10` JSON colliders (`14` live). **Lỗi P0:** **`MAP-BUG-001`** tường tự động `auto_south_whispering_grove_sanctum_seg_end` chặn 2 cổng Bắc; cây bạch dương đè cửa; nền tím chữ nhật cắt gắt sang cỏ xanh; `wc_curved_tree_ne/se` (`x=2000`) lố ngoài `bounds.maxX=1970`.
- **Lighting & Fog:** `fogColor: 1709352`, `fogAlpha: 0.80`, `ambientLight: 0.35`, `ambientColor: 5917306`.

#### 10. `whispering_grove_sanctum` — *Sanctum of the Elder Grove / Thánh Địa Cây Đại Ngàn*
- **World Bounds:** `x: 1120, y: -800, w: 960, h: 440` | **Default Spawn:** `(1600, -420)`
- **Entry / Exit & Đường nối (`1` outgoing `zones.json`, chưa có trong `ZCR`):** `to_whispering_clearing_from_wgs` (`1560,-400,80×30`) → `sub_whispering_clearing` `(1840,-310)`.
- **NPC / Boss:** `0` (`spawns: {npcs:[], monsters:[]}`).
- **Quest Objects & Landmarks:** `elder_grove_altar (1600,-580)` (`lore_elder_grove_blessing`), `elder_tree_sap_node (1680,-620)`.
- **Resource Nodes:** `4` nodes trong `zones.json.spawns.resources` (`herbs` ×2, `tree_resin`, `dry_wood`).
- **Collision:** `5` JSON (`22` live). **Lỗi P0:** **`MAP-BUG-002`** chồng `480×280` lên `deep_forest` & `480×160` lên `abyssal_chasm`, **`defaultSpawn (1600,-420)` kẹt ngay bên trong tường `df_bound_left`**, cổng thoát chồng `df_bound_left`, thiếu hoàn toàn `render*Decorations()`.
- **Lighting & Fog:** `fogColor: 3030308`, `fogAlpha: 0.35`, `ambientLight: 0.55`, `ambientColor: 5597999`.

---

### 2.3 Tầng 3 — Forbidden Regions (`7` phân khu)

#### 11. `silent_mire` — *Silent Mire / Đầm Lầy Tĩnh Lặng*
- **World Bounds:** `x: 2880, y: 100, w: 1120, h: 640` | **Default Spawn:** `(2960, 320)` (`ZCR`: `2940,320`)
- **Entry / Exit & Đường nối (`6` outgoing `zones.json`; `ZCR` có `4`, thiếu `drowned_mire_depths` & `outer_woods_via_shortcut`):**
  - `to_crooked_path_from_sm` (`open`, `2880,240,20×160`) → `crooked_path` `(2820,280)`
  - `to_deep_forest_from_sm` (`open`, `2880,160,20×55`) → `deep_forest` `(2800,-260)`
  - `to_rune_puzzle` (`open` trong json / `rune_ward` trong ZCR, `3365,220,25×80`) → `ancient_rune_puzzle` `(3390,260)`
  - `to_shrine` (`rune_ward` / `mire_puzzle_solved`, `3980,240,20×160`) → `broken_bell_shrine` `(4050,280)`
  - `to_drowned_mire_depths` (`open`, `3340,720,80×24` — **OOB `+4px` Y!**) → `drowned_mire_depths` `(3380,780)`
  - `to_outer_woods_via_shortcut` (`shortcut`, `2880,410,36×40`) → `outer_woods` `(1540,700)`
- **NPC:** `0` | **Boss / Quái (`WildlifeSystem`):** **`ShadowBehemothBoss (780, 280)`**, `SkullWolf` ×2, `ShadowEyes` ×2, ambient crows/moths.
- **Quest Objects & Lore Landmarks:** `rune_pillar_1..3`, `sunken_mire_shrine (3520,280)`, `sunken_bronze_talisman (3540,295)`, `sm_shrine_gate_ward (3960,280)`, `shortcut_titan_trunk_marsh (2890,420)`, `env_broken_sword_mire (3120,460)` (`lore_broken_sword_mire`), `env_echo_mire_path (3420,380)` (`lore_echo_mire_path`).
- **Resource Nodes:** `6` `InventorySystem` nodes (`node_iron_sm_1` `mat_runed_iron`, `herbs`, `wood`, `resin`, `flint`) + `5` `gather_*_sm_1`.
- **Collision:** `17` JSON (`58` live). **Lỗi:** `W20-BUG-008` hộp nước AABB vuông góc (`sm_water_*`), rặng tường ẩn `535–575px`, **FAIL `W05`** (`y=734.4` bị khóa im lặng), `18` detached colliders phân bố chủ yếu tại cụm Mire/Shrine.
- **Lighting & Fog:** `fogColor: 1383446`, `fogAlpha: 0.75`, `ambientLight: 0.25`, `ambientColor: 986900`.

#### 12. `ancient_rune_puzzle` — *Ancient Rune Puzzle / Khu Vực Câu Đố Cổ Ngữ*
- **World Bounds:** `x: 3350, y: 150, w: 350, h: 280` | **Default Spawn:** `(3380, 260)` (`ZCR`: `3420,260`)
- **Entry / Exit & Đường nối (`2` outgoing `zones.json`; `ZCR` chỉ có `to_silent_mire`):**
  - `to_silent_mire_from_puzzle` (`3310,220,25×80` — **OOB `-40px` X!**) → `silent_mire` `(3300,260)`
  - `to_sunken_crypt_ruins` (`3500,150,60×24`) → `sunken_crypt_ruins` `(3600,-100)`
- **NPC:** `0` | **Boss / Quái (`WildlifeSystem`):** **`HoodedKnightBoss (3590, 290)`** (`HOODED_KNIGHT_HABITATS` cấu hình phụ).
- **Quest Objects & Lore Landmarks:** `rune_pedestal_center (3520,280)`, `rune_clue_stele (3460,290)` (`read_rune_clue_stele`).
- **Resource Nodes:** `0` | **Collision:** `0` JSON (`13` live do lồng hoàn toàn vào `silent_mire`). **Lỗi:** `MAP-BUG-003` cổng Tây OOB `40px`, Đèn Đá `(3362,247)` đè lên `to_rune_puzzle`, trụ/đèn dựng bằng `Graphics`.
- **Lighting & Fog:** `fogColor: 1119504`, `fogAlpha: 0.65`, `ambientLight: 0.38`, `ambientColor: 789516`.

#### 13. `broken_bell_shrine` — *The Broken Bell Shrine / Miếu Chuông Phế Tích*
- **World Bounds:** `x: 4000, y: 0, w: 960, h: 600` | **Default Spawn:** `(4080, 280)` (`ZCR`: `4050,280`)
- **Entry / Exit & Đường nối:** `to_silent_mire_from_shrine` (`4000,220,20×140`, có cả `ZCR`) → `silent_mire` `(3940,320)`.
- **NPC:** `0` | **Boss / Quái:** **`BossMireWarden (4500, 240)`** (`GameScene.ts:6805`, kèm `3` trụ phong ấn), `ShadowBehemothBoss (920, 300)`, ambient crows/moths.
- **Quest Objects & Lore Landmarks:** `bell_tongue_item (4548,280)` (Lưỡi Chuông Đồng Cổ), `shrine_cracked_bell (4500,215)`, `shrine_inscribed_stele (4280,270)`, `env_shrine_parchment_map (4180,260)` (`lore_shrine_parchment_map`), `shrine_hiding_spot (4360,380)`.
- **Resource Nodes:** `4` `resourceNodes` trong `zones.json` (`node_herb_shrine_1`, `node_flint_shrine_1`, `node_wood_shrine_1`, `node_resin_shrine_1`).
- **Collision:** `7` JSON (`33` live). **Lỗi:** `W20-BUG-009` cổng Tây cấn `shrine_bound_left_bottom` & `auto_east_silent_mire_seg_0`, rặng Bắc tường ẩn `900px`, `2` cây `W20-BUG-001`.
- **Lighting & Fog:** `fogColor: 2496790`, `fogAlpha: 0.82`, `ambientLight: 0.28`, `ambientColor: 1904918`.

#### 14. `abyssal_chasm` — *The Abyssal Chasm / Vực Sâu Bóng Tối*
- **World Bounds:** `x: 1600, y: -1280, w: 1280, h: 640` | **Default Spawn:** `(2240, -700)`
- **Entry / Exit & Đường nối (`1` outgoing `zones.json`, chưa có trong `ZCR`):** `to_deep_forest_from_ac` (`2200,-680,80×30`) → `deep_forest` `(2240,-600)`.
- **NPC / Boss:** `0` (`spawns: {npcs:[], monsters:[]}`).
- **Quest Objects & Landmarks:** `monolith_abyssal_warning (2240,-740)`, `knight_corpse_cache (1980,-900)`.
- **Resource Nodes:** `4` nodes trong `zones.json.spawns.resources` (`dry_wood`, `flint` ×2, `tree_resin`).
- **Collision:** `6` JSON (`18` live). **Lỗi:** `W20-BUG-011` trống rỗng + hộp hazard đỏ khổng lồ `(2000,-1050,480×160)` án ngữ giữa sân; bị `whispering_grove_sanctum` chồng `480×160`; lối vào từ Nam hỏng vì `W02` (`HW-H4-03-AUDIT`).
- **Lighting & Fog:** `fogColor: 1312796`, `fogAlpha: 0.85`, `ambientLight: 0.15`, `ambientColor: 1312796`.

#### 15. `drowned_mire_depths` — *The Drowned Mire Depths / Đầm Lầy Chìm*
- **World Bounds:** `x: 2880, y: 740, w: 1120, h: 640` | **Default Spawn:** `(3380, 800)`
- **Entry / Exit & Đường nối (`1` outgoing `zones.json`, chưa có trong `ZCR`):** `to_silent_mire_from_dmd` (`3340,740,80×30`) → `silent_mire` `(3380,680)`.
- **NPC / Boss:** `0` (`spawns: {npcs:[], monsters:[]}`).
- **Quest Objects & Landmarks:** `lore_fisherman_diary (3200,920)`, `chest_drowned_mire (3480,1020)`.
- **Resource Nodes:** `4` nodes trong `zones.json.spawns.resources` (`herbs` ×2, `dry_wood`, `flint`).
- **Collision:** `5` JSON (`12` live). **Lỗi:** `W20-BUG-011` trống rỗng (`0` cây/props); lỗi `W05` ở cổng vào từ Bắc.
- **Lighting & Fog:** `fogColor: 1582107`, `fogAlpha: 0.80`, `ambientLight: 0.22`, `ambientColor: 1582107`.

#### 16. `sunken_crypt_ruins` — *The Sunken Crypt of Runes / Hầm Mộ Cổ Ngữ*
- **World Bounds:** `x: 3350, y: -640, w: 1130, h: 640` | **Default Spawn:** `(3600, -100)`
- **Entry / Exit & Đường nối (`1` outgoing `zones.json`, chưa có trong `ZCR`):** `to_rune_puzzle_from_scr` (`3560,-60,80×30`) → `ancient_rune_puzzle` `(3520,180)`.
- **NPC / Boss:** `0` (`spawns: {npcs:[], monsters:[]}`).
- **Quest Objects & Landmarks:** `monolith_crypt_memorial (3900,-340)`, `sarcophagus_black_knight (3920,-450)`.
- **Resource Nodes:** `3` nodes trong `zones.json.spawns.resources` (`flint` ×2, `dry_wood`).
- **Collision:** `4` JSON (`11` live). **Lỗi:** `W20-BUG-011` trống rỗng (`0` kiến trúc hầm mộ).
- **Lighting & Fog:** `fogColor: 1711140`, `fogAlpha: 0.70`, `ambientLight: 0.18`, `ambientColor: 1711140`.

#### 17. `veil_origin_cavern` — *The Veil's Heart Cavern / Hang Cội Rễ Hư Vô*
- **World Bounds:** `x: 480, y: 1440, w: 1120, h: 640` | **Default Spawn:** `(800, 1500)`
- **Entry / Exit & Đường nối (`1` outgoing `zones.json`, chưa có trong `ZCR`):** `to_root_cellar_from_voc` (`760,1460,80×30`) → `sub_root_cellar` `(800,1400)`.
- **NPC / Boss:** `0` (`spawns: {npcs:[], monsters:[]}`). *(Lưu ý Narrative: không tự mặc định là arena Dark Knight trước khi Owner chốt `OQ-15`).*
- **Quest Objects & Landmarks:** `veil_commander_epistle (1040,1760)`, `veil_heart_altar (1040,1860)`.
- **Resource Nodes:** `3` nodes trong `zones.json.spawns.resources` (`flint` ×2, `tree_resin`).
- **Collision:** `5` JSON (`13` live). **Lỗi:** `W20-BUG-011` trống rỗng (`0` thạch nhũ/tường hang).
- **Lighting & Fog:** `fogColor: 986132`, `fogAlpha: 0.90`, `ambientLight: 0.12`, `ambientColor: 986132`.
