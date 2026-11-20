# V153-F0-0 — Animation Coverage Matrix

ID `bk.*` là đề xuất trong tài liệu. Tên trong cột Runtime là action hoặc animation key hiện hành. `Master` là `Black_Knight_All_In_One_New.png`, `BK_*.gif` nằm trong `Preview_GIFs/`, và cột vị trí dùng chỉ số ô `i` từ 0. Frame đếm trong nguồn, còn số trong cột Runtime tính trên mỗi hướng đăng ký. [Frame map và tọa độ](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Registry runtime](../../../src/animation/SatyrAnimations.ts#L33)

Trạng thái nguồn `ORIGINAL_AVAILABLE` áp dụng khi đã tìm thấy chuyển động. `VERIFIED` ghi nhận đối chiếu trực tiếp và dùng cùng phạm vi xác minh. `PARTIAL` ghi nhận asset thiếu pha hoặc sai hướng. `MISSING` ghi nhận tài nguyên cần tìm. `CUSTOM_AVAILABLE` dành cho file bổ sung đã thấy. `NOT_CHECKED` dùng cho phần chưa thể đánh giá, gồm chất lượng của bốn bảng `Custom_4Dir` đang `MISSING FROM CLOUD`.

Các ô hướng dùng **Vẽ** cho `NEEDS_REDRAW`, **Trích** cho `NEEDS_EXTRACTION`, **QC** cho `NEEDS_VALIDATION`, **Thiếu** cho `MISSING` và **Lưu** cho `ARCHIVED`. Dấu **—** biểu thị `NOT_APPLICABLE`. QC* yêu cầu kiểm tra tay cầm, hình và neo khi dùng bản lật từ RIGHT. Các hàng DOWN/UP vật lý trong PNG V1.5.2 hiện chưa đạt chuẩn hướng. [Nguồn sprite hiện hành](../../../public/assets/characters/mossbound_wayfarer/) · [Logic tạo hàng](../../../scripts/extract_black_knight_wayfarer.mjs#L474)

## A–B. Di chuyển Armed và Unarmed

| ID dự kiến | Animation | Asset gốc | GIF tham chiếu | Vị trí frame gốc | Frame | Armed/Unarmed | DOWN | UP | LEFT | RIGHT | Custom artwork | Runtime asset / key | Trạng thái | Hành động | Ghi chú |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `bk.armed.idle` | Armed Idle | Master | `BK_weapon_idle.gif` | 32–37 | 6 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_idle_<dir>` · 4 | ORIGINAL_AVAILABLE · PARTIAL | Lấy đủ vòng thở, tạo UP/DOWN. | DOWN/UP dựng hình bằng code. |
| `bk.armed.walk` | Armed Walk | — | — | 160–171 chỉ tham chiếu Run | 0 | Armed | Vẽ | Vẽ | Vẽ | Vẽ | MISSING | `wayfarer_walk_<dir>` · 6 | MISSING · PARTIAL | Vẽ nhịp đi bộ bốn hướng. | Runtime RIGHT dùng frame chẵn của Armed Run. |
| `bk.armed.run` | Armed Run | Master | `BK_weapon_run.gif` | 160–171 | 12 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_run_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Khôi phục chu kỳ chạy, giữ kiếm rút và áo. | Runtime RIGHT dùng frame lẻ của chuỗi. |
| `bk.unarmed.idle` | Unarmed Idle | Master | `BK_unarmed_idle.gif` | 38–43 | 6 | Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_unarmed_idle_<dir>` · 4 | ORIGINAL_AVAILABLE · PARTIAL | Giữ chuôi lưng và bổ sung hai hướng đứng. | DOWN/UP trùng Armed Idle. |
| `bk.unarmed.walk` | Unarmed Walk | — | — | 148–159 chỉ tham chiếu Run | 0 | Unarmed | Vẽ | Vẽ | Vẽ | Vẽ | MISSING | Dùng `wayfarer_walk_<dir>` · 6 | MISSING · NEEDS_REDRAW | Vẽ riêng tư thế tra kiếm. | Hiện dùng chung hàng ngang cầm kiếm khi đi bộ. |
| `bk.unarmed.run` | Unarmed Run | Master | `BK_unarmed_run.gif` | 148–159 | 12 | Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_unarmed_run_<dir>` · 6 | ORIGINAL_AVAILABLE · VERIFIED (nguồn) · PARTIAL | Khôi phục đủ nhịp chân và vũ khí đeo lưng. | RIGHT khớp 148, 150, 152, 154, 156, 158. DOWN/UP trùng Armed Run. |

## C. Chiến đấu cơ bản

| ID dự kiến | Animation | Asset gốc | GIF tham chiếu | Vị trí frame gốc | Frame | Armed/Unarmed | DOWN | UP | LEFT | RIGHT | Custom artwork | Runtime asset / key | Trạng thái | Hành động | Ghi chú |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `bk.attack.light` | Light Attack | Master | `BK_light_attack.gif` | 84–92, 93–101, 102–112, 113–123 | 40 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_attack_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Giữ phần ra đòn và hồi thế, đối chiếu 4 nhịp. | Runtime chỉ 84–89. |
| `bk.attack.heavy` | Heavy Attack | Master | `BK_heavy_attack.gif` | 44–62, 63–70, 71–83 | 40 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_heavy_attack_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Khôi phục chuẩn bị, giơ, bổ/quét và thu kiếm. | Runtime lấy 6 ô của Heavy 1. |
| `bk.attack.combo` | Attack Combo | Master | `BK_light_attack.gif`, `BK_heavy_attack.gif` | 84–123 và 44–83 | 40 + 40 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | Light/Heavy rút gọn | ORIGINAL_AVAILABLE · MISSING | Giữ ranh giới từng đòn và frame nối. | 4 nhịp Light, 3 nhịp Heavy. Thiếu chuỗi combo runtime. |
| `bk.attack.recovery` | Attack Recovery | Master | Cả hai GIF Attack, `BK_weapon_art.gif` | Ví dụ 90–92, 99–101, 120–123, 61–62, 69–70, 82–83, 253–256 | Theo pha | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | Animation kết thúc rồi gọi Idle | ORIGINAL_AVAILABLE · NEEDS_EXTRACTION | Đánh dấu đoạn thu theo từng đòn. | Pha nằm trong chuỗi của đòn tương ứng. |
| `bk.weapon.art` | Weapon Art | Master | `BK_weapon_art.gif` | 222–256 | 35 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_weapon_art_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Giữ thứ tự quét, lướt/xoay, bổ và recovery. | Master rộng hơn ô runtime ở một số frame. |

## D. Kỹ năng lửa nghiên cứu

| ID dự kiến | Animation | Asset gốc | GIF tham chiếu | Vị trí frame gốc | Frame | Armed/Unarmed | DOWN | UP | LEFT | RIGHT | Custom artwork | Runtime asset / key | Trạng thái | Hành động | Ghi chú |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `bk.fire.thrust` | Thrust — Đâm Lửa | Master | `BK_light_attack.gif` | 113–123 | 11 | Armed | Thiếu | Thiếu | QC* | Trích | MISSING | — | ORIGINAL_AVAILABLE · NEEDS_VALIDATION | Đối chiếu động tác đẩy kiếm và điểm phát lửa. | Attack 4. Chưa có clip kỹ năng độc lập. |
| `bk.fire.ground_slam` | Ground Slam — Đập Sóng Lửa | Master, ứng viên | `BK_light_attack.gif`, `BK_heavy_attack.gif` | 108–112, so với 53–60 | 5 và 8 tham chiếu | Armed | Thiếu | Thiếu | Thiếu | Thiếu | MISSING | — | MISSING · NEEDS_VALIDATION | Duyệt động tác chạm đất và phạm vi sóng trước khi tách. | Đuôi Attack 3 và cú bổ Heavy 1. |
| `bk.fire.flame_stream` | Flame Stream — Phun Luồng Lửa | Master | `BK_light_attack.gif` | 113–122, hồi thế 123 | 10 + 1 | Armed | Thiếu | Thiếu | QC* | Trích | MISSING | — | ORIGINAL_AVAILABLE · NEEDS_VALIDATION | Kiểm tra tách luồng VFX và neo mũi kiếm. | Chia sẻ hình nguồn với Thrust, thuộc Attack 4. |
| `bk.fire.fire_wave` | Fire Wave — Kiếm Khí Lửa | Master, ứng viên | `BK_heavy_attack.gif`, `BK_light_attack.gif` | 76–81, đối chiếu 102–106 và 113–122 | 6 tham chiếu chính | Armed | Thiếu | Thiếu | Thiếu | Thiếu | MISSING | — | MISSING · NEEDS_VALIDATION | Xác minh hình cần vẽ cho sóng rời vũ khí nếu được duyệt. | Các vệt đã thấy thuộc đòn quét/luồng trong combo. |
| `bk.fire.aerial_somersault` | Aerial Somersault — Nhào Lộn Bổ Lửa | Master | `BK_weapon_art.gif` | 245–256, nối từ 243–244 | 12 + 2 nối | Armed | Thiếu | Thiếu | QC* | Trích | MISSING | Hai frame chọn từ pha trong `wayfarer_weapon_art_<dir>` | ORIGINAL_AVAILABLE · PARTIAL | Giữ tư thế lướt, xoay tới, bổ kiếm và hồi. | Một pha Weapon Art, có bụi đáp và quỹ đạo lưỡi xuyên suốt. |
| `bk.fire.nova` | Fire Nova — Nổ Hỏa Cầu | Master | `BK_parry.gif` | 263–270 VFX, 271–277 hồi | 8 + 7 | Armed | Thiếu | Thiếu | QC* | Trích | MISSING | — | ORIGINAL_AVAILABLE · NEEDS_VALIDATION | Giữ tăng sáng, cầu nổ và tàn hạt. Thử VFX đối xứng với actor đúng hướng. | Nhánh Parry thành công. Hai ô 265–266 che hết thân. |

Các hướng trong nhóm D ghi nhận khả năng khai thác artwork. Phạm vi này giữ các đòn và trạng thái gameplay hiện hành. Chủ dự án quyết định việc mở kỹ năng độc lập sau khi duyệt nguồn.

## E–G. Phòng thủ, vũ khí và Buff

| ID dự kiến | Animation | Asset gốc | GIF tham chiếu | Vị trí frame gốc | Frame | Armed/Unarmed | DOWN | UP | LEFT | RIGHT | Custom artwork | Runtime asset / key | Trạng thái | Hành động | Ghi chú |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `bk.parry` | Parry | Master | `BK_parry.gif` | 257–262, 263–277, 278–280 | 6 + 15 + 3 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_parry_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Giữ ba pha mở, đỡ trúng và hụt, kiểm tra VFX. | Runtime sprite chứa pha mở. GIF dùng pha mở hai lần. |
| `bk.armed.roll` | Armed Roll | Master | `BK_weapon_roll.gif` | 124–135 | 12 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_roll_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Giữ kiếm cầm tay qua tư thế cuộn và đứng lên. | DOWN/UP trùng RIGHT. |
| `bk.unarmed.roll` | Unarmed Roll | Master | `BK_unarmed_roll.gif` | 136–147 | 12 | Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_unarmed_roll_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Giữ chuôi lưng, kiểm tra vệt cam qua pha khuất. | DOWN/UP trùng RIGHT. |
| `bk.weapon.on` | Weapon On | Master | `BK_weapon_on-off.gif` | 0–17 | 18 | Unarmed → Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_weapon_toggle_<dir>` · 6 chung | ORIGINAL_AVAILABLE · PARTIAL | Khôi phục với chuôi, rút và ổn định kiếm phía trước. | Runtime lấy 5 ô On và 1 ô Off. |
| `bk.weapon.off` | Weapon Off | Master | `BK_weapon_on-off.gif` | 18–31 | 14 | Armed → Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_weapon_toggle_<dir>` · 6 chung | ORIGINAL_AVAILABLE · MISSING | Tách đủ chuỗi tra kiếm, giữ vị trí vũ khí. | Chỉ có ô 24 giữa clip chung, thiếu chuỗi Off riêng. |
| `bk.armed.buff` | Armed Buff | Master | `BK_weapon_buff.gif` | 312–323 | 12 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_buff_<dir>` · 6 | ORIGINAL_AVAILABLE · PARTIAL | Giữ aura đỏ sẫm và lưỡi cam. | V1.5.2 gọi sprite này khi bật Vòng Sáng `[F]`. |
| `bk.unarmed.buff` | Unarmed Buff | Master | `BK_unarmed_buff.gif` | 300–311 | 12 | Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | Một phần dùng trong `wayfarer_gather_<dir>` | ORIGINAL_AVAILABLE · MISSING | Chuẩn bị clip Buff riêng với chuôi lưng, giữ aura đỏ. | Runtime Gather chỉ lấy 4 ô khác nghĩa hành động. |

## H. Trúng đòn và tử vong

| ID dự kiến | Animation | Asset gốc | GIF tham chiếu | Vị trí frame gốc | Frame | Armed/Unarmed | DOWN | UP | LEFT | RIGHT | Custom artwork | Runtime asset / key | Trạng thái | Hành động | Ghi chú |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `bk.armed.hurt` | Armed Hurt | Master | `BK_hurt.gif` | 286–290 | 5 | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_hurt_<dir>` · 3 từ Unarmed | ORIGINAL_AVAILABLE · PARTIAL | Khôi phục flash, hồi sắc và lưỡi kiếm. | Hurt dùng chung ở runtime. |
| `bk.unarmed.hurt` | Unarmed Hurt | Master | `BK_hurt.gif` | 281–285 | 5 | Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_hurt_<dir>` · 3 | ORIGINAL_AVAILABLE · PARTIAL | Khôi phục 284–285, giữ chuôi và pha hồi sắc. | 281–283 là flash/fade hợp lệ. |
| `bk.armed.death` | Armed Death | Master, Death chung | `BK_hurt.gif` | 291–299 | 9 chung | Armed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_death_<dir>` · 6 chung | ORIGINAL_AVAILABLE · PARTIAL · NEEDS_VALIDATION | Khôi phục flash/tan biến. Duyệt thiết kế nhánh Armed. | Một Death trong nguồn, có mảnh lửa cuối. |
| `bk.unarmed.death` | Unarmed Death | Master, Death chung | `BK_hurt.gif` | 291–299 | 9 chung | Unarmed | Vẽ | Vẽ | QC* | Trích | MISSING | `wayfarer_death_<dir>` · 6 chung | MISSING · NEEDS_VALIDATION | Duyệt việc dùng chung hoặc vẽ tư thế tra kiếm. | Thiếu bản Unarmed riêng. Runtime Death bắt đầu bằng 3 ô Armed Hurt. |

## I. Chuỗi side-scroller lưu trữ

| ID dự kiến | Animation | Asset gốc | GIF tham chiếu | Vị trí frame gốc | Frame | Armed/Unarmed | DOWN | UP | LEFT | RIGHT | Custom artwork | Runtime asset / key | Trạng thái | Hành động | Ghi chú |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `bk.armed.jump` | Armed Jump | Master | `BK_weapon_jump.gif` | 197–202 | 6 | Armed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. |  |
| `bk.armed.mid_air` | Armed Mid air | Master | `BK_weapon_jump.gif` | 203 | 1 | Armed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. | Frame chuyển tiếp. |
| `bk.armed.fall_light` | Armed Fall light | Master | `BK_weapon_jump.gif` | 204–209 | 6 | Armed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. |  |
| `bk.armed.fall_heavy` | Armed Fall heavy | Master | `BK_weapon_jump.gif` | 210–215 | 6 | Armed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. |  |
| `bk.armed.land` | Armed Land | Master | `BK_weapon_jump.gif` | 216–221 | 6 | Armed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. | Bụi tiếp đất. |
| `bk.unarmed.jump` | Unarmed Jump | Master | `BK_unarmed_jump.gif` | 172–177 | 6 | Unarmed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. |  |
| `bk.unarmed.mid_air` | Unarmed Mid air | Master | `BK_unarmed_jump.gif` | 178 | 1 | Unarmed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. | Frame chuyển tiếp. |
| `bk.unarmed.fall_light` | Unarmed Fall light | Master | `BK_unarmed_jump.gif` | 179–184 | 6 | Unarmed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. |  |
| `bk.unarmed.fall_heavy` | Unarmed Fall heavy | Master | `BK_unarmed_jump.gif` | 185–190 | 6 | Unarmed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. |  |
| `bk.unarmed.land` | Unarmed Land | Master | `BK_unarmed_jump.gif` | 191–196 | 6 | Unarmed | — | — | — | Lưu | — | — | ARCHIVED | Bảo quản nguồn. | Bụi tiếp đất. |

## Tài nguyên runtime đã đối chiếu

18 atlas trong `public/assets/characters/mossbound_wayfarer/` chứa **380 ô RGBA 64×64 có nội dung**. Registry dùng bốn hàng DOWN, UP, LEFT, RIGHT theo thứ tự và đăng ký 18 action với bốn hướng. 95/95 ô RIGHT khớp kết quả đọc vùng của master theo các offset hiện hành và 95/95 ô LEFT khớp bản lật ngang của RIGHT. Bảng dưới ghi ô master và tính chất của từng atlas. [Loader](../../../src/scenes/PreloadScene.ts#L475) · [Registry](../../../src/animation/SatyrAnimations.ts#L33) · [Định nghĩa crop baseline](../../../scripts/extract_black_knight_wayfarer.mjs#L349)

| Tên file trong thư mục runtime | Kích thước | Frame/hướng | Ô master của RIGHT | DOWN/UP |
|---|---|---:|---|---|
| `wayfarer_idle.png` | 256×256 | 4 | 32–35 | Dựng bằng code, 2 pose khác nhau trên 4 frame mỗi hướng. |
| `wayfarer_walk.png` | 384×256 | 6 | 160, 162, 164, 166, 168, 170 | Dựng bằng code, 3 pose trên 6 frame. |
| `wayfarer_run.png` | 384×256 | 6 | 161, 163, 165, 167, 169, 171 | Dựng bằng code, trùng Unarmed Run. |
| `wayfarer_attack.png` | 384×256 | 6 | 84–89 | Thân ngang đè cung tĩnh. |
| `wayfarer_hurt.png` | 192×256 | 3 | 281–283 | Hai hàng trùng RIGHT. |
| `wayfarer_death.png` | 384×256 | 6 | 288–293 | Hai hàng trùng RIGHT, gồm 3 ô nhầm chuỗi. |
| `wayfarer_interact.png` | 256×256 | 4 | 0, 2, 4, 6 | Dựng bằng code. Nguồn ngang là đoạn đầu Weapon On. |
| `wayfarer_gather.png` | 256×256 | 4 | 300, 302, 304, 306 | Dựng bằng code. Nguồn ngang là Unarmed Buff. |
| `wayfarer_use_item.png` | 256×256 | 4 | 312, 314, 316, 318 | Dựng bằng code. Nguồn ngang là Armed Buff. |
| `wayfarer_unarmed_idle.png` | 256×256 | 4 | 38–41 | Dựng bằng code, trùng Armed Idle. |
| `wayfarer_unarmed_run.png` | 384×256 | 6 | 148, 150, 152, 154, 156, 158 | Dựng bằng code, trùng Armed Run. |
| `wayfarer_heavy_attack.png` | 384×256 | 6 | 44, 48, 51, 53, 54, 57 | Thân ngang đè cung tĩnh. |
| `wayfarer_weapon_art.png` | 384×256 | 6 | 224, 228, 234, 240, 246, 252 | Thân ngang đè cung tĩnh. |
| `wayfarer_parry.png` | 384×256 | 6 | 257–262 | Hai hàng trùng RIGHT. |
| `wayfarer_roll.png` | 384×256 | 6 | 124, 126, 128, 130, 132, 134 | Hai hàng trùng RIGHT. |
| `wayfarer_unarmed_roll.png` | 384×256 | 6 | 136, 138, 140, 142, 144, 146 | Hai hàng trùng RIGHT. |
| `wayfarer_buff.png` | 384×256 | 6 | 312, 314, 316, 318, 320, 322 | Hai hàng trùng RIGHT. |
| `wayfarer_weapon_toggle.png` | 384×256 | 6 | 0, 4, 8, 12, 16, 24 | Hai hàng trùng RIGHT. |
| `wayfarer_portrait.png` | 64×64 | Ảnh tĩnh | Artwork Web, phương pháp crop chưa có trong mã được kiểm tra | Lưỡi cam chiếm phần chính của ảnh. Mũ nằm sát rìa phải. |
