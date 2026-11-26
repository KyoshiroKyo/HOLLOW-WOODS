# HOLLOW WOODS — DIALOGUE REGISTRY (`59` LIVE KEYS vs `DLG-001–035` / `NAR-001–030`)

- **Mission:** `HW-NARRATIVE-00D` → Canon Status Synced by **`HW-V16-A01`** (`2026-11-26`)
- **Primary Sources Verified:**
  - `src/data/dialogues.json` (`995` lines, Root key `dialogues`, **`59/59` keys verified** — giữ baseline cho tới `HW-V16-A02..A05`)
  - `src/systems/DialogueSystem.ts` (`432` lines)
  - `src/scenes/GameScene.ts` (`7,404` lines), `src/scenes/MainMenuScene.ts` (`1,185` lines)
  - [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md), [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md), [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)

---

## 1. Phân Loại Trạng Thái Thoại & Đối Chiếu Quy Mô (`Post HW-V16-A01`)

| Nhóm thoại | Nguồn | Số lượng | Canon / Prep Status (`A01`) | Runtime Status & Ghi chú áp dụng |
| :--- | :--- | :---: | :--- | :--- |
| **Thoại Runtime Hiện Hành** | `src/data/dialogues.json` | **`59` keys** | `GAME-IMPLEMENTED` (Cần dọn tàn dư `DEC-LOCK-01..10`) | Chưa sửa trong `A01`; các điểm `C01–C04` (`campfire_knight_q2/q3`, `hooded_knight_*`, `edda_black_knight_reverence`) sẵn sàng cho **`A02` / `A04`**. |
| **Thoại Trailer V11.x–V12.2** | `Unified Ch. 08 & Ch. 17` (`DLG-006/007/009/012–015/031–034`) | `13` mục | **`APPROVED-FOR-PREPARATION`** (`DEC-LOCK-17`) | Chuẩn bị ngữ cảnh & điều kiện ở `A03–A05`; **cấm tích hợp nguyên văn hoặc đổi Menu subtitle/Branding khi chưa duyệt từng nhóm**. |
| **Thoại Dẫn Truyện V9 / Cũ** | `Unified Ch. 17` (`DLG-001–005/010–011/016–018/030`) | `11` mục | `SUPERSEDED` / `TRAILER-ONLY` | Tham chiếu lịch sử; lời dẫn Opening `CS01–CS06` chờ duyệt ở `A08` (`DEC-LOCK-20`). |
| **Nhánh Lựa Chọn Đề Xuất** | `Unified Ch. 08 Table 04 & Table 17` (`DLG-P01–P06`) | `6+` mục | **`CANON-APPROVED`** (Kiến trúc bán tuyến tính `DEC-LOCK-18`) | Chuẩn bị & triển khai parser + once-guard `trust`/`reward` ở `A05`; không tách thành tuyến nhiệm vụ chính mới. |
| **Thoại Chưa Có Văn Bản Mới** | `DLG-008/020–023/028/029` | `7` mục | `BASELINE PRESERVED` | Ba quy tắc Edda, Echo, Elian giữ baseline; `Fallen/Listener/Satyr` không có key thoại riêng (`Satyr` giữ `TRAILER-ONLY`). |

---

## 2. Nguyên Văn Lời Thoại Mới Được Ghi Nhận Trong Tài Liệu (`TRAILER-ONLY` / `PROPOSED`)

*(Giữ nguyên văn từng chữ từ `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` Ch. 08 & Ch. 17).*

### 2.1 Nguyên văn Trailer V11.7–V12.2 (`TRAILER-ONLY`, chưa duyệt đưa vào `dialogues.json`)
- **`DLG-006` (Edda → NVC, `16–20s`):** *"Có những chuyện người đời đã quên, nhưng năm tháng chưa từng xóa bỏ. Người đã đi qua làn sương. Nhưng những người ở lại, liệu đã bước qua được ngày ngươi rời đi?"*
- **`DLG-007` (Edda → NVC, `20–24s`):** *"Hãy lần theo tiếng gọi còn vương lại trong gió… rồi ngươi sẽ hiểu vì sao mình lại trở về nơi này."*
- **`DLG-009` (Sir Vaelen → NVC, `24–33s`):** *"Có những lời thề, người lập ra đã chẳng còn nhớ. Nhưng kẻ từng thề nguyện, đến nay vẫn chưa dám quên."*
- **`DLG-019` (Dẫn hang, `V11.x–V12.2`):** *"Tưởng rằng đã thoát khỏi màn sương, ngươi lại bước vào nơi quá khứ vẫn còn chờ đợi."*
- **`DLG-012` (Dark Knight → NVC, `51–65s`):** *"Năm ấy, ngài dạy ta không được khuất phục trước bóng tối…"*
- **`DLG-013` (Dark Knight → NVC, `51–65s`):** *"Vậy mà khi bóng tối tìm đến, ngài lại chẳng còn ở đó."*
- **`DLG-014` (Sir Vaelen → NVC, `51–65s`):** *"Ngài có thể đã quên… nhưng ta thì chưa."*
- **`DLG-015` (Sir Vaelen → Dark Knight, `51–65s`):** *"Ta cũng từng chờ đợi như ngươi… nhưng chưa bao giờ từ bỏ lời thề."*
- **`DLG-031–034` (Title Reveal, `65–70s`):**
  - `HOLLOW WOODS — KHU RỪNG ĐANG DÕI THEO`
  - *"Khu rừng vẫn nhớ những gì ngươi đã quên."*
  - *"QUÁ KHỨ KHÔNG BAO GIỜ LÃNG QUÊN. Nó chỉ đứng yên trong sương, chờ ngày ngươi đủ can đảm gọi tên."*
  - *"Ngươi ngỡ mình đang đi tìm đường trở về, nào hay đã trở về từ lâu."*
  - Footer: `SINH TỒN · KINH DỊ TÂM LÝ · BÍ ẨN / KYOSHIRO STUDIO`

### 2.2 Nhánh Lựa Chọn Đề Xuất (`DLG-P01–P06` — `PROPOSED`, `Ch. 08 & Table 17`)
- **`DLG-P01` (Edda):** `"Ta sẽ giúp làng, dù ta chưa nhớ mình là ai."` → *"Đôi khi lựa chọn hôm nay đáng giá hơn tên tuổi ngày xưa."* (`choice_edda_promise_bell`, `+3`).
- **`DLG-P02` (Edda):** `"Bà biết gì về thời gian ta đã mất?"` → *"Ta chỉ biết những mùa sương không trôi giống nhau. Hãy tìm những người còn nhớ."* (`lore_curious_bell_secret`, `+1`).
- **`DLG-P03` (Vaelen):** `"Ta có quen ngươi sao?"` → *"Dáng đứng ấy không thay đổi. Nhưng ta sẽ không bắt ngươi nhớ điều chưa thể nhớ. Hãy nghỉ một lát."* (`lore_curious_black_knight`, `+2`).
- **`DLG-P04` (Vaelen):** `"Nếu từng hứa với ngươi, ta muốn biết lời thề ấy."` → *"Bảo vệ những người không thể tự bảo vệ mình. Đó là điều người thầy của ta đã dạy."* (`+3` trong GDD).
- **`DLG-P05` (Dark Knight):** `"Ta không nhớ ngày ấy. Nhưng ta muốn nghe ngươi."` → *"Ngài không nhớ… còn ta đã mang theo từng lời thề qua những mùa sương."* (`+2` đề xuất; khóa cho tới `OQ-04`).
- **`DLG-P06` (Dark Knight):** `"Ta không thể thay đổi quá khứ, nhưng sẽ bảo vệ Bellhollow."` → *"Vậy hãy cho ta thấy lời thề ấy còn có ý nghĩa."* (`+2` đề xuất; hội tụ encounter).
- *Nhánh có điều kiện (`Table 17` ngoài bảng):* `"Ta đã nghe rừng cầu cứu. Ta không chọn bỏ lại các ngươi."` → *"Lời cầu cứu ư? Vậy vì sao ngài chưa từng trở về?"* (chỉ mở nếu đã đủ manh mối + Owner duyệt).

---

## 3. Kiểm Kê Toàn Bộ `59` Key Trong `src/data/dialogues.json` & Dấu Vết Spoiler / Xung Đột

Kiểm tra trực tiếp bằng script trên `src/data/dialogues.json` (`count = 59`, chưa có chữ `Meliodas` hay `Drager` nào trong `dialogues.json`; nhưng có **`8` keys** chứa nội dung `Chỉ huy` / `phong ấn ký ức` / `tái sinh` hoặc `linh hồn` cần thẩm định theo `C01–C04`):

### 3.1 Nhóm `CONFLICT / SPOILER SỚM` (Ưu Tiên Kiểm Toán `OQ-01–09`, `OQ-17`, `OQ-20`)
| Dialogue Key | Speaker / Vai trò | Nội dung nguồn gây xung đột / Spoiler phát hiện trong `dialogues.json` | Chạm `NAR / CONFLICT` |
| :--- | :--- | :--- | :--- |
| **`campfire_knight_intro`** | Sir Vaelen (`5` lines, `5` choices, `SQ06`) | Chứa từ khóa `chỉ huy` khi hỏi về đoàn kỵ sĩ. *(Lưu ý UI: node này có **`5` choices**, trong khi phím tắt `DialogueSystem.ts:75–80` chỉ gán phím `1–3`).* | `NAR-005/009`, `I-03` |
| **`campfire_knight_comrade_bond`** | Sir Vaelen (`5` lines, `2` choices) | Nhắc lệnh `chỉ huy` ở lại giữ lửa. | `NAR-005/010`, `OQ-01` |
| **`campfire_knight_q2_complete`** | Sir Vaelen (`4` lines, `0` choices, `SQ08`) | `L1–L3`: Tin rằng **"`Chỉ huy` đã bị tà khí nuốt chửng linh hồn, trở thành `Hooded Knight Boss`"** và nhờ giải thoát lấy huy hiệu. | **`CONFLICT C02`**, `NAR-010`, `DLG-026`, `OQ-06` |
| **`campfire_knight_q3_complete`** | Sir Vaelen (`6` lines, `2` choices, `eqp_bell_ward_charm`) | `L2`, `L4`: Xác nhận Quân Huy Tổng Chỉ Huy, bái kiến **"Chỉ Huy Hiệp Sĩ Đen"** và khẳng định **"tự phong ấn ký ức để bảo vệ linh hồn"** + popup `GameScene.ts:4849`. | **`CONFLICT C01/C02/C04`**, `NAR-003/010`, `DLG-027` |
| **`hooded_knight_encounter_intro`** | Bóng Ma Hiệp Sĩ Trùm Mũ (`4` lines, `2` choices) | `L2–L3`: **"Chỉ... Chỉ huy?! Có phải ngài không?!"** — gọi thẳng chức `Chỉ huy` trước cả khi xong `q3`. | **`CONFLICT C03/C04`**, `NAR-014/015`, `DLG-025`, `OQ-04` |
| **`hooded_knight_encounter_defeat`** | Bóng Ma Hiệp Sĩ Trùm Mũ (`5` lines, `1` choice, `quest_corrupted_crest ×1`) | `L1–L3`: Nêu trọn vẹn lời giải **"tự phong ấn ký ức và linh hồn vào Trái Tim Mạch Rễ... phong ấn chính mình để tái sinh..."**. | **`CONFLICT C01/C03`**, `NAR-003/014`, `DLG-025`, `OQ-03/04` |
| **`edda_black_knight_reverence`** | Bà Edda (`2` lines, `0` choices, `stage ≥ 3`) | `L1`: Gọi *"Hỡi vị Hiệp Sĩ Đen của Bellhollow, lời nguyền trăm năm..."* (liên quan mốc thời gian `OQ-08`). | `NAR-004`, `OQ-08` |
| **`vaelen_examine_crest_and_seek_mold`** | Sir Vaelen (`4` lines, `0` choices, `Q05_SOLVE_MIRE`) | `L2`: Nhắc phong ấn vật lý Rễ Cổ & `Chìa Khóa Thanh Tẩy` (tương thích main route, KHÔNG thuộc mâu thuẫn tự phong ấn ký ức). | Tương thích Main Route |

### 3.2 Các Điểm Tiết Lộ `Meliodas / Chỉ Huy` Sớm Ngoài `dialogues.json` (`CONFLICT C04`)
- **`src/scenes/MainMenuScene.ts:797` (`showChronicleAndGuideModal`):** Hiển thị ngay ở màn hình Menu chính: *`"Ngươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi — ..."`*.
- **`src/scenes/GameScene.ts:4849`:** Popup trực tiếp: *`'⚔️ THỨC TỈNH KÝ ỨC: Bạn chính là Chỉ Huy Hiệp Sĩ Đen (The Black Knight)!'`* khi trả `SQ08`.
- **`src/state/PlayerState.ts:764–788` & `4881–4883` (`GameScene.ts`):** Tại `stage 1` (ngay sau `campfire_knight_q1_complete`!), code tự mở `lore_black_knight_chronicle` (`chỉ huy`, `phong ấn`); và bất kỳ lựa chọn đồng cảm nào của Vaelen/Hooded (`PlayerState.ts:610–622`) đều mở ngay `lore_wayfarer_inner_journal` (`Algiz`, `tự phong ấn`).

### 3.3 Toàn Bộ `51` Key Runtime Còn Lại (Đã Xác Minh Khớp Payload)
- **Garth (`10` keys):** `garth_warning` (`talked_to_villagers`, `Q01_MEET_EDDA`, `opensEastGate`), `garth_reminder_edda`, `garth_reminder_gate_locked`, `garth_east_gate_open` (`3` choices), `garth_brother_story` (`SQ09_BROKEN_LANTERN`), `garth_broken_lantern_complete` (`item_lantern_oil ×2`), `garth_horseman_tactics`, `garth_quest_clearing_patrol` (`SQ04_CLEARING_PATROL`), `garth_black_knight_reverence`, `garth_guide_to_mire`.
- **Edda (`8` keys ngoài `edda_black_knight_reverence`):** `edda_intro` (`talked_to_edda`, `Q02_MEET_NERIS`, `opensEastGate`), `edda_reminder_locked`, `edda_reminder_open`, `edda_bell_shatter_secret`, `edda_rune_guide` (`eqp_bell_ward_charm ×1`), `edda_reminder`, `edda_quest_bell_memory` (`quest_edda_memory_completed`), `edda_guide_to_mire`.
- **Neris (`9` keys):** `neris_intro` (`talked_to_neris`, `Q03_PREPARE_RESOURCES`, `item_herbal_poultice ×1`, `healPlayer`), `neris_heal_locked`, `neris_heal_open`, `neris_fog_sickness_story`, `neris_quest_root_flower` (`quest_neris_flower_accepted`), `neris_root_flower_complete` (`food_calming_tea ×2`, `healPlayer`), `neris_heal`, `neris_quest_cellar_tea` (`SQ03_CELLAR_TEA`), `neris_black_knight_reverence`.
- **Bram (`6` keys):** `bram_chat`, `bram_guilt_story`, `bram_knight_weakness_guide`, `bram_quest_runed_iron` (`SQ01_RUNED_IRON`), `bram_black_knight_reverence`, `bram_help_forge_purification_key` (`quest_purification_key ×1`).
- **Finn (`5` keys):** `finn_chat`, `finn_whispers_well`, `finn_secret_caches`, `finn_rumors` (`talked_to_finn_rumors`), `finn_black_knight_reverence`.
- **Vaelen (`10` keys ngoài nhóm C01–C04):** `campfire_knight_q1_reminder`, `campfire_knight_q1_complete` (`SQ07`, `food_calming_tea ×1`), `campfire_knight_q2_reminder`, `campfire_knight_q3_reminder`, `campfire_knight_idle_talk`, `campfire_knight_rest_blessing`, `campfire_knight_rest_blessing_stage0_2`, `campfire_knight_rest_blessing_stage3`, `campfire_knight_rest_cooldown`, `vaelen_mold_reminder`, `vaelen_forge_purification_key` (`quest_purification_key ×1`), `vaelen_reminder_use_purification_key` *(tổng `12` keys này + `5` keys ở bảng trên = `17` keys Vaelen)*.
- **Wayfarer (`1` key):** `clapper_found` (`clapper_collected`, `Q06_RETRIEVE_CLAPPER`).
- *(Tổng kiểm: `10 Garth + 9 Edda + 9 Neris + 6 Bram + 5 Finn + 17 Vaelen + 2 Hooded + 1 Wayfarer = 59 keys`)*.
