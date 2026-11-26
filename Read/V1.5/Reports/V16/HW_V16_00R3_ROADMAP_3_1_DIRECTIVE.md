# HW-V16-00R3 — DEVELOPMENT CONTINUATION DIRECTIVE (`ROADMAP 3.1`)

- **Mission ID:** `HW-V16-00R3 — DEVELOPMENT CONTINUATION DIRECTIVE`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High & Codex` *(Recorded by AG 4 Hydro High — Docs Only)*
- **Roadmap Revision:** **`3.1 — SCOPE ADJUSTMENT`** (`52` Active Tasks + `3` Deferred `CHAR-006` Tasks = `55` IDs)
- **Git Baseline Verified:** `feat/v1.5.3-ag-world-polish` @ `0b5d3b64d01605527123f9b91249f70ea7eb461b`

---

## 1. Sources of Truth Verified on Disk (`Priority Order: Latest Owner Directive First`)

1. **`HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`** (`112,394 B` — `HW/Trailer/` & `Downloads/Hollow Woods - Lore/`)
2. **`HOLLOW WOODS V1.6 — Technical Implementation Bible · Roadmap 3.0.docx`** (`878,401 B` — `Downloads/` & `Downloads/Hollow Woods - Lore/`)
3. **`HOLLOW_WOODS_HEADLESS_WARDEN_V3_2_DESIGN_CODE_HANDOVER.docx`** (`Downloads/` & `Downloads/Hollow Woods - Lore/`)
4. **[HW_FINAL_DEVELOPMENT_HANDOVER_20261126.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_FINAL_DEVELOPMENT_HANDOVER_20261126.md)** (`e0fc1aa`) & GitHub reports/source baseline
5. **Owner Hold Directive:** [HW_V16_00R2_HEADLESS_WARDEN_HOLD_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_00R2_HEADLESS_WARDEN_HOLD_REPORT.md) (`0b5d3b6`)

---

## 2. Roadmap 3.1 Scope Matrix (`52` Active / `3` Deferred)

| Track | Active Scope (`52` Tasks) | Deferred (`3` Tasks) | Execution Focus |
| :---: | :--- | :---: | :--- |
| **A — Narrative Reconstruction** | `A01..A10` (`10`) | `0` | Giải quyết Canon qua `A01`, dọn tàn dư & đồng bộ cốt truyện mới *(Ưu tiên #1)*. |
| **B — Bug Fix & Movement** | `B01..B08` (`8`) | `0` | Fix `BUG-058/059` (`Codex`), EVKey/Movement, UI keys, audio/save/hosted P2Game (`P0` ưu tiên khi giao). |
| **C — World Remastered** | `C01..C10` (`10`) | `0` | Tái thiết `17` phân khu, sửa tường vô hình/colliders & World Map; giữ chỗ `CHAR-006` chỉ trong tài liệu. |
| **D — Character Remastered** | `D01..D05`, `D08` (`6`) | **`D06`, `D07`** | Tích hợp/chọn asset các nhân vật được duyệt (loại trừ `CHAR-006`). |
| **E — Monster & Boss Overhaul** | `E01..E05`, `E07` (`6`) | **`E06`** | AI/habitat/cân bằng cho quái vật & boss hiện hành (loại trừ `CHAR-006`). |
| **F — Performance Optimization** | `F01..F06` (`6`) | `0` | Giữ `H4-06`, GPU/CPU/lifecycle/audio/profile budget & build hygiene. |
| **G — Final Release** | `G01..G06` (`6`) | `0` | Chơi kiểm chứng toàn tuyến, hosted QA & release gate *(nhiệm vụ tạm hoãn không chặn release)*. |

- **`DEC-LOCK-14` (`CHAR-006`):** Giữ trạng thái **`RESERVED`**. Không tạo entity, AI, spawn, boss phase, quest, texture key, collider, Save flag hay placeholder; không tự chọn địa điểm; không đồng nhất với `Dread Horseman`, `Sir Mordric`, `Hooded Knight` hoặc `Fallen Knight`. Chỉ mở lại khi Owner bàn giao asset hoàn chỉnh & phê duyệt Game Integration.

---

## 3. Execution Discipline & Protected Systems

- **Ưu tiên thực thi:** Triển khai thực tế theo đúng nhiệm vụ đơn lẻ được giao thay vì tạo thêm báo cáo nghiên cứu trùng lặp. Tận dụng asset có sẵn hợp lệ bản quyền; không tạo sprite chất lượng thấp; không tự duyệt Canon còn mở.
- **Hệ thống bắt buộc bảo toàn:** `Classic Sanity 2.1`, `Save Schema 3`, stable IDs, toàn bộ archive gốc (`91/91`) và `Backups/`.
- **Chu trình chuẩn sau mỗi task đủ điều kiện:** `IMPLEMENT → TEST → REPORT → COMMIT → PUSH → VERIFY REMOTE SHA`.

---

## 4. Next Queued Task & HARD STOP

- **NEXT TASK:** **`HW-V16-A01 — MASTER CANON LOCK`** (chuẩn bị đối chiếu & khóa quyết định Canon cho Owner/GPT; **không** tự chạy hàng loạt 52 nhiệm vụ cùng lúc).
- **HARD STOP:** **`0`** sửa `src/`, **`0`** sửa `public/assets/`, **`0`** phát triển `CHAR-006`, **`0`** đổi phiên bản (`1.5.2`) hoặc phát hành P2Game. Chờ lệnh nhiệm vụ cụ thể tiếp theo từ Owner.
