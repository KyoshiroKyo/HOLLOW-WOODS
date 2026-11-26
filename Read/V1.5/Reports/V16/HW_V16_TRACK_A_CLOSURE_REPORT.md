# HW-V16-TRACK-A CLOSURE REPORT (`A01` – `A10` SYNTHESIS)

- **PROJECT:** HOLLOW WOODS (`V1.6.0 — THE UNBROKEN OATH`)
- **ROADMAP:** `3.1` (`Track A — Narrative Reconstruction`)
- **SYNTHESIS DATE:** `2026-11-27`
- **OVERALL TRACK A STATUS:** **`INCOMPLETE — GATES OPEN (NOT FULL PASS)`** *(Tuân thủ `HW-V16-A10 §13`: không đánh dấu Track A hoàn tất toàn bộ khi còn gate của `A06-R1` acceptance/merge, `A07` resume + Ending copy, `A08/A09` Opening Cutscene và `A10` In-Game Cinematics).*

---

## 1. Bảng Tổng Hợp Phân Loại Độc Lập (`A01` – `A10`)

| Task | Tên nhiệm vụ | Canon Status | Impl Status | Verification Status | Ghi chú Gate còn mở |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`HW-V16-A01`** | Master Canon Lock | **`CANON APPROVED`** (`22` + `1` Deferred) | `LOCKED` (`0` delta) | **VERIFIED** | `DEC-LOCK-06/11/13/17/18/20/21` còn phần chi tiết chờ duyệt từng đợt. |
| **`HW-V16-A02`** | Legacy Lore Cleanup | **`CANON APPROVED`** | **`IMPLEMENTED`** (`21` files) | **`RUNTIME VERIFIED` (`PASS`)** | Xóa 100% tàn dư `Drager/Isekai/Satyr quốc lộ` khỏi `dist/`. |
| **`HW-V16-A03`** | Prologue, Act 0 & Bellhollow | **`CANON APPROVED`** + `DLG-006/007` **`DRAFT`** | **`IMPLEMENTED`** (`dialogues.json`) | **`RUNTIME VERIFIED` (`A03-T01..T10 PASS`)** | Nguyên văn `DLG-006/007` trailer giữ bản nháp chờ Owner duyệt. |
| **`HW-V16-A04`** | Vaelen & Mordric Narrative | **`CANON APPROVED`** + `DLG-009/012–015` **`DRAFT`** | **`IMPLEMENTED`** (`dialogues.json`, `GameScene`) | **`RUNTIME VERIFIED` (`A04-T01..T10 PASS`)** | Số phận cuối `Vaelen / Mordric` và thoại nguyên văn chờ Owner duyệt. |
| **`HW-V16-A05`** | Branching Dialogue & Reactions | **`CANON APPROVED`** (`DEC-LOCK-18`) | **`IMPLEMENTED`** (`DialogueSystem` 7-state) | **`RUNTIME VERIFIED` (`18/18 PASS`)** | Chống lặp `trust`/`reward` qua `storyFlags` (`dlg_*`). |
| **`HW-V16-A06`** | Journal, Torn Pages & Reveal Gate | **`CANON APPROVED`** (`DEC-LOCK-07`) | **`PARTIAL`** (`Fail-closed gate`) | **`RUNTIME VERIFIED` (`A06-T01..T04, T07..T12`)** | Nâng cấp bởi `HW-V16-A06-R1`. |
| **`HW-V16-A06-R1`** | Approved Identity Evidence Option 1 | **`OWNER APPROVED` (`2026-11-27`)** | **`IMPLEMENTED`** (`feat/v1.6-a06-r1-identity-evidence @ fc5bf1d`) | **`RUNTIME VERIFIED` (`24/24` + E2E `6/6` PNG)** | **Gate mở:** Chờ GPT nghiệm thu `A06-R1` và merge với `A07`. |
| **`HW-V16-A07`** | Quest Progression & 3 Endings | **`CANON APPROVED` (`50/3/65`)** + Ending Copy **`DRAFT`** | **`PARTIAL`** (`4` `src/` edits cục bộ tại `G:/HOLLOW WOODS`) | **INTERRUPTED (`1/5` steps — checkpoint `36f43b6`)** | **Gate mở:** Nối lại từ bước `2/5` sau khi GPT nghiệm thu `A06-R1` + duyệt copy `E01–E03`. |
| **`HW-V16-A08`** | Opening Cutscene 28s Hybrid | `DEC-LOCK-20` Format **`APPROVED`** | **`DRAFT` (Preproduction @ `d2ff9e8`)** | **`PREPROD VERIFIED` (`A08-T01..T06`; `T07..T12 NOT RUN`)** | **Gate mở:** Owner duyệt Storyboard `CS01–06`, Narration, Crest `CS02`, Audio trước khi render MP4. |
| **`HW-V16-A09`** | Opening Cutscene Runtime Integration | `DEC-LOCK-20` | **`BLOCKED`** (`0` edits @ `9e94b2f`) | **`NOT RUN`** (`Entry Gate Unmet`) | **Gate mở:** Phụ thuộc `A08` hoàn tất media production & `SHA256`. |
| **`HW-V16-A10`** | In-Game Cinematics & Closure | `DEC-LOCK-11/16/18/21` | **`PARTIAL` (Registry & `6` `CIN-*` `DRAFT`)** | **`EXISTING` audited; `A10-T01..T20 NOT RUN`** | **Gate mở:** Phụ thuộc `A07–A09` và Owner duyệt `CIN-*`. |

Sổ JSON máy đọc: [TRACK_A_CLOSING_LEDGER.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A10/TRACK_A_CLOSING_LEDGER.json) & Sơ đồ: [A10_NARRATIVE_PROGRESSION_AND_CINEMATIC_MAP.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A10/A10_NARRATIVE_PROGRESSION_AND_CINEMATIC_MAP.png).

---

## 2. Những Nội Dung Vẫn Cần Quyết Định / Phê Duyệt Của Owner (`§13`)

1. **Nghiệm thu GPT cho `HW-V16-A06-R1`** (`fc5bf1d5f849f694a6b92e270ef747b2f2914246` trên nhánh `feat/v1.6-a06-r1-identity-evidence`) để mở khóa bước `HW-V16-A07 — RESUME`.
2. **Thiết kế huy hiệu chính thức** *Đoàn Kỵ Sĩ Hắc Lang* (`DEC-LOCK-06` — ảnh hưởng `CS02` và hiển thị UI).
3. **Văn bản & kết cục chi tiết `3` Ending (`E01–E03`)** (`DEC-LOCK-18`, [HW_V16_A07_ENDING_APPROVAL_DRAFT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A07_ENDING_APPROVAL_DRAFT.md)) cùng số phận cuối của **`Sir Vaelen`** & **`Sir Mordric`** (`DEC-LOCK-11`) và hồ sơ `Sir Roderick` / `Sir Aldemar` (`DEC-LOCK-13`).
4. **Duyệt Gói Preproduction `HW-V16-A08`** ([HW_V16_A08_STORYBOARD_APPROVAL.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A08_STORYBOARD_APPROVAL.md)) để mở pha xuất video MP4 `28s` (`A08` Media Production -> `A09` Integration).
5. **Duyệt Danh mục `6` In-Game Cinematics `CIN-*`** ([CINEMATIC_EVENT_REGISTRY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A10/CINEMATIC_EVENT_REGISTRY.json)) và các nhóm thoại nguyên văn `DLG-006/007/009/012–015/031–034` (`DEC-LOCK-17`).

---

## 3. Đối Chiếu Các Legacy Assertions (Giữ Nguyên, Không Xóa Test — `§13`)

| Script V1.5 Lịch Sử | Kết quả đối chiếu hiện hành | Lý do ghi nhận minh bạch |
| :--- | :---: | :--- |
| `scripts/verify_v15_20_multiple_endings.mjs` | `44/46 PASS` | `2` assertion kiểm tra chuỗi V1.5 cũ `"Chỉ Huy Hiệp Sĩ Đen"` và `"ngọn đèn"` đã được Canon `A02/A06` thay thế (`verify_v16_a07_quest_and_endings.mjs` là bản V1.6 tương ứng). |
| `scripts/verify_v15_17_villager_stories.mjs` | `47/48 PASS` | `1` assertion V1.5 cũ kiểm tra chuỗi `"Rad, Isa, Algiz"` trên `edda_rune_guide`. |
| `scripts/verify_v15_18_knight_awakening.mjs` | Legacy expectation | Script V1.5 kiểm tra `HoodedKnightBoss` mở thẳng `lore_wayfarer_inner_journal` ở Stage `2` — đã cố ý vá trong `A06/A06-R1` theo `DEC-LOCK-07`. |

---

## 4. Bàn Giao Chuyển Tiếp Sang Track B (`B01`–`B08`) & Track D/E (`§13`)

- **`HW-V16-B01 / B02` (Codex):** Xử lý `BUG-058` / `BUG-059` (Combat / Movement Black Knight V2) — Track A tuyệt đối không chạm.
- **`HW-V16-B06` (Audio Bugfix & Voice Allocation):** Sửa lỗi `AudioManager`, biên tập `sfx_bell_short_fade` (`2.6–2.8s` từ `bell_toll_low.wav` `11.222s`), gán voice riêng cho Sir Vaelen / Sir Mordric thay fallback `dialogue_garth`, kiểm tra DAW stems nếu Owner cung cấp.
- **`HW-V16-B07` (Save Schema 3 Backfill — `MEM-04`):** Bổ sung non-destructive lore backfill cho bản save cũ thưa (`SaveManager.ts:699, 719`) đồng bộ với rule `A06-R1` đã duyệt và rà soát migration marker hội thoại cũ.
- **`HW-V16-D06 / D07 / E06` (`DEFERRED`):** `CHAR-006 — The Headless Warden` (`DEC-LOCK-14`) giữ trạng thái hoãn hoàn toàn khỏi V1.6 runtime.

**HARD STOP ENFORCED:** Không tự triển khai Track B, không sửa `BUG-058/059`, không phát triển `Headless Warden`, không đổi version hoặc publish P2Game.
