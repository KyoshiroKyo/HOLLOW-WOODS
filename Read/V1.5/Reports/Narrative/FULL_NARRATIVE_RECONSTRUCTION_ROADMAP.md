# HOLLOW WOODS — FULL NARRATIVE RECONSTRUCTION ROADMAP (`OWNER ADDENDUM §3 & §5`)

- **Mission:** `HW-NARRATIVE-00H (OWNER ADDENDUM — FULL NARRATIVE RECONSTRUCTION REQUIREMENT)`
- **Mục tiêu:** Đồng bộ lại **toàn bộ mạch truyện thống nhất từ `New Game` → `Opening` → `Bellhollow` → `Outer Woods` → `Mire` → `Deep Forest` → `Bosses` → `Journal/Torn Pages` → `Ending`**, loại bỏ sạch tàn dư cũ khỏi trải nghiệm chơi mà vẫn bảo vệ tuyệt đối Save Schema `3`, Main Route, Classic Sanity `2.1` và `BUG-058/059`.
- **Điều kiện tiên quyết:** Chủ dự án (Owner) ký duyệt các quyết định trong [OWNER_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_DECISIONS_REQUIRED.md) thành phiếu `DEC-NAR-___`. **Mỗi bước dưới đây là 1 tác vụ độc lập có mục tiêu duy nhất, chạy test và HARD STOP ngay khi xong.**

---

## Chuỗi Nhiệm Vụ Tuần Tự (`NR-REC-01` → `NR-REC-10`)

### Bước 1 — `NR-REC-01`: Khóa Hồ Sơ `DEC-NAR` & Hạ Tầng Bảo Vệ Hội Thoại (`DialogueSystem`)
- **Mục tiêu duy nhất:** Ghi nhận chính thức các phiếu `DEC-NAR-___` của Owner vào `CANON_DECISION_REGISTRY.md` và nâng cấp `DialogueSystem` có cơ chế **chống cộng lặp `trustDelta` (one-time guard)** + **field `condition`** + **hỗ trợ phím `1–5` choices**.
- **Agent:** Codex (`DialogueSystem.ts`) + AG (`CANON_DECISION_REGISTRY.md`).
- **Phạm vi file:** `Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md`, `src/systems/DialogueSystem.ts`, `src/types/index.ts`.
- **Test cần chạy:** `npm run check`, `NT-02` (choice idempotency & phím `1–5`), `verify_v15_16_story_and_dialogue.mjs`.
- **Điểm dừng:** **HARD STOP** sau khi xác nhận `villageTrustScore` không thể bị farm.

### Bước 2 — `NR-REC-02`: Gỡ Bỏ Spoiler Sớm & Dọn Tàn Dư `Satyr` Ngoài Hệ Thống Dữ Liệu
- **Mục tiêu duy nhất:** Loại bỏ tàn dư hiển thị `'Satyr:'` / quốc lộ / ô tô tại `EndingSystem.ts:1037` & `VeilSystem.ts:44` (`RES-001/002`), sửa spoil tại `MainMenuScene.ts:797` (`RES-004`), dời/chỉnh cổng mở khóa tại `PlayerState.ts` & popup `GameScene.ts:4292,4382,4849` để ẩn tên thật `Meliodas` ở giai đoạn đầu (`RES-008`), và đổi nhãn HUD/Journal theo mốc reveal (`RES-014`).
- **Agent:** Codex (`PlayerState.ts`, `GameScene.ts`) + AG (`MainMenuScene.ts`, `UIScene.ts`, `JournalModal.ts`, `VeilSystem.ts`, `EndingSystem.ts`).
- **Phạm vi file:** `src/scenes/MainMenuScene.ts`, `GameScene.ts`, `UIScene.ts`, `src/ui/JournalModal.ts`, `src/state/PlayerState.ts`, `src/systems/VeilSystem.ts`, `EndingSystem.ts`.
- **Test cần chạy:** `npm run check`, `NT-01` (Anti-Spoiler Menu/Act 0/Stage 1), `NT-07` (Classic Sanity `2.1` + `H4-12A`).
- **Điểm dừng:** **HARD STOP**.

### Bước 3 — `NR-REC-03`: Đồng Bộ Toàn Bộ `src/data/lore.json` & `src/data/tornPagesData.ts`
- **Mục tiêu duy nhất:** Thay thế toàn bộ nội dung `Algiz`/tự phong ấn (`RES-006/007`), sửa chính tả `Sir Valen → Sir Vaelen` (`RES-003`), cập nhật chương ký ức của **Meliodas Blackwood**, văn bia kỵ sĩ (`OQ-K06`), và đồng bộ `veil_commander_epistle` (`zones.json:4172–4179` & `maps/veil_origin_cavern.json`).
- **Agent:** AG
- **Phạm vi file:** `src/data/lore.json`, `src/data/tornPagesData.ts`, `src/data/zones.json`, `src/data/maps/veil_origin_cavern.json` *(chỉ sửa string text, 0 sửa collider/spawn/ID)*.
- **Test cần chạy:** `npm run check`, `npm run verify:data`, `NT-01`, `NT-06` (nạp save cũ có sẵn `lore_*` IDs).
- **Điểm dừng:** **HARD STOP**.

### Bước 4 — `NR-REC-04`: Đồng Bộ `src/data/dialogues.json` — Bellhollow (`Garth, Edda, Neris, Bram, Finn`)
- **Mục tiêu duy nhất:** Tích hợp lời thoại `TRAILER-ONLY` đã duyệt cho **Edda** (`DLG-006–007`), rút gọn/làm mượt dòng dân làng nếu `OQ-17` chốt, chèn các lựa chọn **`DLG-P01–P02`** (gắn `choiceId` one-time), xóa chữ *"trăm năm"* khỏi `edda_black_knight_reverence` theo `OQ-08`, giữ nguyên toàn bộ 39 keys + reward/gate của 5 NPC làng.
- **Agent:** AG
- **Phạm vi file:** `src/data/dialogues.json` (chỉ cụm `garth_*`, `edda_*`, `neris_*`, `bram_*`, `finn_*`).
- **Test cần chạy:** `npm run check`, `npm run verify:data`, `verify_v15_17_villager_stories.mjs`, `verify_v15_25_npc_labels_and_dialogue.mjs`.
- **Điểm dừng:** **HARD STOP**.

### Bước 5 — `NR-REC-05`: Đồng Bộ Tuyến Kỵ Sĩ (`Sir Vaelen`, `Hooded Knight / Sir Mordric` & `GameScene` Routing)
- **Mục tiêu duy nhất:** Giải quyết dứt điểm **`CONFLICT C02` (`Vaelen q2 vs q3`)** & **`CONFLICT C03` (`Mordric vs Hooded`)**, tích hợp `DLG-009`, `DLG-012–015` (nếu duyệt), `DLG-P03–P06`, đồng bộ tên boss trong Bestiary (`PlayerState:930`) & popup combat (`GameScene:802–814`), và tách sạch nhánh `hasCrest` vs `SQ08` tại `GameScene:4826–4865`.
- **Agent:** Codex (`GameScene.ts`, `EvilKnights.ts`) + AG (`dialogues.json` 19 keys Vaelen/Hooded, `PlayerState:930`).
- **Phạm vi file:** `src/data/dialogues.json`, `src/entities/EvilKnights.ts`, `src/scenes/GameScene.ts`, `src/state/PlayerState.ts`.
- **Test cần chạy:** `npm run check`, `verify_v15_18_knight_awakening.mjs`, `test_v15_32`, `NT-02`, `NT-03` (`SQ08` vs `Stage 2`).
- **Điểm dừng:** **HARD STOP**.

### Bước 6 — `NR-REC-06`: Đồng Bộ Item Descriptions, Tooltips, Quests & Localization Labels
- **Mục tiêu duy nhất:** Cập nhật mô tả vật phẩm (`items.json:362`, `content_registry.json`, `registryData.ts`, `ItemTooltipHelper.ts`), wording mô tả trong `quests.json` (giữ nguyên `mainRoute` & `questId`), và chuẩn hóa nhãn Menu/Loading (`PreloadScene.ts`, `MainMenuScene.ts`, `index.html`) nếu `OQ-17` đổi branding sang *The Unbroken Oath / Khu rừng đang dõi theo*.
- **Agent:** AG
- **Phạm vi file:** `src/data/items.json`, `quests.json`, `content_registry.json`, `src/registry/registryData.ts`, `src/ui/ItemTooltipHelper.ts`, `PreloadScene.ts`, `MainMenuScene.ts`, `index.html`.
- **Test cần chạy:** `npm run check`, `npm run verify:data`, `test_v15_60_quest_chain_restructuring.mjs`.
- **Điểm dừng:** **HARD STOP**.

### Bước 7 — `NR-REC-07`: Tích Hợp Opening Prologue `28s` (`CS01–06`) & Dẫn Nhập `Act 0`
- **Mục tiêu duy nhất:** Triển khai `TASK-D01` nối `MainMenuScene.startNewGame()` → Prologue `28s` (PA C Hybrid) → `GameScene.startAct0Intro()` khớp với câu gọi/chuông đã chốt ở `OQ-02` và `OQ-19`.
- **Agent:** Codex + AG
- **Phạm vi file:** `src/scenes/MainMenuScene.ts`, `GameScene.ts`, `PreloadScene.ts`, module Prologue mới, `public/assets/cinematics/prologue/`.
- **Test cần chạy:** `NT-04` (New Game, Skip `ESC/ENTER`, Continue bypass, Fallback), `verify_zero_404_assets.mjs`.
- **Điểm dừng:** **HARD STOP**.

### Bước 8 — `NR-REC-08`: Đồng Bộ `3` Kết Thúc (`EndingSystem` & `EndingScene`) + Reveal `Meliodas Blackwood`
- **Mục tiêu duy nhất:** Viết lại `narrativeLines` & `subtitle/title` cho `true_ending`, `sacrifice_ending`, `fog_loop_ending` trong `EndingSystem.ts:64–120` khớp 100% Lore mới, danh hiệu **`Meliodas Blackwood — The Wolf Lord`** và mốc thời gian `OQ-08`, giữ nguyên `3` ngưỡng tính kết thúc (`comp>=50, stage>=3, trust>=65`) & `3` storyFlags.
- **Agent:** AG + Codex
- **Phạm vi file:** `src/systems/EndingSystem.ts`, `src/scenes/EndingScene.ts`.
- **Test cần chạy:** `NT-05` (`12` test biên Ending), `test_v15_59_ending_screen_and_branching.mjs`, `verify_v15_20_multiple_endings.mjs`.
- **Điểm dừng:** **HARD STOP**.

### Bước 9 — `NR-REC-09`: Mở Rộng Tuyến Kỵ Sĩ Mới & Boss Mới (*Conditional — Nếu Owner Kích Hoạt*)
- **Mục tiêu duy nhất:** Đưa `Sir Roderick`, `Sir Aldemar`, `The Headless Warden` (và `Satyr` nếu `OQ-13` duyệt) vào chuỗi nhiệm vụ phụ/tàn tích mở rộng cùng audio stems `V12.2` (`TASK-B03` & `TASK-E01`), giữ không chặn Main Route.
- **Agent:** Codex + AG
- **Phạm vi file:** `quests.json`, `dialogues.json`, `lore.json`, `src/entities/*`, `AudioManager.ts`, `WorldGatingSystem.ts`.
- **Test cần chạy:** `npm run check`, `verify:data`, `verify_zero_404_assets.mjs`, `TASK-E01` audio tests.
- **Điểm dừng:** **HARD STOP**.

### Bước 10 — `NR-REC-10`: Nghiệm Thu Cuối Toàn Diện & Bảo Chứng Tương Thích Save Schema `3`
- **Mục tiêu duy nhất:** Chạy toàn bộ ma trận `12` tiêu chí nghiệm thu ở [NARRATIVE_ACCEPTANCE_TEST_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_ACCEPTANCE_TEST_PLAN.md) trên toàn bộ tuyến chơi `New Game → Ending` và save cũ `Continue`, xuất báo cáo sign-off cuối cùng.
- **Agent:** AG + Codex
- **Phạm vi file:** Read-only toàn repo, lưu kết quả test tại `Read/V1.5/Reports/`.
- **Test cần chạy:** Full Regression Suite + `npm run build` + `FPS benchmark`.
- **Điểm dừng:** **HARD STOP** chờ Owner nghiệm thu phát hành.
