# HW-CHAR-01-R2 — BÁO CÁO TRUY VẾT, KHÔI PHỤC & BÀN GIAO CODEX BLACK KNIGHT V2 (MELIODAS BLACKWOOD)

- **Dự án:** `HOLLOW WOODS`
- **Studio:** `KYOSHIRO STUDIO`
- **Đặc phái viên:** `AG 4 Hydro High`
- **Repository:** [https://github.com/KyoshiroKyo/HOLLOW-WOODS](https://github.com/KyoshiroKyo/HOLLOW-WOODS)
- **Định danh nhân vật chính thức:** **`Meliodas Blackwood`** *(Tên tài nguyên lịch sử: **Black Knight V2**)*
- **Nguồn gốc tham chiếu gốc:** `Black Knight V1.0` của tác giả **Fellor** (`BitBlast Studio`)
- **Chế độ thực hiện:** `GIT ASSET FORENSICS, RECOVERY & BACKUP` (Không chỉnh sửa runtime game, không tạo lại sprite mới)
- **Ngày hoàn thành:** `2026-11-26`

---

## 1. Kết Luận Điều Tra & Xác Nhận Nguồn Gốc (`VERIFIED`)

Thực hiện chỉ thị đính chính của Owner rằng **Black Knight V2 là bản vẽ/phát triển 4 hướng riêng do Codex xây dựng dựa trên Black Knight V1 của Fellor** (không phải bộ tải về từ itch.io của Fellor), quá trình kiểm toán toàn bộ `202` commit lịch sử trên mọi nhánh cục bộ, nhánh từ xa (qua mirror độc lập), `refs/pull/1/*`, tags, reflog và các kho lưu trữ cục bộ đã **truy tìm thành công 100% các phiên bản Codex Black Knight V2 đã commit lên GitHub**.

### Bản chất kỹ thuật của Black Knight V2 (Codex Development):
- Trong **V1.4 (`cb8ba12b`) → V1.5.2 (`b5eaa612`)**, bản cũ (`mossbound_wayfarer`) chỉ dùng sprite `RIGHT` cắt từ Fellor V1.0 và dựng `DOWN/UP` bằng các khối hình hộp đen đơn giản (`ROBOT_PLACEHOLDER`).
- Từ **`V1.5.3 Batch 03-R2 (0ceffa58)`** và chuỗi commit **`V1.5.3 Batch 04 (0b16b7d4 → 4f6eb7e2 → 5feed142 → 0a927c22 → 6a64978d → d383c52b → 6bb15b80)`**, Codex Cloud đã tạo và tinh chỉnh bộ artwork **4 hướng hoàn chỉnh (`DOWN / UP / LEFT / RIGHT`)** mang dấu ấn riêng (mũ trụ sắt tối với khe chữ T, chùm lông đỏ sẫm bay dài, giáp vai phân tầng, áo choàng đen rách và lưỡi kiếm cong ánh lửa hổ phách), đóng gói không nén mất dữ liệu (`RGBA8888`, `trimmed: false`, *nearest-neighbor*) thành **10 cặp Atlas PNG/JSON**, **chân dung cận cảnh mũ sắt mới (`black_knight_portrait.png`)**, bộ artwork Menu/Cover và tài liệu đối chiếu.
- Ngoài phiên bản hợp nhất cuối (`5feed142` + `6bb15b80`), lịch sử Git còn lưu trữ **phiên bản tiền nhiệm `K2 v1` (`4f6eb7e2`)** và **bản thử nghiệm `K1` (`0b16b7d4`)** — toàn bộ đã được trích xuất nhị phân an toàn (`git cat-file blob`) và sao lưu độc lập.

---

## 2. Phạm Vi Đã Kiểm Tra (GitHub, Worktrees & Kho Cục Bộ)

| Hạng mục kiểm tra | Phạm vi chi tiết | Kết quả |
| :--- | :--- | :--- |
| **Nhánh Git cục bộ (`13` nhánh)** | `main`, `fix/v1.3.2-stabilization`, `feat/v1.4-expansion`, `feat/v1.5-visual-gameplay-overhaul`, `qa/v1.5.3-batch03-r2`, `feat/v1.5.3-batch04`, `feat/v1.5.3-ag-world-polish`, `backup/*` | Hoàn tất (`0` checkout trên worktree chính) |
| **Nhánh & PR trên GitHub (`origin` mirror độc lập)** | `origin/main` (`94efc03`), `origin/feat/v1.5-visual-gameplay-overhaul` (`76fb668`), `origin/qa/v1.5.3-batch03-r2` (`0ceffa58`), `origin/feat/v1.5.3-batch04` (`2f7fe69`), `origin/feat/v1.5.3-ag-world-polish` (`11d91dd`), `origin/recover-classic-sanity-v1506` (`2ceebf55`), `refs/pull/1/head`, `refs/pull/1/merge` (`90d59a6`), toàn bộ `13` tags | Hoàn tất (`210` đối tượng khớp từ khóa; **nhánh `review/classic-sanity-2.0` không tồn tại trên origin**, nhánh Sanity tương ứng là `recover-classic-sanity-v1506`) |
| **Git LFS & Reflog** | `.gitattributes`, `git lfs version` (`3.8.1`), `git reflog --all --date=iso`, `git rev-list --objects --all` (`202` commits) | `0` con trỏ LFS bị thất lạc |
| **Kho cục bộ & Worktrees** | `G:\HOLLOW WOODS\Backups\` (`Sprint_Checkpoints`, `steps`, `EXPORT_BACKUP_20261126_PRE_CONSOLIDATE`, `REPO_ROOT_ASSETS_BACKUP_20261126`, `assets_archive`, `Version_Snapshots`), `G:\HOLLOW WOODS\HW\` (`HOLLOW-WOODS-QA-BATCH03-R2`, `HOLLOW_WOODS_QA_TMP`), `G:\HOLLOW WOODS\release\`, `G:\HOLLOW_WOODS_EXPORT\` | Đã rà soát toàn bộ (`86` khớp tệp phụ trợ; giữ nguyên `89/89` archive gốc) |

---

## 3. Bảng Lịch Sử Phiên Bản & Nguồn GitHub Từng Asset

| Đợt / Mốc | Branch chứa commit | Commit SHA & Link GitHub | Ngày | Asset tiêu biểu & Blob ID | SHA-256 (Verified) | Đặc điểm nhận dạng |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **V1.0 Original + V1.4 Wayfarer** | `fix/v1.3.2-stabilization` (+ hậu duệ) | [cb8ba12b](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/cb8ba12bcc0df69d2ae87416eef3cd6bd6c69835) | `2026-11-18 07:28` | `Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png` (`57c1d71925`), `16` GIFs, `mossbound_wayfarer/*` | `d75455e35e29f06e1bcfd41c349158b0548016c556f6d3e85c0ac2007a5eedac` *(Master)* | Bản gốc Fellor V1.0 (`2592×1152`, 324 ô `RIGHT`) & bản cắt V1.4 (`wayfarer_portrait.png` cắt lưỡi kiếm) |
| **V1.5 Scale & Palette** | `feat/v1.5-visual-gameplay-overhaul` | [646f3d3e](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/646f3d3e) | `2026-11-18 22:51` | `public/assets/characters/mossbound_wayfarer/wayfarer_{idle,walk,run,attack,...}.png` (`30509d5018`...) | `8d4b...` *(đã sao lưu nhị phân)* | Chuẩn hóa palette & anchor trên khung V1.4 |
| **V1.5.2 Combat States** | `main` (`v1.5.2`) | [b5eaa612](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/b5eaa612) | `2026-11-20 10:48` | `wayfarer_heavy_attack`, `parry`, `roll`, `unarmed_*`, `weapon_art`, `weapon_toggle` + `preview_wayfarer_4dir.png` | `f23bb3d10e31b297...` *(weapon_art)* | Mở rộng đủ kỹ năng, nhưng `DOWN/UP` chạy/đứng vẫn là robot hình hộp đen |
| **Batch 03-R2 Identity & Portrait** | `qa/v1.5.3-batch03-r2`, `feat/v1.5.3-batch04`, PR #1 | [0ceffa58](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2) | `2026-11-20 16:55` | `black_knight_portrait.png` (`2e0e260f34`, `64×64`), `ui/menu/black_knight_*.png`, `hollow_woods_black_knight_cover.png` (`f973de81d8`) | `96dfc9fca1bcff39ec4ad972d3616c62a86832ab58ce0826c830ebe69182e507` *(Portrait)* | Chân dung cận cảnh mũ sắt khe T thay thế bản cũ; tái cấu trúc sang `BlackKnightPlayer.ts` |
| **Batch 04 — K1 Prototype** | `feat/v1.5.3-batch04`, `feat/v1.5.3-ag-world-polish`, `recover-classic-sanity-v1506` | [0b16b7d4](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/0b16b7d4e531607de8bc98053f07a995367b3666) | `2026-11-20 22:05` | `black_knight_armed_idle.png` (`011e9262e1`, `384×256`, 24f) + `.json` + `pack_v153_black_knight_armed_idle.py` | `ff47e472f4c50bae5970fd6022633a2037f53bc04e8b3e4876c7d5bcd6ec092c` | Codex vẽ mới 3 hướng `DOWN / UP / LEFT`, hàng `RIGHT` vẫn dùng Fellor V1.0 |
| **Batch 04 — K2 v1 (Movement)** | `feat/v1.5.3-batch04`, `feat/v1.5.3-ag-world-polish` | [4f6eb7e2](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/4f6eb7e2a844e70b26a7f62b013d5d9274fc935f) | `2026-11-21 05:12` | `black_knight_movement.png` (`f17c9e464d`, `768×704`, 151.606 B) + `.json` (`b42a3c7370`) | `2b57a5307881ee1df10e0e38bc9423e1595b66641a0a683f5f280e5ef83c8861` | Bản Codex 4 hướng đầu tiên cả `RIGHT` & `Unarmed` trước khi đồng bộ hình thể |
| **Batch 04 — K2 v2 (Unified V2)** | `feat/v1.5.3-batch04`, `feat/v1.5.3-ag-world-polish`, `recover-classic-sanity-v1506` | [5feed142](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/5feed142c9861b12ac0473ae535d8877c2faf814) | `2026-11-21 05:27` | `black_knight_movement.png` (`ccf901475a`, `896×576`, 126f) + `.json` (`50b2e7a795`) + `pack_v153_black_knight_movement.py` | `17279d83290fa349855066381f557548e08df31b123fe1c745b29017a2a14d8f` | **"Unify Black Knight movement silhouettes and weapon poses"** — chuẩn hóa hoàn toàn silhouette Codex V2 cho Idle/Walk/Run 4 hướng |
| **Batch 04 — K3-A/B/C Combat & Skills** | `feat/v1.5.3-batch04`, `feat/v1.5.3-ag-world-polish`, `recover-classic-sanity-v1506` | [0a927c22](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/0a927c226587a3f82957b06183138ecf9f9a6fe2), [6a64978d](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/6a64978d09b0f9f88c96b85f509a1c34ec097fe3), [d383c52b](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/d383c52bd88d2b265db373e5b362cbf19a547d71) | `2026-11-21 12:25–17:22` | `black_knight_core_combat.png` (72f), `black_knight_defense.png` (216f), `black_knight_extended_skills.png` (192f) + JSON | `5126a4a4...` / `4e1f5fb8...` / `236e8c1f...` | Đầy đủ Light/Heavy/Combo, Parry, Roll, Weapon On/Off, Hurt, Death, Buff, Thrust, Ground Slam, Flame Stream, Fire Wave, Aerial Somersault, Weapon Art (6f/hướng) |
| **Batch 04 — Full 34-Seq Conversion** | `feat/v1.5.3-batch04`, `feat/v1.5.3-ag-world-polish`, `recover-classic-sanity-v1506` | [6bb15b80](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/6bb15b80479f1206e2eaba878cd5903434f63ea4) | `2026-11-21 18:32` | `black_knight_conversion_{actions,air,combat,motion,states}.{png,json}` (`1,328` frames) + `pack_v153_black_knight_conversion.py` + `BlackKnightConversion.json` | `4774f891...`, `a6523927...`, `1d83488a...`, `3ea692c5...`, `a8ce11dc...` | **"Custom ImageGen artwork based on approved K1/K2 identity and Fellor motion references"** — đủ số frame nguồn `1:1` (Run 12f, Roll 12f, Heavy 19/8/13f, Light 9/9/11/11f, Weapon Art 35f, Parry Success 15f, Death 9f, Buff 12f, Interact/Gather/Use Item 6f, Jump/Fall/Land) trên cả 4 hướng |

---

## 4. Minh Bạch Dữ Liệu Thiếu & Trạng Thái Khôi Phục

1. **Tài nguyên đã khôi phục đầy đủ (`169` tệp trong Backup, `194` tệp trong thư viện chuẩn hóa):**
   - Toàn bộ `10` cặp Atlas PNG/JSON của Codex (`K1`, `K2 v1`, `K2 v2`, `K3-A/B/C`, `Conversion 34-Seq`) với **toàn bộ `1,932+` khung hình lossless không nén mất điểm ảnh** (`trimmed: false`, *nearest-neighbor* giữ nguyên pivot bàn chân).
   - Toàn bộ các biến thể lịch sử (`V1.0 Fellor`, `V1.4`, `V1.5`, `V1.5.2`), script đóng gói/kiểm định Python/MJS, Portrait V2 (`64×64`), UI Menu banners, Cover Art và contact sheets QA của Codex.
   - Đã tự động tách xuất lossless thành **`32` spritesheet 4 hướng riêng theo từng hành động (`03_Sprites/`)** và **`12` ảnh động GIF xem trước (`04_Animations/`)** từ chính pixel thật của Codex V2 để sử dụng ngay cho thiết kế & sản xuất.
2. **Phần trung gian chưa được push lên GitHub (`MISSING_FROM_GITHUB_AND_LOCAL`):**
   - Các file ảnh bảng lớn trung gian trước khi đóng gói trong workspace Codex Cloud (ví dụ `Custom_4Dir/`, `Pixel_Art/Black Knight/Source_Library/`, các sheet ImageGen thô như `armed_walk.png` SHA `e73402b383...`, `right_runs.png` SHA `7daa29509e...`, `unarmed_idle.png` SHA `caa36cd098...`) chỉ được Codex dùng làm đầu vào trên môi trường `/workspace/` của Codex Cloud rồi ghi SHA-256 provenance vào `meta.sources` trong `.json` khi đóng atlas — chúng chưa từng được commit nguyên tấm lên GitHub hay xuất sang ổ `G:`.
   - Tuy nhiên, mọi frame nhân vật thật trích xuất từ các sheet đó đều tồn tại **nguyên vẹn 100% độ phân giải pixel gốc (`64×64` / `80×80` / `96×80` / `112×96`)** bên trong `05_Atlases/` và đã được tách lại thành từng file trong `03_Sprites/`.

---

## 5. Vị Trí Backup & Kho Tài Nguyên Chính Thức `Meliodas_Blackwood`

- **Thư mục Backup xác minh SHA-256 (`169` tệp):**
  `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Backups\BLACK_KNIGHT_V2_RECOVERED_20261126_162326\`
  - Chứa [SHA256SUMS.txt](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Backups/BLACK_KNIGHT_V2_RECOVERED_20261126_162326/SHA256SUMS.txt) và [BACKUP_MANIFEST.json](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Backups/BLACK_KNIGHT_V2_RECOVERED_20261126_162326/BACKUP_MANIFEST.json).
- **Tệp nén Backup ZIP mới (không ghi đè archive cũ):**
  `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Backups\BLACK_KNIGHT_V2_RECOVERED_20261126_162326.zip`
  - **ZIP SHA-256:** `8fef3b3b618ccb1db86a5b69eb4eac25dea34911fa1e971df57d341526805553`
- **Thư viện chính thức (`194` tệp):**
  `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Pixel_Art\01_Characters\Player\Meliodas_Blackwood\`
  - `01_Original_Black_Knight/` — Bản gốc Fellor V1.0 (giữ nguyên ghi công & License)
  - `02_Codex_Black_Knight_V2/` — Đủ `8` mốc lịch sử phát triển của Codex (`V1.4`, `V1.5`, `V1.5.2`, `K1`, `K2v1`, `K2v2`, `K3`, `Conversion34`)
  - `03_Sprites/` — `32` spritesheet 4 hướng tách riêng theo hành động (`meliodas_idle_armed_4dir.png`, `meliodas_walk_armed_4dir.png`, `meliodas_run_armed_12f_4dir.png`, `meliodas_light_attack_1_4dir.png`, `meliodas_weapon_art_35f_4dir.png`, ...)
  - `04_Animations/` — `12` GIF xem trước 4 hướng + bản GIF runtime Codex `K2`
  - `05_Atlases/` — `10` cặp Atlas PNG/JSON chuẩn + `black_knight_movement_k2v1_4f6eb7e2`
  - `06_Portraits/` — Portrait `64×64`, UI banners & Cover Art
  - `07_Runtime_Reference/` — JSON mapping & scripts đóng gói/kiểm định tham chiếu
  - `08_Documentation/` — Báo cáo gốc Codex, `RECOVERY_PROVENANCE_MANIFEST.json` & [SHA256SUMS.txt](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/01_Characters/Player/Meliodas_Blackwood/08_Documentation/SHA256SUMS.txt)

---

## 6. Ảnh Đối Chiếu Trực Quan (`Visuals/HW-CHAR-01-R2/`)

1. 🖼️ [BLACK_KNIGHT_V1_ORIGINAL.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-CHAR-01-R2/BLACK_KNIGHT_V1_ORIGINAL.png) — Tổng thể Fellor V1.0 gốc (`2592×1152`, `RIGHT`-only).
2. 🖼️ [BLACK_KNIGHT_CODEX_CANDIDATES.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-CHAR-01-R2/BLACK_KNIGHT_CODEX_CANDIDATES.png) — So sánh `7` mốc ứng viên lịch sử từ Git (`V1.4 → V1.5.2 → K1 → K2 v1 → K2 v2 → Conversion`).
3. 🖼️ [BLACK_KNIGHT_V1_V2_RUNTIME_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-CHAR-01-R2/BLACK_KNIGHT_V1_V2_RUNTIME_COMPARISON.png) — Đối chiếu trực tiếp V1 Fellor, robot `DOWN/UP` V1.5.2, Codex V2 (`Meliodas Blackwood`) và sự tiến hóa Portrait.
4. 🖼️ [MELIODAS_BLACKWOOD_RECOVERED_OVERVIEW.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-CHAR-01-R2/MELIODAS_BLACKWOOD_RECOVERED_OVERVIEW.png) — Hồ sơ tổng quan nhân vật `Meliodas Blackwood` 4 hướng và kỹ năng chiến đấu.
5. 🖼️ [MELIODAS_BLACKWOOD_ANIMATION_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-CHAR-01-R2/MELIODAS_BLACKWOOD_ANIMATION_CONTACT_SHEET.png) — Contact sheet trích trực tiếp từ atlas `5feed142` & `6bb15b80`.

---

## 7. Khóa An Toàn Runtime & Dữ Liệu (§11 & §12)

- **0** sửa đổi đối với `BlackKnightPlayer.ts`, `BlackKnightAnimations.ts`, `src/`, `public/assets/`, `BUG-058`, `BUG-059`, Sanity 2.1, Lantern `[F]` hoặc hệ thống map.
- **0** tệp archive bị xóa hoặc ghi đè (`89/89` nguyên vẹn).
- **0** thao tác checkout nhánh cũ, reset, clean, stash, prune hoặc push.
