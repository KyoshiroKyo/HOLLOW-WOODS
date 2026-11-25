# HW-H4-00 — CURRENT BUG INVENTORY & SOURCE AUDIT

**Dự án:** HOLLOW WOODS (Kyoshiro Studio)
**Giao thức áp dụng:** HOLLOW WOODS — HYDRO HIGH ENGINEERING PROTOCOL V4
**Nhiệm vụ:** `HW-H4-00` — Kiểm kê lỗi tồn đọng & Audit mã nguồn thực tế (`MODE: READ-ONLY AUDIT`)
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`
**HEAD / Remote HEAD:** `0617668a97f462877cbe2c30d304323e8fd48f6e`
**Ngày kiểm toán:** 25/11/2026

> [!IMPORTANT]
> **Ghi chú về mã lỗi tạm (Provisional IDs):** Báo cáo này chỉ sử dụng các mã chính thức đang có trong [V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md) và các báo cáo QA/Audit trước (`BUG-023`, `BUG-024`, `BUG-033`, `HOTFIX-B2`, `BUG-HW-CS21-01`, `HW-CS21-04..06`, `TMP-01..02`). Các lỗi mới phát hiện trong source/runtime tại `HEAD 0617668` được gán nhãn tạm `H4-NEW-01` .. `H4-NEW-09` (chờ Owner phê duyệt cấp mã Registry chính thức nếu đưa vào sprint sửa lỗi).

---

## 1. Mục tiêu nhiệm vụ

Kiểm kê toàn diện toàn bộ lỗi còn tồn tại, hồi quy, nghi vấn hoặc chặn môi trường trên mã nguồn và bản build thực tế tại `HEAD 0617668a97f462877cbe2c30d304323e8fd48f6e` qua 12 nhóm hệ thống cốt lõi, không mặc định tin tưởng các báo cáo `PASS` cũ và không sửa đổi mã nguồn sản xuất (`READ-ONLY AUDIT`).

---

## 2. Git & Environment Safety Gate

- **Working directory:** `G:\HOLLOW WOODS`
- **Branch / Commit:** `feat/v1.5.3-ag-world-polish` tại `0617668a97f462877cbe2c30d304323e8fd48f6e` (khớp hoàn toàn `origin/feat/v1.5.3-ag-world-polish`).
- **Tài liệu quy tắc đã đối chiếu:** [AGENTS.md](file:///g:/HOLLOW%20WOODS/AGENTS.md), [Read/AGENTS.md](file:///g:/HOLLOW%20WOODS/Read/AGENTS.md), [Read/AI_IRON_RULES.md](file:///g:/HOLLOW%20WOODS/Read/AI_IRON_RULES.md), [docs/FOLDER_STRUCTURE_RULES.md](file:///g:/HOLLOW%20WOODS/docs/FOLDER_STRUCTURE_RULES.md). Không phát hiện mâu thuẫn quy tắc.
- **Bảo toàn hiện trạng cục bộ trước khi kiểm thử:**
  - `git diff --cached`: rỗng (zero staged changes).
  - `git diff --check`: `EXIT=0`.
  - Giữ nguyên toàn bộ file untracked/chưa commit của Owner (`scripts/AUDIO_SOURCES_MANIFEST.*`, `scripts/generate_audio_sources_manifest.mjs`) và các file báo cáo/ảnh QA đang mở trong `Read/V1.5/Reports/`.
  - Bảo toàn đầy đủ các tính năng đã nghiệm thu trên HEAD/working tree: **Classic Sanity 2.1**, **Farm Collider `(648, 741)`**, **Armed/Unarmed Idle `160ms/frame`**.
- **Environment note:** Playwright dùng system Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe` với `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`) vì thư mục `%LOCALAPPDATA%\ms-playwright` không cài `chrome-headless-shell`. Mọi script probe tạm trong `scripts/temp/` đã được xóa sạch sau khi chạy.

---

## 3. Phạm vi tài liệu & mã nguồn đã kiểm tra

- **Tài liệu & Báo cáo QA/Audit:** [V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md), `HW_CS21_QA_01`..`QA_06`, `HW_RP_01_MASTER_AUDIT.md`, `HW_RP_01_BUG_MATRIX.md`, `HW_RP_02_OUTER_WOODS_REGRESSION.md`, `HW_REL_01_V154_PRE_RELEASE_AUDIT.md`, `CLASSIC_SANITY_2_0.md`, `00_INDEX_V153_BATCH04_R10.md`, `HW_BUG_12/20/23/26A/26B`, `HW_MAP_27/28`, `HW_DEV_29`, `HW_QA_30`, `HW_FX_31/35`, `HW_STAB_32/34`, `HW_MAP_ASSET_33`.
- **Core / Config / Build:** [package.json](file:///g:/HOLLOW%20WOODS/package.json), [p2game.json](file:///g:/HOLLOW%20WOODS/p2game.json), [src/main.ts](file:///g:/HOLLOW%20WOODS/src/main.ts), [src/data/zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json), [scripts/build_p2game_release.mjs](file:///g:/HOLLOW%20WOODS/scripts/build_p2game_release.mjs), [scripts/build_standalone_release.mjs](file:///g:/HOLLOW%20WOODS/scripts/build_standalone_release.mjs), [scripts/generate_assets_manifest.mjs](file:///g:/HOLLOW%20WOODS/scripts/generate_assets_manifest.mjs).
- **Scenes & Entities:** [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts), [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts), [MainMenuScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts), [BootScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/BootScene.ts), [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts), [BlackKnightAnimations.ts](file:///g:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts), [EvilKnights.ts](file:///g:/HOLLOW%20WOODS/src/entities/EvilKnights.ts), [MireWardenBoss.ts](file:///g:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts), [BossMireWarden.ts](file:///g:/HOLLOW%20WOODS/src/entities/BossMireWarden.ts), [AmbushMonsters.ts](file:///g:/HOLLOW%20WOODS/src/entities/AmbushMonsters.ts), [ShadowMonsters.ts](file:///g:/HOLLOW%20WOODS/src/entities/ShadowMonsters.ts), [TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts), [NPCEntity.ts](file:///g:/HOLLOW%20WOODS/src/entities/NPCEntity.ts).
- **Systems, World & UI:** [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts), [BossEncounterSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts), [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts), [DialogueSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/DialogueSystem.ts), [VeilSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/VeilSystem.ts), [SurvivalSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/SurvivalSystem.ts), [QuestSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/QuestSystem.ts), [TimeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/TimeSystem.ts), [SaveManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts), [SettingsManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SettingsManager.ts), [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts), [WorldGatingSystem.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts), [ZoneConnectionRegistry.ts](file:///g:/HOLLOW%20WOODS/src/world/ZoneConnectionRegistry.ts), [AudioManager.ts](file:///g:/HOLLOW%20WOODS/src/audio/AudioManager.ts), [CraftingModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/CraftingModal.ts), [JournalModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/JournalModal.ts), [ParchmentWorldMapModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/ParchmentWorldMapModal.ts), [TornPageModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/TornPageModal.ts), [LeaderboardService.ts](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.ts).

---

## 4. Đối chiếu Commit sửa lỗi cũ với Source & Runtime hiện tại

| Hạng mục / Commit / Mã cũ | Nội dung gốc | Kết quả đối chiếu Source & Runtime tại HEAD `0617668` | Trạng thái |
| :--- | :--- | :--- | :--- |
| **`BUG-023`** (Tester Registry R10 / P0) | Màn hình nhấp nháy strobe & vẽ trùng vignette khi Tinh Thần thấp (`RedDangerFlash` 35ms + `UIScene` + `VeilSystem` + FOW flicker) | Đã tích hợp fix (`558f155`) và nâng cấp lên **Classic Sanity 2.1** (`a3a0df6`): hình học vignette đa tầng tại `UIScene`, `VeilSystem.distortionOverlay` giữ trong suốt khi bình thường/hoảng loạn, test thực tế tại `deep_forest` ban đêm (`composure: 13.44`) kích hoạt `isPanicVignetteActive: true` không lỗi/strobe. | `VERIFIED` |
| **`HW-BUG-23`** (Nhiệm vụ QA V1.5.4 Prep `0a647bc`) | Nhiệm vụ kiểm thử xác minh `HW-FIX-21` đã gỡ 5 prop dư ở Outer Woods (4 bụi rậm + 1 cây đổ gần Sir Vaelen) và 2 prompt ẩn nấp ma (**khác hoàn toàn với `BUG-023`**) | Đã đối chiếu hoàn tất trong báo cáo `HW_BUG_23` và hồi quy map; không phát sinh props ma tại Outer Woods. | `VERIFIED` |
| **Classic Sanity 2.1** | Hệ thống Hoảng Loạn / Sanity bản 2.1 của Owner | Hoạt động ổn định tại `Safe Zone` (`fog_crossing`/`bellhollow`/`sanctuary_farm`) và `deep_forest` ban đêm (`isPanicVignetteActive: true`, `0` lỗi console/page). | `VERIFIED` |
| **Farm Collider `(648, 741)`** | Loại bỏ collider đống củi chắn lối đi tại Farm `(648, 741)` (`WorldBuilder.ts:5230`) | Quét `colliderGroup.getChildren()` quanh `[590..700, 700..780]` xác nhận chỉ có `Kho Thóc` (`bottom: 730`) và `Hàng Rào Nông Trại` (`top: 779`). Nhân vật với `Noclip = false` đi ngang mượt từ `(620, 741)` qua `x = 675.7, y = 757.2`. | `VERIFIED` |
| **Idle `160ms/frame`** | Chuẩn hóa tốc độ khung hình Idle có/không vũ khí (`BlackKnightAnimations.ts`) | Runtime kiểm tra `wayfarer_idle_{down,up,left,right}` đều xác nhận `msPerFrame: 160, frames: 6, repeat: -1`. | `VERIFIED` |
| **`HW-CS21-06 / BUG-060`** (`tests/hw_bug_26b_walkrun_fix_verification.py`) | Điều tra lỗi `EXIT=1` từng ghi nhận ở test `26B` | Chạy lại trực tiếp trên HEAD cho `5/5 PASS (EXIT=0)`. Lỗi `EXIT=1` gián đoạn trước đây bắt nguồn từ race condition do `time.sleep(0.8)` cứng tại `hw_bug_26b_walkrun_fix_verification.py:171` dưới tải CPU/SwiftShader biến động. | `CONFIRMED OPEN` (Test-harness flakiness) |
| **Ambush Monsters Flash/Shake** | Guard `SettingsManager` cho MistBat & WanderingShade (`AmbushMonsters.ts:118-125, 235-242`) | Guard đã có đủ trong source và vẫn giữ nguyên trên HEAD. | `VERIFIED` |
| **Deep Forest Bounds (`y=-640..0`)** | Mở rộng camera & physics bounds cho Deep Forest và Sub-zones (`GameScene.ts:3990-4004`) | `applyCameraBoundsForZone` tự động mở `physics.world.setBounds` theo `Math.min(-250, zoneBounds.y)` và `Math.max(1150, zoneBounds.y + height)`. Test live xác nhận `deep_forest` có `worldBounds.y = -640` và `sub_bell_workshop` có `bottom = 1440`. | `VERIFIED` |

---

## 5. Bảng kiểm kê lỗi chuẩn hóa (Master Bug Inventory)

| Bug ID | Hiện tượng | Zone | Mức độ | Bằng chứng | Nguyên nhân nghi vấn | Trạng thái | Nhiệm vụ xử lý |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`H4-NEW-01`** *(tạm)* | Toàn bộ quái, động vật hoang dã & Boss `HoodedKnightBoss` trong `WildlifeSystem` spawn sai tọa độ sang vùng lõi Bellhollow / lề Tây thay vì đúng phân khu đích | `outer_woods`, `crooked_path`, `deep_forest`, `silent_mire`, `broken_bell_shrine`, `ancient_rune_puzzle`, `sub_root_cellar` | **P0** | [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L53-L172); Probe live trên `dist/`: tại `deep_forest` (`x:1600..2880, y:-640..0`), `7/7` động vật `(420..1260, 140..280)`, `hoodedKnight (1300,260)`, `skullWolves (651,290; 1181,240)`, `shadowCrows (880,200)`, `shadowEyes (740,285; 1120,315)`, `fallenKnights (1020..1410, 270..275)` đều ngoài `deep_forest`; `outer_woods` `9/9`, `silent_mire` `5/5`, `broken_bell_shrine` `4/4` ngoài vùng. | Các bảng `ZONE_HABITATS`, `SKULL_WOLF_HABITATS`, `SHADOW_*`, `FALLEN_KNIGHT_*`, `DREAD_HORSEMAN_*`, `HOODED_KNIGHT_*` khai báo tọa độ cục bộ `(260..1680, 130..330)` nhưng constructor/spawn gọi trực tiếp không cộng offset `zone.bounds.x` / `zone.bounds.y`. | `CONFIRMED OPEN` | `HW-H4-01` |
| **`H4-NEW-02`** *(tạm)* | `HoodedKnightBoss` hồi sinh vô hạn mỗi lần vào lại zone dù đã đánh bại; khi đóng thoại bằng `ESC` hoặc không mở thoại, boss kẹt hiển thị vĩnh viễn không fade out | `deep_forest`, `ancient_rune_puzzle` | **P0** | [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts#L493-L498); [EvilKnights.ts](file:///g:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L749-L756); Probe live: `takeDamage(99999)` bật `boss_hooded_knight_defeated = true`, gọi `cancelDialogue()` để lại boss `{visible: true, alpha: 1, active: true}`; `switchZone('crooked_path') -> switchZone('deep_forest')` spawn lại boss mới dù flag đã `true`. | (1) `switchZone`/`update` không kiểm tra `PlayerState.hasFlag('boss_hooded_knight_defeated')`. (2) Anim `hooded_knight_stagger` đăng ký `repeat: -1` nên `ANIMATION_COMPLETE` không bao giờ nổ, và `DialogueSystem.cancelDialogue()` ([DialogueSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/DialogueSystem.ts#L399-L424)) không phát event `'dialogue_completed'`. | `CONFIRMED OPEN` | `HW-H4-01` |
| **`H4-NEW-03`** *(tạm)* | Đánh bại Boss `Mire Warden` nhận trùng 2 lần vật phẩm nhiệm vụ `relic_heart_of_roots` | `broken_bell_shrine` | **P1** | [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L7294-L7303); [BossEncounterSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts#L190); Probe live: `relic_heart_of_roots` tăng từ `0` lên **`2`** sau `finishMireWardenDefeat()`. | `GameScene.finishMireWardenDefeat()` tự `addItem('relic_heart_of_roots', 1)` ở dòng 7294 rồi gọi `BossEncounterSystem.completeEncounter()` tại dòng 7303 vốn cũng `addItem('relic_heart_of_roots', 1)` ở dòng 190. | `CONFIRMED OPEN` | `HW-H4-02` |
| **`H4-NEW-04`** *(tạm)* | Phím `[C]` tự mở rồi tự đóng `CraftingModal` ngay lập tức (không mở được menu Chế tạo bằng `C`); phím `[I]` mở nhầm `CraftingModal` thay vì Túi đồ/Trang bị (`KeyB`) | Global / UI | **P1** | [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L769-L790); [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1909-L1975); [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L858-L859); Probe live `keyC_spy`: nhấn `KeyC` 1 lần ghi nhận `{ opens: 1, closes: 1, toggles: 1, finalCraftIsOpen: false }`, còn `KeyI` mở `craft: true`. | `UIScene` bắt `keydown-C` mở `CraftingModal` (`toggle()`), ngay frame kế `GameScene.update()` nhánh `isUIBusy` (`L1967-1970`) thấy `isCraftingRequested()` vẫn đang pending nên gọi thẳng `craftingModal.close()` bỏ qua debounce 250ms. Đồng thời `BlackKnightPlayer` gộp cả `KeyI`, `Tab`, `KeyC` vào `'craft'`. | `CONFIRMED OPEN` | `HW-H4-02` |
| **`H4-NEW-05`** *(tạm)* | Xung đột phím `[M]`: vừa gán cho Mute Audio trong `GameScene`/`BlackKnightPlayer`, vừa gán cho World Map trong `UIScene`/`JournalModal`; nhấn `M` không mở được World Map | Global / UI | **P1** | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L870-L871); [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1930-L1932); [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L812-L814); Probe live: `afterKeyM: { mapOpen: false }`, trong khi `afterKeyN: { mapOpen: true }` và `toggleWorldMap(): true`. | Thiết kế hotkey `[M]` bị gán trùng cho 2 tính năng đối nghịch (`Mute` vs `World Map`) giữa các lớp lắng nghe bàn phím. | `CONFIRMED OPEN` | `HW-H4-02` |
| **`H4-NEW-06`** *(tạm)* | Rò rỉ 5 bộ lắng nghe sự kiện `capture: true` trên `window` trong `AudioManager` không bao giờ được gỡ sau khi unlock âm thanh | Global / Audio | **P1** | [AudioManager.ts](file:///g:/HOLLOW%20WOODS/src/audio/AudioManager.ts#L575-L593); Probe live `audio_listener_audit`: `totalCaptureAdds: 11`, `totalCaptureRemoves: 0`, `mismatchedNonCaptureRemoves: 20`. | `addEventListener(ev, unlockHandler, { passive: true, capture: true })` (dòng 592) nhưng lúc dọn dẹp lại gọi `removeEventListener(ev, unlockHandler)` thiếu `{ capture: true }` (dòng 576). | `CONFIRMED OPEN` | `HW-H4-02` |
| **`BUG-HW-CS21-01`** | Hồi kết `triggerTheFirstTollFinale()` gọi trực tiếp `cameras.main.shake` & `flash` cả ở `GameScene` lẫn `UIScene`, phớt lờ cấu hình tắt Flash / Shake / Reduced Motion | Ending Cutscene | **P2** | [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L291-L295); Probe live với `screenShakeEnabled: false, screenFlashEnabled: false, reducedMotionEnabled: true`: vẫn ghi nhận `gsFlash: 1, gsShake: 1, uiFlash: 1`. | `EndingSystem.ts` gọi thẳng `cam.shake(1200, 0.02)`, `cam.flash(...)` và `uiScene.cameras.main.flash(...)` thay vì đi qua `CameraSystem` hoặc kiểm tra `SettingsManager`. | `CONFIRMED OPEN` | `HW-H4-03` |
| **`H4-NEW-07`** *(tạm)* | Tệp nén `mossbound_wayfarer.rar` (185.5 KB) còn nằm trong `public/assets/characters/` nên lọt vào `dist/` và gói P2Game; đồng thời lệch số phiên bản (`1.5.2` / `1.5.1` / `1.4.0` / `3.0.0`) giữa các file cấu hình | Packaging / Metadata | **P1/P2** | Tệp vật lý `public/assets/characters/mossbound_wayfarer.rar` tồn tại (`185,541 bytes`), [build_p2game_release.mjs](file:///g:/HOLLOW%20WOODS/scripts/build_p2game_release.mjs#L97) chỉ lọc `.bak`/`.tmp`; `test_v153_dev_score_safety.mjs` in `version: '1.4.0'` từ [LeaderboardService.ts](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.ts#L140); [SaveManager.ts](file:///g:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L508) ghi `1.5.1`; `p2game.json`/`package.json` ghi `1.5.2`. | Chưa xóa archive thừa trong `public/assets/` (chờ xác nhận Owner trước khi xóa asset), và chưa đồng bộ hằng số phiên bản dùng chung. | `CONFIRMED OPEN` | `HW-H4-03` |
| **`H4-NEW-08`** *(tạm)* | `MireWardenBoss.triggerSonicRoar()` tạo `Graphics` + `time.addEvent(25)` + `delayedCall` không kiểm tra `!this.active || !this.scene` và không hủy timer khi boss `destroy()` | `broken_bell_shrine` | **P2** | [MireWardenBoss.ts](file:///g:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts#L405-L433). | Callback timer tiếp tục vẽ lên `shockGfx` hoặc truy cập `scene` nếu boss chết/chuyển cảnh đúng giữa nhịp roar 900ms. | `SUSPECTED` | `HW-H4-03` |
| **`H4-NEW-09`** *(tạm)* | `TheEcho` vẽ overlay flash toàn màn hình (`0x2c3e50`, alpha `0.22`) khi nhìn thẳng lúc tắt đèn không kiểm tra `SettingsManager.isScreenFlashEnabled()` | Frontier / Dark Zones | **P2** | [TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts#L109-L121). | Overlay tự tạo `rectangle` alpha `0.22` bỏ qua cài đặt accessibility `Screen Flash` / `Reduced Motion`. | `SUSPECTED` | `HW-H4-03` |
| **`HW-CS21-06` (`BUG-060`)** | Script `tests/hw_bug_26b_walkrun_fix_verification.py` dùng `time.sleep(0.8)` cứng gây flaky fail gián đoạn khi CPU/SwiftShader chậm | QA Test Harness | **P2** | [hw_bug_26b_walkrun_fix_verification.py](file:///g:/HOLLOW%20WOODS/tests/hw_bug_26b_walkrun_fix_verification.py#L171); Chạy lại trên HEAD đạt `5/5 PASS (EXIT=0)` nhưng cơ chế wait cứng dễ race dưới tải cao. | Đợi thời gian tường (`time.sleep`) thay vì poll điều kiện state thực tế (`wait_for_function`). | `CONFIRMED OPEN` | `HW-H4-03` |
| **`TMP-01` & `TMP-02` & `verify_pre_release_audit`** | Các script audit/smoke test cũ chưa cập nhật theo cấu trúc V1.5.4: `audit_map_reachability_and_assets.mjs` báo `72/73 EXIT=1`, `verify_pre_release_audit.mjs` báo `46/49 EXIT=1`, `test_browser_click_new_game.mjs` tìm texture cũ `wayfarer_*` | QA Scripts | **P2** | Chạy thực tế trên HEAD: `audit_map_reachability_and_assets.mjs` fail ở regex `setOffset` âm hợp lệ ([NPCEntity.ts](file:///g:/HOLLOW%20WOODS/src/entities/NPCEntity.ts#L180)); `verify_pre_release_audit.mjs` tìm `p2.ready()` ở `BootScene.ts` (đã dời sang [MainMenuScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L143)) và check cứng version `1.4.0`. | Script kiểm thử giữ nguyên giả định V1.4.0 hoặc regex quá chặt sau các đợt tái cấu trúc V1.5.x. | `CONFIRMED OPEN` | `HW-H4-03` |
| **`HW-CS21-04` (`BUG-043`/`058`)** | Scale Pop Frame-0 khi chuyển Idle/Walk ↔ Run (về `1.5 -> 1.2 -> 1.5`) và tách scale `0.68 / 0.78` khi Unarmed Run | Global / Player | **P2** | [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L269-L279); Probe live `idle_160ms_and_scale_pop`: Idle `scale: 1.5 (64×64)` -> Run `scale: 1.2 (84×72)` -> Stop `scale: 1.5 (64×64)`. | Đồng bộ kích thước render giữa nhiều spritesheet (`64×64` vs `84×72`). | `DEFERRED` *(Codex 27/11/2026)* | Bảo toàn / Chuyển Codex |
| **`HW-CS21-05` (`BUG-044`/`059`)** | Chênh lệch mật độ điểm ảnh HD giữa Idle/Walk (`30px @ 1.5x`) và Run (`41px @ 1.2x`) | Global / Player | **P2** | Probe live frame dimensions (`64×64` vs `84×72`) và báo cáo `HW_CS21_QA_04/05`. | Khác biệt kích thước asset nguồn giữa các gói spritesheet. | `DEFERRED` *(Codex 27/11/2026)* | Bảo toàn / Chuyển Codex |
| **`BUG-033`** | Giao diện & UX `ParchmentWorldMapModal` (đặc biệt điều hướng nút tắt & hiển thị phân khu phụ / expansion zones) | World Map UI | **P2** | [ParchmentWorldMapModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/ParchmentWorldMapModal.ts#L53-L599); mở ổn định qua `[N]` (`mapOpen: true`), bản đồ vẽ 10 node chính, 2 subzone map gộp và 5 expansion zones chưa hiện thành node riêng. | Cần Owner playtest thực nghiệm để chốt nghiệm thu cuối hoặc mở rộng node cho 5 expansion zones. | `BLOCKED` *(Chờ Owner playtest)* / `SUSPECTED` (bổ sung node) | Đợi Owner duyệt |
| **`HOTFIX-B2`** | Khắc phục hoàn toàn nuốt phím / kẹt phím `Arrow/WASD/Shift` với bộ gõ EVKey/UniKey mức OS Windows (`WH_KEYBOARD_LL`) | Global / Input | **P0/Env** | Playwright IME packet & `hw_bug_26b_walkrun_fix_verification.py` pass `5/5`. Chưa xác nhận hook vật lý Windows ngoài sandbox tự động. | Giới hạn môi trường headless/sandbox không cài và giả lập hook mức kernel của EVKey Windows. | `BLOCKED` | Owner test tay |
| **`BUG-024`** | Tương thích HTTP 206 Partial Content / Range request âm thanh trên CDN P2Game hosted | Audio / Hosted | **P1/Env** | Production local `dist/` (`node scripts/verify_zero_404_assets.mjs` `212/212`, `0` HTTP `>=400`) đạt `0` lỗi; CDN hosted ngoài khả năng truy cập trực tiếp. | Phụ thuộc hạ tầng CDN server P2Game khi deploy staging/live. | `BLOCKED` | Owner test staging |

---

## 6. Phân tích chi tiết theo 12 nhóm hệ thống bắt buộc

1. **Camera và Chuyển vùng:**
   - `applyCameraBoundsForZone` ([GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L3990-L4013)) cập nhật động `cameraSystem.setWorldBounds` và `physics.world.setBounds(0, Math.min(-250, zoneBounds.y), 5000, bottom - top)`. Kiểm thử live xác nhận `deep_forest` (`y=-640`) và `sub_bell_workshop` (`bottom=1440`) đều mở rộng physics bounds chính xác.
   - `handleZoneLogic()` ([GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L4352-L4455)) xử lý chuyển vùng liền mạch (`isSeamlessAdjacentTransition`) và đồng bộ `applyCameraBoundsForZone`, `wildlifeSystem.switchZone`, `SaveManager.saveGame`.
   - `src/data/zones.json` có đủ **17 zone**, tất cả `transitions` trỏ tới `toZone` hợp lệ (`0` dead link), kể cả 5 expansion zones (`abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`). Lưu ý phụ: nếu đi trực tiếp vào đường nhánh `executeTransition` 2A (`GameScene.ts:4191-4232`) mà không qua `handleZoneLogic()` delta check, nhánh 2A không tự gọi `wildlifeSystem.switchZone` — hiện vẫn được `handleZoneLogic` bọc ở dòng `4426`.
2. **Collider, Vật cản vô hình, Xuyên địa hình:**
   - Farm `(648, 741)` xác nhận **sạch sẽ**: `colliderGroup.getChildren()` quanh `[590..700, 700..780]` không có collider nào trên hành lang `y = 731..778`, `WorldBuilder.ts:5230` tắt collider đống củi (`false`), nhân vật chạy `Noclip = false` đi qua `(620 -> 675.7)` trơn tru sau khi hoàn tất auto-sheathe.
   - BFS map reachability ([audit_map_reachability_and_assets.mjs](file:///g:/HOLLOW%20WOODS/scripts/audit_map_reachability_and_assets.mjs)) đi thông `37,141` tile và mọi POI đều thông thoáng.
3. **Idle, Walk, Run, Roll và Combat Animation:**
   - `ARMED_IDLE_FRAME_MS = 160` và `unarmed_idle.frameMs = 160` ([BlackKnightAnimations.ts](file:///g:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts)); runtime đo `wayfarer_idle_{down,up,left,right}` đạt `msPerFrame: 160` (`6 frames`).
   - `hw_bug_26b_walkrun_fix_verification.py` pass `5/5`, `hw_bug_21b_walk_run_verification.py` pass `10/10`.
   - Vấn đề tồn đọng đã `DEFERRED` sang Codex (27/11/2026): `HW-CS21-04` (Scale Pop Frame-0 `1.5 -> 1.2 -> 1.5`) và `HW-CS21-05` (mật độ pixel HD giữa `64×64 @ 1.5x` và `84×72 @ 1.2x`).
   - Lưu ý khi test chuyển nhanh sang Safe Zone: khi player đang rút kiếm từ `fog_crossing` mà bước/teleport vào `sanctuary_farm`/`bellhollow`, `checkZoneWeaponAutoState()` ([BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L1984-L1994)) kích hoạt `wayfarer_weapon_off_*` khóa di chuyển `400ms` game-time (bình thường, nhưng dưới CPU/headless FPS thấp có thể kéo dài >1s wall-clock).
4. **Classic Sanity 2.1 và BUG-023:**
   - Đã phân biệt rạch ròi **`BUG-023`** (R10 strobe/double vignette — ĐÃ SỬA) vs **`HW-BUG-23`** (audit 5 props Outer Woods — ĐÃ XÁC MINH).
   - Lưu ý kiến trúc quan trọng: HUD & `UIScene.updatePanicVignette` đọc **`stats.composure`** (Bình Tâm), trong khi `PlayerStats` vẫn có trường `stats.sanity`. Khi đặt `playerState.stats.composure = 15` (giảm tự nhiên xuống `13.44`) tại `deep_forest` ban đêm (`timeOfDay = 280`), `isPanicVignetteActive` bật `true`, vẽ hình học vignette Classic Sanity 2.1 sạch sẽ (`0` flash/strobe, `0` console error).
5. **Vòng Sáng Hộ Tâm (`Lantern [F]`):**
   - Kiểm thử live: nhấn `[F]` bật đèn tiêu tốn đúng `10` Thể Lực (`100 -> 89.93`), giữ bật duy trì cơ chế hao hụt nhẹ (`1.2/s`) và tự tắt khi Thể Lực `< 5` (`stamina = 2.0 -> 2.48 => isLanternOn = false`). Đạt.
6. **NPC và Tương tác:**
   - `DialogueSystem` hoạt động ổn định trong kiểm thử thông thường, ngoại trừ khuyết tật ở `cancelDialogue()` ([DialogueSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/DialogueSystem.ts#L399-L424)): nhấn `ESC` hủy hội thoại chỉ dọn state nội bộ mà không phát `'dialogue_completed'`, trực tiếp gây ra lỗi `H4-NEW-02` khi đối thoại hậu chiến boss kết thúc bằng `ESC`.
7. **Inventory, Crafting và World Map:**
   - **`H4-NEW-04` (P1):** Phím **`[C]`** bị gãy trên build thực tế do mở ở `UIScene` và bị `GameScene.update()` đóng lại ngay trong 1 nhịp (`{ opens: 1, closes: 1, finalCraftIsOpen: false }`); phím **`[I]`** mở nhầm `CraftingModal` thay vì Túi đồ/Trang bị (`KeyB -> equipmentModal`).
   - **`H4-NEW-05` (P1):** Phím **`[M]`** xung đột giữa `Mute` (`GameScene`) và `World Map` (`UIScene`), nhấn `KeyM` để lại `mapOpen: false` trong khi phím **`[N]`** mở World Map bình thường (`mapOpen: true`).
   - **`BUG-033`:** `ParchmentWorldMapModal` chỉ vẽ 10 node gốc/frontier/forbidden, chưa hiển thị 5 expansion zones thành node độc lập trên bản đồ.
8. **Mire Warden, Hooded Knight và các Thực thể (`WildlifeSystem`):**
   - **`H4-NEW-01` (P0):** Lỗi nghiêm trọng nhất toàn hệ thống — toàn bộ habitat trong `WildlifeSystem.ts` dùng tọa độ địa phương `260..1680` thay vì tọa độ thế giới theo `zone.bounds`, làm quái rừng, sói, quạ, Fallen Knight, Shadow Behemoth và `HoodedKnightBoss` spawn lọt hết về vùng Bellhollow!
   - **`H4-NEW-02` (P0):** `HoodedKnightBoss` không kiểm tra flag `boss_hooded_knight_defeated` nên hồi sinh lại mãi, cộng thêm anim stagger `repeat: -1` & `cancelDialogue` không emit event làm boss bị kẹt xác hiển thị sau khi chết. (Ngoài ra log runtime cũng cho thấy `hooded_knight_walk` chưa được tạo anim riêng, dùng tạm `hooded_knight_idle` ở `EvilKnights.ts:866`).
   - **`H4-NEW-03` (P1):** Đánh bại `MireWardenBoss` cấp đúp `relic_heart_of_roots` x2.
   - **`H4-NEW-08` (P2 - `SUSPECTED`):** `MireWardenBoss.triggerSonicRoar()` chưa guard `!this.active || !this.scene` trong các callback timer.
   - **`H4-NEW-09` (P2 - `SUSPECTED`):** `TheEcho` phủ flash alpha `0.22` bỏ qua cài đặt tắt flash.
9. **Quest Progression:**
   - `tests/verify_content_registry.mjs` pass `92 entries, 0 duplicates, 7/7 lookup`. `QuestSystem.ts` & các mốc Q04/Q05 tại `GameScene.ts:4372-4395` nhất quán. Chỉ bị ảnh hưởng gián tiếp bởi `H4-NEW-03` (nhận x2 relic boss Mire Warden) và `H4-NEW-01/02` (quái & Hooded Knight spawn sai zone/hồi sinh).
10. **Audio, Hiệu năng, Bộ nhớ:**
    - **`H4-NEW-06` (P1):** `AudioManager.ts:575-593` rò rỉ `capture: true` listeners trên `window` (`11` adds capture, `0` removes capture, `20` removes sai flag).
    - `EndingSystem` (`BUG-HW-CS21-01` - P2) bỏ qua tùy chọn Reduced Motion / Screen Flash / Screen Shake ở `triggerTheFirstTollFinale()`.
    - Build bundle `dist/assets/index-*.js` (`1,177.97 kB`), runtime không xuất hiện lỗi 404 (`212/212` valid), không lỗi console/JS.
11. **Save/Load và Continue:**
    - `scripts/test_v153_save_schema3.mjs` pass `EXIT=0`.
    - Kiểm thử E2E live: lưu checkpoint tại `sanctuary_farm (700, 741)` với `wood: 3` -> reload trang -> gọi `MainMenuScene.continueGame()` -> phục hồi chuẩn xác `zone: sanctuary_farm, x: 700, y: 741, woodCount: 3, isContinueMode: true`. Đạt.
12. **P2Game, Release Packaging & Test Scripts:**
    - `npm run verify:data` (`15/15 PASS`), `test_v15_48_iframe_focus_and_hud_layout` (`28/28 PASS`), `test_v153_dev_score_safety` (`PASS`, nhưng ghi nhận `LeaderboardService.ts:140` mang version cũ `1.4.0`).
    - **`H4-NEW-07`:** File `public/assets/characters/mossbound_wayfarer.rar` còn nằm trong thư mục public asset và script đóng gói `build_p2game_release.mjs:97` không lọc `.rar`; version metadata bị phân mảnh (`1.5.2` / `1.5.1` / `1.4.0` / `3.0.0`).
    - **`TMP-01`, `TMP-02`, `verify_pre_release_audit`, `HW-CS21-06`:** 4 nhóm script QA có assertions lỗi thời hoặc `time.sleep` cứng.

---

## 7. Phân tích nguyên nhân gốc rễ các lỗi mở chính

1. **Nhóm Spawn & Boss (`H4-NEW-01`, `H4-NEW-02`, `H4-NEW-03`):**
   - Bản đồ thế giới chuyển từ mô hình vùng rời sang không gian thế giới liên hoàn (`crooked_path` x=1600, `deep_forest` y=-640, `silent_mire` x=2880, `broken_bell_shrine` x=4000), nhưng bảng tọa độ `WildlifeSystem` vẫn giữ giá trị cục bộ `260..1680` và truyền thẳng vào `new Entity(scene, x, y)`.
   - Tác giả ghép 2 hệ thống quản lý Boss/Cốt truyện (`EvilKnights`/`WildlifeSystem` và `BossEncounterSystem` + `GameScene.finishMireWardenDefeat`) thiếu điểm đồng bộ cờ hoàn thành và phân công cấp phần thưởng duy nhất.
2. **Nhóm Input & UI Modal (`H4-NEW-04`, `H4-NEW-05`):**
   - Khối lắng nghe bàn phím bị chia thành 3 tầng độc lập: DOM `capture` trên `window` trong `BlackKnightPlayer`, `UIScene.input.keyboard`, và listener riêng bên trong `CraftingModal` / `JournalModal`. Khi phím bấm đi qua cả `UIScene` lẫn `GameScene.update()`, `GameScene` không kiểm tra xem modal có vừa được `UIScene` mở trong cùng tick hay chưa và gọi thẳng `close()`. Tương tự, `KeyM` bị chia sẻ trái ngược giữa Mute và Map.
3. **Nhóm Audio & Ending (`H4-NEW-06`, `BUG-HW-CS21-01`):**
   - Sai sót chuẩn DOM `removeEventListener` (thiếu `{ capture: true }`) và lời gọi `cam.flash`/`cam.shake` trực tiếp tại `EndingSystem` trước thời điểm thiết kế `CameraSystem` + `SettingsManager`.

---

## 8. Kế hoạch & Thứ tự ưu tiên sửa lỗi (đề xuất cho bước sau)

### Đợt 1 — P0 Critical Gameplay & Boss Progress (`HW-H4-01`)
1. Sửa **`H4-NEW-01`**: Quy đổi toàn bộ tọa độ spawn của `WildlifeSystem` sang tọa độ thế giới theo `zone.bounds` (xác minh bằng bounding box của toàn bộ 17 zone trong `zones.json`, không để thực thể lọt sang Bellhollow).
2. Sửa **`H4-NEW-02`**: Kiểm tra `PlayerState.hasFlag('boss_hooded_knight_defeated')` trước khi spawn `HoodedKnightBoss`; sửa `hooded_knight_stagger` (`repeat: 0`) hoặc timeout fallback + phát `'dialogue_completed'` (hoặc hook `onClose`/`cancel`) khi hủy hội thoại bằng `ESC` để boss fade out chắc chắn.

### Đợt 2 — P1 Logic, Input & Memory (`HW-H4-02`)
3. Sửa **`H4-NEW-03`**: Gỡ cấp trùng `relic_heart_of_roots` giữa `GameScene.finishMireWardenDefeat()` và `BossEncounterSystem.completeEncounter()` (giữ đúng 1 nguồn cấp duy nhất).
4. Sửa **`H4-NEW-04` & `H4-NEW-05`**: Gỡ xung đột double-toggle phím `[C]`, tách bạch phím mở Túi đồ/Trang bị vs Chế tạo (`[I]`/`[B]` vs `[C]`), giải quyết xung đột `[M]` (Mute vs World Map `[N]`/`[M]`), tránh listener trùng 3 tầng.
5. Sửa **`H4-NEW-06`**: Truyền `{ capture: true }` (hoặc dùng `AbortController`) khi `window.removeEventListener` trong `AudioManager.ts:576`.

### Đợt 3 — P2 Polish, Packaging, Accessibility & Test Harness (`HW-H4-03`)
6. Sửa **`BUG-HW-CS21-01`** & **`H4-NEW-08`/`H4-NEW-09`**: Đưa hiệu ứng Ending `EndingSystem.ts:291-295` và `TheEcho` qua guard `SettingsManager`/`CameraSystem`; guard timer trong `MireWardenBoss.triggerSonicRoar()`.
7. Sửa **`H4-NEW-07`**: Xin Owner duyệt xóa `public/assets/characters/mossbound_wayfarer.rar`, bổ sung filter `.rar` trong `build_p2game_release.mjs`, chuẩn hóa 1 phiên bản thống nhất giữa `package.json`, `p2game.json`, `SaveManager`, `LeaderboardService`, `ContentPackValidator`.
8. Sửa **`HW-CS21-06`, `TMP-01`, `TMP-02`, `verify_pre_release_audit`**: Thay `time.sleep(0.8)` ở `26B` bằng `wait_for_function`, cập nhật assertions của `verify_pre_release_audit`, `audit_map_reachability_and_assets`, `test_browser_click_new_game` theo kiến trúc hiện hành.

---

## 9. Lệnh & Kết quả kiểm thử đã chạy trên HEAD `0617668`

| Lệnh đã thực thi | Exit Code | Kết quả thực tế quan sát |
| :--- | :---: | :--- |
| `npm run check` (`tsc --noEmit`) | `0` | `0` lỗi TypeScript |
| `npm run build` (`tsc && vite build`) | `0` | Build hoàn tất `dist/` (100 modules, `16.27s`) |
| `npm run verify:data` | `0` | `15/15 PASS` |
| `node scripts/verify_zero_404_assets.mjs` | `0` | `212/212` assets hợp lệ, `0` missing |
| `node tests/verify_content_registry.mjs` | `0` | `92` entries, `0` duplicates, `7/7` lookup PASS |
| `node scripts/test_v153_save_schema3.mjs` | `0` | `PASS` |
| `node scripts/test_v153_dev_score_safety.mjs` | `0` | `PASS` (log `version: '1.4.0'`) |
| `node scripts/test_v15_48_iframe_focus_and_hud_layout.mjs` | `0` | `28/28 PASS` |
| `node scripts/audit_map_reachability_and_assets.mjs` | `1` | `72/73 PASS`; fail ở regex `setOffset` âm (`NPCEntity.ts:180`), BFS `37,141` tile thông thoáng |
| `node scripts/verify_pre_release_audit.mjs` | `1` | `46/49 PASS`; assertions lỗi thời về `BootScene.ts` & version `1.4.0` |
| `python tests/hw_bug_26b_walkrun_fix_verification.py` | `0` | `5/5 PASS` (tái chạy trên HEAD; vẫn còn `time.sleep(0.8)` ở dòng 171) |
| `python tests/hw_bug_21b_walk_run_verification.py` | `0` | `10/10 PASS` |
| Playwright Probe Live trên `dist/` (`0617668`) | `0` | Đã xác minh trực tiếp `H4-NEW-01`..`06`, `BUG-HW-CS21-01`, Classic Sanity 2.1, Farm `(648, 741)`, Idle `160ms`, Lantern `[F]`, Save/Continue Schema 3 (`0` console/page/HTTP errors). |

---

## 10. Rủi ro còn lại & Phạm vi bị giới hạn (`BLOCKED` / `DEFERRED`)

- **`DEFERRED` sang AG Codex (27/11/2026) theo Protocol V4:** `HW-CS21-04` (Frame-0 Scale Pop & Unarmed Run `0.68 / 0.78`) và `HW-CS21-05` (HD pixel density mismatch). Không tự ý chỉnh sửa khi chưa có lệnh từ Owner.
- **`BLOCKED` cần Owner kiểm tra thực tế ngoài sandbox:**
  - `HOTFIX-B2`: Bộ gõ tiếng Việt EVKey/UniKey mức `WH_KEYBOARD_LL` trên máy Windows vật lý.
  - `BUG-024`: Phát audio HTTP 206 Range trên hạ tầng CDN P2Game hosted.
  - `BUG-033`: Nghiệm thu trực quan `ParchmentWorldMapModal` & quyết định hiển thị 5 expansion zones trên World Map.

---

## 11. Xác nhận tuân thủ Read-Only & Vệ sinh Repository

- Không có bất kỳ chỉnh sửa nào trong `src/`, `public/`, `tests/` hoặc lịch sử Git (`commit`, `push`, `reset`, `stash`, `restore`).
- Toàn bộ file probe tạm trong `scripts/temp/` đã được dọn sạch; các file báo cáo/ảnh QA cũ và 3 file audio manifest của Owner trong working tree được giữ nguyên vẹn 100%.

---

## 12. Đề xuất bước tiếp theo cho Owner (**HARD STOP**)

Kiểm kê `HW-H4-00` hoàn tất. Tổng hợp hiện trạng trên `HEAD 0617668`: **2 lỗi P0** (`H4-NEW-01`, `H4-NEW-02`), **4 lỗi P1** (`H4-NEW-03`..`06`), **1 lỗi P1/P2** (`H4-NEW-07`), **3 mục P2 xác nhận mở** (`BUG-HW-CS21-01` và 2 nhóm test script/harness `HW-CS21-06`, `TMP-01`/`TMP-02`/`verify_pre_release_audit`), **2 mục P2 nghi vấn (`SUSPECTED`)** (`H4-NEW-08`, `H4-NEW-09`), ngoài **2 mục `DEFERRED`** sang Codex (`HW-CS21-04`, `HW-CS21-05`) và **3 mục `BLOCKED`** cần Owner kiểm tra thực tế (`HOTFIX-B2`, `BUG-024`, `BUG-033`). Đề nghị Owner phê duyệt triển khai theo thứ tự **`HW-H4-01` (P0)** -> **`HW-H4-02` (P1)** -> **`HW-H4-03` (P2)**. Chờ chỉ thị của Owner trước khi chỉnh sửa bất kỳ dòng mã nào.
