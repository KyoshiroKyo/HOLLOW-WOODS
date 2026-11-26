# HW-V16-A04 — VAELEN & MORDRIC NARRATIVE DEVELOPMENT REPORT

- **Task ID:** `HW-V16-A04 — VAELEN & MORDRIC NARRATIVE DEVELOPMENT`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Roadmap:** `3.1` | **Dependencies:** `HW-V16-A02` + `HW-V16-A03` (`PASS`)
- **Baseline:** `daae9b42eef688558a6a305757bf37a82186b0c6` (`feat/v1.5.3-ag-world-polish`)
- **Backup Created:** `Backups/steps/backup_hw_v16_a04/` (`dialogues.json`, `GameScene.ts`)
- **Status:** **`PASS` (Với giới hạn `A06/B07` được báo rõ)**

---

## 1. Xử Lý Các Điểm Tồn Đọng Từ Review A02 (`§2`)

| Điểm tồn đọng từ A02 | Biện pháp xử lý trong A04 | File & Vị trí |
|---|---|---|
| `campfire_knight_q3_complete` gọi trực tiếp `Lord Meliodas Blackwood (The Wolf Lord)` trước khi `A06` có Evidence Resolver | Trung tính hóa câu thoại thành nhận diện dấu ấn Quân Huy Đoàn Kỵ Sĩ Hắc Lang & lời thề năm xưa, không lộ tên thật `Meliodas Blackwood` khi thiếu điều kiện resolver; giữ nguyên phần thưởng `eqp_bell_ward_charm ×1` & flags. | `src/data/dialogues.json:760–789`, `src/scenes/GameScene.ts:4849` |
| `campfire_knight_idle_talk` chào bằng tên `Lord Meliodas Blackwood` & choice gọi `"người anh em"` | Chuyển sang lời chào trung tính bảo vệ lời thề Hắc Lang & Bellhollow; choice đổi sang `"Cảm ơn hiệp sĩ..."`. | `src/data/dialogues.json:836–853` |
| `hooded_knight_encounter_defeat` mang lời tiễn biệt chốt tử (`"yên nghỉ"`, `"Vĩnh biệt"`, `"được giải thoát"`) | Loại bỏ hoàn toàn hàm ý chết/hồi sinh/tiễn biệt vĩnh viễn; thể hiện sự cạn sức trong encounter & mâu thuẫn lời thề để mở số phận cho quyết định của Owner. | `src/data/dialogues.json:814–835` |
| Lựa chọn người chơi xưng hô thân thuộc quá sớm (`"Vaelen"`, `"người học trò cũ"`, `"người bạn cũ"`) & `"giải thoát linh hồn"` ở `q2` / `intro` | Chỉnh về xưng hô phù hợp hoàn cảnh mất trí nhớ (`"hiệp sĩ"`, `"Sir Vaelen"`, `"nếu màn sương còn kiểm soát ngươi"`, `"giữ lại chút bình tĩnh trong sương, Sir Mordric"`). | `src/data/dialogues.json:736, 773–780, 801–808, 826–827` |
| Củng cố `V04 — Q05 Recognition` không phụ thuộc `SQ08` | Cập nhật `vaelen_examine_crest_and_seek_mold` ghi nhận dấu ấn Đoàn Kỵ Sĩ Hắc Lang & cảm giác quen thuộc khi nhận `quest_corrupted_crest` theo tuyến `Q05`. | `src/data/dialogues.json:945–946` |

---

## 2. Phát Triển Tuyến Sir Vaelen (`V01`–`V05`) & Sir Mordric

- **Mốc tiến trình Vaelen:**
  - `V01 — First Meeting` (`campfire_knight_intro`): nhận ra giáp đen & vòng sáng quen thuộc, `0` spoil.
  - `V02 — Growing Recognition` (`campfire_knight_comrade_bond`): nhớ lời dặn của thủ lĩnh Đoàn Kỵ Sĩ Hắc Lang giữ ngọn lửa hậu phương.
  - `V03 — Mordric Discovery` (`campfire_knight_q2_complete`): đọc nhật ký trung úy và nhận biết **Sir Mordric** là người bạn cũ (`HoodedKnightBoss`), không nhầm là Tổng Chỉ Huy.
  - `V04 — Q05 Recognition` (`vaelen_examine_crest_and_seek_mold`): kích hoạt độc lập khi có `quest_corrupted_crest` mà **không** ép hoàn thành `SQ08`.
  - `V05 — Identity Revelation`: giữ wording trung tính tại `q3_complete` & `idle_talk` cho tới khi `A06/B07` hoàn thiện bộ giải chứng cứ.
- **Mordric (`Sir Mordric = The Dark Knight = HoodedKnightBoss`):**
  - Xác nhận xuyên suốt `EvilKnights.ts:815–842`, `PlayerState.ts:926–937` (Bestiary), `GameScene.ts:800–816`, `portrait_hooded_knight`.
  - Không quy kết Meliodas cố ý bỏ rơi học trò, không tự bịa nguyên nhân tha hóa, không chốt Mordric đã chết, hồi sinh hay thành đồng minh; giữ nguyên boss encounter & drop `quest_corrupted_crest ×1`.
- **Chuẩn bị thoại `V12.2` & Reveal Matrix:**
  - Hoàn thiện hồ sơ `DRAFT` cho `DLG-009`, `DLG-012`, `DLG-013`, `DLG-014`, `DLG-015` và **Reveal & Choice Matrix** tại [`HW_V16_A04_KNIGHT_DIALOGUE_APPROVAL_DRAFT.md`](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A04_KNIGHT_DIALOGUE_APPROVAL_DRAFT.md).
  - Cập nhật [`DIALOGUE_REGISTRY.md`](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DIALOGUE_REGISTRY.md).

---

## 3. Giới Hạn Cần Báo Rõ Cho Giai Đoạn Tiếp Theo (`A06 / B07`)

> **⚠️ Giới hạn được báo minh bạch (`§8`):**
> **Bộ giải Identity Reveal Resolver hoàn chỉnh CHƯA hoàn thành trong `A04`** (thuộc phạm vi `HW-V16-A06` & `B07`).
> - Hiện tại `GameScene.ts:4843` trong `SQ08` vẫn nâng `memoryAwakeningStage` lên `3` khi trả `q3_complete` (bảo toàn baseline hiện hành, không tự sửa Memory Stage logic). Do đó `UIScene` HUD/Ending/NPC Reverence đọc trực tiếp `memoryAwakeningStage >= 3` khi có `SQ08` — việc tách bạch hoàn toàn điều kiện *Stage 3 + Chứng cứ phù hợp không phụ thuộc SQ08* sẽ được triển khai ở `HW-V16-A06`.
> - Trong `A04`, lời thoại `campfire_knight_q3_complete`, `campfire_knight_idle_talk` và popup `GameScene.ts:4849` được giữ trung tính để tránh tiết lộ trái điều kiện trong thời gian chờ `A06`.

---

## 4. Kết Quả Kiểm Thử Thực Tế (`A04-T01` – `A04-T10`)

Toàn bộ `A04-T01`–`A04-T09` chạy trên Chromium headless với production build `dist/` sau lần sửa cuối ([`hw_v16_a04_playwright_results.json`](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A04/hw_v16_a04_playwright_results.json)), `0` console/page/HTTP errors.

| Test ID | Mục tiêu | Kết quả | Chi tiết thực tế & Ảnh chụp |
|---|---|---|---|
| **`A04-T01`** | First Meeting không spoil | **PASS** | `campfire_knight_intro` + `campfire_knight_comrade_bond`: `0` từ `Meliodas/Wolf Lord/Tổng Chỉ Huy`, `memoryStage=0`. Ảnh: [01_vaelen_first_meeting.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A04/01_vaelen_first_meeting.png) |
| **`A04-T02`** | Vaelen `q2` không nhầm Mordric là Tổng Chỉ Huy | **PASS** | `campfire_knight_q2_complete` xác nhận bạn cũ `Sir Mordric`, `0` nhầm lẫn `Tổng Chỉ Huy`. Ảnh: [02_vaelen_q2_mordric_discovery.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A04/02_vaelen_q2_mordric_discovery.png) |
| **`A04-T03`** | `q3` không reveal trái điều kiện | **PASS** | `campfire_knight_q3_complete` & `campfire_knight_idle_talk` nhận ra Quân Huy Hắc Lang trung tính, `0` lộ tên `Meliodas Blackwood / Wolf Lord / học trò cũ / người anh em`. Ảnh: [03_vaelen_q3_neutral.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A04/03_vaelen_q3_neutral.png) |
| **`A04-T04`** | `Q05` không bị phụ thuộc `SQ08` | **PASS** | Nhặt `quest_corrupted_crest` khi `campfire_knight_q3_accepted = false` kích hoạt `vaelen_examine_crest_and_seek_mold` → đặt `vaelen_mold_quest_assigned=true`, `Q05_SOLVE_MIRE` (`memoryStage=0`, không ép `SQ08`). |
| **`A04-T05`** | Mordric intro và defeat phù hợp Canon | **PASS** | Intro nhận diện dấu ấn giáp/bao kiếm (`Kỵ Sĩ Trùm Mũ`), defeat nói rõ mâu thuẫn lời thề (`Sir Mordric — Kỵ Sĩ Bóng Tối`), `0` quy kết bỏ rơi. Ảnh: [04_mordric_intro.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A04/04_mordric_intro.png), [05_mordric_defeat.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A04/05_mordric_defeat.png) |
| **`A04-T06`** | Không khẳng định số phận chưa được duyệt | **PASS** | `0` cụm `"yên nghỉ"`, `"vĩnh biệt"`, `"giết ta đi"`, `"được giải thoát"`. |
| **`A04-T07`** | Portrait đúng speaker | **PASS** | Vaelen → `portrait_campfire_knight`; Mordric intro & defeat → `portrait_hooded_knight` (`visible: true`). |
| **`A04-T08`** | Payload dialogue và rewards nguyên vẹn | **PASS** | `quest_corrupted_crest = 1`, `eqp_bell_ward_charm = 1`, `boss_hooded_knight_defeated = true`, `campfire_knight_q3_completed = true`, `choice_hooded_knight_farewell = true`, `choice_black_knight_vow = true`. |
| **`A04-T09`** | Save/Load và quay lại hội thoại không regression | **PASS** | `handleSaveManual()` → reload → `continueGame()` khôi phục đầy đủ `Q05_SOLVE_MIRE`, `eqp_bell_ward_charm = 1`, `boss_hooded_knight_defeated = true`, chạy lại `campfire_knight_idle_talk` an toàn. |
| **`A04-T10`** | `check`, `verify:data`, `build` | **PASS** | `npm run check` (`0`), `npm run verify:data` (`15/15 PASS`), `npm run build` (`vite build` exit `0`), `verify_v15_16_story_and_dialogue.mjs` (`90/90 PASS`), `test_v15_38_vaelen_rest_blessing.mjs` (`12/12 PASS`). *(Lưu ý: `test_v15_32` `21/25` & `verify_v15_18` `36/41` chỉ fail ở các assertion chuỗi V1.5 cũ `"Chỉ Huy Hiệp Sĩ Đen"` / `"Hiệp Sĩ Canh Lửa"` / `"tự phong ấn"` đã được Canon A02/A04 thay thế.)* |
