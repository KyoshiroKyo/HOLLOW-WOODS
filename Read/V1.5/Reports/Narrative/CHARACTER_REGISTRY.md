# HOLLOW WOODS — CHARACTER REGISTRY

- **Mission:** `HW-NARRATIVE-00B — LORE, CHARACTER & CANON REGISTRY`
- **Primary References:**
  - [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md) (Mục `3`, `6`, `9`)
  - `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`: `Ch. 05` (`CHAR-001–019`, `Tables 01–02`), `Ch. 06`, `Ch. 11` (`ART-K01`, `ASSET-K01–11`), `Ch. 16` (`CHAR-K01–04`, `ART-K08–09`), `Ch. 17` (`CH-01–15`, `Table 16`)
  - Verified Git Forensics Report: [HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md)

---

## 1. Nhân Vật Trung Tâm & Đoàn Kỵ Sĩ (`CHAR-001` – `CHAR-006`)

### `CHAR-001` (`CH-01`) — Lord Meliodas Blackwood
- **Danh tính & Danh xưng:**
  - Tên thật chính thức: **`Meliodas`** (`CHAR-K01`, `CANON-APPROVED` thay cho tên cũ *`Drager`* đã `SUPERSEDED`).
  - Danh hiệu giữ nguyên: **`Lord Blackwood`**, **`The Wolf Lord` (`Lang Chủ`)** (`CHAR-K02`).
  - Danh xưng kỹ thuật / khi mất ký ức: **`The Mossbound Wayfarer` (`Lữ Khách Rêu Phong`)**, **`Black Knight`**. (*`The Forgotten Commander`* chỉ là ý tưởng đặt tên, chưa chốt chính thức trên UI).
  - Tên gốc lấy cảm hứng từ văn học Arthur cổ; tạo hình dark-fantasy độc lập, không mô phỏng nhân vật hiện đại trùng tên (`Ch. 06`).
- **Quá khứ:**
  - *Baseline (`GAME-IMPLEMENTED`):* Chỉ Huy Hiệp Sĩ Đen năm xưa, tự nguyện phong ấn ký ức/linh hồn (`Algiz`, tái sinh) rồi tỉnh dậy ở bìa rừng (`CONFLICT 01`).
  - *Hướng mới (`PROPOSED` Owner):* Người thầy từng dìu dắt các kỵ sĩ (gồm `Sir Vaelen` và `Sir Mordric`), nghe lời cầu cứu từ rừng già, bước theo rồi gặp biến cố bí ẩn đưa tới Bellhollow ở thời điểm tương lai trong trạng thái mất ký ức. Chức Chỉ Huy có thể đồng tồn tại hoặc điều chỉnh (`OQ-01`).
- **Vai trò:** Nhân vật chính (Player) — sinh tồn, giữ Vòng Sáng Hộ Tâm `[F]`, khám phá ký ức, giúp Bellhollow khôi phục Lưỡi Chuông Đồng.
- **Quan hệ:** Người thầy/người dìu dắt của `Vaelen` và `Mordric` (`PROPOSED`); liên hệ cụ thể với `Roderick` và `Aldemar` đang chờ duyệt; đồng hành/hỗ trợ dân làng Bellhollow (`Edda`, `Garth`, `Neris`, `Bram`, `Finn`). NVC **KHÔNG PHẢI** Dark Knight.
- **Bí mật / Khoảng trống (`UNKNOWN` / `CONFLICT`):** Nguyên nhân mất ký ức (`OQ-03`), nguồn tiếng cầu cứu (`OQ-02`), thời gian thất lạc (`OQ-08`), thời điểm lộ tên `Meliodas` (`CONFLICT 04`).
- **Asset & Kết quả `HW-CHAR-01-R2`:**
  - *Runtime keys hiện hành (`GAME-IMPLEMENTED`, giữ nguyên):* `BlackKnightPlayer.ts`, `BlackKnightAnimations.ts`, `black_knight_armed_idle`, `black_knight_movement`, `black_knight_core_combat`, `black_knight_defense`, `black_knight_extended_skills`, `black_knight_conversion_{actions,air,combat,motion,states}`, `black_knight_portrait.png` (`64×64`), pivot `(0.5, 1.0)`, scale `1.50`.
  - *Trạng thái Black Knight V2 (Reconciled):* Master Bible (`Ch. 05` & `ART-K08`) ghi *"chưa tìm được file hoặc commit"*, nhưng nhiệm vụ **`HW-CHAR-01-R2` ĐÃ TRUY VẾT & KHÔI PHỤC 100%** từ GitHub (`cb8ba12b..6bb15b80`): `169` tệp trong Backup ([SHA-256 ZIP `8fef3b3b...`](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Backups/BLACK_KNIGHT_V2_RECOVERED_20261126_162326.zip)) và `194` tệp trong thư viện chuẩn hóa `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Pixel_Art\01_Characters\Player\Meliodas_Blackwood\` (`03_Sprites/` `32` spritesheet 4 hướng, `04_Animations/` `12` GIF, `05_Atlases/` `10` cặp Atlas PNG/JSON). *(Lưu ý lỗi chạy phóng to / idle mờ & phần sheet trung gian chưa push của Codex Cloud đã ghi nhận trong `HW-CHAR-01-R2`).*
- **Trạng thái:** **Canon:** `CANON-APPROVED` cho tên `Meliodas` + giữ `Lord Blackwood` / `The Wolf Lord`; vai trò người thầy `PROPOSED`. **Implementation:** Entity/Atlases V2 `GAME-IMPLEMENTED`; đổi tên hiển thị `Meliodas` trong UI/lore/dialogue `IMPLEMENTATION-PENDING`.

### `CHAR-002` (`CH-03`) — Sir Vaelen, The Silent Knight (`Kỵ Sĩ Trầm Mặc`)
- **Danh tính:** `Sir Vaelen` — Kỵ Sĩ Trầm Mặc (*lưu ý: `tornPagesData.ts` còn bản ghi tên `Sir Valen`, không tự sửa khi chưa duyệt*).
- **Quá khứ:** *Baseline:* Kỵ sĩ nhận lệnh Chỉ Huy ở lại giữ trạm lửa. *Hướng mới (`PROPOSED`):* Từng là học trò của Meliodas và là bạn thân của Mordric; mang ánh vàng trắng của lời thề chưa bao giờ từ bỏ.
- **Vai trò:** NPC trạm lửa `outer_woods` `(1470, 710)`, giữ lửa, ban chúc phúc nghỉ ngơi, phụ trách chuỗi side quest `SQ06_KEEP_FIRE` → `SQ07_LOST_COMRADES` → `SQ08_PURIFY_FALLEN`, kiểm tra huy hiệu & rèn `quest_purification_key` (`Q05_SOLVE_MIRE`).
- **Quan hệ:** Học trò trung thành của NVC (`PROPOSED`); bạn cũ đối lập niềm tin với `Sir Mordric` (`PROPOSED`); liên hệ với `HoodedKnightBoss` trong `q2/q3` đang mâu thuẫn (`CONFLICT 02`).
- **Bí mật / Giới hạn:** Mức độ biết sự thật xuyên thời gian & thời điểm nhận ra NVC (`OQ-11`); `q2_complete` tin Hooded là Chỉ Huy rồi `q3_complete` nhận NVC (`OQ-06`); vai trò vào hang hỗ trợ trong trailer (`DLG-014–015`) là `TRAILER-ONLY` — **cấm tự biến thành companion chạy khắp map (`OQ-16`)**.
- **Asset:** Runtime giữ `campfire_knight_idle_sheet`, `campfire_knight_pray_sheet`, `17` key trong `dialogues.json`. Raw `2D_SL_Knight_v1.0_3.zip` (`128×64`, `Slide.png`...) mới dùng cinematic/đề xuất `vaelen_actions` (`Table 01`).
- **Trạng thái:** **Canon:** Baseline giữ + học trò/bạn Mordric `PROPOSED`, thoại `DLG-009/014–015` `TRAILER-ONLY`. **Implementation:** `GAME-IMPLEMENTED` (NPC trạm lửa); `vaelen_actions` & companion `IMPLEMENTATION-PENDING`.

### `CHAR-003` (`CH-04`) — Sir Mordric, The Dark Knight (`Kỵ Sĩ Bóng Tối`)
- **Danh tính:** `Sir Mordric` — tên làm việc `Dark Knight` (`Kỵ Sĩ Bóng Tối`).
- **Quá khứ:** Từng là học trò của `Meliodas` và bạn thân của `Sir Vaelen` (`PROPOSED`). Trailer `V11.7–V12.2` thể hiện sự oán trách người thầy vì vắng mặt khi bóng tối tìm đến (`DLG-012–013`), nhưng không khẳng định ác tuyệt đối hay chủ động phản bội (`NAR-016`).
- **Vai trò:** Nhân vật đối trọng trung tâm trong Hồi III (`Draft V2`) & cảnh hang trailer (`51–65s`).
- **Quan hệ:** Học trò Meliodas, bạn cũ của Vaelen (`PROPOSED`); **CHƯA đồng nhất** với `HoodedKnightBoss` (`CONFLICT 03` / `OQ-04`) và **CẤM đồng nhất** với `Elian` hoặc `FallenKnightEntity`.
- **Bí mật / Giới hạn:** Số phận cuối cùng (`OQ-14`), nguyên nhân sa vào bóng tối / mức độ ảnh hưởng bởi The Veil (`NAR-016`), dấu hiệu nhận ra thầy (`OQ-12`).
- **Asset:** Chưa có texture/entity riêng xác minh trong game; trailer `V12` mượn sprite `Hooded Knight` + VFX tím đen (`Dark Resonance`, `Abyssal Fury` chỉ là hướng cinematic, `NAR-027`).
- **Trạng thái:** **Canon:** `ACCEPTED CHARACTER`; tiểu sử & quan hệ `PROPOSED`; thoại `DLG-012–013` `TRAILER-ONLY`. **Implementation:** `IMPLEMENTATION-PENDING` / `CONFLICT` với `HoodedKnightBoss`.

### `CHAR-004` — Sir Roderick, The Crimson Knight
- **Danh tính:** `Sir Roderick` — Hiệp Sĩ Đỏ Thẫm (`Ch. 05`, `CHAR-K03`).
- **Quá khứ & Vai trò (`PROPOSED`):** Hình tượng trọng danh dự, nghĩa vụ, giáp thép & áo choàng đỏ rượu. Tuyến nhiệm vụ phụ mở rộng, **không khóa main route**.
- **Quan hệ:** Thành viên tuyến kỵ sĩ mới; quan hệ học trò trực tiếp với Meliodas và quan hệ với Vaelen/Mordric chưa chốt (`Ch. 16` câu hỏi #7).
- **Bí mật / Giới hạn:** Địa điểm xuất hiện, số phận, quest và hội thoại đều `UNKNOWN` / chưa duyệt. **CẤM gán cho `Knight_2` trong trailer** (`OQ-07`).
- **Asset:** Ứng viên tham chiếu `ASSET-K05` (Bongseng), `ASSET-K06` (Jahnu Heavy Knight `64×64` trả phí — không ưu tiên ngân sách 0, cấm dùng preview), `ASSET-K07` (Mystic Autumn free/CC0 prototype). Chưa sở hữu asset chính thức.
- **Trạng thái:** **Canon:** `ACCEPTED CHARACTER` (tiểu sử `PROPOSED`). **Implementation:** `IMPLEMENTATION-PENDING` (chưa có trong source).

### `CHAR-005` — Sir Aldemar, The Ashen Knight
- **Danh tính:** `Sir Aldemar` — Hiệp Sĩ Tro Tàn (`Ch. 05`, `CHAR-K03`).
- **Quá khứ & Vai trò (`PROPOSED`):** Hình tượng người gìn giữ di vật và ký ức; giáp xám tro / đồng cũ, sắc xanh xám. Có thể gắn nhật ký/di tích ở nhiệm vụ phụ sau duyệt (`sunken_crypt_ruins` v.v.).
- **Quan hệ:** Thành viên tuyến kỵ sĩ mới; mức độ liên hệ trực tiếp với Meliodas chưa khóa Canon.
- **Bí mật / Giới hạn:** Không tự đặt bí mật, không mặc định còn sống hay đã mất, **CẤM gán cho `Knight_3` trong trailer**.
- **Asset:** Ứng viên `ASSET-K04` (`Maxime Nourry 64×64` — chưa xác minh đủ license & góc nhìn top-down).
- **Trạng thái:** **Canon:** `ACCEPTED CHARACTER` (tiểu sử `PROPOSED`). **Implementation:** `IMPLEMENTATION-PENDING`.

### `CHAR-006` — The Headless Warden (`Kỵ Sĩ Không Đầu`)
- **Danh tính:** `The Headless Warden` (`CHAR-K04`, `ART-K01`).
- **Quá khứ & Vai trò (`PROPOSED`):** Boss cưỡi ngựa không đầu do Owner yêu cầu bổ sung hướng phát triển; ý tưởng có thể là người gác di tích giữ lời thề nhưng thân phận, lore, encounter & quest hoàn toàn `PROPOSED`.
- **Quan hệ:** Chưa xác định liên hệ với Đoàn Hắc Lang; **KHÔNG tự đồng nhất** với `DreadHorsemanEntity` hoặc kỵ sĩ mất tích `Elian`.
- **Bí mật / Giới hạn:** Chờ Owner duyệt lore & vị trí bản đồ (`OQ-15`, `Ch. 16` #9).
- **Asset:** **Đặc tả nguyên bản `ART-K01`:** Ngựa giáp đồng hoa văn rễ, áo choàng đỏ rượu hai tà, linh hỏa xanh bạc tách lớp overlay trong suốt, canvas `128×128` hoặc `160×160` 4 hướng top-down (đối chiếu concept `HW\Trailer\Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png`). **CẤM mua/trace/rip** pack trả phí `ASSET-K11` (`Mattz Art — Headless Horseman`).
- **Trạng thái:** **Canon:** Hướng boss Owner chấp nhận; danh xưng, lore, kỹ năng `PROPOSED`. **Implementation:** `IMPLEMENTATION-PENDING` (chưa tạo spritesheet).

---

## 2. Dân Làng Bellhollow & Nhân Vật Phụ (`CHAR-007` – `CHAR-012`)

| ID | Tên & Vai trò | Quá khứ & Bí mật | Quan hệ | Asset & Keys Runtime | Canon / Impl Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CHAR-007` (`CH-02`)** | **Edda — Người Giữ Chuông** | Nắm lịch sử Đại Hồng Chung nứt sau 7 hồi chuông & 3 quy tắc (`edda_bell_shatter_secret`). Chưa xác định có sống cùng thời Meliodas không (`OQ-10`); trailer `DLG-006–007` gợi "ngày ngươi rời đi". | Trụ cột tinh thần Bellhollow; dẫn dắt NVC sau Garth (`Q01→Q02`). Không gán là kẻ gọi NVC. | `edda_idle_sheet`, `9` dialogue keys (`edda_*`), `lore_three_rules`, portrait & thẻ thoại trailer `d18d7b85.jpg`. | Baseline `CANON/GAME-IMPLEMENTED`; `DLG-006–007` `TRAILER-ONLY`. |
| **`CHAR-008` (`CH-10`)** | **Garth — Người Gác Cổng** | Người tuần tra/gác Cổng Đông; anh trai của **Elian** mất tích (`SQ09_BROKEN_LANTERN`). | Dẫn NVC gặp Edda (`Q01`); hướng dẫn về Elian & Mire; **cấm đồng nhất Elian = Mordric**. | `garth_walk_sheet`, `10` dialogue keys (`garth_*`). | Baseline `GAME-IMPLEMENTED`; bản rút gọn thoại `PROPOSED` (`DLG-024`). |
| **`CHAR-009` (`CH-11`)** | **Neris — Người Chữa Thảo Mộc** | Nghiên cứu *Hội Chứng Trắng Não* do sương (`neris_fog_sickness_story`); không chứng minh sương là nguyên nhân mất trí nhớ riêng của NVC. | Chữa trị, bán/chế tạo thuốc (`food_calming_tea`, `item_herbal_poultice`), quest `Q02→Q03`, `SQ03`. | `neris_idle_sheet`, `9` dialogue keys (`neris_*`), `lore_herbalist_note`. | Baseline `GAME-IMPLEMENTED`; lựa chọn mẫu `Table 04` `PROPOSED`. |
| **`CHAR-010` (`CH-12`)** | **Bram — Thợ Rèn** | Mang mặc cảm quá khứ (`bram_guilt_story`); nắm kiến thức hợp kim chuông, điểm yếu kỵ sĩ, phụ giúp rèn `quest_purification_key`. | Thợ rèn làng; **không tự bịa** từng rèn vũ khí cho Meliodas nếu chưa có tài liệu. | `blacksmith_sheet`, `6` dialogue keys (`bram_*`), `SQ01_RUNED_IRON`. | Baseline `GAME-IMPLEMENTED`; lựa chọn mẫu `Table 04` `PROPOSED`. |
| **`CHAR-011` (`CH-13`)** | **Finn — Cậu Bé Đưa Tin** | Kể tin đồn giếng nước như có tiếng chuông gọi cứu (`finn_whispers_well` — chỉ là suy đoán của NPC) và các kho bí mật (`SQ05`). | Cậu bé liên lạc làng; phải bảo vệ tính an toàn vai trò NPC. | `errand_boy_walk_sheet`, `5` dialogue keys (`finn_*`). | Baseline `GAME-IMPLEMENTED`; câu sau cờ Satyr `Table 04` `PROPOSED`. |
| **`CHAR-012` (`CH-14`)** | **Elian** | Kỵ sĩ giáp bạc mang đèn tuần tra bị mất tích, để lại thư chưa gửi (`lore_elian_unsent_letter`). Số phận hiện tại `UNKNOWN`. | Em trai ruột của **Garth**. **CẤM gán là Dark Knight / Hooded / `Knight_2/3`.** | Liên quan `SQ09_BROKEN_LANTERN`, `lore_elian_unsent_letter`. Chưa có NPC sống/boss entity xác nhận. | Baseline `GAME-IMPLEMENTED` (lore/quest); chân thân `UNKNOWN`. |

---

## 3. Boss & Thực Thể Hiện Hành (`CHAR-013` – `CHAR-019` + 7 Nhóm Quái Phụ)

| ID | Thực thể / Boss | Danh tính, Quá khứ & Bí mật | Quan hệ & Xung đột | Asset & Code Runtime | Canon / Impl Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CHAR-013` (`CH-05`)** | **Hooded Knight (`HoodedKnightBoss`)** | Boss kỵ sĩ trùm mũ bị `The Veil` ảnh hưởng; trong baseline tự nhận ra Chỉ Huy (`"Chỉ... Chỉ huy?!"`) và kể lời giải tự phong ấn/tái sinh khi bại trận. | Rơi `quest_corrupted_crest` (`SQ08`); `Vaelen q2` tin là Chỉ Huy (**`CONFLICT 02`**); liên kết với **`Sir Mordric`** đang **`CONFLICT 03` (`OQ-04`)**. | `src/entities/EvilKnights.ts` (`intro ~837`, `defeat ~1006`), `WildlifeSystem.ts` (`~502`), `hooded_knight_sheet` (`160×160`), `portrait_hooded_knight`. | `GAME-IMPLEMENTED` (Baseline); danh tính & defeat dialogue `CONFLICT`. |
| **`CHAR-014` (`CH-06`)** | **Fallen Knight (`FallenKnightEntity` & `Apparition`)** | Tàn quân đoàn kỵ sĩ bị sương tha hóa, không tên riêng. Apparition là ảo ảnh khi Composure/Sanity thấp, không collider. | Không đồng nhất tự động với `Mordric`, `Hooded`, `DreadHorseman` hay 2 thuộc hạ `Knight_2/3` (`OQ-07`). | `fallen_knight_sheet`, `EvilKnights.ts`, `FallenKnightApparition.ts` (không physics, `0` key dialogue riêng). | `GAME-IMPLEMENTED`; `Knight_2/3` `TRAILER-ONLY`. |
| **`CHAR-015`** | **Dread Horseman (`DreadHorsemanEntity`)** | Kỵ binh hắc ám nguồn (`garth_horseman_tactics`). | **Tách biệt** hoàn toàn khỏi `The Headless Warden` (`CHAR-006`) cho tới khi Owner quyết định khác. | `dread_horseman_sheet`, `EvilKnights.ts`. | `GAME-IMPLEMENTED`. |
| **`CHAR-016` (`CH-07`)** | **Mire Warden (`Kẻ Nuốt Tiếng Chuông`)** | Người bảo hộ Mạch Rễ cổ xưa tại `broken_bell_shrine`, gắn với 3 trụ & Lưỡi Chuông (`lore_mire_warden_memory`). | Boss main route chặng 7 (`Q06`). Không gắn quan hệ thầy trò hay nguồn cầu cứu. | `src/entities/BossMireWarden.ts` (GameScene import chính) & `MireWardenBoss.ts`, `6` spritesheets `boss_wetlands_*`. | `GAME-IMPLEMENTED`; trailer `DLG-016–017` `TRAILER-ONLY`. |
| **`CHAR-017` (`CH-08`)** | **The Listener (`Kẻ Lắng Nghe`)** | Thực thể mượn giọng người thân gọi tên để săn theo tiếng động (Quy tắc 1 Edda). | Độc lập với `The Echo`; chưa xác định liên hệ với lời cầu cứu (`CONFLICT 05` / `OQ-02`). | `src/entities/TheListener.ts`, `src/systems/ListenerAI.ts`, `the_listener.png` (`0` dialogue key riêng). | `GAME-IMPLEMENTED`. |
| **`CHAR-018` (`CH-09`)** | **The Echo (`Bóng Mờ Ký Ức`)** | Hiện tượng tiếng vọng dẫn đường tại Act 0 và quanh bản đồ; không hitbox sát thương vật lý. | Độc lập với `The Listener`; dẫn đường tới Bellhollow & cổ ngữ (`DLG-021–023`). | `src/entities/TheEcho.ts`, `src/systems/EchoSystem.ts`, `the_echo.png`. | `GAME-IMPLEMENTED`. |
| **`CHAR-019` (`CH-15`)** | **Satyr** | Hình bóng truy đuổi gây áp lực Bình Tâm trước cảnh hang trong trailer `V11.x–V12.2`; concept âm nhạc *"The Harvester of Memories"*. | Xuất hiện điện ảnh sau Mire Warden (`44–51s`); nguồn gốc & vai trò thật `UNKNOWN` (`OQ-13`). | `satyr_portrait` & `SatyrAnimations.ts` lịch sử (`mossbound_wayfarer` cũ). **Cấm dùng `lore_satyr_journal` làm entity ID.** | `TRAILER-ONLY` / `PROPOSED` (`OQ-13`). |
| **7 Nhóm Phụ** | `Shadow Behemoth`, `Skull Wolf`, `Shadow Crow`, `Shadow Eyes`, `Mist Bat`, `Wandering Shade`, `Goblin Scout` | Quái & thực thể môi trường trong gameplay hiện hành; không tự bịa thêm lore, phe phái hay số phận ngoài `Trailer Context`. | Thực thể thù địch / môi trường phân vùng. | `shadow_big_boss_sheet`, `skull_wolf_sheet`, `WildlifeSystem.ts`, atlases quái tương ứng. | `GAME-IMPLEMENTED`. |
