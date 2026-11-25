# HW-H4-03 — WORLD COLLISION & WALKABLE PATH FIX REPORT

- **Mã nhiệm vụ:** `HW-H4-03` (HYDRO HIGH ENGINEERING PROTOCOL V4)
- **Branch / HEAD:** `feat/v1.5.3-ag-world-polish` / `0617668a97f462877cbe2c30d304323e8fd48f6e` (giữ nguyên local chưa commit; không `commit`, không `push`, không `reset`)
- **Phạm vi sửa đổi:** 1 lỗi chính + 2 lỗi phụ độc lập trong cùng cụm hành lang **Silent Mire** (`src/world/WorldBuilder.ts`, `src/data/zones.json`).
- **Sao lưu trước khi sửa:** [Backups/steps/backup_hw_h4_03](file:///g:/HOLLOW%20WOODS/Backups/steps/backup_hw_h4_03) (`WorldBuilder.ts`, `zones.json`).
- **Bảo toàn các hạng mục đã nghiệm thu:** Giữ nguyên Classic Sanity 2.1, [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts) (`HW-H4-01`), Sanctuary Farm `(648, 741)` + đồ họa đống củi `(650, 715)` + collider nhà kho/hàng rào, Idle `160ms/frame`, bộ audio manifest của Owner (`scripts/AUDIO_SOURCES_MANIFEST.*`, `scripts/generate_audio_sources_manifest.mjs`), và **không đổi kích thước hitbox nhân vật** (`18x12` tại `[x-9, y-18, x+9, y-6]`).

---

## 1. Tóm Tắt Các Lỗi Đã Khắc Phục (Cụm Hành Lang Silent Mire — 1 Chính + 2 Phụ)

### 1.1. [Lỗi Chính] Lối Nối `Crooked Path ↔ Silent Mire` & Biển Chỉ Dẫn Chắn Giữa Đường (`x = 2864..2947, y = 215..378`)

- **Zone:** `crooked_path` / `silent_mire`
- **Trước khi sửa (Before):**
  - Collider `sm_bound_left_top_2` (`x: 2880..2910, y: 240..260`), tường tự động `auto_west_silent_mire_seg_1` (`x: 2864..2896, y: 240..260` nhô sang `crooked_path` 16px), `Rặng Cây Khô Viền Tây Giữa Silent Mire` (`x: 2895..2930, y: 235..265`) và `Cột Mốc Đá` (`x: 2900..2912, y: 249..259`) chặn nửa bắc của `to_silent_mire` (`x: 2860..2880, y: 240..400`), đồng thời `to_crooked_path_from_sm` bị lệch xuống `y: 260..400`. Khi đi bộ hướng Đông tại `y = 248` (`cpToMireY248`), nhân vật va chạm tại `x = 2855` (`bR: true`) và bị trượt lên `y = 241.7`.
  - `Biển Chỉ Dẫn` (`createStoneSign(2940, 300, 'ĐẦM LẦY TĨNH LẶNG')`, AABB `2933..2947, 293..303`) nằm giữa lòng đường `y = 290..310`, ngay trước `to_silent_mire.targetSpawn (2940, 320)`.
- **Thay đổi đã áp dụng:**
  - [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json): Chỉnh `sm_bound_left_top_2` thành `(2880, 215, 30, 15)` (`y: 215..230`); thu gọn `to_deep_forest_from_sm.triggerRect` còn `y: 160..215` (`returnPoint: 2920, 188`); mở rộng `to_crooked_path_from_sm.triggerRect` thành `y: 240..400` (`height: 160`) đối xứng với `to_silent_mire`.
  - [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Chỉnh `Rặng Cây Khô Viền Tây Giữa Silent Mire` thành `(2895, 215, 35, 15)` (`y: 215..230`), dời `Cột Mốc Đá` Tây Bắc lên `(2900, 222)` (`2900..2912, 221..231`), và dời `Biển Chỉ Dẫn` (`createStoneSign`) sang lề cỏ phía Nam tại `(2945, 374)` (`2938..2952, 367..377`), giữ trọn trục đường `y = 248..365` thông thoáng.
- **Sau khi sửa (After):**
  - `auto_west_silent_mire_seg_1`: `2864..2896, y: 215..240`; `Biển Chỉ Dẫn`: `2938..2952, y: 367..377`.
  - Thực nghiệm bàn phím thật (`Noclip = OFF`):
    - `cpToMireY295` (`KeyD`, giữa đường `y = 295`): `reached = true`, `blockedCount = 0`, qua `silent_mire (2973.7, 295)`.
    - `mireToCpY295` (`KeyA`, giữa đường `y = 295`): `reached = true`, `blockedCount = 0`, về `crooked_path (2831.8, 295)`.
    - `cpToMireY248` (`KeyD`, rìa bắc `y = 248`): `reached = true`, qua `silent_mire (2944.2, 259)` (lướt nhẹ 1 nhịp khỏi cạnh dưới trụ đá `b = 240`, không kẹt).
    - `mireToCpY248` (`KeyA`, rìa bắc `y = 248`): `reached = true`, về `crooked_path (2832.8, 262.2)`.
    - Save tại `silent_mire (2945, 295)` -> `handleLoadCheckpoint()` -> phục hồi đúng `(2945, 295)` -> đi Tây `KeyA`: `reached = true`, `blockedCount = 0`, về `crooked_path (2862.8, 295)`.
- **Ảnh F9 Bật / Tắt:**
  - Before F9 ON: [before_mire_entry_f9_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/before_mire_entry_f9_on.png)
  - Before F9 OFF: [before_mire_entry_f9_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/before_mire_entry_f9_off.png)
  - After F9 ON: [after_mire_entry_f9_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_mire_entry_f9_on.png)
  - After F9 OFF: [after_mire_entry_f9_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_mire_entry_f9_off.png)

---

### 1.2. [Lỗi Phụ 1] Lối Vào Đã Mở Khóa `Ancient Rune Puzzle → Sunken Crypt Ruins` & Chồng Lấn Đèn Đá Tại Điểm Spawn (`x = 3362..3612, y = 125..267`)

- **Zone:** `silent_mire` / `ancient_rune_puzzle` → `sunken_crypt_ruins`
- **Trước khi sửa (Before):**
  - Khi điều kiện cốt truyện (`clapper_collected`) đã mở khóa, cửa `to_sunken_crypt_ruins` (`x: 3500..3560, y: 150..174`) bị bít hoàn toàn bởi 3 collider liền nhau: `Rặng Cây Khô Viền Bắc Silent Mire` (`2920..3960, y: 125..160`), `Liễu Titan Khô` (`3544..3576, y: 158..174`, `sm_dead_titan_willow_col`: `3540..3584, y: 150..176`), và `Cây Rỗng` / `Gốc Cổ Thụ Liễu Héo Tàn` (`3550..3570, y: 166..176`). Test `puzzleToCrypt` (`KeyW` từ `(3530, 215)`): `reached = false`, kẹt cứng tại `(3530, 178)`, `body = [3521, 160, 3539, 172]`, `blockedCount = 24`.
  - Đồng thời, `Đèn Đá Nghi Thức` phía Tây (`createAncientBrazier(3380, 260)`, AABB `3374..3386, y: 257..267`) giao cắt biên X với `to_rune_puzzle.targetSpawn (3390, 260)`.
- **Thay đổi đã áp dụng:**
  - [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Tách hàng rào cây phía Bắc quanh cửa hầm mộ `x = 3495..3565` thành `Rặng Cây Khô Viền Bắc Tây Silent Mire` (`2920..3495, y: 125..160`) và `Rặng Cây Khô Viền Bắc Đông Silent Mire` (`3565..3960, y: 125..160`); dịch `createDeadTitanWillow` sang `(3596, 162)` (`Liễu Titan Khô` `[3580..3612, 160..176]`) và `createHollowTree` sang `(3596, 182)` (`Cây Rỗng` `[3586..3606, 173..183]`); dịch `createAncientBrazier` phía Tây ra `(3368, 250)` (`Đèn Đá Nghi Thức` `[3362..3374, 247..257]`).
  - [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json): Đồng bộ `sm_dead_titan_willow_col` sang `(3578, 154, 44, 26)`.
- **Sau khi sửa (After):**
  - Khóa bảo vệ khi chưa có `clapper_collected`: `cryptBlockedWhenLocked = true` (không bị rò rỉ cổng khóa).
  - Sau khi mở khóa: `puzzleToCrypt` (`KeyW` từ `(3530, 195)`): `reached = true`, `blockedCount = 0`, chuyển vào `sunken_crypt_ruins (3600, -100)`; quay lại `cryptToPuzzle` (`KeyS` từ `(3600, -100)`): `reached = true`, `blockedCount = 0`, về `ancient_rune_puzzle (3520, 185.7)`.
  - Kiểm tra spawn overlap toàn cụm đích (`silent_mire`, `ancient_rune_puzzle`, `drowned_mire_depths`, `sunken_crypt_ruins`, `sanctuary_farm`): `spawnOverlaps = []`.
- **Ảnh F9 Bật / Tắt:**
  - Before F9 ON: [before_crypt_entrance_f9_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/before_crypt_entrance_f9_on.png)
  - Before F9 OFF: [before_crypt_entrance_f9_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/before_crypt_entrance_f9_off.png)
  - After F9 ON: [after_crypt_entrance_f9_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_crypt_entrance_f9_on.png)
  - After F9 OFF: [after_crypt_entrance_f9_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_crypt_entrance_f9_off.png)

---

### 1.3. [Lỗi Phụ 2] Lối Vào Đã Mở Khóa `Silent Mire → Drowned Mire Depths` (`x = 3335..3425, y = 665..740`)

- **Zone:** `silent_mire` ↔ `drowned_mire_depths`
- **Trước khi sửa (Before):**
  - Hai khối biên `sm_bound_bottom_left` (`..3340`) và `sm_bound_bottom_right` (`3420..`) đã chừa đúng hành lang `x = 3340..3420` cho `to_drowned_mire_depths` (`x: 3340..3420, y: 720..744`), nhưng `Rặng Cây Khô Viền Nam Silent Mire` (`x: 2920..3960, y: 665..700`) kéo liền xuyên ngang khoảng hở. Test `smToDepths` (`KeyS` từ `(3380, 625)`): `reached = false`, kẹt tại `(3380, 671)`, `body = [3371, 653, 3389, 665]`, `blockedCount = 29`.
  - Ngoài ra `to_drowned_mire_depths.returnPoint` và `to_silent_mire_from_dmd.targetSpawn` đang đặt sát mép tường tại `(3380, 700)`.
- **Thay đổi đã áp dụng:**
  - [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Tách tường cây phía Nam quanh `x = 3335..3425` thành `Rặng Cây Khô Viền Nam Tây Silent Mire` (`2920..3335, y: 665..700`) và `Rặng Cây Khô Viền Nam Đông Silent Mire` (`3425..3960, y: 665..700`).
  - [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json): Đưa `to_drowned_mire_depths.returnPoint` và `to_silent_mire_from_dmd.targetSpawn` lên `(3380, 680)` nằm trọn trong khoảng hở `3335..3425`.
- **Sau khi sửa (After):**
  - Khóa bảo vệ khi chưa có `mire_drained`: `depthsBlockedWhenLocked = true`.
  - Sau khi mở khóa: `smToDepths` (`KeyS` từ `(3380, 680)`): `reached = true`, `blockedCount = 0`, sang `drowned_mire_depths (3380, 780)`; quay lại `depthsToSm` (`KeyW` từ `(3380, 790)`): `reached = true`, `blockedCount = 0`, về `silent_mire (3380, 674.3)`.
- **Ảnh F9 Bật / Tắt:**
  - Before F9 ON: [before_depths_entrance_f9_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/before_depths_entrance_f9_on.png)
  - Before F9 OFF: [before_depths_entrance_f9_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/before_depths_entrance_f9_off.png)
  - After F9 ON: [after_depths_entrance_f9_on.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_depths_entrance_f9_on.png)
  - After F9 OFF: [after_depths_entrance_f9_off.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_depths_entrance_f9_off.png)

---

## 2. Kết Quả Kiểm Tra Các Khu Vực Ưu Tiên (F9 Debug + Noclip OFF + Bàn Phím Thật)

| Khu vực / Tuyến | Vị trí / Tọa độ | Kiểm tra thực tế | Kết quả | Minh chứng F9 ON / OFF |
| --- | --- | --- | --- | --- |
| **Sanctuary Farm** | `(648, 741)` + đống củi `(650, 715)` | Đi bộ & Sprint 4 hướng: `farmSouth` `(648, 827.4, blocked=0)`, `farmNorth` `(648, 622.1, blocked=0)`, `farmEast` `(739, 741, blocked=0)`, `farmWest` `(596.8, 748.5, blocked=1 chạm mép chéo rồi qua)`, qua Outer Woods & Sub Root Cellar `blocked=0`; đồ họa củi & collider Kho Thóc/hàng rào nguyên vẹn | **ĐẠT** | [baseline F9 ON](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/baseline_farm_648_741_f9_on.png) / [OFF](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/baseline_farm_648_741_f9_off.png) · [after F9 ON](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_farm_648_741_f9_on.png) / [OFF](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/after_farm_648_741_f9_off.png) |
| **Outer Woods — Sir Vaelen** | Sir Vaelen `(1435, 710)` (`1424..1446, 696..710`), Đống lửa `(1470, 710)` | NPC chặn chân chuẩn tại `y = 728`; đi qua phía Nam/Đông/Bắc đống lửa, xuống Bell Workshop `(1360, 760 → 1100)`, sang shortcut `(1510, 685 → 2920, 420)` và `(1510, 780 → 1640, 500)` đều `blocked=0` | **ĐẠT** | [baseline Sir Vaelen F9 ON](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/baseline_sir_vaelen_f9_on.png) |
| **Fog Crossing ↔ Bellhollow** | Đường chính `y = 200..255`, NPC trung tâm | `fog_to_bell_y225` `blocked=0`; chân NPC (`npc_garth [537..559, 191..205]`, `npc_edda [1152..1168, 148..160]`, `npc_neris [562..578, 448..460]`, `npc_bram [1321..1345, 463..477]`, `npc_finn [894..908, 221..231]`, `npc_campfire_knight [1424..1446, 696..710]`) không chặn đường chính, `duplicatesCount = 0` | **ĐẠT** | — |
| **Bellhollow → Crooked Path → Deep Forest → Silent Mire** | Cổng Đông, nhánh lên Deep Forest, ngã sang Silent Mire, cổng Miếu Chuông `(3920, 310)` | `eastGateBellhollowToCP`, `cpToDeepForest`, `dfToSilentMireUnlocked`, `mireToShrineY280/Y355`, `mireToPuzzle` (`→ ancient_rune_puzzle 3434.7, 250.2`), `mireSprintSouth` (`→ 3434.7, 378.5`), `mireWalkWest` (`→ silent_mire 3260.4, 378.5`) đều qua | **ĐẠT** | [baseline Shrine Gate F9 ON](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-03/baseline_shrine_gate_f9_on.png) |

---

## 3. Các Điểm Ghi Nhận Ngoài Phạm Vi Đợt Sửa (Audit-Only Theo Giới Hạn §4)

Do quy tắc §4 giới hạn mỗi lượt sửa tối đa **1 lỗi chính + 2 lỗi phụ trong cùng khu vực**, các điểm sau được ghi nhận chính xác để theo dõi/lên kế hoạch riêng, **không chỉnh sửa ngoài phạm vi**:

1. **`Deep Forest → Abyssal Chasm` (`to_abyssal_chasm`, [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json#L2746-L2756)):** Trong kiểm thử sau sửa (`dfToAbyss`), khi `applyCameraBoundsForZone('deep_forest')` đặt `physics.world.bounds.top = -640`, chân nhân vật chỉ đi lên được tối thiểu `footY = -622` (`body = [2231, -640, 2249, -628]`), hụt **2px** bên dưới đáy `to_abyssal_chasm.triggerRect` (`x: 2210, y: -640, width: 60, height: 16`, đáy `-624`) dù `abyssal_gate_unlocked = true`.
2. **`Bellhollow → Fog Crossing` rìa nam cổng Tây (`auto_east_fog_crossing_seg_end`):** Collider `[464..496, 260..360]` chặn rìa nam `y = 260..320` nếu bám sát mép dưới khi đi hướng Tây từ Bellhollow (`bell_to_fog_y280` dừng tại `x = 505`), trong khi lòng đường chính `y = 200..255` đi qua bình thường.
3. **`Crooked Path → Outer Woods` (`bell_bound_east_bottom`):** Collider `[1598..1630, 360..568]` cọ rìa tây của vùng kích hoạt `to_outer_woods_from_cp` (`1600..1640, 440..560`), vẫn kích hoạt chuyển vùng thành công tại `x = 1639`.
4. **Y-depth lệch nhẹ không phải lỗi va chạm (`prop_cauldron_tripod` tại Bellhollow `(630, 455)`):** `depth = 447` so với `footY = 459` (chênh `-12.4px` hiển thị lớp vẽ, không chặn di chuyển).

---

## 4. Kiểm Tra Độc Lập Sau Lần Sửa Cuối (`Post-Edit Verification`)

Đã dọn sạch toàn bộ script tạm (`TEMP_FILE_COUNT=0` trong `scripts/temp/`) và chạy tuần tự sau chỉnh sửa cuối cùng:

- `python scripts/temp/hw_h4_03_capture_evidence.py after` (Vite dev server `QA_BUILD=true`, Noclip OFF, F9 ON/OFF): **PASS** (`console_errors = []`, `page_errors = []`, toàn bộ ca Silent Mire / Crypt / Depths / Farm `(648, 741)` / Save-Load đều đạt; phát hiện out-of-scope `dfToAbyss` đã ghi tại Mục 3).
- `npm run check` (`tsc --noEmit`): **PASS** (exit code `0`).
- `npm run build` (`tsc && vite build`): **PASS** (exit code `0`, build lại sạch `dist/`).
- `npm run verify:data`: **PASS** (exit code `0`, `15/15` kiểm tra toàn vẹn dữ liệu đạt).
- `python tests/hw_bug_21b_walk_run_verification.py`: **PASS** (exit code `0`, `10/10` test Walk/Run/Shift/Focus/Modal/Armed-Unarmed/Outer Woods/Combat đạt).
- `python tests/hw_bug_26b_walkrun_fix_verification.py`: **PASS** (exit code `0`, `5/5` suite Shift Watchdog/Collision Guardrail/Sprint/Combat Locks/Save Schema 3 đạt).
- `git diff --check`: **PASS** (exit code `0`, không lỗi khoảng trắng/conflict).
- `git diff --stat -- src/world/WorldBuilder.ts src/data/zones.json src/systems/EndingSystem.ts`:
  - `src/data/zones.json`: `10(+), 10(-)` (`20` thay đổi dòng)
  - `src/systems/EndingSystem.ts`: `19(+), 4(-)` (`23` thay đổi dòng, `HW-H4-01` giữ nguyên)
  - `src/world/WorldBuilder.ts`: `11(+), 8(-)` (`19` thay đổi dòng)
