# HW-V16-A01 — MASTER CANON LOCK & OWNER AUTHORIZATION REPORT

- **Mission ID:** `HW-V16-A01 — MASTER CANON LOCK & OWNER AUTHORIZATION`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Branch / Baseline:** `feat/v1.5.3-ag-world-polish` @ `2b47dcde7d601b36e5e9e3ad1f8a17a8fa465a4d`
- **Mode:** `OFFICIAL CANON LOCK` (`HARD STOP` — `0` production source changes, `0` runtime asset changes, `0` runtime lore removal, `0` auto-execution of `A02`)

---

## 1. Mandatory Lock Summary (`§11`)

- **TOTAL DECISION IDS:** `23` (`DEC-LOCK-01` .. `DEC-LOCK-23`)
- **OWNER AUTHORIZED IDS:** `22` (`DEC-LOCK-01..13`, `DEC-LOCK-15..23`)
- **RESERVED IDS:** `1` — `DEC-LOCK-14` (`CHAR-006 — The Headless Warden`)
- **PARTIAL APPROVALS (`APPROVED-FOR-PREPARATION` / `APPROVED-WITH-LIMITATIONS`):**
  - `DEC-LOCK-06` (`Order of the Black Wolf` / `Fides Ultra Tenebras` — tên, biểu tượng sói & khẩu hiệu `CANON-APPROVED`; thiết kế hình ảnh huy hiệu cụ thể chờ Owner nghiệm thu).
  - `DEC-LOCK-11` (`Vaelen & Mordric` bạn cũ & học trò, Vaelen xác nhận tại `Q05` theo Reveal Gate, Mordric nhận ra qua huy hiệu/dấu hiệu giáp, Vaelen chưa làm companion — số phận cuối & cảnh hỗ trợ còn để mở).
  - `DEC-LOCK-13` (`Sir Roderick` & `Sir Aldemar` tiếp tục từ asset `HOLLOW_WOODS_EXPORT` — tiểu sử, quan hệ, vị trí, vai trò, sprite chính thức, kỹ năng & số phận cuối chờ gate).
  - `DEC-LOCK-17` (`APPROVED-FOR-PREPARATION` cho `DLG-006/007`, `009`, `012/013`, `014/015`, `031–034` — chưa duyệt tích hợp nguyên văn hoặc đổi Menu/Branding).
  - `DEC-LOCK-18` (Hệ thống bán tuyến tính, once-guard trust/reward & 3 ngưỡng Ending `50/3/65` `CANON-APPROVED` — văn bản, cinematic & số phận từng Ending còn chờ duyệt riêng).
  - `DEC-LOCK-20` (Hybrid Cinematic `28s` `CS01–CS06` format `CANON-APPROVED` — storyboard chi tiết, lời dẫn, hình ảnh & âm thanh chờ duyệt trước `A08`).
  - `DEC-LOCK-21` (`B06` được sửa lỗi audio hiện hành — DAW stems `V12.2`, phân bổ voice Kỵ Sĩ, cinematic/bell/Ending music cues chưa duyệt).
- **REMAINING OPEN QUESTIONS:**
  1. Nguồn gốc lời cầu cứu từ khu rừng & cơ chế/tác nhân biến cố xuyên thời gian (`DEC-LOCK-02/03`: cố ý giữ `UNKNOWN`).
  2. Số năm cụ thể đã trôi qua & thứ tự nhân quả với đêm bảy hồi chuông (`DEC-LOCK-04/05`: cố ý giữ bí ẩn).
  3. Thiết kế hình ảnh huy hiệu cụ thể của *Order of the Black Wolf* (`DEC-LOCK-06`).
  4. Số phận cuối cùng của `Sir Vaelen` & `Sir Mordric`, plus chi tiết cảnh hỗ trợ được duyệt (`DEC-LOCK-11`).
  5. Tiểu sử, quan hệ cụ thể với Meliodas, vị trí, vai trò NPC/Boss, sprite chính thức, kỹ năng & số phận cuối của `Sir Roderick` & `Sir Aldemar` (`DEC-LOCK-13`).
  6. Duyệt nguyên văn từng nhóm thoại gameplay `V12.2` & subtitle Main Menu/Branding (`DEC-LOCK-17`).
  7. Văn bản, cinematic & số phận nhân vật trong `3` Ending (`DEC-LOCK-18`).
  8. Storyboard chi tiết, lời dẫn, hình ảnh & âm thanh Opening `28s` (`DEC-LOCK-20` trước `A08`) + Event Registry cho `A10`.
  9. DAW stems `V12.2`, voice allocation Kỵ Sĩ, cinematic cues, bell cue chỉnh sửa & nhạc Ending (`DEC-LOCK-21`) + license các pack cần dùng (`DEC-LOCK-22`).
  10. `CHAR-006` (`DEC-LOCK-14`: `RESERVED / DEFERRED` hoàn toàn độc lập ở `HW-Design`).
- **SUPERSEDED LORE:**
  - Thuyết tự phong ấn ký ức, `Algiz` và tái sinh gắn với nguồn gốc mất trí nhớ (`DEC-LOCK-02` — giữ nguyên các cơ chế rune `Algiz` không liên quan Lore bị thay thế).
  - Bối cảnh hiện đại: ô tô, đèn pha, quốc lộ & thoại hiển thị `Satyr:` (`EndingSystem.ts:1037`, `VeilSystem.ts:44` — `DEC-LOCK-08`, giữ backup/tài liệu lịch sử).
  - Cụm `"hàng trăm năm"` / khẳng định số thế hệ cụ thể (`DEC-LOCK-04`), lỗi chính tả `Sir Valen` (`DEC-LOCK-01/10`), thoại `Vaelen q2` gọi `Hooded Knight` là Tổng Chỉ Huy (`DEC-LOCK-10`), mọi spoil danh xưng `Chỉ Huy` trước Identity Reveal Gate (`DEC-LOCK-07`).
- **MORDRIC IDENTITY STATUS:** **`CANON-APPROVED` (`DEC-LOCK-09`) — `Sir Mordric = The Dark Knight (Kỵ Sĩ Bóng Tối) = HoodedKnightBoss` hiện hành** (`Hooded Knight` là danh xưng trước reveal). Giữ nguyên runtime entity ID, class names, texture keys, quest IDs, save flags, reward IDs (`quest_corrupted_crest`); không tạo boss trùng; không gán = Fallen/Dread Horseman/Headless Warden; sửa thoại & tên hiển thị ở `A02`/`A04`/`D03`.
- **IDENTITY REVEAL STATUS:** **`CANON-APPROVED` (`DEC-LOCK-07`)** — Ban đầu gọi `The Mossbound Wayfarer — Lữ Khách Rêu Phong`; ẩn `Meliodas` & `Tổng Chỉ Huy` tại Menu và đầu game; chỉ reveal khi `Memory Stage >= 3` + chứng cứ phù hợp (không ép `SQ08`; Vaelen nhận ra ở `Q05` nhưng không vượt qua Reveal Gate). Nhất quán toàn bộ Dialogue/Journal/Memory/HUD/Save/Cutscene/Ending (triển khai ở `A02`, `A04`, `A06`, `A09`).
- **DIALOGUE APPROVAL STATUS:** **`APPROVED-FOR-PREPARATION`** (`DEC-LOCK-17/18`) — Soạn ngữ cảnh/điều kiện & kiến trúc bán tuyến tính one-time trust/reward được duyệt; nguyên văn `DLG-006/007/009/012–015/031–034` chưa tích hợp tự động trước khi Owner duyệt từng nhóm; cấm đổi Menu subtitle.
- **ENDING APPROVAL STATUS:** **`CANON-APPROVED` (Logic & `3` Thresholds `Composure >= 50, Stage >= 3, Trust >= 65` — `DEC-LOCK-18`)** / **`PENDING-OWNER-APPROVAL` (Văn bản, cinematic & số phận nhân vật từng Ending)**. Không thêm Ending thứ tư.
- **OPENING CUTSCENE STATUS:** **`APPROVED-WITH-LIMITATIONS` (`DEC-LOCK-20`)** — Chốt phương án **Hybrid Cinematic `28s` (`CS01–CS06`)** + yêu cầu New Game/Continue/Skip/SubVI/Audio/Reduced Motion/Fallback/no early reveal (cấm dùng nguyên trailer 70s); storyboard, lời dẫn, hình ảnh & âm thanh cần duyệt trước `A08`, tích hợp runtime ở `A09`.
- **CHAR-006 STATUS:** **`DEFERRED`** (`DEC-LOCK-14` `RESERVED`, giữ nguyên hồ sơ V3.2 độc lập ở HW-Design, hoãn `D06/D07/E06`, `0` runtime/asset integration).
- **A02 READINESS:** **`READY FOR SEPARATE EXECUTION`** (`DEC-LOCK-01/02/03/04/05/07/08` & `HW_NARRATIVE_RESIDUE_REGISTRY.md` đã mở khóa đầy đủ để dọn tàn dư cũ ở lệnh riêng `HW-V16-A02`).
- **PRODUCTION SOURCE CHANGES:** **`0`**
- **RUNTIME ASSET CHANGES:** **`0`**

---

## 2. Implementation Unlock Matrix (`A02–A10` & Tracks `B–G`)

| Task ID | Status Post `HW-V16-A01` | Governing Locks & Constraints |
| :--- | :---: | :--- |
| **`HW-V16-A02`** | **`READY FOR SEPARATE EXECUTION`** | `DEC-LOCK-01..05, 07, 08, 09, 15, 19`; dọn runtime residue & rebuilt `dist`, không tự chạy trong `A01`. |
| **`HW-V16-A03`** | **`READY FOR DIALOGUE PREPARATION`** | `DEC-LOCK-01..07, 17, 19`; Act 0 + Bellhollow prep; chưa tích hợp nguyên văn `DLG-006/007` trước duyệt. |
| **`HW-V16-A04`** | **`READY FOR DIALOGUE PREPARATION`** | `DEC-LOCK-01, 07, 09, 10, 11, 16, 17`; sửa `q2/q3`, `Mordric = HoodedKnightBoss` compat, `DLG-009/012–015` prep. |
| **`HW-V16-A05`** | **`APPROVED SYSTEM DIRECTION`** | `DEC-LOCK-18`; bán tuyến tính, once-guard `trust`/`reward` 1 lần, anti-farm. |
| **`HW-V16-A06`** | **`APPROVED NARRATIVE DIRECTION`** | `DEC-LOCK-06, 07`; Journal, Torn Pages, Memory Stage 0–3, Identity Reveal Gate. |
| **`HW-V16-A07`** | **`APPROVED STRUCTURE; ENDING TEXT PENDING`** | `DEC-LOCK-04, 08, 16, 18`; giữ route `A→E→B→D→F→E→C→A` & 3 ngưỡng `50/3/65`. |
| **`HW-V16-A08`** | **`APPROVED FORMAT; STORYBOARD & SCRIPT PENDING`** | `DEC-LOCK-03, 07, 20`; Hybrid `28s` `CS01–06`, duyệt media/lời dẫn trước dựng preview. |
| **`HW-V16-A09`** | **`DEPENDENCY A08`** (+ `B04/B07`) | Tích hợp runtime chỉ thực hiện sau khi `A08` hoàn tất. |
| **`HW-V16-A10`** | **`APPROVED EVENT REGISTRY REQUIRED`** | `DEC-LOCK-11, 16`; Vaelen không thành companion; cần Approved Event Registry. |
| **`B–G` (`Roadmap 3.1`)** | **Active (`52` Total) minus `D06/D07/E06`** | `B01/B02` (`BUG-058/059`) giao Codex (`DEC-LOCK-23`); `B06` được phép sửa audio runtime độc lập (`DEC-LOCK-21`). |

---

## 3. Protected Baseline & Files Updated in `A01`

- **Protected Systems Verified Untouched:** `Classic Sanity 2.1`, `Vòng Sáng Hộ Tâm [F]`, `Black Knight V2` recovered atlases/hashes, idle `160 ms/frame`, `Save Schema 3`, `H4-06`, `H4-12A`, stable runtime IDs (`BlackKnightPlayer`, `HoodedKnightBoss`, `quest_corrupted_crest`, `lore_satyr_journal`, `satyr_*`), `17` zone IDs, `3` Ending logic/thresholds, `91/91` archives, `Backups/`, `297` staged `Pixel_Art/` renames & `327` unstaged deletions.
- **Registry Files Synchronized (`Docs Only`):**
  1. [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)
  2. [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md)
  3. [CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md)
  4. [DIALOGUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DIALOGUE_REGISTRY.md)
  5. [HW_NARRATIVE_RESIDUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NARRATIVE_RESIDUE_REGISTRY.md)
  6. [HW_V16_A01_MASTER_CANON_LOCK_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A01_MASTER_CANON_LOCK_REPORT.md)
- **Next Mission Queued (`HARD STOP` until explicitly ordered):** **`HW-V16-A02 — APPROVED LEGACY LORE CLEANUP & NARRATIVE IMPLEMENTATION`**.
