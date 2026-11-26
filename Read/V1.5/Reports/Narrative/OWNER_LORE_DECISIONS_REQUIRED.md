# HOLLOW WOODS — OWNER LORE DECISIONS REQUIRED (`OQ-01–20`)

- **Mission:** `HW-NARRATIVE-00B — LORE, CHARACTER & CANON REGISTRY`
- **Primary References:**
  - `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`: `Ch. 15` (`Quyết định A–F`), `Ch. 16` (`15 câu hỏi ưu tiên`), `Ch. 17` (`NARRATIVE OPEN QUESTIONS` `Table 20`: `OQ-01–20` & thứ tự bàn giao §3)
- **Mục đích:** Danh sách các quyết định bắt buộc cần **Owner** chốt trước khi đội ngũ chuyển sang giai đoạn viết lại lore, hội thoại, kịch bản reveal hoặc triển khai mã nguồn (`00C+` / `NA-01+`).

---

## 1. Nhóm P0 — Câu Hỏi Khóa Trục Cốt Truyện & Xung Đột (`OQ-01` – `OQ-09`)

*(Phải chốt trước khi sửa bất kỳ `lore.json`, `dialogues.json`, `MainMenuScene.ts` hay `EndingSystem.ts` nào).*

| Open ID | Câu hỏi Owner cần quyết định | Liên quan (`NAR` / `CONFLICT`) | Phương án an toàn giữ hiện tại trong khi chưa chốt |
| :--- | :--- | :--- | :--- |
| **`OQ-01`** | NVC (`Meliodas`) là **Người Thầy** đồng thời vẫn là **Chỉ Huy Đoàn Kỵ Sĩ**, hay chức danh Chỉ Huy sẽ đổi/bỏ? | `NAR-002/005`, `CH-01`, `C04` | Giữ chức Chỉ Huy ở runtime baseline; chưa gọi `Chỉ Huy` hay `Meliodas` trong draft mở đầu. |
| **`OQ-02`** | **Bản chất lời cầu cứu từ rừng già:** Do chính khu rừng, `The Veil`, `The Listener`, `The Echo`, thực thể khác, hay cố ý để bí ẩn suốt game? | `NAR-001/024/026`, **`C05`** | Chỉ mô tả *"lời thì thầm giống lời cầu cứu"* — không khẳng định giống hay khác `Listener`/`Echo`. |
| **`OQ-03`** | **Nguyên nhân mất ký ức:** Bỏ hoàn toàn twist *"tự phong ấn ký ức/Algiz/tái sinh"* cũ, giữ một phần, hay xem nó như lời kể/giả thuyết chưa chắc chắn của nhân chứng? | `NAR-003`, `DLG-025–027`, **`C01`** | Không chốt cơ chế mất ký ức; không viết hai lời giải trái nhau như hai sự thật đồng thời. |
| **`OQ-04`** | **`Sir Mordric` (`Dark Knight`) có chính là `HoodedKnightBoss` trong game**, hay là một boss/nhân vật riêng biệt (chỉ dùng chung sprite trong trailer)? | `NAR-014`, `CH-04/05`, **`C03`** | Không đổi entity ID `HoodedKnightBoss`, không gán tên `Mordric` vào `EvilKnights.ts` hoặc `SQ08`. |
| **`OQ-05`** | **Quá khứ, danh xưng & tình bạn giữa `Mordric` và `Vaelen`:** Mức độ xác nhận chính thức là gì? Có đặt tên thật/họ hay bổ sung tiểu sử riêng cho họ không? | `NAR-006/016/025`, `CH-03/04` | Giữ `Sir Mordric` & `Sir Vaelen` ở mức hướng bạn cũ `PROPOSED`; cấm gán Dark = `Elian` hay `Fallen Knight`. |
| **`OQ-06`** | **Xử lý mâu thuẫn lời thoại `Vaelen q2 vs q3`:** Vì sao `q2` tin Hooded là Chỉ Huy rồi `q3` lại nhận NVC? Sửa lại `q2`, hay thiết kế thành hiểu lầm có chủ ý? | `NAR-010`, `I-02`, **`C02`** | Đánh dấu `CONFLICT`, giữ nguyên `q2/q3` trong source, không tự diễn giải là Vaelen nói dối. |
| **`OQ-07`** | **Hai thuộc hạ `Knight_2 / Knight_3` trong cảnh hang trailer:** Họ là ai? Có liên hệ với `Fallen Knight`, `Dread Horseman`, hoặc là `Roderick / Aldemar` không? | `NAR-018`, `CH-06` | Chỉ ghi nhận vai trò thuộc hạ điện ảnh; cấm gán tên `Roderick`, `Aldemar` hay `Elian`. |
| **`OQ-08`** | **Khoảng thời gian & cơ chế xuyên thời gian:** Bao nhiêu thời gian đã trôi qua? NVC tới tương lai bằng dịch chuyển, vòng lặp hay cơ chế nào? Vaelen/dân làng sống qua quãng thời gian đó ra sao? Xác nhận *"Làng Sương Mù"* có chính là Bellhollow không? | `NAR-004`, `I-06` | Không chọn số năm cụ thể (tránh xung đột chữ *"hàng trăm năm"* trong ending cũ); không tự giải thích cơ chế sống lâu. |
| **`OQ-09`** | **Thứ tự biến cố quá khứ:** Lời cầu cứu & việc Meliodas rời đi xảy ra trước hay sau đêm `7` hồi chuông làm nứt Đại Hồng Chung? Mối liên hệ giữa `7` hồi chuông cũ và `First Toll` mới là gì? | `NAR-001/003/024`, `Table 14` | Giữ khoảng trống tương đối `T−?` trong Timeline A, không tự nối nhân quả. |

---

## 2. Nhóm P1 — Nhân Vật Mới, Khẩu Hiệu, Hội Thoại & Vị Trí Boss (`OQ-10` – `OQ-17` + Tổ Chức)

| Open ID | Câu hỏi Owner cần quyết định | Liên quan | Phương án an toàn hiện tại |
| :--- | :--- | :--- | :--- |
| **`OQ-K06` *(Bổ sung §3)*** | Có chốt tên **`Order of the Black Wolf` (`Đoàn Kỵ Sĩ Hắc Lang`)**, huy hiệu sói, và khẩu hiệu **`Fides Ultra Tenebras`** làm Canon chính thức không? | `NAR-K06`, `Ch. 06` | Giữ nguyên trạng thái **`PROPOSED`**, chưa in lên UI/lore. |
| **`OQ-K04` *(Ch. 16 #7,#9)*** | **Tiểu sử chi tiết của `Sir Roderick`, `Sir Aldemar` & `The Headless Warden`:** Có phải học trò trực tiếp của Meliodas? Vị trí zone, câu chuyện và mối liên hệ với `Dread Horseman` / `Bia 12 kỵ sĩ`? | `CHAR-004–006`, `Ch. 16` | Giữ tách biệt toàn bộ; không khóa vào tuyến chính. |
| **`OQ-10`** | **Bà Edda:** Edda thực sự nhận ra NVC ở mức độ nào, sống ở thời đại nào, và vì sao chưa nói thẳng danh tính? | `NAR-007`, `CH-02` | Giữ 2 thẻ thoại `DLG-006–007` ở mức `TRAILER-ONLY` gợi mở. |
| **`OQ-11`** | **Thời điểm `Vaelen` nhận ra NVC:** Ngay lần đầu tại lửa trại, khi xem huy hiệu ở `Q05`, hay chỉ ở cảnh hang? Có cho phép quỳ/gọi `"ngài"` ngay lần đầu gặp không? | `NAR-009/010/017` | Giữ cơ chế nhận diện muộn ở `stage 3` theo baseline để tránh spoil sớm. |
| **`OQ-12`** | **Dấu hiệu giúp `Dark Knight` nhận ra thầy:** Qua bộ giáp, đường kiếm, Vòng Sáng Hộ Tâm, huy hiệu hay ký ức riêng? | `NAR-015` | Không chốt dấu hiệu duy nhất trong văn bản. |
| **`OQ-13`** | **`Satyr`:** Đây là mini-boss/quái vật mới thực sự đưa vào game, biểu tượng tâm lý, hay hiện thân khác? Tên chính thức & quan hệ với NVC? | `NAR-013`, `CH-15` | Giữ `TRAILER-ONLY`; tuyệt đối không tái dùng key legacy `lore_satyr_journal`. |
| **`OQ-14`** | **Số phận cuối cùng của `Mordric / Hooded` và `Vaelen`:** Hòa giải, rời đi, hy sinh, ở lại trạm lửa hay để mở? *(Quyết định `B` trong Ch. 15)*. | `NAR-016/021` | Giữ logic defeat/quest hiện hành; không tự viết thoại kết cục. |
| **`OQ-15`** | **Thứ tự & vị trí gặp boss:** Có áp thứ tự trailer `Mire → Satyr → Dark` (vd. dời tới `veil_origin_cavern` sau Mire Warden) vào game không? Encounter Dark Knight là **optional (`SQ08`) hay mandatory**? *(Quyết định `C` trong Ch. 15)*. | `NAR-019`, `I-05` | Bảo toàn main route `A→E→B→D→F→E→C→A` và `SQ08` hiện hành. |
| **`OQ-16`** | **Vai trò hỗ trợ của `Vaelen`:** Chỉ xuất hiện trong cutscene/ký ức ở hang hay thực sự thành companion gameplay? Có giữ nguyên vị trí NPC trạm lửa không? *(Quyết định `D` trong Ch. 15)*. | `NAR-017`, `I-05` | Không di chuyển hay teleport NPC đang giữ quest khỏi `(1470, 710)`. |
| **`OQ-17`** | **Lời thoại & Branding đưa vào game:** Duyệt nguyên văn câu nào từ `DLG-006–015` (Edda/Vaelen/Dark) và `DLG-030–034` (Title *"Khu rừng đang dõi theo"* vs *"The Fog That Remembers"*)? Có sửa 3 quy tắc của Edda không? | `DLG-006–015/030–034`, `NAR-020` | Giữ `dialogues.json` và menu branding baseline; chờ duyệt từng `DLG` ID. |

---

## 3. Nhóm P2 — Phân Nhánh Gameplay, Mở Đầu & Tư Liệu Đối Chiếu (`OQ-18` – `OQ-20`)

| Open ID | Câu hỏi Owner cần quyết định | Liên quan | Phương án an toàn hiện tại |
| :--- | :--- | :--- | :--- |
| **`OQ-18`** | **Mức độ phân nhánh lựa chọn & Ending:** Các lựa chọn mới (`DLG-P01–P06`) chỉ đổi lời đáp/trust (có chống farm) hay tác động quest & văn bản 3 Ending? Có giữ nguyên ngưỡng `composure≥50, stage≥3, trust≥65` và Save Schema `3` không? | `NAR-021/022`, `Table 07`, `I-03/06/07` | Giữ nguyên `determineEndingType`, `3` ending IDs, và Save Schema `3`. |
| **`OQ-19`** | **Cutscene Mở Đầu (Prologue):** Chọn hình thức **in-engine, video 1080p, 6 ảnh tĩnh keyframe (`CS01–06`) hay hybrid**? Thời lượng (`28s`?) và mức độ cho phép hé lộ ở mở đầu? *(Quyết định `E` trong Ch. 15)*. | `NAR-023`, `Table 05`, `CIN-K13` | `CS01–06` chỉ là storyboard đề xuất; giữ nguyên Act 0 checkpoint `Fog Crossing`. |
| **`OQ-20`** | **Bổ sung tư liệu nguồn còn thiếu & Reveal Timeline:** (a) Có cung cấp thêm chat log `V1–V10 / V11.1–V11.6`, audio stems `V12.2` và MP4 `V12.2` ("Ultra Master"?) để hoàn thiện kiểm định? (b) Sau khi chốt `OQ-01–09`, duyệt cụ thể **thời điểm reveal tên `Meliodas`** (`CONFLICT C04`) và danh sách file cần chặn spoiler (`MainMenuScene`, `Stage 1–2` `lore.json`, `tornPagesData.ts`). | `E7`, `C04`, `I-01` | Đánh dấu `UNKNOWN` các phần thiếu; giữ nguyên danh sách file chặn spoil ở trạng thái audit. |

---

## 4. Lộ Trình Khuyến Nghị Dành Cho Owner (`Ch. 17 Open Questions §3`)

1. **Bước 1:** Owner chốt trước **`OQ-01` đến `OQ-09`** (cộng thêm `Order of the Black Wolf` / `Fides Ultra Tenebras`) để mở khóa toàn bộ `CONFLICT C01–C05`.
2. **Bước 2:** Chốt danh sách `DLG` được phép đưa vào game (`OQ-17`) và ngưỡng spoil cho `Meliodas` (`OQ-20` / `C04`).
3. **Bước 3:** Chốt vai trò & thứ tự gặp `Mordric`, `Roderick`, `Aldemar`, `Headless Warden`, `Satyr` (`OQ-13–16`).
4. **Bước 4:** Ghi thành các phiếu `DEC-NAR-___` (theo mẫu ở [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md)) trước khi mở bất kỳ nhiệm vụ `HW-NARRATIVE-00C+` hoặc sửa `src/` nào.
