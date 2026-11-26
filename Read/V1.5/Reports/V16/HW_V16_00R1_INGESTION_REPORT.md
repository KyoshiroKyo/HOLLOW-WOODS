# HW-V16-00R1 — TECHNICAL IMPLEMENTATION BIBLE INGESTION REPORT

- **Mission ID:** `HW-V16-00R1 — TECHNICAL IMPLEMENTATION BIBLE INGESTION`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Mode:** `READ + PREPARE SINGLE TASK` (`0` source edits, `0` asset edits, `0` re-audits, `0` version bump, `0` release)
- **Git Baseline Verified:** `feat/v1.5.3-ag-world-polish` @ `e0fc1aae1ce81f3f6fafde8f5e500afb65715f69` (`origin` parity verified)

---

## 1. Ingestion Scope Verified (`18` Chapters, `55` Tasks, `23` Canon Gates)

1. **Technical Implementation Bible (`Roadmap 3.0 — R1`):** Toàn bộ `18` chương (`01` → `18`), `17` sơ đồ logic/sequence/state, hợp đồng dữ liệu DRAFT (`DialogueNode`, `Choice`, `Effect`, `NarrativeState`, `ZoneSpec`, `Collider`, `Entrance`, `EnemySpec`, `AbilitySpec`, `AssetRecord`, `AnimClip`), công thức `Movement`, pipeline asset/animation, tiêu chí QA và `55` task IDs (`HW-V16-A01..G06`) đã được tiếp nhận đầy đủ.
2. **Định vị nguồn sự thật (`S1–S6`):**
   - `S1` (Bible R1 + Roadmap 3.0) + diagram vector 8 hướng (`foot anchor` `18×12`, `0.707x`): đã đọc toàn bộ.
   - `S2` (`HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`): tồn tại tại [HW/Trailer/HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx](file:///G:/HOLLOW%20WOODS/HW/Trailer/HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx) (`112,394 B`, đã ingest qua `HW-NARRATIVE-00A`). *(Ghi chú: file disk không có hậu tố `(4)`).*
   - `S3` (`HOLLOW_WOODS_HEADLESS_WARDEN_V3_1_SOULFIRE_DESIGN_HANDOVER(3).docx`): đã tiếp nhận đầy đủ nội dung kỹ thuật tóm tắt tại **Chương 09** (giáp `#15171E`, thép `#343C52`, đồng `#AD8950`, linh hỏa `#379744`/`#A3EF64`, Mounted dùng Trường Thương Linh Hồn, Dismounted dùng Hắc Kiếm, Gate 1–4); bản `.docx` rời chưa có trong workspace (`Downloads`/`HW/`/`reference/`).
   - `S4`, `S5`, `S6` ([HW_FINAL_DEVELOPMENT_HANDOVER_20261126.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_FINAL_DEVELOPMENT_HANDOVER_20261126.md), [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md), [HW_WORLD_20_MAP_BUG_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_WORLD_20_MAP_BUG_REGISTRY.md)): đều đã xác minh khớp baseline `e0fc1aa`.

---

## 2. Discrepancies Found Between Bible R1 Text & Actual Repo Baseline

*(Ghi nhận đối chiếu không tự sửa source theo quy định Chapter 17)*:

| Hạng mục đối chiếu | Ghi chú trong Bible R1 | Thực tế xác minh trong repo (`e0fc1aa`) | Đề xuất xử lý khi mở task |
| :--- | :--- | :--- | :--- |
| **`BlackKnightAnimations.ts`** | Liệt kê trong danh sách điểm truy vết (Ch. 02) | Nằm tại `src/animation/BlackKnightAnimations.ts` (`singular`, cùng `SatyrAnimations.ts`) | Dùng đúng đường dẫn `src/animation/BlackKnightAnimations.ts` |
| **`black_knight_animations.json` & `BlackKnightConversion.json`** | Nhắc chung cạnh asset pipeline (Ch. 08) | `black_knight_animations.json` ở `src/data/`; `public/assets/characters/black_knight/` giữ `10` atlas JSON riêng (`black_knight_armed_idle.json`, `conversion_*.json`...); không có `BlackKnightConversion.json` tại `public/` | Đối chiếu đúng `src/data/` và `10` atlas JSON trong `B01`/`D01` |
| **`ZoneRegistry`** | Viết `ZoneRegistry/ZoneConnectionRegistry` (Ch. 02) | Chỉ có `src/world/ZoneConnectionRegistry.ts` (`ZoneRegistry.ts` chưa tồn tại riêng) + dữ liệu ở `src/data/zones.json` | Giữ `ZoneConnectionRegistry.ts` + `zones.json`, không bịa module |
| **`Headless Warden` palette & anim** | Ch. 09 (V3.1/V3.2): `#379744` / `#A3EF64`, Mounted Spear / Dismounted Sword | `HEADLESS_WARDEN_ASSET_SPECIFICATION.md` (`00G`) từng ghi bạc-xanh ngọc `#E5F5EB`/`#8FD0AC` và `7` clip cơ sở | Áp dụng bản **V3.1/V3.2 (Ch. 09)** làm nguồn chuẩn mới hơn từ `D06` trở đi |
| **Constants & GameConfig** | `1280×720`, virtual `640×360`, walk `85`, run `140`, `64×64`, `(0.5, 1.0)`, `18×12`, `scale 1.50` | **Khớp 100%** tại `src/config/GameConfig.ts:23-27` và `src/config/Constants.ts:5-80` | Giữ nguyên baseline, chỉ đo đạc thêm `BUG-058/059` ở `B01/B02` |
| **Version manifest** | Tham chiếu `1.5.2` (target `V1.6.0` chưa release) | `package.json` = `1.5.2`, `p2game.json` = `1.5.2` (còn lệch `1.5.1`/`1.4.0` ở `SaveManager`/`LeaderboardService` theo `H4-NEW-07`) | Giữ nguyên `1.5.2` cho tới gate release `G06` / fix hygiene `B08` |

---

## 3. Compact 55-Task Index (`HW-V16-*`) & Dependency / Blocker Map

| Nhóm | Số Task | Các Task IDs | Evidence Baseline Đã Có (`S4/S6`) | Dependency / Blocker Thật Hiện Hành |
| :---: | :---: | :--- | :--- | :--- |
| **A — Narrative Reconstruction** | `10` | `A01..A10` | `00A–00H`, `HW-NR-01..22`, `Master Bible Unified`, `CS01–06` proposal | **GATE ĐẦU VÀO:** `A01` chưa chạy (`DEC-LOCK-01..23` đều trống `[ ]`). `A02–A10` **BLOCKED** chờ `A01` (+ `B04/B05/B07` và `DEC-LOCK-20` cho `A08–A10`). |
| **B — Bug Fix & Movement** | `8` | `B01..B08` | `HW-CHAR-01-R2` (`10/10` hash), `HW-H4-06`, `HW-H4-08`, `HW-H4-12A` (`[C]` fixed), `NR-18`, `NR-20` | `B01/B02` (`BUG-058/059`) đợi giao Codex trên worktree riêng (`DEC-LOCK-23`); `B03` đợi `B01/B02` + test EVKey Windows vật lý; `B06` cần test nghe tai người + `AUD` decision; `B08` cần hosted P2Game proof (`BUG-024`). |
| **C — World Remastered** | `10` | `C01..C10` | `HW-WORLD-20A` (`17` zones, `329` colliders, `W20-BUG-001..012`), `HW-MAP-LAB-01`, `HW-NR-11` | `C01` có thể mở độc lập không cần `OQ-01..20` nếu Owner ký `DEC-LOCK-23`; `C02..C10` phụ thuộc `C01` (`C06` phụ thuộc `B05`; `C09` phụ thuộc `B04 + C02..08`). |
| **D — Character Remastered** | `8` | `D01..D08` | `HW-CHAR-01-R2`, `HW-NR-12-R3`, `13-R1`, `14-R1`, `15-R1`, `KNIGHT_CHARACTER_ASSET_REGISTRY.json` | `D01` đợi `B01/B02`; `D03` đợi `DEC-LOCK-09`; `D04/D05` thiếu asset Top-Down 4-dir (`BLOCKED` chờ chọn pack/vẽ); `D06/D07` đợi `DEC-LOCK-14` + file `.docx` V3.1/V3.2 đầy đủ + artist; `D08` đợi duyệt từng nhân vật. |
| **E — Monster & Boss Overhaul** | `7` | `E01..E07` | `HW-H4-07`, `HW-H4-11A/B` | `E01..E05` đợi `C01` (và `B05` cho `E05`); `E06` (`Headless Warden`) **BLOCKED** bởi `D06–D08` & `DEC-LOCK-14`. |
| **F — Performance Optimization** | `6` | `F01..F06` | `HW-H4-06` (`59.55–60.05 FPS` / `173.45` uncapped), `HW-NR-22` (`59.95/59.96 FPS` GTX 1070 Ti) | Đợi các nhóm nguồn (`B/C/E/A09/B08`); cần thêm test thiết bị yếu (`30 FPS` target) ở `F05`. |
| **G — Final Release** | `6` | `G01..G06` | Framework test `verify:data`, `test_v15_60`, `test_v153_save_schema3` | **BLOCKED** hoàn toàn tới khi xong `A..F`, test EVKey vật lý, hosted P2Game (`G05`) và Owner ký `GO` (`G06`). |

---

## 4. Next Step Gate

- **Next Single Task Queued:** **`HW-V16-A01`** — Lập/đối chiếu phiếu ký `DEC-LOCK-01..23` theo đúng registry `S5` để Owner & GPT khóa từng quyết định, chưa tự thực thi code hay asset.
- **Working Tree Protection Verified:** `0` thay đổi trong `src/`, `public/assets/` hay `Backups/`; `297` staged `R100` & `327` unstaged `D` trong `Pixel_Art/` giữ nguyên chưa đụng chạm.
