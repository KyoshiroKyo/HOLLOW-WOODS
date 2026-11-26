# HW-NR-10 — MEMORY DISCOVERY & IDENTITY REVEAL REPORT

- **Mission ID:** `HW-NR-10 — MEMORY DISCOVERY & IDENTITY REVEAL`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Dependency:** `APPROVED PLAYER DISCOVERY TIMELINE` ([HW_STORY_TIMELINE_APPROVAL.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_STORY_TIMELINE_APPROVAL.md) & `DEC-LOCK-07` trong [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md))
- **Status:** **`PARTIAL / TIMELINE INTEGRATION BLOCKED`** *(Đã hoàn tất kiểm toán hệ thống Memory `Stage 0→3`, điều kiện mở khóa, spoil sớm, `Continue` save migration và chạy test Playwright/Chromium sống; **chưa sửa source** do Owner chưa ký chốt mốc reveal `D6` vs `D7` tại `HW_STORY_TIMELINE_APPROVAL §4` & `DEC-LOCK-07`).*
- **Primary Sources Verified:** `src/state/PlayerState.ts` (`L610–622`, `L713–789`), `src/systems/SaveManager.ts` (`L59`, `L410`, `L450`, `L534`, `L699`, `L719`), `src/scenes/GameScene.ts` (`L4287–4294`, `L4377–4384`, `L4842–4850`, `L4881–4884`), `src/scenes/MainMenuScene.ts` (`L791–805`), `src/scenes/UIScene.ts` (`L1060–1077`), `src/entities/EvilKnights.ts` (`L815–821`), `src/systems/EchoSystem.ts` (`L111–115`), `src/ui/TornPageModal.ts` (`L794–800`), `src/ui/JournalModal.ts` (`L909`).

---

## 1. Kết Luận Về Hệ Thống Hiện Hành (`Tận Dụng — Không Tạo Hệ Thống Mới`)

Hệ thống hiện hành **`PlayerState.memoryAwakeningStage` (`0 → 1 → 2 → 3`) + `unlockedLore` + `SaveManager Schema 3` + `UIScene.playerNameText`** đã đáp ứng đầy đủ khung kiến trúc:
- **KHÔNG cần** tự phát triển class Memory mới hay nâng Save Schema lên v4.
- **`setMemoryAwakeningStage(stage)`** (`PlayerState.ts:758–778`) đã có sẵn **guard chống lặp và chống tụt cấp** (`if (clamped <= this.memoryAwakeningStage) return;`), **chống trùng `loreId`** (`unlockLore` kiểm tra `.some(l => l.id === loreId)`), và phát event `'memory_awakening_changed'`.
- Tuy nhiên kiểm toán trực tiếp và chạy thử Chromium đã xác minh **`4` lỗi định tuyến & chống spoil** cần xử lý ngay khi Owner ký duyệt `Timeline B` (`D0–D7`):

| Mã Vấn Đề | Vị trí & Bản chất trong Source Hiện Hành | Hậu quả thực tế đã xác nhận | Phương án chỉnh trong hệ thống cũ (`Chờ Owner duyệt`) |
| :---: | :--- | :--- | :--- |
| **`MEM-01`** *(Spoil Menu & HUD)* | `MainMenuScene.ts:797` (`"Ngươi — Chỉ huy Hiệp Sĩ Đen..."`); `JournalModal.ts:909`; `UIScene.ts:1063` (`'⚔️ Hiệp Sĩ Đen (Black Knight)'` ở `stage >= 3`). | Lộ thân phận ngay ngoài **Main Menu** trước khi bấm `New Game`, và `stage >= 3` vẫn hiện tên cũ thay vì **`Lord Meliodas Blackwood`**. | Đổi `MainMenuScene:797` & `JournalModal:909` sang trung tính; đổi `UIScene:1063` sang `'⚔️ Lord Meliodas Blackwood'` đúng tại mốc Owner duyệt (`D6` hoặc `D7`). |
| **`MEM-02`** *(Spoil sớm Stage `0/1/2`)* | `PlayerState.ts:610–622` tự mở `lore_wayfarer_inner_journal` ngay khi chọn choice đồng cảm ở `stage = 0`; `GameScene.ts:4290, 4380, 4883` tự mở `lore_black_knight_chronicle` + popup `"Hiệp Sĩ Đen!"` ở Stage `1`; `EchoSystem.ts:112` tự đẩy thẳng Stage `2`. | Chọn `choice_knight_empathy` lúc mới vào game đã mở ngay nhật ký `Act 4`; mới bước vào Xưởng Chuông đã spoil Hiệp Sĩ Đen. | Gỡ `lore_wayfarer_inner_journal` khỏi `L610–622` & Stage `2` (`L770`), chỉ mở tại mốc reveal `stage === 3`; viết lại `lore_black_knight_chronicle` không spoil và đồng bộ `setMemoryAwakeningStage(1)`. |
| **`MEM-03`** *(Nhảy qua `setMemoryAwakeningStage`)* | `GameScene.ts:4289`, `4379`, `4882` gán trực tiếp `this.playerState.memoryAwakeningStage = 1` thay vì gọi `setMemoryAwakeningStage(1)`. | Không mở khóa `lore_memory_chapter_1` & `lore_memory_chapter_2` tại Stage `1`, đồng thời không phát event `memory_awakening_changed`. | Thay cả `3` chỗ gán trực tiếp bằng `this.playerState.setMemoryAwakeningStage(1)` *(sau khi đã khóa anti-spoiler nội dung Stage 1)*. |
| **`MEM-04`** *(Thiếu ký ức khi `Continue`)* | `SaveManager.ts:699, 719` gán `state.memoryAwakeningStage = data.memoryAwakeningStage ?? 0` rồi chỉ khôi phục `data.unlockedLoreIds` thô. | Nếu load bản save cũ/thiếu có `stage = 3` nhưng `unlockedLoreIds` chỉ có `['lore_three_rules']`, **`lore_memory_chapter_1..4` không được bổ sung tự động**! | Sau `restoreUnlockedLore`, thêm bước **backfill không ghi đè**: nếu `state.memoryAwakeningStage >= 1/2/3`, đảm bảo gọi `unlockLore(...)` bổ sung đủ mảnh ký ức bắt buộc của stage đó *(không hạ `stage` hay mất lore đã mở)*. |

---

## 2. Khung Điều Kiện Mở Khóa Đồng Bộ `Timeline B` (`D0 → D7` — Chờ Owner Ký Duyệt)

*(Bảo toàn nguyên vẹn ngưỡng Ending `comp>=50, stage>=3, trust>=65`, Sanity `2.1` và Save Schema `3`; không kích hoạt lặp lại nhờ `setMemoryAwakeningStage` monotonic guard + `collected_note_*`):*

- **`Stage 0` (`D0–D2`: Menu → `fog_crossing` → Bellhollow):** `initHudName = '🌲 The Mossbound Wayfarer'`, chỉ mở `lore_three_rules`. **`0`** chữ `Meliodas / Chỉ Huy`.
- **`Stage 1` (`D3–D4`: Outer Woods / Vaelen `Q1` / `sub_bell_workshop` / Văn bia `12` kỵ sĩ):** Mở **`Hồi Ức I & II`** (cập nhật text chỉ gợi dấu vết một vị *Thầy / Lữ Khách quá khứ* từ nhiều góc nhìn, **chưa gọi tên `Meliodas`**). Thay gán tay ở `GameScene:4289, 4379, 4882` bằng `setMemoryAwakeningStage(1)` có guard không phát popup lặp.
- **`Stage 2` (`D4–D5`: `The Echo` / Chạm trán `Sir Mordric` / `HoodedKnightBoss`):** Gọi `setMemoryAwakeningStage(2)` mở **`Hồi Ức III`** (vết rạn niềm tin thầy-trò, tích hợp `DLG-012/013`), **chưa tự mở** `lore_wayfarer_inner_journal`.
- **`Stage 3` (`D6` sau `Vaelen Q3` + Huy hiệu + Lời thề — hoặc `D7` trước `First Toll` theo lựa chọn của Owner tại `HW_STORY_TIMELINE_APPROVAL §4`):** Gọi `setMemoryAwakeningStage(3)`, mở **`Hồi Ức IV` & `lore_wayfarer_inner_journal`**, đồng bộ lời thoại tôn vinh của `Vaelen / Garth / Edda / Neris / Bram / Finn` (`HW-NR-05/06`) và đổi HUD title thành **`Lord Meliodas Blackwood` (`The Wolf Lord`)**.

---

## 3. Kết Quả Kiểm Thử Thực Tế (`Chromium Headless Runtime` — `0` Lỗi Console)

Chạy kiểm thử trực tiếp hệ thống Memory & Reveal hiện hành qua Playwright/Chromium (`Vite Dev Server`, `console_errors = []`):

| Hạng mục test (`HW-NR-10 §TESTS`) | Kịch bản kiểm thử thực tế | Kết quả quan sát thực tế | Đánh giá |
| :--- | :--- | :--- | :---: |
| **1. `Main Menu` Anti-Spoiler** | Mở modal Chronicle ở `MainMenuScene`. | `mainMenuChronicleSpoiler = true` (vẫn hiện `'Chỉ huy Hiệp Sĩ Đen'` ở `L797`). | **GAP ĐÃ XÁC NHẬN** |
| **2. `New Game` Initial State** | Khởi tạo ván mới, đọc HUD & `unlockedLore`. | `initStage = 0`, `initHudName = "🌲 The Mossbound Wayfarer"`, `initLoreIds = ["lore_three_rules"]`. | **PASS** |
| **3. Choice Flag Early Leak (`Stage 0`)** | Kích hoạt `ps.setStoryFlag('choice_knight_empathy')` ngay ở Stage `0`. | `unlockedLore` nhảy ngay sang `["lore_three_rules", "lore_wayfarer_inner_journal"]`! | **FAIL (Spoil sớm `L611`)** |
| **4. Out-of-order Jump (`0→2`), Repeated Trigger & Downgrade** | Gọi `setMemoryAwakeningStage(2)` **2 lần**, rồi gọi `setMemoryAwakeningStage(1)`. | `stage = 2`, `eventCount = 1` *(chống kích hoạt lặp & chống tụt stage hoạt động)*, `hudName` giữ `"🌲 The Mossbound Wayfarer"`, mở đủ `6` mục `lore_three_rules` + `wayfarer` + `ch1..3` + `chronicle`. | **PASS (Logic guard)** |
| **5. `Pause` & Resume** | Mở `pauseModal` rồi đóng lại giữa Stage `2`. | `pauseOpened = true`, `pauseClosed = true`, không mất tiến trình `stage`. | **PASS** |
| **6. `Stage 3` Identity Reveal (`Skip` test)** | Nhảy tới `setMemoryAwakeningStage(3)` & `ui.redrawStats()`. | `stage3HudName = "⚔️ Hiệp Sĩ Đen (Black Knight)"` *(chờ Owner chốt đổi sang `Meliodas Blackwood`)*, mở `7` mục (thêm `lore_memory_chapter_4`). | **PASS (Mechanism) / Chờ text** |
| **7. `Continue` & Legacy Save Missing Lore** | Lưu full (`stage = 3, 7 lore`), nạp save giả lập cũ (`stage = 3` chỉ có `lore_three_rules`), rồi nạp lại save full. | Load save giả lập chỉ có `1` lore (`lore_three_rules`), **bị thiếu `ch1..4`** (`MEM-04` đã tái hiện!); nạp lại save full khôi phục đủ `stage = 3, loreCount = 7`. | **FAIL (Thiếu backfill khi `Continue`)** |

---

## 4. Hard Stop
- **Chưa chỉnh sửa source** (`0` sửa đổi `PlayerState.ts`, `SaveManager.ts`, `UIScene.ts`, `MainMenuScene.ts`, `GameScene.ts`, `EndingSystem.ts`, Sanity, Save Schema `3`), chờ Owner ký duyệt `Timeline B` (`D6` vs `D7` reveal) & `DEC-LOCK-07`.
- **Không** tự sửa Ending, **không** đổi Save Schema `3`, **không** sửa Sanity, **không** xóa tài nguyên, **không** commit/push.