# HOLLOW WOODS — CANON DECISION REGISTRY (`HW-V16-A01 LOCKED`)

- **Mission History:** `HW-NARRATIVE-00B` → **`HW-V16-A01 — MASTER CANON LOCK & OWNER AUTHORIZATION`** (`2026-11-26`)
- **Primary Decision Matrix:** [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) (`22` Owner-Authorized IDs + `1` Reserved `DEC-LOCK-14`)
- **References:** `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`, `HOLLOW WOODS V1.6 — Technical Implementation Bible · Roadmap 3.0.docx`, `HOLLOW_WOODS_HEADLESS_WARDEN_V3_2_DESIGN_CODE_HANDOVER.docx`

---

## 1. Quy Tắc Thẩm Định Canon (`Ch. 01`, `Ch. 17` & `HW-V16-A01`)

- **Hai trục độc lập:** `CANON STATUS` (mức phê duyệt của Owner) ≠ `IMPLEMENTATION STATUS` (`GAME-IMPLEMENTED` vs `IMPLEMENTATION-PENDING` trong runtime `2b47dcd`). Không đánh dấu nội dung đã triển khai chỉ vì Canon được phê duyệt.
- **Trạng thái chuẩn hóa (`HW-V16-A01`):** `CANON-APPROVED` | `APPROVED-FOR-PREPARATION` | `APPROVED-WITH-LIMITATIONS` | `TRAILER-ONLY` | `SUPERSEDED` | `PENDING-OWNER-APPROVAL` | `RESERVED / DEFERRED` | `IMPLEMENTATION-PENDING`.

---

## 2. Master Decision Ledger Hiện Hành (`CHAR-K01` – `TECH-K14` Synced with `DEC-LOCK-01..23`)

| Decision ID | Chủ đề & Khóa `DEC-LOCK-*` | Canon Status | Implementation Status | Chi tiết & Ràng buộc |
| :--- | :--- | :---: | :---: | :--- |
| **`CHAR-K01`** | Đổi tên thật NVC: **`Drager` → `Meliodas Blackwood`** (`DEC-LOCK-01/07`) | **`CANON-APPROVED`** (`Drager` `SUPERSEDED`) | `IMPLEMENTATION-PENDING` | Ẩn ở Menu & đầu game (`The Mossbound Wayfarer — Lữ Khách Rêu Phong`); chỉ reveal ở `Memory Stage >= 3` + chứng cứ phù hợp (không ép `SQ08`). |
| **`CHAR-K02`** | Danh hiệu **`Lord Blackwood`**, **`The Wolf Lord`**, Người Thầy & **Tổng Chỉ Huy** ẩn (`DEC-LOCK-01/07`) | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` | Meliodas từng là Người Thầy & Tổng Chỉ Huy dìu dắt `Vaelen & Mordric`; giấu kín cho tới Reveal Gate. |
| **`CHAR-K03`** | Tuyến Kỵ Sĩ: **`Vaelen`**, **`Mordric = Dark Knight / HoodedKnightBoss`**, **`Roderick`**, **`Aldemar`** (`DEC-LOCK-09..13`) | **`CANON-APPROVED`** (`Vaelen`/`Mordric` base) & **`APPROVED-WITH-LIMITATIONS`** (`Roderick`/`Aldemar`) | `Vaelen` & `HoodedKnightBoss` baseline; đổi display/thoại `IMPLEMENTATION-PENDING` | `Sir Mordric` = `HoodedKnightBoss` (giữ runtime ID/class/texture/quest/`quest_corrupted_crest`). Số phận cuối `Vaelen`/`Mordric` & tiểu sử/sprite/vị trí `Roderick`/`Aldemar` còn mở. |
| **`CHAR-K04`** | Boss **`The Headless Warden`** (`CHAR-006`, `DEC-LOCK-14`) | **`RESERVED / DEFERRED`** | `DEFERRED` (Excluded from V1.6) | Phát triển độc lập ở `HW-Design` (`V3.2`); hoãn `D06/D07/E06`; cấm entity/AI/spawn/placeholder runtime. |
| **`NAR-K05`** | Nguồn mất trí nhớ & lời cầu cứu (`DEC-LOCK-02/03/04/05/19`) | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`) | Thay tự phong ấn/`Algiz`/tái sinh bằng **biến cố xuyên thời gian bí ẩn** (giữ `Algiz` không liên quan Lore); lời gọi `UNKNOWN`; không chốt số năm; `Làng Sương Mù = Bellhollow`; Edda nắm truyền khẩu/cảm nhận. |
| **`NAR-K06`** | **`Order of the Black Wolf` (`Đoàn Kỵ Sĩ Hắc Lang`)**, biểu tượng Sói, khẩu hiệu **`Fides Ultra Tenebras`** (`DEC-LOCK-06`) | **`CANON-APPROVED`** *(Visual badge `PENDING-OWNER-APPROVAL`)* | `IMPLEMENTATION-PENDING` (`A02`/`A06`) | Tên & khẩu hiệu đã khóa; mẫu vẽ huy hiệu cụ thể vẫn cần Owner nghiệm thu. |
| **`DLG-K07`** | Chuẩn bị thoại `V12.2` (`DLG-006/007/009/012–015/031–034`) & bán tuyến tính (`DEC-LOCK-17/18`) | **`APPROVED-FOR-PREPARATION`** *(Final lines & Ending text `PENDING-OWNER-APPROVAL`)* | `IMPLEMENTATION-PENDING` (`A03–A07`) | Được soạn ngữ cảnh & điều kiện ở `A03–A05`; **cấm** tích hợp nguyên văn hoặc đổi Menu Branding trước duyệt; `trust` & `reward` chỉ cập nhật 1 lần. |
| **`ART-K08`** | **`Black Knight V2` (`Meliodas Blackwood`)** (`HW-CHAR-01-R2`, `DEC-LOCK-23`) | **`CANON-APPROVED`** (Asset chính thức) | **`RECOVERED & VERIFIED`** (Runtime `black_knight_*` giữ) | `BUG-058` / `BUG-059` giao **Codex** xử lý ở `B01`/`B02` trên worktree/task riêng. |
| **`ART-K09`** | Cấm trace/dùng pack `Mattz Art` (`ASSET-K11`) (`DEC-LOCK-14/22`) | **`CANON-APPROVED`** (`Blacklisted`) | `VERIFIED` | Chỉ dùng asset hợp lệ bản quyền cho nhân vật được phép; giữ nguyên cấm đối với `CHAR-006`. |
| **`ART-K10`** | Chính sách chọn asset `Roderick`/`Aldemar`/`World` (`DEC-LOCK-13/22`) | **`CANON-APPROVED`** (`EXISTING ASSET FIRST`) | `IMPLEMENTATION-PENDING` (`D04/D05`) | Kiểm giấy phép/góc nhìn/animation/tỷ lệ từ `HOLLOW_WOODS_EXPORT`; không tự mua; không dùng AI nếu license cấm. |
| **`MAP-K11`** | **`World Reconstruction 2.0`** (`DEC-LOCK-16/23`) | **`CANON-APPROVED`** (Scope `C01–C10`, Route `A→E→B→D→F→E→C→A`) | `HW-WORLD-20A` audited; runtime `IMPLEMENTATION-PENDING` (`C01–C10`) | Bảo toàn `17` zone IDs; chỉ dành chỗ tham khảo `CHAR-006` trong tài liệu thiết kế. |
| **`AUD-K12`** | Âm thanh `V12.2` vs sửa bug runtime `B06` (`DEC-LOCK-21`) | **`APPROVED-WITH-LIMITATIONS`** | `IMPLEMENTATION-PENDING` (`B06`) | Được phép sửa Music Volume, BGM, Mute & Audio Lifecycle ở `B06`; DAW stems `V12.2`, voice Kỵ Sĩ, cinematic/bell/Ending cues chưa duyệt (`PENDING-OWNER-APPROVAL`). |
| **`CIN-K13`** | Opening Cutscene Hybrid `28s` (`CS01–CS06`, `DEC-LOCK-20`) | **`APPROVED-WITH-LIMITATIONS`** | `IMPLEMENTATION-PENDING` (`A08`/`A09`) | Chốt format Hybrid 28s; **storyboard chi tiết, lời dẫn, hình ảnh & âm thanh** cần Owner duyệt trước `A08`. |
| **`TECH-K14`** | Hợp đồng kỹ thuật bắt buộc (`DEC-LOCK-09/16/18/23`) | **`CANON-APPROVED`** | **`GAME-IMPLEMENTED`** (Baseline Protected) | Bảo toàn `BlackKnightPlayer`, `black_knight_*`, `Classic Sanity 2.1`, Vòng Sáng `[F]`, idle `160ms`, `Save Schema 3`, `H4-06`, `H4-12A`, `17` zone IDs, route `7` chặng & ngưỡng 3 Ending (`50 / 3 / 65`). |

---

## 3. Sổ Đăng Ký `30` Thay Đổi Lịch Sử (`NAR-001` – `NAR-030` Post `HW-V16-A01`)

| NAR ID | Nội dung thay đổi tóm tắt | Liên kết `DEC-LOCK` | Canon Status (`A01`) | Impl Status |
| :--- | :--- | :---: | :---: | :---: |
| `NAR-001` | Nguồn gọi đầu game: Lời cầu cứu bí ẩn từ rừng (`UNKNOWN`) | `DEC-LOCK-03` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`/`A03`) |
| `NAR-002` | Ẩn `Tổng Chỉ Huy` & tên `Meliodas` cho tới Stage 3 + chứng cứ | `DEC-LOCK-01/07` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`/`A06`) |
| `NAR-003` | Thay tự phong ấn/`Algiz`/tái sinh bằng biến cố xuyên thời gian bí ẩn | `DEC-LOCK-02` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`) |
| `NAR-004` | Bỏ `hàng trăm năm`/`số thế hệ`; Làng Sương Mù = Bellhollow | `DEC-LOCK-04` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`/`A07`) |
| `NAR-005` | Meliodas vừa là Người Thầy vừa là Tổng Chỉ Huy (ẩn tới reveal) | `DEC-LOCK-01` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`/`A04`) |
| `NAR-006` | `Vaelen` & `Mordric` là bạn cũ và học trò của Meliodas | `DEC-LOCK-11` | **`CANON-APPROVED`** *(Số phận mở)* | `IMPLEMENTATION-PENDING` (`A04`) |
| `NAR-007` | Hai thẻ thoại `Edda` (`DLG-006–007`) | `DEC-LOCK-17` | **`APPROVED-FOR-PREPARATION`** | `IMPLEMENTATION-PENDING` (`A03`) |
| `NAR-008` | Rút gọn `Garth / Edda / Neris` | `DEC-LOCK-17` | **`APPROVED-FOR-PREPARATION`** | `IMPLEMENTATION-PENDING` (`A03`) |
| `NAR-009` | Thoại lời thề `Vaelen` (`DLG-009`) | `DEC-LOCK-17` | **`APPROVED-FOR-PREPARATION`** | `IMPLEMENTATION-PENDING` (`A04`) |
| `NAR-010` | Sửa Vaelen `q2` vs `q3`: `q2` không gọi Hooded là Tổng Chỉ Huy | `DEC-LOCK-10` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A04`) |
| `NAR-011` | Dẫn truyện Hộ Tâm / Sanity (`DLG-010–011`) | `DEC-LOCK-17` | `TRAILER-ONLY` | Keep baseline `[F]` |
| `NAR-012` | Dẫn động cơ Clapper (`DLG-016–017`) | `DEC-LOCK-16/17` | `TRAILER-ONLY` / Prep | `IMPLEMENTATION-PENDING` (`A07`) |
| `NAR-013` | `Satyr` giữ `TRAILER-ONLY`, dọn tàn dư `Satyr:` ô tô/quốc lộ | `DEC-LOCK-08/15` | **`TRAILER-ONLY`** / Cleanup `CANON-APPROVED` | `IMPLEMENTATION-PENDING` (`A02`) |
| `NAR-014` | `Sir Mordric` = `Dark Knight` = `HoodedKnightBoss` (giữ ID/flags/`quest_corrupted_crest`) | `DEC-LOCK-09` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`/`A04`/`D03`) |
| `NAR-015` | `Mordric` nhận ra thầy qua huy hiệu/dấu hiệu giáp (`DLG-012–013`) | `DEC-LOCK-11/17` | **`CANON-APPROVED`** *(Hook)* / **`APPROVED-FOR-PREPARATION`** *(Lines)* | `IMPLEMENTATION-PENDING` (`A04`) |
| `NAR-016` | Động cơ oán trách của `Mordric` (không khẳng định ác tuyệt đối; số phận mở) | `DEC-LOCK-11/17` | **`APPROVED-FOR-PREPARATION`** *(Số phận `PENDING-OWNER-APPROVAL`)* | `IMPLEMENTATION-PENDING` (`A04`) |
| `NAR-017` | `Vaelen` hỗ trợ cốt truyện/cinematic (`DLG-014–015`), chưa làm companion | `DEC-LOCK-11/17` | **`CANON-APPROVED`** *(Non-companion)* / **`APPROVED-FOR-PREPARATION`** *(Lines)* | `IMPLEMENTATION-PENDING` (`A04`/`A10`) |
| `NAR-018` | `Knight_2 / Knight_3` trong cảnh hang trailer | `DEC-LOCK-12` | **`TRAILER-ONLY`** | Excluded from runtime |
| `NAR-019` | Thứ tự trailer không ép thay đổi main route `A→E→B→D→F→E→C→A` | `DEC-LOCK-16` | **`CANON-APPROVED`** (Keep game route) | Protected (`A07`) |
| `NAR-020` | Branding Menu & lời kết trailer (`DLG-031–034`) | `DEC-LOCK-17` | **`APPROVED-FOR-PREPARATION`** *(Cấm tự đổi Menu)* | `IMPLEMENTATION-PENDING` (`PENDING-OWNER-APPROVAL`) |
| `NAR-021` | `3` Ending giữ ngưỡng `50/3/65`; văn bản/fates chờ duyệt riêng | `DEC-LOCK-18` | **`CANON-APPROVED`** *(Logic)* / **`PENDING-OWNER-APPROVAL`** *(Copy)* | `IMPLEMENTATION-PENDING` (`A07`) |
| `NAR-022` | Phân nhánh bán tuyến tính & anti-farm `trust`/`reward` 1 lần (`DLG-P01–P06`) | `DEC-LOCK-18` | **`CANON-APPROVED`** (Architecture) | `IMPLEMENTATION-PENDING` (`A05`) |
| `NAR-023` | Opening Prologue Hybrid `28s` (`CS01–CS06`) | `DEC-LOCK-20` | **`APPROVED-WITH-LIMITATIONS`** | `IMPLEMENTATION-PENDING` (`A08`/`A09`) |
| `NAR-024` | Tách lời cầu cứu `UNKNOWN` khỏi mồi nhử `Listener` / `Echo` | `DEC-LOCK-03` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`) |
| `NAR-025` | Bảo vệ tuyến `Elian` tách khỏi `Mordric`/`Warden`/`Knight_2/3` | `DEC-LOCK-09/12/14` | **`CANON-APPROVED`** (Separation preserved) | Baseline `KEEP` |
| `NAR-026` | Chủ đề ký ức khu rừng, giữ Edda hiểu truyền khẩu/cảm nhận (không bất tử) | `DEC-LOCK-19` | **`CANON-APPROVED`** | `IMPLEMENTATION-PENDING` (`A02`/`A03`) |
| `NAR-027` | Kỹ năng trailer Mordric (`Dark Resonance` / `Abyssal Fury`...) | `DEC-LOCK-09/16` | **`TRAILER-ONLY`** | Excluded unless approved |
| `NAR-028` | Motif `D–F–E–A` & DAW stems `V12.2` | `DEC-LOCK-21` | **`APPROVED-WITH-LIMITATIONS`** (`Stems/cues PENDING`) | `IMPLEMENTATION-PENDING` (`B06` non-stem only) |
| `NAR-029` | Bỏ tiếng chuông lặp V12.1 ở trailer; giữ Chuông Đồng vật lý game | `DEC-LOCK-21` | **`SUPERSEDED`** (In V12.2 trailer) | Keep gameplay bell lore |
| `NAR-030` | Giữ các khoảng trống tri thức (`OQ` nhân quả/tác nhân/số năm/số phận) | `DEC-LOCK-02..05, 11` | **`CANON-APPROVED`** (`UNKNOWN` intentionally kept) | Enforced in `A02–A07` |

---

## 4. Tổng Hợp Phân Loại Sau `HW-V16-A01` (`2026-11-26`)

- **`23` Decision IDs (`DEC-LOCK-01..23`):** **`22` Owner-Authorized** + **`1` Reserved (`DEC-LOCK-14` / `CHAR-006`)**.
- **`CONFLICT C01–C05`:** Đã giải quyết toàn bộ về mặt **hướng Canon** (`C01`→`02`, `C02`→`10`, `C03`→`09`, `C04`→`07`, `C05`→`03`); chuyển toàn bộ sang hàng đợi **`IMPLEMENTATION-PENDING`** cho `A02–A07` (riêng `A01` **`0` sửa runtime**).
- **Còn `PENDING-OWNER-APPROVAL` chi tiết (cần duyệt từng đợt khi triển khai `A03–A10`, `B06`, `D04/05`):**
  1. Thiết kế hình ảnh huy hiệu cụ thể của *Order of the Black Wolf* (`DEC-LOCK-06`).
  2. Số phận cuối của `Sir Vaelen` & `Sir Mordric` và chi tiết vai trò hỗ trợ được duyệt (`DEC-LOCK-11`).
  3. Tiểu sử, quan hệ cụ thể, vị trí, vai trò NPC/Boss, sprite chính thức, kỹ năng & số phận của `Sir Roderick` & `Sir Aldemar` (`DEC-LOCK-13`).
  4. Nguyên văn từng nhóm thoại gameplay từ `V12.2` & việc đổi subtitle Main Menu (`DEC-LOCK-17`).
  5. Văn bản, cinematic & số phận nhân vật trong `3` Ending (`DEC-LOCK-18`).
  6. Storyboard chi tiết, lời dẫn, hình ảnh & âm thanh của Opening Cutscene `28s` (`DEC-LOCK-20`) và Event Registry cho `A10`.
  7. DAW stems `V12.2`, voice allocation Kỵ Sĩ, cinematic/bell/Ending music cues (`DEC-LOCK-21`).
  8. Hồ sơ/asset & Game Integration của `CHAR-006 — The Headless Warden` (`DEC-LOCK-14` `RESERVED`).
