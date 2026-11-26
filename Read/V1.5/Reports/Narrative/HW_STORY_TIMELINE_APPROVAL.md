# HW-NR-01 — STORY TIMELINE APPROVAL (`PHÊ DUYỆT BA DÒNG THỜI GIAN`)

- **Mission ID:** `HW-NR-01 — MASTER CANON LOCK`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Primary Sources:** `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` (`Ch. 04`, `Table 14`, `Table 15`), [MASTER_LORE_REGISTRY.md §3](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/MASTER_LORE_REGISTRY.md), [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md)
- **Nguyên tắc khóa thời gian:** Tuyệt đối tách bạch **(A) Lịch sử Thế giới**, **(B) Thứ tự Người chơi Khám phá**, và **(C) Thứ tự Kể chuyện Điện ảnh trong Trailer `V12.2`**. Không điền số năm hay thứ tự nhân quả chưa được Owner phê duyệt.

---

## 1. Timeline A — World Chronology (`Lịch Sử Thế Giới Từ Quá Khứ Đến Hiện Tại`)

*(Mọi mốc quá khứ trước `T0` giữ ký hiệu tương đối `T−?` cho tới khi Owner chốt `DEC-LOCK-02..05` [`OQ-02/03/08/09`]).*

| Mốc | Sự kiện trên trục thời gian | Trạng thái Canon Hiện Tại | Nguồn & Ràng buộc | Khoảng trống cần Owner duyệt |
| :---: | :--- | :---: | :--- | :--- |
| **`T−? (1)`** | **Meliodas Blackwood (`Lord Blackwood` / `The Wolf Lord`)** dìu dắt các kỵ sĩ *(gồm `Sir Vaelen` và `Sir Mordric`; hai người là bạn cũ)*. | `CANON-APPROVED` *(tên & danh hiệu NVC)* · **`PROPOSED`** *(vai trò Người Thầy & tình bạn)* | `Ch. 03`, `Ch. 05`, `Table 14` | `OQ-01` (còn giữ chức Chỉ Huy không?), `OQ-05`, `OQ-K04` (`Roderick/Aldemar`?), `OQ-K06` (`Order of the Black Wolf`?). |
| **`T−? (2)`** | Đoàn kỵ sĩ từng bảo hộ phòng tuyến Bellhollow; Vaelen nhận nhiệm vụ ở lại giữ ngọn lửa trạm ngoài rừng (`campfire_knight_comrade_bond`). | **`GAME-IMPLEMENTED`** *(Baseline giữ lửa)* · `CONFLICT` với `OQ-01` về chức danh *Chỉ Huy* | `dialogues.json` | Ràng buộc với `OQ-01` & `OQ-05`. |
| **`T−? (3)`** | Meliodas nghe thấy **lời thì thầm như lời cầu cứu từ rừng già** và bước theo vào rừng sâu. | **`PROPOSED`** · **`CONFLICT C05`** với Baseline chuông/Listener | `Ch. 03`, `NAR-001/024` | **`OQ-02` (`DEC-LOCK-03`):** Tác nhân tiếng gọi là ai? **`OQ-09` (`DEC-LOCK-05`):** Xảy ra trước hay sau đêm chuông nứt? |
| **`T−? (4)`** | Màn sương `The Veil` tràn tới; vị Giữ Chuông tiền nhiệm gióng **7 hồi chuông** khiến **Đại Hồng Chung** rạn nứt; **Lưỡi Chuông Đồng (`Clapper`)** rơi xuống đầm lầy; `Mire Warden` gắn với 3 trụ phong ấn. | **`GAME-IMPLEMENTED` (Baseline Giữ Lại)** | `edda_bell_shatter_secret`, `lore_clapper_curse`, `lore_mire_warden_memory` | Không tự mặc định sự kiện này xảy ra trước hay sau khi Meliodas rời đi (`OQ-09`). |
| **`T−? (5)`** | Một **biến cố bí ẩn** khiến Meliodas đánh mất ký ức và xuất hiện ở thời điểm tương lai tại Bellhollow. *(Đang xung đột với lời giải cũ *"tự phong ấn ký ức bằng `Algiz` để tái sinh"*).* | **`PROPOSED`** vs **`CONFLICT C01`** | `Ch. 03`, `NAR-003`, `C01` | **`OQ-03` (`DEC-LOCK-02`):** Chọn PA 1, PA 2 hay PA 3 để giải quyết mâu thuẫn `Algiz`. |
| **`Khoảng trống`** | **Quãng thời gian thất lạc:** Không khóa số năm; Vaelen vẫn giữ lời thề bên lửa trại; Kỵ Sĩ Bóng Tối xa cách / oán trách người thầy vắng mặt khi bóng tối ập tới. | **`WIP` / `UNKNOWN`** *(Số năm)* · **`PROPOSED` / `TRAILER-ONLY`** *(oán trách)* | `Ch. 03`, `DLG-012–015`, `EndingSystem:78` | **`OQ-08` (`DEC-LOCK-04`):** Bỏ chữ *"hàng trăm năm"* hay giải thích cơ chế tuổi thọ/xuyên thời gian? |
| **`T0`** | Nhân vật chính tỉnh lại tại **`Fog Crossing`** trong trạng thái mất hết ký ức, tay giữ ánh sáng **Vòng Sáng Hộ Tâm `[F]`** và bắt đầu hành trình tới Bellhollow. | **`GAME-IMPLEMENTED`** (`startAct0Intro`) · **`PROPOSED`** (`Prologue 28s` `CS01–06`) | `GameScene:1393`, `Ch. 09` | **`OQ-19` (`DEC-LOCK-20`):** Chốt phương án chạy Opening `28s` (`PA A/B/C/D`). |
| **`T+?`** | Gặp Garth, Edda, dân làng; gặp Sir Vaelen bên lửa trại; tìm Khuôn Đúc (`D`) & Cổ Ngữ (`F`); gặp lại các kỵ sĩ (`OQ-04/15`); hạ `Mire Warden` tại `broken_bell_shrine`; gióng **`The First Toll`** & định đoạt Ending. | **`GAME-IMPLEMENTED`** (Main Route `A→E→B→D→F→E→C→A` & `3` Endings) | `quests.json`, `EndingSystem.ts` | `OQ-04/14/15/18` (`Hooded = Mordric`? Optional vs Mandatory? Số phận sau encounter?). |

---

## 2. Timeline B — Player Discovery Curve (`Thứ Tự Người Chơi Tiếp Nhận Thông Tin D0 → D7`)

*(Mục tiêu cốt lõi: Chống lộ sớm tên `Meliodas`, danh hiệu `Wolf Lord` / `Chỉ Huy` và chân tướng biến cố; giữ vững tính trinh thám của HOLLOW WOODS).*

| Chặng | Địa điểm / Nhiệm vụ | Thông tin ĐƯỢC PHÉP hé lộ cho Người chơi | Thông tin CẤM TIẾT LỘ SỚM (`Anti-Spoiler`) | Tàn dư cần dọn trước khi đạt chuẩn |
| :---: | :--- | :--- | :--- | :--- |
| **`D0`** | **Main Menu / Preload / Opening `28s` / `fog_crossing` (`Act 0`)** | Sự tồn tại của sương `The Veil`, ánh sáng **Hộ Tâm `[F]`**, bóng lưng *người thầy + hai kỵ sĩ vô danh*, tín hiệu dẫn tới Bellhollow. | Tên **`Meliodas`**, họ `Blackwood`, `Wolf Lord`, chữ **`Chỉ Huy Hiệp Sĩ Đen`**, tên hai học trò, lời giải `Algiz`/thời gian. | **`MainMenuScene.ts:797`** đang spoil trắng `"Chỉ huy Hiệp Sĩ Đen"`; `PreloadScene:302` subtitle (`OQ-17`). |
| **`D1`** | **`Bellhollow` (Garth & Edda — `Q01/Q02`)** | `3` Quy Tắc sống sót (`The Listener`, đèn thứ 2, rung chuông); câu chuyện nứt Đại Hồng Chung & Clapper; ánh nhìn quen của Edda (`DLG-006/007` nếu duyệt). | Nguồn gốc thật của tiếng cầu cứu (`OQ-02`), danh tính thật của NVC. | `edda_black_knight_reverence` còn chữ *"trăm năm"*. |
| **`D2`** | **`Bellhollow` (Neris, Bram, Finn — `Q03`, `SQ01/03/09`)** | Chứng quên do sương (*Hội Chứng Trắng Não*), hợp kim chuông, tin đồn giếng nước, câu chuyện anh em Garth–Elian (`SQ09`). | Không biến chẩn đoán của Neris thành lời giải duy nhất cho biến cố NVC. | Bảo toàn tách biệt `Elian ≠ Mordric`. |
| **`D3`** | **`silent_mire` & `outer_woods` (Vaelen — `Stage 2`, `SQ06`)** | Phong Ấn Rễ Cổ, dấu vết huy hiệu gắn quá khứ; Vaelen cảm thấy dáng đứng quen & chia sẻ về *lời thề chưa dám quên* (`DLG-009`). | Chưa gọi thẳng `Meliodas`, chưa khẳng định `Hooded` là người thầy/Chỉ Huy (`C02`). | Cần xử lý mâu thuẫn `Vaelen q2_complete` (`OQ-06`) và thêm *trust guard* (`I-03`). |
| **`D4`** | **`sub_bell_workshop` & `deep_forest` (`Stage 3–4`)** | Khuôn Đúc Đồng Cổ, Cổ Ngữ Khai Mở, mảnh nhật ký & văn bia cổ (`12` kỵ sĩ) hé lộ từng mảnh quá khứ từ **nhiều góc nhìn chưa thống nhất**. | Không được tự mở `lore_wayfarer_inner_journal` hay popup *"tàn ảnh Hiệp Sĩ Đen!"* quá sớm ở Stage 1. | **`GameScene:4292,4382`**, **`PlayerState:610–622, 764`**, **`lore.json:85` (`Sir Valen`)**, `tornPagesData.ts:249–318`. |
| **`D5`** | **Tuyến Kỵ Sĩ (`Hooded / Mordric`, `SQ08` — Optional theo `OQ-15`)** | Cuộc chạm trán cá nhân hóa (`"Năm ấy, ngài dạy ta..."` nếu duyệt `OQ-04/17`): hé lộ vết rạn niềm tin giữa người thầy và học trò cũ. | Không tự bật đoạn *"tự phong ấn `Algiz` để tái sinh"* (`OQ-03`) hay ép biến thành chặn đường bắt buộc. | **`EvilKnights.ts:833,839`**, **`PlayerState:930`**, `GameScene:802–814`, `dialogues.json`. |
| **`D6`** | **Hội tụ Ký Ức (`Stage 3` Vaelen / Huy hiệu)** | Đối chiếu đầy đủ bằng chứng (Hộ Tâm + Huy hiệu + Lời thề); **Vaelen xác nhận thân phận** và mở khóa chính thức định danh **`Meliodas Blackwood` (`Lord Blackwood` / `The Wolf Lord`)** *(nếu Owner chốt mốc `D6` ở `OQ-20`)*. | Không tự bịa mốc số năm hay giải thích vượt quá phần đã ký duyệt ở `DEC-LOCK-02/04`. | **`GameScene:4849`**, **`UIScene:1063`**, **`JournalModal:909`**. |
| **`D7`** | **`broken_bell_shrine` (`Mire Warden`) → `The First Toll` & Ending** | Hạ `Mire Warden`, mang Clapper về gióng `First Toll`, giải thoát Bellhollow với tư cách **`Meliodas Blackwood`** (khi `stage >= 3`), phân nhánh 3 kết thúc theo `comp/stage/trust`. | **LOẠI BỎ** cảnh ô tô/quốc lộ **`Satyr:`** (`EndingSystem:1037`), sửa chữ *"hàng trăm năm"*. | **`EndingSystem.ts:64–120, 1037`**, **`lore_ending_*`**. |

---

## 3. Timeline C — Trailer `V12.2` Structure (`TRAILER-ONLY` — Tham Chiếu Điện Ảnh)

- **Nguồn thực tế kiểm chứng tại `00E`:** [HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4](file:///G:/HOLLOW%20WOODS/HW/Trailer/Video%20Game%20Trailer/v12/HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4) (`70.00s`, `3840×2160 @ 59.97fps`, audio `-18.0 LUFS` / `LRA 12.1 LU`):
  - `00–10s`: Kyoshiro Studio Intro (`White Wolf + DualSense + Sumi-e Seal`)
  - `10–14s`: `Fog Crossing` (`DLG-001` bản V9 vẫn dùng *"anh"* & *"tiếng chuông"*)
  - `14–24s`: `Bellhollow` + `Edda` (`DLG-006`, `DLG-007`, giảm chuông `-5.9 dB`)
  - `24–33s`: `Outer Woods` (`Sir Vaelen` bên lửa — `DLG-009`)
  - `33–37s`: `The Veil` & `Vòng Sáng Hộ Tâm` (`DLG-011`)
  - `37–44s`: `Mire Warden`
  - `44–51s`: `Satyr — Bóng Ma Trong Sương`
  - `51–65s`: Cảnh hang `Dark Knight` (`DLG-012`), `Knight_2/3`, & `Sir Vaelen` tiến vào (`DLG-014–015`)
  - `65–70s`: `Title Reveal — KHU RỪNG ĐANG DÕI THEO` (`DLG-031–034`, đã bỏ chuông cuối).
- **Quy tắc ràng buộc:** Timeline C là **dàn cảnh dựng trailer (`TRAILER-ONLY`)**, tuyệt đối **KHÔNG** dùng nguyên trình tự `Mire → Satyr → Dark Knight` hay ghép nguyên video `70s` vào dòng thời gian lịch sử hoặc ép thành Main Route của game nếu chưa có quyết định `DEC-LOCK-16` (`OQ-15`).

---

## 4. Xác Nhận Ký Duyệt Timeline Của Owner

- `[ ]` **Phê duyệt cấu trúc phân tách 3 Timeline (A: World / B: Discovery D0–D7 / C: Trailer Reference)** làm khung chuẩn cho `HW-NR-03+`.
- `[ ]` **Mốc Reveal tên `Meliodas Blackwood`:** `[ ] Tại D6 (Stage 3 + Vaelen)` · `[ ] Tại D7 (First Toll / Ending)` · `[ ] Khác: ____`.
- **Ghi chú / Chỉnh sửa thêm của Owner:** `________________________________________`
