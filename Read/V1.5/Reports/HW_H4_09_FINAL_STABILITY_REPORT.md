# HW-H4-09 — V1.5.4 FINAL STABILITY & RELEASE GATE REPORT

- **Project:** HOLLOW WOODS (`Target: V1.5.4`)
- **Branch / Base HEAD:** `feat/v1.5.3-ag-world-polish` / `0617668a97f462877cbe2c30d304323e8fd48f6e`
- **Protocol:** `HYDRO HIGH ENGINEERING PROTOCOL V4` (`MODE: FINAL VERIFICATION ONLY`)
- **Release Gate Decision:** **`CONDITIONAL GO` (QA Candidate Nội Bộ — CHƯA ĐẠT `GO` Để Phát Hành Công Khai `V1.5.4`)**
- **Git Commit / Push / Tag / Publish:** None (`0 git commit`, `0 git push`, `0` version bump — **HARD STOP** chờ Owner phê duyệt)

---

## 1. Release Gate Verdict (`§6`)

> **Đề xuất:** **`CONDITIONAL GO`** *(Phê duyệt tạo bản QA Candidate cho Owner và QA kiểm thử thực tế trên Windows / P2Game Staging; **KHÔNG phát hành trực tiếp V1.5.4 ra công chúng** khi các lỗi P1 còn mở và các mục kiểm tra môi trường đích chưa hoàn tất).*

### Cơ sở quyết định
- **Lý do đạt mức QA Candidate (`0` blocker crash / `0` regression mới trên core loop):**
  - TypeScript (`npm run check`), production build (`npm run build`), data integrity (`15/15`), content registry, zero-404 asset audit (`212/212`), Save Schema 3 unit/priority checks và **9/9** hardened Playwright regression suites (`#12..#19`, `26B`) đều thoát **`0`** trên bản `dist/` cuối cùng.
  - Các lỗi nghiêm trọng nhất của đợt Hydro High đã được xử lý và kiểm chứng: `EndingSystem` flash/shake (`HW-H4-01`), Silent Mire / Crypt / Depths collider (`HW-H4-03`), rò rỉ `+18` scene listeners & Y-depth vạc/rương (`HW-H4-05`), tối ưu GPU đạt **`59.55–60.05 FPS`** trên GTX 1070 Ti VSync và **`173.45 FPS`** Uncapped (`HW-H4-06`), tọa độ & chống respawn Hooded Knight (`HW-H4-07`), cùng toàn vẹn Save/Continue/Restart/NewGame/Legacy V1.3 (`HW-H4-08`).
- **Lý do CHƯA ĐẠT `GO` phát hành chính thức `V1.5.4`:**
  - Còn **6 hạng mục `P1` chưa đóng** (`OPEN-01` rơi trùng `relic_heart_of_roots x2`, `OPEN-02` nhánh Stage 6 vào Miếu không kích hoạt Mire Warden khi thiếu `mire_pillars_solved`, `H4-NEW-04` phím `[C]` tự mở/đóng `CraftingModal`, `H4-NEW-05` xung đột `[M]` Mute vs Map, `H4-NEW-06` rò rỉ `AudioManager` capture listener, `H4-NEW-07` file `mossbound_wayfarer.rar` còn nằm trong `public/` & `dist/` + lệch version `1.5.2`/`1.5.1`/`1.4.0`), **3 hạng mục `PARTIAL`** (spawn quái/động vật thường trong `WildlifeSystem`, hủy thoại `ESC` hậu chiến boss `OPEN-03`, EVKey Windows), các mục `P2` nhỏ, và **chưa kiểm thử trên môi trường đích thực tế**.

---

## 2. Tổng Hợp Kết Quả Rà Soát `HW-H4-00` → `HW-H4-08` & Bug Registry (`§2`, `§5`)

### 2.1 Thống kê tổng quan trạng thái lỗi (Scope Hydro High V4 = `26` hạng mục được theo dõi + `3` kiểm chứng sạch không phát sinh sửa code; `R10` Registry kế thừa bảo toàn)

| Phân loại (`§5`) | Số lượng (Đợt Hydro High) | Mã / Hạng mục cụ thể | Ghi chú nguồn bằng chứng |
| --- | :---: | --- | --- |
| **`FIXED-PENDING-OWNER`** | **10** | `BUG-HW-CS21-01`, `HW-H4-03-MAIN`, `HW-H4-03-SUB1`, `HW-H4-03-SUB2`, `HW-H4-05-LEAK`, `HW-H4-05-DEPTH`, `HW-H4-06-PERF`, `HW-H4-08-SAVE` (5 lỗi Save/Reset/Legacy), `HW-CS21-06`, `HW-H4-08-HARNESS` (`#12..#19`) | Đã sửa trên working tree, có backup `Backups/steps/backup_hw_h4_*`, đạt auto-test cục bộ; chờ Owner duyệt & commit. |
| **`CLOSED-VERIFIED`** | **3** *(audit không cần sửa)* + **`32` R10** | Classic Sanity 2.1 & `BUG-023`; Farm `(648, 741)`; Walk/Run/Idle `160ms/frame`; cùng các mục `CLOSED-VERIFIED local` trong [V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md) | Đối chiếu `HW_H4_01`, `HW_H4_02`, `HW_H4_04`, `HW_H4_09` (`task-23706`). |
| **`PARTIAL`** | **3** | `H4-NEW-01`, `H4-NEW-02`, `HOTFIX-B2` | Chi tiết phần chưa khép ở Bảng 2.2. |
| **`OPEN`** | **9** | `H4-NEW-03`/`OPEN-01`, `OPEN-02`, `H4-NEW-04`, `H4-NEW-05`, `H4-NEW-06`, `H4-NEW-07`, `H4-NEW-08`, `H4-NEW-09`, `HW-H4-03-AUDIT` (`dfToAbyss` + legacy QA scripts `TMP-01/02`) | Còn tồn tại trong source/build hiện hành (`dist/`). |
| **`BLOCKED`** *(Môi trường / Owner)* | **2** *(+ `HOTFIX-B2`)* | `BUG-024` (P2Game CDN HTTP 206), `BUG-033` / Owner acceptance (World Map 5 expansion zones, đồ họa, nghe âm thanh thật `BUG-026/027`) | Ngoài giới hạn sandbox cục bộ. |
| **`DEFERRED`** *(Dành riêng Codex)* | **2** | `HW-CS21-04` (`BUG-058` Scale Pop), `HW-CS21-05` (`BUG-059` HD Consistency) | Giữ nguyên theo đúng Protocol V4 (hẹn Codex 27/11/2026). |
| **`REGRESSION`** | **0** | Không phát hiện hồi quy mới do các bản sửa `HW-H4-01..08` gây ra | Xác nhận trên `task-23605`, `task-23652`, `task-23706`. |

### 2.2 Chi tiết từng lỗi, file liên quan và trạng thái đối chiếu

| Mã | Mức | Hiện tượng & Bằng chứng thực tế trên codebase/build hiện tại | File nguồn liên quan | Trạng thái |
| --- | :---: | --- | --- | --- |
| `BUG-HW-CS21-01` | P2 | `EndingSystem.triggerTheFirstTollFinale()` nay tôn trọng `SettingsManager`; `task-23706` đo `flashCallsWithRM: 0, shakeCallsWithRM: 0`. | [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L291-L310) | `FIXED-PENDING-OWNER` |
| `HW-H4-03-MAIN` / `SUB1` / `SUB2` | P1 | Đã thông lối `Crooked Path <-> Silent Mire`, dời Biển Chỉ Dẫn & Đèn Đá, mở `Ancient Rune Puzzle -> Sunken Crypt Ruins` và `Silent Mire -> Drowned Mire Depths`; giữ khóa an toàn khi chưa đủ điều kiện. | [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts), [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json) | `FIXED-PENDING-OWNER` |
| `HW-H4-05-LEAK` & `DEPTH` | P1 | `totalSceneListeners` ổn định `77 -> 77 -> 77` qua 3 chu kỳ `handleLoadCheckpoint()`; sửa `setDepth` vạc thuốc & rương đồng. | [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L972-L993), [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L815-L824), [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts) | `FIXED-PENDING-OWNER` |
| `HW-H4-06-PERF` | P1 | Bake UI textures + dirty check `UIScene`/`QuickCraftSidebar`; world node shadow texture & culling + depthSort guard. | [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts), [QuickCraftSidebar.ts](file:///g:/HOLLOW%20WOODS/src/ui/QuickCraftSidebar.ts), [InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts), [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1019) | `FIXED-PENDING-OWNER` |
| `HW-H4-08-SAVE` | P0/P1 | Sửa 5 lỗi: `restoreUnlockedLore`, `PlayerState.reset()` (`wpn_walking_staff`, `campfireLevel=1`, `campfireFuel=180`), `cancelPendingGameSave()` prod-mode, `storageChest` object & crest alias V1.3, guard `updateAct0Progression()`. `13/13` E2E PASS + `depletedNodes` PASS + `CLOUD_LOCAL_PRIORITY_PASS`. | [PlayerState.ts](file:///g:/HOLLOW%20WOODS/src/state/PlayerState.ts), [SaveManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts), [CloudSaveService.ts](file:///g:/HOLLOW%20WOODS/src/services/CloudSaveService.ts), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts) | `FIXED-PENDING-OWNER` |
| `HW-CS21-06` & `#12..#19` | P2 | Sửa race `26B`, bổ sung `exit code`, `http_errors`, phân loại `ERR_ABORTED` BGM có log chi tiết, `staticBodies.size`, reload sentinel `#15`, negative fail-fast `3/3` trả `exit=1`. | `scripts/test_hw_bug12..19.py`, [hw_bug_26b_walkrun_fix_verification.py](file:///g:/HOLLOW%20WOODS/tests/hw_bug_26b_walkrun_fix_verification.py) | `FIXED-PENDING-OWNER` |
| `H4-NEW-01` | P0/P1 | `HW-H4-07` đã sửa `FALLEN_KNIGHT_HABITATS` & `HOODED_KNIGHT_HABITATS` (`deep_forest` `(2340, -190)` PASS ở `task-23706`). **Còn lại:** `SKULL_WOLF_HABITATS`, `SHADOW_*_HABITATS`, `DREAD_HORSEMAN_HABITATS`, `ZONE_HABITATS` trong [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L56-L172) vẫn dùng tọa độ cục bộ `260..1680`. | [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L56-L172) | `PARTIAL` |
| `H4-NEW-02` / `OPEN-03` | P0/P2 | Đã chặn Hooded Knight hồi sinh khi có cờ `boss_hooded_knight_defeated`. **Còn lại:** Hủy thoại hậu chiến bằng `ESC` (`DialogueSystem.cancelDialogue()`) chưa emit `'dialogue_completed'`. | [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L499), [EvilKnights.ts](file:///g:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L1026-L1030) | `PARTIAL` |
| `HOTFIX-B2` | P0/Env | Watchdog `600ms`, blur & IME packet PASS tự động; chưa xác nhận OS hook vật lý Windows `EVKey`/`UniKey`. | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts) | `PARTIAL` (`BLOCKED` env) |
| `H4-NEW-03` / `OPEN-01` | **P1** | Hạ Mire Warden cộng đúp `relic_heart_of_roots` (`x2`) & gán sớm `clapper_collected` trước bước nhặt chuông (`HW_H4_07` §5). | [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L7321-L7327), [BossEncounterSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts#L190) | `OPEN` |
| `OPEN-02` | **P1** | Nhánh Stage 6 (`shrine_bridge_lowered`, `shrine_unlocked`) sang cầu vào `broken_bell_shrine` chưa kích hoạt Mire Warden nếu thiếu `mire_pillars_solved \|\| mire_puzzle_solved` (`HW_H4_07` §5). | [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4238-L4242) | `OPEN` |
| `H4-NEW-04` | **P1** | Nhấn `[C]` vẫn không giữ mở `CraftingModal` trên `dist/` (`task-23706` đo `afterKeyC: false`); `[I]` mở `CraftingModal`. | [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L769-L790), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1909-L1975) | `OPEN` |
| `H4-NEW-05` | **P1** | Nhấn `[M]` ưu tiên Mute Audio thay vì World Map (`task-23706` đo `afterKeyM: false`, mở qua `[N]: true`). | [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1930-L1932), [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L812-L814) | `OPEN` |
| `H4-NEW-06` | **P1** | Rò rỉ 5 `window` listeners trong `setupAutoplayUnlock()`: `removeEventListener` dòng 576 thiếu `{ capture: true }` (xác nhận trực tiếp trong source). | [AudioManager.ts](file:///g:/HOLLOW%20WOODS/src/audio/AudioManager.ts#L569-L594) | `OPEN` |
| `H4-NEW-07` | **P1/P2** | `public/assets/characters/mossbound_wayfarer.rar` (`185.5 KB`) vẫn tồn tại và lọt vào `dist/assets/characters/mossbound_wayfarer.rar` (`task-23706`); version metadata lệch giữa `1.5.2` (`package.json`, `p2game.json`), `1.5.1` (`SaveManager`), `1.4.0` (`LeaderboardService.ts:140`). | [package.json](file:///g:/HOLLOW%20WOODS/package.json), [p2game.json](file:///g:/HOLLOW%20WOODS/p2game.json), [LeaderboardService.ts](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.ts#L140) | `OPEN` |
| `H4-NEW-08` | **P2** | `triggerSonicRoar()` tạo `shockGfx` + `time.addEvent` + `delayedCall` không kiểm tra `!this.active \|\| !this.scene` (xác nhận trực tiếp trong source). | [MireWardenBoss.ts](file:///g:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts#L405-L433) | `OPEN` |
| `H4-NEW-09` | **P2** | `checkDirectGaze()` vẽ overlay `0x2c3e50` (`alpha 0.22`) không kiểm tra `SettingsManager.isScreenFlashEnabled()` (xác nhận trực tiếp trong source). | [TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts#L109-L121) | `OPEN` |
| `HW-H4-03-AUDIT` & `TMP-01/02` | **P2** | Cửa `Deep Forest -> Abyssal Chasm` (`to_abyssal_chasm`) hụt `2 px` tại `footY = -622`, rìa nam `bell_to_fog_y280`; script cũ `audit_map_reachability_and_assets.mjs` & `verify_pre_release_audit.mjs` giữ check V1.4.0 lỗi thời. | [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json#L2746-L2756), [verify_pre_release_audit.mjs](file:///g:/HOLLOW%20WOODS/scripts/verify_pre_release_audit.mjs) | `OPEN` |
| `BUG-024`, `BUG-033` | P1/P2 | Hosted CDN Range 206 (`BUG-024`) và Owner playtest World Map / 5 expansion zones (`BUG-033`). | Hạ tầng CDN / UI review | `BLOCKED` |
| `HW-CS21-04`, `HW-CS21-05` | P2 | Frame-0 Scale Pop & HD Consistency giữa `64×64` và `84×72`. | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L269-L279) | `DEFERRED` (Codex) |

---

## 3. Kết Quả Full Regression Theo 14 Phân Hệ (`§3`)

Tất cả kiểm tra bên dưới đối chiếu trên **bản `dist/` cuối cùng (`dist/assets/index-B48zhYTu.js`)** và nguồn hiện tại:

| Phân hệ kiểm tra (`§3`) | Hình thức kiểm tra & Bằng chứng gần nhất | Kết quả | Ghi chú phạm vi / Tồn đọng |
| --- | --- | :---: | --- |
| **New Game** | `task-23706` (`ck1_newgame`) + `hw_h4_08_save_after.json` | **PASS** | Vào `fog_crossing (120, 195)`, `wpn_walking_staff`, không dính debounced save cũ. |
| **Bellhollow** | `task-23706` + `HW_BUG_13/15/16/19` (`task-23605`, `task-23652`) | **PASS** | Di chuyển, Y-depth, culling, cổng Đông & cụm Bram ổn định. |
| **NPC và hội thoại** | `task-23706` (`ck2_dialogue`: Garth mở cổng Đông) + `HW_BUG_19` (Edda, Neris, Sir Vaelen) | **PASS** *(trừ ESC boss)* | Còn `OPEN-03`: hủy thoại hậu chiến bằng `ESC` không phát `'dialogue_completed'`. |
| **Crafting và Inventory** | `task-23706` (`ck3_craft`) + `HW-H4-06` `task-23012` (QuickCraft `item_lantern_oil` +1, Harvest/Respawn) + `hw_h4_08_r1_extra_checks.json` (`depletedNodes`) | **PARTIAL / OPEN (`H4-NEW-04`)** | Mở qua UI/QuickCraft và nạp Save/Inventory/Chest hoạt động; nhưng nhấn phím **`[C]` tự đóng ngay (`afterKeyC: false`)**. |
| **World Map** | `task-23706` (`ck4_map`) + `HW_BUG_17` & `HW_BUG_19` | **PARTIAL / OPEN (`H4-NEW-05`)** | Mở qua `[N]` & đồng bộ node/mục tiêu đạt; nhưng phím **`[M]` không mở (`afterKeyM: false`)**, còn 5 expansion zones chưa hiện node. |
| **Sanctuary Farm** | `task-23706` (`ck5_farm`: đi qua `(648, 741)` `618 -> 683`) + `HW_BUG_15` Case C + `HW_BUG_19` Stage 3 | **PASS** | Thông thoáng với `Noclip OFF`, giữ đống củi & collider kho/hàng rào. |
| **Outer Woods** | `task-23706` (`ck67_outer_lantern_sanity`) + `HW_BUG_15` Case D + `HW_BUG_19` Stage 4 + `26B` | **PASS** | Sir Vaelen, lửa trại, xưởng chuông & Guardrail chuẩn xác (`H4-NEW-01` quái thường còn sai offset). |
| **Sanity 2.1** | `task-23706` (`ck67`: `composure=11` → `isPanicVignetteActive: true`, `veilDistortionDrawn: false`, hồi `100` → sạch) + `HW_H4_01` | **PASS** | Bảo toàn Classic Sanity 2.1. |
| **Vòng Sáng Hộ Tâm** | `task-23706` (`ck67`: `[F]` bật `lanternOnAfterF: true`, trừ Thể Lực `100 -> 94`) + `hw_h4_08_save_after.json` (Save ON/OFF) | **PASS** | Đồng bộ HUD, aura, tiêu hao Thể Lực & Save/Load ON/OFF. |
| **Hooded Knight** | `task-23706` (`ck8`: `deep_forest` `(2340, -190)`, `inDeepForestBounds: true`) + `HW_H4_07` (`hw_h4_07_after.json`) | **PASS** *(trừ ESC `OPEN-03`)* | Spawn đúng zone, hạ gục nhận crest & không hồi sinh sau chuyển vùng/Continue. |
| **Mire Warden** | `HW_H4_07` (`hw_h4_07_after.json` đi bộ qua `to_shrine` phá 3 trụ & hạ `100->0`) + `task-23706` *(lưu ý: `ck9` teleport thẳng bỏ qua trigger `to_shrine`)* | **PASS với `mire_pillars_solved`** *(còn `OPEN-01`, `OPEN-02`)* | Hoạt động khi có `mire_pillars_solved` qua `to_shrine`; Stage 6 thiếu pillars không mở boss (`OPEN-02`), rơi `relic_heart_of_roots x2` (`OPEN-01`). |
| **Save/Continue** | `hw_h4_08_save_after.json` (`13/13`), `hw_h4_08_r1_extra_checks.json`, `task-23706` (`ck10`), `HW_BUG_17`, `test_v153_save_schema3.mjs`, `CLOUD_LOCAL_PRIORITY_PASS` | **PASS** | Đầy đủ stats, lore, inventory/chest, quest/boss/NPC flags, zones, campfire, lantern, depleted nodes, Restart/New Game & V1.3 compat. |
| **Settings** | `hw_h4_08_save_after.json` & `task-23706` (`ck10`, `ck11`) | **PASS** | Lưu/phục hồi volume, quality, flash/shake/reduced motion chính xác. |
| **Ending (kích hoạt)** | `task-23706` (`ck11`: `triggerTheFirstTollFinale()`, `isEndingActive: true`, `flashCallsWithRM: 0, shakeCallsWithRM: 0`) | **STAGED-PASS / FULL MINUTE-0 `NOT RUN`** | `triggerTheFirstTollFinale()` chạy sạch, tôn trọng `Reduced Motion`. Tuy nhiên **chưa chạy walkthrough nối liền từ Phút 0 → Ending** (nhánh `true_ending` / `sacrifice_ending` / `fog_loop_ending` theo đủ chuỗi quest). |

- **Các chặng `NOT RUN` (chưa thực hiện trong sandbox):**
  1. Playtest liền mạch một mạch **Phút 0 → toàn bộ 7 Stage Quest → Ending thật (`true_ending` / `sacrifice_ending`)** bằng tay người chơi.
  2. Thử nghiệm **P2Game Cloud Save / Leaderboard thật trên server P2Game hosted**.

---

## 4. Kiểm Tra Môi Trường Đích (`§4`) — Tình Trạng Trung Thực

| Hạng mục môi trường đích (`§4`) | Trạng thái | Chi tiết thực tế |
| --- | :---: | --- |
| **Windows + EVKey / UniKey** | **NOT VERIFIED ON PHYSICAL OS** | Mới kiểm tra giả lập IME packet 229/231 + Shift Watchdog 600ms trong Edge (`26B`, `#12`); hook mức kernel `WH_KEYBOARD_LL` của EVKey cần Owner thử tay. |
| **P2Game hosted** | **NOT RUN (BLOCKED)** | Không có quyền deploy/truy cập hạ tầng P2Game hosted từ sandbox. |
| **Tải asset khi mạng chậm** | **NOT VERIFIED** | Chỉ đo `dist/` qua HTTP localhost (`verify_zero_404_assets` `212/212`, `#12..#19` `http_errors=0`); chưa throttle mạng chậm / CDN 206 (`BUG-024`). |
| **Kiểm tra âm thanh bằng người nghe thực** | **NOT RUN** | `HW-BUG-#9` mới đo bằng phân tích phổ/RMS trên cloud; cần Owner nghe trực tiếp bằng tai người. |
| **Hiệu năng GPU thật** | **MEASURED AT `HW-H4-06` / NOT RE-RUN POST `HW-H4-07..08`** | `HW-H4-06` đo trên **`NVIDIA GeForce GTX 1070 Ti` D3D11 (`1280×720`)**: **VSync `59.55–60.05 FPS`**, **Uncapped `84.50 -> 173.45 FPS`** (`Draws 199.7 -> 92.6`, `UI 5.82 -> 0.57 ms`). Các script `HW-H4-08` chạy trên Edge SwiftShader CPU (`8.76 FPS` tại `#18`) nên không đại diện FPS GPU thật. |
| **Owner nghiệm thu World Map & đồ họa** | **PENDING OWNER** | Cần Owner xem trực tiếp World Map `[N]` và visual sau các đợt chỉnh sửa. |

---

## 5. Kết Quả TypeScript, Build & Hiệu Năng (`§7`)

- **TypeScript (`npm run check` / `tsc --noEmit`):** Exit **`0`** (`0` lỗi).
- **Data Integrity (`npm run verify:data`):** Exit **`0`** (`15/15 PASS`).
- **Assets 404 & Registry:** `verify_zero_404_assets.mjs` (`212/212`, exit `0`), `verify_content_registry.mjs` (`exit 0`).
- **Production Build (`npm run build` / `tsc && vite build`):** Exit **`0`**, xuất `dist/assets/index-B48zhYTu.js` (`1,182.77 kB`), `dist/assets/game-data-DB3Gx1Mn.js` (`160.99 kB`), `dist/assets/vendor-phaser-CUeKjumc.js` (`1,685.15 kB`). *(Ghi nhận `dist/assets/characters/mossbound_wayfarer.rar` vẫn bị sao chép từ `public/`).*
- **Hiệu năng tóm tắt (từ [HW_H4_06_PERFORMANCE_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_06_PERFORMANCE_REPORT.md), GTX 1070 Ti D3D11, `1280×720`, `71` kịch bản = `284` lượt chạy 10s):**
  - VSync 60 Hz (`24` kịch bản 4 zones × 2 qualities × Sanity 100/11/0): Avg FPS **`58.33 -> 59.90 FPS`**, 1% Low **`30.27 -> 41.87 FPS`**, CPU frame time **`12.08 -> 6.37 ms` (`-47.3%`)**, `UIScene` **`5.82 -> 0.57 ms` (`-90.2%`)**, WebGL Draw Calls **`199.7 -> 92.6` (`-53.6%`)**.
  - Uncapped Headroom: Avg FPS **`84.50 -> 173.45 FPS` (`2.05×`)**, 1% Low **`43.77 -> 88.86 FPS` (`2.03×`)**.
  - SwiftShader Headless Sanity Check sau `HW-H4-08` (`#18`, `task-23605`): Culling `0.226 ms/call`, `0` runtime errors, `heapUsed` ổn định `~256–259 MB`.

---

## 6. Danh Sách Toàn Bộ File Thay Đổi & Đề Xuất Commit Độc Lập (`§7`)

### 6.1 Các file đã sửa / thêm trong working tree (`0` commit, `0` push)
- **Production (`src/` — 12 files):**
  1. [src/systems/EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts) (`+19/-4`) — `HW-H4-01`
  2. [src/world/WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts) (`27 +-`) — `HW-H4-03` + `HW-H4-05`
  3. [src/data/zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json) (`20 +-`) — `HW-H4-03`
  4. [src/scenes/UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts) (`728 +-`) — `HW-H4-06`
  5. [src/ui/QuickCraftSidebar.ts](file:///g:/HOLLOW%20WOODS/src/ui/QuickCraftSidebar.ts) (`181 +-`) — `HW-H4-06`
  6. [src/systems/InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts) (`74 +-`) — `HW-H4-06`
  7. [src/entities/BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts) (`71 +-`) — `HW-H4-06`
  8. [src/systems/WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts) (`41 +-`) — `HW-H4-05` + `HW-H4-07`
  9. [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts) (`36 +-`) — `HW-H4-05` + `HW-H4-06` + `HW-H4-08`
  10. [src/state/PlayerState.ts](file:///g:/HOLLOW%20WOODS/src/state/PlayerState.ts) (`+23`) — `HW-H4-08`
  11. [src/systems/SaveManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts) (`12 +-`) — `HW-H4-08`
  12. [src/services/CloudSaveService.ts](file:///g:/HOLLOW%20WOODS/src/services/CloudSaveService.ts) (`29 +-`) — `HW-H4-08`
- **Test Harnesses (`scripts/` & `tests/` — 9 files):**
  - `scripts/test_hw_bug12_hotfix_regression.py` .. `scripts/test_hw_bug19_progression_playtest.py`
  - `tests/hw_bug_26b_walkrun_fix_verification.py`
- **Reports, Telemetry & Visuals (`Read/V1.5/Reports/`):**
  - `HW_H4_00`..`HW_H4_09_*.md`, `Read/V1.5/Reports/Evidence/HW-H4-06..09/*`, cập nhật `HW_BUG_12..19_*.json`, `bug023/hw_fix23a/hw_fx31/hw_stab32_metrics.json` và PNG kiểm chứng trong `Read/V1.5/Reports/Visuals/`.
- **Lưu ý giữ nguyên file sẵn có của Owner (KHÔNG gộp vào commit Hydro High nếu Owner chưa chỉ định):** `scripts/AUDIO_SOURCES_MANIFEST.csv`, `scripts/AUDIO_SOURCES_MANIFEST.json`, `scripts/generate_audio_sources_manifest.mjs`, `Read/V1.5/Reports/HW_CS21_QA_06_CHECKPOINT_REPORT.md`; `Backups/` và `dist/` được `.gitignore` loại trừ tự động.

### 6.2 Đề xuất tách từng Commit độc lập cho Owner duyệt
1. **`fix(ending): honor SettingsManager flash/shake/reduced-motion in EndingSystem` (`HW-H4-01`)**
   - `src/systems/EndingSystem.ts`
2. **`fix(world): resolve Silent Mire, Sunken Crypt, and Drowned Mire collider bottlenecks` (`HW-H4-03`)**
   - `src/data/zones.json` + các hunk Silent Mire / Crypt / Depths trong `src/world/WorldBuilder.ts`
3. **`fix(lifecycle): clean scene event listeners on restart and align cauldron/chest Y-depth` (`HW-H4-05`)**
   - Các hunk Y-depth trong `src/world/WorldBuilder.ts`, listener cleanup trong `src/systems/WildlifeSystem.ts` & `src/scenes/GameScene.ts` (`L972-L993`)
4. **`perf(render): bake static HUD/QuickCraft/shadow textures and cull world resource nodes` (`HW-H4-06`)**
   - `src/scenes/UIScene.ts`, `src/ui/QuickCraftSidebar.ts`, `src/systems/InventorySystem.ts`, `src/entities/BlackKnightPlayer.ts`, và hunk `updateEntityCameraCulling()` trong `src/scenes/GameScene.ts`
5. **`fix(boss): correct Hooded & Fallen Knight zone coordinates and block defeated respawn` (`HW-H4-07`)**
   - Các hunk `FALLEN_KNIGHT_HABITATS` / `HOODED_KNIGHT_HABITATS` / `boss_hooded_knight_defeated` trong `src/systems/WildlifeSystem.ts`
6. **`fix(save): restore unlockedLoreIds, cleanly reset weapon/campfire/Act0, and support legacy chest/crest` (`HW-H4-08`)**
   - `src/state/PlayerState.ts`, `src/systems/SaveManager.ts`, `src/services/CloudSaveService.ts`, và các hunk `cancelPendingGameSave()` / `updateAct0Progression()` trong `src/scenes/GameScene.ts`
7. **`test(qa): harden HW-BUG-12..19 and 26B assertions, exit codes, and BGM abort classification` (`HW-H4-08-R1`)**
   - `scripts/test_hw_bug12..19.py`, `tests/hw_bug_26b_walkrun_fix_verification.py`, và telemetry JSON/Visuals cập nhật tương ứng
8. **`docs(qa): archive HW-H4-00..09 stability audit, benchmark, and release gate reports`**
   - `Read/V1.5/Reports/HW_H4_00..09_*.md`, `Read/V1.5/Reports/Evidence/HW-H4-06..09/*`

---

## 7. Khuyến Nghị Cuối Trước Khi Cho Phép `GO` Phát Hành `V1.5.4`

1. Giải quyết **nhóm P1 cốt lõi (`HW-H4-10` đề xuất cho Owner duyệt)**: sửa `OPEN-01` (rơi trùng `relic_heart_of_roots`), `OPEN-02` (mở boss Mire Warden cho cả nhánh Stage 6), `OPEN-03` (`ESC` hủy thoại), `H4-NEW-04` (`[C]` crafting double-toggle), `H4-NEW-05` (xung đột `[M]`), `H4-NEW-06` (`AudioManager` capture removeListener), `H4-NEW-01` phần tọa độ quái/động vật thường, và xóa/loại `mossbound_wayfarer.rar` + đồng bộ số phiên bản (`H4-NEW-07`).
2. Chờ **Codex** xử lý `HW-CS21-04` (Scale Pop) & `HW-CS21-05` (HD Consistency).
3. Chạy nghiệm thu thực địa: GPU thật trên build cuối, EVKey Windows thật (`HOTFIX-B2`), nghe âm thanh thật (`BUG-026/027`), staging P2Game (`BUG-024`), và lượt playtest Phút 0 → Ending.

---

**HARD STOP:** Chờ chỉ thị và phê duyệt của Owner. Không thực hiện `git commit`, `git push`, `merge main`, `tag`, đổi `package.json version` hay phát hành.
