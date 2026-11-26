# HW-MAP-00 — BÁO CÁO KIỂM TOÁN BẢN ĐỒ, ĐỊA HÌNH & MÔI TRƯỜNG TOÀN THẾ GIỚI (WORLD RECONSTRUCTION 2.0)

- **Dự án:** HOLLOW WOODS (`V1.5.4` QA Candidate)
- **Nhiệm vụ:** `HW-MAP-00` — Read-Only Full World Map & Environment Audit
- **Agent:** AG 4 Hydro High
- **Nhánh:** `feat/v1.5.3-ag-world-polish`
- **Commit Baseline (Local == Remote):** `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d` (`fix(boss): clean up Mire Warden sonic roar timers and encounter lifecycle`)
- **Tham chiếu hình ảnh:** `C:\Users\Kyoshiro\Downloads\Video Game Trailer\Trailer Game\HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4` (`70.00s`, trích xuất 8 mốc `8s..66s`, đối chiếu trực quan tại `16s, 25s, 34s, 42s, 51s, 60s`)
- **Trạng thái sửa mã nguồn:** `SOURCE MODIFIED: NO` (Chỉ đọc & kiểm chứng; toàn bộ thay đổi chưa commit của `HW-H4-12A` và `git mv` của `HW-ASSET-01` được giữ nguyên vẹn)

---

## 1. Tóm tắt Điều hành & Khuyến nghị Chốt Cổng

Thế giới HOLLOW WOODS hiện có **17 phân khu (zones)** và **41 chuyển tiếp có hướng (directional transitions)** trong `src/data/zones.json`. Kiểm toán tĩnh và thực nghiệm trên production build `dist/` + overlay `F9` (`/?dev=1`) cho thấy:

1. **Vấn đề cấp bách nhất KHÔNG phải đồ họa mà là lỗi điều hướng & ranh giới vật lý (`P0`):**
   - **4 lỗi kẹt/hỏng cổng thực sự** khiến người chơi có thể bị chặn hoặc kẹt ngay cả khi đã mở đủ cờ cốt truyện:
     1. `deep_forest -> abyssal_chasm` (`HW-H4-03-AUDIT`): kẹt cứng ở `y = -622`, thiếu `2px` so với `triggerRect` (`y: -640..-624`).
     2. `sub_whispering_clearing` hướng Bắc (`MAP-BUG-001`): tường chu vi tự động `auto_south_whispering_grove_sanctum_seg_end` (`y: -376..-344`) chặn ngang mặt trên khiến nhân vật đụng tường tại `y = -326`, không chạm được cả `to_deep_forest_from_wc` lẫn `to_whispering_grove_sanctum` (hai trigger này cũng chồng lên nhau `80x14px`).
     3. `whispering_grove_sanctum` (`MAP-BUG-002`): điểm spawn mặc định `(1600, -420)` và cổng về `to_whispering_clearing_from_wgs` (`x: 1560..1640`) đè thẳng lên tường `df_bound_left` (`x: 1600..1630`) và `Rặng Cây Viền Tây Deep Forest` (`x: 1620..1655`).
     4. `ancient_rune_puzzle` (`MAP-BUG-003`): trigger `to_silent_mire_from_puzzle` (`x: 3310..3335`) nằm hoàn toàn ngoài biên Tây phân khu (`minX = 3350`), còn đi về Bắc khi chưa mở `sunken_crypt_ruins` tự động lọt sang `silent_mire` ở `(3520, 148)` do thiếu rào chắn phía Bắc; ngoài ra `Đèn Đá Nghi Thức` (`x: 3362..3374, y: 247..257`) đè hitbox chân tại `defaultSpawn` `(3380, 260)` và `to_rune_puzzle`.
2. **Bản đồ Thế giới (`ParchmentWorldMapModal` & `JournalModal`) thiếu 7/17 phân khu và xung đột phím `[M]` (`H4-NEW-05`):**
   - `ParchmentWorldMapModal` chỉ hiển thị `10/17` nút khu vực (`Đã khai mở: X/10 Khu Vực`), `ZoneConnectionRegistry` chỉ đăng ký `10` node (nên `abyssal_chasm` trên bản đồ không có đường nối nào), `JournalModal` chỉ có `13` node (còn chứa `the_depths` cũ, thiếu 5 vùng mở rộng).
   - Khi đứng ở vùng chưa map (đã kiểm chứng thực tế tại `drowned_mire_depths`), huy hiệu `"📍 BẠN ĐANG Ở ĐÂY"` **biến mất hoàn toàn** trên bản đồ.
   - Ở New Game tại `fog_crossing`, `PlayerState` (`L52, L196`) đã mở sẵn `'bellhollow'` khiến bản đồ hiện `2/10 Khu Vực` trước khi người chơi bước vào làng.
   - Phím `[M]` vẫn kích hoạt tắt/mở âm thanh (`BlackKnightPlayer.ts`) thay vì mở Bản đồ (`UIScene.ts`), và khi đang mở `JournalModal` mà nhấn `[M]`, `ParchmentWorldMapModal` bật đè lên Nhật Ký.
3. **Chất lượng môi trường phân hóa thành 2 cực rõ rệt:**
   - **12 khu vực gốc (`Core` + `Sub`):** có Canvas địa hình vẽ tay và đạo cụ chi tiết (`fog_crossing`, `bellhollow`, `sanctuary_farm`, `outer_woods`, `crooked_path`, `deep_forest`, `silent_mire`, `broken_bell_shrine`), nhưng tồn tại **mép ghép cứng hình chữ nhật**, **collider cây phong đỏ nằm lệch lên tán lá** (`F9` đã chứng minh ở `fog_crossing`, `crooked_path`, `broken_bell_shrine`), và **`sub_root_cellar` dùng hình tròn vector phẳng** làm placeholder.
   - **5 khu vực mở rộng (`abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`):** mới dừng ở nền `tileSprite` lặp đơn điệu (`TILE_STONE_FLOOR`, `TILE_SWAMP_MUD`, `TILE_FOREST_GRASS`) với **0 hàm trang trí riêng trong `WorldBuilder.renderDecorations()`**, trong đó `whispering_grove_sanctum` chồng trực tiếp lên `deep_forest` tạo đường cắt cỏ xanh sáng chói xẻ dọc màn hình.

> [!IMPORTANT]
> **Khuyến nghị Git Checkpoint trước `HW-MAP-01`:** Working tree hiện còn `5` file chưa commit của `HW-H4-12A` (`BlackKnightPlayer.ts`, `UIScene.ts`, `CraftingModal.ts`, `JournalModal.ts`, `V153_TESTER_BUG_REGISTRY.md`) cùng `297` file `git mv` đã stage trong `Pixel_Art/` thuộc `HW-ASSET-01`. Đề nghị Owner tách commit/checkpoint `HW-H4-12A` và `HW-ASSET-01` trước khi cấp phép chỉnh sửa `HW-MAP-01`.

---

## 2. Xác minh Safety Gate & Vòng đời Tài nguyên

- **Git Branch:** `feat/v1.5.3-ag-world-polish`
- **Local `HEAD` == Remote `origin/feat/v1.5.3-ag-world-polish`:** `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`
- **Console / Page Errors trên `dist/`:** `0` console error, `0` page error xuyên suốt toàn bộ phiên audit.
- **Listener Lifecycle (`dist/`):** Tổng listener trên các scene giữ nguyên tuyệt đối **`291` (`BootScene: 26, PreloadScene: 26, MainMenuScene: 26, GameScene: 88, UIScene: 99, EndingScene: 26`)** qua cả 4 mốc: khởi tạo -> đóng/mở World Map 5 lần (`291`) -> Save + Reload + Continue (`291`) -> Restart New Game (`291`).

---

## 3. Audit A — World Map UI, Keybindings & Save Persistence

### 3.1 Phát hiện Tĩnh & Thực nghiệm (`STATIC AUDIT` + `dist/` Runtime)

| Hạng mục | Thực trạng quan sát được | Bằng chứng | Bug ID |
| :--- | :--- | :--- | :--- |
| Độ phủ vùng trên World Map | `ParchmentWorldMapModal.ts` chỉ hardcode `10` node (`Đã khai mở: 2/10 Khu Vực`). Thiếu **7/17 phân khu**: `sub_bell_workshop`, `sub_root_cellar`, `sub_whispering_clearing`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`. | [world_map_E_fog_crossing.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/world_map_E_fog_crossing.png), `hw_map_00_runtime_audit.json` L18-44 | `MAP-BUG-005` |
| Marker khi đứng tại vùng thiếu | Đứng tại `drowned_mire_depths` và mở Bản đồ bằng `[N]`: không có thẻ `"📍 BẠN ĐANG Ở ĐÂY"` trên toàn bộ bản đồ (`4/10 Khu Vực`). | [world_map_E_unmapped_drowned_mire.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/world_map_E_unmapped_drowned_mire.png), `hw_map_00_runtime_audit.json` L58-89 | `MAP-BUG-005` |
| Đường nối trong Registry | `ZoneConnectionRegistry` chỉ đăng ký `10` node (`24` liên kết). `abyssal_chasm` có mặt trong `ParchmentWorldMapModal` nhưng không có trong Registry nên hộp bên trái bản đồ trơ trọi, **không có đường nối nào**. | [world_map_E_fog_crossing.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/world_map_E_fog_crossing.png) | `MAP-BUG-006` |
| Bố cục địa lý lệch thực tế | `abyssal_chasm` bị đặt tận cực Tây (thực tế nằm chính Bắc `deep_forest`); `outer_woods` đặt ở Tây-Bắc (thực tế ở Đông-Nam `bellhollow`); `ancient_rune_puzzle` đặt tách rời Đông-Bắc (thực tế nằm lọt lòng trong `silent_mire`). Đường nối `outer_woods <-> crooked_path` và `deep_forest` cắt chéo nhau. | [world_map_E_fog_crossing.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/world_map_E_fog_crossing.png), `ParchmentWorldMapModal.ts` | `MAP-BUG-007` |
| Sai lệch dữ liệu New Game | Ngay lúc mới vào `fog_crossing`, `PlayerState.visitedZones` đã có sẵn `['fog_crossing', 'bellhollow']` (`PlayerState.ts:52, 196`), làm Bellhollow sáng vàng trước khi người chơi đến làng. | `hw_map_00_runtime_audit.json` L7-11 | `MAP-BUG-008` |
| Xung đột phím `[M]` & `[N]` | Nhấn `[M]` ngoài gameplay thực tế bật `audioMuted: true`, `isWorldMapOpen: false`. Subtitle `ParchmentWorldMapModal` ghi `[M] hoặc [ESC] để Gấp Bản Đồ` ở `L253` nhưng bị ghi đè ngay bởi mục tiêu nhiệm vụ ở `L365`. Nhấn `[J]` rồi `[M]` tắt Journal và mở `ParchmentWorldMapModal`. | [journal_map_E.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/journal_map_E.png), `hw_map_00_runtime_audit.json` L46-57 | `H4-NEW-05` |
| Journal Map & MiniMap | `JournalModal` có `13` node (bao gồm `the_depths` không tồn tại ở `zones.json`, thiếu 5 vùng mở rộng). `MiniMapWidget` bị vô hiệu hóa (`setVisible(false)`). `ParchmentWorldMapModal` cố định `980x600`, không zoom/pan/tooltip (`node.clue` chưa dùng). | `JournalModal.ts`, `MiniMapWidget.ts`, `ParchmentWorldMapModal.ts` | `BUG-033`, `MAP-BUG-005` |
| Save / Reload / Continue | Lưu thủ công tại `drowned_mire_depths` -> Reload -> `continueGame()` khôi phục đúng `currentZoneId: 'drowned_mire_depths'`, `visitedZones` 5 vùng và tọa độ `(3380, 900)` với `0` rò rỉ listener (`291 -> 291`). | `hw_map_00_runtime_audit.json` L90-170 | **PASS** |

---

## 4. Audit B & D — Hình học Thế giới, Colliders, Cổng Chuyển Tiếp & Khả Năng Đi Lại (`Noclip OFF`)

### 4.1 Kết quả Đo Tĩnh & Runtime Physics (`colliderGroup = 329 static bodies`, `cullables = 747`)

- **Chồng lấn ranh giới vùng (`Zone Bounds Overlaps` — 6 cặp):**
  1. `bellhollow <-> sanctuary_farm`: `640x200` (`y: 560..760`)
  2. `bellhollow <-> outer_woods`: `480x200` (`y: 560..760`)
  3. `silent_mire <-> ancient_rune_puzzle`: `350x280` (nằm lọt lòng)
  4. `deep_forest <-> sub_whispering_clearing`: `370x360` (nằm lọt lòng)
  5. `deep_forest <-> whispering_grove_sanctum`: `480x280` (`x: 1600..2080, y: -640..-360`)
  6. `abyssal_chasm <-> whispering_grove_sanctum`: `480x160` (`x: 1600..2080, y: -800..-640`)
- **Chuyển tiếp 1 chiều (`One-Way`):** `sub_whispering_clearing -> crooked_path` (`to_crooked_path_from_wc`) đi được về Nam sang `crooked_path`, nhưng `crooked_path` không có cổng ngược lên `sub_whispering_clearing`.
- **Chồng lấn hai cổng trong cùng 1 vùng:** Trong `sub_whispering_clearing`, `to_deep_forest_from_wc` (`y: -350..-320`) và `to_whispering_grove_sanctum` (`y: -360..-336`) đè lên nhau `80x14px` ở `x: 1800..1880`.
- **Triggers vượt biên vùng nguồn (`TRIG_OOB_SRC`):**
  - `to_silent_mire_from_puzzle` (`x: 3310..3335`) nằm hoàn toàn ngoài `ancient_rune_puzzle.minX = 3350`.
  - `to_drowned_mire_depths` (`y: 720..744`) lố `4px` qua `silent_mire.maxY = 740`.
  - `to_veil_origin_cavern` (`y: 1420..1444`) lố `4px` qua `sub_root_cellar.maxY = 1440`.
- **Collider chèn lên Spawn / Portal (`auditB_runtime.livePhysics`):**
  - `ancient_rune_puzzle`: `Đèn Đá Nghi Thức` (`3362..3374, 247..257`) đè cả `defaultSpawn` `(3380, 260)` lẫn `to_rune_puzzle`.
  - `bellhollow`: `auto_east_fog_crossing_seg_end` (`464..496, 260..360`) che nửa dưới trigger `to_fog_crossing` (`y: 200..320`).
  - `crooked_path`: `bell_bound_east_bottom` (`1598..1630, 360..568`) che `32/40px` chiều rộng trigger `to_outer_woods_from_cp`; `Biển Chỉ Dẫn` (`2093..2107, 38..48`) nằm giữa trigger `to_deep_forest`.
  - `silent_mire` / `broken_bell_shrine`: `shrine_bound_left_bottom` (`3980..4010, 360..600`) và `auto_east_silent_mire_seg_0` (`3984..4016, 100..240`) cắt vào hai đầu trigger giáp ranh `to_shrine` và `to_silent_mire_from_shrine`.
  - `sub_whispering_clearing` & `whispering_grove_sanctum`: tường tự động `auto_south_whispering_grove_sanctum_seg_end` (`1640..2080, -376..-344`), `df_bound_left` (`1600..1630, -640..0`), và `Rặng Cây Viền Tây Deep Forest` (`1620..1655`) chặn cứng đường ra vào giữa hai khu vực.
- **Lệch hitbox Cây Phong Đỏ (`F9` Visual Discovery — `MAP-BUG-004`):** Trên ảnh `F9` (`fog_crossing_f9_F.png`, `crooked_path_f9_F.png`, `broken_bell_shrine_f9_F.png`), các cây phong tán đỏ có hộp va chạm đỏ nằm lơ lửng giữa tán lá thay vì ôm phần gốc thân dưới.
- **Collider Mặt nước Đầm Lầy & Ao Làng (`F9` — `MAP-BUG-009`):** Trong `silent_mire_f9_F.png`, `createMireWater` dùng hộp chữ nhật đỏ lớn chồng lên vũng bùn hình bầu dục (đè nhẹ vào vùng yellow interactable), còn ao nước `sanctuary_farm_f9_F.png` không có collider.
- **Wildlife Local Coordinates (`H4-NEW-01` còn tồn đọng):** `WildlifeSystem.ts` vẫn giữ tọa độ cục bộ dạng 0-based trong các bảng habitat (`SKULL_WOLF`, `SHADOW_CROW`, `SHADOW_EYES`, `SHADOW_BEHEMOTH`, `DREAD_HORSEMAN`, `ZONE_HABITATS`), khiến thực thể hoang dã ở vùng tọa độ dương/âm xa bị sinh ngoài biên khu vực.

### 4.2 Kiểm thử Điều hướng Thực tế bằng Phím WASD (`Noclip OFF` — `STAGED INTEGRATION + KEYBOARD TRAVERSAL`)

- **Vòng 1 (`hw_map_00_runtime_audit.py`):** **27/36** luồng hai chiều PASS ngay khi chỉ mở cờ cơ bản. Nguyên nhân chặn ở 9 luồng ban đầu: `5` luồng bị chặn hợp lệ do cờ cốt truyện trong `WorldGatingSystem`, và `4` luồng là lỗi thiết kế/vật lý thật.
- **Vòng 2 (`hw_map_00_gated_reprobe.py` — mở đủ toàn bộ cờ `WorldGatingSystem` trừ quest `Q03`):**
  - `bellhollow -> sanctuary_farm` (1200ms `KeyS`): **PASS** (`to_sanctuary_farm`, `foot=(650, 576)` — lưu ý 900ms chỉ tới `y=554.58` chưa sang hẳn `y>=560`).
  - `silent_mire -> broken_bell_shrine`: **PASS** (`to_shrine`).
  - `silent_mire -> drowned_mire_depths`: **PASS** (`to_drowned_mire_depths`).
  - `sub_root_cellar -> veil_origin_cavern`: **PASS** (`to_veil_origin_cavern`).
  - `ancient_rune_puzzle -> sunken_crypt_ruins` (khi đã mở `crypt_unlocked`): **PASS** (`to_sunken_crypt_ruins`); **FAIL khi chưa mở cờ**: đi lên Bắc tự động lọt sang `silent_mire` tại `(3520, 148)`.
  - `deep_forest -> abyssal_chasm` (dù đã mở `abyssal_gate_unlocked`): **FAIL (`HW-H4-03-AUDIT`)**, kẹt ở `foot=(2240, -622)` không với tới `-624`.
  - `sub_whispering_clearing` hướng Bắc: **FAIL (`MAP-BUG-001`)**, đụng tường cứng ở `foot=(1840, -326)`.
  - `whispering_grove_sanctum -> sub_whispering_clearing` (cả tại `x=1600` lẫn `x=1645`): **FAIL (`MAP-BUG-002`)**, bị kẹt spawn trong `df_bound_left` hoặc chạm `auto_south_whispering_grove_sanctum_seg_end` ở `y=-384`.
  - `deep_forest -> sub_whispering_clearing` từ Nam `(1840, -10)`: chưa chuyển vùng trong fixture không có quest hoàn thành `Q03_PREPARE_RESOURCES` (`WorldGatingSystem.ts:102-103`, `REQUIRED_STATE_NOT_MET` chứ không phải kẹt tường).

---

## 5. Audit C — Chất lượng Môi trường vs Trailer V12.2 (`HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`)

| Tiêu chí | Chuẩn mực Trailer V12.2 (`16s–60s`) | Hiện trạng Game Live (`dist/`) | Khoảng cách & Rủi ro |
| :--- | :--- | :--- | :--- |
| Phối cảnh cây cối đa tầng | Cụm cây nhiều loài (sồi, bạch dương, phong đỏ, cây khô) đan xen cây bụi thấp, dương xỉ và nấm phát sáng neo chân gốc rất tự nhiên. | `bellhollow`, `crooked_path`, `deep_forest` có cụm đa loài tốt; `sanctuary_farm` và `outer_woods` còn nhiều khoảng cỏ thưa phẳng; **5 vùng mở rộng = 0 cây/đạo cụ riêng**. | Thiếu độ dày tầng thấp (fern/root/pebble clusters) ở vùng chuyển tiếp và hoàn toàn trống ở 5 vùng mở rộng (`MAP-BUG-010`). |
| Độ mượt mép gạch / cỏ | Ngay trong Trailer V12.2 (`16s, 25s, 42s, 51s`) vẫn lộ rõ **mép tile đá cắt vuông góc** (quảng trường đá / hành lang) với cỏ xung quanh. | Game live còn nặng hơn tại vùng giao thoa: `whispering_grove_sanctum` phủ đè thảm cỏ xanh ô-liu sáng cắt dọc ngang lên nền tối `deep_forest`; `sub_bell_workshop` đặt vòng đá trên nền cỏ rừng; `sub_root_cellar` dùng vòng tròn vector cyan trơn (`Graphics` placeholder). | Tạo cảm giác "cắt dán ô chữ nhật", phá vỡ chiều sâu không khí kinh dị u tối (`MAP-BUG-011`, `MAP-BUG-012`). |
| Ánh sáng & Sương mù | Viền tối (vignette) sâu ôm lấy quầng sáng lửa trại ấm và đèn lồng tương phản rất đẹp. | `bellhollow`, `crooked_path`, `deep_forest`, `silent_mire` giữ tốt ánh sáng/sương mù; nhưng `abyssal_chasm`, `sunken_crypt_ruins`, `veil_origin_cavern` đang **sáng trưng toàn màn hình** trên nền gạch xám `TILE_STONE_FLOOR`, không có ambient tối hay nguồn sáng điểm. | Thiếu toàn bộ khí quyển vùng cấm cuối game. |
| Hiệu năng (`HW-H4-06`) | 60 FPS VSync ổn định. | Runtime trên headless/dev ghi nhận `60 FPS` (`dist/`), `46–54 FPS` khi bật debug overlay `F9`, **50–93 draw calls**, **`747` cullables**, `329` static bodies. | Mọi nâng cấp thẩm mỹ bắt buộc giữ nguyên cơ chế canvas nung sẵn + culling, không dùng shader/particles nặng. |

---

## 6. Bảng Tổng Hợp Kiểm Toán Toàn Bộ 17 Phân Khu

| # | Zone ID (`Tên hiển thị`) | Bản đồ UI & Registry | Điều hướng / Portals | Va chạm / Hitbox (`F9` & Physics) | Đồ họa & Môi trường vs V12.2 | Hiệu năng (`Live` / Bodies) | Bằng chứng Ảnh (`Visuals/HW-MAP-00/`) | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `fog_crossing` (Lối Mòn Xuyên Sương) | Có đủ (`Parchment`, `Registry`, `Journal`) | 1 chiều Đông `-> bellhollow` hoạt động tốt; Tây có rào cản cốt truyện hợp lệ | `21` static bodies; cây phong đỏ gần biển gỗ có collider lệch lên tán lá; nửa dưới trigger về từ `bellhollow` bị `auto_east` chạm nhẹ | Đường mòn & barrier Tây rất có không khí, nhưng lộ đường ranh cỏ sáng-tối ở biên | 60 FPS (`dist/`), `82` draws (`F9`) | [fog_crossing_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/fog_crossing_overview_A.png), [fog_crossing_west_barrier_D.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/fog_crossing_west_barrier_D.png), [fog_crossing_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/fog_crossing_f9_F.png) | **WARN** |
| 2 | `bellhollow` (Làng Bellhollow) | Bị mở sẵn `visitedZones` ngay khi New Game | 4 cổng (`fog_crossing`, `sanctuary_farm`, `outer_woods`, `crooked_path`) đều thông khi đi đủ sâu (`y>=560` sang Farm) | `98` static bodies; các NPC & công trình chính khớp hitbox tốt; `to_fog_crossing` bị wall `auto_east` che nửa dưới | Đẹp, có điểm nhấn Tháp Chuông & lửa trại; bàn thuốc Neris & mép gạch phụ còn vết vuông | 60 FPS (`dist/`), `93` draws (`F9`) | [bellhollow_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/bellhollow_overview_A.png), [bellhollow_plaza_tile_edge_D.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/bellhollow_plaza_tile_edge_D.png), [bellhollow_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/bellhollow_f9_F.png) | **WARN** |
| 3 | `sanctuary_farm` (Nông Trại Thánh Địa) | Có trên cả 3 hệ bản đồ | 3 cổng (`bellhollow`, `outer_woods`, `sub_root_cellar`) PASS 2 chiều | `49` static bodies; hàng rào/chuồng khớp; cây góc Tây-Nam chạm tường ranh; ao tròn không có collider | Luống cây rõ ràng nhưng mặt đất trống và ao nước tròn dạng vector trơn | 60 FPS (`dist/`), `67` draws (`F9`) | [sanctuary_farm_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sanctuary_farm_overview_A.png), [sanctuary_farm_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sanctuary_farm_f9_F.png) | **PASS / POLISH** |
| 4 | `outer_woods` (Rừng Ngoại Vi) | Có nhưng đặt sai góc Tây-Bắc trên `ParchmentWorldMapModal` | 5 cổng (`bellhollow`, `farm`, `crooked_path`, `sub_bell_workshop`, `silent_mire` shortcut) PASS 2 chiều | `61` static bodies; `Gốc Cây Pixel Art` chạm mép Tây trigger `to_bellhollow_from_ow` | Ngã ba đường đá/đất cắt vuông góc cứng; cây phân bố còn rải rác | 60 FPS (`dist/`), `83` draws (`F9`) | [outer_woods_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/outer_woods_overview_A.png), [outer_woods_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/outer_woods_f9_F.png) | **WARN** |
| 5 | `crooked_path` (Đường Mòn Quanh Co) | Có đủ | 4 cổng (`bellhollow`, `outer_woods`, `deep_forest`, `silent_mire`) PASS; nhưng là điểm đáp **1 chiều** từ `sub_whispering_clearing` | `46` static bodies; `bell_bound_east_bottom` che `32/40px` `to_outer_woods_from_cp`; `Biển Chỉ Dẫn` nằm trong `to_deep_forest`; cây phong đỏ lệch hitbox tán lá | Khí quyển tốt, có khúc gỗ & cây phong, mép đường mòn phía trên hơi cứng | 60 FPS (`dist/`), `69` draws (`F9`) | [crooked_path_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/crooked_path_overview_A.png), [crooked_path_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/crooked_path_f9_F.png) | **WARN** |
| 6 | `deep_forest` (Rừng Sâu) | Có đủ | **BLOCK P0 (`HW-H4-03-AUDIT`)** đi `abyssal_chasm` kẹt tại `y=-622`; `crooked_path` & `silent_mire` PASS; `to_whispering_clearing` đòi quest `Q03` | `54` static bodies; 2 cột mốc chạm mép `to_whispering_clearing`; rặng tường `whispering_grove_sanctum` cắt chéo góc Tây-Bắc (`x=1600..2080, y=-640..-360`) | Tốt về độ u tối rừng sâu, nhưng góc Tây-Bắc bị **thảm cỏ xanh ô-liu vuông vức** của `whispering_grove_sanctum` đè cắt rất thô | 60 FPS (`dist/`), `76` draws (`F9`) | [deep_forest_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/deep_forest_overview_A.png), [deep_forest_to_abyssal_chasm_issue_D.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/deep_forest_to_abyssal_chasm_issue_D.png), [deep_forest_abyss_gate_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/deep_forest_abyss_gate_f9_F.png) | **FAIL (P0)** |
| 7 | `silent_mire` (Đầm Lầy Sương Mù) | Có đủ | 6 cổng PASS khi mở đủ cờ cốt truyện; trigger `to_drowned_mire_depths` lố biên `4px`; shortcut `outer_woods` PASS | `67` static bodies; vũng nước đầm dùng **hộp đỏ chữ nhật cứng**; tường biên Đông đè mép `to_shrine` | Khá đẹp và rùng rợn (đèn, lau sậy, cầu gỗ, đốm sáng), vòng cổ ngữ lộ phần gạch bên phải | 60 FPS (`dist/`), `70` draws (`F9`) | [silent_mire_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/silent_mire_overview_A.png), [silent_mire_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/silent_mire_f9_F.png) | **WARN** |
| 8 | `ancient_rune_puzzle` (Câu Đố Cổ Ngữ) | Đặt sai vị trí tách rời Đông-Bắc trên World Map | `to_silent_mire_from_puzzle` nằm ngoài biên Tây (`x=3310` vs `3350`); đi Bắc khi chưa mở `sunken_crypt_ruins` lọt sang `silent_mire` ở `(3520, 148)` | `18` static bodies; `Đèn Đá Nghi Thức` đè `defaultSpawn` `(3380, 260)` & `to_rune_puzzle`; hộp đỏ lớn góc Tây-Bắc đè bia cổ ngữ | Vòng đá cổ ngữ đối xứng ổn nhưng nền gạch ô vuông lặp đều khá phẳng | 60 FPS (`dist/`), `58` draws (`F9`) | [ancient_rune_puzzle_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/ancient_rune_puzzle_overview_A.png), [ancient_rune_puzzle_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/ancient_rune_puzzle_f9_F.png) | **FAIL (P1)** |
| 9 | `broken_bell_shrine` (Miếu Chuông Phế Tích) | Có đủ | 2 chiều với `silent_mire` PASS khi đã phá phong ấn; nửa trên cổng về bị `auto_east_silent_mire_seg_0` chạm nhẹ | `38` static bodies; cây phong đỏ rìa Tây & Nam lệch hitbox lên tán lá; 2 vùng tương tác quanh miếu lệch tâm nhẹ | Bố cục miếu trang nghiêm nhưng nền gạch xám rộng lặp đều chưa có rêu/nứt biên | 60 FPS (`dist/`), `50` draws (`F9`) | [broken_bell_shrine_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/broken_bell_shrine_overview_A.png), [broken_bell_shrine_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/broken_bell_shrine_f9_F.png) | **WARN** |
| 10 | `sub_bell_workshop` (Hầm Xưởng Đúc Chuông) | **THIẾU** trên `ParchmentWorldMapModal` & `Registry` | 2 chiều với `outer_woods` PASS | `20` static bodies; sạch trên spawn & trigger | Nền phòng tròn đá đặt thô trên bãi cỏ xanh sáng `TILE_FOREST_GRASS` (không hợp cảnh hầm ngầm) | 60 FPS (`dist/`) | [sub_bell_workshop_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sub_bell_workshop_overview_A.png) | **WARN (UI + Visual)** |
| 11 | `sub_root_cellar` (Hầm Rễ Cây) | **THIẾU** trên `ParchmentWorldMapModal` & `Registry` | `sanctuary_farm` & `veil_origin_cavern` PASS khi mở cờ; `to_veil_origin_cavern` lố biên `4px` | `22` static bodies; sạch trên spawn & trigger | Toàn cảnh làm bằng **hình tròn/chữ nhật vector phẳng placeholder**, thiếu hoàn toàn asset Pixel Art hầm rễ | 60 FPS (`dist/`) | [sub_root_cellar_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sub_root_cellar_overview_A.png) | **WARN (UI + Visual)** |
| 12 | `sub_whispering_clearing` (Khoảng Trống Thì Thầm) | **THIẾU** trên `ParchmentWorldMapModal` & `Registry` | **BLOCK P0:** Hướng Bắc bị `auto_south_whispering_grove_sanctum_seg_end` chặn cứng ở `y=-326`; 2 trigger Bắc đè nhau `80x14px`; Nam -> `crooked_path` 1 chiều | `16` static bodies; **tường vô hình chắn ngang cả 2 cổng Bắc** | Vòng tròn tím cắt viền chữ L sắc lẹm với nền cỏ xanh rừng và đè lên bởi mảng ô-liu từ `whispering_grove_sanctum` | 60 FPS (`dist/`), `64` draws (`F9`) | [sub_whispering_clearing_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sub_whispering_clearing_overview_A.png), [sub_whispering_clearing_north_issue_D.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sub_whispering_clearing_north_issue_D.png), [sub_whispering_clearing_f9_F.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sub_whispering_clearing_f9_F.png) | **FAIL (P0)** |
| 13 | `abyssal_chasm` (Vực Sâu Bóng Tối) | Có node trên `Parchment` & `Journal` nhưng **THIẾU** trong `Registry` (0 dây nối) & đặt sai cực Tây | Lối vào từ `deep_forest` **FAIL P0** (`y=-622`), chỉ đi ngược về Nam `-> deep_forest` được | `24` static bodies (tường chu vi + vài collider chung); overlap `160px` ở góc Tây-Nam với `whispering_grove_sanctum` | **Chưa hoàn thiện:** nền `TILE_STONE_FLOOR` sáng trơn toàn màn hình, `0` hàm trang trí | 60 FPS (`dist/`) | [abyssal_chasm_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/abyssal_chasm_overview_A.png) | **FAIL (P0 + Unfinished)** |
| 14 | `drowned_mire_depths` (Vùng Trũng Đầm Lầy) | **THIẾU** trên cả 3 hệ bản đồ (mất marker người chơi) | 2 chiều với `silent_mire` PASS khi mở cờ | `16` static bodies | **Chưa hoàn thiện:** nền `TILE_SWAMP_MUD` lặp lưới vuông đơn điệu, `0` cây/đạo cụ | 60 FPS (`dist/`) | [drowned_mire_depths_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/drowned_mire_depths_overview_A.png), [world_map_E_unmapped_drowned_mire.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/world_map_E_unmapped_drowned_mire.png) | **FAIL (UI + Unfinished)** |
| 15 | `whispering_grove_sanctum` (Thánh Địa Cây Đại Ngàn) | **THIẾU** trên cả 3 hệ bản đồ | **BLOCK P0:** Spawn `(1600, -420)` kẹt trong `df_bound_left`, cổng về `sub_whispering_clearing` bị tường & hàng cây Tây chặn kín | `25` static bodies; overlap `deep_forest` (`480x280`) & `abyssal_chasm` (`480x160`) làm rơi tường tự động thẳng vào giữa `deep_forest` | **Chưa hoàn thiện:** `TILE_FOREST_GRASS` trần đè lấn trực tiếp sang `deep_forest` | 60 FPS (`dist/`) | [whispering_grove_sanctum_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/whispering_grove_sanctum_overview_A.png) | **FAIL (P0 + Unfinished)** |
| 16 | `sunken_crypt_ruins` (Hầm Mộ Cổ Ngữ) | **THIẾU** trên cả 3 hệ bản đồ | 2 chiều với `ancient_rune_puzzle` PASS khi mở cờ | `12` static bodies | **Chưa hoàn thiện:** nền gạch `TILE_STONE_FLOOR` xám sáng lặp đều, `0` đạo cụ | 60 FPS (`dist/`) | [sunken_crypt_ruins_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/sunken_crypt_ruins_overview_A.png) | **FAIL (UI + Unfinished)** |
| 17 | `veil_origin_cavern` (Hang Cội Nguồn Màn Sương) | **THIẾU** trên cả 3 hệ bản đồ | 2 chiều với `sub_root_cellar` PASS khi mở cờ | `19` static bodies | **Chưa hoàn thiện:** nền gạch `TILE_STONE_FLOOR` lặp đều giống hệt Hầm Mộ, `0` ánh sáng/đạo cụ | 60 FPS (`dist/`) | [veil_origin_cavern_overview_A.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-00/veil_origin_cavern_overview_A.png) | **FAIL (UI + Unfinished)** |

---

## 7. Phân loại Bằng Chứng & Chặng Chưa Chạy (`NOT RUN`)

- **`STATIC AUDIT`:** Đọc & quét toàn bộ 17 phân khu (`zones.json`), `WorldBuilder.ts`, `AutoPerimeterWallsModule.ts`, `WorldGatingSystem.ts`, `ZoneConnectionRegistry.ts`, `ParchmentWorldMapModal.ts`, `JournalModal.ts`, `MiniMapWidget.ts`, `WildlifeSystem.ts`, `InventorySystem.ts`.
- **`STAGED INTEGRATION + KEYBOARD TRAVERSAL`:** Kiểm chứng sống trên `dist/` bằng Playwright trong ngữ cảnh cách ly (test flags cho vùng gated, Noclip OFF, giữ phím WASD thật) + đối chiếu lớp va chạm Vite dev `/?dev=1` (`F9`).
- **`OWNER PLAYTEST`:** `NOT RUN` (nhiệm vụ hiện tại là Read-Only Audit, chưa kiểm tra trên máy/save thật của Owner).
- **Chặng chưa chạy End-to-End cốt truyện tự nhiên:** Hoàn thành liên hoàn toàn bộ Q01–Q06 dẫn tới mở khóa tự nhiên từng cổng theo save gốc của người chơi (`NOT RUN` — chỉ test cô lập từng cửa bằng cờ test).

---

## 8. Thứ Tự Ưu Tiên Xử Lý Đề Xuất

1. **Bước chuẩn bị (Git Hygiene):** Chủ dự án checkpoint riêng `HW-H4-12A` (5 file) và xem xét checkpoint phần `git mv` của `HW-ASSET-01` trước khi mở nhánh/đợt sửa `HW-MAP-01`.
2. **Ưu tiên 1 (`HW-MAP-01` — Bugs Before Aesthetics, P0):** Sửa dứt điểm 4 lỗi chặn đường (`deep_forest -> abyssal_chasm`, tường chắn `sub_whispering_clearing`, spawn & rào kẹt `whispering_grove_sanctum`, biên & trigger `ancient_rune_puzzle`), dọn các điểm chồng lấn bounds & `AutoPerimeterWallsModule`, sửa hitbox gốc cây phong đỏ và kiểm tra `WildlifeSystem`.
3. **Ưu tiên 2 (`HW-MAP-02` — World Map & Gating Sync, P1):** Khép `H4-NEW-05` (`[M]` vs `[N]`), cập nhật đủ **17/17 phân khu** và toàn bộ đường nối vào `ZoneConnectionRegistry` + `ParchmentWorldMapModal` + `JournalModal`, sắp lại tọa độ bản đồ khớp địa lý thực tế, và bỏ `'bellhollow'` khỏi `visitedZones` mặc định lúc New Game.
4. **Ưu tiên 3 (`HW-MAP-03` & `HW-MAP-04` — World Reconstruction 2.0 Visuals, P1/P2):** Dựng môi trường hoàn chỉnh cho 5 vùng mở rộng + thay thế placeholder của `sub_root_cellar` + làm mềm mép tile/rừng theo chuẩn Trailer V12.2 mà vẫn giữ `draw calls <= 100` và `60 FPS`.
