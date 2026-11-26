# HOLLOW WOODS — NARRATIVE CONFLICT REPORT (`C01–C05` & Khóa Tách Biệt Thực Thể)

- **Mission:** `HW-NARRATIVE-00B — LORE, CHARACTER & CANON REGISTRY`
- **Primary References:**
  - `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`: `Ch. 03` (`CONFLICT 01–05`), `Ch. 05`, `Ch. 06`, `Ch. 15` (`I-01..I-07`), `Ch. 17` (`NAR-001/002/003/010/014/024/025`, `DLG-025–027`, `Table 16`, `Table 18`)
  - Runtime Audit Records: `src/data/lore.json`, `src/data/dialogues.json`, `src/data/tornPagesData.ts`, `src/scenes/MainMenuScene.ts`, `src/state/PlayerState.ts`, `src/entities/EvilKnights.ts`
- **Nguyên tắc kiểm toán:** Chỉ mô tả chính xác mâu thuẫn & vị trí gây xung đột. **KHÔNG tự sửa source, KHÔNG tự chọn phương án giải quyết thay Owner, KHÔNG tự hợp nhất thực thể chưa chốt.**

---

## 1. Phân Tích Chi Tiết Năm Xung Đột Cốt Lõi (`C01` – `C05`)

### `C01` — Tự Phong Ấn Ký Ức (`Algiz`) vs Biến Cố Xuyên Thời Gian (`CONFLICT 01` / `NAR-003` / `OQ-03`)
- **Mặt đối lập 1 (Runtime Baseline — `GAME-IMPLEMENTED`):**
  - Nguồn dữ liệu `src/data/lore.json` (`lore_memory_chapter_4`, `lore_wayfarer_inner_journal`, `lore_black_knight_chronicle`), `src/data/dialogues.json` (`hooded_knight_encounter_defeat`, `campfire_knight_q3_complete`) và `EndingSystem.ts` giải thích rằng NVC vốn là **Chỉ Huy Hiệp Sĩ Đen** đã **chủ động tự phong ấn ký ức/linh hồn** để tái sinh (có nhắc cổ ngữ **`Algiz`**).
- **Mặt đối lập 2 (Hướng Mới của Owner — `PROPOSED` / `WIP`):**
  - Theo `Ch. 03` và `Ch. 17`, `Meliodas Blackwood` từng dìu dắt các kỵ sĩ trong quá khứ, nghe lời cầu cứu từ rừng già, bước theo rồi gặp **một biến cố bí ẩn đưa ông tới tương lai (Bellhollow hiện tại) trong trạng thái mất trí nhớ**.
- **Rủi ro & Ràng buộc:** Không thể đồng thời coi *"chủ động tự phong ấn để tái sinh"* và *"bị tai nạn/biến cố xuyên thời gian khi đi theo lời cầu cứu"* cùng là sự thật khách quan trừ khi Owner quyết định bỏ hẳn bản cũ, giữ một phần, hoặc coi lời kể trong cổ ngữ chỉ là giả thuyết/tin đồn sai lệch của nhân chứng (`OQ-03`, `OQ-08`).

### `C02` — Các Lời Thoại Nhận Diện "Chỉ Huy" Của Sir Vaelen (`CONFLICT 02` / `NAR-010` / `I-02` / `OQ-06`)
- **Mặt đối lập trong chính Source Hiện Hành (`GAME-IMPLEMENTED`):**
  - Ở `campfire_knight_q2_complete` (`DLG-026`, `SQ07 → SQ08`), Sir Vaelen nói: *"Trời ơi... Vị chỉ huy đáng kính của chúng ta đã biến thành Hooded Knight Boss bị sương đen sai khiến!"* (tin rằng **`HoodedKnightBoss`** chính là Chỉ Huy).
  - Ngược lại, trong `hooded_knight_encounter_intro` (`DLG-025`), chính `HoodedKnightBoss` lại nhận ra NVC (*"Chỉ... Chỉ huy?!"*), rồi tại `campfire_knight_q3_complete` (`DLG-027`), Vaelen nhìn Quân Huy Tổng Chỉ Huy & vết chém chéo để xác nhận **NVC** mới là Chỉ Huy (*"Người đứng trước mặt ta bấy lâu nay..."*).
- **Xung đột bổ sung với Hướng Mới (`Trailer V11–V12.2`):**
  - Theo hướng mới, `Vaelen` là học trò giữ lời thề (`DLG-009`, `DLG-014`), còn `Dark Knight` (`Sir Mordric`) cũng là học trò cũ (`DLG-012–013`). Nếu đưa tuyến mới vào game mà giữ nguyên `q2_complete`, tuyến nhận diện sẽ mâu thuẫn trực diện cả về vai trò lẫn thời điểm nhận ra (`OQ-06`, `OQ-11`).
- **Ràng buộc:** **Cấm tự bịa lời giải thích rằng Vaelen "nói dối" hoặc "cố ý thử NVC" ở `q2`.** Phải chờ Owner quyết định sửa nhật ký/thoại `q2` hay thiết kế hiểu lầm có chủ ý (`OQ-06`).

### `C03` — `Sir Mordric` (`Dark Knight`) và `HoodedKnightBoss` (`CONFLICT 03` / `NAR-014` / `OQ-04`)
- **Mặt đối lập 1 (Nhân vật hướng mới & Trailer):**
  - `Sir Mordric` được Owner chấp nhận về tuyến nhân vật (`ACCEPTED CHARACTER` — `CHAR-003`, `CHAR-K03`), mang vai trò Kỵ Sĩ Bóng Tối — học trò cũ của Meliodas và bạn cũ của Vaelen (`DLG-012–013`). Trong trailer `V11.7–V12.2`, cảnh hang sử dụng sprite của `Hooded Knight` làm hình ảnh đại diện cho `Dark Knight` kèm VFX riêng (`Dark Resonance`, `Abyssal Fury`).
- **Mặt đối lập 2 (Thực thể Runtime hiện tại):**
  - Trong `src/entities/EvilKnights.ts` và `src/systems/WildlifeSystem.ts`, thực thể đang chạy là **`HoodedKnightBoss`** (`hooded_knight_sheet`), thuộc tuyến phụ `SQ08_PURIFY_FALLEN` của Vaelen, rơi **`quest_corrupted_crest`**, và mang thoại `Chỉ... Chỉ huy?!` + giải thích tự phong ấn khi bại trận.
- **Ràng buộc:** Việc trailer dùng chung sprite montage **không đủ căn cứ hợp nhất danh tính**. Không được tự gán `Mordric = HoodedKnightBoss`, không tự đổi boss ID/loot/spawn cho tới khi Owner chốt `OQ-04` và `OQ-15` (Optional hay Mandatory, giữ chỗ cũ hay dời sang `veil_origin_cavern`).

### `C04` — Thời Điểm Tiết Lộ Danh Tính `Meliodas` & Spoiler Sớm (`CONFLICT 04` / `NAR-002` / `I-01`)
- **Mâu thuẫn thiết kế:** Hướng mới yêu cầu giữ bí mật danh tính quá khứ trong Hồi I (`Table 15 D0–D5`) và chỉ để tên thật **`Meliodas`** cùng mối liên hệ người thầy được hé lộ dần khi đủ chứng cứ (`Ch. 03`, `Table 11 R01`).
- **Các điểm rò rỉ (Spoiler) đang tồn tại trong Runtime (`I-01` — `Table 18`):**
  1. `src/scenes/MainMenuScene.ts` (`showChronicleAndGuideModal ~746`, `~795–798`): Tự giới thiệu ngay ở Menu là *"Ngươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi — …"* (`Table 15 D0`).
  2. `src/state/PlayerState.ts`: `setMemoryAwakeningStage(1)` mở khóa sớm `lore_memory_chapter_1`, `lore_memory_chapter_2`, và **`lore_black_knight_chronicle`** (văn bia Hiệp Sĩ Đen & phong ấn Đại Mạch Rễ). `stage ≥ 2` hoặc nhánh flag (`~615–621`) mở **`lore_wayfarer_inner_journal`** (chứa lời giải tự phong ấn). Ngoài ra còn hàm `unlockAllMemoryChapters`.
  3. `src/data/tornPagesData.ts`: Chứa văn bia `12 kỵ sĩ`, văn bia Chỉ Huy (`~249, 299–315`) kèm metadata memory stage (và dùng tên `Sir Valen`).
  4. `src/data/dialogues.json`: `hooded_knight_encounter_intro/defeat` gọi thẳng *"Chỉ... Chỉ huy?!"* và `campfire_knight_q3_complete` xác nhận Quân Huy Tổng Chỉ Huy theo lời giải cũ.
- **Ràng buộc:** Trong `00B` chỉ ghi nhận danh sách điểm lộ; **không tự sửa `MainMenuScene`, `PlayerState`, `lore.json` hay tự thay chữ `Chỉ Huy` bằng `Meliodas`**.

### `C05` — Nguồn Gốc Lời Cầu Cứu Từ Khu Rừng Già (`CONFLICT 05` / `NAR-001` / `NAR-024` / `OQ-02`)
- **Mặt đối lập 1 (Luật Sinh Tồn & Runtime Baseline):**
  - Act 0 (`GameScene.startAct0Intro`) dùng tiếng chuông đồng từ phương Đông và `The Echo` dẫn đường tới Bellhollow (`DLG-001`, `DLG-021`).
  - **Quy tắc 1 của Edda** (`edda_intro` / `lore_three_rules` / `DLG-020`) cảnh báo: **`The Listener`** chuyên mượn giọng gọi tên để săn mồi trong rừng.
- **Mặt đối lập 2 (Hướng Mới của Owner):**
  - Meliodas trong quá khứ đã nghe thấy **lời thì thầm như lời cầu cứu từ rừng già** và bước theo dẫn tới biến cố (`Ch. 03`, `Ch. 09 CS03`).
- **Ràng buộc:** Chưa có bằng chứng xác định tiếng cầu cứu đó đến từ đâu (chính khu rừng, `The Veil`, `The Listener` mồi nhử, `The Echo`, Đại Hồng Chung, hay một thực thể khác). **Cấm tự khẳng định** tiếng cầu cứu là `The Listener`, `The Echo`, hay khẳng định chắc chắn nó *khác* `The Listener` (`NAR-024`, `NAR-030`, `OQ-02`).

---

## 2. Khóa Chống Nhập Nhằng Danh Tính & Đề Xuất (`§3` Mandates)

Kiểm toán này khóa cứng `4` ranh giới sau — nghiêm cấm mọi suy diễn tự động:
1. **Nhóm Kỵ Sĩ Hắc Ám & Mất Tích (`Mordric` ≠ `Hooded` ≠ `Fallen` ≠ `Elian`):**
   - `Sir Mordric` (`CHAR-003`), `HoodedKnightBoss` (`CHAR-013`), `FallenKnightEntity` (`CHAR-014`), `FallenKnightApparition`, `Knight_2 / Knight_3` trong trailer (`NAR-018`), và `Elian` (`CHAR-012`, em trai Garth trong `SQ09_BROKEN_LANTERN`) là các hồ sơ/thực thể **độc lập**. Không gộp bất kỳ cặp nào khi chưa có `DEC-NAR-___` của Owner.
2. **Nhóm Kỵ Sĩ Cưỡi Ngựa (`Headless Warden` ≠ `Dread Horseman`):**
   - **`The Headless Warden` (`CHAR-006`, `ART-K01`)** là hướng boss mới phải vẽ nguyên bản (giáp đồng đen hoa văn rễ, choàng đỏ rượu hai tà, linh hỏa xanh bạc không cổ), tách biệt hoàn toàn khỏi **`DreadHorsemanEntity` (`CHAR-015`)** đang có trong `EvilKnights.ts` và tách khỏi pack trả phí `Mattz Art` (`ASSET-K11`).
3. **Đoàn Kỵ Sĩ (`PROPOSED` chưa khóa Canon):**
   - **`Order of the Black Wolf` (`Đoàn Kỵ Sĩ Hắc Lang`)**, hình thức huy hiệu sói, và khẩu hiệu **`Fides Ultra Tenebras`** (`NAR-K06`, `Ch. 06`) vẫn ở trạng thái **`PROPOSED`**, tuyệt đối chưa được xem là Canon chính thức hay khắc vào text/UI game.
4. **Key Legacy `Satyr` vs Boss Cinematic `Satyr`:**
   - `lore_satyr_journal` trong `content_registry.json` / `registryData.ts` là key legacy nhật ký NVC, **không** dùng làm bằng chứng hay entity ID cho `Satyr` (`CHAR-019`).
