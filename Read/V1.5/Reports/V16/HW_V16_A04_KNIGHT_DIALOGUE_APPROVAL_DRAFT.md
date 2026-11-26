# HW-V16-A04 — KNIGHT DIALOGUE APPROVAL DRAFT (`DLG-009`, `DLG-012..015`) & REVEAL MATRIX

- **Task ID:** `HW-V16-A04 — VAELEN & MORDRIC NARRATIVE DEVELOPMENT`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Agent:** `AG 4 Hydro High`
- **Governing Locks:** `DEC-LOCK-01`, `DEC-LOCK-07`, `DEC-LOCK-09`, `DEC-LOCK-10`, `DEC-LOCK-11`, `DEC-LOCK-16`, `DEC-LOCK-17`
- **Status:** **`DRAFT — PENDING OWNER APPROVAL`** *(Không chèn nguyên văn `DLG-009/012–015` vào `src/data/dialogues.json`, không thêm animation/cinematic mới trong `A04`)*

---

## 1. Hồ Sơ Chuẩn Bị Thoại `V12.2` (`DLG-009`, `DLG-012`, `DLG-013`, `DLG-014`, `DLG-015`)

### A. `DLG-009` — Sir Vaelen (*Những lời thề chưa dám quên*)

| Mục đặc tả | Chi tiết |
|---|---|
| **Nguyên văn tham chiếu (`DIALOGUE_REGISTRY.md`)** | *"Có những lời thề, người lập ra đã chẳng còn nhớ. Nhưng kẻ từng thề nguyện, đến nay vẫn chưa dám quên."* |
| **Bản điều chỉnh cho gameplay (`DRAFT`)** | Chèn làm dòng mở cảm xúc bên đốm lửa ở `campfire_knight_intro` hoặc nhánh kể lại lời thề `campfire_knight_comrade_bond`, giữ tông trang trọng không gọi tên `Meliodas` sớm:<br>*"Ngọn lửa này cháy qua bao mùa sương, vẫn giữ nguyên một điều: Có những lời thề, người lập ra đã chẳng còn nhớ. Nhưng kẻ từng thề nguyện, đến nay vẫn chưa dám quên."* |
| **Mốc xuất hiện** | `V01 — First Meeting` (`campfire_knight_intro`) hoặc `V02 — Growing Recognition` (`campfire_knight_comrade_bond`). |
| **Điều kiện hiển thị** | Tiếp cận Trạm Lửa Rừng Tĩnh Lặng (`outer_woods`, `x: 1435, y: 710`) ở lần gặp đầu hoặc khi hỏi `[Hỏi về lời thề]`. |
| **Trạng thái ký ức** | `Memory Stage 0–1` (`0%` spoil danh tính). |
| **Người tham gia hội thoại** | `Sir Vaelen — Kỵ Sĩ Trầm Mặc` (`portrait_campfire_knight`) ↔ `Lữ Khách Rêu Phong`. |
| **Phản hồi lựa chọn (`DLG-P03 / DLG-P04` — Table 04 & 17)** | - **Choice 1 (`DLG-P03`):** `"[Hỏi về ký ức] \"Ta có quen ngươi sao?\""` → *"Dáng đứng ấy không thay đổi. Nhưng ta sẽ không bắt ngươi nhớ điều chưa thể nhớ. Hãy nghỉ một lát."* (`lore_curious_black_knight`, `+2` once-guarded)<br>- **Choice 2 (`DLG-P04`):** `"[Hỏi lời thề] \"Nếu từng hứa với ngươi, ta muốn biết lời thề ấy.\""` → *"Bảo vệ những người không thể tự bảo vệ mình. Đó là điều người thầy của ta đã dạy."* (`+3` once-guarded)<br>- **Choice 3:** Giữ nhánh ngồi im bên lửa (`wayfarer_silent_fire_watcher`, `+1`). |
| **Hành động / Animation hiện có phù hợp** | NPC `npc_campfire_knight` quỳ giữ lửa (`campfire_knight_idle_sheet` / `campfire_knight_pray_sheet`), kèm BGM `knights_quiet_fire.mp3` & tương tác nghỉ trạm lửa; **không** tạo animation mới. |
| **Trạng thái phê duyệt** | **`DRAFT — PENDING OWNER APPROVAL`** |

---

### B. `DLG-012` — Sir Mordric (*Bài học không khuất phục trước bóng tối*)

| Mục đặc tả | Chi tiết |
|---|---|
| **Nguyên văn tham chiếu (`DIALOGUE_REGISTRY.md`)** | *"Năm ấy, ngài dạy ta không được khuất phục trước bóng tối…"* |
| **Bản điều chỉnh cho gameplay (`DRAFT`)** | Tích hợp vào `hooded_knight_encounter_intro` khi `HoodedKnightBoss` nhận ra dấu ấn trên giáp/vết chém bao kiếm, ghép nối liền với `DLG-013`:<br>*"Dấu ấn ấy… Vết chém chéo trên vỏ kiếm kia… Năm ấy, ngài dạy ta không được khuất phục trước bóng tối…"* |
| **Mốc xuất hiện** | Chạm trán `HoodedKnightBoss` (`EvilKnights.ts:815`, `distToPlayer <= 220`). |
| **Điều kiện hiển thị** | `!hasRecognizedCommander`; kích hoạt trước combat phase của boss tại rìa `deep_forest`. |
| **Trạng thái ký ức** | `Memory Stage 1–2` (khi `dist <= 220`, code hiện hành đẩy tối thiểu lên Stage `2` — **không** tự tiết lộ tên thật `Meliodas`). |
| **Người tham gia hội thoại** | `Kỵ Sĩ Trùm Mũ (Sir Mordric)` (`portrait_hooded_knight`) ↔ `Lữ Khách Rêu Phong`. |
| **Phản hồi lựa chọn (`DLG-P05 / DLG-P06` + choices an toàn)** | - **Choice 1 (`DLG-P05`):** `"[Lắng nghe] \"Ta không nhớ ngày ấy. Nhưng ta muốn nghe ngươi.\""` → *"Ngài không nhớ… còn ta đã mang theo từng lời thề qua những mùa sương."* (`+2` once-guarded)<br>- **Choice 2 (`DLG-P06`):** `"[Thề bảo vệ] \"Ta không thể thay đổi quá khứ, nhưng sẽ bảo vệ Bellhollow.\""` → *"Vậy hãy cho ta thấy lời thề ấy còn có ý nghĩa."* (`+2` once-guarded) |
| **Hành động / Animation hiện có phù hợp** | `HoodedKnightBoss` chuyển trạng thái `'stagger'` (`2200ms`, animation `hooded_knight_stagger`, event `hooded_knight_commander_recognition`); **không** tạo animation hay phase mới. |
| **Trạng thái phê duyệt** | **`DRAFT — PENDING OWNER APPROVAL`** |

---

### C. `DLG-013` — Sir Mordric (*Nỗi oán vì sự vắng mặt — không quy kết cố ý bỏ rơi*)

| Mục đặc tả | Chi tiết |
|---|---|
| **Nguyên văn tham chiếu (`DIALOGUE_REGISTRY.md`)** | *"Vậy mà khi bóng tối tìm đến, ngài lại chẳng còn ở đó."* |
| **Bản điều chỉnh cho gameplay (`DRAFT`)** | Nối ngay sau `DLG-012` trong `hooded_knight_encounter_intro` hoặc câu mở đầu `hooded_knight_encounter_defeat`, đảm bảo **không** kết tội Meliodas cố ý bỏ rơi và **không** tự bịa nguyên nhân tha hóa:<br>*"Vậy mà khi bóng tối tràn tới, ngài lại chẳng còn ở đó… Để lại chúng ta giữ một lời thề chẳng biết còn nghĩa lý gì nữa!"* |
| **Mốc xuất hiện** | Nối tiếp `DLG-012` ở `hooded_knight_encounter_intro` (hoặc đầu `hooded_knight_encounter_defeat`). |
| **Điều kiện hiển thị** | Giống `DLG-012` hoặc khi `boss_hooded_knight_defeated` mở hộp thoại kết thúc encounter. |
| **Trạng thái ký ức** | `Memory Stage 2` (tại encounter) hoặc `Stage 2–3` (sau defeat). |
| **Người tham gia hội thoại** | `Sir Mordric — Kỵ Sĩ Bóng Tối` (`portrait_hooded_knight`) ↔ `Lữ Khách Rêu Phong`. |
| **Phản hồi lựa chọn** | Hội tụ về hai lựa chọn giải vây sương (`choice_hooded_knight_resolve` / `choice_hooded_knight_plea` hoặc `DLG-P05/P06`), tiếp nối trận đấu bình thường hoặc kết thúc encounter `quest_corrupted_crest`. Nếu có nhánh có điều kiện (`Table 17`: *"Ta đã nghe rừng cầu cứu..."*) chỉ mở sau khi `A06` có đủ manh mối + Owner duyệt. |
| **Hành động / Animation hiện có phù hợp** | Chuyển từ `hooded_knight_stagger` sang vòng lặp chiến đấu hiện hành (`hooded_knight_idle` / `hooded_knight_powerup` / `hooded_knight_attack`) không thay đổi combat. |
| **Trạng thái phê duyệt** | **`DRAFT — PENDING OWNER APPROVAL`** |

---

### D. `DLG-014` & `DLG-015` — Sir Vaelen (*Cảnh hội thoại đối chiếu — giữ nguyên Vaelen không làm companion*)

| Mục đặc tả | `DLG-014` (Vaelen → Nhân vật chính) | `DLG-015` (Vaelen → Mordric / Kể lại tại Trạm Lửa) |
|---|---|---|
| **Nguyên văn tham chiếu (`DIALOGUE_REGISTRY.md`)** | *"Ngài có thể đã quên… nhưng ta thì chưa."* | *"Ta cũng từng chờ đợi như ngươi… nhưng chưa bao giờ từ bỏ lời thề."* |
| **Bản điều chỉnh cho gameplay (`DRAFT`)** | Dùng khi Vaelen nhận ra khí chất/Hắc Lang ở `V04 — Q05 Recognition` (`vaelen_examine_crest_and_seek_mold`) hoặc `campfire_knight_q3_complete`:<br>*"Ngài có thể đã quên dấu ấn trên quân huy này… nhưng ta thì chưa."* | Vì **Vaelen không làm companion theo `DEC-LOCK-11`** (giữ chốt `outer_woods`), câu này được đặt làm câu đối đáp hồi tưởng của Vaelen khi nghe về cuộc chạm trán Sir Mordric (ở `campfire_knight_q3_complete` hoặc hồi thoại tùy chọn về bạn cũ — hoặc chờ cảnh sự kiện được Owner duyệt ở `A10`):<br>*"Nếu gặp lại Mordric… xin chuyển giúp ta một lời: Ta cũng từng chờ đợi như hắn… nhưng chưa bao giờ từ bỏ lời thề."* |
| **Mốc xuất hiện** | `V04 — Q05 Recognition` / `SQ08 q3_complete` | Sau `campfire_knight_q2_complete` hoặc `campfire_knight_q3_complete` |
| **Điều kiện hiển thị** | `hasCrest` (`quest_corrupted_crest` > 0) tại Trạm Lửa | `campfire_knight_q2_completed` hoặc `boss_hooded_knight_defeated` |
| **Trạng thái ký ức** | `Memory Stage 1–3` (không ép reveal tên thật trước cổng `A06`) | `Memory Stage 2–3` |
| **Người tham gia hội thoại** | `Sir Vaelen` ↔ Nhân vật chính | `Sir Vaelen` ↔ Nhân vật chính (nhắc tới `Sir Mordric`) |
| **Phản hồi lựa chọn** | Tiếp nhận chế tạo `Chìa Khóa Thanh Tẩy` (`Q05`) hoặc nhận `eqp_bell_ward_charm` (`SQ08`) | `[Ghi nhận]` / `[Trầm mặc]` giữ nguyên trust once-guarded |
| **Hành động / Animation hiện có phù hợp** | `campfire_knight_pray_sheet` / `campfire_knight_idle_sheet` tại đốm lửa `outer_woods`; **tuyệt đối không cho Vaelen rời trạm lửa làm companion**. | Như bên trái; giữ nguyên cấu trúc event hiện hành cho tới khi `A10` chốt Event Registry. |
| **Trạng thái phê duyệt** | **`DRAFT — PENDING OWNER APPROVAL`** | **`DRAFT — PENDING OWNER APPROVAL`** |

---

## 2. Reveal & Choice Matrix (`§6` — Tách Rõ `NPC Recognition` / `Player Identity Reveal` / `Quest Completion`)

*(Ghi chú kỹ thuật `A04`: Hiện tại **`A06` chưa xây dựng bộ Evidence Resolver đầy đủ** nên `A04` áp dụng wording trung tính ở các nhánh `campfire_knight_q3_complete`, `campfire_knight_idle_talk`, `vaelen_examine_crest_and_seek_mold`, `hooded_knight_encounter_defeat`, và popup `GameScene:4849` để chặn hoàn toàn việc lộ tên thật trái điều kiện).*

| Memory Stage | Evidence (`Huy hiệu / Kỷ vật / Lời thề`) | `SQ08` | `Q05` | `NPC RECOGNITION` (Vaelen / Mordric) | `PLAYER IDENTITY REVEAL` (Cho người chơi) | `QUEST COMPLETION` | Đánh giá rủi ro spoil (`Post-A04`) |
| :---: | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **`0`** | Không | Chưa | Chưa | **Chưa nhận ra:** Vaelen thấy quen thoáng qua (`V01`), giữ khoảng cách. | **Không reveal (`0%`):** HUD = `Lữ Khách Rêu Phong`. | `SQ06` có thể mở; `Q05` chưa tới. | **An toàn (0% spoil)** — Đã kiểm chứng `A04-T01`. |
| **`1`** | Chưa đủ (chỉ có Workshop/Q1) | Chưa / Đang làm | Chưa | **Manh mối mờ (`V02`):** Nhắc lời thề cũ & đoàn kỵ sĩ, không gọi tên thật. | **Chưa reveal:** Không nhắc `Meliodas`, chỉ mở `lore_memory_chapter_1..2`. | `SQ06` xong / `SQ07` mở (`V03`: biết bạn cũ `Sir Mordric`). | **An toàn** — `q2_complete` nhắc `Sir Mordric`, hết lỗi nhầm Tổng Chỉ Huy (`A04-T02`). |
| **`2`** | Có `crest` (`Silent Mire`) | **Chưa làm** | **Đã đến** | **Nhận ra ở Q05 (`V04`):** Vaelen nhận ra Quân Huy Hắc Lang & cảm giác quen thuộc (`vaelen_examine_crest_and_seek_mold`). | **Chưa reveal tên thật:** Dừng ở ẩn ý, không ép `SQ08`. | `Q05_SOLVE_MIRE` chạy bình thường không cần `SQ08` (`A04-T04`). | **An toàn** — Tách bạch `Q05` khỏi `SQ08`. |
| **`2`** | Chạm trán Mordric | Đang / Không nhận | Bất kỳ | **Mordric nhận ra dấu ấn (`intro`):** Thấy vết chém bao kiếm quen, nghi vấn *"Ngươi thực sự là ai?"*. | **Chưa reveal tên thật:** Mordric không tự gọi `"Chỉ Huy"` hay `"Meliodas"`. | Boss encounter kích hoạt; hạ gục rơi `quest_corrupted_crest`. | **An toàn** — Hết spoil ở intro (`A04-T05`). |
| **`2 → 3`** | Hạ Mordric / Có `crest` | Đã xong | Bất kỳ | **Mordric & Vaelen nhận ra dấu ấn Hắc Lang & bậc thầy cũ:** `hooded_knight_encounter_defeat` & `campfire_knight_q3_complete` xác nhận Quân Huy. | **TRUNG TÍNH HÓA TẠM THỜI (`A04`):** Bỏ chữ `Lord Meliodas Blackwood` khỏi `q3_complete`, `idle_talk` & popup `4849` cho tới khi `A06` hoàn tất Evidence Resolver (`A04-T03`). | `SQ08` xong -> `eqp_bell_ward_charm` + `boss_hooded_knight_defeated`. `Quest Completion ≠ Reveal`. | **An toàn (Chờ `A06/B07`)** — Hết spoil tên thật khi thiếu resolver. |
| **`3`** | **Đủ Stage 3 + Chứng cứ** *(tại A06)* | Có / Không | Đã đến / Xong | Vaelen & làng Bellhollow xác nhận danh tính sau cổng. | **Reveal đầy đủ (`V05` — Chờ `A06`):** `UIScene` / `Journal` / `Ending` mở `Meliodas Blackwood — The Wolf Lord`. | Main quest `Q05→Q06` độc lập với `SQ08`. | **Giới hạn đã báo rõ:** Cần `A06/B07` cho Evidence Resolver chuẩn xác 100%. |
