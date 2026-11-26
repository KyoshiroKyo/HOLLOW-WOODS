# HW-NR-11 — ENVIRONMENTAL STORYTELLING & WORLD INTEGRATION PLAN (`WORLD 2.0 × CANON LORE`)

- **Mission ID:** `HW-NR-11 — ENVIRONMENTAL STORYTELLING & WORLD INTEGRATION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Dependencies:** `HW-WORLD-20A` + `APPROVED WORLD BIBLE` ([WORLD_AND_MAP_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/WORLD_AND_MAP_REGISTRY.md), [WORLD_RECONSTRUCTION_PRIORITY_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/WORLD_RECONSTRUCTION_PRIORITY_PLAN.md), [DEVELOPMENT_EXECUTION_QUEUE.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DEVELOPMENT_EXECUTION_QUEUE.md))
- **Mode:** **`DESIGN SPECIFICATION & MOCKUP ONLY` (`HARD STOP` — `0` sửa source, `0` sửa map JSON, giữ nguyên `17` zone IDs, `41` transitions topology, Quest Objects & `HW-H4-06` performance contract)**
- **Primary Sources Verified:** `src/data/zones.json` (`17` zones), `src/world/WorldBuilder.ts` (`L8074`), [HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_MAP_LAB_01_PLAYABLE_FOREST_REPORT.md), [HW_H4_06_PERFORMANCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_06_PERFORMANCE_REPORT.md), [HW_TILESET_COMPATIBILITY_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TILESET_COMPATIBILITY_MATRIX.md).

---

## 1. Quy Chuẩn Mỹ Thuật, Giấy Phép Tileset & Bảo Toàn Hiệu Năng `HW-H4-06`

### 1.1 Nguồn Tileset Hợp Lệ (`32×32 px` Top-Down 45° — Đã Đối Chiếu License)
- **Chủ đạo Rừng & Di tích (`Resurrected RPG 1.1` — Immunity, License thương mại đã xác minh tại `LAB-01`):** `Grass.png`, `Grass 2 layer.png`, `Plants.png`, `PlantShadow.png`, `Props.png`, `Wall.png`, `lab01_props_atlas` (`1024×1024`, cây cổ thụ `128–256px` origin `(0.5, 0.95)`, 11 cấu trúc đá/tượng/bàn thờ/cổng vòm) + `resurrected_dirt_path.png` (autotile 4-bit).
- **Làng & Nông trại:** `Serene Village Revamped v1.9` + `Houses Pack` + `EPIC RPG World - Grass Land 2.0` (đã xác minh tương thích Phaser 4).
- **Tàn tích, Đầm lầy, Hang & Giao diện:** `EPIC Ancient Ruins`, `Dead Swamp`, `Mangrove Swamp Sampler`, `DarkFantasy FREE Starter`, `RF Catacombs v1.0`, `Kauzz Cave Tiles & RPGW Caves`, `TF DarkDimension`, `Pocket Inventory Series #2 Pixel Map`.
- **CẤM dùng trực tiếp làm prop map:** `Mystic_Autumn_Knights` (chưa xác nhận đủ license thương mại tại `00F`) & `32x32/64x64Materials.png` (chưa tách nền trắng).

### 1.2 Quy Tắc Bố Cục Chiều Sâu & Bảo Toàn `HW-H4-06` Performance
1. **Không um tùm / không lộn xộn:** Mọi đường mòn chính rộng **`72–96 px`**, khe hở giữa 2 collider liền kề **`>= 36 px`** (gấp đôi foot hitbox `18×12`), vùng đệm trống **`>= 48 px`** quanh mọi `triggerRect` chuyển vùng, gỡ toàn bộ `20` cây đổ lỗi `W20-BUG-001`.
2. **Bảo toàn `HW-H4-06` (`59.90 FPS` VSync / `173.45 FPS` uncapped trên `GTX 1070 Ti`):**
   - Toàn bộ nền đất, đường mòn, rêu, nền nhà và mặt nước tĩnh phải **pre-bake vào CanvasTexture từng zone (`32×32`)** và quản lý qua `WorldBuilder.hibernateDistantZoneObjects()` (`WorldBuilder.ts:8074`).
   - **Tuyệt đối không dùng `Phaser.GameObjects.Graphics` tĩnh lồng trong `Container`** cho bàn thờ/cột đá/vũng nước (đây chính là nguyên nhân gây `~65–140` WebGL batch flushes đã được `HW-H4-06` dọn dẹp). Dùng Atlas Sprite `Image` với `Tree_Trunks` (`depth = y`) và `Tree_Canopies` (`depth = y + 0.5`), giữ draw calls **`<= 80`** (rừng) / **`<= 120`** (làng).
3. **Khóa Narrative & Topology:** **KHÔNG** thay đổi `zoneId`, `41` transition links (`A→E→B→D→F→E→C→A`), `5` NPC Bellhollow, `Sir Vaelen`, quest items; **KHÔNG** tự đặt thêm tên kỵ sĩ mới ngoài Lore hiện có hoặc đặt Boss vào `veil_origin_cavern`/`sunken_crypt_ruins` trước khi Owner ký `DEC-LOCK-14/16`.

---

## 2. Thiết Kế Cảnh Quan, Kể Chuyện Môi Trường & Mockup `BEFORE / AFTER`

### 2.1 `bellhollow` — *Làng Chuông Cổ (`Safe Zone`)*
- **Ý đồ kể chuyện môi trường:** Thể hiện ngôi làng từng yên bình nhưng mang dấu vết cô lập qua năm tháng: Tháp Chuông đá cổ ở Bắc-Trung tâm nứt nhẹ (`bell_tower_altar` hướng tới nghi thức `The First Toll`), Bảng Tin `3` Quy Tắc Bằng Máu (`bellhollow_notice_board`) đặt ngay đầu trục vào để dẫn mắt người chơi, Gốc Sồi Ngàn Năm (`env_ancient_oak_hollow (760,120)`) kết hoa dại & ánh sáng xanh dịu tách biệt khỏi gạch quảng trường.
- **Mockup Bố Cục (`BEFORE` vs `AFTER`):**
```text
[BEFORE - bellhollow y=120..520]                  [AFTER - Proposed (HW-WORLD-20B)]
 Garth(540) ──► [LỀU+ĐÈN+RƯƠNG CHẶN y=260]         Garth(540) ══► [TRỤC CHÍNH 96px THÔNG SUỐT y=240..300] ══► Cổng Đông(1475)
                   │ (W20-BUG-002 FAIL W01)                          │                         │                    │
                   ▼                                    Bắc: Notice(650) + Tháp Chuông(900)  Lửa trung tâm(860)   Lò Bram(1333)
            Nấm mọc trên gạch quảng trường              Nam-Tây: Lều+Rương dời xuống sân phụ + Neris(570)        & Bàn chế(1395)
```
- **Danh sách thay đổi đề xuất:**
  - Dùng `Serene Village Revamped v1.9` + `Houses Pack` đồng bộ mái ngói rêu sẫm cho `house_edda`, `house_neris`, lò rèn `npc_bram (1333,477)`, và giếng nước `npc_finn (909,231)`.
  - Dời `camp_shelter_tent (778,261)` / `camp_storage_chest (775,295)` / đèn lồng lệch xuống sân trú ẩn phụ phía Nam-Tây để trục Tây–Đông `y=240..300` thông `96px`; gỡ nấm rác trên nền đá lát; tách chồng bounds với `sanctuary_farm`/`outer_woods`; giảm `92` colliders dư để xóa spike `30.12 FPS`.

### 2.2 `outer_woods` — *Rừng Ngoại Vi & Trạm Lửa `Sir Vaelen`*
- **Ý đồ kể chuyện môi trường:** Không gian giao thoa giữa ấm áp ánh lửa lời thề của `Sir Vaelen` và dấu tích chiến tuyến cũ. Cụm **`env_knights_memorial_stele (1260,645)`** (12 hiệp sĩ ngã xuống & tên vị Thủ Lĩnh/Chỉ Huy bị chém mòn — sửa `Sir Valen → Sir Vaelen` khi `HW-NR-09` mở khóa) được bài trí thành **góc bia đá trang nghiêm** cạnh đường mòn rẽ Nam về Xưởng Chuông; **`env_echo_ruins_prayer (1480,840)`** là bậc đá đổ có dấu nến cũ và thanh gươm gỉ cắm mốc.
- **Mockup Bố Cục (`BEFORE` vs `AFTER`):**
```text
[BEFORE - outer_woods]                            [AFTER - Pilot LAB-01 Architecture (HW-WORLD-20B)]
 (1161,576) Cây đè cổng Bắc                       Cổng Bellhollow (1150..1270) thoáng >= 48px
 (1445..1450) TRIPLE STACK: Sồi+Rương+Trạm        Sân trạm kiểm lâm(1420) ── 52px ──► Rương(1445)
 (1135,670) Cây đổ W20-BUG-001                    Đường mòn đất Resurrected RPG 96px:
                                                    ├─ Bắc→Nam: tới Xưởng Chuông(1320,1000)
                                                    ├─ Tây: qua Bia Tưởng Niệm 12 Kỵ Sĩ(1260,645) (có viền đá + đèn tàn)
                                                    └─ Đông: Sân lửa Sir Vaelen(1435..1470,710) quanh thoáng + shortcut(1540)
```
- **Danh sách thay đổi đề xuất:**
  - Áp chuẩn `LAB-01` (`Resurrected RPG 1.1`): thay cây bằng `Tree_Trunks` (`22–38×12–14px`) + `Tree_Canopies` (`depth = y + 0.5`), đường mòn autotile `resurrected_dirt_path.png` rộng `96px`.
  - Gỡ **Triple Stack `W20-BUG-006`** `(1445..1450, 650..662)`, dời cây `(1161,576)` khỏi `to_bellhollow_from_ow`, bỏ `W20-BUG-001 (1135,670)`. Giữ nguyên tọa độ `Sir Vaelen (1435,710)` & bếp lửa `(1470,710)`.

### 2.3 `sanctuary_farm` — *Nông Trại Trú Ẩn*
- **Ý đồ kể chuyện môi trường:** Điểm tựa sinh tồn sạch sẽ bên ngoài lũy làng: 4 luống Thảo Dược Bạc viền gỗ mộc (`read_herb_terrace_sign`), rổ thu hoạch cạnh bàn sơ chế thảo mộc, giếng đá cổ (`farm_water_well`) và ao nước dùng tile nước `EPIC Grass Land 2.0` + lá sen thay vòng tròn `Graphics`.
- **Mockup & Thay đổi (`BEFORE` vs `AFTER`):**
  - *Trước:* `3` vùng `[E]` chồng khít nhau tại `(650..702, 625..640)`; hàng rào đâm xuyên thân cây `(505,840)` (`W20-BUG-005`); ao tròn vẽ `Graphics`.
  - *Sau (`HW-WORLD-20B`):* Tách khoảng cách trigger `[E]` giữa `farm_storage_chest`, `farm_processing_bench`, `farm_herb_terrace_sign` tối thiểu `>= 40 px`; nắn lại hàng rào ngoài cây; thay ao `Graphics` bằng tile nước + collider bờ mượt; lối cầu thang/cửa sập `to_root_cellar (780,1000)` viền đá rêu rõ ràng.

### 2.4 `deep_forest` — *Rừng Sâu (Khu Encounter Kỵ Sĩ Bóng Tối & Mảnh Cổ Ngữ)*
- **Ý đồ kể chuyện môi trường:** Chuyển sắc thái sang xanh-xám lạnh (`Resurrected RPG` tầng cây cao + mảnh phế tích `EPIC Ancient Ruins`), ánh đèn mờ hắt qua tán cao tạo chiều sâu mà **không làm mù tầm nhìn** xung quanh trục tuần tra `The Listener` / `GoblinScout` và đấu trường **`HoodedKnightBoss (2340, -190)`**. Bố trí cột đổ, bệ đá vỡ và vũ khí gãy quanh ranh giới `2340, -190` như chiến trường cũ bị bỏ lại sau biến cố.
- **Mockup Bố Cục (`BEFORE` vs `AFTER`):**
```text
[BEFORE - deep_forest]                            [AFTER - Proposed (HW-WORLD-20C)]
 (y=-640) Lỗi HW-H4-03-AUDIT khóa lối lên AC       Mở bounds Y lên abyssal_chasm (PASS W02)
 (2100,-340) STACKING 5 LỚP + (2340,-490) 3 LỚP    Tách sạch các prop >= 48px quanh totem(2100,-320) & nest(2340,-490)
 4 cây W20-BUG-001 làm kẹt di chuyển               Sân chiến trường Cổ Tự(2340,-190): nền đá vỡ thoáng cho Boss + 2 cột ẩn nấp
```
- **Danh sách thay đổi đề xuất:** Mở `physics.world.bounds.y` (`HW-H4-03-AUDIT`), dọn cụm stacking `W20-BUG-004`, bỏ `4` cây `W20-BUG-001`, gỡ chồng bounds với `sub_whispering_clearing` & `sanctum`, chuyển toàn bộ `34+` cây sang `Tree_Trunks`/`Tree_Canopies`.

### 2.5 `silent_mire` — *Đầm Lầy Tĩnh Lặng*
- **Ý đồ kể chuyện môi trường:** Vùng nước độc và di tích đầm lầy ngập rễ (`Dead Swamp` + `Mangrove Swamp Sampler`). **`env_broken_sword_mire (3120,460)`** (thanh đại kiếm gãy cắm trên gò đá rêu cùng dải băng bạc màu và **các cọc gỗ khắc cổ ngữ `Algiz` dẫn lối vật lý** qua bùn lầy — bảo toàn `lore_broken_sword_mire`), **`env_echo_mire_path (3420,380)`** ven đường ván gỗ, và Phong Ấn Rễ Cổ (`sm_shrine_gate_ward (3960,280)`) quấn rễ sậm trước cây cầu sang Miếu Chuông.
- **Mockup & Thay đổi (`BEFORE` vs `AFTER`):**
  - *Trước:* Hộp nước `sm_water_*` cắt AABB vuông góc thô (`W20-BUG-008`), rặng tường ẩn `535–575px`, `18` detached colliders, `W05` OOB `+4px` xuống `drowned_mire_depths`.
  - *Sau (`HW-WORLD-20D`):* Đúc bờ lầy + lối cầu ván gỗ `32×32` uốn lượn tự nhiên; băm collider mặt nước bám theo hình thật vũng bùn; kéo `to_drowned_mire_depths` lọt trong `bounds.maxY`; bỏ `18` colliders lạc & `W20-BUG-001`.

### 2.6 `12` Di Tích & Phân Khu Còn Lại (`Grouped Specification`)
| Phân khu (`Zone ID` giữ nguyên) | Chủ đề kể chuyện môi trường & Landmark bảo toàn | Thay đổi World 2.0 trọng tâm & Pack sử dụng (`Tách riêng HW-WORLD-*`) |
| :--- | :--- | :--- |
| **`fog_crossing`** | Điểm tỉnh dậy đầu game (`Act 0`): cổng vòm đá sương phủ, cột gỗ `fog_sign`, `fog_journal_scrap_1`, ánh sáng dẫn sang Đông Bellhollow. | **`HW-WORLD-20B`:** Áp `Resurrected RPG 1.1` + sương mịn `fog_smooth`; bỏ collider rác `fog_tree_1/2`, gỡ `W20-BUG-001` & tường biên `2–3` lớp (`W20-BUG-003`). |
| **`crooked_path`** | Trục chữ S nối làng vào rừng sâu; **`env_elian_unsent_letter (1980,240)`** ở gốc cây rỗng với mảnh đèn tuần tra; **`env_stone_chessboard (2340,310)`** bàn cờ đá `'C.K' vs 'H.K'` bỏ dở ván thứ `142`. | **`HW-WORLD-20C`:** `Resurrected RPG` + `EPIC Grass Land 2.0` + `Ancient Ruins`; bỏ tường đôi mép Nam (`W20-BUG-007`), dời biển báo `(2093,38)` khỏi mép cổng, mở cổng 2 chiều về `sub_whispering_clearing`. |
| **`sub_bell_workshop`** | Phế tích lò đúc chuông cũ: bàn chế tác Khuôn Đúc, `inspect_runed_iron_part`, bia `inspect_black_knight_stele` & `env_bellmaker_dew_journal` *(chờ sửa chữ spoil `Chỉ Huy` ở `HW-NR-09`)*. | **`HW-WORLD-20E`:** `Serene Village` + `Resurrected RPG`; thay vòng sàn đá đặt lạc lõng trên cỏ bằng tường gạch đổ nứt + bụi tro + đe sắt đồng bộ. |
| **`sub_root_cellar`** | Hầm thảo mộc cổ & Mạch Rễ ngầm: `inspect_fog_origin_mural (780,1150)`, bàn thí nghiệm `env_root_cellar_alchemy`, suối tinh khiết & nấm dạ quang. | **`HW-WORLD-20E`:** Xóa **100% vector `Graphics` placeholder** (`W20-BUG-010`), thay bằng `Kauzz Cave Tiles & RPGW Caves` + rễ & nấm phát sáng `Resurrected RPG`; kéo cổng Nam hết OOB `4px`. |
| **`sub_whispering_clearing`** | Bãi đá vọng âm `SQ04`: `3` trụ đá `inspect_echo_pillar_1..3` xếp hình tam giác cân đối. | **`HW-WORLD-20C`:** `EPIC Ancient Ruins` + `DarkFantasy FREE` thay `3` cột vector tím và nền tím cắt gắt; sửa **`MAP-BUG-001`** tường chặn 2 cổng Bắc & cây `x=2000` lố biên. |
| **`whispering_grove_sanctum`** | Thánh địa tĩnh lặng ánh nắng hổ phách: `elder_grove_altar`, cây đại thụ rễ cổ & nguồn nhựa `elder_tree_sap_node`. | **`HW-WORLD-20C`:** Sửa **`MAP-BUG-002`** (tách chồng bounds & dời `defaultSpawn (1600,-420)` ra khỏi tường); dựng bậc đá thánh địa & tán sồi khổng lồ `Resurrected RPG`. |
| **`ancient_rune_puzzle`** | Sân cổ ngữ 3 cột đá (`Trăng Khuyết – Rễ Rừng – Con Mắt`), `rune_clue_stele`, cầu thang xuống hầm mộ. | **`HW-WORLD-20D`:** Sửa **`MAP-BUG-003`** (kéo `to_silent_mire_from_puzzle` vào trong bounds, dời Đèn Đá khỏi trigger); thay toàn bộ trụ/đèn vector `Graphics` bằng `EPIC Ancient Ruins` + `Dead Swamp`. |
| **`broken_bell_shrine`** | Phế tích Miếu Chuông (`BossMireWarden`, `3` trụ phong ấn, `bell_tongue_item`, `shrine_cracked_bell`, `env_shrine_parchment_map`). | **`HW-WORLD-20D`:** `Resurrected RPG` + `EPIC Ancient Ruins` + `Dead Swamp`; gỡ tường cấn cổng Tây (`W20-BUG-009`), thay tường ẩn Bắc `900px` bằng vách đá/rễ thật; giữ thoáng sân đấu Boss. |
| **`abyssal_chasm`** | Bờ vực đá tối: `monolith_abyssal_warning`, `knight_corpse_cache`, Cổng Hư Không phía sâu. | **`HW-WORLD-20E`:** Gỡ hộp hazard đỏ khổng lồ `(2000,-1050)` (`W20-BUG-011`) & chồng bounds `sanctum`; dựng vách vực `TF DarkDimension` + `Kauzz Cave` + `portal-Sheet`. |
| **`drowned_mire_depths`** | Đầm lầy chìm sâu: `lore_fisherman_diary`, `chest_drowned_mire`, cầu gỗ mục. | **`HW-WORLD-20E`:** `Dead Swamp` + `Mangrove Swamp Sampler` lấp kiến trúc trống (`W20-BUG-011`), nối cầu ván thông cổng Bắc hết lỗi `W05`. |
| **`sunken_crypt_ruins`** | Hầm mộ kỵ sĩ: `monolith_crypt_memorial`, `sarcophagus_black_knight` *(chưa tự gán danh tính hay Boss `Headless Warden` trước `DEC-LOCK-14`)*. | **`HW-WORLD-20E`:** `RF Catacombs v1.0` + `DarkFantasy FREE Starter` dựng hành lang gạch cổ, đuốc tường, bậc đá. |
| **`veil_origin_cavern`** | Hang cội rễ sâu nhất: `veil_commander_epistle (1040,1760)` *(sửa chữ theo `DEC-LOCK-02`)* & `veil_heart_altar (1040,1860)`. | **`HW-WORLD-20E`:** `Kauzz Cave Tiles` + `TF DarkDimension`, ánh sáng tím dịu không chớp nhiễu Classic Sanity 2.1. |

---

## 3. Phân Rã Nhiệm Vụ Thực Thi `HW-WORLD-*` & Hard Stop

Toàn bộ việc chỉnh sửa bản đồ production được **tách riêng thành `5` bước tuần tự** (`TASK-A01..A04` + `HW-WORLD-20F` trong [DEVELOPMENT_EXECUTION_QUEUE.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DEVELOPMENT_EXECUTION_QUEUE.md)):
1. **`HW-WORLD-20B` (`Pilot`): `fog_crossing` → `outer_woods` → `bellhollow` → `sanctuary_farm`** *(Không phụ thuộc `OQ-01..20`, có thể chạy trước sau khi Owner duyệt).*
2. **`HW-WORLD-20C`: `crooked_path` → `deep_forest` → `sub_whispering_clearing` → `whispering_grove_sanctum`.**
3. **`HW-WORLD-20D`: `silent_mire` → `ancient_rune_puzzle` → `broken_bell_shrine`.**
4. **`HW-WORLD-20E`: `sub_bell_workshop` → `sub_root_cellar` → `abyssal_chasm` → `drowned_mire_depths` → `sunken_crypt_ruins` → `veil_origin_cavern`** *(riêng tầng boss mới chờ `DEC-LOCK-14/16`)*.
5. **`HW-WORLD-20F`: `ZoneConnectionRegistry` (`10 → 17` nodes) + `ParchmentWorldMapModal` (`10 → 17` zones dùng `Pocket Inventory #2`) + Đo FPS Gate (`>= 59.5 FPS` VSync).**

> **HARD STOP:** Tài liệu này chỉ là bản thiết kế và mockup BEFORE/AFTER. **Chưa sửa `zones.json`, `maps/*.json`, `WorldBuilder.ts`, không đổi `zoneId`, không đổi `41` transitions, không tự thêm Lore mới, không xóa tài nguyên, không commit/push.**