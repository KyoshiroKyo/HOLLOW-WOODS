# HW-H4-05 — WORLD RENDERING, Y-DEPTH & OBJECT LIFECYCLE REPORT

- **Mã nhiệm vụ:** `HW-H4-05` (HYDRO HIGH ENGINEERING PROTOCOL V4)
- **Branch / HEAD:** `feat/v1.5.3-ag-world-polish` / `0617668a97f462877cbe2c30d304323e8fd48f6e`
- **Sao lưu trước khi sửa:** [Backups/steps/backup_hw_h4_05](file:///g:/HOLLOW%20WOODS/Backups/steps/backup_hw_h4_05) (`GameScene.ts`, `WildlifeSystem.ts`, `WorldBuilder.ts`)
- **Tệp đã chỉnh sửa trong tác vụ này:** [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts), [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts), [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts). Không đụng texture, scale nhân vật, pixel art hay `git commit` / `push`.

---

## 1. Đối Chiếu Báo Cáo Cũ (`HW-BUG-#16`, `HW-QA-01`, Telemetry JSON) & Phân Loại Object

1. **Giải mã `noDuplicateInstances` trong telemetry cũ ([HW_BUG_16_RENDER_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_16_RENDER_DATA.json), [HW_QA_01_MAP_TEST_HARDENING_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_QA_01_MAP_TEST_HARDENING_REPORT.md)):**
   - Trong dữ liệu cũ trước khi gia cố tại `HW-QA-01`, phép so sánh cứng `returnBellhollowTotal === initialTotal` từng cho kết quả `false` do `initialTotal = 1180 → returnBellhollowTotal = 1182` (`transientParticleDelta = +2` đến từ lớp phủ/hạt động tạm thời khi kích hoạt lần đầu), trong khi `cullablesPreserved` (`736 == 736`) và `repeatReturnStable` (`1182 == 1182`) giữ nguyên tuyệt đối.
   - Ở phép phân loại chi tiết theo loại + bucket trong đợt kiểm tra `HW-H4-05`:
     - **Loop 0** (tại `ancient_rune_puzzle`, `wildlifeCount = 0`): `totalChildren = 1193` (`Image: 614, Graphics: 173, TileSprite: 7, Container: 63, Sprite: 333, Text: 2, RenderTexture: 1`).
     - **Loop 1 → Loop 10** (sau 10 vòng chuyển vùng thật qua `executeTransition` giữa `Bellhollow → Sanctuary Farm → Outer Woods → Crooked Path → Silent Mire → Deep Forest → Bellhollow`, mỗi vòng dừng tại `bellhollow` với `wildlifeCount = 5`): `totalChildren = 1195` (`Image: 614, Graphics: 171, TileSprite: 7, Container: 68, Sprite: 332, Text: 2, RenderTexture: 1`) cố định hoàn toàn từ Loop 1 đến Loop 10 (`Δ = 0`).
     - Khoản chênh `+2` giữa Loop 0 (`1193`) và Loop 1..10 (`1195`) được `bucketDiffsVsLoop0` xác nhận **không phải nhân bản map/collider**: chỉ gồm sinh vật động do `WildlifeSystem.switchZone('bellhollow')` tạo (`Container@d160/180/470/500`, `wildlifeCount: 0 → 5`) và chuyển key sprite nhân vật (`black_knight_armed_idle ↔ black_knight_movement`). Toàn bộ `cullingTotal = 747`, `collidersLen = 329`, `canopiesLen = 182`, `renderedZonesCount = 12`, `renderTextures = 1 (1280×720)` không đổi suốt 10 vòng.
2. **Phân biệt Request Network (`ERR_ABORTED` vs `HTTP 404`):**
   - Trong [HW_BUG_16_RENDER_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_16_RENDER_DATA.json) và [HW_BUG_18_PERF_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_18_PERF_DATA.json), các mục `failed_requests` đều là `net::ERR_ABORTED` khi audio `.mp3` bị trình duyệt hủy prefetch lúc chuyển vùng (hành vi bình thường của browser).
   - Trong kiểm thử `HW-H4-05` trên `dist/`: `http_errors = []`, `aborted_requests = []`, `non_aborted_failed_requests = []`, `console_errors = []`, `page_errors = []`, `totalTextures = 502`, `missingCount = 0`.

---

## 2. Hai Lỗi Thực Tế Đã Phát Hiện & Sửa (Trước / Sau)

### 2.1. Rò Rỉ `+18` Scene Event Listeners Mỗi Chu Kỳ Save/Load (`scene.restart()`)

- **Nguyên nhân gốc:** `handleLoadCheckpoint()` gọi `this.scene.restart({ isContinue: true, saveData })`. Trong Phaser 3, `scene.restart()` giữ nguyên các listener tùy biến người dùng đăng ký trên `this.events`.
  - [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L470) (`lantern_flicker`) và `#L728-L805` (`wildlife_spooked`, `skull_wolf_defeated`, `shadow_crow_alarm`, `shadow_crow_defeated`, `shadow_eyes_drain`, `shadow_eyes_vanished`, `behemoth_slam_warning`, `shadow_behemoth_defeated`, `fallen_knight_defeated`, `dread_horseman_defeated`, `hooded_knight_powerup_start`, `hooded_knight_interrupted`, `hooded_knight_defeated`, `world_event_triggered`) đăng ký **15** listener nhưng không gỡ khi `shutdown`.
  - [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L179-L195) đăng ký **3** listener (`scout_whistle`, `player_ambush_hit`, `shadow_crow_alarm`) trên `this.scene.events` nhưng `destroy()` không gỡ.
- **Trước khi sửa (Before — dùng cùng save fixture qua 3 lần nạp):** `totalSceneListeners` tăng tuyến tính `77 → 95 → 113 → 131` (`+18` closure giữ tham chiếu tới scene/entity cũ mỗi lần nạp lại).
- **Cách sửa:**
  - Lưu 3 bound handler thành field trong [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L44-L46) và gọi `this.scene.events.off(...)` trong `destroy()` ([WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L813-L820)).
  - Gỡ sạch toàn bộ 15 custom gameplay event keys trên `this.events` trong handler `shutdown` của [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L972-L992).
- **Sau khi sửa (After):** `totalSceneListeners` giữ ổn định tuyệt đối **`77 → 77 → 77`** qua cả 3 chu kỳ `handleLoadCheckpoint()`, `totalPsListeners = 16`, `totalChildren = 1195`, `cullingTotal = 747`, `renderTextures = 1 (1280×720)`.

### 2.2. Sai Lệch Y-Depth Nồi Thảo Dược (`prop_cauldron_tripod`) & Rương Đồng (`prop_chest_bronze`)

- **Nguyên nhân gốc:** Trong [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L5559-L5619), `createHerbalCauldron(630, 445)` đặt sprite tại `(630, 455)` (`originY = 0.90`, `h = 44`, mép đáy hiển thị `459.4`) nhưng gán `cauldron.setDepth(cy + 2)` = `447` (`steam` = `448`). Khi nhân vật đứng ở `(650, 452)` phía sau chân trước của kiềng nồi (`455`), `player.depth (452) > cauldron.depth (447)` khiến nhân vật bị vẽ đè lên trước vạc thuốc. Tương tự, `createChestProp` & `createChestPropWithBaseHitbox` đặt `chest` ở `cy + 6` nhưng gán `depth = cy + 2`.
- **Cách sửa:** Chỉnh `cauldron.setDepth(cy + 10)` (`455`), `steam.setDepth(cy + 11)` (`456`), và `chest.setDepth(cy + 6)` đồng bộ với điểm neo Y của sprite.
- **Sau khi sửa (After):** Ở `(650, 452)`, `playerDepth (452) < cauldronDepth (455)` (vạc thuốc che phía trước chân nhân vật tự nhiên); ở `(630, 464)`, `playerDepth (464) > cauldronDepth (455)` (nhân vật đứng trước vạc thuốc); `prop_chest_bronze` không còn trong danh sách bất thường `depthAnomalyAudit`.
  - Before: [before_ydepth_cauldron.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-05/before_ydepth_cauldron.png)
  - After: [after_ydepth_cauldron.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-05/after_ydepth_cauldron.png)

---

## 3. Bảng Thống Kê Object Lifecycle (Before vs After — 10 Vòng Chuyển Vùng + Save/Load)

| Mốc đo đạc | Total Children | Image / Sprite / Graphics / Container / RT | Cullable (`total / vis / culled`) | Colliders / Canopies | Tweens | Scene Listeners (`events`) | PlayerState Listeners | Heap (MB) |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Loop 0 (Before / After, `ancient_rune_puzzle`)** | 1193 | `614 / 333 / 173 / 63 / 1` | `747 / 124 / 623` | `329 / 182` | 131 | 77 | 16 | 238.8 |
| **Loop 1 (`bellhollow`, 5 wildlife, AFTER)** | 1195 | `614 / 332 / 171 / 68 / 1` | `747 / 199 / 548` | `329 / 182` | 138 | 77 | 16 | 242.3 |
| **Loop 5 (`bellhollow`, AFTER)** | 1195 | `614 / 332 / 171 / 68 / 1` | `747 / 199 / 548` | `329 / 182` | 145 | 77 | 16 | 240.3 |
| **Loop 10 (`bellhollow`, AFTER)** | **1195** | `614 / 332 / 171 / 68 / 1` | `747 / 209 / 538` | `329 / 182` | 145 | **77** | **16** | 258.0 |
| **Load Cycle 1..3 (BEFORE fix)** | 1195 | `614 / 332 / 171 / 68 / 1` | `747 / 184 / 563` | `329 / 182` | 131 | **95 → 113 → 131 (+18/lần)** | 16 | 260.4–266.4 |
| **Load Cycle 1..3 (AFTER fix)** | **1195** | `614 / 332 / 171 / 68 / 1` | `747 / 184 / 563` | `329 / 182` | 131 | **77 → 77 → 77 (0 rò rỉ)** | **16** | 241.3–268.5 |

---

## 4. Kết Quả Y-Depth, Canopy, Frustum Culling & Danh Sách Điểm Bất Thường Đã Quét

### 4.1. Y-Depth & Canopy Transparency (Bellhollow)

- **Cây cổ thụ Nam Bellhollow (`728, 556`):** Trước cây `(728, 576)`: `playerDepth = 576 > treeDepth = 556`, `treeAlpha = 1.0`. Sau cây/dưới tán `(728, 530)`: `playerDepth = 530 < treeDepth = 556`, `treeAlpha = 0.35`. Rời xa `(950, 750)`: `treeAlpha = 1.0` ([after_ydepth_tree_behind.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-05/after_ydepth_tree_behind.png)).
- **Nhà Bà lão Edda (`1160, 130`) & NPC Edda (`1160, 160`):** Trước hiên `(1160, 175)`: `playerDepth 175 > eddaDepth 160 > houseDepth 130`. Sau mái `(1160, 92)`: `playerDepth 92 < houseDepth 130` ([after_ydepth_house_behind.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-05/after_ydepth_house_behind.png)).
- **Culling đa vùng & Zoom Camera (`total = 747`):**
  - `bellhollow zoom 2.0`: `190 visible / 557 culled` (`playerVisible = true, playerActive = true`).
  - `bellhollow zoom 2.5`: `174 visible / 573 culled` (`174 <= 190`).
  - `sanctuary_farm`: `107 / 640`, `outer_woods`: `160 / 587`, `crooked_path`: `96 / 651`, `silent_mire`: `124 / 623` — 100% thỏa `visible + culled === total` và nhân vật không bao giờ bị cull.

### 4.2. Quét Toàn Bộ 594 Ảnh (`depthAnomalyAudit` sau sửa)

Không còn `prop_cauldron_tripod` hay `prop_chest_bronze`. Các mục còn lại trong ngưỡng lọc thô (`Math.abs(depth - visualBottomY) > 7.5px`) đều hợp lệ theo thiết kế sprite:
- `hollow_props_atlas` hàng rào (`originY = 0.78`, `diffToAnchor = 0`, chênh đáy `-11.7 px` là khoảng đệm trong suốt dưới chân cột của atlas) và các bia đá cổ ngữ (`originY = 0.85`, `diffToAnchor = 0`).
- Bệ thờ Miếu Chuông Phế Tích `(4548, 270)` (`diffToAnchor = +44`, tiền cảnh nâng lớp chủ đích).
- Lều `prop_wayfarer_tent` (`diffToAnchor = -2`) và bếp lửa `campfire_tier1`/`campfire_tier2` (`diffToAnchor = -1`): sai số dưới `2 px`, chưa cần thay đổi.

---

## 5. Kiểm Tra Hồi Quy Sau Chỉnh Sửa Cuối

Đã dọn sạch script tạm (`TEMP_FILE_COUNT=0` trong `scripts/temp/`) và chạy xác minh sau chỉnh sửa cuối cùng:

- `npm run check` (`tsc --noEmit`): **PASS** (`0`).
- `npm run build` (`tsc && vite build`): **PASS** (`0`).
- `python scripts/temp/hw_h4_05_lifecycle_depth_audit.py after` (suite render/lifecycle/culling/camera zoom/depth trên `dist/` với assertion chặt): **PASS** (`0`).
- `npm run verify:data`: **PASS** (`0`, `15/15` kiểm tra).
- `python tests/hw_bug_21b_walk_run_verification.py`: **PASS** (`0`, `10/10` test).
- `git diff --check`: **PASS** (`0`).
