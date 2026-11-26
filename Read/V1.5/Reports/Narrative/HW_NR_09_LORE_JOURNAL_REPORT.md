# HW-NR-09 — LORE, JOURNAL & TORN PAGES RECONSTRUCTION REPORT

- **Mission ID:** `HW-NR-09 — LORE, JOURNAL & TORN PAGES RECONSTRUCTION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Dependency:** `APPROVED CANON & NARRATIVE REGISTRY` ([HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md))
- **Status:** **`BLOCKED FOR RUNTIME REWRITE (AUDIT, BACKUP & DRAFT DIFF COMPLETE)`** *(Vì `DEC-LOCK-01, 02, 04, 06, 07, 09` vẫn chưa được Owner ký duyệt nên **`0` sửa đổi `lore.json`, `tornPagesData.ts`, `JournalModal.ts`, `items.json`, `PlayerState.ts`, `zones.json`**; văn bản lịch sử đã có nguyên vẹn trong [Backups/steps/backup_hw_nr_03/](file:///G:/HOLLOW%20WOODS/Backups/steps/backup_hw_nr_03/) theo [HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json)).*
- **Primary Sources Verified:** `src/data/lore.json` (`540` dòng — `25 loreEntries` + `4 subAreaLoreEntries` = **`29` lore IDs**, `0` ID trùng; kèm `questLog` & `sideQuestLog`), `src/data/tornPagesData.ts` (`366` dòng — **`23` mục**), `src/ui/JournalModal.ts` (`L890–1027`), `src/state/PlayerState.ts` (`L610–622`, `L713–789`), `src/data/items.json` (`L92`, `L359–366`), `src/data/zones.json` (`L3006–3012`, `L3617`, `L4172–4180`).

---

## 1. Phân Loại Toàn Bộ Tài Liệu Đọc Được Trong Game (`KEEP` vs `REWRITE / ANTI-SPOILER`)

### 1.1 `lore.json` (`29` Mục Lore + `Quest Journal`)
| Nhóm & ID | Trạng thái hiện tại | Kết luận xử lý (`HW-NR-09`) | Ghi chú bảo toàn & Anti-Spoiler |
| :--- | :---: | :---: | :--- |
| **`19` mục nền thế giới & địa danh** (`lore_three_rules`, `herbalist_note`, `runestones`, `clapper_curse`, `mire_warden_memory`, `campfire_knight_vow`, `bellmaker_dew_journal`, `broken_sword_mire`, `elian_unsent_letter`, `ancient_oak_hollow`, `root_cellar_alchemy`, `echo_ruins_prayer`, `echo_mire_path`, `stone_chessboard`, `shrine_parchment_map`, `detour_path`, `fog_journal_1`, `blacksmith_journal`, `fog_origin`) | Không mâu thuẫn Canon mới | **`KEEP 100%`** | Bảo toàn nguyên bản; riêng `lore_elian_unsent_letter` (`SQ09`) tách rạch ròi `Elian ≠ Mordric`. |
| **`lore_memory_chapter_1`** (`Act 1`) | An toàn danh tính | **`KEEP` (hoặc chỉnh nhẹ `Act 0`)** | Giữ `The Mossbound Wayfarer`; chỉ đồng bộ nếu `DEC-LOCK-03` đổi dẫn nhập tiếng cầu cứu. |
| **`lore_memory_chapter_2` & `lore_black_knight_chronicle`** (`L57`, `L339`) | Nhắc `Chỉ Huy Hiệp Sĩ Đen` & `phong ấn lời nguyền` ngay Stage `1` | **`REWRITE` (`C01 + C04`)** | Bỏ lộ chức danh sớm ở Stage `1`; viết lại theo góc nhìn bia cổ quá khứ sau khi Owner chốt `DEC-LOCK-01/02/07`. |
| **`lore_memory_chapter_3`** (`L64`) | Nói Hooded Boss gọi `'Chỉ Huy Hiệp Sĩ Đen?!'` | **`REWRITE` (`C03/C04`)** | Đồng bộ thẳng với bản thảo encounter `Sir Mordric / Hooded Knight` (`HW-NR-07`) sau khi Owner chốt `DEC-LOCK-09`. |
| **`lore_memory_chapter_4` & `lore_wayfarer_inner_journal`** (`L71`, `L77–78`) | Chứa nguyên văn **`tự phong ấn ký ức bằng Cổ Ngữ Algiz để tái sinh`** & `Chỉ Huy Hiệp Sĩ Đen` | **`REWRITE` (`C01`)** | Loại bỏ thuyết `tự phong ấn / tái sinh` theo `DEC-LOCK-02`; gắn tên **`Meliodas Blackwood`** tại đúng mốc reveal `DEC-LOCK-07`. |
| **`lore_knights_memorial_stele`** (`L85`) | Lỗi chính tả **`Sir Valen`** + `Tổng Chỉ Huy` | **`REWRITE` (`RES-003`)** | Sửa **`Sir Valen` → `Sir Vaelen`**; rà lại dòng `Tổng Chỉ Huy` & danh sách đoàn kỵ sĩ theo `DEC-LOCK-01/06`. |
| **`lore_ending_true`, `lore_ending_sacrifice`, `lore_ending_fog_loop`** (`L155, 162, 169`) | Chứa **`hàng trăm năm`** (`L155`) & `Chỉ Huy Hiệp Sĩ Đen` | **`REWRITE` (`C04` + `OQ-08`)** | Gỡ `"hàng trăm năm"` theo `DEC-LOCK-04`, đồng bộ `Meliodas Blackwood` theo `DEC-LOCK-18`, **giữ nguyên `ID` & `3` ngưỡng Ending**. |
| **`Quest Journal` (`questLog` + `sideQuestLog`)** | `SQ08_PURIFY_FALLEN` (`L496, 505`) ghi `"Chỉ Huy Hiệp Sĩ Trùm Mũ"` | **Chỉ sửa text `SQ08`** | **Không đổi `quest progression`**, `tasks`, hay tuyến `Q00–Q06` / `SQ01–SQ07` / `SQ09`. |

### 1.2 `tornPagesData.ts` (`23` Mục), Bản Đồ (`zones.json`), & Mô Tả Vật Phẩm (`items.json`)
- **`20/23` mục trong `TORN_PAGES_REGISTRY` (`KEEP`):** Toàn bộ `8` biển chỉ dẫn (`#1–8`), `4` cáo thị/bảng tin (`#9–12`), `inspect_fog_journal_1`, `inspect_bellmaker_dew_journal`, `inspect_elian_unsent_letter`, `inspect_root_cellar_alchemy`, `inspect_shrine_parchment_map`, `read_rune_clue_stele`, `read_shrine_stele`, `read_fog_origin_mural`.
- **`3/23` mục trong `TORN_PAGES_REGISTRY` cần `REWRITE` (hiện đều gắn `memoryAwakeningStage: 1`):**
  1. `read_blacksmith_journal` (`L240–253`): Nhắc *"Chỉ Huy Hiệp Sĩ Đen mang đại kiếm đến lò rèn"*; ngoài ra nội dung đang **khác** với `lore_blacksmith_journal` trong `lore.json:321–326` dù trỏ chung `loreId`!
  2. `inspect_knights_memorial_stele` (`L291–304`): Sửa lỗi tên **`Sir Valen` → `Sir Vaelen`** & đồng bộ câu `Tổng Chỉ Huy` (`L299–300`).
  3. `read_black_knight_stele` (`L307–320`): Gỡ mô tả *"chỉ huy duy nhất tự đánh đổi ký ức phong ấn Mạch Rễ"* ở Stage `1` (chờ `DEC-LOCK-02/07`).
- **Tài liệu trên bản đồ (`zones.json:3006–3012, 3617, 4172–4180` & `maps/veil_origin_cavern.json`):** `veil_commander_epistle` (`loreId: "lore_veil_commander_epistle"`) hiện viết `"Huyết Thư Của Chỉ Huy Hiệp Sĩ Đen — tự phong ấn ký ức và bản ngã..."` -> cần viết lại theo `DEC-LOCK-02` và đồng bộ `lore_veil_commander_epistle` vào `lore.json` nếu hiển thị trong Journal.
- **Di vật & Huy hiệu (`items.json`):** Giữ nguyên ID `lore_satyr_journal` (*"Sổ Nhật Ký Lữ Khách"*, `L92`) để bảo toàn Save Schema `3`; sửa text mô tả `quest_corrupted_crest` (`L362`: `"Chỉ Huy Hiệp Sĩ Trùm Mũ"`) theo `DEC-LOCK-09`; giữ nguyên `relic_heart_of_roots`, `item_broken_patrol_lantern`, `item_knight_journal_page` và vị trí toàn bộ vật phẩm trên bản đồ.

---

## 2. Chống Tiết Lộ Sớm (`PlayerState.ts` & `JournalModal.ts`) & Bảo Toàn Save Cũ

1. **Chặn Spoil Sớm Tại Code Điều Phối:**
   - **`JournalModal.ts:909`:** Hiện in cố định `'📜 BIÊN NIÊN KÝ ỨC HIỆP SĨ ĐEN & CỔ THƯ:'` ngay từ khi mới vào game (`stage = 0`). Đề xuất đổi thành tiêu đề trung tính `'📜 BIÊN NIÊN KÝ ỨC & CỔ THƯ RỪNG RỖNG:'` trước khi người chơi đạt mốc reveal `Meliodas`.
   - **`PlayerState.ts:763–775` & `L615–621`:** Hiện `setMemoryAwakeningStage(1)` mở ngay `lore_black_knight_chronicle`, và mọi choice đồng cảm ở Vaelen/Hooded mở ngay `lore_wayfarer_inner_journal`. Sau khi Owner chốt `DEC-LOCK-07`, tách rõ lộ trình mở khóa `D0–D7` để không lộ tên `Meliodas` trước `D6/D7`.
2. **Bảo Toàn Lore ID & Save Cũ (`Schema v3`):**
   - Giữ **`100%`** các `loreId` hiện hành (`lore_memory_chapter_1..4`, `lore_wayfarer_inner_journal`, `lore_black_knight_chronicle`, `lore_knights_memorial_stele`, `lore_ending_*`, `lore_satyr_journal`). Người chơi load save cũ đã thu thập sẵn ID nào sẽ tự động đọc nội dung mới sạch Canon mà không bị lỗi thiếu ID hay mất trạng thái đã thu thập.

---

## 3. Kết Quả Kiểm Thử Thực Tế (`Lore / Torn Pages / Journal / Save-Load`)

Chạy trực tiếp trên bản sống qua Playwright/Chromium không giao diện (`Vite Dev Server`, `console_errors = []`) + kiểm tra tính toàn vẹn dữ liệu:

| Hạng mục test (`HW-NR-09 §TESTS`) | Kết quả quan sát thực tế | Đánh giá |
| :--- | :--- | :---: |
| **Inventory & ID uniqueness (`lore.json`, `tornPagesData.ts`)** | `25 loreEntries` + `4 subAreaLoreEntries` = **`29` lore IDs** (`dupJsonIds = 0`); **`23`** mục trong `TORN_PAGES_REGISTRY`. | **PASS** |
| **Duplicate entries guard (`PlayerState.unlockLore`)** | Gọi `unlockLore('lore_three_rules')` 2 lần -> `unlockedLore.length` giữ nguyên `1`; mở toàn bộ `29` mục -> `fullCount = 29`, `uniqueFullCount = 29`. | **PASS** |
| **Journal Display, Tiếng Việt & Text Wrapping (`[J]`)** | Mở Tab `lore` cho entry dài nhất (`lore_wayfarer_inner_journal`): `fontSize = '11px'`, `contentBottom = 535px` nằm an toàn phía trên footer `◀ Trước / Sau ▶` (`footerY = 590px`, dư `55px`); ghi nhận dòng spoil `leftTitleText = "📜 BIÊN NIÊN KÝ ỨC HIỆP SĨ ĐEN & CỔ THƯ:"`. | **PASS (Layout) / SPOIL ISSUE (`L909`)** |
| **`TornPageModal` Display & Tiếng Việt** | Mở `inspect_knights_memorial_stele` (`BIA ĐÁ TƯỞNG NIỆM ĐOÀN KỴ SĨ`): `tpmOpen = true`, hiển thị UTF-8 sạch không lỗi console. | **PASS** |
| **Save/Load & Legacy ID Restore (`Schema v3`)** | Lưu `29` lore IDs, khôi phục save giả lập cũ chỉ có `['lore_black_knight_chronicle']` (`legacySingleCount = 1`) rồi khôi phục lại save `29` IDs (`restoredCount = 29`). | **PASS** |

---

## 4. Hard Stop
- **Chưa sửa mã nguồn hay dữ liệu** (`0` chỉnh sửa `lore.json`, `tornPagesData.ts`, `JournalModal.ts`, `items.json`, `PlayerState.ts`, `zones.json`) chờ Owner ký [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) (`DEC-LOCK-01/02/04/06/07/09`).
- **Không** đổi quest progression, **không** xóa lore ID còn tham chiếu, **không** thay đổi vị trí vật phẩm, **không** xóa backup/tài nguyên, **không** commit/push.