# HW-ART-REF-02 — Meliodas Blackwood Latest Asset Archive Report

- **Task ID:** `HW-ART-REF-02` / `HW-ART-REF-02-R1`
- **Project:** HOLLOW WOODS (*V1.6 — The Unbroken Oath*)
- **Studio:** KYOSHIRO STUDIO (`HW–Code / HW–Design`)
- **Agent:** AG 4 Hydro High
- **Baseline Git SHA:** `94d346fb1793dcf5042590896646e7f6d3e5b225` (`feat/v1.5.3-ag-world-polish`)
- **Status:** `PASS` (Asset Archive Verified & GitHub Docs Checkpoint Synced)

---

## 1. Vị trí lưu trữ & kiểm tra thư mục đích

- **Kiểm tra toàn hệ thống:** Đã kiểm tra các ổ đĩa `C:\`, `D:\`, `E:\`, `F:\`, `G:\` (depth 3), `Downloads`, `Desktop`, `Documents`, toàn bộ workspace `G:\HOLLOW WOODS` và tài liệu `Read/`/`docs/` — không tồn tại thư mục `Asset_Art` nào trước thời điểm thực hiện (`0` xung đột vị trí).
- **Đường dẫn `Asset_Art` chính thức:**
  `G:\HOLLOW WOODS\Asset_Art\Meliodas_Blackwood\`
- **Gói xuất ZIP đầy đủ:**
  `G:\HOLLOW WOODS\Asset_Art\Meliodas_Blackwood\MELODIAS_BLACKWOOD_BLACK_KNIGHT_V2_LATEST_ASSET_PACK.zip`
  - **ZIP Size:** `19,990,823` bytes (`~19.06 MB`)
  - **ZIP Entries:** `221` (gồm `220` tệp nội dung + `SHA256SUMS.txt`; loại trừ self-zip)
  - **ZIP SHA-256:** `d8bb5c8933628a5232f458208a8550204822e962ec3a47e450870530d93f2fb5`

---

## 2. Cấu trúc thư mục & thống kê phân loại phiên bản

Tổng dung lượng trên đĩa: **`222` tệp (`44,212,317` bytes)**, gồm **`221` tệp không nén (`24,221,494` bytes / `23.1 MB`)** và **`1` tệp ZIP**. Mọi phiên bản được phân tách nghiêm ngặt theo §5:

| Thư mục trong `Asset_Art/Meliodas_Blackwood/` | Phân loại | Số tệp | Chi tiết nội dung |
|---|---|---:|---|
| `01_LATEST_ARTWORK/` | `LATEST_ARTWORK` | `86` | `Atlases_Latest/` (`9` cặp PNG+JSON = `18` tệp gồm `K2 V2 5feed142`, `K3` `0a927c22`/`6a64978d`/`d383c52b`, `Conversion 34-Seq` `6bb15b80`), `Spritesheets_4Dir/` (`32` spritesheet 4 hướng `meliodas_*.png`), `Animations_GIF/` (`18` GIF gồm `13` preview 4 hướng + `5` GIF gameplay Codex K2), `Portraits_Menu_Cover/` (`black_knight_portrait.png`, `hollow_woods_black_knight_cover.png`, `portrait-dialogue_ref.png`, `5` ảnh Menu UI `black_knight_*.png`), `Contact_Sheets/` (`5` V153 Source Parity contact sheet + `5` ảnh đối chiếu `HW-CHAR-01-R2`). |
| `02_CURRENT_RUNTIME/` | `CURRENT_RUNTIME` | `38` | Bản sao 1:1 cây runtime `public/assets/characters/black_knight/` (`10` cặp Atlas PNG+JSON = `20` tệp + `black_knight_portrait.png`), `5` ảnh Menu UI từ `public/assets/ui/menu/`, mã nguồn & registry hiện hành (`BlackKnightAnimations.ts`, `BlackKnightConversion.json`, `BlackKnightPlayer.ts`, `black_knight_animations.json`), `6` script đóng gói/QA từ `07_Runtime_Reference/scripts/`, cùng `RUNTIME_VERSION_MAP.json` và `RUNTIME_USAGE_NOTES.md`. |
| `03_LEGACY_ARCHIVE/` | `LEGACY` | `78` | Cô lập hoàn toàn khỏi `01_LATEST_ARTWORK/`: `Black_Knight_V1_0_Fellor/` (`29` tệp kèm `License.txt` & `Read me.txt`), `V1_4_Wayfarer_Base_cb8ba12b/` (`13` tệp), `V1_5_PaletteScale_646f3d3e/` (`10` tệp), `V1_5_2_CombatStates_b5eaa612/` (`20` tệp), `K1_ArmedIdle_0b16b7d4/` (`2` tệp gắn nhãn `PARTIAL_RUNTIME_ACTIVE_ARMED_IDLE`), `K2_V1_Movement_4f6eb7e2/` (`4` tệp). |
| `04_METADATA_AND_DOCS/` + Root Docs | `METADATA_AND_DOCS` (+ `SHA256SUMS.txt`) | `18` (+ `1`) | `README.md`, `SHA256SUMS.txt` (`220` dòng), `ANIMATION_REGISTRY_SNAPSHOT.json`, `CONVERSION_METADATA_INDEX.json`, `SOURCE_PROVENANCE.md`, `LICENSE_AND_CREDITS.md`, `VERSION_CLASSIFICATION_MANIFEST.json`, cùng thư mục `Original_Reports/` lưu nguyên vẹn các báo cáo gốc (`08_Documentation/` và `HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md`). |

---

## 3. Runtime Version Mapping & ghi nhận bắt buộc về Codex K1

Trong `src/animation/BlackKnightAnimations.ts` (`lines 99–105`), toàn bộ `10` atlas runtime hiện hành hoạt động theo ánh xạ sau:

| Atlas Runtime | Commit / Mốc nguồn | Trạng thái Runtime |
|---|---|---|
| `black_knight_armed_idle` | **Codex `K1` — `0b16b7d4`** | **`PARTIAL_RUNTIME_ACTIVE_ARMED_IDLE`** — vẫn đang cung cấp trực tiếp `armed_idle_{down,up,left}_{0..5}` trong game (`armed_idle_right` lấy từ `K2 V2`). **Không** đánh dấu K1 là `UNUSED`. |
| `black_knight_movement` | **Codex `K2 V2` — `5feed142`** | `ACTIVE` — `armed_idle_right`, `armed_walk`, fallback `armed_run`, `unarmed_idle`, `unarmed_walk`, fallback `unarmed_run` (thay thế `K2 V1 4f6eb7e2`). |
| `black_knight_core_combat` | **Codex `K3` — `0a927c22`** | `ACTIVE` — `attack`, `heavy_attack`, `attack_combo` (6f/hướng). |
| `black_knight_defense` | **Codex `K3` — `6a64978d`** | `ACTIVE` — `parry`, `parry_success`, `roll`, `unarmed_roll`, `weapon_on`, `weapon_off`, `hurt`, `unarmed_hurt`, `death`. |
| `black_knight_extended_skills` | **Codex `K3` — `d383c52b`** | `ACTIVE` — `armed_buff`, `unarmed_buff`, `thrust`, `ground_slam`, `flame_stream`, `fire_wave`, `aerial_somersault`, `weapon_art`. |
| `black_knight_conversion_actions` | **Conversion 34-Seq — `6bb15b80`** | `ACTIVE` — 6f `interact`/`gather`/`use_item` + 3f `parry_miss`. |
| `black_knight_conversion_air` | **Conversion 34-Seq — `6bb15b80`** | `ASSET_ONLY` — 10 chuỗi nhảy/rơi/đáp đất side-scroller lưu trữ. |
| `black_knight_conversion_combat` | **Conversion 34-Seq — `6bb15b80`** | `ASSET_ONLY_AND_QA_PARITY` — đủ số frame nguồn Fellor (Heavy 19/8/13f, Light 9/9/11/11f, Weapon Art 35f). |
| `black_knight_conversion_motion` | **Conversion 34-Seq — `6bb15b80`** | `ACTIVE_RUN_OVERRIDE_AND_ROLL` — `armed_run_sequence` (12f override `run`), `unarmed_run_sequence` (12f override `unarmed_run`), Roll 12f (`ASSET-ONLY`). |
| `black_knight_conversion_states` | **Conversion 34-Seq — `6bb15b80`** | `ASSET_ONLY_FULL_SEQUENCES` — `weapon_on` (18f), `weapon_off` (14f), `parry_success` (15f), `death` (9f), `unarmed_buff` (12f), `armed_buff` (12f). |

Các tệp fallbacks cũ tách biệt tại `public/assets/characters/mossbound_wayfarer/*` và `public/assets/characters/satyr/satyr_portrait.png` được ghi nhận rõ là fallback/legacy, không bao giờ xếp vào `LATEST_ARTWORK`.

---

## 4. Minh bạch master sheet Codex Cloud còn thiếu (`MISSING_FROM_GITHUB_AND_LOCAL`)

Dựa trên `HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md` và metadata `.json`:
- `armed_walk.png` (SHA-256 prefix `e73402b383...`)
- `right_runs.png` (SHA-256 prefix `7daa29509e...`)
- `unarmed_idle.png` (SHA-256 prefix `caa36cd098...`)

Các sheet ImageGen trung gian trên Codex Cloud này chưa từng được commit nguyên tấm lên GitHub hay xuất sang local; **không** tự vẽ lại hoặc tái tạo các tấm thiếu. Toàn bộ từng frame pixel gốc trích xuất từ chúng đã được bảo toàn lossless 100% trong `01_LATEST_ARTWORK/Atlases_Latest/` và `01_LATEST_ARTWORK/Spritesheets_4Dir/`.

---

## 5. Kết quả kiểm chứng checksum & bảo toàn dữ liệu

| Tiêu chí kiểm tra | Kết quả |
|---|---|
| `SHA256SUMS.txt` parity trước/sau sao chép | `220 / 220` khớp 100% (`MISMATCHES: 0`) |
| Kiểm tra định dạng/kích thước PNG | `0` ảnh bị resize, recompress hay suy giảm alpha |
| Đôi PNG + JSON trong Atlas | `9/9` cặp Latest + `10/10` cặp Runtime khớp 100% |
| Cách ly Legacy khỏi `01_LATEST_ARTWORK/` | `0` tệp legacy/wayfarer/k2v1/robot bị lẫn |
| Toàn vẹn gói ZIP (`zipfile.testzip()`) | `None` (Pass), `221/221` entry khớp SHA-256 với đĩa |
| Thay đổi đối với `src/`, `public/`, `Backups/`, gốc | **`0`** sửa đổi, **`0`** xóa tệp, **`0`** ghi đè archive cũ |

---

## 6. Bằng chứng metadata lưu trên GitHub

Các tệp bằng chứng gọn nhẹ cho nhiệm vụ này được lưu tại `Read/V1.5/Reports/Evidence/HW-ART-REF-02/`:
- `SHA256SUMS.txt`
- `RUNTIME_VERSION_MAP.json`
- `VERSION_CLASSIFICATION_MANIFEST.json`
- `SOURCE_PROVENANCE.md`
- `LICENSE_AND_CREDITS.md`

*(Không commit `Asset_Art/`, `.zip`, PNG thương mại hoặc backup lên GitHub theo đúng quy định bảo vệ tài nguyên.)*
