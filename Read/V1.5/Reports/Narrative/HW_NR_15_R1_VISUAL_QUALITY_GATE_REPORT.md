# HW-NR-15-R1 — KNIGHT ORDER VISUAL QUALITY GATE REPORT

- **Mission ID:** `HW-NR-15-R1 — KNIGHT ORDER VISUAL QUALITY GATE`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` (`DEPENDENCY: NR-12-R3, NR-13-R1, NR-14-R1` · `SUPERSEDES: HW-NR-15 AG EXECUTION`)
- **Mode:** **`VISUAL QUALITY ASSURANCE` (`EXISTING ASSET FIRST`, `NO LOW-QUALITY PROCEDURAL CHARACTER ART`, `NO SELF-MARKED APPROVED BY OWNER`)**

---

## 1. Mục Tiêu & Nguyên Tắc Áp Dụng (`§1` – `§4`)

- Đánh giá thống nhất toàn bộ **`6` nhân vật Đoàn Kỵ Sĩ (`01–06`)** dưới **12 tiêu chí Quality Gate bắt buộc (`§3`)**: *Chất lượng Pixel Art, Silhouette, Chi tiết giáp, Bảng màu, Góc nhìn, Pixel density, Kích thước cơ thể thực tế, Origin, Animation, Độ sắc nét, Độ đồng nhất với game & Giấy phép*.
- Không đánh `PASS` mỹ thuật chỉ vì khớp số đo (`scale`/`origin`/`frames`), không ép mọi nhân vật vào khuôn `64×64` nếu làm mất chi tiết giáp/cưỡi ngựa, và tách biệt rõ **`Asset có sẵn` $\leftrightarrow$ `Asset chuyển đổi` $\leftrightarrow$ `Concept` $\leftrightarrow$ `Prototype bị từ chối`**.

---

## 2. Bảng Thẩm Định Tổng Hợp 12 Tiêu Chí Cho 6 Kỵ Sĩ (`01–06`)

| # | Nhân Vật (`CHAR-ID`) | Nguồn & Phân Loại Asset | Tỷ Lệ / Pixel Density / Origin | Hướng & Animation Thực Tế | Giấy Phép (`License`) | Cổng Trạng Thái (`§6`) |
|---|---|---|---|---|---|---|
| **01** | **Lord Meliodas Blackwood** (*The Wolf Lord*) | **Existing Runtime (Codex V2 verified `HW-CHAR-01-R2`)**: `Meliodas_Blackwood/05_Atlases/` (`10/10` PNG SHA-256 khớp runtime) từ nguồn `Fellor`. Giữ riêng `V1.4 wayfarer` làm lịch sử. | `64×64 @ 1.50×` $\rightarrow$ **`~45 wpx`** (`Idle`), `origin (0.5, 1.0)`, `pixelArt: true`. *(Run `84×72 @ 1.20×` lệch density `30px` vs `41px` giữ cho Codex).* | **Đủ `4` hướng** (`down/up/left/right`), `34` chuỗi (`Idle 160ms/f`, Walk, Run, Roll, Attack 1–4, Heavy 1–3, Parry, Weapon Art/Buffs, Hurt, Death) + Portrait `64×64`. | **VERIFIED OK** (Fellor Commercial + Codex V2) | **`READY FOR OWNER REVIEW`** *(đã kiểm nguồn V2; chờ Codex xử lý `BUG-058/059`)* |
| **02** | **Sir Vaelen** (*The Silent Knight*) | **Converted Runtime NPC**: `campfire_knight_idle_sheet.png`, `pray_sheet.png`, nguồn gốc `2D_SL_Knight_v1.0_3.zip`. Giữ nguyên bản hiện hành. | `64×64 @ 1.00×` $\rightarrow$ **`47 wpx`**, `origin (0.5, 1.0)`, đồng nhất tỷ lệ 1:1 với Meliodas (`45 wpx`). | **Tĩnh `1` hướng** (`Idle 8f`, `Pray 12f`) + Portrait `64×64`. Thiếu hướng `up/down/left` nếu nâng cấp thành đồng hành đi lại. | **VERIFIED OK** (`2D_SL_Knight license.txt`) | **`READY FOR OWNER REVIEW`** *(giữ NPC tĩnh; `NEEDS CONVERSION` chỉ nếu làm companion `4` hướng)* |
| **03** | **Sir Mordric** (*The Dark Knight*) | **Asset Missing / Shared Trailer Ref Only**: Chưa có sprite độc lập; đang dùng tạm ref `HoodedKnightBoss` (`160×160`). | Ref `HoodedKnightBoss`: `160×160 @ 1.00×` (**`71 px` đứng**), lớn hơn Meliodas (`1.58×`, tầm Boss) + Portrait `hooded_knight`. | Ref `1` hướng ngang (`+flipX`), `Idle 8f`, `Powerup`, `Attack`. Chưa có `4` hướng Top-Down hay bản tách `Sir Mordric` riêng. | **UNVERIFIED IN ZIP** (`Hooded Knight Sprites.zip` thiếu `License.txt`) | **`NEEDS ARTWORK`** *(chờ Owner chốt `OQ-04 / DEC-LOCK-09` hợp nhất hay vẽ mới + xác minh license)* |
| **04** | **Sir Roderick** (*The Crimson Knight*) | **Candidates Identified (`NR-12-R3`)**: `Heavy_Knight_Free` (`60px`), `Lantern_Knight` (`90px`), `BentoPack 3D` (`FBX`). *Prototype blockout `HW-NR-12` đã từ chối.* | Mục tiêu quy đổi **`45–47 wpx`**: `Heavy_Knight` cần `0.78×` (Side-View); `Lantern` `0.50×` (Top-Down `down`). Chưa có Portrait đạt chuẩn. | **Thiếu hướng Top-Down đủ bộ:** `Heavy_Knight` đủ `7` chuỗi nhưng **Side-View**; `Lantern_Knight` **Top-Down `3/4` chỉ có `down`**; `Bento` thiếu Blender/áo choàng. | **VERIFIED OK** (`Jahnu OK`, `Dubular OK + AI Note`, `Bento OK + AI Note`) | **`NEEDS CONVERSION`** *(chuyển hướng Top-Down / nhuộm đỏ / render 3D sau khi Owner chọn ứng viên)* |
| **05** | **Sir Aldemar** (*The Ashen Knight*) | **Candidates Identified (`NR-13-R1`)**: `Maxime_Nourry_Knight` (`44px`), `Lantern_Knight` (`90px`), `CraftPix Knight_1` (`64px`). *Prototype blockout `HW-NR-13` đã từ chối; `Mystic_Autumn` bị loại.* | `Maxime Nourry` **`44 px`** khớp thẳng 1:1 với Meliodas; `Lantern` `0.50×` = `45 px`; `CraftPix K1` `0.73×` = `47 px`. Chưa có Portrait. | `Maxime Nourry` đủ `Rest`, `Drink`, `Idle`, `Attack`, `Roll`, `Death` nhưng **Side-View**; `Lantern` Top-Down **chỉ có `down`**; `CraftPix K1` `12` sheet **Side-View**. | **VERIFIED OK** (`Maxime Nourry OK`, `Dubular OK`, `CraftPix Free Terms`) | **`NEEDS CONVERSION`** *(dùng làm Rest NPC tĩnh hoặc chuyển `4` hướng Top-Down + bảng màu tro/bạc cũ)* |
| **06** | **The Headless Warden** (*Spectral Boss*) | **Concept Only (`NR-14-R1`)**: Chỉ có bản thiết kế Concept của Owner (`1448×1086`). *Prototype `HW-NR-14` bị từ chối; `Dread Horseman` (`48–56 px`) được bảo vệ.* | Mục tiêu **`128–160 px` (`72–100 wpx`)** để uy nghi hơn `Meliodas (45)` & `Hooded (71)`. Không nhồi vào `64×64`. | **Chưa có hướng/animation thật nào trong kho** (cả 3 phương án A/B/C đều bất khả thi). | **`ASSET NOT FOUND` / `BLOCKED`** (`PixelHorse` thiếu license offline & trùng Dread Horseman; `Mattz Art` cấm) | **`ASSET NOT FOUND`** *(kèm **`NEEDS ARTWORK`** — đề xuất thuê họa sĩ Pixel Art theo Concept Owner)* |

---

## 3. Bằng Chứng Trực Quan & Dữ Liệu Quy Chuẩn (`Deliverables §7`)

1. 🖼️ [KNIGHT_ORDER_MASTER_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15-R1/KNIGHT_ORDER_MASTER_CONTACT_SHEET.png) — Hồ sơ tổng hợp `6` nhân vật (`01–06`): ảnh gốc, portrait, bản runtime/ứng viên, prototype cũ bị từ chối (`V1.4`, `NR-12`, `NR-13`, `NR-14`), nguồn/license và nhãn trạng thái Owner Gate.
2. 🖼️ [KNIGHT_ORDER_GAMEPLAY_SCALE_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15-R1/KNIGHT_ORDER_GAMEPLAY_SCALE_COMPARISON.png) — So sánh toàn bộ `6` nhân vật cùng `1.0× World Pixels` (dải trên) và `2.5× Camera Zoom` *nearest-neighbor* trên cùng `ground baseline` (`origin = 0.5, 1.0`).
3. 📄 [KNIGHT_ASSET_LICENSE_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/KNIGHT_ASSET_LICENSE_MATRIX.md) — Ma trận xác minh giấy phép của toàn bộ `15` nguồn tài nguyên kỵ sĩ/ngựa/FX.
4. 📦 [KNIGHT_CHARACTER_ASSET_REGISTRY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/KNIGHT_CHARACTER_ASSET_REGISTRY.json) — Dữ liệu registry có cấu trúc cho `01–06` phục vụ kiểm định tự động và tra cứu sau này.

---

## 4. Hạng Mục Dành Riêng Cho Codex (`§8 CODEX RESERVATION`)

Các hạng mục kỹ thuật runtime sau được **giữ nguyên hiện trạng và chuyển giao 100% cho Codex**, AG không can thiệp:
- **`BUG-058` Scale Pop:** Hiện tượng hệ số bù runtime `base * 0.8` (`1.20`) và `0.68/0.78` cùng `originY` động trong `BlackKnightPlayer.ts`.
- **`BUG-059` HD Consistency:** Chênh lệch độ chi tiết giữa `Idle/Walk` (`30 px` trong `64×64`) và `Run` (`41–49 px` trong `84×72` từ `black_knight_conversion_motion`).
- **Kiểm thử & Pipeline Codex:** Xác minh runtime `Black Knight V2`, `Animation pipeline`, `Texture filtering` và `Player visual regression`.

---

## 5. Hard Stop Verification
- **`0` tự đánh `APPROVED BY OWNER`** ở bất kỳ nhân vật nào (`01–06` đều dùng trạng thái trung thực `READY FOR OWNER REVIEW` / `NEEDS ARTWORK` / `NEEDS CONVERSION` / `ASSET NOT FOUND`).
- **`0` thay đổi mã nguồn (`src/`), `0` thay đổi `public/assets/`, `0` thay đổi texture keys hay thiết kế 3 nhân vật hiện hành.**
- **`0` xóa ZIP/RAR, prototype `HW-NR-12/13/14` hay backup; `0` commit/push.**
- **Baseline Check (`Post-run`):** `npm run check` **PASS (`0` errors)** · `npm run verify:data` **PASS (`15/15`)**.
