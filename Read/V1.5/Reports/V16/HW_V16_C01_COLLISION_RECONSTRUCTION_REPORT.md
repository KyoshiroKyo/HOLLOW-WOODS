# HW-V16-C01 — WORLD COLLISION & INVISIBLE WALL REPAIR REPORT

- **Project:** HOLLOW WOODS (`V1.6.0 — THE UNBROKEN OATH`)
- **Roadmap:** `3.1` (`HW-V16-C01`)
- **Worktree:** `G:\HOLLOW_WOODS_C01`
- **Branch:** `fix/v1.6-c01-collision`
- **Base Checkpoint:** `c9de0c21b0301003895cf2d106229dfef564a2b6` (`fix/v1.6-b08-p2game-compat`)
- **Workspace Isolation:** Root `G:\HOLLOW WOODS` (with uncommitted Track A `A07` work) left untouched.

---

## 1. Before / After Collision & Navigation Metrics

Dữ liệu kiểm toán thu trực tiếp từ runtime headless Chrome (`SwiftShader`, `Noclip = OFF`, tất cả 17 zones) tại [c01_audit_BEFORE.json](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Evidence/HW-V16-C01/c01_audit_BEFORE.json), [c01_audit_AFTER.json](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Evidence/HW-V16-C01/c01_audit_AFTER.json) và [collider_before_after.json](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Evidence/HW-V16-C01/collider_before_after.json).

| Hạng mục đo đạc | Baseline `C01-BEFORE` | Kết quả `C01-AFTER` | Chênh lệch |
| :--- | :---: | :---: | :---: |
| Tổng static physics colliders | `329` | `310` | `-19` collider trùng/lặp |
| `colliderTransitionOverlaps` (Trạng thái khóa mặc định) | `14` | **`0`** | `-14` |
| `colliderTransitionOverlaps` (Trạng thái đã mở khóa cổng) | `13` | **`0`** | `-13` |
| `oobTransitions` (Trigger vượt biên zone) | `3` | **`0`** | `-3` |
| `spawnColliderOverlaps` (`defaultSpawn` đè collider) | `2` | **`0`** | `-2` |
| `oneWayTransitions` (Cổng chỉ 1 chiều) | `1` | **`0`** | `-1` |
| Real **WASD** traversal probes (`Noclip = OFF`) | `7 / 17 PASS` | **`17 / 17 PASS`** | `+10 PASS` |
| `console.error` / `pageerror` | `0 / 0` | **`0 / 0`** | Sạch |

---

## 2. Danh sách Lỗi & Sửa đổi theo Từng Khu vực (Tọa độ Cụ thể)

### A. `W20-BUG-001` — `prop_fallen_log_mossy_v14` & Collider Tán Cây vs Gốc Cây
- **Kiểm chứng Asset:** Kiểm tra trực tiếp trên ổ đĩa ([prop_fallen_log_mossy_v14.png](file:///G:/HOLLOW_WOODS_C01/public/assets/environment/v14/props/prop_fallen_log_mossy_v14.png), kích thước `46x61` và frame `{x: 49, y: 387, w: 46, h: 61}` trong [hollow_props_atlas.json](file:///G:/HOLLOW_WOODS_C01/public/assets/atlases/hollow_props_atlas.json)) cho thấy không có asset thân cây đổ nằm ngang thay thế hợp lệ trong `public/assets/` hay `Asset_Art/` (cả 4 prop `v14/props/prop_fallen_log_mossy_v14.png`, `prop_stump_mossy_large_v14.png`, `prop_tangled_roots_v14.png`, `tree_hollow_ancient_v14.png` đều là sprite cây đứng).
- **Quyết định kỹ thuật:** Giữ nguyên key sprite `'prop_fallen_log_mossy_v14'` (không tráo asset sai nguồn, bảo toàn `test_v15_61`), đồng thời sửa hàm `createFallenLog` trong [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L5766-L5782): chuyển `setOrigin(0.5, 0.5)` sang **`setOrigin(0.5, 1.0)`** và thu gọn collider `'Thân Cây Đổ'` từ `(x, y, Math.round(length * 0.6), 10)` về sát gốc **`(x, y - 4, 18, 10)`**, loại bỏ tường vô hình lơ lửng giữa tán lá.

### B. `W20-BUG-003` — Tường Chu Vi Trùng Lặp & `fog_tree_1/2` Tại `fog_crossing`
- [AutoPerimeterWallsModule.ts](file:///G:/HOLLOW_WOODS_C01/src/world/modules/AutoPerimeterWallsModule.ts#L100-L120): Bổ sung loại trừ tự động cho 4 phân khu đã định nghĩa đủ tường `bound_*` 4 phía trong `zones.json` (`fog_crossing`, `silent_mire`, `broken_bell_shrine`, `whispering_grove_sanctum`), xóa triệt để lớp tường `auto_*` xếp chồng 2–3 lớp và tràn qua trigger `to_fog_crossing`, `to_silent_mire_from_shrine`, `to_deep_forest_from_wc`, `to_whispering_grove_sanctum`.
- [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json):
  - `fog_crossing.to_bellhollow.triggerRect`: `{x: 460, y: 200, width: 20, height: 60}` → **`height: 120`** (`y: 200..320` khớp đối xứng `bellhollow.to_fog_crossing`).
  - `fog_crossing.fog_bound_right_bottom`: `{x: 448, y: 260, width: 32, height: 100}` → **`{x: 448, y: 320, width: 32, height: 40}`** (mở thông nửa dưới lối cổng Tây).
  - `fog_tree_1`: `(160, 100)` → **`(160, 65)`**; `fog_tree_2`: `(300, 240)` → **`(300, 310)`** (khớp [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L2684-L2685)).

### C. `HW-H4-03-AUDIT` — `deep_forest -> abyssal_chasm` Chặn Ở `y = -622`
- [GameScene.ts](file:///G:/HOLLOW_WOODS_C01/src/scenes/GameScene.ts#L4080-L4083): Nới giới hạn `physics.world.setBounds` trong `applyCameraBoundsForZone` (`top = Math.min(-250, zoneBounds.y - 60)`, `bottom = Math.max(1150, zoneBounds.y + zoneBounds.height + 60)`), cho phép chân nhân vật bước qua `triggerRect` `to_abyssal_chasm` (`y: -640..-624`) khi đã mở khóa thay vì bị kẹp tại `y = -622`.
- [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L6501): Dời collider khóa cổng `'Phong Ấn Cổng Hư Không'` khi chưa mở khóa từ `(x, y - 10, 72, 24)` (`y: -642..-618` đè lên `triggerRect`) sang **`(x, y + 6, 72, 16)`** (`y: -622..-606`), chặn cứng trước ngưỡng cửa khi khóa và mở thông hoàn toàn khi mở khóa (`abyssal_gate_locked`: stayed `y = -588`; `deep_forest_to_abyssal_unlocked`: walked `[W]` straight into `abyssal_chasm`).

### D. `MAP-BUG-001`, `MAP-BUG-002`, `MAP-BUG-003` & Các Overlap / OOB Còn Lại
| Khu vực / Bug | Trước khi sửa | Sau khi sửa | Tệp |
| :--- | :--- | :--- | :--- |
| **`MAP-BUG-001`** (`sub_whispering_clearing`) | `auto_south_whispering_grove_sanctum_seg_end` (`1640, -376, 440x32`) đè `to_deep_forest_from_wc` & `to_whispering_grove_sanctum`; `crooked_path <-> sub_whispering_clearing` chỉ 1 chiều | Tắt auto wall cho `whispering_grove_sanctum`; thêm `to_whispering_clearing_from_cp` (`1800, 0, 80x24`); tách `'Rặng Cây Viền Bắc Tây'` (`1640..1796`) & `'Rặng Cây Viền Bắc Giữa'` (`1884..1980`); nhất quán rule mở khóa `Q03+` cho `sub_whispering_clearing` | [AutoPerimeterWallsModule.ts](file:///G:/HOLLOW_WOODS_C01/src/world/modules/AutoPerimeterWallsModule.ts#L100-L120), [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L5950-L5958), [WorldGatingSystem.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldGatingSystem.ts#L241-L254), [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json) |
| **`MAP-BUG-002`** (`whispering_grove_sanctum`) | Chồng tọa độ `480x280` lên `deep_forest` & `480x160` lên `abyssal_chasm`; `defaultSpawn (1600, -420)` & cổng đè `df_bound_left`; `executeTransition` gọi `applyCameraBoundsForZone` sau `body.reset` làm kẹp `y` vào `-250` | Dịch tọa độ `whispering_grove_sanctum` sang vùng trống Tây Bắc `bounds {x: 480, y: -800, w: 960, h: 440}` (`defaultSpawn 960, -420`, cổng `920..1000, -400..-370`); đổi thứ tự `applyCameraBoundsForZone` trước `setPosition`+`body.reset` trong `executeTransition`; mở rộng `SafeSpawnResolver.WORLD_BOUNDS` (`minY: -1300, maxY: 2100`) | [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json), [GameScene.ts](file:///G:/HOLLOW_WOODS_C01/src/scenes/GameScene.ts#L4335-L4348), [SafeSpawnResolver.ts](file:///G:/HOLLOW_WOODS_C01/src/systems/SafeSpawnResolver.ts#L33-L38), [SafeSpawnResolver.ts](file:///G:/HOLLOW_WOODS_C01/src/systems/SafeSpawnResolver.ts#L191-L193) |
| **`MAP-BUG-003`** (`ancient_rune_puzzle`) | `to_silent_mire_from_puzzle` (`x: 3310, w: 25`) OOB ngoài `bounds.x = 3350`; `'Đèn Đá Nghi Thức'` `(3368, 250)` đè `to_rune_puzzle` và `defaultSpawn (3380, 260)` | Mở rộng `ancient_rune_puzzle.bounds` thành `{x: 3310, y: 150, width: 390, height: 280}` (giữ tâm sân đá `(3520, 280)` & `test_v15_41`); dời Đèn Đá Tây lên **`(3368, 200)`** | [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json), [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L6944-L6946) |
| `crooked_path -> to_outer_woods_from_cp` | `bell_bound_east_bottom` (`1598, 360, 32x208`) tràn sang `1630` đè trigger (`30x120px`) | Thu `bell_bound_east_top` & `bell_bound_east_bottom` về **`x: 1568`** (`1568..1600`) | [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json) |
| `crooked_path -> to_deep_forest` | `'Biển Chỉ Dẫn'` `(2100, 45)` đè trigger (`14x7px`) | Dời sang **`(2185, 58)`** mép Đông cổng Rừng Sâu | [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L5844-L5847) |
| `outer_woods -> to_bellhollow_from_ow` | Cụm thông phụ `(1170, 585)` (`'Gốc Cây Pixel Art'`) đè trigger (`18x4px`) | Dời cây phụ sang `{ dx: -18, dy: 12 }` (`1127, 607`) | [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L5297-L5302) |
| `silent_mire <-> broken_bell_shrine` | `shrine_bound_left_bottom` (`3980, 360`) & `auto_east_silent_mire_seg_0` (`3984, 100`) đè cả 2 chiều cổng | Căn `to_shrine` `height: 120` (`240..360`), `sm_bound_right_bottom` `y: 360, h: 350`, `shrine_bound_left_top/bottom` `x: 4000`, tắt auto wall | [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json), [ZoneConnectionRegistry.ts](file:///G:/HOLLOW_WOODS_C01/src/world/ZoneConnectionRegistry.ts#L694-L697) |
| `deep_forest -> to_whispering_clearing` | `'Cột Mốc Khoảng Trống Tây/Đông'` (`x ± 33`) cấn `3x12px` hai mép trigger `1810..1870` | Mở rộng cự ly 2 cột mốc thành **`x ± 40`** | [WorldBuilder.ts](file:///G:/HOLLOW_WOODS_C01/src/world/WorldBuilder.ts#L6581-L6598) |
| `silent_mire -> to_drowned_mire_depths` & `sub_root_cellar -> to_veil_origin_cavern` | Trigger lố biên Nam `+4px` (`y=720+24=744 > 740`; `y=1420+24=1444 > 1440`) | Kéo lùi về **`y: 716`** & **`y: 1416`** (`<= bounds.y + bounds.height`) | [zones.json](file:///G:/HOLLOW_WOODS_C01/src/data/zones.json) |
| **Sanctuary Farm `(648, 741)`** | Đã kiểm chứng trước | Không đổi, xác nhận di chuyển `WASD` tự do (`(648, 741) -> (689.1, 741)`) | — |

---

## 3. Kết quả Thực thi Di chuyển WASD Thật & Kiểm thử

Tất cả 17 tuyến kiểm thử **WASD** (`Noclip = OFF`) đạt **17/17 PASS** sau chỉnh sửa cuối cùng ([c01_audit_AFTER.json](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Evidence/HW-V16-C01/c01_audit_AFTER.json)):
- **Locked check:** `abyssal_gate_locked` dừng đúng ở `deep_forest (2240, -588)` khi giữ `[W]`.
- **Unlocked bidirectional & boundary crossings PASS:** `fog_crossing <-> bellhollow`, `deep_forest -> abyssal_chasm`, `silent_mire -> ancient_rune_puzzle`, `silent_mire <-> broken_bell_shrine`, `sub_whispering_clearing <-> whispering_grove_sanctum`, `crooked_path <-> sub_whispering_clearing`, `crooked_path -> outer_woods`, `crooked_path -> deep_forest`, `outer_woods -> bellhollow`, `sanctuary_farm (648, 741)`, `silent_mire -> drowned_mire_depths`, `sub_root_cellar -> veil_origin_cavern`.

### Automated Regression & Build Results (Sau edit cuối)
- `npm run check` (`tsc --noEmit`): **PASS** (`0` lỗi).
- `npm run verify:data`: **15/15 PASS**.
- `npm run build`: **PASS** (`14.44s`, 101 modules transformed).
- `node scripts/test_v15_40_rune_puzzle_colliders.mjs`: **12/12 PASS**.
- `node scripts/test_v15_61_pixel_art_trees_and_village_clean.mjs`: **PASS**.
- `node scripts/verify_v15_03_corner_sliding_and_colliders.mjs`: **20/25 PASS** (5 kiểm tra legacy không thuộc phạm vi `C01` giữ nguyên baseline V15.4: `NPCEntity` offset/size & `createTree` `18x10` vs `20x16`).
- `python tests/hw_bug_21b_walk_run_verification.py`: **10/10 PASS**.
- `python tests/hw_bug_26b_walkrun_fix_verification.py`: **5/5 PASS**.

### Ảnh Bằng Chứng `F9` Collision Overlay ON / OFF
Thư mục ảnh đầy đủ tại [Visuals/HW-V16-C01](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/):
- `fog_crossing`: [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_fog_crossing_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_fog_crossing_ON.png) / [AFTER_OFF](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_fog_crossing_OFF.png)
- `deep_forest -> abyssal_chasm` (unlocked): [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_deep_forest_abyssal_unlocked_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_deep_forest_abyssal_unlocked_ON.png) / [AFTER_OFF](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_deep_forest_abyssal_unlocked_OFF.png)
- `sub_whispering_clearing` & `prop_fallen_log_mossy_v14`: [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_whispering_clearing_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_whispering_clearing_ON.png)
- `whispering_grove_sanctum`: [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_sanctum_spawn_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_sanctum_spawn_ON.png)
- `silent_mire <-> broken_bell_shrine`: [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_shrine_gate_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_shrine_gate_ON.png)
- `ancient_rune_puzzle`: [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_ancient_rune_puzzle_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_ancient_rune_puzzle_ON.png)
- `crooked_path` lối Bắc: [BEFORE_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/BEFORE_crooked_path_north_ON.png) → [AFTER_ON](file:///G:/HOLLOW_WOODS_C01/Read/V1.5/Reports/Visuals/HW-V16-C01/AFTER_crooked_path_north_ON.png)

---

## 4. Phạm vi loại trừ (Không chạm theo yêu cầu C01)
- Không tái cấu trúc toàn bộ mỹ thuật/tileset 17 phân khu (thuộc `C02–C10`).
- Không thay đổi World Map UI (`ParchmentWorldMapModal.ts`), tỷ lệ hay hitbox nhân vật (`18x12` / `1.50`), không phá bỏ cổng cốt truyện `WorldGatingSystem`, và không chỉnh sửa/phát triển Headless Warden.
- Backup mã nguồn trước sửa được lưu cục bộ (không commit) tại `G:\HOLLOW_WOODS_C01\Backups\steps\backup_hw_v16_c01\`.
