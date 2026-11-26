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
- **Quá khứ (`CANON-APPROVED` — `DEC-LOCK-01/02/03/05`):**
  - *Baseline bị thay thế (`SUPERSEDED`):* Lời giải tự nguyện phong ấn ký ức / `Algiz` / tái sinh gắn với mất trí nhớ.
  - *Canon chính thức (`2026-11-26`):* **Lord Meliodas Blackwood — The Wolf Lord** từng vừa là **Người Thầy**, vừa là **Tổng Chỉ Huy** của đoàn kỵ sĩ (`Order of the Black Wolf` / `Đoàn Kỵ Sĩ Hắc Lang`, khẩu hiệu `Fides Ultra Tenebras`). Ông nghe **lời cầu cứu bí ẩn (`UNKNOWN`)** từ rừng già, bước vào màn sương và trải qua **biến cố xuyên thời gian bí ẩn** đưa tới `Bellhollow` trong trạng thái mất ký ức. Quan hệ thứ tự với đêm 7 hồi chuông & cơ chế biến cố giữ `UNKNOWN`.
- **Vai trò & Reveal Gate (`DEC-LOCK-07`):** Nhân vật chính (`The Mossbound Wayfarer — Lữ Khách Rêu Phong`). Ẩn hoàn toàn danh tính `Meliodas` & chức `Tổng Chỉ Huy` tại Menu/đầu game; chỉ tiết lộ khi đạt **`Memory Stage >= 3` + chứng cứ phù hợp** (không bắt buộc `SQ08`). NVC **KHÔNG PHẢI** Dark Knight (`Sir Mordric`).
- **Quan hệ (`DEC-LOCK-11/13`):** Người thầy và cựu Tổng Chỉ Huy của `Sir Vaelen` & `Sir Mordric`; liên hệ cụ thể với `Sir Roderick` & `Sir Aldemar` vẫn còn mở (`PENDING-OWNER-APPROVAL`).
- **Trạng thái:** **Canon:** `CANON-APPROVED` (`DEC-LOCK-01..07`; mẫu vẽ huy hiệu đoàn cần Owner nghiệm thu). **Implementation:** Entity/Atlases V2 `GAME-IMPLEMENTED` (`HW-CHAR-01-R2`); dọn tàn dư & ẩn spoil Menu/HUD/Journal/Lore **`IMPLEMENTED (A02)`**; Evidence Reveal Resolver hoàn chỉnh **`IMPLEMENTATION-PENDING` (`A06/B07`)**.

### `CHAR-002` (`CH-03`) — Sir Vaelen, The Silent Knight (`Kỵ Sĩ Trầm Mặc`)
- **Danh tính:** `Sir Vaelen` — Kỵ Sĩ Trầm Mặc (*lỗi chính tả cũ `Sir Valen` sửa sang `Sir Vaelen` từ `A02`*).
- **Quá khứ & Quan hệ (`CANON-APPROVED` — `DEC-LOCK-01/10/11`):** Từng là học trò của `Meliodas` và là bạn cũ của `Sir Mordric`. Nhận ra dấu hiệu của Meliodas và xác nhận danh tính thầy tại `Q05` khi có chứng cứ phù hợp (**nhưng không được vượt qua Identity Reveal Gate toàn cục** cho người chơi). Không gọi `Hooded Knight / Mordric` là Tổng Chỉ Huy ở `q2` — chỉ nhận biết là kỵ sĩ cũ/bạn xưa (`DEC-LOCK-10`).
- **Vai trò & Giới hạn:** NPC trạm lửa `outer_woods` `(1470, 710)`, giữ lửa, ban chúc phúc, `SQ06–SQ08`, rèn `quest_purification_key` (`Q05`). **Chưa triển khai thành companion** (`DEC-LOCK-11`); chỉ chuẩn bị vai trò hỗ trợ trong cốt truyện/cinematic được duyệt. Số phận cuối để mở (`PENDING-OWNER-APPROVAL`).
- **Trạng thái:** **Canon:** `CANON-APPROVED` (vai trò & `Q05`), `APPROVED-FOR-PREPARATION` (`DLG-009/014–015`), kết cục mở. **Implementation:** `GAME-IMPLEMENTED` (NPC trạm lửa); dọn mâu thuẫn `q2/q3`, chính tả `Sir Vaelen` & lore `Q05` **`IMPLEMENTED (A02)`**; mở rộng thoại Trailer V12.2 **`IMPLEMENTATION-PENDING` (`A04`)**.

### `CHAR-003` (`CH-04`) — Sir Mordric, The Dark Knight (`Kỵ Sĩ Bóng Tối`)
- **Danh tính (`CANON-APPROVED / OWNER CORRECTION` — `DEC-LOCK-09`):** **`Sir Mordric` CHÍNH LÀ `The Dark Knight` (`Kỵ Sĩ Bóng Tối`)**, được liên kết trực tiếp với **`HoodedKnightBoss`** hiện hành (`Hooded Knight` là danh xưng cũ trước khi lộ thân phận — cùng 1 nhân vật, **không tách thành 2 entity/boss**).
- **Quá khứ & Quan hệ (`DEC-LOCK-09/11`):** Bạn cũ của `Sir Vaelen`, học trò của `Meliodas`. Nhận ra người thầy qua **huy hiệu hoặc dấu hiệu đặc trưng trên bộ giáp** (`DEC-LOCK-11`). Tuyệt đối **không đồng nhất** với `Elian`, `Fallen Knight`, `Dread Horseman`, hay `The Headless Warden`.
- **Vai trò & Bảo toàn tương thích (`DEC-LOCK-09/16`):** Thuộc tuyến nhiệm vụ phụ tùy chọn `SQ08` (không ép hoàn thành để qua main route hay Reveal Gate). **Giữ nguyên 100% Runtime entity ID, class names, texture keys (`hooded_knight_sheet`, `portrait_hooded_knight`), quest IDs, save flags, reward IDs (`quest_corrupted_crest`)**; chỉ thay tên hiển thị, thoại và Lore. Số phận cuối để mở.
- **Trạng thái:** **Canon:** `CANON-APPROVED` (`Mordric = HoodedKnightBoss`), `APPROVED-FOR-PREPARATION` (`DLG-012–013`), số phận mở. **Implementation:** dọn danh xưng `Chỉ Huy` & thuyết tái sinh trong Bestiary/Boss/Dialogue/Items/Lore **`IMPLEMENTED (A02)`**; mở rộng thoại & polish visual **`IMPLEMENTATION-PENDING` (`A04/D03`)**.

### `CHAR-004` — Sir Roderick, The Crimson Knight & `CHAR-005` — Sir Aldemar, The Ashen Knight
- **Trạng thái (`DEC-LOCK-13`):** **`APPROVED-WITH-LIMITATIONS`** — Tiếp tục phát triển bằng tài nguyên Knight chất lượng cao trong `HOLLOW_WOODS_EXPORT` (`NR-12-R3` / `NR-13-R1`), kiểm giấy phép/góc nhìn/animation/tỷ lệ trước dùng (`CẤM` gán cho `Knight_2`/`Knight_3` trailer `DEC-LOCK-12`).
- **Nội dung còn mở (`PENDING-OWNER-APPROVAL`):** Tiểu sử hoàn chỉnh, quan hệ cụ thể với Meliodas, vị trí xuất hiện, vai trò NPC/Boss, sprite chính thức, kỹ năng, số phận cuối (`D04`, `D05`, `D08`). **Implementation:** `IMPLEMENTATION-PENDING`.

### `CHAR-006` — The Headless Warden (`Kỵ Sĩ Vô Diện` — `HW-V16-00R2 HOLD`)
- **Trạng thái Chính Thức (`HW-V16-00R2`):**
  - `CHARACTER ID`: `CHAR-006` | `ART DIRECTION`: **`OWNER-APPROVED V3.2`** | `PIXEL ART PREVIEW`: **`PENDING FINAL REVIEW`**
  - `ANIMATION PRODUCTION`: **`ON HOLD`** | `NARRATIVE`: **`DRAFT`** | `RUNTIME INTEGRATION`: **`DEFERRED BY OWNER`**
  - `SPAWN`: **`NOT AUTHORIZED`** | `RELEASE DEPENDENCY`: **`OPTIONAL / DEFERRED`**
- **Danh tính & Quyền mở lại (`GATE W01–W07`):** `The Headless Warden` (`CHAR-K04`, `ART-K01`). Chỉ mở lại sau khi Owner ký lần lượt `GATE W01` (Final Pixel Art Preview) → `W02` (Runtime Scale & Anchor) → `W03` (Mounted/Dismounted/Warhorse Animation) → `W04` (Soulfire VFX & Texture Atlas) → `W05` (Canon, Dialogue & Identity) → `W06` (Zone, Encounter & Gameplay) → `W07` (Owner Integration Authorization).
- **Quá khứ, Vai trò & Reserved World Design:** Khu vực tham khảo tương lai: *`Sunken Crypt Ruins`*, *`Whispering Grove Sanctum`*, *`Veil Origin Cavern`* (**chưa phê duyệt địa điểm nào**; cấm tự tạo zone ID, arena, collider vô hình hay khóa đường; giữ nguyên main route).
- **Quan hệ & Cách ly Runtime (`STRICT RUNTIME EXCLUSION`):** Cấm tạo `HeadlessWardenBoss`, đăng ký entity, spawn point, boss AI, skill, quest, reward, Save flags, thoại/ký ức chưa duyệt, marker World Map, đưa preview vào `public/assets/`, **cấm dùng `DreadHorsemanEntity` thay thế**, và cấm tự sinh spritesheet. Không gắn `Elian` (`CHAR-012`) hay Đoàn Hắc Lang khi chưa ký Canon.
- **Asset:** **Đặc tả nguyên bản `ART-K01`:** Ngựa giáp đồng hoa văn rễ, áo choàng đỏ rượu hai tà, linh hỏa xanh bạc tách lớp overlay trong suốt, canvas `128×128` hoặc `160×160` 4 hướng top-down (đối chiếu concept `HW\Trailer\Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png`). **CẤM mua/trace/rip** pack trả phí `ASSET-K11` (`Mattz Art — Headless Horseman`).
- **Trạng thái:** **Canon:** `ART DIRECTION OWNER-APPROVED V3.2`; lore/identity `DRAFT`; `DEC-LOCK-14` `RESERVED`. **Implementation:** **`DEFERRED BY OWNER`** (`D06/D07/E06` ON HOLD; **0** runtime integration, bảo toàn toàn bộ hồ sơ V3.1/V3.2 & `ART-K01` không ghi đè/xóa).

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
| **`CHAR-013` (`CH-05`)** | **Hooded Knight → `Sir Mordric, The Dark Knight`** (`HoodedKnightBoss`) | Liên kết chính thức là **`Sir Mordric`** (`DEC-LOCK-09` — `Hooded Knight` là danh xưng trước reveal). Sửa thoại `tự phong ấn` sang biến cố mới & giải `C02` (`DEC-LOCK-02/10`). | Rơi `quest_corrupted_crest` (`SQ08` tùy chọn); bạn cũ `Vaelen` & học trò `Meliodas` (`DEC-LOCK-11`). Không gán = `Fallen`/`DreadHorseman`/`Warden`. | Giữ nguyên `EvilKnights.ts`, `WildlifeSystem.ts`, `hooded_knight_sheet`, `portrait_hooded_knight`, runtime IDs & save flags. | **`CANON-APPROVED`** (`DEC-LOCK-09`); đổi tên hiển thị & thoại `IMPLEMENTATION-PENDING` (`A02/A04`). |
| **`CHAR-014` (`CH-06`)** | **Fallen Knight (`FallenKnightEntity` & `Apparition`)** | Tàn quân đoàn kỵ sĩ bị sương tha hóa, không tên riêng. Apparition là ảo ảnh khi Composure/Sanity thấp, không collider. | Không đồng nhất tự động với `Mordric`, `Hooded`, `DreadHorseman` hay 2 thuộc hạ `Knight_2/3` (`OQ-07`). | `fallen_knight_sheet`, `EvilKnights.ts`, `FallenKnightApparition.ts` (không physics, `0` key dialogue riêng). | `GAME-IMPLEMENTED`; `Knight_2/3` `TRAILER-ONLY`. |
| **`CHAR-015`** | **Dread Horseman (`DreadHorsemanEntity`)** | Kỵ binh hắc ám nguồn (`garth_horseman_tactics`). | **Tách biệt** hoàn toàn khỏi `The Headless Warden` (`CHAR-006`) cho tới khi Owner quyết định khác. | `dread_horseman_sheet`, `EvilKnights.ts`. | `GAME-IMPLEMENTED`. |
| **`CHAR-016` (`CH-07`)** | **Mire Warden (`Kẻ Nuốt Tiếng Chuông`)** | Người bảo hộ Mạch Rễ cổ xưa tại `broken_bell_shrine`, gắn với 3 trụ & Lưỡi Chuông (`lore_mire_warden_memory`). | Boss main route chặng 7 (`Q06`). Không gắn quan hệ thầy trò hay nguồn cầu cứu. | `src/entities/BossMireWarden.ts` (GameScene import chính) & `MireWardenBoss.ts`, `6` spritesheets `boss_wetlands_*`. | `GAME-IMPLEMENTED`; trailer `DLG-016–017` `TRAILER-ONLY`. |
| **`CHAR-017` (`CH-08`)** | **The Listener (`Kẻ Lắng Nghe`)** | Thực thể mượn giọng người thân gọi tên để săn theo tiếng động (Quy tắc 1 Edda). | Độc lập với `The Echo`; chưa xác định liên hệ với lời cầu cứu (`CONFLICT 05` / `OQ-02`). | `src/entities/TheListener.ts`, `src/systems/ListenerAI.ts`, `the_listener.png` (`0` dialogue key riêng). | `GAME-IMPLEMENTED`. |
| **`CHAR-018` (`CH-09`)** | **The Echo (`Bóng Mờ Ký Ức`)** | Hiện tượng tiếng vọng dẫn đường tại Act 0 và quanh bản đồ; không hitbox sát thương vật lý. | Độc lập với `The Listener`; dẫn đường tới Bellhollow & cổ ngữ (`DLG-021–023`). | `src/entities/TheEcho.ts`, `src/systems/EchoSystem.ts`, `the_echo.png`. | `GAME-IMPLEMENTED`. |
| **`CHAR-019` (`CH-15`)** | **Satyr (`TRAILER-ONLY`)** | Hình bóng truy đuổi trong trailer `V11.x–V12.2`. **`DEC-LOCK-15`:** Giữ trạng thái `TRAILER-ONLY`; **cấm** thêm thành quái/boss gameplay mới. | Xóa tàn dư text `Satyr:` ô tô/quốc lộ (`DEC-LOCK-08`); giữ ID kỹ thuật `lore_satyr_journal` / `satyr_*`. | `satyr_portrait` & `SatyrAnimations.ts` lịch sử (`TECH-K14`). | **`TRAILER-ONLY`** (`DEC-LOCK-15` locked); cleanup `IMPLEMENTATION-PENDING` (`A02`). |
| **7 Nhóm Phụ** | `Shadow Behemoth`, `Skull Wolf`, `Shadow Crow`, `Shadow Eyes`, `Mist Bat`, `Wandering Shade`, `Goblin Scout` | Quái & thực thể môi trường trong gameplay hiện hành; không tự bịa thêm lore, phe phái hay số phận ngoài `Trailer Context`. | Thực thể thù địch / môi trường phân vùng. | `shadow_big_boss_sheet`, `skull_wolf_sheet`, `WildlifeSystem.ts`, atlases quái tương ứng. | `GAME-IMPLEMENTED`. |
