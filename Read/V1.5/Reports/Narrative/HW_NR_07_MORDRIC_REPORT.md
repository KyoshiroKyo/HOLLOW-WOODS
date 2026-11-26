# HW-NR-07 — SIR MORDRIC & DARK KNIGHT NARRATIVE (DRAFT & RUNTIME BLOCK REPORT)

- **Mission ID:** `HW-NR-07 — SIR MORDRIC & DARK KNIGHT NARRATIVE`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Mode:** `DRAFT SPECIFICATION ONLY — RUNTIME INTEGRATION: BLOCKED`
- **Primary Sources Verified:** `src/data/dialogues.json` (`L790–835`), `src/entities/EvilKnights.ts` (`L664–1035`), `src/systems/WildlifeSystem.ts` (`L84–97`, `L498–540`), `src/scenes/GameScene.ts` (`L800–816`, `L3129–3144`, `L4812–4849`, `L6164–6170`), `src/state/PlayerState.ts` (`L610–622`, `L926–937`), `src/data/lore.json` (`L60–79`, `L137–142`, `L335–340`, `L492–535`), `src/data/items.json` (`L359–365`), `src/data/tornPagesData.ts` (`L225–320`), [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md), [CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md), [DIALOGUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DIALOGUE_REGISTRY.md).

---

## 1. SAFETY GATE — Trạng Thái Phê Duyệt Của Owner (`RUNTIME INTEGRATION: BLOCKED`)

Kiểm tra trực tiếp tại [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md): toàn bộ các quyết định nền tảng liên quan đến **`Sir Mordric` (`The Dark Knight`)** hiện vẫn ở trạng thái **CHƯA KÝ DUYỆT (`[ ]`)**:

| Decision ID | Nội dung cổng quyết định | Trạng thái hiện tại | Tác động bắt buộc với `HW-NR-07` |
| :--- | :--- | :---: | :--- |
| **`DEC-LOCK-09`** (`OQ-04`) | **`Sir Mordric` có chính là `HoodedKnightBoss`** (`EvilKnights.ts`) hay là boss tách riêng? | **`[ ] CHƯA CHỐT`** (`CONFLICT C03`) | **BLOCKED cho Runtime Integration.** Chỉ được lập bản thảo `Dialogue Diff` cho cả 2 nhánh (`Phương án A: Hợp nhất Hooded = Mordric` vs `Phương án B: Tách riêng Boss`). |
| **`DEC-LOCK-10`** (`OQ-06`) | Xử lý **`CONFLICT C02`** (`Vaelen q2` tin Hooded là Chỉ Huy vs `q3` nhận ra NVC). | **`[ ] CHƯA CHỐT`** | Giữ đề xuất đồng bộ với `HW-NR-06` (không tự sửa `dialogues.json`). |
| **`DEC-LOCK-11`** (`OQ-05/11/12/14/16`) | Tiểu sử thầy trò, dấu hiệu nhận ra thầy, **số phận cuối của Mordric**, và vai trò Vaelen ở cảnh hang. | **`[ ] CHƯA CHỐT`** | **CẤM tự quyết định số phận Mordric**; trình sẵn cả phương án mở *(giải thoát thanh thản vs hòa giải giữ mạng)*. |
| **`DEC-LOCK-16`** (`OQ-15`) | Vị trí & tính bắt buộc: giữ **`SQ08` Optional ở `deep_forest` (`2340, -190`)** hay dời sang `veil_origin_cavern`. | **`[ ] CHƯA CHỐT`** | Giữ nguyên tọa độ `WildlifeSystem.ts:94–97`, AI, kỹ năng và loot hiện hành. |
| **`DEC-LOCK-17`** (`DLG-012..015`) | Duyệt nguyên văn lời thoại trailer `V12.2` đưa vào runtime game. | **`[ ] CHƯA CHỐT`** | Xác định rõ vị trí gắn `DLG-012..015` trong bản thảo để Owner ký duyệt. |

> **KẾT LUẬN GATE:** Mọi chỉnh sửa trực tiếp vào `dialogues.json`, `EvilKnights.ts`, `lore.json`, `GameScene.ts`, `PlayerState.ts`, `WildlifeSystem.ts`, AI, kỹ năng hoặc phần thưởng quest đều **BỊ KHÓA (`BLOCKED`)** trong phiên này (`0` thay đổi mã nguồn/tài nguyên).

---

## 2. Khung Quá Khứ & Tam Giác Quan Hệ (`Meliodas — Vaelen — Mordric`)

### 2.1 Ranh Giới Bất Biến (`CANON-APPROVED` + Chống Nhập Nhằng Thực Thể)
- **`Meliodas Blackwood` (`Lord Blackwood` / `The Wolf Lord`):** Là **người thầy / thủ lĩnh** quá khứ (`CHAR-K01/K02`), **KHÔNG PHẢI** Dark Knight. Chức danh *Chỉ Huy* giữ chờ `DEC-LOCK-01`.
- **`Sir Mordric` (`CHAR-003` — `The Dark Knight`):** Độc lập hoàn toàn với:
  1. **`Elian` (`CHAR-012`):** Em trai ruột của Garth tại `SQ09_BROKEN_LANTERN` (`lore_elian_unsent_letter`). **Cấm gộp `Mordric = Elian`.**
  2. **`FallenKnightEntity` / `FallenKnightApparition` (`CHAR-014`):** Thuộc hạ vô danh / ảo ảnh bị tha hóa (`2` vệ binh đi kèm tại `deep_forest` trong `WildlifeSystem.ts:535–538`). **Cấm gộp `Mordric = Fallen Knight`.**
  3. **`Sir Roderick` & `Sir Aldemar` (`CHAR-004/005`):** Không tự gán tên vào `Knight_2 / Knight_3` trong cảnh hang trailer (`DEC-LOCK-12`).

### 2.2 Bản Thảo Tiểu Sử & Mâu Thuẫn Lòng Trung Thành / Lời Thề (`PROPOSED`)
1. **Quá khứ chung dưới trướng `Meliodas`:**
   - Cùng với **`Sir Vaelen`**, **`Sir Mordric`** từng là học trò thân cận của **`Meliodas Blackwood`** và là **bạn thân gắn bó** với Vaelen.
   - *(Nếu Owner chốt `DEC-LOCK-09 A`, chi tiết kỷ vật **`lore_stone_chessboard`** `lore.json:141` — hai chữ ký `'C.K'` & `'H.K'`, ván cờ đá thứ 142 hoãn lại vì tiếng còi báo động — là cầu nối hồi ức cực tốt cho tình bạn `Vaelen – Mordric` mà không cần bịa thêm nhân vật).*
2. **Đứt gãy sau biến cố Meliodas rời đi:**
   - Khi `Meliodas` nghe tiếng cầu cứu từ rừng già, bước theo và biến mất bởi biến cố xuyên thời gian (`CONFLICT C01/C05`, giữ kín nguyên nhân chờ `DEC-LOCK-02/03`), phòng tuyến Bellhollow đối diện áp lực ngày càng nặng của **`The Veil`**.
   - Trong lúc `Vaelen` chọn **trung thành giữ ngọn lửa hậu phương** (`DLG-009`, `DLG-015`: *"Ta cũng từng chờ đợi như ngươi… nhưng chưa bao giờ từ bỏ lời thề"*), **`Mordric`** mang tâm lý **bị bỏ rơi và oán trách** người thầy vắng mặt đúng lúc bóng tối ập tới (`DLG-012`–`DLG-013`).
3. **Bản chất bi kịch (`NAR-016`):**
   - Mordric **không** phải phản diện thuần ác phản bội vì tham vọng, mà là chiến binh **tuyệt vọng vì cảm giác lời thề bị phản bội**, dần bị sương đen `The Veil` khuếch đại oán niệm.
   - Khoảnh khắc đối mặt NVC (người mang *Vòng Sáng Hộ Tâm*, dáng kiếm và bộ giáp đen mất ký ức) kích hoạt xung đột trực diện: *thầy không còn nhớ lời dạy, trò vẫn mang vết thương của ngày bị bỏ lại*.

---

## 3. Đồng Bộ Lời Thoại Trước — Trong — Sau Encounter (`PROPOSED DIFF`)

*(Đặt `Phương án A: HoodedKnightBoss chính là Sir Mordric` làm trục đối chiếu chính với source hiện hành; nếu Owner chọn `Phương án B: Tách riêng Boss Sir Mordric`, toàn bộ bộ thoại `Mordric` dưới đây sẽ gắn cho ID thoại mới `mordric_encounter_*` và chỉ đổi popup/lore `hooded_knight_*` để bỏ phần `"Chỉ huy"` + `"tự phong ấn Algiz"`).*

### 3.1 Trước Encounter (`Pre-Encounter` — Chuẩn bị & Gỡ Mâu Thuẫn)
| Nguồn / Key | Nội dung cũ mâu thuẫn (`RUNTIME HIỆN HÀNH`) | Bản thảo đồng bộ (`PROPOSED — Chờ Owner duyệt`) |
| :--- | :--- | :--- |
| **`campfire_knight_q2_complete`** (`dialogues.json:734–735`) | Vaelen đọc nhật ký và khẳng định: *"Vị chỉ huy đáng kính của chúng ta đã biến thành `Hooded Knight Boss`!"* (`CONFLICT C02`). | Khớp `HW-NR-06`: Đổi thành nhật ký trinh sát báo **một kỵ sĩ cũ / người bạn đồng môn (`Sir Mordric`)** đã để sương đen chiếm giữ cổ tự Rừng Sâu; không gọi là Chỉ Huy. |
| **`SQ08_PURIFY_FALLEN`** (`lore.json:496, 505`) | Mô tả nhiệm vụ ghi *"đánh bại Chỉ Huy Hiệp Sĩ Trùm Mũ (Hooded Knight Boss)"*. | Đổi tên hiển thị trong mô tả quest sang **"Kỵ Sĩ Bóng Tối Trùm Mũ / Sir Mordric"** *(giữ nguyên ID `SQ08_PURIFY_FALLEN` & tasks `t1..t3`)*. |
| **`lore_stone_chessboard`** (`lore.json:141`) | Chú thích `'C.K' (Campfire Knight)` và `'H.K' (Hooded Knight)` ở thế cờ thứ 142. | Nếu chốt `DEC-LOCK-09 A`, giữ nguyên kỷ vật làm manh mối tình bạn `Vaelen – Mordric` (hoặc bổ sung 1 câu hồi ức sau `SQ08` rằng quân Vua Đen thuộc về Mordric). |
| **Dẫn nhập cảnh (`DLG-019`)** | Trailer `V11.x–V12.2` dẫn vào hang: *"Tưởng rằng đã thoát khỏi màn sương, ngươi lại bước vào nơi quá khứ vẫn còn chờ đợi."* | Có thể hiển thị dạng **banner/ambient whisper không khóa điều khiển** khi tiến sâu vào khu vực encounter (`deep_forest` `(2340, -190)` hoặc `veil_origin_cavern` theo `DEC-LOCK-16`). |

### 3.2 Trong Encounter (`Intro`, `Combat` & Nhánh Lựa Chọn `DLG-P05 / DLG-P06`)
- **Trigger Code (`EvilKnights.ts:815–841`):** Giữ nguyên bán kính `distToPlayer <= 220`, `stagger 2200ms`, `hasRecognizedCommander` (chỉ đổi text hiển thị — **không** đổi `setMemoryAwakeningStage(2)` nếu vẫn giữ D5 thuộc giai đoạn thức tỉnh ký ức thứ 2).
- **TRƯỚC (`hooded_knight_encounter_intro` `L790–813` & `EvilKnights.ts:833, 839`):**
  - Gọi thẳng `"Chỉ... Chỉ huy?! Có phải ngài không?!"`, popup `"Ngài chính là Chỉ Huy Hiệp Sĩ Đen?! Sao ngài lại quay mũi kiếm về phía chúng tôi?!"`.
- **ĐỀ XUẤT SAU (`Dialogue Diff` — Tích hợp `DLG-012`, `DLG-013`, `DLG-P05`, `DLG-P06`):**
  - **Popup nhận diện nhanh (`EvilKnights.ts:833, 839` — 0 spoiler tên `Meliodas`):**
    > *"Dáng đứng đó… ánh lửa Hộ Tâm đó… Là ngài sao?! Sao đến tận bây giờ ngài mới xuất hiện?!"*
  - **`Lines 1–4` (`hooded_knight_encounter_intro`):**
    - `L1`: *"(Thanh đại kiếm phủ màn sương tím sẫm cắm phập xuống nền đất rêu; dưới lớp mũ trùm, ánh mắt lạnh lẽo bỗng khựng lại khi nhận ra dáng kiếm và vầng sáng Hộ Tâm quanh ngươi)..."*
    - `L2` (**`DLG-012`**): *"**Năm ấy, ngài dạy ta không được khuất phục trước bóng tối…**"*
    - `L3` (**`DLG-013`**): *"**Vậy mà khi bóng tối tìm đến, ngài lại chẳng còn ở đó.**"*
    - `L4`: *"Màn sương đã nuốt chửng bao lời thề ta từng tin… Giờ ngươi đứng đây với đôi mắt trống rỗng như một kẻ xa lạ! Đừng bước thêm nữa — để ta xem lời dạy năm xưa của ngài còn lại bao nhiêu trọng lượng!"*
  - **`Choices` (Gắn `DLG-P05` & `DLG-P06` + guard anti-farm `choiceId`):**
    - `[1]` (**`DLG-P05` — Thay `choice_hooded_knight_resolve`):**
      - Text: `[Lắng nghe] "Ta không nhớ ngày ấy. Nhưng ta muốn nghe ngươi."`
      - Response: *"Ngài không nhớ… còn ta đã mang theo từng lời thề qua những mùa sương. Vậy hãy dùng lưỡi kiếm này nhắc lại cho ngài thấy sự thật!"* (`+2` trust, giữ/map cờ `choice_hooded_knight_resolve`).
    - `[2]` (**`DLG-P06` — Thay `choice_hooded_knight_plea`):**
      - Text: `[Lời thề] "Ta không thể thay đổi quá khứ, nhưng sẽ bảo vệ Bellhollow."`
      - Response: *"Vậy hãy cho ta thấy lời thề ấy còn có ý nghĩa… trước khi sương đen nuốt trọn cả hai ta!"* (`+2` hoặc `+3` trust theo `DEC-LOCK-18`, giữ/map cờ `choice_hooded_knight_plea`).
    - *(Lưu ý tùy chọn từ `DIALOGUE_REGISTRY Table 17`: Nếu người chơi đã mở đủ manh mối lời cầu cứu trước trận và Owner mở khóa `DLG-014/015`, có thể thêm lựa chọn thứ `3` `[Phản hồi về lời cầu cứu]` mà `DialogueSystem.ts:76–78` vẫn bắt đủ phím `1–3`).*
- **Cảnh báo giữa trận (`GameScene.ts:802, 808, 814, 3142`):**
  - Gỡ hết chữ `CHỈ HUY HIỆP SĨ`, đổi thành **`KỴ SĨ BÓNG TỐI (DARK KNIGHT)`** *(hoặc `SIR MORDRIC — KỴ SĨ BÓNG TỐI` chỉ sau khi danh xưng được giới thiệu trong trận theo `DEC-LOCK-09`)*.

### 3.3 Sau Encounter (`Defeat / Post-Encounter`) — Bảo Toàn Số Phận Mở Cho Owner
Vì **cấm tự quyết định số phận cuối cùng của Sir Mordric (`OQ-14` / `DEC-LOCK-11`)**, bản thảo sau trận (`hooded_knight_encounter_defeat`) bắt buộc loại bỏ đoạn `CONFLICT C01` (*"tự phong ấn ký ức vào Trái Tim Mạch Rễ... phong ấn chính mình để tái sinh"*) ở `L820–821`, và trình **2 nhánh kết thúc sau trận để Owner chọn 1**:

- **HƯỚNG KẾT 1 — Giải thoát & Tan biến thanh thản *(khớp 100% logic `fadeOut` & `destroy()` tại `EvilKnights.ts:1016–1034`)*:**
  - `L1`: *"(Thanh kiếm đen hạ xuống, luồng khí hắc ám quanh giáp tan dần trong ánh đèn bão)..."*
  - `L2`: *"Ta đã giữ nỗi oán hận này lâu hơn cả chính cái tên của mình… Thì ra ngài cũng là nạn nhân của vòng xoáy năm ấy."*
  - `L3`: *"Vaelen vẫn còn giữ ngọn lửa bên trạm rừng… Hãy mang chiếc huy hiệu rạn nứt này về cho cậu ấy. Thanh tẩy nó đi… để ít nhất lời thề của hai người được trọn vẹn."*
  - *Choice `[Tiễn biệt]`:* `"Hãy yên nghỉ trong ánh sáng, Mordric. Ta sẽ không để Bellhollow sụp đổ."` → *"Vậy là đủ rồi… thưa thầy."* (`quest_corrupted_crest ×1`, flag `boss_hooded_knight_defeated`).
- **HƯỚNG KẾT 2 — Hòa giải & Rút lui khỏi trận *(chỉ dùng nếu Owner chọn Mordric còn sống ở `DEC-LOCK-11`)*:**
  - Sau khi ngắt chiêu/đánh bại, Mordric buông kiếm, nhận ra Vaelen chưa bao giờ bỏ lời thề (`DLG-014–015` nếu Vaelen xuất hiện trong cảnh ký ức/cutscene), trao lại `quest_corrupted_crest` làm tín vật và lùi sâu vào sương để tự tìm lời giải cho riêng mình (`fadeOut` giữ an toàn không phá collider/combat sau trận, chờ `Ending/Act III` hoặc `World 2.0`).

---

## 4. Ma Trận Đồng Bộ Ký Ức, Lore & Code Liên Đới (`Chờ Duyệt Mới Sửa`)

| Tệp & Dòng | Mục tiêu cần xử lý để đồng bộ | Quy tắc an toàn bắt buộc |
| :--- | :--- | :--- |
| **`src/state/PlayerState.ts:615–621`** | Hiện mọi flag `choice_hooded_knight_*` & `boss_hooded_knight_defeated` đều tự động gọi `unlockLore('lore_wayfarer_inner_journal')` (vốn chứa `"tự phong ấn ký ức Algiz"`). | Chỉ mở journal mới đã viết lại sạch theo `DEC-LOCK-02`; **tuyệt đối không để choice D5 làm spoil trước `D6/Stage 3`**. |
| **`src/state/PlayerState.ts:926–937`** | Bestiary `hooded_knight` ghi `nameVi: 'Chỉ Huy Hiệp Sĩ Trùm Mũ (Hooded Knight Boss)'`, `nameEn: 'Hooded Knight Commander'`. | Giữ nguyên `species: 'hooded_knight'`, `contentId: 'HW-MON-BOSS-000002'`, `runtimeKey: 'boss_hooded_knight'`; chỉ cập nhật tên hiển thị khi `DEC-LOCK-09` chốt. |
| **`src/data/lore.json:64, 71, 77–78`** | `lore_memory_chapter_3` (*"`Chỉ Huy Hiệp Sĩ Đen?!`"*), `lore_memory_chapter_4`, `lore_wayfarer_inner_journal`. | Viết lại nhất quán với lời thoại Mordric + Vaelen, giữ nguyên ID `lore_*` để không hỏng Save Schema `3`. |
| **`src/data/items.json:362` & `ItemTooltipHelper.ts:68`** | Mô tả `quest_corrupted_crest` nhắc `"Chỉ Huy Hiệp Sĩ Trùm Mũ"`. | Giữ ID `quest_corrupted_crest` & `quest_corrupted_knight_crest` alias, sửa text mô tả hiển thị. |
| **`src/world/WorldGatingSystem.ts:185, 193, 329`** | `sunken_crypt_ruins` ghi `"bia mộ Hiệp Sĩ Đen"` (`L185`); `veil_origin_cavern` check `knight_commander_defeated` (`L193, L329`). | **Giữ nguyên tên flag kỹ thuật `knight_commander_defeated`**, chỉ sửa text hiển thị (`L185, L194–195`) khi Owner chốt `DEC-LOCK-14/16`. |

---

## 5. Kế Hoạch Kiểm Thử Sau Khi Owner Mở Khóa (`HW-NR-07 §TESTS`)

1. **Encounter Trigger:** Tiến vào `deep_forest (2340, -190)` (trong bán kính `<= 220px`, ngoài safe zone/hide): xác minh boss `stagger`, phát `hooded_knight_encounter_intro` đúng 1 lần (`hasRecognizedCommander`), `memoryAwakeningStage` lên `2`, không đóng băng game sau khi chọn `1` hoặc `2` (`DLG-P05/P06`).
2. **Combat & Popups:** Rọi Vòng Sáng Hộ Tâm `[F]` (`<= 75px`) khi boss `powerup` -> xác minh `interruptPowerup()`, `stagger`, nhận x2 sát thương, popup không chứa `"Chỉ Huy"` hay spoil tên `Meliodas`. AI, sát thương và `2` `FallenKnightEntity` hộ vệ hoạt động nguyên bản.
3. **Defeat, Rewards & Flags:** Khi `currentHp <= 0`, xác minh phát `hooded_knight_encounter_defeat`, cấp đúng `1` `quest_corrupted_crest` (không nhận trùng nếu đã nhặt ở Đầm Lầy), đặt cờ `boss_hooded_knight_defeated`, hoàn tất task `t2` của `SQ08_PURIFY_FALLEN`.
4. **Retry & Reload:**
   - *Retry:* Nếu người chơi thua giữa trận hoặc rời vùng rồi quay lại khi chưa hạ Boss, encounter reset sạch và không bỏ qua thoại mở đầu.
   - *Reload:* Lưu và tải lại Save Schema `3` ở cả `2` mốc (trước trận & sau `boss_hooded_knight_defeated`), đảm bảo Boss không hồi sinh sau khi đã bị đánh bại (`WildlifeSystem.ts:499`) và Sổ Tay `[J]` hiển thị ký ức nhất quán.

---

## 6. Hard Stop & Hạng Mục Chờ Owner Phê Duyệt

- **Trạng thái tích hợp runtime:** **`BLOCKED`** — chưa chỉnh sửa `dialogues.json`, `EvilKnights.ts`, `lore.json`, `GameScene.ts`, `WildlifeSystem.ts`, AI, kỹ năng, vị trí spawn hay quest rewards (`0` commit/push, `0` xóa tài nguyên).
- **Cần Owner ký duyệt tại [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md):**
  1. **`DEC-LOCK-09` (`OQ-04`):** Hợp nhất `HoodedKnightBoss = Sir Mordric` (`[A]`) hay tách boss riêng (`[B]`)?
  2. **`DEC-LOCK-11` (`OQ-14/12/16`):** Chốt **số phận cuối của Mordric** (Hướng kết `1` giải thoát tan biến vs Hướng kết `2` hòa giải còn sống) và việc Vaelen chỉ xuất hiện trong ký ức/cutscene (`[ ]`).
  3. **`DEC-LOCK-10`, `DEC-LOCK-16`, `DEC-LOCK-17`:** Xử lý `Vaelen q2 vs q3`, vị trí encounter (`deep_forest` hay `veil_origin_cavern`), và duyệt nguyên văn `DLG-012..015`.