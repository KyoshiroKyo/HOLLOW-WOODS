# HW-H4-07 — BOSS ENCOUNTER & QUEST PROGRESSION REPORT

- **Protocol:** `HYDRO HIGH ENGINEERING PROTOCOL V4`
- **Verification Mode:** `STAGED-INTEGRATION` (Save fixtures injected into `localStorage` and loaded via Main Menu **TIẾP TỤC HÀNH TRÌNH** against production `dist/`, driven with real Playwright keyboard input `WASD`, `ShiftLeft`, `KeyZ`, `Space`, `KeyQ`, `KeyF`, `KeyE`, `Digit1`, `Digit3`; NOT claimed as full playthrough from Minute 0).
- **Status:** **COMPLETED WITH 1 P0 BLOCKER FIXED (`WildlifeSystem.ts`), SECONDARY ITEMS DOCUMENTED AS `CONFIRMED OPEN`**
- **Git Commit / Push:** None (`0 git commit`, `0 git push`).

---

## 1. Tóm tắt kết quả theo mục tiêu HW-H4-07

| Hạng mục | Trước sửa (`BASELINE`) | Sau sửa (`AFTER`) | Trạng thái |
| --- | --- | --- | --- |
| **Hooded Knight (`deep_forest` / `ancient_rune_puzzle`)** | **FAIL (P0):** Boss spawn ở Bellhollow `(1300, 260)` / `(860, 290)` ngoài vùng; 3 Fallen Knight spawn ở Bellhollow; hồi sinh lại ở `(1300, 260)` khi quay lại `deep_forest` hoặc Save/Continue dù đã có `boss_hooded_knight_defeated`. | **PASS:** Spawn tự nhiên trong `deep_forest` `(2340, -190)` và `ancient_rune_puzzle` `(3590, 290)`; escorts spawn trong vùng; kích hoạt thoại `hooded_knight_encounter_intro` -> chiến đấu -> hạ gục nhận `quest_corrupted_crest = 1` & `boss_hooded_knight_defeated`; không hồi sinh khi đợi tại vùng, chuyển vùng `deep_forest -> crooked_path -> deep_forest` hoặc Save/Continue. | **FIXED** |
| **Fallen Knights (`crooked_path` / `deep_forest`)** | Spawn ở `(980, 320)` và `(1020, 270)` (thuộc Bellhollow). | Spawn đúng tọa độ vùng tại `(2360, 240)` (`crooked_path`) và `(2040, -200)` + `(2230, -175)` / `(2450, -175)` (`deep_forest`); chuyển `pray -> chase -> vulnerable`. | **FIXED** |
| **Mire Warden (vào Miếu khi đã giải 3 cột `mire_pillars_solved`)** | Khởi tạo trận đấu, `[Q]` dụ `CHARGING`, `[Z]` né, khiên chặn sát thương trước khi vỡ 3 trụ, phá 3 Rune Pillars (`pillar_nw/ne/se`) làm `isShieldBroken = true`, chém `[Space]` hạ `100 -> 0 HP` (`DEFEATED`), không tái spawn khi vào lại hoặc Save/Continue. | Không hồi quy trên bản build `AFTER`: kích hoạt `STALK`, phá 3 trụ, hạ `100 -> 0 HP` (`DEFEATED`), cấp `quest_bronze_clapper = 1` & flags chuẩn. Lưu ý rơi trùng `relic_heart_of_roots = 2` (`OPEN-01`). | **PASS (kèm `OPEN-01`)** |
| **Mire Warden (chỉ mở cầu Stage 6, chưa có `mire_pillars_solved`)** | Qua cầu `to_shrine` vào `broken_bell_shrine` nhưng `isBossFightActive = false`, `mireWarden = null`. | Giữ nguyên ngoài phạm vi 1 blocker (`§7`). | **CONFIRMED OPEN (`OPEN-02`)** |
| **TheListener (`crooked_path`)** | Spawn `(2251, 239)` hitbox `22x14`, `[Shift+D]` kích `CHASE` gây `-25 HP / -26 Composure`, Pháo sáng `[3]` ép `CHASE -> ALERT`. | Đi vào vùng an toàn Bellhollow (`x = 1579 <= 1620`) ngắt `CHASE` về `PATROL`. | **PASS** |
| **TheEcho (`crooked_path`)** | *(Trong test `outer_woods` trước đó, điểm thử không trùng `echoSpawns`)* | Spawn tại `(1860, 216)` (`hasBody: false`), nhìn trực diện khi tắt đèn giảm Composure (`90.87 -> 77.25 -> 68.08`), áp sát `<= 48px` (`x: 1867, y: 220`) tan biến (`activeEcho = null`), nâng `memoryAwakeningStage: 1 -> 2`. | **PASS** |
| **FallenKnightApparition (`crooked_path`)** | *(Gần Lửa Trại Sir Vaelen tại `outer_woods` Composure hồi lên `33.5 -> 38.9` nên chặn spawn theo thiết kế)* | Đặt `composure = 20 (< 30)` ở `crooked_path` spawn thành công tại `(1788, 60)` với `hasBody: false`, tự biến mất khi Composure hồi `>= 45` (`84.07`). | **PASS** |
| **Console / Page / HTTP `>=400` errors (non-p2game)** | `0` trên tất cả các ca. | `0` trên tất cả các ca. | **PASS** |

---

## 2. Phân tích Source Thực tế (`src/`)

1. **Hệ thống Quest & Gating ([quests.json](file:///g:/HOLLOW%20WOODS/src/data/quests.json), [QuestSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/QuestSystem.ts), [WorldGatingSystem.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts)):**
   - Tuyến 7 chặng: `A -> E -> B -> D -> F -> E -> C`; Stage 6 (`Q_STAGE_6_BACK_TO_E`) dùng `quest_purification_key` gọi `QuestSystem.unlockBridge()` bật `mire_root_seal_broken`, `shrine_bridge_lowered`, `shrine_unlocked` và chuyển `currentQuestId` sang `Q06_RETRIEVE_CLAPPER` (`t1`, `t2`, `t3`).
   - Tại [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4238-L4242) (cùng L4328, L6197, L6217), điều kiện gọi `triggerMireWardenBossEncounter()` kiểm tra `(mire_pillars_solved || mire_puzzle_solved)`. Do đó nếu người chơi chỉ mở cầu bằng Stage 6 mà không giải 3 cột cổ ngữ Đầm Lầy thì bước qua `to_shrine` vẫn vào được Miếu nhưng Boss chưa kích hoạt (`OPEN-02`).

2. **Mire Warden ([MireWardenBoss.ts](file:///g:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts), [BossMireWarden.ts](file:///g:/HOLLOW%20WOODS/src/entities/BossMireWarden.ts), [BossEncounterSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts)):**
   - Hitbox Arcade `84x44` offset `(-42, -42)`, origin `(0.336, 0.988)`, scale `1.8`, `bossHp = 100`.
   - Bộ animation `anim_boss_wetlands_idle/walk/attack1/attack2/hit/death` đăng ký tại [PreloadScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts#L958-L1005).
   - Cơ chế sát thương trong [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L2892-L2956): trước khi phá hủy 3 `runePillarTargets` (`pillar_nw`, `pillar_ne`, `pillar_se`, mỗi trụ `30 HP`) hoặc vỡ khiên (`isShieldBroken`), đòn chém vào boss bị chặn (`showInvulnerableWarning()`). Sau khi phá 3 trụ, `takeDamage()` trừ HP cho tới `<= 0` rồi gọi `finishMireWardenDefeat()`.
   - Cả [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L7320-L7330) (`addItem('relic_heart_of_roots', 1)`) và [BossEncounterSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts#L189-L194) đều cộng `relic_heart_of_roots`, dẫn tới tổng cộng nhận `x2` (`OPEN-01`), và `GameScene.ts:7327` gán sớm `clapper_collected` trước khi tương tác `collect_bell_tongue`.

3. **Hooded Knight & Fallen Knights ([WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts), [EvilKnights.ts](file:///g:/HOLLOW%20WOODS/src/entities/EvilKnights.ts), [dialogues.json](file:///g:/HOLLOW%20WOODS/src/data/dialogues.json#L785-L865)):**
   - Ranh giới vùng tại [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json): `crooked_path` (`x: 1600..2880, y: 0..640`), `deep_forest` (`x: 1600..2880, y: -640..0`), `ancient_rune_puzzle` (`x: 3350..3700, y: 150..430`).
   - Trước sửa lỗi, `FALLEN_KNIGHT_HABITATS` (`980, 320` và `1020, 270`) và `HOODED_KNIGHT_HABITATS` (`1300, 260` và `860, 290`) đều rơi vào tọa độ Bellhollow (`x < 1600, y > 0`), khiến boss hoàn toàn vắng mặt khi khám phá `deep_forest` hoặc `ancient_rune_puzzle`.
   - Ngoài ra `WildlifeSystem.update()` (`L499`) chưa kiểm tra `!PlayerState.getInstance().hasFlag('boss_hooded_knight_defeated')`, còn nhánh dọn tham chiếu `this.hoodedKnight = null` bị kẹt bên trong `if (this.hoodedKnight && this.hoodedKnight.active)`, khiến boss tạo bản sao mới mỗi lần quay lại vùng hoặc nạp Save (`TIẾP TỤC HÀNH TRÌNH`).

---

## 3. Lỗi Blocker Chính Đã Sửa (1 Blocker Fix)

- **File sửa:** [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts)
- **File Backup gốc:** [WildlifeSystem.ts (Backup)](file:///g:/HOLLOW%20WOODS/Backups/steps/backup_hw_h4_07/WildlifeSystem.ts)
  - SHA-256 Backup (`BEFORE`): `0B36569A3C55D3C419DA25B6779ACB44B766D40DD68BB3602E1F5502F50150BF`
  - SHA-256 Sau sửa (`AFTER`): `797E4F4D02DE8BD0E132D3A3D7B3DA0B18D69E4E4A02283D9C6EF5A12ECEA200`
- **Thay đổi cụ thể ([L83-97](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L83-L97), [L498-540](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L498-L540)):**
  1. Cập nhật `FALLEN_KNIGHT_HABITATS`: `crooked_path: [{ x: 2360, y: 240 }]`, `deep_forest: [{ x: 2040, y: -200 }]`.
  2. Cập nhật `HOODED_KNIGHT_HABITATS`: `deep_forest: { x: 2340, y: -190 }`, `ancient_rune_puzzle: { x: 3590, y: 290 }`.
  3. Bổ sung điều kiện `!PlayerState.getInstance().hasFlag('boss_hooded_knight_defeated')` khi spawn `HoodedKnightBoss` trong `update()`, dọn sạch `this.hoodedKnight = null` khi `!this.hoodedKnight.active`, và chặn sinh thêm 2 `FallenKnightEntity` hộ vệ khi `this.hoodedKnight.isDefeated` hoặc cờ `boss_hooded_knight_defeated` đã bật.

---

## 4. Telemetry So sánh Before / After & Quest Flags / Rewards

### 4.1 Hooded Knight (`deep_forest` & `ancient_rune_puzzle`)

- **Fixture `deep_forest` (`BEFORE` vs `AFTER`):**
  - **Trước sửa ([hw_h4_07_baseline.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-07/hw_h4_07_baseline.json)):**
    - Spawn tại `(1300, 260)` (`out_of_bounds_at_spawn: true`), escorts tại `(1020, 270)`, `(1190, 275)`, `(1410, 275)` — người chơi ở `(2080, -140)` không thể gặp boss tự nhiên.
    - Sau khi thử nghiệm kéo boss vào vùng và hạ gục: `flags` thêm `boss_hooded_knight_defeated`, `choice_hooded_knight_resolve`; `inventory.quest_corrupted_crest = 1`.
    - Quay lại `deep_forest` từ `crooked_path`: **Respawn boss mới** (`exists: true, active: true, hp: 10, state: 'idle', isDefeated: false, x: 1300, y: 260`).
    - Save -> Reload -> **Continue**: **Respawn boss mới** (`exists: true, active: true, hp: 10, state: 'idle'`).
  - **Sau sửa ([hw_h4_07_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-07/hw_h4_07_after.json)):**
    - Spawn tự nhiên trong `deep_forest`: `HoodedKnightBoss` ở `(2340, -190)`, escorts ở `(2230, -175)`, `(2450, -175)` và habitat knight ở `(2040, -200)`.
    - Đi bộ thực tế `KeyD` + `KeyW` từ `(2080, -140)` -> `(2099, -159)` kích hoạt `hooded_knight_encounter_intro`, `memoryAwakeningStage: 1 -> 2`, `hasRecognized: true`, `state: 'stagger'`.
    - Thoại xong (`KeyE` / `Digit1`) -> chiến đấu `[Space]` -> hạ gục -> thoại kết thúc -> nhận `quest_corrupted_crest = 1`, flags `['boss_hooded_knight_defeated', 'choice_hooded_knight_farewell', 'choice_hooded_knight_resolve']`, chờ 2s boss biến mất (`hk = null`).
    - Rời sang `crooked_path` -> quay lại `deep_forest`: **`hk = null`** (không tạo bản sao mới).
    - Save -> Reload -> **TIẾP TỤC HÀNH TRÌNH**: **`hk = null`**, `quest_corrupted_crest = 1`, `boss_hooded_knight_defeated` được giữ nguyên.
    - Kiểm chứng bổ sung tại `ancient_rune_puzzle` (`Case 2B`): Save chưa đánh bại spawn ở `(3590, 290)`; Save đã có `boss_hooded_knight_defeated` không spawn (`hk = null`).

### 4.2 Mire Warden (`silent_mire -> broken_bell_shrine`)

- **Flags trước khi vào Miếu (Case 1B):** `['bellhollow_intro_done', 'elder_intro_done', 'mire_pillars_solved', 'mire_puzzle_solved', 'mire_root_seal_broken', 'shrine_bridge_lowered', 'shrine_unlocked', 'tutorial_done', 'visited_silent_mire']`, `currentQuestId = 'Q06_RETRIEVE_CLAPPER'`, `relic_heart_of_roots = 0`, `quest_bronze_clapper = 0`.
- **Flags & Vật phẩm sau hạ gục (Case 1B):**
  - Thêm flags: `['boss_mire_warden_defeated', 'clapper_collected', 'root_seal_restored', 'title_purifier_of_mist']`.
  - Vật phẩm: `quest_bronze_clapper = 1`, **`relic_heart_of_roots = 2`** (xem `OPEN-01`).
  - Save/Continue trước trận & sau trận hoạt động bình thường; quay lại `broken_bell_shrine` hoặc Reload/Continue không hồi sinh Mire Warden (`isBossFightActive = false`, `relic_heart_of_roots` giữ `2`).

---

## 5. Các vấn đề `CONFIRMED OPEN` (Không sửa do giới hạn tối đa 1 blocker)

1. **`OPEN-01` — Rơi trùng `relic_heart_of_roots` (`x2`) & đặt sớm `clapper_collected`:**
   - [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L7321-L7327) và [BossEncounterSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts#L190) cùng gọi `addItem('relic_heart_of_roots', 1)`, đồng thời `GameScene.ts:7327` gán sớm `clapper_collected` ngay khi hạ boss thay vì đợi `collect_bell_tongue`.
2. **`OPEN-02` — Đường Stage 6 chưa kích hoạt Mire Warden nếu thiếu `mire_pillars_solved`:**
   - [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4238) (cùng L4328, L6197, L6217) yêu cầu `mire_pillars_solved || mire_puzzle_solved`, trong khi `QuestSystem.unlockBridge()` ở Stage 6 chỉ cấp `mire_root_seal_broken`, `shrine_bridge_lowered`, `shrine_unlocked`.
3. **`OPEN-03` — Hủy thoại bằng `ESC` không phát sự kiện `'dialogue_completed'`:**
   - [EvilKnights.ts](file:///g:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L1026-L1030) chỉ lắng nghe `this.scene.events.once('dialogue_completed', ...)` trong khi `DialogueSystem.cancelDialogue()` (`ESC`) không emit `'dialogue_completed'`. Nhánh hoàn tất thoại thông thường hoạt động bình thường.

---

## 6. Kiểm tra Build, Dữ liệu & Bằng chứng Lưu trữ

- **TypeScript (`npm run check`):** Exit code `0`.
- **Production Build (`npm run build`):** Exit code `0` (`dist/assets/index-D9lG_-yC.js`, `1,181.64 kB`).
- **Data Integrity (`npm run verify:data`):** `15/15` kiểm tra đạt (`PASS`).
- **Temp cleanup:** `scripts/temp/` trống (`0` tệp).
- **Evidence JSON:**
  - [hw_h4_07_baseline.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-07/hw_h4_07_baseline.json)
  - [hw_h4_07_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-07/hw_h4_07_after.json)
- **Visual Screenshots (`Visuals/HW-H4-07/`):**
  - [01_stage6_bridge_no_pillars.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/01_stage6_bridge_no_pillars.png)
  - [01a_mire_warden_spawn.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/01a_mire_warden_spawn.png)
  - [01b_mire_warden_combat.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/01b_mire_warden_combat.png)
  - [01d_mire_warden_defeated.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/01d_mire_warden_defeated.png)
  - [02a_deep_forest_spawn_check.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/02a_deep_forest_spawn_check.png)
  - [02b_hooded_knight_intro_dialogue.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/02b_hooded_knight_intro_dialogue.png)
  - [02a_after_deep_forest_natural_spawn.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/02a_after_deep_forest_natural_spawn.png)
  - [02b_after_hooded_knight_natural_intro.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/02b_after_hooded_knight_natural_intro.png)
  - [02c_after_hooded_knight_no_respawn.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/02c_after_hooded_knight_no_respawn.png)
  - [03_entities_listener_echo_apparition.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/03_entities_listener_echo_apparition.png)
  - [03b_after_echo_and_apparition.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-07/03b_after_echo_and_apparition.png)
