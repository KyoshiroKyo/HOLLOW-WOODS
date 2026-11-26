# HW-NR-01 — MASTER CANON LOCK (`CỔNG KHÓA CANON CHÍNH THỨC`)

- **Mission ID:** `HW-NR-01 — MASTER CANON LOCK`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Mode:** `NARRATIVE DECISION GATE` (`HARD STOP` — `0` sửa code, `0` sửa thoại, `0` sửa quest/save, `0` tự quyết định thay Owner)
- **Dependencies:** `HW-NARRATIVE-00A` → `00H` (bao gồm [MASTER_LORE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/MASTER_LORE_REGISTRY.md), [CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md), [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md), [NARRATIVE_CONFLICT_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_CONFLICT_REPORT.md), [NARRATIVE_RESIDUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_RESIDUE_REGISTRY.md))

> **QUY TẮC THẨM ĐỊNH CANON TUYỆT ĐỐI (`Ch. 01`, `Ch. 17`):**
> Không coi mục đề xuất (`PROPOSED`), hướng tiếp nhận nhân vật (`ACCEPTED CHARACTER`), hay cảnh/thoại trailer (`TRAILER-ONLY`) là **`CANON-APPROVED`**. Mọi khoảng trống về **nguyên nhân mất trí nhớ**, **nguồn gốc lời cầu cứu**, **số năm đã trôi qua** và **danh tính bí mật chưa mở khóa** bắt buộc giữ trạng thái mở cho tới khi Owner ký duyệt trong [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md).

---

## 1. Các Quyết Định Owner Đã Duyệt & Khóa Kỹ Thuật (`CANON-APPROVED` / `Baseline Bảo Vệ`)

| Mã Quyết Định | Nội dung đã khóa chính thức | Nguồn xác minh | Trạng thái | Phạm vi ảnh hưởng |
| :--- | :--- | :--- | :---: | :--- |
| **`CHAR-K01`** | Tên thật nhân vật chính là **`Meliodas`** *(thay thế tên nháp cũ `Drager` đã bị loại bỏ)*. Không auto-reveal tên này tại Menu / Act 0 trước mốc hé lộ được duyệt. | Quy tắc ưu tiên Unified Bible, `Ch. 05`, `Ch. 16` | **`CANON-APPROVED`** | Toàn bộ UI, Lore, Dialogue, Journal, Ending (khi đến mốc reveal) |
| **`CHAR-K02`** | Danh hiệu chính thức giữ nguyên: **`Lord Blackwood`** và **`The Wolf Lord` (`Lang Chủ`)**. Thiết kế dark-fantasy độc lập cảm hứng văn học Arthur cổ, không mô phỏng nhân vật hiện đại trùng tên. Danh xưng giai đoạn mất ký ức giữ `The Mossbound Wayfarer` (`Lữ Khách Rêu Phong`) & `Black Knight`. | `Ch. 05`, `Ch. 06`, `Ch. 16` (`Table 11 R01`) | **`CANON-APPROVED`** | Định danh nhân vật chính, bìa truyện, Key Art (chú ý hình sói chỉ là art reference, không làm mount gameplay) |
| **`TECH-K14`** | Khóa toàn bộ hợp đồng kỹ thuật: `BlackKnightPlayer.ts`, Codex Black Knight V2 (`black_knight_*`, `194` files ở `Meliodas_Blackwood/`), `SaveManager.CURRENT_SCHEMA_VERSION = 3`, Main Route `7` chặng `A→E→B→D→F→E→C→A`, `determineEndingType` (`comp>=50, stage>=3, trust>=65`), Vòng Sáng Hộ Tâm `[F]`, Classic Sanity `2.1`, và bảo lưu `BUG-058/059` cho Codex. | `Ch. 10`, `Ch. 16`, `HW-CHAR-01-R2`, `00D/00G` | **`CANON-APPROVED` (Kỹ thuật)** | Bảo vệ `src/entities/`, `src/systems/`, `src/state/`, Save Schema `3` |
| **`DIR-KNIGHT`** *(Chủ trương)* | Chấp nhận định hướng phát triển tuyến nhân vật gồm `Sir Vaelen`, `Sir Mordric`, `Sir Roderick`, `Sir Aldemar` và hướng bổ sung boss cưỡi ngựa không đầu (`The Headless Warden`). | `Ch. 05`, `Ch. 16` (`CHAR-K03`, `CHAR-K04`) | **`ACCEPTED CHARACTER` / Hướng phát triển** *(Tiểu sử/Lore/Boss Design vẫn **`PROPOSED`**)* | Chỉ mở khóa lập kế hoạch, **không tự bịa** tiểu sử/vị trí/số phận |
| **`DIR-AUDIO-V12.2`** | Owner đánh giá rất tốt chất lượng âm thanh Trailer `V12.2` (`HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`: motif `D–F–E–A`, bỏ chuông lặp `14–24s` & outro không chuông). | `Ch. 13`, `Ch. 16` (`AUD-K12`), `00E` | **`TRAILER-ONLY`** *(Chuẩn nghệ thuật cho Queue Audio `NR-07`)* | Dẫn hướng làm audio stems game, không loop nguyên track `60s` |

---

## 2. Những Nội Dung Lore & Văn Bản Cũ Cần Thay Thế Hoặc Loại Bỏ (`SUPERSEDED` / `CONFLICT`)

*(Toàn bộ danh mục file & số dòng đã đối chiếu tại [NARRATIVE_RESIDUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_RESIDUE_REGISTRY.md) và [NARRATIVE_REPLACEMENT_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_REPLACEMENT_MATRIX.md); chỉ sửa runtime sau khi Owner duyệt ma trận kèm theo).*

1. **Tên nháp cũ `Drager`:** **`SUPERSEDED`** hoàn toàn bởi `Meliodas` (`CHAR-K01`). Hiện quét `src/` ghi nhận `0` chuỗi còn sót, nhưng cần giữ rule cấm xuất hiện trong mọi văn bản mới.
2. **Tàn dư cốt truyện *Isekai / Satyr* hiện đại trong hiển thị người chơi:**
   - `EndingSystem.ts:1037`: `'Satyr: “Ánh đèn pha ô tô... quốc lộ ven rừng?! Thế giới của mình... con đường về nhà có thật!”'` → Trạng thái **`SUPERSEDED` / Chờ lệnh `REMOVE FROM RUNTIME`**.
   - `VeilSystem.ts:44`: `'“Satyr... quay lại đi... con đường về nhà ở phía sau...”'` → Trạng thái **`SUPERSEDED` / Chờ lệnh `REPLACE`**.
   - *(Lưu ý: Các định danh kỹ thuật nội bộ như `lore_satyr_journal`, `SatyrPlayer.ts`, `satyr_*` compatibility animations là `KEEP` để bảo vệ Save Schema `3` & Test suite).*
3. **Thuyết *"Tự phong ấn ký ức bằng Cổ Ngữ `Algiz` để tái sinh"* (`CONFLICT C01`):**
   - Xuất hiện tại `lore_wayfarer_inner_journal` (`lore.json:77–78`), `lore_memory_chapter_4` (`lore.json:71`), `lore_black_knight_chronicle` (`lore.json:339`), `veil_commander_epistle` (`zones.json:4172–4179`, `maps/veil_origin_cavern.json:8600–8621`), `hooded_knight_encounter_defeat`, và `campfire_knight_q3_complete`. Hiện đối lập trực diện với hướng mới của Owner (`OQ-03`).
4. **Điểm rò rỉ danh tính & chức danh `Chỉ Huy Hiệp Sĩ Đen` quá sớm (`CONFLICT C04`):**
   - Đang lộ ngay từ Menu chính (`MainMenuScene.ts:797`), Stage `1` tại Xưởng Chuông (`GameScene.ts:4292,4382`, `PlayerState.ts:764–788`), `tornPagesData.ts:249,315`, `JournalModal.ts:909`, popup SQ08 `GameScene.ts:4849`, và HUD `UIScene.ts:1063`.
5. **Mâu thuẫn nhận diện nội bộ `Sir Vaelen q2 vs q3` & `HoodedKnightBoss` (`CONFLICT C02` / `C03`):**
   - `campfire_knight_q2_complete` nói Hooded là Chỉ Huy bị tha hóa, nhưng `hooded_knight_encounter_intro` (`EvilKnights.ts:833–839`, `dialogues.json`) gọi NVC là Chỉ Huy rồi `q3_complete` xác nhận NVC (`OQ-04`, `OQ-06`). Bestiary (`PlayerState.ts:930`) & `GameScene.ts:802–814` gọi Boss là `"Chỉ Huy Hiệp Sĩ Trùm Mũ"`.
6. **Lỗi chính tả & mốc thời gian chưa xác minh (`RES-003`, `OQ-08`):**
   - `Sir Valen` (thiếu `e`) tại `lore.json:85` & `tornPagesData.ts:299` → sửa thành `Sir Vaelen` (hoặc theo cấu trúc bia mới).
   - Cụm `"suốt hàng trăm năm"` tại `EndingSystem.ts:78`, `lore_ending_true` (`lore.json:155`) và `"lời nguyền trăm năm"` tại `edda_black_knight_reverence` → chờ Owner chốt mốc thời gian tại `OQ-08`.
7. **Thế chỗ mô tả mở đầu cố định nếu áp `PROPOSED` mới (`CONFLICT C05` / `DLG-001`):**
   - `GameScene.ts:1419` dùng tiếng chuông V9 ở Act 0; còn trailer `V12.2` và `Ch. 03` gợi hướng *"lời cầu cứu từ rừng"* (`OQ-02`).

---

## 3. Đề Xuất Phương Án Giải Quyết Mâu Thuẫn: Tự Phong Ấn (`Algiz`) vs Biến Cố Xuyên Thời Gian (`CONFLICT C01` — `OQ-03`)

Vì nguyên nhân mất trí nhớ là quyền quyết định tuyệt đối của Owner, dưới đây là **3 phương án trung lập** trình Owner chọn (không tự áp phương án nào trong `HW-NR-01`):

| Phương án | Cơ chế giải thích cốt truyện | Mức đồng bộ với Bible mới & Source | Điểm mạnh / Hệ quả cần lưu ý |
| :---: | :--- | :--- | :--- |
| **PA 1** *(Thay thế triệt để — Gợi ý đồng bộ 100%)* | **Bỏ hoàn toàn** giả thuyết tự phong ấn ký ức/`Algiz`/tái sinh khỏi toàn bộ `lore.json`, `dialogues.json`, `veil_commander_epistle`. Mất trí nhớ thuần túy do **biến cố bí ẩn khi Meliodas bước theo tiếng gọi từ rừng già**, đưa ông tới thời điểm tương lai. | Khớp trực tiếp định hướng mới của Owner (`Ch. 03`, `NAR-003`). | Mạch truyện từ Đầu đến Cuối đồng nhất, dễ hiểu nhất; cần viết lại trọn bộ `RES-006..011`. *(Cổ ngữ `Algiz` vẫn giữ làm cổ ngữ dẫn đường vật lý trên cọc đầm lầy ở `lore_broken_sword_mire` mà không dùng làm phép xóa ký ức).* |
| **PA 2** *(Giả thuyết sai của nhân chứng cũ)* | Hướng mới *(biến cố xuyên thời gian khi đi theo lời gọi)* là **sự thật Canon duy nhất**; còn truyền thuyết *"Chỉ Huy tự phong ấn ký ức vào Mạch Rễ"* trong văn bia `veil_commander_epistle` / `lore_black_knight_chronicle` được giữ lại nhưng đổi khung thành **lời đồn/giả thuyết sai lầm của hậu thế** khi tìm không thấy xác ông. | Bảo toàn một phần cảm giác trinh thám tàn tích của game cũ. | Tạo được plot-twist ở Hồi III khi đối chiếu sự thật thật với bia đá cũ; nhưng phải viết khéo để người chơi mới không nhầm 2 sự thật (`CONFLICT 01`). |
| **PA 3** *(Dung hợp hai lớp biến cố)* | Meliodas đi theo lời cầu cứu vào tâm điểm dị biến thời gian; trong khoảnh khắc `The Veil` cố xâm chiếm tâm trí khi bị cuốn qua ranh giới thời đại, ông **kích hoạt ấn ký bảo hộ (`Algiz` hoặc Hộ Tâm)** dẫn tới hệ quả phong ấn mất ký ức khi trôi dạt tới Bellhollow tương lai. | Cố gắng giữ cả 2 yếu tố làm một chuỗi nhân-quả. | Ít đụng cấu trúc câu cũ nhất, nhưng khiến nguyên nhân trở nên phức tạp hơn; Owner cần xác nhận rõ có muốn nhắc tên `Algiz` hay không. |

---

## 4. Hồ Sơ Định Danh `6` Nhân Vật Trọng Tâm (`Canon` vs `Proposed` vs `Conflict`)

| Nhân vật | Phần Đã Khóa / Runtime Baseline | Phần Đang **`PROPOSED`** / **`TRAILER-ONLY`** / **`CONFLICT`** | Giới hạn CẤM tự suy diễn |
| :--- | :--- | :--- | :--- |
| **1. `Meliodas Blackwood`** (`CHAR-001`) | **`CANON-APPROVED`:** Tên **`Meliodas`**, danh hiệu **`Lord Blackwood`**, **`The Wolf Lord` (`Lang Chủ`)**. Runtime: `The Mossbound Wayfarer`, `BlackKnightPlayer.ts`, Codex BK V2 (`194` files). | **`PROPOSED`:** Vai trò **Người Thầy** từng dìu dắt `Vaelen & Mordric`; nghe tiếng gọi rừng già gặp biến cố xuyên thời gian. **`CONFLICT` (`OQ-01/03/20`):** Đồng tồn tại hay đổi chức *Chỉ Huy*, nguyên nhân mất trí nhớ & mốc reveal tên. | Không phải Dark Knight; hình sói chỉ là Visual Reference (không thêm Wolf Mount gameplay). |
| **2. `Sir Vaelen`** (`CHAR-002` — *The Silent Knight*) | **`GAME-IMPLEMENTED`:** NPC Trạm Lửa `outer_woods (1435..1470, 710)`, giữ lửa & `SQ06–SQ08`, thoại baseline `17` keys. | **`PROPOSED`:** Học trò của Meliodas & bạn thân của Mordric. **`TRAILER-ONLY`:** `DLG-009` (*"Có những lời thề..."*), `DLG-014–015` (cảnh hang hỗ trợ). **`CONFLICT C02` (`OQ-06/11/16`):** Nhận diện `q2` vs `q3`, thời điểm nhận ra NVC. | Không cho tự bỏ trạm lửa đi theo làm companion toàn map (`OQ-16`). Sửa lỗi chính tả `Sir Valen`. |
| **3. `Sir Mordric`** (`CHAR-003` — *The Dark Knight*) | **`ACCEPTED CHARACTER`:** Được Owner chấp nhận về tuyến nhân vật Kỵ Sĩ Bóng Tối (`CHAR-K03`). Chưa có entity/texture key riêng xác minh trong source. | **`PROPOSED`:** Học trò Meliodas, bạn cũ của Vaelen; tâm lý oán trách người thầy vắng mặt. **`TRAILER-ONLY`:** `DLG-012–013`, sprite mượn Hooded + VFX tím (`Dark Resonance`, `Abyssal Fury`). **`CONFLICT C03` (`OQ-04/14/15`):** Có phải `HoodedKnightBoss` không & số phận cuối. | **CẤM** đồng nhất với `Elian` (em Garth) hoặc mặc định = `FallenKnightEntity` / `HoodedKnightBoss`. |
| **4. `Sir Roderick`** (`CHAR-004` — *The Crimson Knight*) | **`ACCEPTED CHARACTER`:** Tên & danh hiệu *The Crimson Knight* (`CHAR-K03`). Chưa có trong runtime. | **`PROPOSED`:** Tính cách trọng danh dự & nghĩa vụ; tạo hình giáp thép + áo choàng đỏ rượu (`00F`: có thể dùng `heavy_knight_free.zip` làm **ref tạo hình**, không dùng thẳng side-view). **`OQ-K04`:** Quan hệ thầy trò, vị trí, quest & kết cục. | **CẤM** gán tên cho `Knight_2` trong cảnh hang trailer (`OQ-07`). |
| **5. `Sir Aldemar`** (`CHAR-005` — *The Ashen Knight*) | **`ACCEPTED CHARACTER`:** Tên & danh hiệu *The Ashen Knight* (`CHAR-K03`). Chưa có trong runtime. | **`PROPOSED`:** Người gìn giữ di vật & ký ức; tạo hình giáp xám tro/đồng cũ (`00F`: `Knight.zip` Maxime Nourry làm ref/Rest NPC nếu dựng lại top-down). **`OQ-K04`:** Quan hệ với Meliodas, di tích, còn sống hay đã mất. | **CẤM** tự đặt bí mật hay gán tên cho `Knight_3` trong cảnh hang trailer (`OQ-07`). |
| **6. `The Headless Warden`** (`CHAR-006`) | **Chấp nhận hướng phát triển (`CHAR-K04`):** Bổ sung Boss cưỡi ngựa không đầu mới; đặc tả nghệ thuật nguyên bản `ART-K01` (`00G` — giáp tối hoa văn rễ đồng, choàng đỏ rượu 2 tà, chiến mã tối, linh hỏa xanh bạc `128×128`). | **`PROPOSED`:** Tên chính thức *The Headless Warden*, lore (vệ thần di tích?), bộ kỹ năng chiến đấu, vị trí xuất hiện (`sunken_crypt_ruins` / `veil_origin_cavern`?) & phần thưởng (`OQ-HW-BOSS`). | **CẤM** gán là `DreadHorsemanEntity` (`CHAR-015`) hay `Elian`; **CẤM** trace/rip `Mattz Art` (`ASSET-K11`). |

---

## 5. Trạng Thái `Order of the Black Wolf` (`NAR-K06` — `OQ-K06`)

- **Trạng thái hiện tại:** **`PROPOSED`** *(CHƯA PHẢI CANON-APPROVED)*.
- **Các yếu tố thuộc gói đề xuất (`Ch. 06` & `Ch. 16`):**
  1. Tên tổ chức: **`Order of the Black Wolf`** (*Đoàn Kỵ Sĩ Hắc Lang*).
  2. Khẩu hiệu Latin đề xuất: **`Fides Ultra Tenebras`** (*Lòng trung thành vượt qua bóng tối*).
  3. Huy hiệu: Dấu sói / giáp đen ánh đồng (gắn với danh hiệu `The Wolf Lord` của Meliodas).
- **Những phần bắt buộc giữ `UNKNOWN`:** Ngày thành lập, hệ thống cấp bậc chi tiết, lãnh địa đóng quân, toàn văn lời thề gia nhập đoàn, và danh sách đầy đủ của *"bia 12 kỵ sĩ"* (ngoài các cái tên đang nằm trong `lore_knights_memorial_stele`). Tuyệt đối chưa đưa tên `Order of the Black Wolf` / `Fides Ultra Tenebras` vào `lore.json`, Menu hay UI cho tới khi Owner chốt **`OQ-K06`**.

---

## 6. Đề Xuất Thứ Tự Tiết Lộ Bí Mật Trong Gameplay (`Anti-Spoiler Discovery Curve`)

*(Đề xuất trình tự lộ thông tin khớp `Timeline B D0–D7` nhằm bảo vệ bí ẩn cốt truyện — mốc kích hoạt `Meliodas` chính thức chờ Owner khóa tại `OQ-20`):*

1. **Màn hình Menu / Loading / Opening `28s` (`D0`):** Chỉ giới thiệu thế giới bị `The Veil` cô lập, Ánh Sáng Hộ Tâm `[F]`, bóng lưng **người thầy vô danh** & hai kỵ sĩ trẻ (không mặt/không tên), tiếng gọi mơ hồ (`CS03`). **ẤN TƯỢNG MỞ ĐẦU = 0% SPOILER (`0` chữ `Meliodas`, `0` chữ `Chỉ Huy`).**
2. **Bellhollow (`D1–D2`: Garth, Edda, Neris, Bram, Finn):** Nắm 3 Quy Tắc, thảm họa nứt Đại Hồng Chung & tìm Clapper. Edda & dân làng chỉ cảm nhận ánh nhìn/dáng đứng quen thuộc mà chưa gọi tên thật.
3. **Outer Woods / Trạm Lửa & Đầm Lầy (`D3`):** Gặp `Sir Vaelen` & nhặt huy hiệu ở `silent_mire`; cảm giác *"đã từng quen"* qua lời thề chưa quên của Vaelen (`DLG-009` nếu duyệt).
4. **Xưởng Chuông / Hầm Rễ / Rừng Sâu (`D4` — `Stage 1–2`):** Đọc văn bia cổ và nhật ký *nhiều góc nhìn không đồng nhất* (`memory_chapter_1..2`); gợi manh mối về một vị *Thầy / Thủ Lĩnh Hắc Lang* mất tích nhưng **chưa ghép thẳng tên `Meliodas` cho người chơi**.
5. **Đối Mặt Kỵ Sĩ Bóng Tối (`D5` — Theo nhánh `OQ-04/15`):** Đối phương nhận ra dáng đứng/kiếm pháp/Hộ Tâm của người thầy năm xưa (*"Năm ấy, ngài dạy ta..."*), đặt câu hỏi về sự vắng mặt của thầy mà vẫn chưa tung toàn bộ câu trả lời thời gian.
6. **Hội Tụ Ký Ức `Stage 3` → `First Toll` (`D6–D7` — Mốc Reveal Chờ `OQ-20`):** Khi đủ chứng cứ từ Vaelen (huy hiệu + lời thề `Q05/SQ08`) hoặc trước nghi thức `The First Toll` tại Bellhollow, Sổ Tay (`[J]`), HUD & Kết Thúc mới chính thức gọi tên thật **`Meliodas Blackwood — The Wolf Lord`**.

---

## 7. Các Yếu Tố Lore Cũ Cần Giữ Lại Nguyên Vẹn (`BASELINE PRESERVED / KEEP`)

Dù đồng bộ lại cốt truyện mới, **toàn bộ `9` trụ cột thế giới hiện hành dưới đây phải được bảo toàn**:
1. **Làng Bellhollow & Màn sương `The Veil`:** Ngôi làng cổ bị cô lập bởi màn sương tước đoạt tinh thần (*Composure*); `Mùa Sương Lạnh` kéo dài đến khi thực hiện `The First Toll`.
2. **Thảm họa Đại Hồng Chung:** Đêm biến cố `7` hồi chuông khiến Đại Hồng Chung rạn nứt và `Lưỡi Chuông Đồng (Clapper)` rơi xuống đầm lầy (`edda_bell_shatter_secret`, `lore_clapper_curse`).
3. **Ba Quy Tắc Bằng Máu của Edda (`lore_three_rules`):** (1) Không trả lời khi sương gọi đúng họ tên mình; (2) Không đi theo chiếc đèn thứ hai trong sương; (3) Không rung chuông khi màn sương đã tràn qua hàng rào làng.
4. **Phân tách `The Listener` vs `The Echo`:** `The Listener` săn theo âm thanh & nhại giọng; `The Echo` là dư ảnh dẫn đường không gây sát thương vật lý (`ListenerAI.ts` & `EchoSystem.ts`).
5. **`Mire Warden` (`Kẻ Nuốt Tiếng Chuông`):** Cựu bảo hộ Mạch Rễ gắn với `3` trụ phong ấn tại `broken_bell_shrine` và Lưỡi Chuông Đồng (`BossMireWarden.ts`).
6. **Hệ Sinh Tồn Làng Bellhollow:** `Garth` & tuyến mất tích em trai **`Elian`** (`SQ09_BROKEN_LANTERN`, tách biệt với Dark Knight); `Neris` & nghiên cứu thảo dược trị chứng sương mù (*Hội Chứng Trắng Não*, giữ ở góc nhìn y học dân làng); `Bram` & hợp kim đồng cổ (`SQ01`); `Finn` & lời đồn giếng nước (`SQ05`).
7. **Kỷ Vật & Địa Danh Thuần Túy:** `lore_bellmaker_dew_journal`, `lore_ancient_oak_hollow`, `lore_root_cellar_alchemy`, `lore_stone_chessboard`, `lore_shrine_parchment_map`, `lore_runestones`.
8. **Tuyến Chính `7` Chặng & Hệ Thống Cổng:** `A → E → B → D → F → E → C → A` và toàn bộ `WorldGatingSystem`.
9. **Ba Ngưỡng Kết Thúc & `Vòng Sáng Hộ Tâm [F]`:** `determineEndingType` (`comp>=50, stage>=3, trust>=65`) & `Classic Sanity 2.1`.
