# HW-NARRATIVE-00A — MASTER GAME BIBLE INGESTION REPORT

- **Mission ID:** `HW-NARRATIVE-00A` (`SUPERSEDES: HW-NARRATIVE-K00`)
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Date:** `2026-11-26`
- **Mode:** `DOCUMENTATION ONLY` (`HARD STOP` sau bước `00A`)
- **Workspace / Branch / HEAD:**
  - Workdir: `G:\HOLLOW WOODS`
  - Branch: `feat/v1.5.3-ag-world-polish`
  - `HEAD`: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`
  - Local uncommitted diff (từ `HW-H4-12A` trước đó): `src/entities/BlackKnightPlayer.ts`, `src/scenes/UIScene.ts`, `src/ui/CraftingModal.ts`, `src/ui/JournalModal.ts`

---

## 1. Safety Gate & Cross-Mission Checks (`§2`)

| Tài liệu / Nhiệm vụ kiểm tra | Đường dẫn | Kết quả |
| :--- | :--- | :--- |
| `AGENTS.md` (Project Root & `Read/`) | [AGENTS.md](file:///G:/HOLLOW%20WOODS/Read/AGENTS.md) | Đã đọc toàn văn; tuân thủ read-only / backup / `import * as Phaser` / slice quy tắc |
| `AI_IRON_RULES.md` | [AI_IRON_RULES.md](file:///G:/HOLLOW%20WOODS/Read/AI_IRON_RULES.md) | Đã đọc toàn văn; bảo vệ pixel art, UI `#141712`/`#C8963E`, Hộ Tâm `[F]`, Sanity `2.1`, anchor `(0.5, 1.0)` |
| `FOLDER_STRUCTURE_RULES.md` | [FOLDER_STRUCTURE_RULES.md](file:///G:/HOLLOW%20WOODS/docs/FOLDER_STRUCTURE_RULES.md) | Đã đọc toàn văn; báo cáo đặt trong `Read/V1.5/Reports/` |
| `HW-WORLD-20A` | [HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md) | Đã đọc: `17` zones audited, `329` static colliders, `15` invisible wall causes, GTX 1070 Ti `~60 FPS` |
| `HW-CHAR-01-R2` | [HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md) | Đã đọc: Codex Black Knight V2 = `Meliodas Blackwood` đã được khôi phục (`169` backup files, ZIP SHA `8fef3b3b...`, `194` files trong `Meliodas_Blackwood/`) |
| `HW-H4-12A` | [HW_H4_12A_CRAFTING_INPUT_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_12A_CRAFTING_INPUT_REPORT.md) | Đã đọc: `H4-NEW-04` `[C]` double-toggle fix (`FIXED-PENDING-OWNER`) |
| `HW-ASSET-04` | — | Không tìm thấy báo cáo trong `Read/V1.5/Reports/` (`NOT YET EXECUTED`) |
| `HOLLOW_WOODS_EXPORT\Documentation\Narrative\` | `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Documentation\` | Chưa tồn tại trong thư mục export tại thời điểm ingest |

---

## 2. Xác Minh Tệp Nguồn Master Game Bible & Tư Liệu Kèm Theo

### 2.1 Tệp Chính Đã Tiếp Nhận
- **Đường dẫn Workspace:** `G:\HOLLOW WOODS\HW\Trailer\HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`
- **Tệp Owner đính kèm tương ứng:** `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` (`media_1795685249510_3c34de3b.docx`, trong chỉ thị gọi `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED(2).docx`)
- **Kiểm tra trùng khớp nhị phân:** Hai tệp khớp **100% từng byte**:
  - **Dung lượng:** `112,394` bytes
  - **SHA-256:** `27a70c2fc7387a56590f192115e6d5ce47d72927f88f0e8ea679068c2228f7b4`
  - **Cấu trúc XML thực tế (`word/document.xml`):** `959` body paragraphs, **`18` chương đánh số (`01–18`)**, **`20` bảng dữ liệu (`Table 01–20`)**, plus Mục lục & Quy tắc ưu tiên.
  - **Lưu ý metadata `docProps/app.xml`:** Thuộc tính `<Pages>1</Pages>` được Mac Word xuất mặc định không cập nhật số trang hiển thị (`59` trang khi render PDF/Word). Nội dung văn bản trích xuất đầy đủ là `1,226` dòng có cấu trúc (`177,736` bytes UTF-8), khớp trọn vẹn phần văn bản Owner dán.

### 2.2 Các Tệp Đồng Bộ Khác Đã Xác Minh
| Tệp | Đường dẫn Workspace / Upload | Dung lượng | SHA-256 | Nội dung xác minh |
| :--- | :--- | :---: | :--- | :--- |
| `HOLLOW_WOODS_NARRATIVE_HANDOVER_V2.zip` | `HW\Trailer\` & `.user_uploaded\media_1795685260454_651098ac.zip` | `37,750` bytes | `81ca70ccfdad0c4c9f79cab651fab3258a54fefaa02d549f6be39edc5e3a9806` | Byte-identical; chứa đúng `6` Markdown files (`CHARACTER_RELATIONSHIP`, `DIALOGUE_CHANGE_REGISTRY`, `IMPLEMENTATION_IMPACT`, `OPEN_QUESTIONS`, `STORY_BIBLE_DRAFT_V2`, `TRAILER_NARRATIVE_CHANGE_REPORT`) |
| `HOLLOW_WOODS_COMPLETE_MASTER_GAME_BIBLE_LATEST.docx` | `HW\Trailer\` & `.user_uploaded\media_1795685278241_f51d52e3.docx` | `70,095` bytes | `cac7762d6aed50317ec752609635815dd285037f062801baaee05d559e0aab8c` | Byte-identical (`1,353` paragraphs, bản hợp nhất dạng văn bản thuần trước khi dàn bảng Unified) |
| `HOLLOW_WOODS_NARRATIVE_RECONSTRUCTION_V1.0.docx` | `HW\Trailer\` & `.user_uploaded\media_1795685294238_ef09316a.docx` | `57,198` bytes | `1ba96f592ba1493dc20773bbab19f30be07d2dd4acc559ae362fe888024f1702` | Byte-identical (`175` paragraphs, `13` tables) |

### 2.3 `11` Tệp Ảnh Tham Chiếu Owner Đính Kèm (`.user_uploaded/`)
- `media_1795685410656_6ae9eb2e.jpg` (`SHA-256`: kiểm trực tiếp trong session) & `8215d4ea.jpg`: Bảng storyboard Trailer `01s–59s`.
- `media_1795685429250_6ea29331.jpg`: Concept sheet `THE HEADLESS WARDEN` (trùng khớp với `HW\Trailer\Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png`, SHA-256 `3276186e7a46b6ff23b2c028ec4fe2b6f213ef4b4eafd53a776ef08955cbd01d`).
- `media_1795685432191_f18e33c3.jpg`: Artwork `The Wolf Lord` cưỡi sói.
- `media_1795685437764_4edfcc4d.png` & `media_1795685437752_1d29e3e3.png`: Lưới icon thảo mộc / vật phẩm / ngọc (song song `32x32Materials.png` SHA `ca22ae95...`, `64x64Materials.png` SHA `b26128ac...` trong `HW\Trailer\`).
- `media_1795685465232_25d535a1.jpg`: Key visual `HOLLOW WOODS — KHU RỪNG ĐANG DÕI THEO` (`SHA-256: 843392eb...`).
- `media_1795685465235_d18d7b85.jpg`: Thẻ thoại `Edda — Người Giữ Chuông` (`SHA-256: deebfc1b...`).
- `media_1795685540600_9681e407.jpg`: Triptych flashback Edda + Người thầy/2 học trò + đối đầu Dark Knight (`SHA-256: 62bcd088...`).
- `media_1795685557089_3a70d638.png` (`0b688fa4...`) & `media_1795685560469_51be6743.png` (`489178ff...`): Preview `Mattz Art — HEADLESS HORSEMAN` (chỉ dùng làm tham chiếu cảnh báo cấm trace/cấm dùng).

---

## 3. Kiểm Kê Đầy Đủ `18` Chương & `20` Bảng Đã Đọc

### 3.1 Tất Cả `18` Chương (100% Đã Đọc Trực Tiếp)
1. **Ch. 01 | Quy ước và nguồn sự thật:** Phân định `CANON-APPROVED`, `ACCEPTED CHARACTER`, `PROPOSED`, `WIP`, `TRAILER-ONLY`, `CONFLICT`, `UNKNOWN`; phạm vi `S1–S6` & giới hạn lịch sử.
2. **Ch. 02 | Bản sắc và gameplay:** Studio `KYOSHIRO STUDIO`, `HOLLOW WOODS`, thông số Phaser `4.2.1` / `1280×720` / `640×360` / zoom `2.2x`, `17` zones, `43` items, `18` recipes, `29` lore.
3. **Ch. 03 | Lore và cốt truyện:** Lore baseline, hướng cốt truyện 3 Hồi của Owner (`PROPOSED`), `CONFLICT 01–05`, bổ sung lịch sử V1.0.
4. **Ch. 04 | Ba dòng thời gian:** World Chronology (`A`), Player Discovery (`B`), Trailer `V12.2` (`C`).
5. **Ch. 05 | Character Bible — danh tính và vai trò:** `CHAR-001–019` + 7 nhóm phụ + ma trận kỹ năng V1.0 (`Table 01`, `Table 02`).
6. **Ch. 06 | Knight Order Bible & sơ đồ quan hệ:** `Order of the Black Wolf` / `Fides Ultra Tenebras` (`PROPOSED`), sơ đồ thầy–trò & quy tắc tách entity.
7. **Ch. 07 | World & Map Bible:** `Table 03` (`17` zones đầy đủ), quest topology `A→E→B→D→F→E→C→A`, hướng World Reconstruction 2.0.
8. **Ch. 08 | Dialogue Bible — bản mới và lựa chọn:** Lời thoại trailer V12.2, ví dụ lựa chọn & `Table 04` (NPC phụ).
9. **Ch. 09 | Opening & Cutscene — storyboard đề xuất:** Prologue `28s` (`Table 05` `CS01–CS06`), fallback/skip, quy chuẩn cutscene trong game.
10. **Ch. 10 | Quest, gameplay, ending và Save:** Main route 7 chặng (`Table 06`), Logic hội thoại/Save (`Table 07`), Composure, Classic Sanity `2.1`, 3 ending & Save Schema `3`.
11. **Ch. 11 | Pixel Art Asset Bible — tuyển chọn mới:** `ASSET-K01–K11`, đặc tả `ART-K01` Headless Warden nguyên bản, forensic `Black Knight V2`.
12. **Ch. 12 | Visual Identity & World Reconstruction:** Bảng màu UI & cảnh, phân lớp tái tạo môi trường (`Table 08`), lộ trình pilot & mục tiêu `60 FPS`.
13. **Ch. 13 | Audio Bible:** `5` BGM, `4` ambience, SFX, chuẩn V12.1/V12.2 `D–F–E–A`, outro không chuông (`−17.87 LUFS`), ma trận cue theo khu vực (`Table 09`).
14. **Ch. 14 | Trailer history và latest screenplay:** Tiến trình `V1–V12.2`, `70s` shot list `HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`.
15. **Ch. 15 | Source Impact & development roadmap:** Phân tầng tác động `LOW / MEDIUM / HIGH / CRITICAL`, queue `NR-K00..K03` & `NR-00..08` (`Table 10`), tiêu chí nghiệm thu 12 điểm.
16. **Ch. 16 | Master registry — quyết định hiện hành:** `CHAR-K01..TECH-K14`, 15 câu hỏi ưu tiên, đối chiếu cập nhật (`Table 11`).
17. **Ch. 17 | Phụ lục audit V2 — registry lịch sử:** Trọn vẹn 6 Markdown từ `HOLLOW_WOODS_NARRATIVE_HANDOVER_V2.zip` (`Tables 12–20`), `NAR-001–030`, `DLG-001–035`, `DLG-P01–P06`, checklist `59` keys `dialogues.json`, `I-01–07`, `OQ-01–20`.
18. **Ch. 18 | Lệnh bàn giao và kiểm soát xung đột:** Hiến chương phối hợp GPT / AG / Codex, kiểm tra hợp nhất & quy tắc giữ nguyên tài liệu nguồn.

### 3.2 Tất Cả `20` Bảng Dữ Liệu (`Table 01–20` — 100% Đã Trích Xuất & Đối Chiếu)
- `Table 01` (8 dòng): Kỹ năng NVC & Sir Vaelen (`PROPOSED`).
- `Table 02` (8 dòng): Kỹ năng Dark Knight, thuộc hạ & Satyr (`PROPOSED` / `TRAILER-ONLY`).
- `Table 03` (18 dòng): `17` Zone IDs, tọa độ `(x,y,w,h)`, Fog/Ambient, vai trò.
- `Table 04` (4 dòng): Lựa chọn NPC phụ Neris / Bram / Finn (`PROPOSED`).
- `Table 05` (7 dòng): Storyboard Prologue `CS01–06` (`28s`).
- `Table 06` (8 dòng): Tuyến nhiệm vụ 7 chặng `A→E→B→D→F→E→C→A`.
- `Table 07` (6 dòng): Hợp đồng dữ liệu hội thoại, `stage 0–3`, save/load, skip.
- `Table 08` (7 dòng): 6 lớp tái tạo cảnh quan & Classic Sanity `2.1`.
- `Table 09` (8 dòng): Ma trận Audio Cue 7 khu vực/cảnh (`V12.2`).
- `Table 10` (10 dòng): Kế hoạch Queue `NR-00..NR-08` & gate nghiệm thu.
- `Table 11` (8 dòng): Cập nhật đối chiếu danh tính & câu hỏi mới.
- `Table 12` (10 dòng): Bằng chứng kiểm tra `E1–E9` trong Audit V2.
- `Table 13` (16 dòng): Lịch sử phát triển narrative `V1–V12.2`.
- `Table 14` (10 dòng): Chronological Timeline `T−?` đến `T+?`.
- `Table 15` (9 dòng): Player Discovery Timeline `D0–D7` & kiểm soát spoiler.
- `Table 16` (8 dòng): Quy ước đối chiếu tên/entity nguồn vs trailer.
- `Table 17` (7 dòng): `DLG-P01–P06` choice registry (`PROPOSED`).
- `Table 18` (25 dòng): Source Impact chi tiết trên `24` cụm file thực tế.
- `Table 19` (10 dòng): Backlog có điều kiện `NA-00–08`.
- `Table 20` (21 dòng): `20` Câu hỏi khóa Canon `OQ-01–20`.

---

## 4. Các Điểm Thiếu / Khoảng Trống Dữ Liệu Được Ghi Nhận Trung Thực

1. **Tư liệu lịch sử chưa có bản gốc trong đợt bàn giao:** Thiếu transcript đầy đủ của `V1–V6`, `V7–V8`, `V10`, `V11.1–V11.6`; không có file `.mp4` `HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`, project subtitle hay bộ audio stems `V12.2` trong workspace hiện tại (chưa thể tự kiểm tra lại âm lượng hay từng frame V12.2; giữ nguyên trạng thái `UNKNOWN` đối với phần thiếu).
2. **Thư mục `HOLLOW_WOODS_EXPORT\Documentation\Narrative\`:** Chưa có sẵn khi kiểm tra; báo cáo & index hiện được lưu chuẩn theo `FOLDER_STRUCTURE_RULES.md` tại `G:\HOLLOW WOODS\Read\V1.5\Reports\`.
3. **Điểm đồng bộ hóa quan trọng với `HW-CHAR-01-R2`:** Bản Word Unified vẫn ghi `ART-K08` (`Black Knight V2`) là *"chưa tìm được file hoặc commit"*, nhưng nhiệm vụ `HW-CHAR-01-R2` trước đó đã khôi phục thành công trọn vẹn (`169` backup files + `194` files ở `Meliodas_Blackwood/`). Đã cập nhật ghi chú đối chiếu rõ trong [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md).
4. **Dấu vết `HW-ASSET-04`:** Chưa từng chạy trong workspace; không viện dẫn kết quả giả định.

---

## 5. Thứ Tự Tra Cứu Khuyến Nghị Cho Các Đợt Phát Triển Tiếp Theo

1. **Bước 1 (Điều phối & Ràng buộc):** Đọc [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md) Mục `0` (Ưu tiên + Quy tắc bảo vệ) và Mục `13–14` (`Canon Decisions` + `OQ-01–20`).
2. **Bước 2 (Kiểm tra xung đột trước khi sửa code/text):** Đối chiếu `CONFLICT 01–05` (Mục `2.4`) và `I-01–07` (Mục `12.1`), đảm bảo Owner đã xuất `DEC-NAR-___` cho hạng mục định đụng tới.
3. **Bước 3 (Triển khai theo chuyên ngành):**
   - *Lore / Dialogue / Quest:* Tra Mục `2`, `6`, `7`, đối chiếu checklist `59` keys tại Mục `6.3`.
   - *Nhân vật / Nghệ thuật / UI:* Tra Mục `3`, `4`, `9` + [HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md).
   - *Bản đồ / Môi trường:* Tra Mục `5` + [HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_RECONSTRUCTION_MASTER_PLAN.md).
   - *Âm thanh / Cutscene:* Tra Mục `10`, `11`.
4. **Bước 4 (Đối chiếu nguyên văn chi tiết nhất):** Khi cần từng câu wording lịch sử hoặc chi tiết bảng audit sâu, quay về đọc trực tiếp `G:\HOLLOW WOODS\HW\Trailer\HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx` hoặc 6 Markdown trong `HOLLOW_WOODS_NARRATIVE_HANDOVER_V2.zip`.

---

## 6. Kết Quả Kiểm Chứng Sau Cùng (`HW-NARRATIVE-00A`)

- **Kiểm tra thay đổi mã nguồn (`src/`, `public/assets/`):** Không chỉnh sửa bất kỳ file nào ngoài `HW-H4-12A` đã có từ trước khi bắt đầu `00A`.
- **Kiểm tra bảo toàn archive & backup:** `0` tệp `.zip`/`.rar`/`.7z`/`.docx` hay backup bị xóa, di chuyển hoặc ghi đè.
- **Tài liệu mới tạo:**
  1. [PROJECT_KNOWLEDGE_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/PROJECT_KNOWLEDGE_INDEX.md)
  2. [HW_NARRATIVE_00A_INGESTION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NARRATIVE_00A_INGESTION_REPORT.md)
- **Trạng thái dừng:** **`HARD STOP`** sau khi hoàn tất `HW-NARRATIVE-00A`. Chưa thực hiện `HW-NARRATIVE-00B` hoặc bất kỳ queue chỉnh sửa source nào.
