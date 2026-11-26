# HOLLOW WOODS — MASTER PROJECT KNOWLEDGE INDEX (`v2.0 — 00H CHECKPOINT`)

- **Mission History:** `HW-NARRATIVE-00A` (Ingestion) → **`HW-NARRATIVE-00H` (Master Knowledge Checkpoint & Execution Roadmap)**
- **Prior Baseline Backup Preserved:** [Backups/steps/backup_hw_narrative_00h/PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Backups/steps/backup_hw_narrative_00h/PROJECT_KNOWLEDGE_INDEX.md) (SHA-256 `d774b68013ac214aa24b454fa4980f4431d17fe4c3128dab16b7da542badd629`)
- **Project:** `HOLLOW WOODS` (`THE UNBROKEN OATH` / Baseline: `THE FOG THAT REMEMBERS`)
- **Studio:** `KYOSHIRO STUDIO`
- **Maintained By:** `AG 4 Hydro High` (Central Narrative & Technical Coordination Index)
- **Primary Source Document:** `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` (`G:\HOLLOW WOODS\HW\Trailer\HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`, byte-identical to Owner upload `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED(2).docx`, `112,394` bytes, SHA-256 `27a70c2fc7387a56590f192115e6d5ce47d72927f88f0e8ea679068c2228f7b4`, `18` chapters, `20` tables)
- **Corroborating Handover Sources:**
  - `G:\HOLLOW WOODS\HW\Trailer\HOLLOW_WOODS_COMPLETE_MASTER_GAME_BIBLE_LATEST.docx` (SHA-256 `cac7762d6aed50317ec752609635815dd285037f062801baaee05d559e0aab8c`)
  - `G:\HOLLOW WOODS\HW\Trailer\HOLLOW_WOODS_NARRATIVE_HANDOVER_V2.zip` (6 Markdown files, SHA-256 `81ca70ccfdad0c4c9f79cab651fab3258a54fefaa02d549f6be39edc5e3a9806`)
  - `G:\HOLLOW WOODS\HW\Trailer\HOLLOW_WOODS_NARRATIVE_RECONSTRUCTION_V1.0.docx` (SHA-256 `1ba96f592ba1493dc20773bbab19f30be07d2dd4acc559ae362fe888024f1702`)
- **Repo Baseline State at Ingestion (`2026-11-26`):**
  - Branch: `feat/v1.5.3-ag-world-polish`
  - `HEAD`: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`
  - Local uncommitted fixes: `HW-H4-12A` (`BlackKnightPlayer.ts`, `UIScene.ts`, `CraftingModal.ts`, `JournalModal.ts`)
  - Sibling Verified Reports Cross-Referenced: `HW-WORLD-20A`, `HW-CHAR-01-R2`, `HW-H4-12A` (`HW-ASSET-04` not yet executed)
- **Document Mode:** `DOCUMENTATION & INDEXING ONLY` — NO `src/` or `public/assets/` edits authorized here.

---

## 0. Quy Ước Ưu Tiên, Trạng Thái Canon & Quy Tắc Bảo Vệ (`HW-NARRATIVE-00A–00H`)

### 0.1 Thứ tự ưu tiên tra cứu sự thật (Source Truth Hierarchy)
1. **Quyết định trực tiếp mới nhất của Owner** (vd. đổi tên `Meliodas` thay `Drager`; giữ danh xưng `Lord Blackwood`, `The Wolf Lord`; chấp nhận tuyến kỵ sĩ `Vaelen / Mordric / Roderick / Aldemar`; thêm boss `Headless Warden`; `HW-CHAR-01-R2` recovery `Meliodas_Blackwood`).
2. **`HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` (Ch. 01–18)** — nguồn điều phối hợp nhất mới nhất.
3. **`HOLLOW_WOODS_NARRATIVE_HANDOVER_V2.zip` (Ch. 17 — 6 Markdown)** — bằng chứng audit thực tế từ `FULL_SOURCE_LATEST.zip`, registry `NAR-001..030`, `DLG-001..035`, `OQ-01..20`, và `44` source/script paths.
4. **`HOLLOW_WOODS_NARRATIVE_RECONSTRUCTION_V1.0.docx`** — đặc tả thiết kế lịch sử; **KHÔNG tự nâng các mục từng đánh `"CHỐT"` trong V1.0 thành `CANON-APPROVED`**.
5. **Repo runtime hiện hành (`src/` & `public/assets/`)** + các milestone report đã nghiệm thu (`HW-WORLD-20A`, `HW-CHAR-01-R2`, `HW-H4-12A`).

### 0.2 Phân tách 2 trục độc lập: `CANON STATUS` vs `IMPLEMENTATION STATUS`
Không bao giờ trộn lẫn việc **duyệt trailer / đề xuất văn bản** với **triển khai runtime**:
- `CANON-APPROVED`: Quyết định rõ ràng của Owner (hiện tại gồm tên `Meliodas`, giữ `Lord Blackwood` & `The Wolf Lord`).
- `ACCEPTED CHARACTER`: Nhân vật được Owner chấp nhận về mặt tuyến/hướng phát triển (`Sir Vaelen`, `Sir Mordric`, `Sir Roderick`, `Sir Aldemar`, hướng boss `Headless Warden`), **KHÔNG mặc nhiên duyệt toàn bộ tiểu sử hay danh tính runtime**.
- `PROPOSED` / `WIP`: Đề xuất thiết kế hoặc ý tưởng đang hoàn thiện (không tự khóa làm sự thật bắt buộc).
- `TRAILER-ONLY`: Dùng cho dựng phim điện ảnh `V11.x–V12.2`; chưa tự động đưa vào game.
- `CONFLICT`: Mâu thuẫn giữa source runtime baseline và hướng mới của Owner; **PHẢI chờ Owner chốt trước khi sửa code/text**.
- `SUPERSEDED` / `REJECTED` / `UNKNOWN`: Đã thay thế (vd. `Drager`), bị loại, hoặc thiếu chứng cứ.
- `GAME-IMPLEMENTED` vs `IMPLEMENTATION-PENDING`: Trạng thái thực tế trong codebase tại `HEAD 11d91dd5... + HW-H4-12A`.

### 0.3 Quy Tắc Bảo Vệ Tuyệt Đối (`HW-NARRATIVE-00A–00H`)
1. **Bảo vệ dữ liệu Owner (P0):** Tuyệt đối KHÔNG xóa, ghi đè, đổi tên, hay làm hỏng bất kỳ archive gốc (`ZIP`, `RAR`, `7Z`), `HOLLOW_WOODS_EXPORT`, `Backups`, `HW/Trailer/*.docx`, hay tài nguyên gốc/mới nào.
2. **Không tự chế tạo Canon:** Mọi chi tiết `UNKNOWN` hoặc đang `CONFLICT` (`OQ-01..20`) phải giữ nguyên khoảng trống / ghi chú rõ ràng; không điền bù bằng suy đoán.
3. **Không tự động gộp `Drager` → `Meliodas` trực tiếp vào runtime khi chưa duyệt reveal:** Giữ stable IDs (`BlackKnightPlayer`, `black_knight_*`, save IDs, quest IDs, dialogue keys, `lore_satyr_journal`). Không tiết lộ tên `Meliodas` hoặc thân phận `Chỉ Huy` quá sớm ở Act 0 / Menu nếu hướng ẩn ký ức được chọn.
4. **Không tự gán danh tính thực thể:**
   - Không mặc định `Mordric` = `HoodedKnightBoss` trước `OQ-04`.
   - Không đồng nhất `Elian` (em Garth) = `Mordric` / `Dark Knight` / `Hooded Knight`.
   - Không tự gán `Knight_2` / `Knight_3` trong trailer = `Roderick` / `Aldemar` hay `FallenKnightEntity`.
   - Không đồng nhất `DreadHorsemanEntity` = `The Headless Warden`.
   - Không dùng bộ trả phí (`Mattz Headless Horseman`, `Jahnu Heavy Knight`) khi chưa có bản quyền; tuyệt đối không trace/rip preview có watermark.
5. **Bảo vệ gameplay & baseline đã nghiệm thu:** Giữ nguyên `BUG-058`, `BUG-059`, `Classic Sanity 2.1`, `Vòng Sáng Hộ Tâm [F]`, `H4-06`, `H4-08`, `H4-11A/B`, `H4-12A`, main route `A→E→B→D→F→E→C→A`, Save Schema `3`, và công thức 3 kết thúc `determineEndingType` cho đến khi có queue duyệt riêng.
6. **Không sửa `AGENTS.md` và không làm sai lệch phạm vi queue:** Mỗi đợt `00A–00H` tuân thủ ranh giới tài liệu vs mã nguồn; không sửa production source (`src/`, `public/assets/`), không `git reset/clean/stash/commit/push` trái lệnh.

---

## 1. Project Identity (Bản Sắc Dự Án)

| Hạng mục | Giá trị Baseline / Runtime | Giá trị Trailer / Hướng Mới | Trạng thái & Lưu ý |
| :--- | :--- | :--- | :--- |
| **Tên dự án** | `HOLLOW WOODS` | `HOLLOW WOODS` | `CANON-APPROVED` |
| **Subtitle** | `THE FOG THAT REMEMBERS` (`DỊ CẢNH RỪNG SƯƠNG` menu) | `THE UNBROKEN OATH` / `KHU RỪNG ĐANG DÕI THEO` | Không tự đổi branding menu khi chưa duyệt (`NAR-020` `TRAILER-ONLY`) |
| **Tagline** | — | `"Khu rừng vẫn nhớ những gì ngươi đã quên."` | `TRAILER-ONLY` (tương thích hướng Owner) |
| **Studio** | `KYOSHIRO STUDIO` | `KYOSHIRO STUDIO` (intro sói + gamepad 10s gốc) | Giữ nguyên intro studio, không sửa |
| **Thể loại** | Top-down 2D Dark Fantasy Survival / Psychological Horror / Investigation & Boss Action-Adventure | Nhấn mạnh ký ức, lời thề, bi kịch đồng đội | `GAME-IMPLEMENTED` (lối chơi lõi) |
| **Tech Stack** | Phaser `4.2.1`, TypeScript `5.5`, Vite `5.4` | Render trailer 4K60 (`3840×2160`) từ canvas logic `640×360` | Canvas gameplay `1280×720`, virtual `640×360`, zoom mặc định `2.2x` (không ép gameplay 4K) |
| **Quy mô manifest** | `17` zones, `43` items, `18` recipes, `29` lore entries, `92` registry entries, `59` dialogue keys | Mở rộng câu chuyện & World Reconstruction 2.0 | Dữ liệu kiểm từ `HOLLOW_WOODS_EXPORT_MANIFEST.json` / `FULL_SOURCE_LATEST.zip` |

---

## 2. Lore & Cốt Truyện (Ba Dòng Thời Gian & Xung Đột)

### 2.1 Lore Baseline (`GAME-IMPLEMENTED`)
- **Bellhollow & The Veil:** Ngôi làng bị cô lập bởi màn sương `The Veil`. Theo bà Edda (`edda_bell_shatter_secret`), vào đêm biến cố, bảy hồi chuông vang lên khiến **Đại Hồng Chung** bị nứt; **Lưỡi Chuông Đồng (Clapper)** rơi xuống đầm lầy (`silent_mire` → `broken_bell_shrine`).
- **Mùa Sương Lạnh:** Chu kỳ sương mù kéo dài cho đến khi thực hiện được **Hồi Chuông Đầu Tiên (The First Toll)**.
- **Mire Warden:** Từng là người bảo hộ **Mạch Rễ** cổ xưa, gắn kết với Lưỡi Chuông và 3 trụ phong ấn.
- **The Listener vs The Echo:** Hai thực thể **độc lập**. `The Listener` mượn giọng quen, săn theo tiếng động (`ListenerAI.ts`). `The Echo` là hiện tượng tiếng vọng/bóng mờ ký ức (`EchoSystem.ts`), không gây sát thương vật lý trực tiếp.
- **Ba Quy Tắc Sinh Tồn (Edda / `lore_three_rules`):**
  1. Không bao giờ trả lời khi khu rừng gọi đúng họ tên mình (`The Listener`).
  2. Không đi theo chiếc đèn thứ hai trong sương.
  3. Không rung chuông khi màn sương đã tràn qua hàng rào làng.
- **Lời giải ký ức trong source cũ:** NVC vốn là **Chỉ Huy Hiệp Sĩ Đen** tự nguyện phong ấn ký ức/linh hồn để tái sinh (có nhắc cổ ngữ `Algiz`).

### 2.2 Hướng Cốt Truyện Mới của Owner (`PROPOSED`, trừ tên riêng `Meliodas`)
- **Quá khứ:** `Meliodas Blackwood` từng dìu dắt nhóm kỵ sĩ, trong đó có `Sir Vaelen` và `Kỵ Sĩ Bóng Tối` (`Sir Mordric`). Hai học trò từng là bạn thân.
- **Khởi điểm biến cố:** Một ngày, Meliodas nghe lời thì thầm như lời cầu cứu từ rừng già và quyết định đi theo. Một biến cố chưa rõ nguyên nhân đưa ông tới Bellhollow ở một thời điểm tương lai với ký ức bị đánh mất.
- **Hiện tại & cấu trúc 3 Hồi đề xuất (`Draft V2`):**
  - **Hồi I — Người trở về mà không biết mình đã trở về:** Tỉnh lại ở lối sương, tới Bellhollow gặp Garth & Edda, học 3 quy tắc, tìm manh mối chuông.
  - **Hồi II — Ngọn lửa vẫn đợi:** Gặp Vaelen bên bếp lửa; tìm huy hiệu, khuôn đúc, cổ ngữ; thu hồi Lưỡi Chuông qua Mire Warden.
  - **Hồi III — Hai lời thề:** Đối diện Kỵ Sĩ Bóng Tối (oán trách người thầy vắng mặt) và Vaelen (giữ lời thề). Tên thật `Meliodas` chỉ hé lộ khi đủ bằng chứng, không spoil từ menu.
- **Khoảng trống bắt buộc giữ `UNKNOWN`:** Nguồn phát ra tiếng cầu cứu, cơ chế gây mất ký ức / xuyên thời gian, số năm chính xác đã trôi qua, và kết cục cuối cùng của bất kỳ kỵ sĩ nào.

### 2.3 Ba Dòng Thời Gian Độc Lập (Ch. 04 & Tables 14–15)
1. **Timeline A — World Chronology (`PROPOSED`):** `T−?` Đoàn kỵ sĩ bảo vệ Bellhollow & Meliodas dìu dắt học trò → `T−?` Lời cầu cứu từ rừng → `T−?` Biến cố mất ký ức/xuyên thời gian (không chốt thứ tự trước/sau đêm chuông vỡ) → `Khoảng trống` Vaelen giữ lửa / Dark xa cách → `T0` Thức tỉnh tại `fog_crossing` → `T+?` Quest Bellhollow & `First Toll`.
2. **Timeline B — Player Discovery (`D0–D7`):** `D0` Menu/Act 0 (không spoil) → `D1` Garth/Edda → `D2` Neris/Bram/Finn → `D3` Đầm lầy/Vaelen → `D4` Xưởng Chuông/Rừng Sâu → `D5` Hooded/Dark → `D6` Xác nhận huy hiệu & ký ức → `D7` Mire Warden & First Toll. (`D5`/`D6` là tuyến phụ, không được làm kẹt tuyến chính).
3. **Timeline C — Trailer V12.2 (`TRAILER-ONLY`):** `00–10s` Studio → `10–14s` Fog Crossing → `14–16s` Bellhollow → `16–24s` Edda → `24–33s` Vaelen → `33–37s` Veil → `37–44s` Mire Warden → `44–51s` Satyr → `51–65s` Dark Knight & Vaelen → `65–70s` Title Reveal. Không ép làm thứ tự bắt buộc trong game.

### 2.4 Năm Xung Đột Trọng Tâm Cần Khóa (`CONFLICT 01–05`)
- **CONFLICT 01 (`NAR-003` / `OQ-03`):** Source nói tự phong ấn ký ức + `Algiz` tái sinh vs hướng Owner nói đi theo lời gọi + biến cố thời gian. Không được giả định cả hai đồng thời là sự thật khách quan.
- **CONFLICT 02 (`NAR-010` / `OQ-06`):** `campfire_knight_q2_complete` Vaelen tin `HoodedKnightBoss` là Chỉ Huy, nhưng `hooded_knight_encounter_intro` lại nhận NVC là Chỉ Huy, rồi `q3_complete` xác nhận NVC. Cấm tự bịa lời giải thích "Vaelen nói dối".
- **CONFLICT 03 (`NAR-014` / `OQ-04`):** `Sir Mordric` (`ACCEPTED CHARACTER`) là Dark Knight trong câu chuyện, nhưng việc gán thẳng cho entity `HoodedKnightBoss` trong source còn chờ Owner chốt.
- **CONFLICT 04 (`NAR-002` / `I-01`):** `MainMenuScene` (`showChronicleAndGuideModal`) & `lore.json` / `PlayerState.ts` đang spoil danh xưng "Chỉ huy Hiệp Sĩ Đen" và twist tự phong ấn quá sớm.
- **CONFLICT 05 (`NAR-001` / `NAR-024` / `OQ-02`):** Không được tự đồng nhất tiếng cầu cứu với `The Listener`, `The Echo`, hay tiếng chuông.

---

## 3. Characters (Hồ Sơ Nhân Vật `CHAR-001–019` & 7 Nhóm Phụ)

### 3.1 Nhóm Nhân Vật Trung Tâm & Đoàn Kỵ Sĩ
| Profile ID | Tên & Danh Xưng | Canon Status | Runtime Baseline / Key | Reconciliation & Ghi chú kiểm chứng (`HW-CHAR-01-R2`) |
| :--- | :--- | :--- | :--- | :--- |
| **`CHAR-001` (`CH-01`)** | **Lord Meliodas Blackwood** (`The Wolf Lord` / `Lang Chủ`, `Black Knight`, `The Mossbound Wayfarer`; *Drager* `SUPERSEDED`) | **`CANON-APPROVED`** (tên `Meliodas`, danh hiệu `Lord Blackwood` & `The Wolf Lord`); vai trò người thầy `PROPOSED` | `BlackKnightPlayer.ts`, `black_knight_armed_idle`, `movement`, `core_combat`, `defense`, `extended_skills`, `conversion_*`, `portrait` | **Đã đối chiếu & giải quyết trong `HW-CHAR-01-R2`:** Master Bible (Ch. 05 & `ART-K08`) ghi *"chưa tìm được Black Knight V2 của Codex"*, nhưng **`HW-CHAR-01-R2` ĐÃ TÌM THẤY & KHÔI PHỤC ĐẦY ĐỦ** từ GitHub commits `0ceffa58..6bb15b80` (`169` file backup + `194` file library tại `HOLLOW_WOODS_EXPORT/Pixel_Art/01_Characters/Player/Meliodas_Blackwood/`, ZIP SHA-256 `8fef3b3b...`). Trạng thái tích hợp tên `Meliodas` trong game text: `IMPLEMENTATION-PENDING`. |
| **`CHAR-002` (`CH-03`)** | **Sir Vaelen — The Silent Knight** (`Kỵ Sĩ Trầm Mặc`) | Baseline giữ + hướng học trò/bạn Mordric `PROPOSED` | `campfire_knight_idle_sheet`, `campfire_knight_pray_sheet`, `NPCEntity`, `SQ06–SQ08`, tọa độ trạm lửa `(1470, 710)` | Giữ xưng hô `"ngài"` / `"ta"`. Không tự biến thành companion chạy khắp map. Sprite `2D_SL_Knight_v1.0_3.zip` (`128×64`) mới dùng cinematic, chưa xác minh runtime. Lưu ý `tornPagesData.ts` còn tên `Sir Valen` (không sửa nếu chưa duyệt). |
| **`CHAR-003` (`CH-04`)** | **Sir Mordric — The Dark Knight** (`Kỵ Sĩ Bóng Tối`) | **`ACCEPTED CHARACTER`**; tiểu sử oán trách & quan hệ bạn Vaelen `PROPOSED` | Chưa có entity runtime riêng tách biệt hoàn toàn với `HoodedKnightBoss` | Trailer V11.7–V12.2 dùng sprite Hooded + VFX tím (`Dark Resonance`, `Abyssal Fury` là hướng cinematic). Không mặc định ác tuyệt đối; chưa chốt số phận (`OQ-14`). |
| **`CHAR-004`** | **Sir Roderick — The Crimson Knight** | **`ACCEPTED CHARACTER`**; tiểu sử danh dự/áo choàng đỏ rượu `PROPOSED` | Chưa có trong runtime (`IMPLEMENTATION-PENDING`) | Ứng viên visual `Bongseng` / `Jahnu Heavy Knight` (trả phí) / `Mystic Autumn` (free/CC0). Không gán tên cho `Knight_2` trailer khi chưa duyệt. |
| **`CHAR-005`** | **Sir Aldemar — The Ashen Knight** | **`ACCEPTED CHARACTER`**; tiểu sử người giữ di vật/ký ức `PROPOSED` | Chưa có trong runtime (`IMPLEMENTATION-PENDING`) | Giáp xám tro/đồng cũ; ứng viên `Maxime Nourry 64×64` (chưa xác minh đủ license & góc nhìn). Không gán cho `Knight_3` trailer. |
| **`CHAR-006`** | **The Headless Warden** (`Kỵ Sĩ Không Đầu`) | **Hướng boss được Owner chấp nhận**; tên, lore, skill `PROPOSED` | Chưa có texture key / entity runtime | **Bắt buộc vẽ nguyên bản (`ART-K01`)**: giáp cổ đồng đen, áo choàng đỏ rượu hai tà, linh hỏa xanh bạc không cổ, chiến mã tối. CẤM đồng nhất mặc định với `DreadHorsemanEntity` hoặc rip pack trả phí của Mattz Art. |

### 3.2 NPC Bellhollow & Thực Thể Baseline (`CHAR-007–019` + 7 Nhóm Phụ)
- **`CHAR-007` (`CH-02`) Edda — Người Giữ Chuông:** Giữ bí mật Đại Hồng Chung & 3 quy tắc (`edda_idle_sheet`, Bellhollow). `DLG-006–007` là `TRAILER-ONLY`. Không xác định sống cùng thời người thầy.
- **`CHAR-008` (`CH-10`) Garth — Người Gác Cổng:** Mở Cổng Đông, anh trai `Elian` (`garth_walk_sheet`, `SQ09_BROKEN_LANTERN`).
- **`CHAR-009` (`CH-11`) Neris — Người Chữa Thảo Mộc:** Hội Chứng Trắng Não & chữa trị (`neris_idle_sheet`).
- **`CHAR-010` (`CH-12`) Bram — Thợ Rèn:** Lò rèn, crafting, rèn chìa khóa (`blacksmith_sheet`).
- **`CHAR-011` (`CH-13`) Finn — Cậu Bé Đưa Tin:** Tin đồn giếng nước & secret caches (`errand_boy_walk_sheet`).
- **`CHAR-012` (`CH-14`) Elian:** Em trai Garth, giáp bạc, mất tích (`lore_elian_unsent_letter`); số phận `UNKNOWN`. Cấm gán = Dark Knight.
- **`CHAR-013` (`CH-05`) Hooded Knight (`HoodedKnightBoss`):** `src/entities/EvilKnights.ts`, `hooded_knight_sheet` `160×160`, rơi `quest_corrupted_crest` (`SQ08`). Danh tính thật khi đối chiếu Mordric đang `CONFLICT`.
- **`CHAR-014` (`CH-06`) Fallen Knight (`FallenKnightEntity`):** Tàn quân bị tha hóa (`fallen_knight_sheet`). Riêng với `FallenKnightApparition` (ảo ảnh không physics) và 2 thuộc hạ `Knight_2`/`Knight_3` trong trailer.
- **`CHAR-015` Dread Horseman (`DreadHorsemanEntity`):** `dread_horseman_sheet` (`EvilKnights.ts`); tách riêng với `Headless Warden`.
- **`CHAR-016` (`CH-07`) Mire Warden (`BossMireWarden.ts`):** Kẻ Nuốt Tiếng Chuông tại `broken_bell_shrine`; 6 spritesheet `boss_wetlands_*`, giữ 3 trụ & phase.
- **`CHAR-017` (`CH-08`) The Listener (`TheListener.ts`, `ListenerAI.ts`):** Nhại giọng, săn tiếng động (`the_listener.png`).
- **`CHAR-018` (`CH-09`) The Echo (`TheEcho.ts`, `EchoSystem.ts`):** Bóng mờ ký ức, không hitbox sát thương vật lý (`the_echo.png`).
- **`CHAR-019` (`CH-15`) Satyr:** Mini-boss cinematic `V11.x–V12.2` (`satyr_portrait`, concept âm nhạc *"The Harvester of Memories"*); **KHÔNG dùng key legacy `lore_satyr_journal` làm ID boss mới**.
- **7 Nhóm Thực Thể Phụ Runtime:** `Shadow Behemoth` (`shadow_big_boss_sheet`), `Skull Wolf` (`skull_wolf_sheet`), `Shadow Crow`, `Shadow Eyes`, `Mist Bat`, `Wandering Shade`, `Goblin Scout`.

---

## 4. Knight Order Bible (`Order of the Black Wolf` — `PROPOSED`)

- **Tên đề xuất:** `Order of the Black Wolf` / `Đoàn Kỵ Sĩ Hắc Lang` (`NAR-K06` `PROPOSED`).
- **Khẩu hiệu đề xuất:** `Fides Ultra Tenebras` (*Lòng trung thành vượt qua bóng tối*, `PROPOSED`).
- **Huy hiệu đề xuất:** Dấu sói / giáp đen ánh đồng (`PROPOSED`).
- **Sơ đồ quan hệ hiện hành (Ch. 06 & Ch. 17.3):**
  ```text
  Meliodas Blackwood (Canh giới Người Thầy [PROPOSED] / Chỉ Huy [BASELINE])
   ├── [PROPOSED dìu dắt] Sir Vaelen (Trung thành giữ lửa) ◄── [PROPOSED bạn cũ] ──► Sir Mordric / Dark Knight (Oán trách)
   ├── [ACCEPTED CHARACTER / chi tiết PROPOSED] Sir Roderick (Danh dự, áo choàng đỏ rượu)
   └── [ACCEPTED CHARACTER / chi tiết PROPOSED] Sir Aldemar (Di vật & ký ức, xám tro)
  ? Dark Knight = HoodedKnightBoss [CONFLICT / OQ-04]
  * The Headless Warden / Elian / Fallen Knight / Dread Horseman: Giữ tách biệt cho đến khi Owner duyệt.
  ```
- **Lưu ý thiết kế:** Tên `Meliodas` lấy cảm hứng từ văn học Arthur cổ; giữ tạo hình dark-fantasy độc lập, không phỏng theo nhân vật anime/hiện đại trùng tên.

---

## 5. World Map & Environmental Reconstruction (`17` Zones)

### 5.1 Bảng 17 Zone Chuẩn (Table 03 — Từ `zones.json` / `Trailer Context`)
| Zone ID | Tên Việt | Tọa độ `(x, y, w, h)` | Fog / Ambient | Vai trò Runtime |
| :--- | :--- | :--- | :--- | :--- |
| `fog_crossing` | Lối Mòn Xuyên Sương | `0, 0, 480, 360` | `0.75 / 0.40` | Act 0, Echo, sương, checkpoint (`x≥280`) |
| `bellhollow` | Làng Chuông Cổ | `480, -200, 1120, 960` | `0.22 / 0.80` | Garth, Edda, Neris, Bram, Finn, Tháp Chuông |
| `sanctuary_farm` | Nông Trại Trú Ẩn | `480, 560, 640, 480` | `0.18 / 0.86` | Canh tác, khu trú ẩn |
| `outer_woods` | Rừng Ngoại Vi | `1120, 560, 480, 480` | `0.35 / 0.65` | Trạm lửa Vaelen `(1470, 710)` |
| `crooked_path` | Đường Mòn Quanh Co | `1600, 0, 1280, 640` | `0.58 / 0.38` | Tuyến rừng dẫn tới đầm lầy |
| `silent_mire` | Đầm Lầy Tĩnh Lặng | `2880, 100, 1120, 640` | `0.75 / 0.25` | Huy hiệu, phong ấn, lối qua miếu |
| `broken_bell_shrine` | Miếu Chuông Phế Tích | `4000, 0, 960, 600` | `0.82 / 0.28` | Mire Warden, 3 trụ, Lưỡi Chuông |
| `deep_forest` | Rừng Sâu | `1600, -640, 1280, 640` | `0.78 / 0.25` | The Listener, Mảnh Cổ Ngữ |
| `ancient_rune_puzzle` | Khu Vực Câu Đố Cổ Ngữ | `3350, 150, 350, 280` | `0.65 / 0.38` | 3 cột đá, manh mối cổ ngữ |
| `sub_bell_workshop` | Xưởng Chuông Bỏ Hoang | `1120, 1040, 480, 400` | `0.65 / 0.45` | Khuôn đúc đồng cổ, ký ức |
| `sub_root_cellar` | Hầm Rễ Cổ | `480, 1040, 640, 400` | `0.70 / 0.35` | Rễ cổ, di vật |
| `sub_whispering_clearing` | Khoảng Trống Thì Thầm | `1600, -360, 370, 360` | `0.80 / 0.35` | Tiếng vọng, câu đố |
| `abyssal_chasm` | Vực Sâu Bóng Tối | `1600, -1280, 1280, 640` | `0.85 / 0.15` | Khe nứt & vùng tối |
| `drowned_mire_depths` | Đầm Lầy Chìm | `2880, 740, 1120, 640` | `0.80 / 0.22` | Đầm sâu |
| `whispering_grove_sanctum` | Thánh Địa Cây Đại Ngàn | `1120, -800, 960, 440` | `0.35 / 0.55` | Nơi ánh sáng dịu |
| `sunken_crypt_ruins` | Hầm Mộ Cổ Ngữ | `3350, -640, 1130, 640` | `0.70 / 0.18` | Tàn tích, di vật kỵ sĩ |
| `veil_origin_cavern` | Hang Cội Rễ Hư Vô | `480, 1440, 1120, 640` | `0.90 / 0.12` | Hang bóng tối (KHÔNG tự mặc định là arena Mordric) |

### 5.2 Topology & Cross-Reference `HW-WORLD-20A`
- **Quest Topology (Giữ nguyên):** `A` (Bellhollow) → `E` (Silent Mire) → `B` (Outer Woods/Vaelen) → `D` (Bell Workshop/Root Cellar) → `F` (Deep Forest) → `B/A` (rèn chìa khóa) → `E` (mở phong ấn/cầu) → `C` (Broken Bell Shrine) → `A` (`The First Toll`).
- **Ghi chú kỹ thuật:** Adjacency vật lý phải tra `ZoneConnectionRegistry.ts`, không suy diễn từ tọa độ. Kế hoạch cải tạo cảnh quan (`NR-06`) gắn chặt với `HW-WORLD-20A` (`HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md`: đã phát hiện `329` static colliders, `15` nguyên nhân tường vô hình, baseline GTX 1070 Ti `~60 FPS`) và thí điểm `Resurrected RPG 1.1` theo thứ tự: `outer_woods` → `fog_crossing` → `bellhollow` → `deep_forest` → `silent_mire/cavern`.

---

## 6. Dialogue Bible (`DLG-001–035`, `DLG-P01–P06` & `59` Runtime Keys)

### 6.1 Lời Thoại Trailer Đáng Chú Ý (`TRAILER-ONLY` — Chưa Duyệt Đưa Vào Runtime)
- **`DLG-006` Edda (`16–20s`):** *"Có những chuyện người đời đã quên, nhưng năm tháng chưa từng xóa bỏ. Người đã đi qua làn sương. Nhưng những người ở lại, liệu đã bước qua được ngày ngươi rời đi?"*
- **`DLG-007` Edda (`20–24s`):** *"Hãy lần theo tiếng gọi còn vương lại trong gió… rồi ngươi sẽ hiểu vì sao mình lại trở về nơi này."*
- **`DLG-009` Vaelen (`24–33s`):** *"Có những lời thề, người lập ra đã chẳng còn nhớ. Nhưng kẻ từng thề nguyện, đến nay vẫn chưa dám quên."*
- **`DLG-019` Dẫn hang (`V11.x–V12.2`):** *"Tưởng rằng đã thoát khỏi màn sương, ngươi lại bước vào nơi quá khứ vẫn còn chờ đợi."*
- **`DLG-012 / 013` Dark Knight (`51–65s`):** *"Năm ấy, ngài dạy ta không được khuất phục trước bóng tối…"* / *"Vậy mà khi bóng tối tìm đến, ngài lại chẳng còn ở đó."*
- **`DLG-014 / 015` Vaelen (`51–65s`):** *"Ngài có thể đã quên… nhưng ta thì chưa."* / *"Ta cũng từng chờ đợi như ngươi… nhưng chưa bao giờ từ bỏ lời thề."*
- **`DLG-031–034` Title Reveal (`65–70s`):** `HOLLOW WOODS — KHU RỪNG ĐANG DÕI THEO` · *"Khu rừng vẫn nhớ những gì ngươi đã quên."* · *"QUÁ KHỨ KHÔNG BAO GIỜ LÃNG QUÊN. Nó chỉ đứng yên trong sương, chờ ngày ngươi đủ can đảm gọi tên. Ngươi ngỡ mình đang đi tìm đường trở về, nào hay đã trở về từ lâu."* · `SINH TỒN · KINH DỊ TÂM LÝ · BÍ ẨN / KYOSHIRO STUDIO`.

### 6.2 Các Bản Ghi `DLG-001–035` Còn Lại & `DLG-P01–P06`
- **`DLG-001–005` (`V9` narration):** Đã `SUPERSEDED` một phần hoặc `CONFLICT/WIP` / `TRAILER-ONLY` (lỗi nhắc tiếng chuông V9 vs lời cầu cứu mới; `Vaelen` narration `V9` bị thay bằng lời thề `V11`).
- **`DLG-008`, `DLG-020–023`, `DLG-028`, `DLG-029`:** Giữ nguyên baseline (3 quy tắc Edda, The Echo `updateAct0Progression` / `EchoSystem`, Garth `SQ09` Elian); không có câu mới xác minh.
- **`DLG-010–011`, `DLG-016–018`, `DLG-030`:** Narration V9 cho Sanity/Hộ Tâm, Mire Warden, thực thể/Satyr, và câu kết `"Vì sao họ lại nhận ra anh?"` (bị `SUPERSEDED` bởi `DLG-032–034`).
- **`DLG-024–027`, `DLG-035`:** Garth rút gọn (`PROPOSED`), Hooded Knight `Chỉ... Chỉ huy?!` + tự phong ấn (`SUPERSEDED` trailer / `CONFLICT` defeat), Vaelen `q2`/`q3` (`CONFLICT`), và thoại Ending mới (`PROPOSED`).
- **`DLG-P01–P06` (Table 17 — Choice Proposals `PROPOSED`):** Nhánh lựa chọn cho Edda (`choice_edda_promise_bell` `+3`, `lore_curious_bell_secret` `+1`), Vaelen (`lore_curious_black_knight` `+2`, `choice_knight_pledge_fire` `+3`), và Dark Knight (`+2` thấu cảm / `+2` quyết tâm; nhánh `"Ta đã nghe rừng cầu cứu..."` chỉ mở khi đủ manh mối & Owner duyệt). **Cấm cho farm `trustDelta` nhiều lần; giữ payload hội tụ.**

### 6.3 Checklist Toàn Bộ `59` Key Thực Tế Trong `src/data/dialogues.json`
1. **Garth (`10` keys):** `garth_warning` (`Q01`, `talked_to_villagers`, `opensEastGate`), `garth_reminder_edda`, `garth_reminder_gate_locked`, `garth_east_gate_open`, `garth_brother_story` (`SQ09`, `quest_garth_lantern_accepted`), `garth_broken_lantern_complete` (`item_lantern_oil ×2`), `garth_horseman_tactics`, `garth_quest_clearing_patrol` (`SQ04`), `garth_black_knight_reverence`, `garth_guide_to_mire`.
2. **Edda (`9` keys):** `edda_intro` (`Q02`, `talked_to_edda`, `opensEastGate`), `edda_reminder_locked`, `edda_reminder_open`, `edda_bell_shatter_secret`, `edda_rune_guide` (`eqp_bell_ward_charm ×1`), `edda_reminder`, `edda_quest_bell_memory` (`quest_edda_memory_completed`), `edda_black_knight_reverence`, `edda_guide_to_mire`.
3. **Neris (`9` keys):** `neris_intro` (`Q03`, `item_herbal_poultice ×1`, `healPlayer`), `neris_heal_locked`, `neris_heal_open`, `neris_fog_sickness_story`, `neris_quest_root_flower`, `neris_root_flower_complete` (`food_calming_tea ×2`, `healPlayer`), `neris_heal`, `neris_quest_cellar_tea` (`SQ03`), `neris_black_knight_reverence`.
4. **Bram (`6` keys):** `bram_chat`, `bram_guilt_story`, `bram_knight_weakness_guide`, `bram_quest_runed_iron` (`SQ01`), `bram_black_knight_reverence`, `bram_help_forge_purification_key` (`quest_purification_key ×1`).
5. **Finn (`5` keys):** `finn_chat`, `finn_whispers_well`, `finn_secret_caches`, `finn_rumors` (`talked_to_finn_rumors`), `finn_black_knight_reverence`.
6. **Sir Vaelen (`17` keys):** `campfire_knight_intro` (`SQ06`, `5` choices), `campfire_knight_comrade_bond`, `campfire_knight_q1_reminder`, `campfire_knight_q1_complete` (`SQ07`, `food_calming_tea ×1`), `campfire_knight_q2_reminder`, `campfire_knight_q2_complete` (`SQ08`, `res_tree_resin ×2`), `campfire_knight_q3_reminder`, `campfire_knight_q3_complete` (`eqp_bell_ward_charm ×1`, `healPlayer`), `campfire_knight_idle_talk`, `campfire_knight_rest_blessing`, `campfire_knight_rest_blessing_stage0_2`, `campfire_knight_rest_blessing_stage3`, `campfire_knight_rest_cooldown`, `vaelen_examine_crest_and_seek_mold` (`Q05`), `vaelen_mold_reminder`, `vaelen_forge_purification_key` (`quest_purification_key ×1`), `vaelen_reminder_use_purification_key`.
7. **Hooded Knight & Wayfarer (`3` keys):** `hooded_knight_encounter_intro` (`4` lines, `2` choices), `hooded_knight_encounter_defeat` (`boss_hooded_knight_defeated`, `quest_corrupted_crest ×1`), `clapper_found` (`Q06_RETRIEVE_CLAPPER`).
*(Tổng kiểm đúng: `10 + 9 + 9 + 6 + 5 + 17 + 3 = 59` keys).*

---

## 7. Quest, Ending & Save (`src/data/quests.json`, `EndingSystem.ts`, `SaveManager.ts`)

### 7.1 Main Route (`7` Chặng — `GAME-IMPLEMENTED`, Giữ Nguyên)
1. **`A → E`:** Garth/Edda mở Cổng Đông, học 3 quy tắc, tìm Lưỡi Chuông ở Đầm Lầy (`Q00/Q01/Q02`, `item` `clapper` / `Q06`).
2. **`E → B`:** Gặp Phong Ấn Rễ Cổ, nhận/mang huy hiệu (`crest` — phân biệt rõ phần thưởng `SQ08` `quest_corrupted_crest` với main route!) về hỏi Vaelen.
3. **`B → D`:** `vaelen_examine_crest_and_seek_mold` (`Q05_SOLVE_MIRE`) tìm Khuôn Đúc Đồng Cổ `item_bell_mold` tại Xưởng Chuông / Hầm Rễ.
4. **`D → F`:** Tìm Mảnh Cổ Ngữ Khai Mở tại `deep_forest` (chuỗi mở rộng Satyr/Echo `PROPOSED`).
5. **`F → B/A`:** Vaelen hoặc Bram rèn `quest_purification_key`.
6. **`E → C`:** Phá Phong Ấn Rễ Cổ, hạ cây làm cầu sang `broken_bell_shrine`.
7. **`C → A`:** Phá 3 trụ, đánh bại Mire Warden, thu hồi Lưỡi Chuông → quay về Bellhollow thực hiện `The First Toll`.

### 7.2 Side Quests (`SQ01–SQ09`)
- `SQ01_RUNED_IRON` (Bram), `SQ03_CELLAR_TEA` (Neris), `SQ04_CLEARING_PATROL` (Garth), `SQ06_KEEP_FIRE` / `SQ07_LOST_COMRADES` / `SQ08_PURIFY_FALLEN` (Vaelen + Hooded Knight), `SQ09_BROKEN_LANTERN` (Garth / Elian). (Tuyến phụ `Roderick`, `Aldemar`, `Headless Warden` chưa tạo ID/reward).

### 7.3 Công Thức 3 Kết Thúc (`determineEndingType` — Giữ Nguyên Ngưỡng)
- **`true_ending` (`ending_true_achieved`):** `composure >= 50 && memoryAwakeningStage >= 3 && villageTrustScore >= 65`.
- **`sacrifice_ending` (`ending_sacrifice_achieved`):** Không đạt `true` và `memoryAwakeningStage >= 2`.
- **`fog_loop_ending` (`ending_fog_loop_achieved`):** `memoryAwakeningStage < 2`.

### 7.4 Save System (`SaveManager.CURRENT_SCHEMA_VERSION = 3`)
- Bảo toàn: `memoryAwakeningStage` (`0–3`), `villageTrustScore`, `storyFlags`, `flags`, `currentQuestId`, `inventory`, `aliases`, `legacyExtraData`, và cloud save (`CloudSaveService.ts`). Cấm reset save cũ hay tăng schema chỉ để đổi wording.

---

## 8. Gameplay & Survival Systems (`GAME-IMPLEMENTED`)

- **Composure & `Vòng Sáng Hộ Tâm [F]`:** Lõi sinh tồn bảo vệ Tinh Thần trong sương nhưng có thể bộc lộ vị trí; ánh sáng hổ phách ấm đối lập màn sương.
- **Classic Sanity `2.1`:** Hiệu ứng 4 góc đỏ/đen từ Composure `< 38`, không che trung tâm bằng hình chữ nhật (`BUG-023` chống tái phát), hỗ trợ `Reduced Motion` & tắt `Panic Vignette`.
- **Day/Dusk/Night Cycle:** Chu kỳ `360s` (`180s` ngày, `90s` hoàng hôn, `90s` đêm).
- **Dữ liệu hiện hành:** `43` items, `18` crafting recipes, `29` lore entries (`memory_chapter_1..4`, `wayfarer_inner_journal`, `black_knight_chronicle`, `fog_origin`, `ending_*`), `92` registry entries.
- **Độ ổn định input:** Bảo vệ bộ gõ tiếng Việt `EVKey` (`BUG-058`/`BUG-059`), Crafting `[C]` double-toggle fix (`HW-H4-12A`), scale `1.50` & anchor `(0.5, 1.0)` của NVC.
- **Kỹ năng mới V1.0 (`PROPOSED`, chưa nghiệm thu):** `Dư Âm Lời Thề [R]` (NVC), `Lời Thề Bất Diệt` (Vaelen), `Dark Resonance` / `Shadow Step` / `Abyssal Fury` / `Fallen Oath` (Dark Knight). Chỉ thiết kế thông số & tích hợp sau khi duyệt queue kỹ thuật riêng.

---

## 9. Pixel Art, Visual Identity & Recovery (`HW-CHAR-01-R2` Reconciled)

### 9.1 Bảng UI & Màu Sắc Cốt Lõi
- **UI Palette (`AI_IRON_RULES.md`):** Nền Dark Moss `#141712`, Panel `#1F241B`, Viền Vàng Đồng `#C8963E` / Hover `#E09F3E`, Chữ `#E8DFC8`, Chữ phụ `#C8CFC2`, Font `Hollow Woods UI` regular/bold WOFF.
- **Scene Palette Tham Chiếu:** Midnight `#0B1018`, Moss `#25392C`, Fog `#71817F`, Amber `#D5A653`, Dread `#281D40`.

### 9.2 Black Knight V2 (`Meliodas Blackwood`) — Đã Giải Quyết Sau Khi Biên Soạn Master Bible
- **Trong Master Bible (`ART-K08`):** Báo cáo thiếu vị trí file/commit của Black Knight V2 do Codex dựng theo V1.
- **Thực tế đã kiểm chứng (`HW-CHAR-01-R2`):** Đã truy vết đầy đủ trên GitHub (`cb8ba12b..6bb15b80`), backup nguyên vẹn `169/169` files (ZIP SHA-256 `8fef3b3b618ccb1db86a5b69eb4eac25dea34911fa1e971df57d341526805553`) và tổ chức `194/194` files tại `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Pixel_Art\01_Characters\Player\Meliodas_Blackwood\`. Runtime keys `black_knight_*` giữ nguyên; lỗi phóng to lúc chạy / mờ lúc idle nằm ở queue bug riêng, không đè asset gốc.

### 9.3 Danh Sách Ứng Viên Asset & Cổng Bản Quyền (`ASSET-K01..K11`)
| ID | Pack / Tác giả | Giá / Giấy phép | Trạng thái & Vai trò ứng viên |
| :--- | :--- | :--- | :--- |
| `ASSET-K01` | PixiVan Knight Hero Platformer | Pay-what-you-want, thương mại/sửa ok | `24×24` side-view; thử lính phụ |
| `ASSET-K02` | rvros Animated Pixel Knight | `CC0` | Prototype thiếu hướng |
| `ASSET-K03` | Warren Clark | Tự chọn giá; license thương mại chưa rõ | Thử NPC, cấm release trước khi xác minh |
| `ASSET-K04` | Maxime Nourry (`64×64`) | License đầy đủ chưa rõ | Ứng viên `Sir Aldemar` |
| `ASSET-K05` | Bongseng (`Semi-Realist 1H`) | License/skin chưa rõ | Ứng viên `Sir Roderick` |
| `ASSET-K06` | Jahnu Heavy Knight (`64×64`) | Trả phí (`~$1.79`/`2.99`); Run/Hurt/Death planned | Ứng viên `Roderick`, KHÔNG ưu tiên ngân sách `0`; cấm nhập preview |
| `ASSET-K07` | wantosure Mystic Autumn Knights | Tự chọn giá, thương mại/sửa ok (lỗi cache trang) | Ưu tiên **palette mùa thu & tileset/21 SFX**; không thay NVC |
| `ASSET-K08` | LyniaDesign (`48×48`, 4 hướng) | Cần đối chiếu file tải | Ứng viên lính/kỵ sĩ |
| `ASSET-K09` | Atari Boy (`48×48`, body `24×24`, 4 hướng) | Cần lưu license | Ứng viên top-down |
| `ASSET-K10` | Hormelz (8 hướng basic) | Chưa xác minh full license | Ứng viên tham khảo góc nhìn |
| `ASSET-K11` | **Mattz Art — Headless Horseman (`80×80`)** | Trả phí (`$3+`), có preview watermark | **CẤM MUA / CẤM TRACE / CẤM DÙNG PREVIEW.** Chỉ dùng làm tham khảo ý tưởng; `Headless Warden` phải tự vẽ nguyên bản theo `ART-K01`. |

### 9.4 Đặc Tả Nguyên Bản `ART-K01` (`Headless Warden`) & World Reconstruction `2.0`
- **Headless Warden (`ART-K01`):** Canvas `128×128` hoặc `160×160` (4 hướng top-down), giáp đồng hoa văn rễ, choàng đỏ rượu hai tà, linh hỏa xanh bạc tách lớp overlay trong suốt + bóng tiếp đất riêng; `idle` 6–8f, `walk` 6–8f, `run` 8f, `powerup` 10–12f, `attack` 8–12f, `hurt` 4–6f, `disappear` 10–12f. Chưa sản xuất sprite.
- **World Reconstruction `2.0` (`Table 08`):** Nền đất (`tile_forest_grass*`, `tile_dirt_trail*`, `TX Tileset Grass`, `Resurrected RPG 1.1`), cây lớn (`tree_mossy_oak_grand`, `tree_mist_pine`, `tree_weeping_willow`) collider chỉ đặt ở thân & canopy y-sort/fade; decal cỏ/rêu/lá thu không collider; sương 3 tầng parallax tuân thủ `Graphics Quality` & `Reduced Motion`, mục tiêu giữ `~60 FPS` (`<=10%` dao động).

---

## 10. Audio Bible (`V12.2` Chuẩn Nghệ Thuật)

- **Runtime Baseline:**
  - **5 BGM:** `knights_quiet_fire.mp3` (Vaelen/ending), `embervale.mp3` (đêm trạm lửa), `forgotten_orchard.mp3` (lore/xưởng/hầm), `evergrove.mp3` (Whispering Clearing), `beyond_the_hills.mp3` (Outer Woods ngày).
  - **4 Ambience:** `ambience_crossing`, `ambience_village`, `ambience_forest`, `ambience_mire`.
  - **SFX & Voice:** `bell_low`, `bell_toll_low`, footsteps, `lantern_toggle`, `listener_alert`, `sanity_gasp`, `rune_resonance`, `rune_shift`, `boss_drone`, `journal_page`, thoại WAV Garth/Edda/Neris/Bram/Finn, `dialogue_text_blip`.
- **Chuẩn V12.1 / V12.2 Trailer (`TRAILER-ONLY`, được Owner đánh giá rất tốt):**
  - Motif chung `D–F–E–A` (piano ký ức, cello Vaelen, biến tấu Mordric, dàn dây/hợp xướng kỹ thuật số).
  - Cắt bỏ tiếng chuông lặp (`11–26s`): chỉ dùng 1 cue ngắn `~2.8s` fade-out, bỏ hoàn toàn nhạc cụ chuông ở 5s outro (piano/cello/dây/gió).
  - Thông số đã báo cáo cho `V12.2`: `−17.87 LUFS`, `−1.92 dBTP`, `LRA 12.3 LU`.
- **Quy tắc tích hợp game (`NR-07`):** Phải tách thành `stem / loop / cue` cho `AudioManager.ts` (`48 kHz` stereo, bus BGM/ambience/SFX/UI, crossfade theo zone, ducking khi đọc thoại); **CẤM loop nguyên bản nhạc trailer 60s**. Audio gốc & stems `V12.2` chưa nằm trong workspace hiện tại.

---

## 11. Cinematic, Trailer History & Reference Visuals

### 11.1 Tiến Trình Trailer (`V1–V12.2`)
- **Giai đoạn A/B & V4–V9.1:** Thiết lập intro 10s, mở rộng tới 70s, bổ sung Dark Knight 10s (`V9`), letterbox Animated / Non-Animated (`V9.1` upscaled 4K từ `2560×1440`). *(V1–V3, V10, V11.1–V11.6 thiếu log nguyên văn).*
- **V11.7–V11.8:** Rút gọn pacing, Edda 8s (`2×4s`), cảnh hang Dark Knight + Vaelen 14s, Satyr.
- **V12.0 → V12.1 → V12.2:** Thêm Dark Knight Powerup FX (`V12.0`, `4200 frames` 4K60 từ logical `640×360` nearest-neighbor), phối nhạc mới `D–F–E–A` (`V12.1`), tinh chỉnh giảm chuông (`HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`). Bản `"Ultra Master"` toàn phần slow-encode chưa có tệp MP4 xác minh.

### 11.2 Opening Prologue `28s` (`CS01–CS06` — `PROPOSED`)
- **0–4s `CS01`:** Bóng người thầy + 2 kỵ sĩ trẻ tập luyện (không mặt/tên) — *"Đã từng có một lời thề, được trao dưới tán rừng già."*
- **4–9s `CS02`:** Huy hiệu, Vaelen & bạn đứng cạnh; cello `D–F–E–A` nhẹ — *"Có những người đã dành cả đời để gìn giữ nó."*
- **9–14s `CS03`:** Lời cầu cứu từ rừng, 1 tiếng chuông ngắn — *"Hãy lắng nghe… khu rừng cần ngươi."*
- **14–19s `CS04`:** Chuyển cảnh qua sương (không flash gắt) — *"Nhưng có những con đường không dẫn về cùng một thời đại."*
- **19–24s `CS05`:** Tỉnh dậy tại `Fog Crossing` — *"Khi tỉnh lại, mọi thứ đều xa lạ… kể cả chính mình."*
- **24–28s `CS06`:** Camera về góc gameplay, Hộ Tâm ánh nhẹ — *"Khu rừng vẫn nhớ những gì ngươi đã quên."*
- **Yêu cầu kỹ thuật:** Chạy 1 lần khi `New Game` (cờ `prologue_seen`), `Continue` không phát lại, có `Skip` (`Esc/Enter`), fallback 6 ảnh tĩnh hoặc vào thẳng gameplay, trả sạch input/timer/audio về Act 0 checkpoint chuẩn.

### 11.3 Tư Liệu Hình Ảnh Tham Chiếu Kèm Theo (11 Ảnh Upload + `HW\Trailer\`)
- Storyboard trailer 59s: `media_1795685410656_6ae9eb2e.jpg`, `8215d4ea.jpg`.
- Concept `The Headless Warden` (`Idle/Run/Attack/Hurt/Death` + bust): `media_1795685429250_6ea29331.jpg` (khớp `HW\Trailer\Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png`, SHA `3276186e...`).
- Minh họa `The Wolf Lord` cưỡi sói: `media_1795685432191_f18e33c3.jpg`.
- Lưới icon vật phẩm/thảo mộc/ngọc: `media_1795685437764_4edfcc4d.png`, `1d29e3e3.png` (tham khảo thêm `32x32Materials.png`, `64x64Materials.png` ở `HW\Trailer\`).
- Key art `HOLLOW WOODS — KHU RỪNG ĐANG DÕI THEO`: `media_1795685465232_25d535a1.jpg`.
- Thẻ thoại `Edda — Người Giữ Chuông`: `media_1795685465235_d18d7b85.jpg`.
- Triptych hồi tưởng 3 khung (Edda + Thầy/2 học trò + Dark Knight đối đầu): `media_1795685540600_9681e407.jpg`.
- Preview cảnh báo bản quyền `Mattz Art Headless Horseman` (**KHÔNG SỬ DỤNG**): `media_1795685557089_3a70d638.png`, `51be6743.png`.

---

## 12. Technical Impact, File Map & Roadmap Queues (`Table 18 & Table 19`)

### 12.1 Bản Đồ Rủi Ro Nguồn (`I-01..I-07`)
- **`I-01` (P0/GATE):** Lộ twist Chỉ Huy & tự phong ấn ở `MainMenuScene` (`~795–798`), `setMemoryAwakeningStage(1/2)`, `PlayerState` (`~615–621`), `unlockAllMemoryChapters`, `tornPagesData.ts`.
- **`I-02` (P0/PROG):** Xung đột `Vaelen q2` (tưởng Hooded là Chỉ Huy) vs `Hooded defeat` vs `Vaelen q3` (nhận NVC) và nguy cơ trùng/mất `quest_corrupted_crest`.
- **`I-03` (P0/PROG/SAVE):** `DialogueSystem` (`~304–355`) cho `nextDialogueKey` nhảy nhánh trước `endDialogue`; cần guard 1-time cho `trustDelta` (tránh farm điểm `true_ending`); UI hotkey `1–3` cần tương thích node `5` lựa chọn (`campfire_knight_intro`); `DialogueChoice` chưa có trường `condition`.
- **`I-04` (P0/PROG/SAVE):** `GameScene` Act 0 (`startAct0Intro ~1393`, `triggerAct0AtmosphereTelegraph ~3324` tại `x≥175`, `updateAct0Progression ~2712` tại `x≥280`); bảo vệ `Continue` & skip không làm hỏng checkpoint.
- **`I-05` (P0/PROG):** Không đảo thứ tự Mire Warden (Main Route) với Hooded Knight (`SQ08`) hay tự teleport Vaelen ra khỏi trạm lửa.
- **`I-06` (P0/SAVE):** Bảo toàn ngưỡng & ID `determineEndingType` (`true`/`sacrifice`/`fog_loop`). Phân biệt "hàng trăm năm" trong text ending cũ với mốc thời gian mới.
- **`I-07` (P0/SAVE):** `SaveManager` schema `3`, `legacyExtraData`, alias `lore_satyr_journal`. *(Lưu ý: `Act0Scene`, `Act1Scene`, `OpeningCutsceneScene`, `BossEncounterSystem` KHÔNG tồn tại trong `src/`).*

### 12.2 Bản Đồ File Ảnh Hưởng (4 Nhóm Impact)
- **LOW (`TEXT`):** `src/data/dialogues.json`, `src/data/lore.json`, `src/data/tornPagesData.ts`.
- **MEDIUM (`ASSET`):** `src/scenes/PreloadScene.ts`, `src/animation/BlackKnightAnimations.ts`, `src/entities/BlackKnightPlayer.ts`, asset registry, `src/audio/AudioManager.ts`.
- **HIGH (`RUNTIME/QUEST`):** `src/scenes/GameScene.ts`, `MainMenuScene.ts`, `UIScene.ts`, `src/ui/JournalModal.ts`, `TornPageModal.ts`, `PaperNoteModal.ts`, `src/systems/DialogueSystem.ts`, `QuestSystem.ts`, `WildlifeSystem.ts`, `EchoSystem.ts`, `ListenerAI.ts`, `src/entities/EvilKnights.ts`, `BossMireWarden.ts`, `MireWardenBoss.ts`, `FallenKnightApparition.ts`, `TheEcho.ts`, `TheListener.ts`, `src/world/WorldBuilder.ts`, `ZoneConnectionRegistry.ts`, `src/data/zones.json`, `quests.json`, `items.json`, `content_registry.json`, `src/registry/registryData.ts`.
- **CRITICAL (`REVEAL/SAVE/ENDING`):** `src/state/PlayerState.ts`, `src/systems/EndingSystem.ts`, `src/scenes/EndingScene.ts`, `src/systems/SaveManager.ts`, `src/services/CloudSaveService.ts`.

### 12.3 Hàng Đợi Có Điều Kiện (`NA-00–08` / `NR-00–08` / `NR-K00–K03`)
- Chỉ mở sau khi Owner giải quyết `OQ` tương ứng và tách commit riêng:
  - `NA-00` / `NR-00`: Read-only audit đối chiếu HEAD & worktree.
  - `NA-01` / `NR-01`: Canon Decision Record & sửa text xung đột (sau `OQ-01–09`).
  - `NA-02` / `NR-02`: Reveal map, knowledge gates & dialogue choices (chống farm trust).
  - `NA-03` / `NR-03`: Journal, lore, torn pages, menu guide rewrite.
  - `NA-04` / `NR-03 (Prologue)`: Prologue 28s + skip/fallback.
  - `NA-05` / `NR-04–05`: Sprite review / Headless Warden / Dark & Satyr encounter (nếu Owner duyệt).
  - `NA-06`: Ending text (giữ 3 ngưỡng/ID).
  - `NA-07` / `NR-06–07`: Environment (`World Reconstruction 2.0`) & Audio cues (`V12.2`).
  - `NA-08` / `NR-08`: Regression QA (`npm run check`, `verify:data`, `build`, `scripts/verify_v15_*` & `test_v153_save_schema3.mjs`, test biên `49/50` composure, `1/2/3` stage, `64/65` trust).

---

## 13. Canon Decisions Ledger (`Ch. 16` + `NAR-001–030` + `Table 11`)

### 13.1 Master Ledger Hiện Hành (`CHAR-K01..TECH-K14`)
| Master ID | Chủ đề | Trạng thái Master Bible | Cập nhật / Đối chiếu Repo thực tế (`2026-11-26`) |
| :--- | :--- | :--- | :--- |
| `CHAR-K01` | `Drager → Meliodas` | **`CANON-APPROVED`** (`IMPLEMENTATION-PENDING`) | Tên chính thức đã khóa; không auto-reveal tại Act 0/Menu |
| `CHAR-K02` | `Lord Blackwood`, `The Wolf Lord` | Giữ lựa chọn Owner | Danh hiệu gốc giữ nguyên; kiểm tra hiển thị runtime khi tích hợp |
| `CHAR-K03` | `Vaelen`, `Mordric`, `Roderick`, `Aldemar` | **`ACCEPTED CHARACTER`** (tiểu sử `PROPOSED`) | Vaelen đã có runtime; 3 kỵ sĩ mới chưa có entity riêng |
| `CHAR-K04` | Boss `Headless Warden` | Hướng Owner chấp nhận; lore/art `PROPOSED` | Yêu cầu tự vẽ nguyên bản `ART-K01`; chưa có asset runtime |
| `NAR-K05` | Tự phong ấn → Lời cầu cứu + tương lai | `CONFLICT` / `PROPOSED` | Giữ nguyên baseline cho tới khi `OQ-01–03` được chốt |
| `NAR-K06` | `Order of the Black Wolf` / `Fides Ultra Tenebras` | `PROPOSED` | Chưa khóa Canon |
| `DLG-K07` | Dùng thoại `V12.2` | `TRAILER-ONLY` | Chưa đưa vào `dialogues.json` |
| `ART-K08` | **Black Knight V2 (`Meliodas Blackwood`)** | Master ghi `UNKNOWN` vị trí | **RESOLVED BY `HW-CHAR-01-R2`:** Đã khôi phục `169` backup + `194` library files từ GitHub; giữ nguyên runtime keys `black_knight_*` |
| `ART-K09` | Từ chối Mattz trả phí → tự vẽ `Headless Warden` | `PROPOSED` (cấm trace) | Tuân thủ P0, chưa tạo sprite |
| `ART-K10` | `Heavy Knight` / `Mystic Autumn` shortlist | `PROPOSED` (cổng license) | Chưa tải/nhập asset thương mại mới vào runtime |
| `MAP-K11` | `World Reconstruction 2.0` | `WIP` | `HW-WORLD-20A` đã audit xong 17 zones & prototype `LAB-01` |
| `AUD-K12` | Cue chuông ngắn & outro piano `V12.2` | `TRAILER-ONLY` (Owner khen âm thanh) | Stems `V12.2` chưa có trong repo |
| `CIN-K13` | Opening `28s` in-game (`CS01–06`) | `PROPOSED` | Chưa sản xuất keyframe / tích hợp |
| `TECH-K14` | Giữ stable IDs, Save schema `3`, route `A→E→B→D→F→E→C→A` | Yêu cầu kỹ thuật bắt buộc | Tuân thủ 100% ở `HW-NARRATIVE-00A` |

### 13.2 Tóm Tắt `30` Bản Ghi `NAR-001–030` (Lịch Sử Audit V2)
- **`CONFLICT` (`4` mục ưu tiên P0):** `NAR-001` (nguồn gọi ban đầu), `NAR-003` (mất trí nhớ tự phong ấn vs biến cố), `NAR-010` (Vaelen q2 vs q3), `NAR-014` (Dark Knight vs HoodedKnightBoss), `NAR-024` (lời gọi thật vs Listener/Echo) *(5 mục đánh `CONFLICT` trong V2: `001, 003, 010, 014, 024`)*.
- **`PROPOSED` (`7` mục):** `NAR-002` (ẩn thân phận đầu game), `NAR-005` (vai trò người thầy), `NAR-006` (Vaelen–Dark bạn cũ), `NAR-013` (Satyr), `NAR-016` (động cơ oán trách), `NAR-021` (3 ending mới), `NAR-022` (lựa chọn thoại), `NAR-023` (prologue 28s), `NAR-026` (ký ức rừng) *(9 mục `PROPOSED`)*.
- **`TRAILER-ONLY` (`11` mục):** `NAR-007` (Edda V11.8), `NAR-008` (rút gọn Garth/Neris), `NAR-009` (lời thề Vaelen), `NAR-011` (Sanity/Hộ Tâm dẫn truyện), `NAR-012` (dẫn Mire Warden), `NAR-015` (`"Năm ấy ngài dạy ta..."`), `NAR-017` (Vaelen hỗ trợ hang), `NAR-018` (`Knight_2/3` thuộc hạ), `NAR-019` (thứ tự boss trailer), `NAR-020` (tagline Title Reveal), `NAR-027` (skill/FX Dark Knight), `NAR-028` (motif D–F–E–A) *(12 mục `TRAILER-ONLY`)*.
- **`WIP` / `UNKNOWN` / `SUPERSEDED` (`4` mục):** `NAR-004` (`WIP` khoảng thời gian), `NAR-030` (`WIP` giữ lỗ hổng tri thức), `NAR-025` (`UNKNOWN` số phận Elian), `NAR-029` (`SUPERSEDED` chuông dài V12.1 bởi V12.2).

---

## 14. Open Questions (`OQ-01–20`) & Decision Record Template

### 14.1 Bảng 20 Câu Hỏi Khóa Canon Cần Owner Quyết Định (`OQ-01–20`)
| ID | Câu hỏi cần Owner quyết định | Liên quan | Trạng thái an toàn khi chưa chốt |
| :--- | :--- | :--- | :--- |
| `OQ-01` | NVC vừa là Người Thầy vừa giữ chức Chỉ Huy Đoàn Kỵ Sĩ, hay đổi chức danh? | `NAR-002/005`, `CH-01` | Giữ baseline; không spoil sớm trong draft |
| `OQ-02` | Bản chất lời cầu cứu: rừng già, The Veil, Listener, Echo, thực thể khác, hay để mở? | `NAR-001/024/026` | Chỉ gọi *"lời thì thầm giống lời cầu cứu"* |
| `OQ-03` | Nguyên nhân mất ký ức: bỏ hoàn toàn twist tự phong ấn cũ, giữ một phần, hay chỉ là lời đồn? | `NAR-003`, `DLG-025–027` | Không khẳng định cả hai cùng lúc |
| `OQ-04` | Kỵ Sĩ Bóng Tối (`Mordric`) chính là `HoodedKnightBoss` hay nhân vật tách riêng? | `NAR-014`, `CH-04/05` | Giữ nguyên runtime key & `SQ08` |
| `OQ-05` | Mức độ quá khứ/danh xưng bạn bè giữa `Mordric` và `Vaelen`? | `NAR-006/016/025` | Không gán Dark = Elian hay Fallen |
| `OQ-06` | Giải thích mâu thuẫn `Vaelen q2` (tin Hooded là Chỉ Huy) rồi `q3` (nhận NVC)? Sửa nhật ký cũ hay hiểu lầm có chủ ý? | `NAR-010`, `I-02` | Đánh dấu `CONFLICT`, không tự bịa lời nói dối |
| `OQ-07` | Hai thuộc hạ `Knight_2/3` trong hang là ai? Liên hệ gì với Fallen / Dread Horseman? | `NAR-018`, `CH-06` | Chỉ ghi vai trò cinematic |
| `OQ-08` | Thời gian trôi qua là bao lâu? Cơ chế NVC tới tương lai? Vaelen/dân làng tồn tại thế nào? Xác nhận *"Làng Sương Mù"* = Bellhollow? | `NAR-004` | Không chọn số năm; không gán máy thời gian |
| `OQ-09` | Thứ tự giữa lời cầu cứu và đêm 7 hồi chuông làm nứt Đại Hồng Chung? | `NAR-001/003/024` | Giữ tách biệt trong Timeline A |
| `OQ-10` | Edda thực sự nhận ra NVC ở mức nào và vì sao chưa nói thẳng? | `NAR-007` | Giữ 2 thẻ trailer ở mức gợi ý |
| `OQ-11` | Vaelen nhận ra NVC lúc mới gặp, qua huy hiệu, hay ở hang? Có cho quỳ ngay lần đầu không? | `NAR-009/010/017` | Giữ reveal muộn theo baseline |
| `OQ-12` | Dấu hiệu giúp Dark Knight nhận ra thầy (giáp, kiếm pháp, Hộ Tâm, huy hiệu, ký ức)? | `NAR-015` | Không chốt dấu hiệu duy nhất |
| `OQ-13` | `Satyr` là quái/boss mới, biểu tượng tâm lý, hay hiện thân khác? | `NAR-013` | Giữ `TRAILER-ONLY`; không dùng key `satyr` cũ |
| `OQ-14` | Số phận cuối cùng của `Mordric`/`Hooded` và `Vaelen` (hòa giải, rời đi, ở lại, để mở)? | `NAR-016/021` | Không tự viết thoại kết thúc |
| `OQ-15` | Thứ tự `Mire → Satyr → Dark` trong trailer có áp vào game không? Dark encounter optional hay mandatory? | `NAR-019` | Bảo toàn Main Quest & `SQ08` |
| `OQ-16` | Vaelen có hỗ trợ đánh boss thực tế hay chỉ cutscene/ký ức? | `NAR-017` | Không teleport NPC rời trạm lửa |
| `OQ-17` | Câu nào của Edda/Vaelen/Dark và Title/3 Quy Tắc được duyệt đưa nguyên văn vào game? | `DLG-006–015/030–034` | Duyệt từng `DLG` ID |
| `OQ-18` | Mức phân nhánh lựa chọn: chỉ đổi thoại/trust hay đổi quest/ending & ngưỡng? | `NAR-021/022` | Giữ 3 endings, ngưỡng và schema `3` |
| `OQ-19` | Mở đầu `28s` dùng in-engine, video, keyframe hay hybrid? Mức độ spoil? | `NAR-023` | `CS01–06` chỉ là storyboard đề xuất |
| `OQ-20` | Có bổ sung transcript `V1–V12.2` và MP4 `V12.2` cuối cùng ("Ultra Master")? | `E7`, mục `UNKNOWN` | Không tuyên bố audit toàn phần V1–V12.2 |

### 14.2 Mẫu Decision Record Chuẩn (`DEC-NAR-___`)
```markdown
Decision ID: DEC-NAR-___
Related: NAR-___ / DLG-___ / OQ-___
Owner decision (nguyên văn): ___
Status: CANON-APPROVED / TRAILER-ONLY / PROPOSED / WIP / SUPERSEDED / CONFLICT / UNKNOWN
Scope: lore / dialogue / quest / gameplay / art / audio
Effective version: ___
Source conflicts explicitly resolved: ___
Approved wording: ___
Non-approved parts / open questions: ___
Date: ___
```

### 14.3 Checklist Ưu Tiên Trước Khi Sang `HW-NARRATIVE-00B`
1. Owner đọc `NAR-001/003/010/014/024` và chốt nhóm câu hỏi lõi **`OQ-01..09`** trước.
2. Xác nhận danh sách lời thoại duyệt đưa từ `TRAILER-ONLY` sang runtime (`OQ-17`: `DLG-006/007/009/012–015`) và mức spoil tại `MainMenuScene` / `Stage 1–2`.
3. Chốt hướng tiếp nhận `Roderick`, `Aldemar`, `Headless Warden`, `Satyr` và tiến độ sản xuất pixel art nguyên bản (`ART-K01`).
4. Chỉ sau khi có các `DEC-NAR-___` từ Owner mới triển khai chuỗi đối chiếu & tích hợp tiếp theo (`00B+`).

---

## 15. Kho Liên Kết Toàn Hệ Thống (`HW-NARRATIVE-00H` Checkpoint — Tra Cứu Nhanh Không Cần Đọc Lại Word 59 Trang)

- **Chỉ mục máy đọc (`JSON`):** [MASTER_KNOWLEDGE_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/MASTER_KNOWLEDGE_INDEX.json)
- **Báo cáo tổng kết `00A–00H`:** [HW_NARRATIVE_00_FINAL_SYNCHRONIZATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NARRATIVE_00_FINAL_SYNCHRONIZATION_REPORT.md)

| Danh mục hồ sơ chuẩn (`00A–00H`) | Tệp đích liên kết trực tiếp | Vai trò tra cứu cho AG & Codex |
| :--- | :--- | :--- |
| **1. Master Game Bible (Bản gốc 59 trang)** | [HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx](file:///G:/HOLLOW%20WOODS/HW/Trailer/HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx) | Nguồn đối chiếu nguyên văn khi cần trích dẫn sâu (`SHA-256: 27a70c2fc7...`) |
| **2. Lore Registry** | [MASTER_LORE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/MASTER_LORE_REGISTRY.md) | 29 mục `lore.json`, 3 dòng thời gian, quy tắc mật mã & hồi tưởng |
| **3. Character & Relationship Registry** | [CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md) · [CHARACTER_RELATIONSHIPS.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_RELATIONSHIPS.md) | `CHAR-001–019`, đối chiếu `HW-CHAR-01-R2`, khóa tách thực thể |
| **4. Canon & Conflict Registry** | [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md) · [NARRATIVE_CONFLICT_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_CONFLICT_REPORT.md) | `CHAR-K01..TECH-K14`, `NAR-001–030`, 5 xung đột `C01–C05` |
| **5. World Registry & Reconstruction** | [WORLD_AND_MAP_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/WORLD_AND_MAP_REGISTRY.md) · [WORLD_TOPOLOGY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/WORLD_TOPOLOGY.json) · [WORLD_RECONSTRUCTION_PRIORITY_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/WORLD_RECONSTRUCTION_PRIORITY_PLAN.md) | `17` zones, `41` cổng chuyển vùng, kết nối `HW-WORLD-20A` & `LAB-01` |
| **6. Dialogue Registry** | [DIALOGUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DIALOGUE_REGISTRY.md) | `59` keys runtime, `DLG-001–035` (`TRAILER-ONLY`), `DLG-P01–P06` |
| **7. Quest & Save Registry** | [QUEST_IMPACT_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/QUEST_IMPACT_REGISTRY.md) | `7` stages `A→E→B→D→F→E→C→A`, `SQ01–09`, 3 endings, Schema `3` |
| **8. Source Impact Matrix** | [SOURCE_IMPACT_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/SOURCE_IMPACT_MATRIX.md) | Ma trận rủi ro `CRITICAL → LOW` từng file & số dòng trong `src/` |
| **9. Trailer V12 / V12.2 Reference (`00E`)** | [HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md) | 27 keyframes `HW-TRAILER-REFERENCE/`, đối chiếu V12 vs V12.2 LUFS |
| **10. Asset License & New Knights (`00F`)** | [HW_ASSET_LICENSE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_ASSET_LICENSE_REPORT.md) · [HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md) | Đánh giá 4 pack kỵ sĩ mới, Materials PNG & 5 contact sheets |
| **11. Headless Warden & Meliodas Plan (`00G`)** | [HEADLESS_WARDEN_ASSET_SPECIFICATION.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HEADLESS_WARDEN_ASSET_SPECIFICATION.md) · [MELIODAS_VISUAL_REFERENCE_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/MELIODAS_VISUAL_REFERENCE_PLAN.md) | Đặc tả `ART-K01` 4 lớp, Wolf Lord art ref, khóa `BUG-058/059` cho Codex |
| **12. Opening Cutscene & Audio Plan (`00G`)** | [OPENING_CUTSCENE_IMPLEMENTATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OPENING_CUTSCENE_IMPLEMENTATION_PLAN.md) · [AUDIO_INTEGRATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/AUDIO_INTEGRATION_PLAN.md) | So sánh PA `A/B/C` (Prologue 28s), cue chuông 2.8s, stems `D–F–E–A` |
| **13. Quyết định & Hàng đợi Triển Khai (`00H`)** | [OWNER_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_DECISIONS_REQUIRED.md) · [DEVELOPMENT_EXECUTION_QUEUE.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DEVELOPMENT_EXECUTION_QUEUE.md) | Phân nhóm câu hỏi Owner theo mốc & Track `A → G` |
| **14. Full Narrative Sync Pack (`00H Addendum`)** | [NARRATIVE_RESIDUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_RESIDUE_REGISTRY.md) · [NARRATIVE_REPLACEMENT_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_REPLACEMENT_MATRIX.md) · [FULL_NARRATIVE_RECONSTRUCTION_ROADMAP.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/FULL_NARRATIVE_RECONSTRUCTION_ROADMAP.md) · [NARRATIVE_ACCEPTANCE_TEST_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/NARRATIVE_ACCEPTANCE_TEST_PLAN.md) | Sổ tàn dư cũ trên `21` vùng mã nguồn, bảng `KEEP/REWRITE/REMOVE/REPLACE`, test `12` tiêu chí |
