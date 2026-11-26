# HOLLOW WOODS — MASTER LORE REGISTRY

- **Mission:** `HW-NARRATIVE-00B — LORE, CHARACTER & CANON REGISTRY` (`DEPENDENCY: HW-NARRATIVE-00A`)
- **Primary References:**
  - [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md) (Mục `0`, `1`, `2`, `7`, `13`, `14`)
  - `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`: `Ch. 01`, `Ch. 02`, `Ch. 03`, `Ch. 04`, `Ch. 10`, `Ch. 16`, `Ch. 17` (`Story Bible Draft V2`, `Tables 13–15`)
  - Runtime Verified Source: `src/data/lore.json` (`29` entries = `25` `loreEntries` + `4` `subAreaLoreEntries`)
- **Mode:** `NARRATIVE AUDIT ONLY` — Không sửa runtime source, không tự giải quyết xung đột, không tự chế tạo lore `UNKNOWN`.

---

## 1. Bản Sắc & Quy Luật Thế Giới (World Axioms & Tone)

| Khái niệm | Nội dung Baseline (`GAME-IMPLEMENTED`) | Bổ sung / Hướng mới (`PROPOSED` / `TRAILER-ONLY`) | Nguồn & Trạng thái |
| :--- | :--- | :--- | :--- |
| **Thế giới / Làng** | **Bellhollow** (`Làng Chuông Cổ`), bị cô lập bởi màn sương `The Veil`. Mùa Sương Lạnh kéo dài đến khi rung được **The First Toll** (`Hồi Chuông Đầu Tiên`). | Gắn chủ đề ký ức & lời thề: *"Khu rừng vẫn nhớ những gì ngươi đã quên."* Không khẳng định rừng có ý thức độc lập hoàn toàn (`NAR-026`). | `Ch. 02`, `Ch. 03`, `NAR-026` (`PROPOSED`), `TRAILER-ONLY` |
| **Biến cố Chuông** | Đêm biến cố, vị Giữ Chuông tiền nhiệm gióng **7 hồi chuông** khiến **Đại Hồng Chung** nứt; **Lưỡi Chuông Đồng (Clapper)** rơi xuống đầm lầy (`silent_mire` → `broken_bell_shrine`). | Giữ nguyên sự kiện chuông nứt & Lưỡi Chuông như trục main quest (`Ch. 03`, `Ch. 10`, `Table 06`). Thứ tự tương đối với biến cố của NVC chưa chốt (`OQ-09`). | `edda_bell_shatter_secret`, `lore_clapper_curse`, `Table 14` |
| **Mire Warden & Mạch Rễ** | **Mire Warden** (*Kẻ Nuốt Tiếng Chuông*) từng là người bảo hộ **Đại Mạch Rễ**, gắn với 3 trụ phong ấn và Lưỡi Chuông. | Trailer `V8/V9` (`DLG-016–017`) chỉ giải thích động cơ thu hồi Lưỡi Chuông; không thêm quan hệ thầy trò hay gán là nguồn gọi rừng. | `lore_mire_warden_memory`, `Ch. 05 (CHAR-016)`, `Ch. 17 (CH-07)` |
| **The Veil & Hội Chứng Trắng Não** | Màn sương ăn mòn Composure/Tinh Thần và gây chứng suy giảm ký ức ở dân làng (*Hội Chứng Trắng Não*, theo Neris). | Không tự coi chẩn đoán của Neris là nguyên nhân duy nhất khiến NVC mất trí nhớ (`Table 15 D2`, `OQ-03`). | `lore_fog_origin`, `neris_fog_sickness_story`, `lore_herbalist_note` |
| **Ba Quy Tắc Bằng Máu** | (1) Không đáp khi rừng gọi đúng họ tên mình (`The Listener` mượn giọng); (2) Không theo chiếc đèn thứ hai trong sương; (3) Không rung chuông khi sương đã tràn qua hàng rào làng. | Bảo toàn nguyên vẹn. Chưa có bản viết lại `DLG-008` được duyệt; không khẳng định lời cầu cứu mới là khác hoặc giống `The Listener` (`NAR-024`, `OQ-02`). | `lore_three_rules`, `edda_intro`, `DLG-008`, `DLG-020` |
| **The Listener vs The Echo** | Hai hiện tượng/thực thể **tách biệt hoàn toàn**: `The Listener` phản ứng âm thanh & mượn giọng gây sát thương; `The Echo` là tiếng vọng ký ức dẫn đường, không hitbox sát thương vật lý. | Không tự gán `The Echo` là bản ngã NVC, linh hồn Dark Knight, hay tác nhân gửi lời cầu cứu (`CH-08`, `CH-09`). | `TheListener.ts`, `EchoSystem.ts`, `Ch. 03`, `Ch. 17` |

---

## 2. So Sánh Trục Cốt Truyện: Runtime Baseline vs Hướng Mới Của Owner

### 2.1 Cốt truyện trong Runtime Source (`GAME-IMPLEMENTED` tại `HEAD 11d91dd5...`)
- **Act 0 (`fog_crossing`):** Lữ khách tỉnh dậy không nhớ mình là ai, nghe tiếng chuông đồng mơ hồ từ phương Đông và theo dấu `The Echo` tiến vào Bellhollow (`Q00_WAKE_UP` → `Q01_MEET_EDDA`).
- **Act 1–3 (`bellhollow` → `broken_bell_shrine`):** Học 3 quy tắc từ Edda, hỗ trợ dân làng (Garth, Neris, Bram, Finn), gặp `Sir Vaelen` tại trạm lửa `outer_woods`, rèn chìa thanh tẩy, phá 3 trụ, hạ `Mire Warden`, mang Lưỡi Chuông về gióng `The First Toll`.
- **Chân tướng gốc trong source:** NVC chính là **Chỉ Huy Hiệp Sĩ Đen** năm xưa, chủ động phong ấn ký ức/linh hồn (nhắc cổ ngữ `Algiz` và tái sinh) và được `MainMenuScene` + `lore_memory_chapter_4` / `lore_black_knight_chronicle` / `campfire_knight_q3_complete` giải thích trực tiếp.

### 2.2 Hướng Cốt Truyện Mới của Owner (`PROPOSED`, trừ tên riêng `Meliodas`)
- **Quá khứ (`T−?`):** **Meliodas Blackwood** (`CANON-APPROVED` tên thay `Drager`; giữ danh hiệu `Lord Blackwood` và `The Wolf Lord`) từng là người thầy dìu dắt các kỵ sĩ, trong đó có `Sir Vaelen` và `Sir Mordric` (`Kỵ Sĩ Bóng Tối`). Vaelen và Mordric từng là bạn thân (`Ch. 03`, `Ch. 17 Story Bible Draft V2`).
- **Biến cố (`T−?` → `CONFLICT`):** Meliodas nghe thấy lời thì thầm giống lời cầu cứu vọng ra từ rừng già và bước theo. Một biến cố chưa rõ nguyên nhân khiến ông mất ký ức và xuất hiện tại Bellhollow ở một thời điểm tương lai.
- **Khung 3 Hồi đề xuất (`Ch. 03` & `Story Bible Draft V2 §4`):**
  - **Hồi I — Người trở về mà không biết mình đã trở về:** Tỉnh ở `fog_crossing`, vào Bellhollow gặp Garth & Edda, học 3 quy tắc, tìm manh mối chuông mà không bị spoil tên `Meliodas` hay chức `Chỉ Huy` quá sớm.
  - **Hồi II — Ngọn lửa vẫn đợi:** Tìm cổ vật theo main route `A→E→B→D→F→E→C→A`. Vaelen nhận thấy dấu hiệu quen thuộc qua dáng đứng, giáp, Hộ Tâm và lời thề.
  - **Hồi III — Hai lời thề:** Đối diện Kỵ Sĩ Bóng Tối (oán trách người thầy vắng mặt khi bóng tối tìm đến) và Vaelen (giữ lời thề). Thực hiện `The First Toll` tại Bellhollow.
- **Khoảng trống bắt buộc giữ `UNKNOWN`:** Không tự điền (1) ai gửi tiếng cầu cứu, (2) cơ chế xuyên thời gian / mất trí nhớ, (3) bao nhiêu năm đã trôi qua, (4) kết cục sống/chết của từng kỵ sĩ.

---

## 3. Ba Dòng Thời Gian Chính (`Ch. 04`, `Table 14`, `Table 15`)

### 3.1 Timeline A — World Chronology (`PROPOSED` / `Table 14`)
| Mốc | Sự kiện | Mức chứng cứ & Giới hạn |
| :--- | :--- | :--- |
| `T−?` | Đoàn kỵ sĩ bảo vệ Bellhollow; Vaelen nhận lệnh ở lại giữ trạm lửa | `BASELINE` (`campfire_knight_comrade_bond`); chưa buộc chức Chỉ Huy đồng nhất vai trò người thầy mới (`OQ-01`) |
| `T−?` | Meliodas dìu dắt Sir Vaelen và Sir Mordric (hai người là bạn) | `PROPOSED` (Owner); chưa chốt tuổi, cấp bậc, danh sách toàn đoàn |
| `T−?` | Meliodas nghe lời thì thầm như lời cầu cứu từ rừng và đi theo | `PROPOSED`; chưa rõ nguồn gọi & thứ tự trước/sau đêm chuông vỡ (`OQ-02`, `OQ-09`) |
| `T−?` | The Veil tràn tới; 7 hồi chuông; Đại Hồng Chung nứt; Clapper rơi xuống đầm | `BASELINE` (`edda_bell_shatter_secret`) |
| `T−?` | Biến cố bí ẩn; NVC mất ký ức và xuất hiện ở tương lai | `PROPOSED` / **`CONFLICT 01`** với tự phong ấn / `Algiz` / tái sinh trong source (`OQ-03`) |
| `Khoảng trống` | Vaelen giữ lời thề bên lửa; Kỵ Sĩ Bóng Tối oán trách / xa cách | Trailer `V11.7–V12.2` ghi nhận lời oán trách; số năm & cơ chế tồn tại `UNKNOWN` (`OQ-08`) |
| `T0` | NVC thức tỉnh tại `fog_crossing` rồi tới Bellhollow | `BASELINE` (`GameScene.startAct0Intro`); V9 dựng montage tỉnh ở Bellhollow |
| `T+?` | Gặp Edda, Vaelen, tìm khuôn đúc & cổ ngữ, giải ấn, gặp các kỵ sĩ, `First Toll` & Ending | `BASELINE` main route (`quests.json`); thứ tự trailer `Mire→Satyr→Dark` không ép làm lịch sử thế giới (`NAR-019`) |

### 3.2 Timeline B — Player Discovery (`D0–D7`, `Table 15`)
- **`D0` (Menu / Act 0):** Nắm được sự tồn tại của màn sương & `[F]` Hộ Tâm; **KHÔNG nên biết sớm** tên `Meliodas`, chức `Chỉ Huy`, hai học trò hay lời giải thời gian (`CONFLICT 04`).
- **`D1` (Garth / Edda):** Nắm 3 quy tắc sống sót, chuông vỡ, nhiệm vụ tìm Clapper; Edda gợi người trở về (`DLG-006–007` `TRAILER-ONLY`).
- **`D2` (Neris / Bram / Finn):** Sương tác động trí nhớ, lời đồn giếng nước, manh mối lịch sử làng.
- **`D3` (Đầm lầy / Vaelen):** Huy hiệu & lời thề gắn quá khứ (`SQ06`).
- **`D4` (Xưởng Chuông / Rừng Sâu):** Nhật ký, văn bia, cổ ngữ (cảnh giác nhân chứng không đồng nhất).
- **`D5` (Hooded / Dark — Tuyến phụ):** Nhận ra quan hệ thầy trò; **không ép** khóa tiến trình chính.
- **`D6` (Vaelen / Huy hiệu):** Đối chiếu lời thề và ký ức khi đủ bằng chứng (`stage 3`, `eqp_bell_ward_charm`).
- **`D7` (Mire Warden / First Toll):** Trách nhiệm bảo hộ Bellhollow và `3` kết thúc (`determineEndingType`).

### 3.3 Timeline C — Trailer V12.2 (`TRAILER-ONLY`, `Ch. 04`, `Ch. 14`)
`00–10s` Studio Intro → `10–14s` Fog Crossing → `14–16s` Bellhollow → `16–24s` Edda (`2×4s`) → `24–33s` Vaelen bên lửa → `33–37s` The Veil & Hộ Tâm → `37–44s` Mire Warden → `44–51s` Satyr → `51–65s` Dark Knight & Vaelen (+ `Knight_2/3`) → `65–70s` Title Reveal. Đây là cấu trúc kể chuyện điện ảnh (`HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`), **không phải thứ tự cốt truyện bắt buộc trong game**.

---

## 4. Kiểm Kê Toàn Bộ `29` Mục Lore Trong `src/data/lore.json` (`GAME-IMPLEMENTED`)

Kiểm tra trực tiếp cấu trúc `src/data/lore.json` ghi nhận đúng `29` mục lore (`25` `loreEntries` + `4` `subAreaLoreEntries`) đi kèm trạng thái đối chiếu với Unified Bible:

| Nhóm | Entry ID (`src/data/lore.json`) | Tiêu đề Runtime | Tình trạng với Canon / Conflict |
| :--- | :--- | :--- | :--- |
| `loreEntries` | `lore_three_rules` | *BA QUY TẮC BẰNG MÁU CỦA LÀNG BELLHOLLOW* | `GAME-IMPLEMENTED` — Giữ nguyên (`OQ-02`, `DLG-008`) |
| `loreEntries` | `lore_herbalist_note` | *GHI CHÉP THẢO DƯỢC & MÀN SƯƠNG* | `GAME-IMPLEMENTED` — Tương thích |
| `loreEntries` | `lore_runestones` | *BÍ MẬT BA CỘT ĐÁ TẠI ĐẦM LẦY TĨNH LẶNG* | `GAME-IMPLEMENTED` — Giữ nguyên main route |
| `loreEntries` | `lore_clapper_curse` | *LỜI NGUYỀN MIẾU CHUÔNG PHẾ TÍCH* | `GAME-IMPLEMENTED` — Giữ nguyên |
| `loreEntries` | `lore_mire_warden_memory` | *KÝ ỨC BI KỊCH: KẺ NUỐT TIẾNG CHUÔNG* | `GAME-IMPLEMENTED` — Giữ nguyên |
| `loreEntries` | `lore_campfire_knight_vow` | *LỜI THỀ CỦA SIR VAELEN — KỴ SĨ TRẦM MẶC* | `GAME-IMPLEMENTED` — Rà soát `NAR-005/009/010` (`OQ-01/11`) |
| `loreEntries` | `lore_memory_chapter_1` | *HỒI ỨC I: KẺ LỮ HÀNH MẤT TRÍ TRONG SƯƠNG* | `GAME-IMPLEMENTED` — Cần kiểm điểm tỉnh dậy & tiếng chuông/lời gọi (`DLG-003`, `NAR-001`) |
| `loreEntries` | `lore_memory_chapter_2` | *HỒI ỨC II: MANH MỐI XƯỞNG CHUÔNG & VĂN BIA CỔ* | `GAME-IMPLEMENTED` — **Rủi ro `I-01`:** mở sớm tại `stage 1` |
| `loreEntries` | `lore_memory_chapter_3` | *HỒI ỨC III: TIẾNG GỌI THE ECHO & KẺ SA NGÃ* | `GAME-IMPLEMENTED` — Liên quan `NAR-001/014` (`OQ-02/04`) |
| `loreEntries` | `lore_memory_chapter_4` | *HỒI ỨC IV: THỨC TỈNH — MELIODAS BLACKWOOD* | `GAME-IMPLEMENTED` — **`A06` Display-Gated (`REDACTED` khi chưa đủ Stage `3` + Approved Evidence)** |
| `loreEntries` | `lore_wayfarer_inner_journal` | *NHẬT KÝ LỮ KHÁCH: LỜI THỀ TRONG RÊU PHONG* | `GAME-IMPLEMENTED` — **`A06` Fixed (`PlayerState:610/770` & `EvilKnights:1002` leak closed; Legacy Save `REDACTED` an toàn)** |
| `loreEntries` | `lore_knights_memorial_stele` | *BIA ĐÁ TƯỞNG NIỆM ĐOÀN KỴ SĨ* | `GAME-IMPLEMENTED` — Đối chiếu `tornPagesData.ts` (`Sir Valen`, `12` kỵ sĩ) |
| `loreEntries` | `lore_bellmaker_dew_journal` | *TRANG NHẬT KÝ ƯỚT SƯƠNG: HỢP KIM NGÂN VANG* | `GAME-IMPLEMENTED` — Tương thích main route |
| `loreEntries` | `lore_broken_sword_mire` | *THANH KIẾM GÃY BÊN BỜ ĐẦM LẦY* | `GAME-IMPLEMENTED` — Kiểm tra liên hệ kỵ sĩ khi duyệt |
| `loreEntries` | `lore_elian_unsent_letter` | *BỨC THƯ CHƯA KỊP GỬI CỦA ELIAN* | `GAME-IMPLEMENTED` — Giữ tách biệt khỏi Dark Knight (`NAR-025`, `OQ-05`) |
| `loreEntries` | `lore_ancient_oak_hollow` | *GỐC SỒI NGÀN NĂM & DẤU ẤN MẠCH RỄ* | `GAME-IMPLEMENTED` — Tương thích |
| `loreEntries` | `lore_root_cellar_alchemy` | *GHI CHÉP DƯỢC THẢO DƯỚI HẦM RỄ* | `GAME-IMPLEMENTED` — Tương thích (`SQ03`) |
| `loreEntries` | `lore_echo_ruins_prayer` | *TIẾNG VỌNG KÝ ỨC: LỜI NGUYỆN CẦU TÀN TÍCH* | `GAME-IMPLEMENTED` — Giữ tách `The Echo` |
| `loreEntries` | `lore_echo_mire_path` | *TIẾNG VỌNG KÝ ỨC: BƯỚC CHÂN ĐẦM LẦY* | `GAME-IMPLEMENTED` — Giữ tách `The Echo` |
| `loreEntries` | `lore_stone_chessboard` | *BÀN CỜ ĐÁ GIỮA MÀN SƯƠNG* | `GAME-IMPLEMENTED` — Environmental storytelling |
| `loreEntries` | `lore_shrine_parchment_map` | *BẢN ĐỒ DA CỪU: HỘI TỤ MẠCH RỄ* | `GAME-IMPLEMENTED` — Tương thích |
| `loreEntries` | `lore_ending_true` | *KẾT THÚC I: BÌNH MINH CỦA TIẾNG CHUÔNG (TRUE ENDING)* | `GAME-IMPLEMENTED` — `NAR-021` (`PROPOSED`), **`I-06`** ("hàng trăm năm") |
| `loreEntries` | `lore_ending_sacrifice` | *KẾT THÚC II: NGƯỜI CANH GÁC VĨNH HẰNG (BITTERSWEET ENDING)* | `GAME-IMPLEMENTED` — `NAR-021` (`PROPOSED`), giữ logic |
| `loreEntries` | `lore_ending_fog_loop` | *KẾT THÚC III: VÒNG LẶP CỦA SƯƠNG MÙ (FOG LOOP ENDING)* | `GAME-IMPLEMENTED` — `NAR-021` (`PROPOSED`), giữ logic |
| `loreEntries` | `lore_detour_path` | *MANH MỐI: LỐI VÒNG ĐẾN THÁP CHUÔNG* | `GAME-IMPLEMENTED` — Tương thích |
| `subAreaLoreEntries` | `lore_fog_journal_1` | *MẨU NHẬT KÝ RÁCH: KẺ ĐI TRƯỚC* | `GAME-IMPLEMENTED` — Kiểm tra mâu thuẫn nhân chứng |
| `subAreaLoreEntries` | `lore_blacksmith_journal` | *NHẬT KÝ THỢ RÈN XƯỞNG CHUÔNG CŨ* | `GAME-IMPLEMENTED` — Tương thích |
| `subAreaLoreEntries` | `lore_fog_origin` | *BÍ MẬT NGUỒN GỐC MÀN SƯƠNG BELLHOLLOW* | `GAME-IMPLEMENTED` — `NAR-026` (không chốt rừng = The Veil) |
| `subAreaLoreEntries` | `lore_black_knight_chronicle` | *VĂN BIA CỔ: HIỆP SĨ ĐEN VÀ PHONG ẤN ĐẠI MẠCH RỄ* | `GAME-IMPLEMENTED` — **`CONFLICT 01 / 04 / I-01`** (mở ở `stage 1`, lộ Chỉ Huy & phong ấn cũ) |

---

## 5. Tài Nguyên Lore Bổ Sung Từ V1.0 & V2 (Chưa Chốt Canon)

- **`V1.0` Đề xuất lịch sử (`Ch. 03`, không tự nâng thành `CANON-APPROVED`):** Trái Tim Mạch Rễ lưu dấu ký ức; hai kỵ sĩ cùng bảo vệ người yếu thế; `Satyr` như bóng dáng lữ khách cũ dẫn tới Dark Knight; lời gọi khác tiếng nhại Listener. Toàn bộ các chi tiết này đã bị `V2` & `Unified Edition Ch. 03` hạ về mức `PROPOSED` / chưa được Owner xác nhận.
- **Lưu ý bảo toàn ID:** Key `lore_satyr_journal` (nếu tồn tại trong `content_registry.json` / `registryData.ts`) là **key legacy của nhật ký NVC**, tuyệt đối không tái dùng làm ID thực thể/lore của boss `Satyr` (`Ch. 05 CHAR-019`, `Table 18 R21`).
