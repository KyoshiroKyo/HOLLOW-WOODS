# HOLLOW WOODS — DEVELOPMENT EXECUTION QUEUE (`SEVEN TRACKS A → G`)

- **Mission:** `HW-NARRATIVE-00H — MASTER KNOWLEDGE CHECKPOINT & EXECUTION ROADMAP`
- **Nguyên tắc điều phối:** Mỗi tác vụ là một bước nhỏ đơn mục tiêu (`one goal, clean boundary, strict stop`), phân định rõ vai trò **AG (`AG 4 Hydro High`: bản đồ, collider, môi trường, tổ chức asset, tối ưu hiệu năng, tích hợp UI/dữ liệu tĩnh)** và **Codex (`BUG-058`, `BUG-059`, `Black Knight V2`, sửa runtime state/AI phức tạp)** sau khi Owner cấp lệnh & mở khóa câu hỏi `OQ-*` tương ứng.

---

## A. TRACK A — WORLD RECONSTRUCTION (`AG 4 Hydro High`)

### `TASK-A01` (`HW-WORLD-20B` Pilot: `outer_woods` & `fog_crossing`)
- **Mục tiêu duy nhất:** Sửa dứt điểm lỗi va chạm P0 (`W20-BUG-001`, `003`, `006`, Triple Stack trạm lửa) và áp dụng kiến trúc `Resurrected RPG 1.1` (`Tree_Trunks` / `Tree_Canopies` từ `LAB-01`) cho `outer_woods` & `fog_crossing`.
- **Agent phụ trách:** **AG**
- **Dependencies:** `HW-WORLD-20A` (`DONE`), `HW-MAP-LAB-01` (`DONE`), lệnh mở triển khai từ Owner. *(Không bị chặn bởi `OQ-01–20`).*
- **Phạm vi file:** `src/data/zones.json` (`fog_crossing`, `outer_woods`), `src/data/maps/fog_crossing.json`, `outer_woods.json`, `src/world/WorldBuilder.ts` (đúng cụm tile/canopy), `public/assets/environment/` (Resurrected RPG nếu nạp thêm).
- **Hệ thống được bảo vệ:** Sir Vaelen `(1435..1470, 710)`, `CampSanctuarySystem`, Act 0 (`x>=175`, `x>=280`), Save Schema `3`.
- **Tiêu chí nghiệm thu:** Hết `0` Triple Stack & `0` tường vô hình, lối mòn rộng `72–96 px`, draw calls vùng rừng `<= 80`, FPS `>= 59.5` VSync.
- **Test cần chạy:** `npm run check`, `npm run verify:data`, walkthrough `W03` & `W04`, benchmark FPS `LAB-01` baseline.
- **Điểm dừng:** Chụp ảnh before/after cùng tọa độ, báo cáo và **HARD STOP** chờ Owner nghiệm thu trước `TASK-A02`.

### `TASK-A02` (`HW-WORLD-20B/C`: `bellhollow`, `sanctuary_farm`, `crooked_path`)
- **Mục tiêu duy nhất:** Khơi thông nút thắt trục chính Tây–Đông `bellhollow` (`W20-BUG-002`), tách `3` interactables nông trại (`W20-BUG-005`), sửa tường vô hình biên Nam `crooked_path` (`W20-BUG-007`) và đồng bộ `Serene Village` / `Resurrected RPG`.
- **Agent phụ trách:** **AG**
- **Dependencies:** `TASK-A01` PASS.
- **Phạm vi file:** `src/data/zones.json`, `maps/bellhollow.json`, `sanctuary_farm.json`, `crooked_path.json`, `src/world/WorldBuilder.ts`.
- **Hệ thống được bảo vệ:** 5 NPC Bellhollow, Cổng Đông Garth, giếng/bệ rèn/nồi nấu, Safe Zone Sanctuary, Vòng Sáng `[F]`.
- **Tiêu chí nghiệm thu:** `W01_bellhollow_main_road_east` PASS, hết spike `30.12 FPS` (`1% Low >= 58 FPS`), draw calls làng `<= 120`.
- **Test cần chạy:** `npm run check`, `W01`, script test va chạm nông trại, đo FPS.
- **Điểm dừng:** Báo cáo ảnh & thông số FPS mới, **HARD STOP**.

### `TASK-A03` (`HW-WORLD-20C/D`: Cụm Rừng Sâu, Thánh Địa & Đầm Lầy `deep_forest` → `broken_bell_shrine`)
- **Mục tiêu duy nhất:** Vá dứt điểm `MAP-BUG-001`, `MAP-BUG-002`, `MAP-BUG-003`, `HW-H4-03-AUDIT` (`W02`), `W20-BUG-008/009`, thay 100% vector `Phaser.Graphics` bằng tile thật cho `deep_forest`, `sub_whispering_clearing`, `whispering_grove_sanctum`, `silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`.
- **Agent phụ trách:** **AG**
- **Dependencies:** `TASK-A02` PASS.
- **Phạm vi file:** `src/data/zones.json`, các JSON map 6 zone liên quan, `src/world/WorldBuilder.ts`, `src/scenes/GameScene.ts` (`physics.world.bounds`).
- **Hệ thống được bảo vệ:** `BossMireWarden` & 3 trụ phase, `3` trụ đầm lầy, Phong Ấn Rễ Cổ, `TheListener`.
- **Tiêu chí nghiệm thu:** `W02_deep_forest_to_abyssal_chasm` & `W05_silent_mire_to_drowned_depths` PASS; spawn `sanctum` cách tường `>= 48px`; `0` OOB triggers.
- **Test cần chạy:** `npm run check`, `verify:data`, `W02`, `W05`, `test_v15_60_quest_chain_restructuring.mjs`.
- **Điểm dừng:** **HARD STOP** sau báo cáo kiểm chứng 6 zone.

### `TASK-A04` (`HW-WORLD-20E/F`: `sub_*` + `5` Expansion Zones + `World Map [M]` & `ZCR` Sync)
- **Mục tiêu duy nhất:** Hoàn thiện `5` phân khu mở rộng (`abyssal_chasm`, `drowned_mire_depths`, `sunken_crypt_ruins`, `veil_origin_cavern`, `whispering_grove_sanctum` polish), dọn `sub_root_cellar` (`W20-BUG-010`) & `sub_bell_workshop`, và nâng `ZoneConnectionRegistry` + `ParchmentWorldMapModal` từ `10 → 17` zones.
- **Agent phụ trách:** **AG** *(cần Owner xác nhận `OQ-15`/`OQ-HW-BOSS` trước khi đặt cổng/arena cho `veil_origin_cavern` & `sunken_crypt_ruins`)*.
- **Dependencies:** `TASK-A03` PASS + `OQ-15` (cho khu vực boss).
- **Phạm vi file:** `src/world/ZoneConnectionRegistry.ts`, `src/ui/ParchmentWorldMapModal.ts`, `src/data/zones.json`, map JSON các zone mở rộng.
- **Hệ thống được bảo vệ:** `WorldGatingSystem`, `Classic Sanity 2.1`, Main Route `7` stages.
- **Tiêu chí nghiệm thu:** `17/17` zones đi thông 2 chiều hợp lệ trên World Map `[M]`, `0` lỗi OOB/overlapping bounds, `~60 FPS`.
- **Test cần chạy:** `npm run check`, `verify_zero_404_assets.mjs`, 17-zone walkthrough matrix.
- **Điểm dừng:** **HARD STOP** chờ nghiệm thu World Reconstruction 2.0.

---

## B. TRACK B — CHARACTER RECONSTRUCTION (`Codex` + `AG`)

### `TASK-B01` (Fix `BUG-058` Scale Pop & `BUG-059` HD Consistency — Black Knight V2)
- **Mục tiêu duy nhất:** Sửa dứt điểm hiện tượng Scale Pop khi bắt đầu Run (`BUG-058`) và đồng bộ độ nét giữa Idle/Walk `30px` vs Run `41px` (`BUG-059`) trên bộ Codex Black Knight V2 (`Meliodas Blackwood`).
- **Agent phụ trách:** **Codex**
- **Dependencies:** Owner phê duyệt mở khóa `BUG-058/059` từ hàng đợi Deferred; dùng nguồn lossless ở [Meliodas_Blackwood/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/01_Characters/Player/Meliodas_Blackwood/).
- **Phạm vi file:** `public/assets/characters/black_knight/*`, `src/entities/BlackKnightPlayer.ts`, `src/animation/BlackKnightAnimations.ts`.
- **Hệ thống được bảo vệ:** `black_knight_*` keys, `wayfarer_*`/`satyr_*` compatibility prefixes, foot hitbox `18×12`, Vòng Sáng `[F]`, `H4-12A`.
- **Tiêu chí nghiệm thu:** `0 px` nhảy tỷ lệ chuyển Idle ↔ Run ↔ Attack, khớp `WAYFARER_BASE_SCALE = 1.50` / `origin (0.5, 1.0)`.
- **Test cần chạy:** `npm run check`, `HW-CS21-04` animation frame diagnostics, `test_v15_25` / walk-run QA.
- **Điểm dừng:** **HARD STOP** & bàn giao contact sheet + FPS audit.

### `TASK-B02` (Sản Xuất Nguyên Bản Sprite Sandbox `The Headless Warden` & Dàn Kỵ Sĩ Mới)
- **Mục tiêu duy nhất:** Dựng spritesheet pixel art `128×128` 4 hướng nguyên bản (`ART-K01`) cho `The Headless Warden` trong sandbox (`0` gắn vào gameplay chính) và dựng prototype `Sir Roderick` / `Sir Aldemar` sau khi có quyết định bản quyền.
- **Agent phụ trách:** **AG** (quản lý sandbox, packing atlas, contact sheet QA) / Họa sĩ (`pixel art` gốc).
- **Dependencies:** `OQ-HW-BOSS`, `OQ-K04`, `OQ-04`, `OQ-05`, `OQ-07`.
- **Phạm vi file:** Chỉ xuất vào `HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/` & báo cáo visual (chưa chạm `src/`).
- **Hệ thống được bảo vệ:** `DreadHorsemanEntity`, `HoodedKnightBoss`, `Mattz Art` blacklist (cấm trace).
- **Tiêu chí nghiệm thu:** Đạt đủ `4` tiêu chuẩn QA ở [HEADLESS_WARDEN_ASSET_SPECIFICATION.md §4.1](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HEADLESS_WARDEN_ASSET_SPECIFICATION.md).
- **Test cần chạy:** Python alpha/grid/anchor/clipping validator + visual inspection `1:1` cạnh Meliodas.
- **Điểm dừng:** Trình contact sheet cho Owner duyệt trước khi viết Entity runtime (`TASK-B03`).

### `TASK-B03` (Tích Hợp Runtime Entity Kỵ Sĩ / Boss Mới — *Conditional*)
- **Mục tiêu duy nhất:** Triển khai class/AI cho `The Headless Warden`, `Sir Roderick`, `Sir Aldemar` (hoặc điều chỉnh `HoodedKnightBoss` nếu `OQ-04` sáp nhập Mordric).
- **Agent phụ trách:** **Codex**
- **Dependencies:** `TASK-B02` duyệt + `OQ-04/13/14/15/16`.
- **Phạm vi file:** `src/entities/EvilKnights.ts` (hoặc module boss mới), `src/systems/BossEncounterSystem.ts`, `src/systems/WildlifeSystem.ts`, `src/scenes/PreloadScene.ts`, `src/config/Constants.ts`.
- **Hệ thống được bảo vệ:** Main Route `7` stages, `BossMireWarden`, `SQ06–09`, `60 FPS`.
- **Tiêu chí nghiệm thu:** Zero 404, combat/telegraph chuẩn, không softlock `SQ08` hay `quest_corrupted_crest`.
- **Test cần chạy:** `npm run check`, `verify_zero_404_assets.mjs`, boss lifecycle & save/load test.
- **Điểm dừng:** **HARD STOP**.

---

## C. TRACK C — NARRATIVE RECONSTRUCTION (`AG` Data + `Codex` Logic)

> Toàn bộ phân rã từng bước chi tiết (`NR-REC-01` → `NR-REC-10`) nằm trong [FULL_NARRATIVE_RECONSTRUCTION_ROADMAP.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/FULL_NARRATIVE_RECONSTRUCTION_ROADMAP.md).
- **Tóm tắt ranh giới Agent:**
  - **Codex (`NR-REC-01` Logic):** Nâng cấp `DialogueSystem.ts` thêm *trustDelta one-time guard* (`I-03`) & nút `1–5` choices, chặn spoiler cổng `PlayerState.ts`, cập nhật định tuyến `Vaelen` `GameScene.ts:4826–4865` & `EndingSystem.ts` giữ nguyên ngưỡng.
  - **AG (`NR-REC-02..09` Content Sync):** Đồng bộ sạch 100% tàn dư cũ trên `MainMenuScene.ts`, `PreloadScene.ts`, `index.html`, `UIScene.ts`, `dialogues.json`, `lore.json`, `tornPagesData.ts`, `quests.json`, `items.json`, `ItemTooltipHelper.ts`, `JournalModal.ts`, `zones.json`, `VeilSystem.ts` sau khi Owner ký `DEC-NAR-*`.

---

## D. TRACK D — CINEMATIC INTEGRATION (`AG` + `Codex`)

### `TASK-D01` (Tích Hợp Opening Prologue `28s` `CS01–CS06`)
- **Mục tiêu duy nhất:** Triển khai trình phát Opening Prologue theo phương án được chọn (`PA C: Hybrid` khuyến nghị) chạy `1` lần khi `New Game` trước `fog_crossing`.
- **Agent phụ trách:** **Codex** (scene lifecycle & input lock) + **AG** (keyframe media staging & subtitle `.json`).
- **Dependencies:** `OQ-19`, `OQ-01..03`, `OQ-20` (anti-spoiler), Track `C` dữ liệu mở đầu hoàn tất.
- **Phạm vi file:** `src/scenes/MainMenuScene.ts`, `src/scenes/GameScene.ts`, `src/scenes/PreloadScene.ts`, module Overlay mới, `public/assets/cinematics/prologue/`.
- **Hệ thống được bảo vệ:** Save Schema `3`, `Continue` flow, Act 0 checkpoint (`x>=175`, `x>=280`), `Reduced Motion`.
- **Tiêu chí nghiệm thu:** Đạt đủ `Skip` (`ESC/ENTER`), `Continue` bỏ qua 100%, Fallback 2 tầng, `0` leak tên `Meliodas`, `0` kẹt input/timer/audio.
- **Test cần chạy:** `NT-04`, `NT-06`, `verify_zero_404_assets.mjs`, `npm run check`.
- **Điểm dừng:** **HARD STOP**.

---

## E. TRACK E — AUDIO INTEGRATION (`AG` Asset Staging + `Codex` AudioManager)

### `TASK-E01` (Tạo Cue Chuông Ngắn `~2.8s`, Giọng Kỵ Sĩ & Tích Hợp Stem `V12.2`)
- **Mục tiêu duy nhất:** Cắt/xuất cue chuông ngắn `sfx_bell_short_fade`, gán voice slots cho Vaelen/Mordric/Roderick/Aldemar từ gói `CC BY 4.0`, tích hợp `D–F–E–A` stems + Focus Attenuation theo [AUDIO_INTEGRATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/AUDIO_INTEGRATION_PLAN.md).
- **Agent phụ trách:** **AG** (cắt file WAV/MP3, cập nhật `HW_AUDIO_ASSET_INDEX.json` & license check) + **Codex** (`AudioManager.ts`, `DialogueSystem.ts`).
- **Dependencies:** Owner cung cấp `V12.2` DAW stems (`OQ-20`) & xác nhận license `wantosure` (nếu dùng `27` WAVs).
- **Phạm vi file:** `public/assets/audio/*`, `src/audio/AudioManager.ts`, `src/systems/EndingSystem.ts`, `src/scenes/GameScene.ts`.
- **Hệ thống được bảo vệ:** `CampSanctuarySystem` isolation (`V152-02`), volume sliders, WebAudio lifecycle & Master Limiter.
- **Tiêu chí nghiệm thu:** `0` 404 audio, `clearInterval` không rò rỉ gain ramp, chuẩn `48 kHz` Stereo, trạm lửa yên tĩnh 100%.
- **Test cần chạy:** `test_v15_39_bgm_system.mjs`, `test_v152_02_audio_sanctuary.mjs`, `verify_zero_404_assets.mjs`, kiểm âm thực tế bởi Owner (`BUG-026/027`).
- **Điểm dừng:** **HARD STOP**.

---

## F. TRACK F — QA & PERFORMANCE (`AG` + `Codex`)

### `TASK-F01` (Nghiệm Thu Chéo Tổng Thể Pre-Release Gate)
- **Mục tiêu duy nhất:** Chạy toàn bộ bộ kiểm thử tự động, kiểm thử 12 tiêu chí Narrative Acceptance & đo hiệu năng `17` zones trên cấu hình chuẩn sau khi hoàn tất A–E.
- **Agent phụ trách:** **AG** + **Codex** (smoke test runtime).
- **Dependencies:** Toàn bộ Track được Owner kích hoạt đã hoàn tất.
- **Phạm vi file:** Chỉ đọc `src/`, chạy `scripts/*` & ghi báo cáo vào `Read/V1.5/Reports/`.
- **Hệ thống được bảo vệ:** Toàn dự án (`BUG-058/059` verified closed nếu B01 chạy, Classic Sanity `2.1`, Save Schema `3`, P2Game SDK v1.1).
- **Tiêu chí nghiệm thu:** `100%` test trong [NARRATIVE_ACCEPTANCE_TEST_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_ACCEPTANCE_TEST_PLAN.md) PASS, `npm run build` sạch, `~60 FPS`.
- **Test cần chạy:** `npm run check`, `npm run verify:data`, `npm run build`, `verify_zero_404_assets.mjs`, toàn bộ suite `test_v15_*` & `test_v153_save_schema3.mjs`.
- **Điểm dừng:** **HARD STOP** — Trình báo cáo tổng kết xin phép Owner trước khi đóng gói.

---

## G. TRACK G — GIT CHECKPOINT (`Owner Approval Only`)

### `TASK-G01` (Kiểm Toán Diff, Cleanup Backups & Git Checkpoint / PR)
- **Mục tiêu duy nhất:** Xác nhận trạng thái staged hiện tại (`297` file `R100` ở `Pixel_Art/01_Characters/Knights/...`), đóng gói commit sạch theo từng phạm vi đã duyệt (không commit `Backups/`, `dist/`, `node_modules/`).
- **Agent phụ trách:** **AG** (theo lệnh cụ thể từng commit của Owner).
- **Dependencies:** `TASK-F01` PASS.
- **Phạm vi file:** Git index & nhánh làm việc theo chỉ định Owner.
- **Hệ thống được bảo vệ:** Bảo toàn `89+9 = 98` archives, zero force-push, zero `git clean -fd`.
- **Tiêu chí nghiệm thu:** `git status` sạch theo phạm vi PR, CI/local build xanh.
- **Test cần chạy:** `npm run check`, `npm run build`.
- **Điểm dừng:** Dừng và báo cáo SHA commit để Owner kiểm duyệt đẩy remote.
