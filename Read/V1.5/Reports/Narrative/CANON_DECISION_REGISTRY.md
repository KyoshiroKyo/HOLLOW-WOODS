# HOLLOW WOODS — CANON DECISION REGISTRY

- **Mission:** `HW-NARRATIVE-00B — LORE, CHARACTER & CANON REGISTRY`
- **Primary References:**
  - `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`: `Ch. 01`, `Ch. 16` (`CHAR-K01..TECH-K14`, `Table 11`), `Ch. 17` (`TRAILER NARRATIVE CHANGE REPORT` `NAR-001–030`)
  - [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md) (Mục `0`, `13`)
  - [HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md)

---

## 1. Quy Tắc Thẩm Định Canon (`Ch. 01` & `Ch. 17`)

- **Hai trục độc lập:** `CANON STATUS` (mức phê duyệt của Owner về câu chuyện/nhân vật/nghệ thuật) ≠ `IMPLEMENTATION STATUS` (những gì đang chạy trong codebase tại `HEAD 11d91dd5...`).
- **Quy tắc chống thăng hạng nhầm:**
  - Không coi các mục từng gắn nhãn `"CHỐT"` trong `HOLLOW_WOODS_NARRATIVE_RECONSTRUCTION_V1.0.docx` là `CANON-APPROVED` (`Ch. 01`, `Ch. 17.1`, `Ch. 17 Open Questions §2`).
  - Không coi lượt *"Duyệt 13 tiêu chí sản xuất trailer V12.0"* hoặc lời khen âm thanh `V12.2` là sự phê duyệt `30` bản ghi `NAR` vào game (`Table 13`, `Table 20`).
  - Duyệt nhân vật (`ACCEPTED CHARACTER`) không mặc nhiên duyệt toàn bộ tiểu sử, quest, hay gán thẳng vào entity cũ.

---

## 2. Master Decision Ledger Hiện Hành (`Ch. 16`: `CHAR-K01` – `TECH-K14` + `Table 11`)

| Decision ID | Chủ đề & Nguồn Chương | Canon Status | Implementation Status | Chi tiết & Ràng buộc |
| :--- | :--- | :--- | :--- | :--- |
| **`CHAR-K01`** | Đổi tên thật NVC: **`Drager` → `Meliodas`** (`Quy tắc ưu tiên`, `Ch. 05`, `Ch. 16`, `Table 11 R01`) | **`CANON-APPROVED`** (`Drager` `SUPERSEDED`) | `IMPLEMENTATION-PENDING` | Không hiển thị `Drager` trong game mới; **cấm lộ tên `Meliodas` sớm ở Act 0 / Menu** trước reveal được duyệt (`CONFLICT C04`). |
| **`CHAR-K02`** | Danh hiệu **`Lord Blackwood`** & **`The Wolf Lord` (`Lang Chủ`)** (`Quy tắc ưu tiên`, `Ch. 05`, `Ch. 16`) | **`CANON-APPROVED`** (giữ lựa chọn Owner) | Chưa xác minh hiển thị đầy đủ runtime | Giữ định danh văn học Arthur độc lập; không sao chép thiết kế từ tác phẩm hiện đại trùng tên. |
| **`CHAR-K03`** | Tuyến Kỵ Sĩ: **`Vaelen`**, **`Mordric`**, **`Roderick`**, **`Aldemar`** (`Ch. 05`, `Ch. 16`, `Table 11 R02`) | `Sir Vaelen` baseline giữ; `Mordric / Roderick / Aldemar` **`ACCEPTED CHARACTER`**; tiểu sử **`PROPOSED`** | `Vaelen` `GAME-IMPLEMENTED`; `3` kỵ sĩ mới `IMPLEMENTATION-PENDING` | Chưa duyệt mapping `Mordric = HoodedKnightBoss` (`OQ-04`), số phận (`OQ-14`) hay `Knight_2/3` (`OQ-07`). |
| **`CHAR-K04`** | Boss mới **`The Headless Warden`** (`Ch. 05`, `Ch. 11`, `Ch. 16`, `Table 11 R04`) | **Hướng phát triển Owner chấp nhận**; danh xưng, lore, kỹ năng **`PROPOSED`** | `IMPLEMENTATION-PENDING` | Bắt buộc tách khỏi `DreadHorsemanEntity` và thiết kế nguyên bản theo `ART-K01`. |
| **`NAR-K05`** | Cơ chế ký ức: Tự phong ấn/`Algiz` vs Lời cầu cứu + biến cố xuyên thời gian (`Ch. 03`, `Ch. 16`) | **`CONFLICT`** / **`PROPOSED`** | Baseline tự phong ấn `GAME-IMPLEMENTED` | Chưa chốt `OQ-01–03`, `OQ-08–09`. Giữ nguyên runtime cho đến khi Owner quyết định. |
| **`NAR-K06`** | Tổ chức **`Order of the Black Wolf`** & khẩu hiệu **`Fides Ultra Tenebras`** (`Ch. 06`, `Ch. 16`) | **`PROPOSED`** | `IMPLEMENTATION-PENDING` | Không tự dùng như Canon đã khóa nếu Owner chưa ký duyệt (`§3` yêu cầu 00B). |
| **`DLG-K07`** | Đưa lời thoại trailer `V12.2` (`DLG-006/007/009/012–015/031–034`) vào game (`Ch. 08`, `Ch. 16`) | **`TRAILER-ONLY`** | Chưa tích hợp (`dialogues.json` giữ bản cũ) | Phải duyệt từng `DLG` ID qua `OQ-17` và gắn knowledge gates trước khi sửa `dialogues.json`. |
| **`ART-K08`** | **`Black Knight V2` (`Meliodas Blackwood`)** (`Ch. 05`, `Ch. 11`, `Ch. 16`, `Table 11 R05`, `HW-CHAR-01-R2`) | Tài sản chính thức của Owner/Codex từ Black Knight V1 | **`RECOVERED & VERIFIED`** (`HW-CHAR-01-R2`); đang dùng trong runtime qua `black_knight_*` | **Cập nhật đối chiếu:** Master Bible (`ART-K08`) ghi `UNKNOWN` vị trí, nhưng **`HW-CHAR-01-R2` đã khôi phục 100%** từ GitHub (`cb8ba12b..6bb15b80`, `169` backup files + `194` files ở `Meliodas_Blackwood/`, ZIP SHA-256 `8fef3b3b...`). |
| **`ART-K09`** | Pack trả phí `Mattz Art — Headless Horseman` (`ASSET-K11`) → Vẽ `Headless Warden` nguyên bản `ART-K01` (`Ch. 11`, `Ch. 16`) | **`PROPOSED`** (P0 cấm trace/rip watermark) | `IMPLEMENTATION-PENDING` | Không mua/sử dụng preview trả phí. |
| **`ART-K10`** | Danh sách ứng viên pack miễn phí/tham khảo `ASSET-K01–10` (`Ch. 11`, `Ch. 16`) | **`PROPOSED`** (Cổng kiểm tra license) | Chưa nhập runtime | Ưu tiên `Mystic Autumn` cho palette/SFX/tileset prototype; kiểm license trước release. |
| **`MAP-K11`** | **`World Reconstruction 2.0`** & `Resurrected RPG 1.1` (`Ch. 07`, `Ch. 12`, `Ch. 16`) | **`WIP`** (Định hướng Owner) | Đã audit trong `HW-WORLD-20A` & prototype `HW-MAP-LAB-01`; production maps giữ an toàn | Triển khai sau khi chốt pilot & giữ collider/route/60 FPS. |
| **`AUD-K12`** | Âm thanh `V12.2`: `D–F–E–A`, giảm chuông 2.8s fade-out, bỏ chuông outro (`Ch. 13`, `Ch. 16`) | **`TRAILER-ONLY`** (Owner khen chất lượng V12.2) | Chưa tích hợp stem vào `AudioManager.ts` | Không loop nguyên track 60s trong gameplay. |
| **`CIN-K13`** | Opening Prologue `28s` (`CS01–06`) khi `New Game` (`Ch. 09`, `Ch. 16`) | **`PROPOSED`** | `IMPLEMENTATION-PENDING` | Chờ duyệt keyframe/hình thức (`OQ-19`) và giải `OQ-01–03`. |
| **`TECH-K14`** | Giữ stable IDs (`BlackKnightPlayer`, `black_knight_*`, quest/lore keys), Save schema `3`, Main route `A→E→B→D→F→E→C→A`, `determineEndingType` (`Ch. 10`, `Ch. 15`, `Ch. 16`) | **Yêu cầu kỹ thuật bắt buộc** | `GAME-IMPLEMENTED` | Mọi queue chỉnh sửa sau này đều phải giữ tương thích save & route. |

---

## 3. Sổ Đăng Ký `30` Thay Đổi Lịch Sử (`NAR-001` – `NAR-030`, `Ch. 17.3`)

*(Quy ước Owner trong `Ch. 17`: `T` = định hướng/duyệt trailer; `Y` = ý tưởng trực tiếp Owner chưa chốt Canon; `G` = GPT đề xuất; `?` = chưa rõ. Impact: `H` = Cao, `M` = Trung bình, `L` = Thấp).*

| NAR ID | Nội dung thay đổi tóm tắt | Mốc / Owner | Impact | Trạng thái | File liên quan (`Table 18`) |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `NAR-001` | Nguồn gọi đầu game: Tiếng chuông Đông → Lời cầu cứu từ rừng | `V2/V9→E9` / `Y` | `H` | **`CONFLICT`** | `GameScene.ts`, `lore.json`, `tornPagesData.ts` |
| `NAR-002` | Thân phận mở đầu: Ẩn `Chỉ Huy` & tên thật ở đầu game | `V11/E9` / `Y` | `H` | `PROPOSED` | `MainMenuScene.ts`, `lore.json`, `dialogues.json` |
| `NAR-003` | Mất trí nhớ: Tự phong ấn/`Algiz` vs Biến cố thời gian | `E9/V11` / `Y` | `H` | **`CONFLICT`** | `lore.json`, `tornPagesData.ts`, `dialogues.json`, `EndingSystem.ts` |
| `NAR-004` | Thời gian thất lạc & tương lai (không tự gán số năm) | `E9` / `Y` | `H` | `WIP` | `lore.json`, `EndingSystem.ts` |
| `NAR-005` | Vai trò người thầy nuôi dạy kỵ sĩ vs Chỉ Huy | `V11/E9` / `Y` | `H` | `PROPOSED` | `dialogues.json`, `lore.json`, `tornPagesData.ts` |
| `NAR-006` | Quan hệ bạn cũ giữa `Vaelen` và `Dark Knight` (`Mordric`) | `V11/E9` / `Y` | `H` | `PROPOSED` | `dialogues.json`, `lore.json` |
| `NAR-007` | Hai thẻ thoại `Edda` (`DLG-006–007`: chuyện chưa xóa & tiếng gọi gió) | `V11, V11.8` / `T` | `M` | `TRAILER-ONLY` | `dialogues.json` (`edda_intro`) |
| `NAR-008` | Rút gọn `Garth / Edda / Neris` trong trailer | `V9→V12.2` / `T` | `L` | `TRAILER-ONLY` | `dialogues.json`, `GameScene.ts` |
| `NAR-009` | Thoại lời thề `Vaelen` bên lửa (`DLG-009`) | `V11–V12.2` / `T` | `M` | `TRAILER-ONLY` | `dialogues.json` (`campfire_knight_intro`) |
| `NAR-010` | `Vaelen` nhận diện ai (`q2` Hooded là Chỉ Huy vs `q3` nhận NVC) | `E9` / `Y` | `H` | **`CONFLICT`** | `dialogues.json`, `PlayerState.ts`, `GameScene.ts` |
| `NAR-011` | Dẫn truyện `Hộ Tâm [F]` & suy giảm `Sanity` (`DLG-010–011`) | `V5/V9→V12.2` / `T` | `L` | `TRAILER-ONLY` | `GameScene.ts`, `UIScene.ts`, `VeilSystem.ts` |
| `NAR-012` | Dẫn rõ động cơ truy tìm Clapper gặp `Mire Warden` (`DLG-016–017`) | `V8/V9` / `T` | `M` | `TRAILER-ONLY` | `quests.json`, `lore.json`, `BossMireWarden.ts` |
| `NAR-013` | `Satyr` truy đuổi trong rừng/hang | `V9→V11.x` / `T/G` | `H` | `PROPOSED` | `WildlifeSystem.ts`, `content_registry.json` |
| `NAR-014` | Quan hệ định danh `Dark Knight (Mordric)` vs `HoodedKnightBoss` vs `Fallen` | `V9→V11/E9` / `Y` | `H` | **`CONFLICT`** | `EvilKnights.ts`, `WildlifeSystem.ts`, `dialogues.json` |
| `NAR-015` | `Dark Knight` nhận ra thầy (*"Năm ấy, ngài dạy ta..."*, tránh gọi Chỉ Huy sớm) | `V11–V12.2` / `T` | `M` | `TRAILER-ONLY` | `dialogues.json` (`hooded_knight_encounter_intro` nếu gộp) |
| `NAR-016` | Động cơ oán trách của `Dark Knight` (không khẳng định ác tuyệt đối) | `V11/E9` / `Y/G` | `H` | `PROPOSED` | `dialogues.json`, `lore.json` |
| `NAR-017` | `Vaelen` xuất hiện hỗ trợ trong hang (`DLG-014–015`) | `V11.7–V12.2` / `T` | `H` | `TRAILER-ONLY` | `GameScene.ts`, `WildlifeSystem.ts`, `NPCEntity.ts` |
| `NAR-018` | Hai thuộc hạ `Knight_2 / Knight_3` trong cảnh hang trailer | `V11.x–V12.2` / `T` | `H` | `TRAILER-ONLY` | `EvilKnights.ts`, `PreloadScene.ts` |
| `NAR-019` | Thứ tự trailer `Mire → Satyr → Dark/Vaelen` (không ép đổi route game) | `V9→V12.2` / `T` | `H` | `TRAILER-ONLY` | `quests.json`, `GameScene.ts`, `EndingSystem.ts` |
| `NAR-020` | Lời kết & Branding trailer (`KHU RỪNG ĐANG DÕI THEO`, `DLG-031–034`) | `V9→V12.2` / `T` | `M` | `TRAILER-ONLY` | `MainMenuScene.ts`, `PreloadScene.ts` |
| `NAR-021` | Viết lại văn bản `3 Ending` theo lời thề (giữ IDs & ngưỡng) | `E8` / `G` | `H` | `PROPOSED` | `EndingSystem.ts`, `EndingScene.ts`, `lore.json` |
| `NAR-022` | Phân nhánh lựa chọn hội thoại + knowledge gates (`DLG-P01–P06`) | `E8` / `G` | `H` | `PROPOSED` | `DialogueSystem.ts`, `dialogues.json`, `PlayerState.ts`, `SaveManager.ts` |
| `NAR-023` | Prologue `28s` khi `New Game` (`CS01–06`) | `E8` / `G` | `H` | `PROPOSED` | `GameScene.ts`, `MainMenuScene.ts`, `PreloadScene.ts` |
| `NAR-024` | Phân tách lời cầu cứu thật vs mồi nhử `Listener` / `Echo` | `E9` / `Y` | `H` | **`CONFLICT`** | `lore.json`, `EchoSystem.ts`, `GameScene.ts` |
| `NAR-025` | Bảo vệ tuyến `Elian` (em Garth) khỏi bị gán thành Dark Knight | `E9/E8` / `?` | `H` | `UNKNOWN` | `dialogues.json`, `lore.json`, `tornPagesData.ts` |
| `NAR-026` | Chủ đề *"Khu rừng vẫn nhớ..."* (không đồng nhất Rừng = The Veil) | `V9→V12.2/E9` / `Y` | `M` | `PROPOSED` | `lore.json`, `tornPagesData.ts` |
| `NAR-027` | `Dark Resonance` / `Abyssal Fury` / `Shadow Step` / `Fallen Oath` | `V12` / `T` | `H` | `TRAILER-ONLY` | `EvilKnights.ts`, `PreloadScene.ts` |
| `NAR-028` | Motif âm nhạc `D–F–E–A` gắn kết Vaelen & Dark Knight | `V12.1→V12.2` / `T` | `L` | `TRAILER-ONLY` | `AudioManager.ts`, `GameScene.ts` |
| `NAR-029` | Bỏ tiếng chuông lặp `V12.1` (`11–26s`) & chuông cuối sang cue ngắn `V12.2` | `V12.2` / `T` | `L` | `SUPERSEDED` | Không đổi lore vật lý Chuông Đồng trong source |
| `NAR-030` | Giữ lỗ hổng tri thức quá khứ đến khi Owner quyết định | `E9` / `Y` | `H` | `WIP` | `lore.json`, `dialogues.json`, `tornPagesData.ts` |

---

## 4. Tổng Hợp Phân Loại Theo Trạng Thái Hiện Hành

- **`CANON-APPROVED` (`2` quyết định danh tính/danh hiệu chính):** `CHAR-K01` (`Meliodas` thay `Drager`), `CHAR-K02` (giữ `Lord Blackwood` & `The Wolf Lord`). *(Ngoài ra hướng phát triển tuyến nhân vật `CHAR-K03` & `CHAR-K04` được Owner chấp nhận về hướng đi, nhưng tiểu sử/lore chi tiết giữ `PROPOSED`).*
- **`CONFLICT` (`5` xung đột cốt lõi — C01–C05):** `NAR-001`, `NAR-003`, `NAR-010`, `NAR-014`, `NAR-024` (liên kết trực tiếp `CONFLICT 01–05` & `OQ-01–06`).
- **`PROPOSED` (`15+` hạng mục):** `NAR-002/005/006/013/016/021/022/023/026`, `NAR-K06` (`Order of the Black Wolf` & `Fides Ultra Tenebras`), `ART-K01/09/10`, `CIN-K13`, `DLG-P01–P06`, kỹ năng mới V1.0 (`Table 01–02`).
- **`TRAILER-ONLY` (`12` hạng mục NAR + Audio/Visual):** `NAR-007/008/009/011/012/015/017/018/019/020/027/028`, `DLG-K07`, `AUD-K12`.
- **`RESOLVED BEYOND UNIFIED BIBLE (`HW-CHAR-01-R2`):** `ART-K08` (`Black Knight V2` = `Meliodas Blackwood`) đã được khôi phục nguyên vẹn từ GitHub (`169` backup files + `194` files tại `Meliodas_Blackwood/`).

---

## 5. Mẫu Ghi Nhận Quyết Định Mới (`DEC-NAR-___`, `Ch. 17 Open Questions §2`)

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
